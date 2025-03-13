import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectShimmer,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Currency, Firm } from '@/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import React from 'react';
import { CalendarDatePicker } from '@/components/ui/calendar-day-picker';
import { useExpensePaymentManager } from '../hooks/useExpensePaymentManager';
import { EXPENSE_PAYMENT_MODE } from '@/types/expense-payment';
import { useExpensePaymentInvoiceManager } from '../hooks/useExpensePaymentInvoiceManager';
import { EXPENSE_INVOICE_STATUS, ExpenseInvoice } from '@/types/expense_invoices';
import { Button } from '@/components/ui/button';
import { UploadCloud, Download } from 'lucide-react';
import { FileUploader } from '@/components/ui/file-uploader';
import { toast } from 'sonner';
import { api } from '@/api';
import { Card } from '@/components/ui/card';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';

interface ExpensePaymentGeneralInformationProps {
  className?: string;
  firms: Firm[];
  currencies: Currency[];
  loading?: boolean;
  onUploadPdfFile?: (file: File) => void;
  onRemovePdfFile?: () => void;
}

export const ExpensePaymentGeneralInformation = ({
  className,
  firms,
  currencies,
  loading,
  onUploadPdfFile,
  onRemovePdfFile,
}: ExpensePaymentGeneralInformationProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tInvoicing } = useTranslation('invoicing');
  const { t: tCurrency } = useTranslation('currency');

  const paymentManager = useExpensePaymentManager();
  const invoiceManager = useExpensePaymentInvoiceManager();

  // Gestion du fichier PDF
  const handlePdfFileChange = (files: File[]) => {
    if (files.length > 0) {
      if (paymentManager.pdfFile || paymentManager.uploadPdfField) {
        toast.warning(tInvoicing('payment.pdf_file_cannot_be_modified'));
        return;
      }
      const newFile = files[0];
      paymentManager.set('pdfFile', newFile);
      paymentManager.set('uploadPdfField', { filename: newFile.name, file: newFile });
      if (onUploadPdfFile) onUploadPdfFile(newFile);
    }
  };

  const handleRemovePdfFile = async () => {
    try {
      if (paymentManager.pdfFileId) {
        if (typeof paymentManager.id === 'number') {
          await api.expensepayment.remove(paymentManager.id);
          paymentManager.set('pdfFile', null);
          paymentManager.set('pdfFileId', null);
          paymentManager.set('uploadPdfField', null);
          toast.success(tInvoicing('payment.pdf_file_removed_successfully'));
          if (onRemovePdfFile) onRemovePdfFile();
        } else {
          throw new Error('Payment ID is undefined');
        }
      } else {
        toast.warning(tInvoicing('payment.no_pdf_file_to_remove'));
      }
    } catch (error) {
      console.error('Error removing PDF file:', error);
      toast.error(tInvoicing('payment.pdf_file_removal_failed'));
    }
  };

  const handleDownload = async () => {
    try {
      let fileToDownload: File | Blob | undefined;

      if (paymentManager.pdfFile) {
        fileToDownload = paymentManager.pdfFile;
      } else if (paymentManager.uploadPdfField?.filename) {
        const response = await fetch(paymentManager.uploadPdfField.filename);
        if (!response.ok) throw new Error('Failed to fetch the file');
        const blob = await response.blob();
        fileToDownload = blob;
      } else {
        toast.error(tInvoicing('payment.no_file_to_download'));
        return;
      }

      const url = URL.createObjectURL(fileToDownload);
      const link = document.createElement('a');
      link.href = url;
      link.download = paymentManager.uploadPdfField?.filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(tInvoicing('payment.download_failed'));
    }
  };

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Champ pour saisir le numéro séquentiel */}
      <div className="w-1/3">
        <Label className="text-xs font-semibold mb-1">{tInvoicing('payment.sequentialNumbr')}</Label>
        <Input
          className="w-full h-8"
          placeholder={tInvoicing('payment.sequentialNumbr_placeholder')}
          value={paymentManager.sequentialNumbr || ''}
          onChange={(e) => paymentManager.set('sequentialNumbr', e.target.value)}
          isPending={loading}
        />
      </div>

      {/* Section Pièces jointes et Date */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pièces jointes */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold mb-1">{tInvoicing('payment.attributes.files')}</Label>
          <Card className="p-4 border border-dashed border-blue-400 bg-gray-50 rounded-md">
            <div className="flex flex-col items-center p-4 bg-white rounded-sm border-dashed border border-blue-300">
              <UploadCloud className="text-blue-100 mb-2" size={18} />
              <p className="text-gray-500 text-xs mb-2">{tInvoicing('payment.attributes.dragAndDrop')}</p>
              <p className="text-xs text-gray-400">Supported formats: XLS, XLSX, PDF, DOCX, PNG, JPG</p>
              <FileUploader
                accept={{ 'application/pdf': [] }}
                className="my-2"
                maxFileCount={1}
                value={paymentManager.pdfFile ? [paymentManager.pdfFile] : []}
                onValueChange={handlePdfFileChange}
                disabled={!!paymentManager.pdfFile || !!paymentManager.uploadPdfField}
              />
              <label htmlFor="file-upload" className="text-blue-600 cursor-pointer text-xs">
                {tCommon('chooseFile')}
              </label>
            </div>
            {paymentManager.uploadPdfField && (
              <div className="mt-2 flex flex-col items-center p-2 border rounded-md bg-white">
                <div className="w-full h-12 overflow-hidden mb-2">
                  <div className="flex justify-center items-center w-full h-full bg-gray-200 text-gray-500 text-xs">
                    <p>PDF</p>
                  </div>
                </div>
                <p className="text-xs text-center text-gray-600 truncate">
                  {paymentManager.uploadPdfField.filename}
                </p>
                <div className="mt-2 flex justify-between gap-2 w-full">
                  <Button
                    variant="outline"
                    className="text-gray-500 border-gray-300 text-xs p-1 h-6"
                    onClick={handleRemovePdfFile}
                  >
                    Remove
                  </Button>
                  <Button
                    variant="outline"
                    className="text-gray-500 border-gray-300 text-xs p-1 h-6"
                    onClick={handleDownload}
                  >
                    <Download className="mr-1" size={14} /> Download
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Date */}
        <div className="flex flex-col gap-2">
          <Label>{tInvoicing('invoice.attributes.date')} (*)</Label>
          <CalendarDatePicker
            label={tCommon('pick_date')}
            date={
              paymentManager?.date
                ? { from: paymentManager?.date, to: undefined }
                : { from: undefined, to: undefined }
            }
            onDateSelect={({ from, to }) => {
              paymentManager.set('date', from);
            }}
            variant="outline"
            numberOfMonths={1}
            className="w-full py-4 mt-1"
            isPending={loading}
          />
        </div>
      </div>

      {/* Firm et Currency */}
      <div className="grid grid-cols-2 gap-4">
        {/* Firm */}
        <div className="flex flex-col gap-2">
          <Label>{tCommon('submenu.firms')} (*)</Label>
          <SelectShimmer isPending={loading}>
            <Select
              onValueChange={(e) => {
                const firm = firms?.find((firm) => firm.id === parseInt(e));
                paymentManager.set('firmId', firm?.id);
                paymentManager.set('firm', firm);
                paymentManager.set('currencyId', firm?.currency?.id);
                paymentManager.set('currency', firm?.currency);
                invoiceManager.reset();
                console.log('Firm invoices:', firm?.invoices);
                firm?.invoices?.forEach((invoice: ExpenseInvoice) => {
                  console.log('Invoice:', invoice.status); // Affiche le statut actuel
                  if (
                    invoice?.status &&
                    [
                      EXPENSE_INVOICE_STATUS.PartiallyPaid,
                      EXPENSE_INVOICE_STATUS.Validated,
                      EXPENSE_INVOICE_STATUS.Unpaid,
                    ].includes(invoice.status as EXPENSE_INVOICE_STATUS)
                  ) {
                    invoiceManager.add({
                      amount: 0,
                      expenseInvoiceId: invoice.id,
                      expenseInvoice: invoice,
                    });
                  }
                });
              }}
              value={paymentManager.firmId?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder={tInvoicing('invoice.associate_firm')} />
              </SelectTrigger>
              <SelectContent>
                {firms?.map((firm: Partial<Firm>) => (
                  <SelectItem key={firm.id} value={firm.id?.toString() || ''} className="mx-1">
                    {firm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SelectShimmer>
        </div>

        {/* Currency */}
        <div className="flex flex-col gap-2">
          <Label>{tInvoicing('payment.attributes.currency')}</Label>
          <SelectShimmer isPending={loading}>
            <Select
              key={paymentManager.currencyId || 'currency'}
              onValueChange={(e) => {
                const currency = currencies.find((currency) => currency.id == parseInt(e));
                paymentManager.set('currencyId', currency?.id);
                paymentManager.set('currency', currency);
                invoiceManager.init();
              }}
              disabled={currencies.length == 1}
              defaultValue={
                paymentManager?.currencyId ? paymentManager?.currencyId?.toString() : undefined
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={tInvoicing('controls.currency_select_placeholder')} />
              </SelectTrigger>
              <SelectContent>
                {currencies?.map((currency: Currency) => {
                  return (
                    <SelectItem key={currency.id} value={currency?.id?.toString() || ''}>
                      {currency?.code && tCurrency(currency?.code)} ({currency.symbol})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </SelectShimmer>
        </div>
      </div>

      {/* Convertion Rate et Mode */}
      <div className="grid grid-cols-2 gap-4">
        {/* Convertion Rate */}
        <div className="flex flex-col gap-2">
          <Label>{tInvoicing('payment.attributes.convertion_rate')}</Label>
          <Input
            type="number"
            placeholder="1"
            value={paymentManager.convertionRate}
            onChange={(e) => {
              paymentManager.set('convertionRate', parseFloat(e.target.value));
            }}
          />
        </div>

        {/* Mode */}
        <div className="flex flex-col gap-2">
          <Label>{tInvoicing('payment.attributes.mode')} (*)</Label>
          <SelectShimmer isPending={loading || false}>
            <Select
              onValueChange={(e) => {
                paymentManager.set('mode', e);
              }}
              value={paymentManager?.mode || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder={tInvoicing('payment.attributes.mode')} />
              </SelectTrigger>
              <SelectContent>
                {Object.values(EXPENSE_PAYMENT_MODE).map((title) => (
                  <SelectItem key={title} value={title}>
                    {tInvoicing(title)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SelectShimmer>
        </div>
      </div>

      {/* Amount et Fee */}
      <div className="grid grid-cols-2 gap-4">
        {/* Amount */}
        <div className="flex flex-col gap-2">
          <Label>{tInvoicing('payment.attributes.amount')}</Label>
          <Input
            type="number"
            placeholder="0"
            value={paymentManager.amount}
            onChange={(e) => {
              paymentManager.set('amount', parseFloat(e.target.value));
            }}
          />
        </div>

        {/* Fee */}
        <div className="flex flex-col gap-2">
          <Label>{tInvoicing('payment.attributes.fee')}</Label>
          <Input
            type="number"
            placeholder="0"
            value={paymentManager.fee}
            onChange={(e) => {
              paymentManager.set('fee', parseFloat(e.target.value));
            }}
          />
        </div>
      </div>
    </div>
  );
};