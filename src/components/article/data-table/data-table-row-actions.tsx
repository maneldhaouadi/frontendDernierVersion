import { Row } from '@tanstack/react-table';
import { Article } from '@/types';
import { Button } from '@/components/ui/button';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { useArticleActions } from '../hooks/ArticleManager';

interface DataTableRowActionsProps {
  row: Row<Article>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { openDeleteDialog } = useArticleActions();

  return (
    <Button
      variant="ghost"
      className="h-8 w-8 p-0"
      onClick={() => openDeleteDialog?.(row.original.id)}
    >
      <DotsHorizontalIcon className="h-4 w-4" />
    </Button>
  );
}