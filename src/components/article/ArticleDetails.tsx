import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api, article } from '@/api';
import { Article } from '@/types';

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

  if (loading) return <p>Chargement...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!articleDetails) return <p>Aucun article trouvé.</p>;

  return (
    <div className="p-3 bg-white shadow-md rounded-lg overflow-y-auto h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-800">Détails de l'article</h1>
        <button
          type="button"
          onClick={toggleEditMode}
          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
        >
          {isEditing ? 'Annuler' : 'Modifier'}
        </button>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Champ Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Titre</label>
          <input
            type="text"
            name="title"
            value={formData.title || ''}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              !isEditing ? 'bg-gray-100' : ''
            }`}
          />
        </div>

        {/* Champ Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              !isEditing ? 'bg-gray-100' : ''
            }`}
          />
        </div>

        {/* Champ Catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          <input
            type="text"
            name="category"
            value={formData.category || ''}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              !isEditing ? 'bg-gray-100' : ''
            }`}
          />
        </div>

        {/* Champ Sous-catégorie */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Sous-catégorie</label>
          <input
            type="text"
            name="subCategory"
            value={formData.subCategory || ''}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              !isEditing ? 'bg-gray-100' : ''
            }`}
          />
        </div>

        {/* Champ Prix d'achat */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Prix d'achat</label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice || ''}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              !isEditing ? 'bg-gray-100' : ''
            }`}
          />
        </div>

        {/* Champ Prix de vente */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Prix de vente</label>
          <input
            type="number"
            name="salePrice"
            value={formData.salePrice || ''}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              !isEditing ? 'bg-gray-100' : ''
            }`}
          />
        </div>

        {/* Champ Quantité en stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantité en stock</label>
          <input
            type="number"
            name="quantityInStock"
            value={formData.quantityInStock || ''}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              !isEditing ? 'bg-gray-100' : ''
            }`}
          />
        </div>

        {/* Champ Code-barres (lecture seule) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Code-barres</label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode || ''}
            readOnly
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
          />
        </div>

        {/* Champ QR Code (lecture seule) */}
        {articleDetails.qrCode && (
          <div>
            <label className="block text-sm font-medium text-gray-700">QR Code</label>
            <img src={articleDetails.qrCode} alt="QR Code" className="mt-1 w-32 h-32" />
          </div>
        )}

        {/* Bouton Valider en mode édition */}
        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Valider
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ArticleDetails;