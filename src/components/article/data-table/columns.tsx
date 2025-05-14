import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTableRowActions } from './data-table-row-actions';
import { Article } from '@/types';
import { DataTableColumnHeader } from '@/components/administrative-tools/Logger/data-table/data-table-column-header';

export const getArticleColumns = (
  t: Function,
  router: any
): ColumnDef<Article>[] => {
  const translationNamespace = 'article';
  const translate = (value: string, namespace: string = '') => {
    return t(value, { ns: namespace || translationNamespace });
  };

  return [
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('title')}
        />
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.title}</div>,
      enableSorting: true,
      enableHiding: false
    },
    {
      accessorKey: 'description',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('description')}
        />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground line-clamp-2">
          {row.original.description || translate('article.empty_cells.description')}
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={translate('status')}
        />
      ),
      cell: ({ row }) => (
        <div>
<Badge className="w-60 justify-center py-1">
  {translate(`article.status.${row.original.status}`)}
</Badge>

        </div>
      ),
      enableSorting: true,
      enableHiding: false
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DataTableRowActions row={row} />
        </div>
      ),
      enableSorting: false,
      enableHiding: false
    }
  ];
};