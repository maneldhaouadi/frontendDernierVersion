import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/hooks/other/useDebounce';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { DataTable } from './data-table/data-table';
import { getArticleColumns } from './data-table/columns';
import { ArticleDeleteDialog } from './dialogs/ArticleDeleteDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react';
import { ArticleActionsContext } from './data-table/ActionsContext';
import { ArticleDuplicateDialog } from './dialogs/ExpenseInvoiceDuplicateDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ArticleList: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('article');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sortDetails, setSortDetails] = useState({ order: true, sortKey: 'title' });
  const [searchTerm, setSearchTerm] = useState('');

  const { value: debouncedPage } = useDebounce<number>(page, 500);
  const { value: debouncedSize } = useDebounce<number>(size, 500);
  const { value: debouncedSortDetails } = useDebounce<typeof sortDetails>(sortDetails, 500);
  const { value: debouncedSearchTerm } = useDebounce<string>(searchTerm, 500);

  const [deleteDialog, setDeleteDialog] = useState(false);
  const [duplicateDialog, setDuplicateDialog] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

  const {
    isPending: isFetchPending,
    error,
    data: articlesResp,
    refetch: refetchArticles,
  } = useQuery({
    queryKey: [
      'articles',
      debouncedPage,
      debouncedSize,
      debouncedSortDetails.order,
      debouncedSortDetails.sortKey,
      debouncedSearchTerm,
    ],
    queryFn: () =>
      api.article.searchArticlesByTitle(
        debouncedSearchTerm,
        {
          page: debouncedPage,
          limit: debouncedSize,
          sort: `${debouncedSortDetails.sortKey},${debouncedSortDetails.order ? 'ASC' : 'DESC'}`
        }
      ),
  });

  const { mutate: removeArticle, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.article.remove(id),
    onSuccess: () => {
      toast.success(t('article.action_remove_success'));
      refetchArticles();
      setDeleteDialog(false);
    },
    onError: (error) => {
      toast.error(t('article.action_remove_failure'));
    },
  });

  const { mutate: duplicateArticle, isPending: isDuplicationPending } = useMutation({
    mutationFn: ({ id, includeFiles }: { id: number; includeFiles: boolean }) => {
      return api.article.duplicate(id, includeFiles);
    },
    onSuccess: async (data) => {
      toast.success(t('article.action_duplicate_success'));
      await router.push(`/inventory/article/${data.id}`);
      setDuplicateDialog(false);
    },
    onError: (error) => {
      toast.error(t('article.action_duplicate_failure'));
    },
  });

  const openDeleteDialog = (id: number) => {
    setSelectedArticle(id);
    setDeleteDialog(true);
  };

  const openDuplicateDialog = (id: number) => {
    setSelectedArticle(id);
    setDuplicateDialog(true);
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToNextPage = () => {
    if (articlesResp?.pageCount && page < articlesResp.pageCount) {
      setPage(page + 1);
    }
  };

  const context = {
    openDeleteDialog,
    openDuplicateDialog,
    searchTerm,
    setSearchTerm,
    page,
    totalPageCount: articlesResp?.pageCount || 1,
    setPage,
    size,
    setSize,
    order: sortDetails.order,
    sortKey: sortDetails.sortKey,
    setSortDetails: (order: boolean, sortKey: string) => setSortDetails({ order, sortKey })
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{t('Une erreur est survenue lors du chargement des articles')}</p>
        <p className="text-sm text-muted-foreground">{error.message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => refetchArticles()}
        >
          {t('Réessayer')}
        </Button>
      </div>
    );
  }

  return (
    <ArticleActionsContext.Provider value={context}>
      <Card className="flex flex-col flex-1 overflow-hidden">
        <CardHeader className="flex flex-col space-y-1.5">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">{t('Liste des articles')}</CardTitle>
              <CardDescription className="text-sm">{t('Gestion des articles de votre inventaire')}</CardDescription>
            </div>
            <Button 
              size="sm"
              className="flex items-center gap-1.5 h-8"
              onClick={() => router.push('/article/create-article')}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t('Ajouter un article')}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Barre de recherche */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Input
                placeholder={t('Rechercher un article (titre, description, code-barres, catégorie)...')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1); // Reset to first page on new search
                }}
                className="h-8 pl-8 text-sm"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => refetchArticles()}
            >
              {t('Rechercher')}
            </Button>
          </div>

          {/* Tableau des articles */}
          <DataTable
            data={articlesResp?.data || []}
            columns={getArticleColumns(t, router)}
            isPending={isFetchPending || isDeletePending || isDuplicationPending}
          />

          {/* Messages d'état */}
          {isFetchPending && (
            <div className="p-4 text-center text-muted-foreground">
              {t('Chargement des articles...')}
            </div>
          )}

          {!isFetchPending && articlesResp?.data.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              {searchTerm 
                ? t('Aucun article ne correspond à votre recherche') 
                : t('Aucun article trouvé')}
            </div>
          )}

          {/* Pagination */}
          {articlesResp?.data.length ? (
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{t('Lignes par page')}</span>
                <Select
                  value={size.toString()}
                  onValueChange={(value) => setSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-20 text-xs">
                    <SelectValue placeholder={size.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5" className="text-xs">5</SelectItem>
                    <SelectItem value="10" className="text-xs">10</SelectItem>
                    <SelectItem value="20" className="text-xs">20</SelectItem>
                    <SelectItem value="50" className="text-xs">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={goToPreviousPage}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <div className="text-xs text-muted-foreground px-2">
                  {t('Page')} {page} {t('sur')} {articlesResp?.pageCount || 1}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={goToNextPage}
                  disabled={!articlesResp?.pageCount || page >= articlesResp.pageCount}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>

        {/* Boîtes de dialogue */}
        <ArticleDeleteDialog
          id={selectedArticle}
          open={deleteDialog}
          deleteArticle={() => selectedArticle && removeArticle(selectedArticle)}
          onClose={() => setDeleteDialog(false)}
        />

        <ArticleDuplicateDialog
          id={selectedArticle || 0}
          open={duplicateDialog}
          duplicateArticle={(includeFiles: boolean) => {
            selectedArticle && duplicateArticle({ id: selectedArticle, includeFiles });
          }}
          onClose={() => setDuplicateDialog(false)}
        />
      </Card>
    </ArticleActionsContext.Provider>
  );
};

export default ArticleList;