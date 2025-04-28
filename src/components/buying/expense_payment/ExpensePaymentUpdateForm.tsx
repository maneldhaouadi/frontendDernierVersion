import React from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/api';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getErrorMessage } from '@/utils/errors';
import useCurrency from '@/hooks/content/useCurrency';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/router';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import useInitializedState from '@/hooks/use-initialized-state';
import useFirmChoices from '@/hooks/content/useFirmChoice';
import { Textarea } from '@/components/ui/textarea';
import dinero from 'dinero.js';
import { createDineroAmountFromFloatWithDynamicCurrency } from '@/utils/money.utils';
import { useExpensePaymentManager } from './hooks/useExpensePaymentManager';
import { useExpensePaymentInvoiceManager } from './hooks/useExpensePaymentInvoiceManager';
import useCabinet from '@/hooks/content/useCabinet';
import { ExpensePayment, ExpensePaymentInvoiceEntry, ExpenseUpdatePaymentDto } from '@/types/expense-payment';
import { ExpensePaymentGeneralInformation } from './form/ExpensePaymentGeneralInformation';
import { ExpensePaymentInvoiceManagement } from './form/ExpensePaymentInvoiceManagement';
import { ExpensePaymentExtraOptions } from './form/ExpensePaymentExtraOptions';
import { ExpensePaymentFinancialInformation } from './form/ExpensePaymentFinancialInformation';
import { ExpensePaymentControlSection } from './form/ExpensePaymentControlSection';

interface ExpensePaymentFormProps {
  className?: string;
  paymentId: string;
}

export const ExpensePaymentUpdateForm = ({ className, paymentId }: ExpensePaymentFormProps) => {
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');
  const { t: tInvoicing } = useTranslation('invoicing');
  const { setRoutes } = useBreadcrumb();
  const paymentManager = useExpensePaymentManager();
  const invoiceManager = useExpensePaymentInvoiceManager();

  // Fetch payment data
  const {
    isPending: isFetchPending,
    data: paymentResp,
    refetch: refetchPayment,
  } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => api.expensepayment.findOne(parseInt(paymentId)),
  });

  const payment = React.useMemo(() => {
    return paymentResp || null;
  }, [paymentResp]);

  React.useEffect(() => {
    if (payment?.id) {
      setRoutes([
        { title: tCommon('menu.buying'), href: '/buying' },
        { title: tInvoicing('payment.plural'), href: '/buying/expense_payments' },
        { title: tInvoicing('payment.singular') + ' N° ' + payment?.id },
      ]);
    }
  }, [router.locale, payment?.id]);

  // Fetch options
  const { currencies, isFetchCurrenciesPending } = useCurrency();
  const { cabinet, isFetchCabinetPending } = useCabinet();

  React.useEffect(() => {
    if (cabinet?.currency?.id) {
      paymentManager.set('currencyId', cabinet.currency.id);
    }
  }, [cabinet]);

  const { firms, isFetchFirmsPending } = useFirmChoices([
    'currency',
    'invoices',
    'invoices.currency',
  ]);

  const fetching =
    isFetchPending || isFetchFirmsPending || isFetchCurrenciesPending || isFetchCabinetPending;

  const setPaymentData = (data: Partial<ExpensePayment>) => {
    if (!data) return;

    // Payment infos
    paymentManager.setPayment({
      ...data,
      firm: firms?.find((firm) => firm.id === data.firmId),
      sequentialNumbr: data.sequentialNumbr,
      uploadPdfField: data.uploadPdfField,
      uploads: data.uploads || [],
      convertionRate: data.convertionRate || 1,
    });

    // Invoice infos with currency conversion
    if (data?.invoices) {
      const processedInvoices = data.invoices.map(invoice => {
        // Vérifications de sécurité ajoutées
        const invoiceCurrencyId = invoice?.expenseInvoice?.currency?.id;
        const paymentCurrencyId = data?.currencyId;
        
        // Si currencyId est manquant, on utilise celui de la facture comme fallback
        const effectiveCurrencyId = paymentCurrencyId || invoiceCurrencyId;
        
        // Vérification que nous avons au moins une currency valide
        if (!invoiceCurrencyId && !paymentCurrencyId) {
          throw new Error("Missing currency information for invoice payment");
        }
    
        const isSameCurrency = invoiceCurrencyId === paymentCurrencyId;
        const exchangeRate = invoice?.exchangeRate || data?.convertionRate || 1;
        
        // Valeurs par défaut sécurisées
        const amount = invoice?.amount || 0;
        const originalAmount = invoice?.originalAmount || amount;
        
        return {
          ...invoice,
          amount: isSameCurrency 
            ? amount 
            : originalAmount * exchangeRate,
          originalAmount,
          exchangeRate: isSameCurrency ? 1 : exchangeRate,
          originalCurrencyId: isSameCurrency ? invoiceCurrencyId : effectiveCurrencyId
        };
      });
    
      invoiceManager.setInvoices(
        processedInvoices,
        data.currency, 
        data.convertionRate || 1,
        'EDIT'
      );
    }
  };

  const { isDisabled, globalReset } = useInitializedState({
    data: payment || ({} as Partial<ExpensePayment>),
    getCurrentData: () => {
      return {
        payment: paymentManager.getPayment(),
        invoices: invoiceManager.getInvoices(),
      };
    },
    setFormData: (data: Partial<ExpensePayment>) => {
      setPaymentData(data);
    },
    resetData: () => {
      paymentManager.reset();
      invoiceManager.reset();
    },
    loading: fetching,
  });

  const currency = React.useMemo(() => {
    return currencies?.find((c) => c.id === paymentManager.currencyId);
  }, [paymentManager.currencyId, currencies]);

  const { mutate: updatePayment, isPending: isUpdatePending } = useMutation({
    mutationFn: (data: { payment: ExpenseUpdatePaymentDto; files: File[] }) =>
      api.expensepayment.update(data.payment, data.files),
    onSuccess: () => {
      toast.success('Paiement modifié avec succès');
      router.push('/buying/expense_payments');
    },
    onError: (error) => {
      const message = getErrorMessage('', error, 'Erreur lors de la mise à jour de paiement');
      toast.error(message);
    },
  });

  const onSubmit = () => {
    const invoices = invoiceManager
      .getInvoices()
      .map((invoice: ExpensePaymentInvoiceEntry) => {
        const invoiceCurrencyId = invoice?.expenseInvoice?.currency?.id;
        const paymentCurrencyId = paymentManager.currencyId;
        const shouldConvert = invoiceCurrencyId && paymentCurrencyId && 
                            invoiceCurrencyId !== paymentCurrencyId;
        
        // Récupérer le taux de change dynamique
        const exchangeRate = invoice.exchangeRate || paymentManager.convertionRate;
        
        if (shouldConvert && (!exchangeRate || exchangeRate <= 0)) {
            throw new Error(`Taux de change manquant ou invalide pour la conversion ${paymentCurrencyId}→${invoiceCurrencyId}`);
        }

        return {
          expenseInvoiceId: invoice?.expenseInvoice?.id,
          amount: shouldConvert 
            ? (invoice.amount || 0) * exchangeRate
            : (invoice.amount || 0),
          exchangeRate, // Taux dynamique
          originalAmount: invoice.amount || 0,
          originalCurrencyId: paymentCurrencyId
        };
      });

    // Calculate used amount with conversion
    const used = invoiceManager.getInvoices().reduce((sum, invoice) => {
      const invoiceCurrencyId = invoice?.expenseInvoice?.currency?.id;
      const paymentCurrencyId = paymentManager.currencyId;
      const shouldConvert = invoiceCurrencyId && paymentCurrencyId && 
                          invoiceCurrencyId !== paymentCurrencyId;
      const amount = invoice?.amount || 0;
      
      return sum + (shouldConvert 
        ? amount * (paymentManager.convertionRate || 1)
        : amount);
    }, 0);

    const paidAmount = (paymentManager.amount || 0) + (paymentManager.fee || 0);
    const paid = dinero({
      amount: createDineroAmountFromFloatWithDynamicCurrency(
        paidAmount,
        currency?.digitAfterComma || 3
      ),
      precision: currency?.digitAfterComma || 3,
    }).toUnit();

    const paymentData: ExpenseUpdatePaymentDto = {
      id: paymentManager.id,
      sequential: paymentManager.sequentialNumbr || '',
      amount: paymentManager.amount || 0,
      fee: paymentManager.fee || 0,
      convertionRate: paymentManager.convertionRate || 1,
      date: paymentManager.date?.toString(),
      mode: paymentManager.mode,
      notes: paymentManager.notes,
      currencyId: paymentManager.currencyId,
      firmId: paymentManager.firmId,
      sequentialNumbr: paymentManager.sequentialNumbr,
      invoices: invoices.filter(inv => inv.expenseInvoiceId), // Filter out invalid entries
      uploads: paymentManager.uploadedFiles?.filter((u) => !!u.upload)?.map((u) => u.upload) || [],
    };

    const validation = api.expensepayment.validate(paymentData, used, paid);
    if (validation.message) {
      toast.error(validation.message);
    } else {
      updatePayment({
        payment: paymentData,
        files: paymentManager.uploadedFiles?.filter((u) => !u.upload)?.map((u) => u.file) || [],
      });
    }
  };

  return (
    <div className={cn('overflow-auto px-10 py-6', className)}>
      {/* Main Container */}
      <div className={cn('block xl:flex gap-4', false ? 'pointer-events-none' : '')}>
        {/* First Card */}
        <div className="w-full h-auto flex flex-col xl:w-9/12">
          <ScrollArea className="max-h-[calc(100vh-120px)] border rounded-lg">
            <Card className="border-0 p-2">
              <CardContent className="p-5">
                <ExpensePaymentGeneralInformation
                  className="pb-5 border-b"
                  firms={firms || []}
                  currencies={currencies?.filter(
                    (c) => c.id === cabinet?.currency?.id || c.id === paymentManager?.firm?.currencyId
                  ) || []}
                  loading={fetching}
                />
                {paymentManager.firmId && (
                  <ExpensePaymentInvoiceManagement className="pb-5 border-b" loading={fetching} />
                )}
                {/* Extra Options (files) */}
                <div>
                  <ExpensePaymentExtraOptions
                    onUploadAdditionalFiles={(files) => paymentManager.set('uploadedFiles', files)}
                    onUploadPdfFile={(file) => paymentManager.set('pdfFile', file)}
                  />
                </div>
                <div className="flex gap-10 mt-5">
                  <Textarea
                    placeholder={tInvoicing('payment.attributes.notes')}
                    className="resize-none w-2/3"
                    rows={7}
                    value={paymentManager.notes || ''}
                    onChange={(e) => paymentManager.set('notes', e.target.value)}
                  />
                  <div className="w-1/3 my-auto">
                    <ExpensePaymentFinancialInformation currency={currency} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
        {/* Second Card */}
        <div className="w-full xl:mt-0 xl:w-3/12">
          <ScrollArea className="h-fit border rounded-lg">
            <Card className="border-0">
              <CardContent className="p-5">
                <ExpensePaymentControlSection
                  handleSubmit={onSubmit}
                  reset={globalReset}
                  loading={isUpdatePending}
                />
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};