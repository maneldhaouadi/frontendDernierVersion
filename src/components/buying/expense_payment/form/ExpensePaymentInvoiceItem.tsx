import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Currency } from '@/types';
import { transformDate } from '@/utils/date.utils';
import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import dinero, { Dinero } from 'dinero.js';
import { createDineroAmountFromFloatWithDynamicCurrency } from '@/utils/money.utils';
import { ExpensePaymentInvoiceEntry } from '@/types/expense-payment';

interface ExpensePaymentInvoiceItemProps {
  className?: string;
  invoiceEntry: ExpensePaymentInvoiceEntry;
  currency?: Currency;
  paymentConvertionRate?: number;
  onChange: (item: ExpensePaymentInvoiceEntry) => void;
}

export const ExpensePaymentInvoiceItem: React.FC<ExpensePaymentInvoiceItemProps> = ({
  className,
  invoiceEntry,
  paymentConvertionRate = 1,
  currency,
  onChange,
}) => {
  const router = useRouter();
  const { t: tInvoicing } = useTranslation('invoicing');

  const invoiceCurrency = invoiceEntry.expenseInvoice?.currency;
  const digitAfterComma = invoiceCurrency?.digitAfterComma || 2;
  const isSameCurrency = invoiceCurrency?.id === currency?.id;

  const createDinero = (amount: number, currencyCode: string = 'USD'): Dinero => {
    return dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        Math.max(0, amount),
        digitAfterComma
      ),
      precision: digitAfterComma
    });
  };

  // Calcul des montants de base
  const total = React.useMemo(() => {
    return createDinero(
      invoiceEntry.expenseInvoice?.total || 0,
      invoiceCurrency?.code || 'USD'
    );
  }, [invoiceEntry.expenseInvoice?.total, invoiceCurrency?.code, digitAfterComma]);

  const amountPaid = React.useMemo(() => {
    return createDinero(
      invoiceEntry.expenseInvoice?.amountPaid || 0,
      invoiceCurrency?.code || 'USD'
    );
  }, [invoiceEntry.expenseInvoice?.amountPaid, invoiceCurrency?.code, digitAfterComma]);

  const taxWithholdingAmount = React.useMemo(() => {
    return createDinero(
      invoiceEntry.expenseInvoice?.taxWithholdingAmount || 0,
      invoiceCurrency?.code || 'USD'
    );
  }, [invoiceEntry.expenseInvoice?.taxWithholdingAmount, invoiceCurrency?.code, digitAfterComma]);

  const remainingAmount = React.useMemo(() => {
    return total.subtract(amountPaid).subtract(taxWithholdingAmount);
  }, [total, amountPaid, taxWithholdingAmount]);

  const effectiveExchangeRate = Math.max(0.0001, 
    invoiceEntry.exchangeRate || paymentConvertionRate
  );

  // Modifiez le calcul du maxAllowedAmount et currentRemainingAmount
const maxAllowedAmount = React.useMemo(() => {
  if (isSameCurrency) {
    return remainingAmount.toUnit();
  }
  const convertedAmount = remainingAmount.divide(effectiveExchangeRate);
  // Ajouter une petite marge pour compenser les arrondis
  return Math.min(
    convertedAmount.toUnit() + 0.01, // Petite marge
    remainingAmount.toUnit() // Ne pas dépasser le montant original
  );
}, [remainingAmount, isSameCurrency, effectiveExchangeRate]);

const currentRemainingAmount = React.useMemo(() => {
  if (!invoiceEntry.amount) return remainingAmount;
  
  const amountInInvoiceCurrency = isSameCurrency
    ? invoiceEntry.amount
    : invoiceEntry.amount * effectiveExchangeRate;

  const amount = createDinero(amountInInvoiceCurrency, invoiceCurrency?.code || 'USD');
  let newRemaining = remainingAmount.subtract(amount);
  
  // Si le montant restant est très petit (moins de 0.01), le considérer comme 0
  if (newRemaining.toUnit() < 0.01) {
    newRemaining = createDinero(0, invoiceCurrency?.code || 'USD');
  }
  
  return newRemaining;
}, [remainingAmount, invoiceEntry, isSameCurrency, effectiveExchangeRate, invoiceCurrency?.code, digitAfterComma]);
  const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value ? parseFloat(e.target.value) : undefined;
    
    if (inputValue !== undefined) {
      if (inputValue < 0) return;
      if (inputValue > maxAllowedAmount + 0.01) {
        onChange({ ...invoiceEntry, amount: maxAllowedAmount });
        return;
      }
    }

    onChange({ ...invoiceEntry, amount: inputValue });
  };

  const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = e.target.value ? parseFloat(e.target.value) : undefined;
    if (rate !== undefined && rate <= 0) return;
    onChange({ ...invoiceEntry, exchangeRate: rate });
  };

  return (
    <div className={cn('grid grid-cols-7 gap-4 items-center', className)}>
      {/* Invoice Sequential */}
      <div className="flex flex-col gap-1">
        <Label className="font-thin text-xs">{tInvoicing('invoice.singular')} N°</Label>
        <Label
          className="underline cursor-pointer text-sm"
          onClick={() => router.push(`/buying/expense_invoice/${invoiceEntry.expenseInvoice?.id}`)}
        >
          {invoiceEntry.expenseInvoice?.sequential || 'N/A'}
        </Label>
      </div>

      {/* Invoice Due Date */}
      <div className="flex flex-col gap-1">
        <Label className="font-thin text-xs">{tInvoicing('invoice.attributes.due_date')}</Label>
        <Label className="text-sm">
          {invoiceEntry.expenseInvoice?.dueDate
            ? transformDate(invoiceEntry.expenseInvoice.dueDate)
            : <span className="text-muted-foreground">Sans date</span>}
        </Label>
      </div>

      {/* Total */}
      <div className="flex flex-col gap-1">
        <Label className="font-thin text-xs">{tInvoicing('invoice.attributes.total')}</Label>
        <Label className="text-sm">
          {total.toFormat('0,0.00')} {invoiceCurrency?.symbol || '$'}
        </Label>
      </div>

      {/* Exchange Rate */}
      <div className="flex flex-col gap-1">
        <Label className="font-thin text-xs">Taux de change</Label>
        <Input 
          type="number" 
          step="0.0001"
          min="0.0001"
          value={invoiceEntry.exchangeRate || paymentConvertionRate || ''}
          onChange={handleExchangeRateChange}
          disabled={isSameCurrency}
          className="h-8 text-sm"
        />
        {!isSameCurrency && currency && (
          <Label className="text-xs text-muted-foreground">
            1 {currency.code} = {effectiveExchangeRate.toFixed(4)} {invoiceCurrency?.code || 'USD'}
          </Label>
        )}
      </div>

      {/* Amount Paid */}
      <div className="flex flex-col gap-1">
        <Label className="font-thin text-xs">
          {tInvoicing('invoice.attributes.payment')} ({currency?.code || 'DEV'})
        </Label>
        <Input 
          type="number" 
          onChange={handleAmountPaidChange} 
          value={invoiceEntry.amount ?? ''}
          step="0.01"
          min="0"
          max={maxAllowedAmount}
          className="h-8 text-sm"
        />
        <Label className="text-xs text-muted-foreground">
          Max: {maxAllowedAmount.toFixed(currency?.digitAfterComma || 2)} {currency?.code || 'DEV'}
        </Label>
      </div>

      {/* Remaining Amount */}
      <div className="flex flex-col gap-1">
        <Label className="font-thin text-xs">{tInvoicing('invoice.attributes.remaining_amount')}</Label>
        <Label className={cn("text-sm", {
          "text-green-600 font-bold": currentRemainingAmount.toUnit() === 0,
          "text-orange-500": currentRemainingAmount.toUnit() > 0 && currentRemainingAmount.toUnit() < total.toUnit(),
          "text-red-500": currentRemainingAmount.toUnit() >= total.toUnit()
        })}>
          {currentRemainingAmount.toFormat('0,0.00')} {invoiceCurrency?.symbol || '$'}
          {currentRemainingAmount.toUnit() === 0 && " (Payé)"}
        </Label>
      </div>
    </div>
  );
};