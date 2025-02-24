import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { article } from '@/api';
import { CreateArticleDto } from '@/types';

const CreateArticle: React.FC = () => {
  const [formData, setFormData] = useState<CreateArticleDto>({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await article.create(formData);
      router.push('/article/article-Lists');
    } catch (error) {
      setError("Échec de la création de l'article. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-xl max-w-md mx-auto">
      <h1 className="text-lg font-bold text-gray-800 mb-4">Créer un nouvel article</h1>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Titre</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-800 focus:border-blue-800"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-800 focus:border-blue-800"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-800 text-white rounded-md shadow-md hover:bg-blue-900 transition"
          disabled={loading}
        >
          {loading ? 'Ajout en cours...' : 'Ajouter'}
        </button>
      </form>
    </div>
  );
};

export default CreateArticle;