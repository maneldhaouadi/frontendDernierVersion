import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Article } from '@/types';
import { article } from '@/api';

const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [newArticle, setNewArticle] = useState<Article>({
    id: 0,
    title: '',
    description: '',
  });
  const [showForm, setShowForm] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setFormError(null);
      try {
        const response = await article.findPaginated(1, 5, 'ASC', 'title');
        setArticles(response.data);
      } catch (error) {
        setFormError('Impossible de récupérer les articles. Veuillez réessayer plus tard.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleChangeNewArticle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewArticle({
      ...newArticle,
      [e.target.name]: e.target.value || '',
    });
  };

  const handleAddNewArticle = async () => {
    if (!newArticle.title.trim() || !newArticle.description.trim()) {
      setFormError('Le titre et la description doivent être remplis.');
      return;
    }

    setLoading(true);
    setFormError(null);

    try {
      const response = await article.createWithFilterTitle(newArticle);

      if (response.error && response.error === 'Article exists') {
        setFormError('Un article avec ce titre existe déjà sur le serveur.');
      } else if (response.success) {
        setArticles([newArticle, ...articles]);
        setNewArticle({ id: 0, title: '', description: '' });
        setTimeout(() => setShowForm(false), 100);
      } else {
        setFormError("Erreur lors de l'ajout de l'article. Veuillez réessayer plus tard.");
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article:', error);
      setFormError("Échec de l'ajout de l'article. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    setLoading(true);
    try {
      await article.remove(id);
      setArticles(articles.filter((article) => article.id !== id));
    } catch (error) {
      setFormError('Impossible de supprimer l\'article. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 bg-white shadow-md rounded-lg relative">
      <h1 className="text-xl font-semibold text-gray-800">Articles</h1>

      <button 
        onClick={() => setShowForm(!showForm)} 
        className="absolute top-1 right-3 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        disabled={loading}
      >
        {showForm ? 'Masquer' : 'Ajouter'}
      </button>

      {showForm && (
        <div className="mb-3 p-3 rounded bg-gray-100 mt-6 border border-gray-300">
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              name="title"
              value={newArticle.title}
              onChange={handleChangeNewArticle}
              className="w-full h-9 px-3 py-1 border rounded-md text-gray-600"
              placeholder="Titre"
            />
            <textarea
              name="description"
              value={newArticle.description}
              onChange={handleChangeNewArticle}
              className="w-full h-9 px-3 py-1 border rounded-md text-gray-600"
              placeholder="Description"
            />
            <button
              onClick={handleAddNewArticle}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={loading}
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-gray-500 text-sm">Chargement...</p>}

      <div className="overflow-hidden rounded-lg border-2 border-gray-300">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-gray-700 font-medium">Titre</th>
              <th className="px-3 py-2 text-gray-700 font-medium">Description</th>
              <th className="px-3 py-2 text-gray-700 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-2 text-gray-500 text-sm">Aucun article.</td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-3 py-2 text-gray-800">{article.title}</td>
                  <td className="px-3 py-2 text-gray-600 truncate max-w-xs">{article.description}</td>
                  <td className="px-3 py-2">
                    <button 
                      onClick={() => handleDeleteArticle(article.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleList;
