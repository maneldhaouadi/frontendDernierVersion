import { Column } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon } from '@radix-ui/react-icons';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const sortDirection = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(sortDirection === 'asc')}
    >
      {title}
      {sortDirection === 'asc' ? (
        <ArrowUpIcon className="ml-2 h-4 w-4" />
      ) : sortDirection === 'desc' ? (
        <ArrowDownIcon className="ml-2 h-4 w-4" />
      ) : (
        <CaretSortIcon className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}