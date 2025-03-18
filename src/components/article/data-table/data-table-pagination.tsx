import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { useArticleActions } from '../hooks/ArticleManager';

export function DataTablePagination() {
  const { page, totalPageCount, setPage } = useArticleActions();

  return (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage?.((page || 1) - 1)}
        disabled={page === 1}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage?.((page || 1) + 1)}
        disabled={page === totalPageCount}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}