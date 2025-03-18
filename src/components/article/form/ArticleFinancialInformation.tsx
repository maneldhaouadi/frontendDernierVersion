/*import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useArticleActions } from './ArticleActionsContext';

interface ArticleFinancialInformationProps {
  className?: string;
  loading?: boolean;
  edit?: boolean;
}

export const ArticleFinancialInformation = ({
  className,
  loading,
  edit = true,
}: ArticleFinancialInformationProps) => {
  const { t: tArticle } = useTranslation('article');
  const {
    salePrice,
    setSalePrice,
    purchasePrice,
    setPurchasePrice,
    quantityInStock,
    setQuantityInStock,
  } = useArticleActions();

  return (
    <div className={cn(className)}>
      <div className="flex flex-col w-full border-b">
        <div className="flex my-2">
          <Label className="mr-auto">{tArticle('article.attributes.salePrice')}</Label>
          {edit ? (
            <Input
              className="ml-auto w-2/5 text-right"
              type="number"
              value={salePrice || 0}
              onChange={(e) => setSalePrice?.(parseFloat(e.target.value))}
              isPending={loading || false}
            />
          ) : (
            <Label className="ml-auto" isPending={loading || false}>
              {salePrice?.toFixed(2)} $
            </Label>
          )}
        </div>
      </div>

      <div className="flex flex-col w-full border-b">
        <div className="flex my-2">
          <Label className="mr-auto">{tArticle('article.attributes.purchasePrice')}</Label>
          {edit ? (
            <Input
              className="ml-auto w-2/5 text-right"
              type="number"
              value={purchasePrice || 0}
              onChange={(e) => setPurchasePrice?.(parseFloat(e.target.value))}
              isPending={loading || false}
            />
          ) : (
            <Label className="ml-auto" isPending={loading || false}>
              {purchasePrice?.toFixed(2)} $
            </Label>
          )}
        </div>
      </div>

      <div className="flex flex-col w-full border-b">
        <div className="flex my-2">
          <Label className="mr-auto">{tArticle('article.attributes.quantityInStock')}</Label>
          {edit ? (
            <Input
              className="ml-auto w-2/5 text-right"
              type="number"
              value={quantityInStock || 0}
              onChange={(e) => setQuantityInStock?.(parseFloat(e.target.value))}
              isPending={loading || false}
            />
          ) : (
            <Label className="ml-auto" isPending={loading || false}>
              {quantityInStock}
            </Label>
          )}
        </div>
      </div>
    </div>
  );
};
*/