import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { useExpenseQuotationManager } from '../hooks/useExpenseQuotationManager';

interface ExpenseQuotationGeneralConditionsProps {
  className?: string;
  hidden?: boolean;
  isPending?: boolean;
  defaultCondition?: string;
  edit?: boolean;
  isInspectMode?: boolean; // Ajout de la nouvelle prop
}

export const ExpenseQuotationGeneralConditions = ({
  className,
  hidden,
  isPending,
  defaultCondition,
  edit = true,
  isInspectMode = false // Valeur par défaut
}: ExpenseQuotationGeneralConditionsProps) => {
  const router = useRouter();
  const { t: tInvoicing } = useTranslation('invoicing');
  const { t: tSettings } = useTranslation('settings');

  const quotationManager = useExpenseQuotationManager();

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isInspectMode) {
      quotationManager.set('generalConditions', e.target.value);
    }
  };

  const handleUseDefaultCondition = () => {
    if (!isInspectMode) {
      quotationManager.set('generalConditions', defaultCondition);
    }
  };

  const handleClearConditions = () => {
    if (!isInspectMode) {
      quotationManager.set('generalConditions', '');
    }
  };

  return (
    <div className={cn(className)}>
      {!hidden && (
        <div className="flex flex-col gap-4">
          <Textarea
            disabled={!edit || isInspectMode} // Désactivé en mode inspection
            placeholder={tInvoicing('quotation.attributes.general_condition')}
            className="resize-none"
            value={quotationManager.generalConditions}
            onChange={handleTextareaChange}
            isPending={isPending}
            rows={7}
          />
          {edit && defaultCondition && !isInspectMode && ( // Masquer les boutons en mode inspection
            <div className="flex items-center gap-4">
              <div className="flex gap-2 items-center">
                <Button
                  disabled={quotationManager.generalConditions === defaultCondition}
                  onClick={handleUseDefaultCondition}>
                  {tInvoicing('quotation.use_default_condition')}
                </Button>
                <Button
                  variant={'secondary'}
                  onClick={handleClearConditions}>
                  Clear
                </Button>
              </div>
            </div>
          )}
          {edit && !defaultCondition && !isInspectMode && ( // Masquer le label en mode inspection
            <Label
              className="font-bold underline cursor-pointer"
              onClick={() => !isInspectMode && router.push('/settings/system/conditions')}>
              {tSettings('default_condition.not_set')}
            </Label>
          )}
        </div>
      )}
    </div>
  );
};