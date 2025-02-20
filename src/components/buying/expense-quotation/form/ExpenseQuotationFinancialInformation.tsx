import React from 'react';
import { Currency } from '@/types';
import { DISCOUNT_TYPE } from '@/types/enums/discount-types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

//done
import {
  Select,
  SelectContent,
  SelectItem,
  SelectShimmer,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useExpenseQuotationArticleManager } from '../hooks/useExpenseQuotationArticleManager';
import { useQuotationManager } from '../hooks/useExpenseQuotationManager';

interface ExpenseQuotationFinancialInformationProps {
  className?: string;
  total: number;
  subTotal?: number;
  discount?: number;
  currency?: Currency;
  loading?: boolean;
  edit?: boolean;
}

export const ExpenseQuotationFinancialInformation = ({
  className,
  subTotal,
  total,
  currency,
  loading,
  edit = true
}: ExpenseQuotationFinancialInformationProps) => {
  const { t: tInvoicing } = useTranslation('invoicing');

  const QuotationArticleManager = useExpenseQuotationArticleManager();
  const quotationManager = useQuotationManager();
  const currencySymbol = currency?.symbol || '$';
  const digitAfterComma = currency?.digitAfterComma || 3;
  const discount = quotationManager.discount ?? 0;
  const discountType =
    quotationManager.discountType === DISCOUNT_TYPE.PERCENTAGE ? 'PERCENTAGE' : 'AMOUNT';

  return (
    <div className={cn(className)}>
      <div className="flex flex-col w-full border-b">
        <div className="flex my-2">
          <Label className="mr-auto">{tInvoicing('expensequotation.attributes.sub_total')}</Label>
          <Label className="ml-auto" isPending={loading || false}>
            {subTotal?.toFixed(digitAfterComma)} {currencySymbol}
          </Label>
        </div>

        {QuotationArticleManager.taxSummary.map((ts) => {
          return (
            <div key={ts.tax.id} className="flex my-2">
              <Label className="mr-auto">{ts.tax.label}</Label>
              <Label className="ml-auto" isPending={loading || false}>
                {ts.amount?.toFixed(digitAfterComma)} {currencySymbol}
              </Label>
            </div>
          );
        })}
        {/* discount */}
        {edit && (
          <div className="flex items-center my-2">
            <Label className="mr-auto">{tInvoicing('expensequotation.attributes.discount')}</Label>
            <div className="flex items-center gap-2">
              <Input
                className="ml-auto w-2/5 text-right"
                type="number"
                value={discount}
                onChange={(e) => quotationManager.set('discount', parseFloat(e.target.value))}
                isPending={loading || false}
              />
              <SelectShimmer isPending={loading || false} className="-mt-0.5 w-1/5">
                <Select
                  onValueChange={(value: string) => {
                    quotationManager.set(
                      'discountType',
                      value === 'PERCENTAGE' ? DISCOUNT_TYPE.PERCENTAGE : DISCOUNT_TYPE.AMOUNT
                    );
                  }}
                  value={discountType}>
                  <SelectTrigger className="w-fit">
                    <SelectValue placeholder="%" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    <SelectItem value="PERCENTAGE">%</SelectItem>
                    <SelectItem value="AMOUNT">{currencySymbol} </SelectItem>
                  </SelectContent>
                </Select>
              </SelectShimmer>
            </div>
          </div>
        )}
        {!edit && discount && (
          <div className="flex flex-col w-full">
            <div className="flex my-2">
              <Label className="mr-auto">{tInvoicing('expensequotation.attributes.discount')}</Label>
              <Label className="ml-auto" isPending={loading || false}>
                {discount?.toFixed(digitAfterComma)}{' '}
                <span>
                  {discountType === DISCOUNT_TYPE.PERCENTAGE ? '%' : currency?.symbol || '$'}
                </span>
              </Label>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col w-full mt-2">
        <div className="flex my-2">
          <Label className="mr-auto">{tInvoicing('expensequotation.attributes.total')}</Label>
          <Label className="ml-auto" isPending={loading || false}>
            {total?.toFixed(digitAfterComma)} {currencySymbol}
          </Label>
        </div>
      </div>
    </div>
  );
};
