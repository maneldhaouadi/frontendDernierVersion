import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';
import { Article } from '@/types';

interface ArticleItemProps {
  className?: string;
  article: Article;
  onChange: (article: Article) => void;
  showDescription?: boolean;
  edit?: boolean;
}

export const ArticleItem: React.FC<ArticleItemProps> = ({
  className,
  article,
  onChange,
  showDescription = false,
  edit = true
}) => {
  const { t: tArticle } = useTranslation('article');

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...article,
      title: e.target.value
    });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...article,
      description: e.target.value
    });
  };

  const handleQuantityInStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantityInStock = e.target.value;
    const regex = new RegExp(`^\\d*(\\.\\d{0,${3}})?$`);
    if (quantityInStock.match(regex)) {
      onChange({
        ...article,
        quantityInStock: parseFloat(quantityInStock)
      });
    }
  };

  const handleSalePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const salePrice = e.target.value;
    const regex = new RegExp(`^\\d*(\\.\\d{0,${3}})?$`);
    if (salePrice.match(regex)) {
      onChange({
        ...article,
        salePrice: parseFloat(salePrice)
      });
    }
  };

  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const purchasePrice = e.target.value;
    const regex = new RegExp(`^\\d*(\\.\\d{0,${3}})?$`);
    if (purchasePrice.match(regex)) {
      onChange({
        ...article,
        purchasePrice: parseFloat(purchasePrice)
      });
    }
  };

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...article,
      barcode: e.target.value
    });
  };

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...article,
      qrCode: e.target.value
    });
  };

  const handleStatusChange = (value: string) => {
    onChange({
      ...article,
      status: value
    });
  };

  const handleCategoryChange = (value: string) => {
    onChange({
      ...article,
      category: value
    });
  };

  const handleSubCategoryChange = (value: string) => {
    onChange({
      ...article,
      subCategory: value
    });
  };

  return (
    <div className={cn('flex flex-row items-center gap-6 h-full', className)}>
      <div className="w-9/12">
        <div className="flex flex-row gap-2 my-1">
          {/* Title */}
          <div className="w-3/5">
            <Label className="mx-1">{tArticle('article.attributes.title')}</Label>
            {edit ? (
              <Input
                placeholder="Title"
                value={article.title}
                onChange={handleTitleChange}
              />
            ) : (
              <UneditableInput value={article.title} />
            )}
          </div>
          {/* Quantity in Stock */}
          <div className="w-1/5">
            <Label className="mx-1">{tArticle('article.attributes.quantityInStock')}</Label>
            {edit ? (
              <Input
                type="number"
                placeholder="0"
                value={article.quantityInStock}
                onChange={handleQuantityInStockChange}
              />
            ) : (
              <UneditableInput value={article.quantityInStock} />
            )}
          </div>
          {/* Sale Price */}
          <div className="w-1/5">
            <Label className="mx-1">{tArticle('article.attributes.salePrice')}</Label>
            <div className="flex items-center gap-2">
              {edit ? (
                <Input
                  type="number"
                  placeholder="0"
                  value={article.salePrice}
                  onChange={handleSalePriceChange}
                />
              ) : (
                <UneditableInput value={article.salePrice} />
              )}
              <Label className="font-bold mx-1">$</Label>
            </div>
          </div>
        </div>
        <div>
          {showDescription && (
            <div>
              {edit ? (
                <>
                  <Label className="mx-1">{tArticle('article.attributes.description')}</Label>
                  <Textarea
                    placeholder="Description"
                    className="resize-none"
                    value={article.description}
                    onChange={handleDescriptionChange}
                    rows={3}
                  />
                </>
              ) : (
                article.description && (
                  <>
                    <Label className="mx-1">{tArticle('article.attributes.description')}</Label>
                    <Textarea
                      disabled
                      value={article.description}
                      className="resize-none"
                      onClick={() => {}}
                      rows={3}
                    />
                  </>
                )
              )}
            </div>
          )}
        </div>
      </div>
      <div className="w-3/12 flex flex-col h-full">
        {/* Barcode */}
        <div className="my-auto">
          <Label className="mx-1">{tArticle('article.attributes.barcode')}</Label>
          {edit ? (
            <Input
              placeholder="Barcode"
              value={article.barcode}
              onChange={handleBarcodeChange}
            />
          ) : (
            <UneditableInput value={article.barcode} />
          )}
        </div>
        {/* QR Code */}
        <div className="my-auto">
          <Label className="mx-1">{tArticle('article.attributes.qrCode')}</Label>
          {edit ? (
            <Input
              placeholder="QR Code"
              value={article.qrCode}
              onChange={handleQrCodeChange}
            />
          ) : (
            <UneditableInput value={article.qrCode} />
          )}
        </div>
        {/* Status */}
        <div className="my-auto">
          <Label className="mx-1">{tArticle('article.attributes.status')}</Label>
          {edit ? (
            <Select
              onValueChange={handleStatusChange}
              defaultValue={article.status}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <UneditableInput value={article.status} />
          )}
        </div>
      </div>
      <div className="w-2/12 text-center flex flex-col justify-between h-full gap-12 mx-4">
        {/* Category */}
        <div className="flex flex-col gap-2 my-auto">
          <Label className="font-bold mx-1">{tArticle('article.attributes.category')}</Label>
          {edit ? (
            <Input
              placeholder="Category"
              value={article.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
            />
          ) : (
            <UneditableInput value={article.category} />
          )}
        </div>
        {/* Sub Category */}
        <div className="flex flex-col gap-2 my-auto">
          <Label className="font-bold mx-1">{tArticle('article.attributes.subCategory')}</Label>
          {edit ? (
            <Input
              placeholder="Sub Category"
              value={article.subCategory}
              onChange={(e) => handleSubCategoryChange(e.target.value)}
            />
          ) : (
            <UneditableInput value={article.subCategory} />
          )}
        </div>
      </div>
    </div>
  );
};