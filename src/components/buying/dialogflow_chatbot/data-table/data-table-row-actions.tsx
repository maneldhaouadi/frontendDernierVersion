import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { DotsHorizontalIcon, TrashIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';
import { useChatbotActions } from './ActionsContext';
import { Message } from '@/types/Message';

interface DataTableRowActionsProps {
  row: Row<Message>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { languageCode, openDeleteDialog, setSelectedMessage } = useChatbotActions();

  const tCommon = (key: string) => {
    const translations = {
      'commands.actions': languageCode === 'fr' ? 'Actions' : languageCode === 'en' ? 'Actions' : 'Acciones',
      'commands.delete': languageCode === 'fr' ? 'Supprimer' : languageCode === 'en' ? 'Delete' : 'Eliminar'
    };
    return translations[key as keyof typeof translations] || key;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-[160px]">
        <DropdownMenuLabel className="text-center">{tCommon('commands.actions')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setSelectedMessage(row.original);
            openDeleteDialog();
          }}
          className="text-destructive focus:text-destructive">
          <TrashIcon className="mr-2 h-4 w-4" />
          {tCommon('commands.delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}