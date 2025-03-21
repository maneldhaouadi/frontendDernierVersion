import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api, article } from '@/api';
import { Article, UpdateArticleDto } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/common/Spinner';
import { Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const ArticleDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [articleDetails, setArticleDetails] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateArticleDto>({
    title: '',
    description: '',
    category: '',
    subCategory: '',
    purchasePrice: 0,
    salePrice: 0,
    quantityInStock: 0,
    status: '',
  });

  // Fetch article details
  useEffect(() => {
    if (!id) return;

    const fetchArticleDetails = async () => {
      try {
        const response = await article.findOne(Number(id));
        setArticleDetails(response);
        setFormData({
          title: response.title,
          description: response.description,
          category: response.category,
          subCategory: response.subCategory,
          purchasePrice: response.purchasePrice,
          salePrice: response.salePrice,
          quantityInStock: response.quantityInStock,
          status: response.status,
        });
      } catch (error) {
        setError('Impossible de récupérer les détails de l\'article.');
        toast.error('Erreur lors de la récupération des détails de l\'article.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetails();
  }, [id]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'purchasePrice' || name === 'salePrice' || name === 'quantityInStock'
        ? Number(value) // Convertir en nombre pour les champs numériques
        : value,
    }));
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
      // Reset form data to original article details when canceling edit mode
      setFormData({
        title: articleDetails?.title || '',
        description: articleDetails?.description || '',
        category: articleDetails?.category || '',
        subCategory: articleDetails?.subCategory || '',
        purchasePrice: articleDetails?.purchasePrice || 0,
        salePrice: articleDetails?.salePrice || 0,
        quantityInStock: articleDetails?.quantityInStock || 0,
        status: articleDetails?.status || '',
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Données envoyées:', formData); // Afficher les données dans la console

      // Convertir les champs numériques en nombres
      const payload = {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        salePrice: Number(formData.salePrice),
        quantityInStock: Number(formData.quantityInStock),
      };

      // Appeler l'API pour mettre à jour l'article
      const updatedArticle = await api.article.update(Number(id), payload);

      // Mettre à jour l'état local avec les nouvelles données
      setArticleDetails(updatedArticle);
      setFormData({
        title: updatedArticle.title,
        description: updatedArticle.description,
        category: updatedArticle.category,
        subCategory: updatedArticle.subCategory,
        purchasePrice: updatedArticle.purchasePrice,
        salePrice: updatedArticle.salePrice,
        quantityInStock: updatedArticle.quantityInStock,
        status: updatedArticle.status,
      });

      // Désactiver le mode édition
      setIsEditing(false);

      // Afficher un message de succès
      toast.success('Article mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error);
      toast.error('Erreur lors de la mise à jour de l\'article.');
    }
  };

  // Display loading spinner
  if (loading) return <Spinner size="medium" show={loading} />;

  // Display error message
  if (error) return <p className="text-red-500">{error}</p>;

  // Display message if no article is found
  if (!articleDetails) return <p>Aucun article trouvé.</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Détails de l'article</h1>
        <Button
          variant={isEditing ? 'secondary' : 'default'}
          onClick={toggleEditMode}
          className="flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <X className="h-4 w-4" />
              Annuler
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Modifier
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="subCategory">Sous-catégorie</Label>
                  <Input
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="purchasePrice">Prix d'achat</Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="salePrice">Prix de vente</Label>
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="quantityInStock">Quantité en stock</Label>
                  <Input
                    id="quantityInStock"
                    name="quantityInStock"
                    type="number"
                    value={formData.quantityInStock}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="flex justify-end">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Valider
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleDetails;