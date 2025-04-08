import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { useChatbotActions } from './ActionsContext';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowActions } from './data-table-row-actions';
import { Message } from '@/types/Message';

export const getChatbotColumns = (
  formatDate: (date?: string) => string,
  formatCurrency: (amount?: number) => string
): ColumnDef<Message>[] => {
  const { languageCode } = useChatbotActions();

  return [
    {
      accessorKey: 'sender',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={languageCode === 'fr' ? 'Expéditeur' : languageCode === 'en' ? 'Sender' : 'Remitente'}
          attribute="sender"
        />
      ),
      cell: ({ row }) => (
        <div className="capitalize font-medium">
          {row.getValue('sender') === 'user' 
            ? languageCode === 'fr' ? 'Vous' : languageCode === 'en' ? 'You' : 'Tú'
            : 'Système'}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'text',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={languageCode === 'fr' ? 'Message' : languageCode === 'en' ? 'Message' : 'Mensaje'}
          attribute="text"
        />
      ),
      cell: ({ row }) => (
        <div className="max-w-xs">
          <p className="line-clamp-2">{row.getValue('text')}</p>
          {row.original.details && (
            <Badge variant="outline" className="mt-1">
              {row.original.type === 'quotation'
                ? languageCode === 'fr' ? 'Devis' : languageCode === 'en' ? 'Quotation' : 'Presupuesto'
                : languageCode === 'fr' ? 'Facture' : languageCode === 'en' ? 'Invoice' : 'Factura'}
            </Badge>
          )}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title={languageCode === 'fr' ? 'Date' : languageCode === 'en' ? 'Date' : 'Fecha'}
          attribute="date"
        />
      ),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.details?.date 
            ? formatDate(row.original.details.date) 
            : '-'}
        </div>
      ),
      enableSorting: true,
      enableHiding: true
    },
    {
      id: 'actions',
      cell: ({ row }) => <DataTableRowActions row={row} />
    }
  ];
};