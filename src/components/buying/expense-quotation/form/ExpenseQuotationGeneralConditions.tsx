import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useQuotationManager } from '../hooks/useExpenseQuotationManager';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
//done
interface ExpenseQuotationGeneralConditionsProps {
  className?: string;
  hidden?: boolean;
  isPending?: boolean;
  defaultCondition?: string;
  edit?: boolean;
}

export const ExpenseQuotationGeneralConditions = ({
  className,
  hidden,
  isPending,
  defaultCondition,
  edit = true
}: ExpenseQuotationGeneralConditionsProps) => {
  const router = useRouter();
  const { t: tInvoicing } = useTranslation('invoicing');
  const { t: tSettings } = useTranslation('settings');

  const quotationManager = useQuotationManager();

  return (
    <div className={cn(className)}>
      {!hidden && (
        <div className="flex flex-col gap-4">
          <Textarea
            disabled={!edit}
            placeholder={tInvoicing('expensequotation.attributes.general_condition')}
            className="resize-none"
            value={quotationManager.generalConditions}
            onChange={(e) => quotationManager.set('generalConditions', e.target.value)}
            isPending={isPending}
            rows={7}
          />
          {edit && defaultCondition && (
            <div className="flex items-center gap-4">
              <div className="flex gap-2 items-center">
                <Button
                  disabled={quotationManager.generalConditions == defaultCondition}
                  onClick={() => {
                    quotationManager.set('generalConditions', defaultCondition);
                  }}>
                  {tInvoicing('expensequotation.use_default_condition')}
                </Button>
                <Button
                  variant={'secondary'}
                  onClick={() => {
                    quotationManager.set('generalConditions', '');
                  }}>
                  Clear
                </Button>
              </div>
            </div>
          )}
          {edit && !defaultCondition && (
            <Label
              className="font-bold underline cursor-pointer"
              onClick={() => router.push('/settings/system/conditions')}>
              {tSettings('default_condition.not_set')}
            </Label>
          )}
        </div>
      )}
    </div>
  );
};
