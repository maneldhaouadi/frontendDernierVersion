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
import { Download, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  const handlePdfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFile = files[0];
  
      // Vérifiez que le fichier est bien un PDF
      if (newFile.type !== 'application/pdf') {
        toast.error(tInvoicing('quotation.only_pdf_files_allowed'));
        return;
      }
  
      // Vérifiez si un fichier PDF est déjà présent
      if (quotationManager.pdfFile || quotationManager.uploadPdfField) {
        toast.warning(tInvoicing('quotation.pdf_file_cannot_be_modified'));
        return;
      }
  
      console.log('New PDF file:', newFile); // Log pour vérifier le fichier
      quotationManager.set('pdfFile', newFile);
      quotationManager.set('uploadPdfField', { filename: newFile.name, file: newFile });
    }
  };

  const handleRemovePdfFile = async () => {
    try {
      if (quotationManager.pdfFileId) {
        if (typeof quotationManager.id === 'number') {
          await api.expense_quotation.deletePdfFile(quotationManager.id);
          console.log('PDF file removed successfully'); // Log pour vérifier la suppression
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
  
      console.log('File to download:', fileToDownload); // Log pour vérifier le fichier
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
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Input
            id="pdfFile"
            type="file"
            accept="application/pdf"
            onChange={handlePdfFileChange}
            disabled={!!quotationManager.pdfFile || !!quotationManager.uploadPdfField}
          />
          {quotationManager.uploadPdfField && (
            <div className="mt-2 flex items-center gap-2">
              <p className="text-sm text-gray-600 truncate">{quotationManager.uploadPdfField.filename}</p>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="mr-2" size={14} />
                {tCommon('download')}
              </Button>
              <Button variant="outline" size="sm" onClick={handleRemovePdfFile}>
                <Trash className="mr-2" size={14} />
                {tCommon('remove')}
              </Button>
            </div>
          )}
        </div>
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