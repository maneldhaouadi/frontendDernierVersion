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
  const [history, setHistory] = useState<any[]>([]);

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
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetails();
  }, [id]);

  useEffect(() => {
    if (id) {
      const fetchHistory = async () => {
        try {
          const response = await api.article.getArticleHistory(Number(id));
          setHistory(response);
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'historique:', error);
        }
      };
      fetchHistory();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.article.update(Number(id), formData);
      setArticleDetails({ ...articleDetails, ...formData } as Article);
      setIsEditing(false);
      toast.success('Article mis à jour avec succès');
      router.push(`/article/article-details/${id}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error);
      toast.error('Erreur lors de la mise à jour de l\'article');
    }
  };

  if (loading) return <Spinner size="medium" show={loading} />;
  if (error) return <p className="text-red-500">{error}</p>;
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
                <div>
                  <Label htmlFor="barcode">Code-barres</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    value={articleDetails.barcode || ''}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
                {articleDetails.qrCode && (
                  <div>
                    <Label>QR Code</Label>
                    <img src={articleDetails.qrCode} alt="QR Code" className="mt-1 w-32 h-32" />
                  </div>
                )}
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

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Historique des modifications</h2>
        {history.length > 0 ? (
          <ul className="space-y-2">
            {history.map((entry, index) => (
              <li key={index} className="p-4 bg-gray-50 rounded-lg">
                <p><strong>Version {entry.version}</strong></p>
                <p>Date: {new Date(entry.date).toLocaleString()}</p>
                <ul>
                  {Object.entries(entry.changes).map(([key, value]) => (
                    <li key={key}>
                      {key}: {JSON.stringify(value)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun historique disponible.</p>
        )}
      </div>
    </div>
  );
};

export default ArticleDetails;