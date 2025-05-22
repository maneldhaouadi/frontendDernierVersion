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
import { DISCOUNT_TYPE } from '@/types/enums/discount-types';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Textarea } from '@/components/ui/textarea';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';
import { ExpenseArticleInvoiceEntry, ExpenseInvoiceTaxEntry } from '@/types/expense_invoices';
import {Article, Currency, Tax } from '@/types';
import { ExpenseInvoiceTaxEntries } from './ExpenseInvoiceTaxEntries';

interface ExpenseInvoiceArticleItemProps {
  className?: string;
  article: ExpenseArticleInvoiceEntry;
  onChange: (item: ExpenseArticleInvoiceEntry) => void;
  showDescription?: boolean;
  currency?: Currency;
  taxes: Tax[];
  edit?: boolean;
}

export const ExpenseInvoiceArticleItem: React.FC<ExpenseInvoiceArticleItemProps> = ({
  className,
  article,
  onChange,
  taxes,
  currency,
  showDescription = false,
  edit = true
}) => {
  const { t: tInvoicing } = useTranslation('invoicing');

  const digitAfterComma = currency?.digitAfterComma || 3;
  const currencySymbol = currency?.symbol || '$';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentArticle = article.article || {
      id: 0,
      title: '',
      description: '',
      category: '',
      subCategory: '',
      purchasePrice: 0,
      salePrice: 0,
      quantityInStock: 0
    };
  
    onChange({
      ...article,
      article: {
        ...currentArticle,
        id: parseInt(e.target.value),
        title: e.target.value
      }
    });
  };
<<<<<<< HEAD
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
=======

// Ajoutez cette fonction pour générer une référence automatique
// Modifiez la fonction generateReference comme ceci :
const generateReference = async () => {
  let generatedReference = '';
  let referenceExists = true;
  let attempts = 0;
  const maxAttempts = 5;

  // Génère une référence unique
  while (referenceExists && attempts < maxAttempts) {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(100 + Math.random() * 900);
    generatedReference = `REF-${timestamp}-${randomNum}`;

    try {
      const response = await api.article.findOneByReference(generatedReference);
      referenceExists = !!response;
      attempts++;
    } catch (error) {
      referenceExists = false; // En cas d'erreur, on considère que la référence est disponible
    }
  }

  if (referenceExists) {
    toast.error(tInvoicing('article.errors.generation_failed'));
    return;
  }

  onChange({
    ...article,
    reference: generatedReference,
    article: {
      ...(article.article || {
        id: 0,
        title: '',
        description: '',
        quantityInStock: 0,
        status: 'draft',
        version: 0,
        unitPrice: 0,
        notes: '',
        isDeletionRestricted: false
      }),
      reference: generatedReference
    }
  });
};

const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const updatedArticle = {
    ...article,
    article: {
      ...(article.article || {
        id: 0, // Toujours fournir un ID par défaut
        title: '',
        description: '',
        reference: '',
        quantityInStock: 0,
        status: 'draft',
        version: 0,
        unitPrice: 0,
        notes: '',
        isDeletionRestricted: false
      }),
      title: e.target.value,
      version: (article.article?.version || 0) + 1
    },
    updatedAt: new Date().toISOString()
  };
  onChange(updatedArticle);
};

  const handleSelectArticle = async (value: string) => {
    if (value === 'disabled') return;
    
    const selectedArticle = articles.find((art) => art.id === parseInt(value));
    if (selectedArticle) {
      setAvailableQuantity(selectedArticle.quantityInStock);
      
      const unitPrice = Math.round(Number(selectedArticle.unitPrice)) || 0;
      
      onChange({
        ...article,
        article: {
          ...selectedArticle, // Conserve toutes les propriétés de l'article
          unitPrice: unitPrice // Met à jour le prix unitaire
        },
        quantity: Math.min(article.quantity || 1, selectedArticle.quantityInStock || 1),
        unit_price: unitPrice
      });
    }
  };

  const handleArticleUpdate = (field: keyof Article, value: any) => {
>>>>>>> ce6bc78 (DernierVersionFrront)
    if (!article.article) {
      throw new Error("Article object is required");
    }
  
    const requiredFields: (keyof Article)[] = [
      'title', 'category', 'subCategory', 
      'purchasePrice', 'salePrice', 'quantityInStock'
    ];
  
    const missingFields = requiredFields.filter(
      field => article.article![field] === undefined
    );
  
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  
    onChange({
      ...article,
      article: {
        ...article.article,
<<<<<<< HEAD
        description: e.target.value
      }
    });
  };

=======
        [field]: value
      }
    });
  };

  const checkIfArticleExists = async (reference: string): Promise<boolean> => {
    if (!reference) return false;
    
    try {
      const response = await api.article.findOneByReference(reference);
      return !!response; // Retourne true si l'article existe
    } catch (error) {
      console.error('Error checking article reference', error);
      return false;
    }
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const updatedArticle = {
    ...article,
    article: {
      ...(article.article || {
        id: 0, // Toujours fournir un ID par défaut
        title: '',
        description: '',
        reference: '',
        quantityInStock: 0,
        status: 'draft',
        version: 0,
        unitPrice: 0,
        notes: '',
        isDeletionRestricted: false
      }),
      description: e.target.value,
      version: (article.article?.version || 0) + 1
    },
    updatedAt: new Date().toISOString()
  };
  onChange(updatedArticle);
};
>>>>>>> ce6bc78 (DernierVersionFrront)
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = e.target.value;
    const regex = new RegExp(`^\\d*(\\.\\d{0,${3}})?$`);
    if (quantity.match(regex)) {
<<<<<<< HEAD
=======
      const quantityNum = parseFloat(quantity);
      
      // Vérifier si la quantité demandée est disponible
      if (availableQuantity !== null && quantityNum > availableQuantity) {
        toast.error(tInvoicing('quantité insuffisante', {
          available: availableQuantity,
          requested: quantityNum
        }));
        return;
      }
      
>>>>>>> ce6bc78 (DernierVersionFrront)
      onChange({
        ...article,
        quantity: parseFloat(quantity)
      });
    }
  };

  const handleUnitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const unitPrice = e.target.value;
    const regex = new RegExp(`^\\d*(\\.\\d{0,${3}})?$`);
    if (unitPrice.match(regex)) {
      onChange({
        ...article,
        unit_price: parseFloat(unitPrice)
      });
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const discount = e.target.value;
    const { discount_type } = article;

    if (discount_type === DISCOUNT_TYPE.PERCENTAGE) {
      const percentage = parseFloat(discount);
      onChange({
        ...article,
        discount: percentage
      });
    } else if (discount_type === DISCOUNT_TYPE.AMOUNT) {
      const regex = new RegExp(`^\\d*(\\.\\d{0,${3}})?$`);
      if (regex.test(discount)) {
        onChange({
          ...article,
          discount: parseFloat(discount)
        });
      }
    }
  };

  const handleDiscountTypeChange = (value: string) => {
    onChange({
      ...article,
      discount_type: value === 'PERCENTAGE' ? DISCOUNT_TYPE.PERCENTAGE : DISCOUNT_TYPE.AMOUNT,
      discount: 0 // Reset discount to 0 when changing the type
    });
  };

  const handleTaxChange = (value: string, index: number) => {
    const selectedTax = taxes.find((tax) => tax.id === parseInt(value));
    const updatedTaxes = [...(article.expenseArticleInvoiceEntryTaxes || [])];
    if (selectedTax) {
      updatedTaxes[index] = { tax: selectedTax };
    } else {
      updatedTaxes.splice(index, 1);
    }
    onChange({ ...article, expenseArticleInvoiceEntryTaxes: updatedTaxes });
  };

  const handleTaxDelete = (index: number) => {
    const updatedTaxes = article.expenseArticleInvoiceEntryTaxes?.filter((_, i) => i !== index);
    onChange({ ...article, expenseArticleInvoiceEntryTaxes: updatedTaxes });
  };

  const handleAddTax = () => {
    if ((article.expenseArticleInvoiceEntryTaxes?.length || 0) >= taxes.length) {
      toast.warning(tInvoicing('expense_invoice.errors.surpassed_tax_limit'));
      return;
    }
    onChange({
      ...article,
      expenseArticleInvoiceEntryTaxes: [...(article.expenseArticleInvoiceEntryTaxes || []), {} as ExpenseInvoiceTaxEntry]
    });
  };

  const selectedTaxIds = article.expenseArticleInvoiceEntryTaxes?.map((t) => t.tax?.id) || [];

  return (
    <div className={cn('flex flex-row items-center gap-6 h-full', className)}>
      <div className="w-9/12">
        <div className="flex flex-row gap-2 my-1">
          {/* Title */}
<<<<<<< HEAD
          <div className="w-3/5">
           <Label className="mx-1">{tInvoicing('article.attributes.title')}</Label>
            {edit ? (
              <Input
                placeholder="Title"
                value={article.article?.title}
                onChange={handleTitleChange}
              />
            ) : (
              <UneditableInput value={article.article?.title} />
            )}
          </div>
=======
          {/* Dans la partie "Title" du JSX, modifiez comme suit : */}
<div className="w-3/5">
  <Label className="mx-1">{tInvoicing('article.attributes.title')}</Label>
  {edit ? (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Checkbox
          id="use-existing-article"
          checked={useExistingArticle}
          onCheckedChange={(checked) => setUseExistingArticle(!!checked)}
        />
        <Label htmlFor="use-existing-article">
          {tInvoicing('Article Existant')}
        </Label>
      </div>
      {useExistingArticle ? (
        <Select onValueChange={handleSelectArticle}>
          <SelectTrigger>
            <SelectValue placeholder={tInvoicing('Select an article')} />
          </SelectTrigger>
          <SelectContent>
  <div className="p-2">
    <Input
      placeholder={tInvoicing('Search an article...')}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  {loading ? (
  <SelectItem value="loading" disabled>
    {tInvoicing('Loading...')}
  </SelectItem>
) : articles.length > 0 ? (
  articles
    .filter(article => 
      article?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (article.reference && article.reference.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .map((art) => (
      <SelectItem 
        key={art.id} 
        value={art.id.toString()}
        disabled={art.quantityInStock <= 0}
        className={art.quantityInStock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
      >
        <div className="flex justify-between items-center">
          <span>
            {art.title} {art.reference ? `(${art.reference})` : ''}
          </span>
          <span className="text-xs text-muted-foreground ml-2">
            {art.quantityInStock <= 0 ? 
              tInvoicing('out_of_stock') : 
              `${art.quantityInStock} ${tInvoicing('available')}`
            }
          </span>
        </div>
      </SelectItem>
    ))
) : (
  <SelectItem value="no-articles" disabled>
    {tInvoicing('No articles available')}
  </SelectItem>
)}
</SelectContent>
</Select>
) : (
<>
  <Input
    placeholder={tInvoicing('Enter a title')}
    value={article.article?.title || ''}
    onChange={handleTitleChange}
  />
  
  {/* Champ référence corrigé */}
  <div className="flex gap-2 mt-2">
  <div className="flex-1">
    <Input
      placeholder={tInvoicing('reference')}
      value={article.reference || ''}
      onChange={handleReferenceChange}
      pattern="^REF-\d{6}-\d{3}$"
      title={tInvoicing('article.errors.invalid_reference_format')}
    />
  </div>
  <Button 
    type="button"
    variant="outline"
    onClick={generateReference}
    className="whitespace-nowrap"
    disabled={!!article.article?.id}
  >
    {tInvoicing('generate_reference')}
  </Button>
</div>
</>
)}
</div>
) : (
<div className="flex flex-col gap-2">
  <UneditableInput value={article.article?.title || ''} />
  <UneditableInput 
    value={article.reference || tInvoicing('no_reference')}
    placeholder={tInvoicing('no_reference')}
  />
</div>
)}
</div>
>>>>>>> ce6bc78 (DernierVersionFrront)
          {/* Quantity */}
          <div className="w-1/5">
            <Label className="mx-1">{tInvoicing('article.attributes.quantity')}</Label>
            {edit ? (
              <Input
                type="number"
                placeholder="0"
                value={article.quantity}
                onChange={handleQuantityChange}
              />
            ) : (
              <UneditableInput value={article.quantity} />
            )}
          </div>
          {/* Price */}
          <div className="w-1/5">
            <Label className="mx-1">{tInvoicing('article.attributes.unit_price')}</Label>
            <div className="flex items-center gap-2">
              {edit ? (
                <Input
                  type="number"
                  placeholder="0"
                  value={article.unit_price}
                  onChange={handleUnitPriceChange}
                />
              ) : (
                <UneditableInput value={article.unit_price} />
              )}
              <Label className="font-bold mx-1">{currency?.symbol}</Label>
            </div>
          </div>
        </div>
        <div>
          {showDescription && (
            <div>
              {edit ? (
                <>
                  <Label className="mx-1">{tInvoicing('article.attributes.description')}</Label>
                  <Textarea
                    placeholder="Description"
                    className="resize-none"
                    value={article.article?.description}
                    onChange={(e) => handleDescriptionChange(e)}
                    rows={3}
                  />
                </>
              ) : (
                article.article?.description && (
                  <>
                    <Label className="mx-1">{tInvoicing('article.attributes.description')}</Label>
                    <Textarea
                      disabled
                      value={article.article?.description}
                      className="resize-none"
                      onClick={() => {}}
                      rows={3 + (article?.expenseArticleInvoiceEntryTaxes?.length || 0)}
                    />
                  </>
                )
              )}
            </div>
          )}
        </div>
      </div>
      <div className="w-3/12 flex flex-col h-full">
        {/* Taxes */}
        <div className="my-auto">
          <Label className="block my-3">{tInvoicing('article.attributes.taxes')}</Label>
          <ExpenseInvoiceTaxEntries
            article={article}
            taxes={taxes}
            selectedTaxIds={selectedTaxIds}
            currency={currency}
            handleTaxAdd={handleAddTax}
            handleTaxChange={handleTaxChange}
            handleTaxDelete={handleTaxDelete}
            edit={edit}
          />
        </div>

        {/* Discount */}
        <div className="my-auto py-5">
          <Label className="mx-1">{tInvoicing('invoice.attributes.discount')}</Label>
          <div className="flex items-center gap-2">
            {edit ? (
              <Input
                className="w-1/2"
                type="number"
                placeholder="0"
                value={article.discount}
                onChange={handleDiscountChange}
              />
            ) : (
              <UneditableInput className="w-1/2" value={article.discount || '0'} />
            )}
            {edit ? (
              <Select
                onValueChange={handleDiscountTypeChange}
                defaultValue={
                  article.discount_type === DISCOUNT_TYPE.PERCENTAGE ? 'PERCENTAGE' : 'AMOUNT'
                }>
                <SelectTrigger className="w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">%</SelectItem>
                  <SelectItem value="AMOUNT">{currency?.symbol || '$'}</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <UneditableInput
                className="w-1/2 font-bold mx-1"
                value={
                  article.discount_type === DISCOUNT_TYPE.PERCENTAGE ? '%' : currency?.symbol || '$'
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="w-2/12 text-center flex flex-col justify-between h-full gap-12 mx-4">
        <div className="flex flex-col gap-2 my-auto">
          <Label className="font-bold mx-1">{tInvoicing('article.attributes.tax_excluded')}</Label>
          <Label>
            {article?.subTotal?.toFixed(digitAfterComma)} {currencySymbol}
          </Label>
        </div>
        <div className="flex flex-col gap-2 my-auto">
          <Label className="font-bold mx-1">{tInvoicing('article.attributes.tax_included')}</Label>
          <Label>
            {article?.total?.toFixed(digitAfterComma)} {currencySymbol}
          </Label>
        </div>
      </div>
    </div>
  );
};
