import { Firm, Interlocutor } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectShimmer,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import React from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { UneditableCalendarDayPicker } from '@/components/ui/uneditable/uneditable-calendar-day-picker';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';
import { DatePicker } from '@/components/ui/date-picker';
import { useExpenseQuotationManager } from '../hooks/useExpenseQuotationManager';
import { Card } from '@/components/ui/card';
import { Download, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUploader } from '@/components/ui/file-uploader';
import { toast } from 'sonner';
import { api } from '@/api';

interface ExpenseQuotationGeneralInformationProps {
  className?: string;
  firms: Firm[];
  loading?: boolean;
  edit?: boolean;
}

export const ExpenseQuotationGeneralInformation = ({
  className,
  firms,
  edit = true,
  loading
}: ExpenseQuotationGeneralInformationProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tInvoicing } = useTranslation('invoicing');
  const router = useRouter();
  const quotationManager = useExpenseQuotationManager();
  const mainInterlocutor = quotationManager.firm?.interlocutorsToFirm?.find(
    (entry) => entry?.isMain
  );

  const handlePdfFileChange = (files: File[]) => {
    if (files.length > 0) {
      if (quotationManager.pdfFile || quotationManager.uploadPdfField) {
        toast.warning(tInvoicing('quotation.pdf_file_cannot_be_modified'));
        return;
      }
      const newFile = files[0];
      quotationManager.set('pdfFile', newFile);
      quotationManager.set('uploadPdfField', { filename: newFile.name, file: newFile });
    }
  };

  const handleRemovePdfFile = async () => {
    try {
      if (quotationManager.pdfFileId) {
        if (typeof quotationManager.id === 'number') {
          await api.expense_quotation.deletePdfFile(quotationManager.id);
          quotationManager.set('pdfFile', null);
          quotationManager.set('pdfFileId', null);
          quotationManager.set('uploadPdfField', null);
          toast.success(tInvoicing('quotation.pdf_file_removed_successfully'));
        } else {
          throw new Error('Quotation ID is undefined');
        }
      } else {
        toast.warning(tInvoicing('quotation.no_pdf_file_to_remove'));
      }
    } catch (error) {
      console.error('Error removing PDF file:', error);
      toast.error(tInvoicing('quotation.pdf_file_removal_failed'));
    }
  };

  const handleDownload = async () => {
    try {
      let fileToDownload: File | Blob | undefined;

      if (quotationManager.pdfFile) {
        fileToDownload = quotationManager.pdfFile;
      } else if (quotationManager.uploadPdfField?.filename) {
        const response = await fetch(quotationManager.uploadPdfField.filename);
        if (!response.ok) throw new Error('Failed to fetch the file');
        const blob = await response.blob();
        fileToDownload = blob;
      } else {
        toast.error(tInvoicing('quotation.no_file_to_download'));
        return;
      }

      const url = URL.createObjectURL(fileToDownload);
      const link = document.createElement('a');
      link.href = url;
      link.download = quotationManager.uploadPdfField?.filename || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(tInvoicing('quotation.download_failed'));
    }
  };

  return (
    <div className={cn(className, 'space-y-2')}>
      {/* Section Pièces jointes et Dates */}
      <div className="flex gap-4">
        {/* Section Pièces jointes */}
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tInvoicing('quotation.attributes.files')}</Label>
          <Card className="p-1 border border-dashed border-blue-400 bg-gray-50 rounded-md">
            <div className="flex flex-col items-center p-1 bg-white rounded-sm border-dashed border border-blue-300">
              <UploadCloud className="text-blue-500 mb-1" size={18} />
              <p className="text-gray-500 text-xs mb-1">{tInvoicing('quotation.attributes.dragAndDrop')}</p>
              <p className="text-xs text-gray-400">Supported formats: XLS, XLSX, PDF, DOCX, PNG, JPG</p>
              <FileUploader
                accept={{ 'application/pdf': [], 'application/vnd.ms-excel': [], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [], 'application/msword': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [], 'image/png': [], 'image/jpeg': [] }}
                className="my-1"
                maxFileCount={1}
                value={quotationManager.pdfFile ? [quotationManager.pdfFile] : []}
                onValueChange={handlePdfFileChange}
                disabled={!!quotationManager.pdfFile || !!quotationManager.uploadPdfField}
              />
              <label htmlFor="file-upload" className="text-blue-600 cursor-pointer text-xs">
                {tCommon('chooseFile')}
              </label>
            </div>
            {quotationManager.uploadPdfField && (
              <div className="mt-1 grid grid-cols-1 gap-1">
                <div className="flex flex-col items-center p-1 border rounded-md bg-white max-w-[200px]">
                  <div className="w-full h-12 overflow-hidden mb-1">
                    <div className="flex justify-center items-center w-full h-full bg-gray-200 text-gray-500 text-xs">
                      <p>PDF</p>
                    </div>
                  </div>
                  <p className="text-xs text-center text-gray-600 truncate">{quotationManager.uploadPdfField.filename}</p>
                  <div className="mt-1 flex justify-between gap-1 w-full">
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
              </div>
            )}
          </Card>
        </div>

        {/* Section Date et Échéance */}
        <div className="w-1/2 flex flex-col gap-2">
          <div>
            <Label className="text-xs font-semibold mb-1">{tInvoicing('quotation.attributes.date')} (*)</Label>
            {edit ? (
              <DatePicker
                className="w-full h-8"
                value={quotationManager?.date || new Date()}
                onChange={(value: Date) => quotationManager.set('date', value)}
                isPending={loading}
              />
            ) : (
              <UneditableCalendarDayPicker value={quotationManager?.date} />
            )}
          </div>
          <div>
            <Label className="text-xs font-semibold mb-1">{tInvoicing('quotation.attributes.due_date')} (*)</Label>
            {edit ? (
              <DatePicker
                className="w-full h-8"
                value={quotationManager?.dueDate || undefined}
                onChange={(value: Date) => quotationManager.set('dueDate', value)}
                isPending={loading}
              />
            ) : (
              <UneditableCalendarDayPicker value={quotationManager?.date} />
            )}
          </div>
        </div>
      </div>

      {/* Section Object et Numéro de Facture */}
      <div className="flex gap-1">
        <div className="w-2/3">
          <Label className="text-xs font-semibold mb-1">{tInvoicing('quotation.attributes.object')} (*)</Label>
          {edit ? (
            <Input
              className="w-full h-8"
              placeholder="Ex. Facture pour le 1er trimestre 2024"
              value={quotationManager.object || ''}
              onChange={(e) => quotationManager.set('object', e.target.value)}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={quotationManager.object} />
          )}
        </div>
        <div className="w-1/3">
          <Label className="text-xs font-semibold mb-1">{tInvoicing('quotation.singular')} N°</Label>
          {edit ? (
            <Input
              className="w-full h-8"
              placeholder="Numéro de Facture"
              value={quotationManager.sequentialNumbr || ''}
              onChange={(e) => quotationManager.set('sequentialNumbr', e.target.value)}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={quotationManager.sequentialNumbr || ''} />
          )}
        </div>
      </div>

      {/* Section Firm et Interlocutor */}
      <div className="flex gap-1">
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tInvoicing('quotation.attributes.firm')} (*)</Label>
          {edit ? (
            <SelectShimmer isPending={loading}>
              <Select
                onValueChange={(e) => {
                  const firm = firms?.find((firm) => firm.id === parseInt(e));
                  quotationManager.setFirm(firm);
                  quotationManager.set('currency', firm?.currency);
                }}
                value={quotationManager.firm?.id?.toString()}
              >
                <SelectTrigger className="w-full h-8">
                  <SelectValue placeholder={tInvoicing('quotation.associate_firm')} />
                </SelectTrigger>
                <SelectContent>
                  {firms?.map((firm: Partial<Firm>) => (
                    <SelectItem key={firm.id} value={firm.id?.toString() || ''}>
                      {firm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectShimmer>
          ) : (
            <UneditableInput value={quotationManager?.firm?.name} />
          )}
        </div>
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tInvoicing('quotation.attributes.interlocutor')} (*)</Label>
          {edit ? (
            <SelectShimmer isPending={loading}>
              <Select
                disabled={!quotationManager?.firm?.id}
                onValueChange={(e) => quotationManager.setInterlocutor({ id: parseInt(e) } as Interlocutor)}
                value={quotationManager.interlocutor?.id?.toString()}
              >
                <SelectTrigger className="w-full h-8">
                  <SelectValue placeholder={tInvoicing('quotation.associate_interlocutor')} />
                </SelectTrigger>
                <SelectContent>
                  {quotationManager.firm?.interlocutorsToFirm?.map((entry: any) => (
                    <SelectItem key={entry.interlocutor?.id} value={entry.interlocutor?.id?.toString()}>
                      {entry.interlocutor?.name} {entry.interlocutor?.surname}{' '}
                      {entry.isMain && <span className="font-bold">({tCommon('words.main_m')})</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SelectShimmer>
          ) : (
            <UneditableInput
              value={
                <div>
                  {quotationManager?.interlocutor?.name} {quotationManager.interlocutor?.surname}{' '}
                  {quotationManager?.interlocutor?.id == mainInterlocutor?.interlocutor?.id && (
                    <span className="font-bold"> ({tCommon('words.main_m')})</span>
                  )}
                </div>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};