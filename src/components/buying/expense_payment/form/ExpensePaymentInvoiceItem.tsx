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

  const createDinero = (amount: number): Dinero => {
    return dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        Math.max(0, amount),
        digitAfterComma
      ),
      precision: digitAfterComma
    });
  };

  // Calcul des montants de base
  const [total, amountPaid, taxWithholdingAmount] = React.useMemo(() => {
    return [
      createDinero(invoiceEntry.expenseInvoice?.total || 0),
      createDinero(invoiceEntry.expenseInvoice?.amountPaid || 0),
      createDinero(invoiceEntry.expenseInvoice?.taxWithholdingAmount || 0)
    ];
  }, [invoiceEntry.expenseInvoice, digitAfterComma]);

  const remainingAmount = React.useMemo(() => {
    return total.subtract(amountPaid).subtract(taxWithholdingAmount);
  }, [total, amountPaid, taxWithholdingAmount]);

  const effectiveExchangeRate = Math.max(0.0001, 
    invoiceEntry.exchangeRate || paymentConvertionRate || 1
  );

// Nouveau calcul du montant maximum autorisé
const maxAllowedAmount = React.useMemo(() => {
  if (isSameCurrency) return remainingAmount.toUnit();
  
  // Convert remaining amount in invoice currency to payment currency
  const remainingInPaymentCurrency = remainingAmount.divide(effectiveExchangeRate);
  return remainingInPaymentCurrency.toUnit();
}, [remainingAmount, isSameCurrency, effectiveExchangeRate]);

// Nouveau calcul du montant restant
const currentRemainingAmount = React.useMemo(() => {
  if (!invoiceEntry.amount) return remainingAmount;
  
  const amountInInvoiceCurrency = isSameCurrency
    ? createDinero(invoiceEntry.amount)
    : createDinero(invoiceEntry.amount).multiply(effectiveExchangeRate);

  const newRemaining = remainingAmount.subtract(amountInInvoiceCurrency);
  
  // Ajoutez une tolérance dynamique basée sur la précision de la devise
  const toleranceAmount = Math.pow(10, -digitAfterComma);
  const tolerance = createDinero(toleranceAmount);
  
  if (newRemaining.lessThanOrEqual(tolerance)) {
    return createDinero(0);
  }
  
  return newRemaining;
}, [remainingAmount, invoiceEntry, isSameCurrency, effectiveExchangeRate, digitAfterComma]);
// Nouvelle gestion de la saisie
// Replace the amount calculation logic with:
const handleAmountPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const rawValue = e.target.value;
  
  if (rawValue === '') {
    onChange({ ...invoiceEntry, amount: undefined, originalAmount: undefined });
    return;
  }
  
  const numberValue = parseFloat(rawValue);
  if (isNaN(numberValue)) return;

  // Calcul avec arrondi précis
  const roundedValue = parseFloat(numberValue.toFixed(digitAfterComma));
  
  // Calcul du montant maximum autorisé avec la même précision
  const preciseMaxAllowed = parseFloat(maxAllowedAmount.toFixed(digitAfterComma));
  
  // Si le montant est égal au maximum autorisé (à la précision près)
  if (Math.abs(roundedValue - preciseMaxAllowed) < Math.pow(10, -digitAfterComma)) {
    // Forcer le paiement complet
    onChange({
      ...invoiceEntry,
      amount: preciseMaxAllowed,
      originalAmount: isSameCurrency 
        ? preciseMaxAllowed 
        : parseFloat((preciseMaxAllowed / effectiveExchangeRate).toFixed(digitAfterComma)),
      exchangeRate: isSameCurrency ? 1 : effectiveExchangeRate
    });
    return;
  }

  // Logique normale
  const amountInInvoiceCurrency = isSameCurrency
    ? createDinero(roundedValue)
    : createDinero(roundedValue).multiply(effectiveExchangeRate);

  const originalAmount = isSameCurrency
    ? roundedValue
    : parseFloat((roundedValue / effectiveExchangeRate).toFixed(digitAfterComma));

  onChange({
    ...invoiceEntry,
    amount: roundedValue,
    originalAmount,
    exchangeRate: isSameCurrency ? 1 : effectiveExchangeRate
  });
};

  const handleExchangeRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    if (rawValue === '') {
      onChange({ ...invoiceEntry, exchangeRate: undefined });
      return;
    }
    
    const rate = parseFloat(rawValue);
    if (isNaN(rate) || rate <= 0) return;
    
    const newRate = parseFloat(rate.toFixed(6));
    onChange({ 
      ...invoiceEntry, 
      exchangeRate: newRate,
      // Recalcul du montant original avec le nouveau taux: montant_paiement / nouveau_taux
      originalAmount: invoiceEntry.amount ? parseFloat((invoiceEntry.amount / newRate).toFixed(digitAfterComma)) : undefined
    });
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
value={typeof exchangeRateValue === 'number' ? exchangeRateValue.toFixed(4) : ''}
         onChange={handleExchangeRateChange}
          disabled={isSameCurrency || disabled}
          className="h-8 text-sm"
        />
        {!isSameCurrency && currency && (
          <Label className="text-xs text-muted-foreground">
            1 {invoiceCurrency?.code || 'USD'} = {effectiveExchangeRate.toFixed(4)} {currency?.code || 'DEV'}
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
          value={invoiceEntry.amount?.toFixed(digitAfterComma) ?? ''}
          step="0.01"
          min="0"
          max={maxAllowedAmount.toFixed(digitAfterComma)}
          disabled={disabled}
          className="h-8 text-sm"
        />
        <Label className="text-xs text-muted-foreground">
          Max: {maxAllowedAmount.toFixed(digitAfterComma)} {currency?.code || 'DEV'}
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