import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { article } from '@/api';
import { CreateArticleDto } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const CreateArticle: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [formData, setFormData] = useState<CreateArticleDto>({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    purchasePrice: 0,
    salePrice: 0,
    quantityInStock: 0,
    barcode: '',
    status: '', // Initialize status as an empty string
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'purchasePrice' || name === 'salePrice' || name === 'quantityInStock' ? Number(value) : value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      console.log('Données envoyées au serveur :', formData); // Debugging
      const result = await article.createWithFilterTitle(formData);
      if (result) {
        toast.success('Article créé avec succès');
        router.push('/article/article-Lists');
      } else {
        toast.error('Un article avec ce titre existe déjà');
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'article :', error); // Debugging
      setError('Erreur lors de la création de l\'article');
      toast.error('Erreur lors de la création de l\'article');
    } finally {
      setLoading(false);
    }
  };

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
  };

  return (
    <div className={cn('overflow-auto px-10 py-6')}>
      <div className={cn('block xl:flex gap-4')}>
        <div className="w-full h-auto flex flex-col xl:w-9/12">
          <ScrollArea className="max-h-[calc(100vh-120px)] border rounded-lg">
            <Card className="border-0 p-2">
              <CardContent className="p-5">
                <h2 className="text-xl font-bold mb-5">Créer un article</h2>

                <div className="pb-5 border-b">
                  <label className="block mb-2 font-medium">Titre de l'article</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Titre de l'article"
                    className="mb-3"
                  />

                  <label className="block mb-2 font-medium">Description de l'article</label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Description de l'article"
                    className="mb-3"
                    rows={4}
                  />

                  <label className="block mb-2 font-medium">Catégorie</label>
                  <Input
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    placeholder="Catégorie"
                    className="mb-3"
                  />

                  <label className="block mb-2 font-medium">Sous-catégorie</label>
                  <Input
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    placeholder="Sous-catégorie"
                    className="mb-3"
                  />

                  <label className="block mb-2 font-medium">Prix d'achat</label>
                  <Input
                    name="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    placeholder="Prix d'achat"
                    className="mb-3"
                  />

                  <label className="block mb-2 font-medium">Prix de vente</label>
                  <Input
                    name="salePrice"
                    type="number"
                    value={formData.salePrice}
                    onChange={handleChange}
                    placeholder="Prix de vente"
                    className="mb-3"
                  />

                  <label className="block mb-2 font-medium">Quantité en stock</label>
                  <Input
                    name="quantityInStock"
                    type="number"
                    value={formData.quantityInStock}
                    onChange={handleChange}
                    placeholder="Quantité en stock"
                    className="mb-3"
                  />

                  <label className="block mb-2 font-medium">Code-barres</label>
                  <Input
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    placeholder="Code-barres"
                    className="mb-3"
                  />

                  {/* Status dropdown */}
                  <label className="block mb-2 font-medium">Statut</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mb-3 p-2 border rounded"
                  >
                    <option value="">Sélectionnez le statut</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="pending">En attente</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>

        <div className="w-full xl:mt-0 xl:w-3/12">
          <ScrollArea className="h-fit border rounded-lg">
            <Card className="border-0">
              <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={handleSubmit}
                    //loading={loading}
                    disabled={loading}
                    className="w-full"
                  >
                    {t('common.create')}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="secondary"
                    className="w-full"
                  >
                    {t('common.reset')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CreateArticle;
