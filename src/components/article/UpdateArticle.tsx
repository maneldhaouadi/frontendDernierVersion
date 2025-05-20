import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { api, article } from '@/api';
import { Article, UpdateArticleDto, ArticleStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/common/Spinner';
import { Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'active', label: 'Actif' },
  { value: 'inactive', label: 'Inactif' },
  { value: 'archived', label: 'Archivé' },
  { value: 'out_of_stock', label: 'Rupture de stock' }
];

const ArticleEdit: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [articleDetails, setArticleDetails] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateArticleDto>({
    title: '',
    description: '',
    reference: '',
    quantityInStock: 0,
    status: 'draft',
    unitPrice: 0,
    notes: '',
    version: 1
  });

  useEffect(() => {
    if (!id) return;

    const fetchArticleDetails = async () => {
      try {
        setLoading(true);
        const response = await article.findOne(Number(id));
        setArticleDetails(response);
        setFormData({
          title: response.title || '',
          description: response.description || '',
          reference: response.reference,
          quantityInStock: response.quantityInStock,
          status: response.status,
          unitPrice: response.unitPrice,
          notes: response.notes || '',
          version: response.version || 1
        });
      } catch (error) {
        setError('Could not fetch article details');
        toast.error('Error fetching article details');
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetails();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantityInStock' || name === 'unitPrice' || name === 'version'
        ? Number(value)
        : value,
    }));
  };

  const handleStatusChange = (value: ArticleStatus) => {
    setFormData(prev => ({
      ...prev,
      status: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      toast.error('Le titre est obligatoire');
      return false;
    }
    if (!formData.reference.trim()) {
      toast.error('La référence est obligatoire');
      return false;
    }
    if (formData.unitPrice < 0) {
      toast.error('Le prix unitaire doit être positif');
      return false;
    }
    if (formData.quantityInStock < 0) {
      toast.error('La quantité en stock doit être positive');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      console.log('Submitting data:', formData); // Debug log

      // Ne pas envoyer la version car elle est gérée par le backend
      const { version, ...dataToSend } = formData;

      const updatedArticle = await api.article.update(Number(id), {
        ...dataToSend,
        unitPrice: Number(dataToSend.unitPrice),
        quantityInStock: Number(dataToSend.quantityInStock)
      });

      setArticleDetails(updatedArticle);
      toast.success('Article mis à jour avec succès');
      router.push(`/article/article-details/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || 'Échec de la mise à jour';
        console.error('Update error details:', error.response?.data);
        toast.error(`Erreur: ${errorMessage}`);
      } else {
        console.error('Update error:', error);
        toast.error('Une erreur inattendue est survenue');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Voulez-vous vraiment annuler les modifications non enregistrées ?')) {
      router.push(`/article/article-details/${id}`);
    }
  };

  if (loading) return <Spinner size="medium" show={loading} />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!articleDetails) return <p>Aucun article trouvé</p>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Modifier l'article</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{
                backgroundColor: 
                  formData.status === 'draft' ? '#6b7280' :
                  formData.status === 'active' ? '#10b981' :
                  formData.status === 'inactive' ? '#ef4444' :
                  formData.status === 'archived' ? '#8b5cf6' :
                  formData.status === 'out_of_stock' ? '#f59e0b' :
                  '#9ca3af'
              }}></span>
              {statusOptions.find(opt => opt.value === formData.status)?.label || formData.status}
            </Badge>
            <Badge variant="outline">
              Version: {formData.version}
            </Badge>
            <Badge variant="outline">
              Ref: {formData.reference}
            </Badge>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-2"
            disabled={submitting}
          >
            <X className="h-4 w-4" />
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <Spinner size="small" />
            ) : (
              <>
                <Save className="h-4 w-4" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titre*</Label>
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="reference">Référence*</Label>
                      <Input
                        id="reference"
                        name="reference"
                        value={formData.reference}
                        onChange={handleInputChange}
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="unitPrice">Prix unitaire*</Label>
                      <Input
                        id="unitPrice"
                        name="unitPrice"
                        type="number"
                        value={formData.unitPrice}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantityInStock">Quantité en stock*</Label>
                      <Input
                        id="quantityInStock"
                        name="quantityInStock"
                        type="number"
                        value={formData.quantityInStock}
                        onChange={handleInputChange}
                        required
                        min="0"
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        name="version"
                        type="number"
                        value={formData.version}
                        readOnly
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Statut</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={handleStatusChange}
                        disabled={submitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                onClick={handleSubmit}
                className="w-full flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <Spinner size="small" />
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="w-full flex items-center gap-2"
                disabled={submitting}
              >
                <X className="h-4 w-4" />
                Annuler
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArticleEdit;