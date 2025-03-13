import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileUploader } from '@/components/ui/file-uploader';
import { Files } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useExpensePaymentManager } from '../hooks/useExpensePaymentManager';

interface ExpensePaymentExtraOptionsProps {
  className?: string;
  loading?: boolean;
  onUploadAdditionalFiles: (files: File[]) => void; // Ajout de cette propriété
  onUploadPdfFile?: (file: File | undefined) => void; // Ajout de cette propriété (optionnelle)
}

export const ExpensePaymentExtraOptions = ({
  className,
  loading,
  onUploadAdditionalFiles,
  onUploadPdfFile,
}: ExpensePaymentExtraOptionsProps) => {
  const { t: tInvoicing } = useTranslation('invoicing');
  const paymentManager = useExpensePaymentManager();

  // Gestion des fichiers supplémentaires
  const handleAdditionalFilesChange = (files: File[]) => {
    if (files.length > paymentManager.uploadedFiles.length) {
      // Ajouter de nouveaux fichiers
      const newFiles = files.filter(
        (file) => !paymentManager.uploadedFiles.some((uploadedFile) => uploadedFile.file === file)
      );
      paymentManager.set('uploadedFiles', [
        ...paymentManager.uploadedFiles,
        ...newFiles.map((file) => ({ file })),
      ]);
    } else {
      // Supprimer les fichiers désélectionnés
      const updatedFiles = paymentManager.uploadedFiles.filter((uploadedFile) =>
        files.some((file) => file === uploadedFile.file)
      );
      paymentManager.set('uploadedFiles', updatedFiles);
    }

    // Appeler la fonction de rappel pour notifier les fichiers uploadés
    onUploadAdditionalFiles(files);
  };

  return (
    <Accordion type="multiple" className={cn(className, 'mx-1 border-b')}>
      {/* Section pour les fichiers supplémentaires */}
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex gap-2 justify-center items-center">
            <Files />
            <Label>{tInvoicing('payment.attributes.files')}</Label>
          </div>
        </AccordionTrigger>
        <AccordionContent className="m-5">
          <FileUploader
            accept={{
              'image/*': [],
              'application/pdf': [],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
              'application/msword': [],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
              'application/vnd.ms-excel': [],
            }}
            className="my-5"
            maxFileCount={Infinity} // Permettre plusieurs fichiers
            value={paymentManager.uploadedFiles?.map((d) => d.file)} // Afficher les fichiers existants
            onValueChange={handleAdditionalFilesChange}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};