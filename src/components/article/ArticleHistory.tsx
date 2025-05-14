import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { articleHistory } from '@/api/article-history';
import { ResponseArticleHistoryDto } from '@/types/article-history';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/common/Spinner';
import { DataTable } from './data-table/data-table';
import { api } from '@/api';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2, Download, Undo2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ArticleHistoryList = ({ articleId }: { articleId: number }) => {
  const { t } = useTranslation('articleHistory');
  const [history, setHistory] = useState<ResponseArticleHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentActiveVersion, setCurrentActiveVersion] = useState<number | null>(null);

  const fetchArticleHistory = async () => {
    try {
      setLoading(true);
      const data = await articleHistory.getArticleHistory(articleId);
      setHistory(data || []);
      
      // Trouver la version active
      const activeVersion = data?.find(item => item.isActive);
      setCurrentActiveVersion(activeVersion?.version || null);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(t('error_fetching_history'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (articleId: number, version: number) => {
    try {
      await articleHistory.downloadPdf(articleId, version);
      toast.success(t('pdf_downloaded'));
    } catch (err) {
      console.error("Download error:", err);
      toast.error(t('error_downloading_pdf'));
    }
  };

  const handleRestoreVersion = async (version: number) => {
    if (!window.confirm(t('confirm_restore', { version }))) return;
    
    try {
      await api.article.restoreVersion(articleId, version);
      toast.success(t('version_restored'));
      fetchArticleHistory();
    } catch (err) {
      console.error("Restore error:", err);
      toast.error(t('error_restoring'));
    }
  };

  const handleDeleteVersion = async (version: number) => {
    if (!window.confirm(t('confirm_delete_version', { version }))) return;
    
    try {
      await articleHistory.deleteVersion(articleId, version); 
      toast.success(t('version_deleted'));
      fetchArticleHistory();
    } catch (err) {
      console.error("Delete error:", err);
      toast.error(t('error_deleting_version'));
    }
  };

  useEffect(() => {
    fetchArticleHistory();
  }, [articleId]);

  // Liste des champs valides pour votre article
  const validArticleFields = [
    'title', 'description', 'reference', 'quantityInStock', 'status',
    'version', 'notes', 'unitPrice', 'justificatifFileName',
    'justificatifMimeType', 'justificatifFileSize'
  ];

  const formatFieldValue = (field: string, value: any) => {
    // Si le champ n'existe pas dans l'entité Article, on ne l'affiche pas
    if (!validArticleFields.includes(field)) return null;
    
    if (value === null || value === undefined) return 'N/A';
    
    if (field === 'unitPrice') {
      return `${parseFloat(value).toFixed(2)} €`;
    }
    
    if (field === 'updatedAt' || field === 'createdAt' || field === 'date') {
      return format(new Date(value), 'PPPp', { locale: fr });
    }
    
    if (field === 'status') {
      return t(`status.${value}`);
    }
    
    return value.toString();
  };

  const columns: ColumnDef<ResponseArticleHistoryDto>[] = [
    {
      accessorKey: 'version',
      header: t('version'),
      cell: ({ row }) => `Version ${row.original.version}`,
    },
    {
      accessorKey: 'date',
      header: t('date'),
      cell: ({ row }) => format(new Date(row.original.date), 'PPPp', { locale: fr }),
    },
    {
      accessorKey: 'changes',
      header: t('changes'),
      cell: ({ row }) => {
        const filteredChanges = Object.entries(row.original.changes)
          .filter(([field]) => validArticleFields.includes(field))
          .filter(([_, change]) => 
            change.oldValue !== undefined || change.newValue !== undefined
          );

        return (
          <div className="space-y-1">
            {filteredChanges.map(([field, change]) => {
              const oldValue = formatFieldValue(field, change.oldValue);
              const newValue = formatFieldValue(field, change.newValue);
              
              // Ne pas afficher les champs qui retournent null
              if (oldValue === null && newValue === null) return null;

              return (
                <div key={field} className="flex items-center gap-2">
                  <span className="font-medium">{t(`field.${field}`)}:</span>
                  {oldValue !== 'N/A' ? (
                    <span className="text-muted-foreground">
                      {oldValue}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">N/A</span>
                  )}
                  <span>→</span>
                  {newValue !== 'N/A' ? (
                    <span>{newValue}</span>
                  ) : (
                    <span className="italic">N/A</span>
                  )}
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: t('actions'),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Ouvrir le menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!row.original.isActive && (
              <DropdownMenuItem
                onClick={() => handleRestoreVersion(row.original.version)}
                className="cursor-pointer"
              >
                <Undo2 className="mr-2 h-4 w-4" />
                {t('restore_version')}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => handleDownloadPdf(row.original.articleId, row.original.version)}
              className="cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('download_pdf')}
            </DropdownMenuItem>
            {!row.original.isActive && (
              <DropdownMenuItem
                onClick={() => handleDeleteVersion(row.original.version)}
                className="cursor-pointer text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t('delete_version')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (loading) return <Spinner className="mx-auto my-8" />;

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-200 pb-3">
        <CardTitle className="text-lg font-semibold text-gray-800">
          {t('Historique de l\'article')}
        </CardTitle>
        {currentActiveVersion && (
          <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            <span>Version active: {currentActiveVersion}</span>
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={history}
          emptyMessage={t('no_history_found')}
        />
      </CardContent>
    </Card>
  );
};

export default ArticleHistoryList;