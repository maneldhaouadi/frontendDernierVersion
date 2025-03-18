import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useArticleActions } from '../hooks/ArticleManager';

export function DataTableToolbar() {
  const { searchTerm, setSearchTerm, setPage } = useArticleActions();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Rechercher un article..."
          value={searchTerm || ''}
          onChange={(e) => {
            setPage?.(1);
            setSearchTerm?.(e.target.value);
          }}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            onClick={() => setSearchTerm?.('')}
            className="h-8 px-2 lg:px-3"
          >
            Réinitialiser
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}