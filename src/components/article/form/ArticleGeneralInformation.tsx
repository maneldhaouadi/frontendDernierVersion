/*import { Firm, Interlocutor } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectShimmer,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import React from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';
import { useArticleActions } from '../data-table/ActionsContext';

interface ArticleGeneralInformationProps {
  className?: string;
  firms: Firm[];
  edit?: boolean;
  loading?: boolean;
}

export const ArticleGeneralInformation = ({
  className,
  firms,
  edit = true,
  loading,
}: ArticleGeneralInformationProps) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tArticle } = useTranslation('article');
  const router = useRouter();
  const {
    title,
    setTitle,
    description,
    setDescription,
    barcode,
    setBarcode,
    qrCode,
    setQrCode,
    category,
    setCategory,
    subCategory,
    setSubCategory,
    status,
    setStatus,
    version,
    setVersion,
  } = useArticleActions();

  return (
    <div className={cn(className, 'space-y-2')}>
      <div className="flex gap-4">
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tArticle('article.attributes.title')} (*)</Label>
          {edit ? (
            <Input
              className="w-full h-8"
              placeholder={tArticle('article.attributes.title')}
              value={title || ''}
              onChange={(e) => setTitle?.(e.target.value)}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={title} />
          )}
        </div>
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tArticle('article.attributes.description')}</Label>
          {edit ? (
            <Input
              className="w-full h-8"
              placeholder={tArticle('article.attributes.description')}
              value={description || ''}
              onChange={(e) => setDescription?.(e.target.value)}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={description} />
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tArticle('article.attributes.barcode')}</Label>
          {edit ? (
            <Input
              className="w-full h-8"
              placeholder={tArticle('article.attributes.barcode')}
              value={barcode || ''}
              onChange={(e) => setBarcode?.(e.target.value)}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={barcode} />
          )}
        </div>
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tArticle('article.attributes.qrCode')}</Label>
          {edit ? (
            <Input
              className="w-full h-8"
              placeholder={tArticle('article.attributes.qrCode')}
              value={qrCode || ''}
              onChange={(e) => setQrCode?.(e.target.value)}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={qrCode} />
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tArticle('article.attributes.category')}</Label>
          {edit ? (
            <Input
              className="w-full h-8"
              placeholder={tArticle('article.attributes.category')}
              value={category || ''}
              onChange={(e) => setCategory?.(e.target.value)}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={category} />
          )}
        </div>
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tArticle('article.attributes.subCategory')}</Label>
          {edit ? (
            <Input
              className="w-full h-8"
              placeholder={tArticle('article.attributes.subCategory')}
              value={subCategory || ''}
              onChange={(e) => setSubCategory?.(e.target.value)}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={subCategory} />
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tArticle('article.attributes.status')}</Label>
          {edit ? (
            <SelectShimmer isPending={loading}>
              <Select onValueChange={(value: string) => setStatus?.(value)} value={status || ''}>
                <SelectTrigger className="w-full h-8">
                  <SelectValue placeholder={tArticle('article.attributes.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{tArticle('article.status.active')}</SelectItem>
                  <SelectItem value="INACTIVE">{tArticle('article.status.inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </SelectShimmer>
          ) : (
            <UneditableInput value={status} />
          )}
        </div>
        <div className="w-1/2">
          <Label className="text-xs font-semibold mb-1">{tArticle('article.attributes.version')}</Label>
          {edit ? (
            <Input
              className="w-full h-8"
              placeholder={tArticle('article.attributes.version')}
              value={version?.toString() || ''}
              onChange={(e) => setVersion?.(parseInt(e.target.value))}
              isPending={loading}
            />
          ) : (
            <UneditableInput value={version?.toString()} />
          )}
        </div>
      </div>
    </div>
  );
};*/
