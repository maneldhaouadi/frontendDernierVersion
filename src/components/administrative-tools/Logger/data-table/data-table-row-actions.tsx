import { useRouter } from 'next/router';
import { Article } from '@/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { Copy, Trash2, Eye, Settings2 } from 'lucide-react'; // Icônes pour les actions
import { useArticleActions } from '@/components/article/hooks/ArticleManager';

interface DataTableRowActionsProps {
  row: Row<Article>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const article = row.original;
  const { t: tCommon } = useTranslation('common');
  const router = useRouter();
  const { openDeleteDialog, openDuplicateDialog } = useArticleActions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[160px]">
        <DropdownMenuLabel className="text-center">{tCommon('commands.actions')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Inspecter l'article */}
        <DropdownMenuItem onClick={() => router.push(`/inventory/article/${article.id}`)}>
          <Eye className="h-5 w-5 mr-2" /> {tCommon('commands.inspect')}
        </DropdownMenuItem>
        {/* Modifier l'article */}
        <DropdownMenuItem onClick={() => router.push(`/inventory/article/${article.id}/edit`)}>
          <Settings2 className="h-5 w-5 mr-2" /> {tCommon('commands.modify')}
        </DropdownMenuItem>
        {/* Dupliquer l'article */}
        <DropdownMenuItem
          onClick={() => {
            openDuplicateDialog?.(article.id);
          }}
        >
          <Copy className="h-5 w-5 mr-2" /> {tCommon('commands.duplicate')}
        </DropdownMenuItem>
        {/* Supprimer l'article */}
        <DropdownMenuItem
          onClick={() => {
            openDeleteDialog?.(article.id);
          }}
          className="text-red-600" // Style pour l'action de suppression
        >
          <Trash2 className="h-5 w-5 mr-2" /> {tCommon('commands.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}