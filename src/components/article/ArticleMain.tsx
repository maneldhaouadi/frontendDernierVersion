import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@/hooks/other/useDebounce';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DataTable } from './data-table/data-table';
import { getArticleColumns } from './data-table/columns';
import { ArticleDeleteDialog } from './dialogs/ArticleDeleteDialog';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import { Spinner } from '@/components/common/Spinner';
import { PageHeader } from '@/components/common/PageHeader';
import { BreadcrumbCommon } from '../common';
import { ArticleDuplicateDialog } from './dialogs/ExpenseInvoiceDuplicateDialog';
import { Button } from '@/components/ui/button'; // Import du composant Button
import { ChevronLeft, ChevronRight, Search, Plus } from 'lucide-react'; // Import des icônes de flèche
import { Input } from '@/components/ui/input'; // Import du composant Input
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Import du composant Select

const ArticleList: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation('articleL');
  const { setRoutes } = useBreadcrumb();

  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10); // Nombre d'articles par page
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
      api.article.findPaginated(
        debouncedPage,
        debouncedSize,
        debouncedSortDetails.order ? 'ASC' : 'DESC',
        debouncedSortDetails.sortKey,
        debouncedSearchTerm
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

  useEffect(() => {
    setRoutes([
      { title: t('menu.inventory'), href: '/inventory' },
      { title: t('submenu.articles') },
    ]);
  }, [setRoutes, t]);

  // Fonction pour naviguer vers l'article précédent
  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  // Fonction pour naviguer vers l'article suivant
  const goToNextPage = () => {
    if (articlesResp?.meta?.pageCount && page < articlesResp.meta.pageCount) {
      setPage(page + 1);
    }
  };

  if (error) {
    return <div>An error has occurred: {error.message}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* En-tête de la section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">{t('article.plural')}</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('article.new_article')}
        </Button>
      </div>

      {/* Barre de filtres */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('article.filter_placeholder')}
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">{t('article.filter')}</Button>
      </div>

      {/* Tableau des articles */}
      <DataTable
        data={articlesResp?.data || []}
        columns={getArticleColumns(t, router)}
        isPending={isFetchPending || isDeletePending || isDuplicationPending}
      />

      {/* Pagination avec flèches, numérotation et sélecteur de lignes par page */}
      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('article.lines_per_page')}</span>
          <Select
            value={size.toString()}
            onValueChange={(value) => setSize(Number(value))}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder={size.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm text-muted-foreground">
            {t('article.page')} {page} {t('article.of')} {articlesResp?.meta?.pageCount || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={!articlesResp?.meta?.pageCount || page >= articlesResp.meta.pageCount}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ArticleDeleteDialog
        id={selectedArticle}
        open={deleteDialog}
        deleteArticle={() => selectedArticle && removeArticle(selectedArticle)}
        isDeletionPending={isDeletePending}
        onClose={() => setDeleteDialog(false)}
      />

      <ArticleDuplicateDialog
        id={selectedArticle || 0}
        open={duplicateDialog}
        duplicateArticle={(includeFiles: boolean) => {
          selectedArticle && duplicateArticle({ id: selectedArticle, includeFiles });
        }}
        isDuplicationPending={isDuplicationPending}
        onClose={() => setDuplicateDialog(false)}
      />
    </div>
  );
};

export default ArticleList;