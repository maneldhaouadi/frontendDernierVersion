import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { useChatbotActions } from './ActionsContext';
import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const { searchTerm, setSearchTerm, setPage, languageCode } = useChatbotActions();

  const tCommon = (key: string) => {
    const translations = {
      'table.filter_placeholder': languageCode === 'fr' ? 'Filtrer les messages...' : 
                                 languageCode === 'en' ? 'Filter messages...' : 
                                 'Filtrar mensajes...',
      'commands.reset': languageCode === 'fr' ? 'Réinitialiser' : 
                        languageCode === 'en' ? 'Reset' : 
                        'Reiniciar'
    };
    return translations[key as keyof typeof translations] || key;
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={tCommon('table.filter_placeholder')}
          value={searchTerm}
          onChange={(event) => {
            setPage(1);
            setSearchTerm(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[300px]"
        />
        {searchTerm && (
          <Button variant="ghost" onClick={() => setSearchTerm('')} className="h-8 px-2 lg:px-3">
            {tCommon('commands.reset')}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}