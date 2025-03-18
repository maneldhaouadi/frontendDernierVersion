/*import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Currency, Tax } from '@/types';
import { Plus, X } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useArticleActions } from '../data-table/ActionsContext';

interface TaxDisplayProps {
  tax?: Tax;
  currency?: Currency;
}
const TaxDisplay = ({ tax, currency }: TaxDisplayProps) => {
  const value = tax?.value ?? 0;
  const displayValue = tax?.isRate
    ? value.toFixed(2)
    : value.toFixed(currency?.digitAfterComma || 3);
  const symbol = tax?.isRate ? '%' : currency?.symbol || '$';
  return (
    <div className="my-2 flex flex-row justify-between gap-2 w-full">
      <Label className="font-extrabold text-xs"> {tax?.label}</Label>
      <Label className="text-xs">{`${displayValue} ${symbol}`}</Label>
    </div>
  );
};

interface ArticleTaxEntriesProps {
  className?: string;
  taxes: Tax[];
  selectedTaxIds: (number | undefined)[];
  currency?: Currency;
  edit?: boolean;
}

export const ArticleTaxEntries: React.FC<ArticleTaxEntriesProps> = ({
  className,
  taxes,
  selectedTaxIds,
  currency,
  edit = true
}) => {
  const { t: tArticle } = useTranslation('article');
  const {
    articleTaxes,
    setArticleTaxes,
    addArticleTax,
    updateArticleTax,
    deleteArticleTax,
  } = useArticleActions();

  const rateTaxes = React.useMemo(() => {
    return taxes.filter((tax) => !selectedTaxIds.includes(tax.id) && tax.isRate);
  }, [taxes, selectedTaxIds]);

  const fixedAmountTaxes = React.useMemo(() => {
    return taxes.filter((tax) => !selectedTaxIds.includes(tax.id) && !tax.isRate);
  }, [taxes, selectedTaxIds]);

  const handleTaxAdd = () => {
    addArticleTax?.(); // Ajouter une nouvelle taxe à l'article
  };

  const handleTaxChange = (value: string, index: number) => {
    const selectedTax = taxes.find((tax) => tax.id === parseInt(value));
    if (selectedTax) {
      updateArticleTax?.(index, selectedTax); // Mettre à jour la taxe à l'index spécifié
    }
  };

  const handleTaxDelete = (index: number) => {
    deleteArticleTax?.(index); // Supprimer la taxe à l'index spécifié
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {(!articleTaxes || articleTaxes.length === 0) && (
        <p className="font-thin text-sm m-1">{tArticle('article.no_applied_tax')}</p>
      )}
      {articleTaxes?.map((tax, i) => (
        <div className="flex items-center justify-between gap-2" key={i}>
          {tax ? (
            <TaxDisplay tax={tax} currency={currency} />
          ) : (
            <Select
              key={tax?.id?.toString() || 'selected-tax'}
              onValueChange={(value) => handleTaxChange(value, i)}
              value={tax?.id?.toString() || undefined}>
              <SelectTrigger>
                <SelectValue placeholder="0%" />
              </SelectTrigger>
              <SelectContent align="center">
                {rateTaxes.length !== 0 && (
                  <SelectGroup>
                    <SelectLabel>Pourcentages</SelectLabel>
                    {rateTaxes.map((tax) => (
                      <SelectItem key={tax.id} value={tax?.id?.toString() || ''} className="ml-2">
                        <div className="flex flex-row w-full justify-between gap-2">
                          <Label className="font-light"> {tax.label}</Label>
                          <Label>({(tax.value ?? 0).toFixed(2)}%)</Label>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {fixedAmountTaxes.length !== 0 && (
                  <SelectGroup>
                    <SelectLabel>Fixed Price</SelectLabel>
                    {fixedAmountTaxes.map((tax) => (
                      <SelectItem key={tax.id} value={tax?.id?.toString() || ''} className="ml-2">
                        <div className="flex flex-row w-full justify-between gap-2">
                          <Label className="font-light"> {tax.label}</Label>
                          <Label>
                            ({(tax.value ?? 0).toFixed(currency?.digitAfterComma || 3)}
                            {currency?.symbol})
                          </Label>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          )}
          {edit && (
            <X
              className="h-4 w-4 cursor-pointer hover:text-red-600"
              onClick={() => handleTaxDelete(i)}
            />
          )}
        </div>
      ))}
      {edit && (
        <div>
          <Button variant={'outline'} className="w-full h-8" onClick={handleTaxAdd}>
            <Plus size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};*/