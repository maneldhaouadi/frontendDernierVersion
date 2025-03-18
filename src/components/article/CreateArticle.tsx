import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { article } from '@/api';
import { CreateArticleDto } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/common/Spinner';
import { useBreadcrumb } from '@/components/layout/BreadcrumbContext';
import { PageHeader } from '@/components/common/PageHeader';
import { BreadcrumbCommon } from '../common';

const CreateArticle: React.FC = () => {
  const { t: tCommon } = useTranslation('common');
  const { t: tArticle } = useTranslation('article');
  const router = useRouter();
  const { setRoutes } = useBreadcrumb();

  // Configuration du fil d'Ariane
  useEffect(() => {
    setRoutes([
      { title: tCommon('menu.inventory'), href: '/inventory' },
      { title: tCommon('submenu.articles'), href: '/inventory/articles' },
      { title: tCommon('commands.create') },
    ]);
  }, [router.locale]);

  // États pour les champs du formulaire
  const [formData, setFormData] = useState<CreateArticleDto>({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    purchasePrice: 0,
    salePrice: 0,
    quantityInStock: 0,
    barcode: '',
    status: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Gestion des changements de formulaire
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        name === 'purchasePrice' || name === 'salePrice' || name === 'quantityInStock'
          ? Number(value)
          : value,
    }));
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError(tArticle('article.validation.title_required'));
      return false;
    }
    if (formData.salePrice < 0 || formData.purchasePrice < 0 || formData.quantityInStock < 0) {
      setError(tArticle('article.validation.invalid_number'));
      return false;
    }
    setError(null);
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await article.createWithFilterTitle(formData);
      if (result) {
        toast.success(tArticle('article.action_create_success'));
        router.push('/inventory/articles');
      } else {
        toast.error(tArticle('article.action_create_duplicate_title'));
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'article :', error);
      setError(tArticle('article.action_create_failure'));
      toast.error(tArticle('article.action_create_failure'));
    } finally {
      setLoading(false);
    }
  };

  // Réinitialisation du formulaire
  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      subCategory: '',
      purchasePrice: 0,
      salePrice: 0,
      quantityInStock: 0,
      barcode: '',
      status: '',
    });
    setError(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
     
      
      {/* Carte principale */}
      <Card>
        <CardHeader>
          <CardTitle>{tArticle('article.create_title')}</CardTitle>
          <CardDescription>{tArticle('article.create_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Formulaire de création */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grille pour les champs du formulaire */}
            <div className="grid grid-cols-2 gap-4">
              {/* Colonne de gauche */}
              <div className="space-y-4">
                {/* Champ : Titre */}
                <div>
                  <Label htmlFor="title">{tArticle('article.attributes.title')}</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder={tArticle('article.attributes.title_placeholder')}
                    required
                  />
                </div>

                {/* Champ : Description */}
                <div>
                  <Label htmlFor="description">{tArticle('article.attributes.description')}</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder={tArticle('article.attributes.description_placeholder')}
                    rows={4}
                  />
                </div>

                {/* Champ : Catégorie */}
                <div>
                  <Label htmlFor="category">{tArticle('article.attributes.category')}</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder={tArticle('article.attributes.category_placeholder')}
                  />
                </div>

                {/* Champ : Sous-catégorie */}
                <div>
                  <Label htmlFor="subCategory">{tArticle('article.attributes.sub_category')}</Label>
                  <Input
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    placeholder={tArticle('article.attributes.sub_category_placeholder')}
                  />
                </div>
              </div>

              {/* Colonne de droite */}
              <div className="space-y-4">
                {/* Champ : Prix d'achat */}
                <div>
                  <Label htmlFor="purchasePrice">{tArticle('article.attributes.purchase_price')}</Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder={tArticle('article.attributes.purchase_price_placeholder')}
                  />
                </div>

                {/* Champ : Prix de vente */}
                <div>
                  <Label htmlFor="salePrice">{tArticle('article.attributes.sale_price')}</Label>
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    value={formData.salePrice}
                    onChange={handleChange}
                    placeholder={tArticle('article.attributes.sale_price_placeholder')}
                  />
                </div>

                {/* Champ : Quantité en stock */}
                <div>
                  <Label htmlFor="quantityInStock">{tArticle('article.attributes.quantity_in_stock')}</Label>
                  <Input
                    id="quantityInStock"
                    name="quantityInStock"
                    type="number"
                    value={formData.quantityInStock}
                    onChange={handleChange}
                    placeholder={tArticle('article.attributes.quantity_in_stock_placeholder')}
                  />
                </div>

                {/* Champ : Code-barres */}
                <div>
                  <Label htmlFor="barcode">{tArticle('article.attributes.barcode')}</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder={tArticle('article.attributes.barcode_placeholder')}
                  />
                </div>

                {/* Champ : Statut */}
                <div>
                  <Label htmlFor="status">{tArticle('article.attributes.status')}</Label>
                  <Select
                    name="status"
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={tArticle('article.attributes.status_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{tArticle('article.status.active')}</SelectItem>
                      <SelectItem value="inactive">{tArticle('article.status.inactive')}</SelectItem>
                      <SelectItem value="pending">{tArticle('article.status.pending')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Affichage des erreurs */}
            {error && <div className="text-red-500 text-sm col-span-2">{error}</div>}

            {/* Boutons de soumission et réinitialisation */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner size="small" show={loading} /> : tCommon('commands.create')}
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset}>
                {tCommon('commands.reset')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateArticle;