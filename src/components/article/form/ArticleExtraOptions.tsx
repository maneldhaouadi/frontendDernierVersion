/*import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileUploader } from '@/components/ui/file-uploader';
import { Textarea } from '@/components/ui/textarea';
import { Files, NotebookTabs } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ArticleExtraOptionsProps {
  className?: string;
  loading?: boolean;
  onUploadAdditionalFiles: (files: File[]) => void;
}

export const ArticleExtraOptions = ({
  className,
  loading,
}: ArticleExtraOptionsProps) => {
  const { t: tArticle } = useTranslation('article');
  const articleManager = useArticleManager();

  const handleAdditionalFilesChange = (files: File[]) => {
    if (files.length > articleManager.uploadedFiles.length) {
      const newFiles = files.filter(
        (file) => !articleManager.uploadedFiles.some((uploadedFile) => uploadedFile.file === file)
      );
      articleManager.set('uploadedFiles', [
        ...articleManager.uploadedFiles,
        ...newFiles.map((file) => ({ file })),
      ]);
    } else {
      const updatedFiles = articleManager.uploadedFiles.filter((uploadedFile) =>
        files.some((file) => file === uploadedFile.file)
      );
      articleManager.set('uploadedFiles', updatedFiles);
    }
  };

  return (
    <Accordion type="multiple" className={cn(className, 'mx-1 border-b')}>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <div className="flex gap-2 justify-center items-center">
            <Files />
            <Label>{tArticle('article.attributes.additional_files')}</Label>
          </div>
        </AccordionTrigger>
        <AccordionContent className="m-5">
          <FileUploader
            accept={{
              'image/*': [],
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
              'application/msword': [],
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
              'application/vnd.ms-excel': [],
            }}
            className="my-5"
            maxFileCount={Infinity}
            value={articleManager.uploadedFiles?.map((d) => d.file)}
            onValueChange={handleAdditionalFilesChange}
          />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="item-3">
        <AccordionTrigger>
          <div className="flex gap-2 justify-center items-center">
            <NotebookTabs />
            <Label>{tArticle('article.attributes.notes')}</Label>
          </div>
        </AccordionTrigger>
        <AccordionContent className="m-5">
          <Textarea
            placeholder={tArticle('article.attributes.notes')}
            className="resize-none"
            value={articleManager.notes}
            onChange={(e) => articleManager.set('notes', e.target.value)}
            isPending={loading}
            rows={7}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};*/
