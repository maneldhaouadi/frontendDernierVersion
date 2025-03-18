import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api, article } from '@/api';
import { Article } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/common/Spinner';
import { Edit, Save, X } from 'lucide-react'; // Import des icônes

const ArticleDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Récupérer l'ID de l'article depuis l'URL
  const [articleDetails, setArticleDetails] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); // État pour gérer le mode d'édition
  const [formData, setFormData] = useState<Partial<Article>>({}); // État pour stocker les modifications

  useEffect(() => {
    if (!id) return; // Attendre que l'ID soit disponible

    const fetchArticleDetails = async () => {
      try {
        const response = await article.findOne(Number(id)); // Utilisez l'ID pour récupérer l'article
        setArticleDetails(response);
        setFormData(response); // Initialiser les données du formulaire
      } catch (error) {
        setError('Impossible de récupérer les détails de l\'article.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleDetails();
  }, [id]);

  // Gérer les changements dans les champs du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Basculer entre les modes "lecture seule" et "édition"
  const toggleEditMode = () => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
      setFormData(articleDetails || {}); // Réinitialiser les modifications si on annule
    }
  };

  // Soumettre les modifications
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Envoyer les modifications au serveur
      await api.article.update(Number(id), formData);
      setArticleDetails(formData as Article); // Mettre à jour les détails de l'article
      setIsEditing(false); // Revenir en mode "lecture seule"
    } catch (error) {
      setError('Erreur lors de la mise à jour de l\'article.');
    }
  };

  if (loading) return <Spinner size="medium" show={loading} />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!articleDetails) return <p>Aucun article trouvé.</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* En-tête de la section */}
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

      {/* Formulaire de détails */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grille pour les champs du formulaire */}
            <div className="grid grid-cols-2 gap-4">
              {/* Colonne de gauche */}
              <div className="space-y-4">
                {/* Champ : Titre */}
                <div>
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>

                {/* Champ : Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>

                {/* Champ : Catégorie */}
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>

                {/* Champ : Sous-catégorie */}
                <div>
                  <Label htmlFor="subCategory">Sous-catégorie</Label>
                  <Input
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>
              </div>

              {/* Colonne de droite */}
              <div className="space-y-4">
                {/* Champ : Prix d'achat */}
                <div>
                  <Label htmlFor="purchasePrice">Prix d'achat</Label>
                  <Input
                    id="purchasePrice"
                    name="purchasePrice"
                    type="number"
                    value={formData.purchasePrice || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>

                {/* Champ : Prix de vente */}
                <div>
                  <Label htmlFor="salePrice">Prix de vente</Label>
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="number"
                    value={formData.salePrice || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>

                {/* Champ : Quantité en stock */}
                <div>
                  <Label htmlFor="quantityInStock">Quantité en stock</Label>
                  <Input
                    id="quantityInStock"
                    name="quantityInStock"
                    type="number"
                    value={formData.quantityInStock || ''}
                    onChange={handleInputChange}
                    readOnly={!isEditing}
                    className={!isEditing ? 'bg-gray-100' : ''}
                  />
                </div>

                {/* Champ : Code-barres (lecture seule) */}
                <div>
                  <Label htmlFor="barcode">Code-barres</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    value={formData.barcode || ''}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>

                {/* Champ : QR Code (lecture seule) */}
                {articleDetails.qrCode && (
                  <div>
                    <Label>QR Code</Label>
                    <img src={articleDetails.qrCode} alt="QR Code" className="mt-1 w-32 h-32" />
                  </div>
                )}
              </div>
            </div>

            {/* Bouton Valider en mode édition */}
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