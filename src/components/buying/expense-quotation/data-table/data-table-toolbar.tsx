import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { useExpenseQuotationActions } from './ActionsContext';
import { PackagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { DataTableViewOptions } from '@/components/administrative-tools/Logger/data-table/data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({ table }: DataTableToolbarProps<TData>) {
  const router = useRouter();
  const { t } = useTranslation(['common', 'invoicing']); // ✅ Optimisation de l'importation des traductions

  const { setPage, searchTerm, setSearchTerm } = useExpenseQuotationActions() ?? {}; // ✅ Sécurisation des valeurs

  return (
    <div className="flex items-center justify-between gap-2">
      {/* Zone de recherche */}
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder={t('table.filter_placeholder', {
            entity: t('quotation.plural'),
          })}
          value={searchTerm?.toString() ?? ''} // ✅ Gestion du cas undefined
          onChange={(event) => {
            setPage?.(1);
            setSearchTerm?.(event.target.value);
          }}
          className="h-8 w-[150px] lg:w-[300px]"
        />
        {searchTerm && (
          <Button variant="ghost" onClick={() => setSearchTerm?.('')} className="h-8 px-2 lg:px-3">
            {t('commands.reset')}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Bouton d'ajout */}
      <Button
        className="h-8 px-2 lg:px-3"
        variant="ghost"
        onClick={() => router.push('/buying/new-expensequotations')}
      >
        <PackagePlus className="h-6 w-6" />
        {t(' Nouveau devis')}      </Button>

      {/* Options de vue */}
      <DataTableViewOptions table={table} />
    </div>
  );
}
