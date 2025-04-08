import {
    ChevronLeftIcon,
    ChevronRightIcon,
    DoubleArrowLeftIcon,
    DoubleArrowRightIcon
  } from '@radix-ui/react-icons';
  import { Table } from '@tanstack/react-table';
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
  } from '@/components/ui/select';
  import { Button } from '@/components/ui/button';
  import { useChatbotActions } from './ActionsContext';
  
  export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
    const { page, totalPageCount, setPage, size, setSize, languageCode } = useChatbotActions();
  
    const tCommon = (key: string) => {
      const translations = {
        'pagination.rows_per': languageCode === 'fr' ? 'Lignes par page' : languageCode === 'en' ? 'Rows per page' : 'Filas por página',
        'pagination.enumerate': languageCode === 'fr' ? 'Page {page} sur {totalPageCount}' : 
                                languageCode === 'en' ? 'Page {page} of {totalPageCount}' : 
                                'Página {page} de {totalPageCount}'
      };
      return translations[key as keyof typeof translations]?.replace('{page}', page.toString())
                                                           .replace('{totalPageCount}', totalPageCount.toString()) || key;
    };
  
    return (
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-2">
          <Select
            value={size.toString()}
            onValueChange={(value) => {
              setPage(1);
              setSize(Number(value));
            }}>
            <SelectTrigger className="h-8 w-[100px]">
              <SelectValue placeholder={size.toString()} />
            </SelectTrigger>
            <SelectContent side="bottom" align="center">
              {[5, 10, 20].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm font-medium">{tCommon('pagination.rows_per')}</p>
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {tCommon('pagination.enumerate')}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPage(1)}
              disabled={page === 1}>
              <DoubleArrowLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPageCount}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setPage(totalPageCount)}
              disabled={page === totalPageCount}>
              <DoubleArrowRightIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }