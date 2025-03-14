import React, { useEffect, useState } from 'react';
import { articleHistory } from '@/api/article-history';
import { ResponseArticleHistoryDto } from '@/types/article-history';

interface ArticleHistoryListProps {
  articleId: number; // ID de l'article dont on veut afficher l'historique
}

const ArticleHistoryList: React.FC<ArticleHistoryListProps> = ({ articleId }) => {
  const [history, setHistory] = useState<ResponseArticleHistoryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction pour récupérer l'historique de l'article
  const fetchArticleHistory = async () => {
    try {
      const data = await articleHistory.getArticleHistory(articleId);
      setHistory(data);
      setError(null);
    } catch (err) {
      setError("Impossible de récupérer l'historique de l'article.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour voir le PDF
  const handleViewPdf = async (articleId: number) => {
    try {
      const pdfUrl = await articleHistory.generatePdf(articleId);
      window.open(pdfUrl, '_blank'); // Ouvre le PDF dans un nouvel onglet
    } catch (err) {
      console.error("Erreur lors de l'ouverture du PDF:", err);
      alert("Impossible d'ouvrir le PDF.");
    }
  };

  // Fonction pour télécharger le PDF
  const handleDownloadPdf = async (articleId: number) => {
    try {
      await articleHistory.downloadPdf(articleId);
    } catch (err) {
      console.error("Erreur lors du téléchargement du PDF:", err);
      alert("Impossible de télécharger le PDF.");
    }
  };

  // Charger l'historique au montage du composant
  useEffect(() => {
    fetchArticleHistory();
  }, [articleId]);

  if (loading) {
    return <div className="text-center text-gray-600 p-4">Chargement de l'historique...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (history.length === 0) {
    return <div className="text-center text-gray-600 p-4">Aucun historique trouvé pour cet article.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Historique des modifications de l'article</h2>

      {/* Tableau des historiques */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">Version</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">Modifications</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600">Actions</th> {/* Nouvelle colonne pour les actions */}
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-3 text-sm text-gray-700">Version {entry.version}</td>
                <td className="p-3 text-sm text-gray-700">{new Date(entry.date).toLocaleString()}</td>
                <td className="p-3 text-sm text-gray-700">
                  <ul className="space-y-2">
                    {Object.entries(entry.changes).map(([field, change]) => (
                      <li key={field}>
                        <strong className="text-gray-600">{field}:</strong>{' '}
                        <span className="text-gray-500">{change.oldValue}</span>{' '}
                        <span className="text-gray-400">→</span>{' '}
                        <span className="text-gray-500">{change.newValue}</span>
                      </li>
                    ))}
                  </ul>
                </td>
                <td className="p-3 text-sm text-gray-700">
                  <div className="flex space-x-2">
                    {/* Bouton pour voir le PDF */}
                    <button
                      onClick={() => handleViewPdf(articleId)}
                      className="p-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition-colors"
                      title="Voir le PDF"
                    >
                      Voir le PDF
                    </button>

                    {/* Bouton pour télécharger le PDF */}
                    <button
                      onClick={() => handleDownloadPdf(articleId)}
                      className="p-2 bg-green-500 text-white rounded hover:bg-green-700 transition-colors"
                      title="Télécharger le PDF"
                    >
                      Télécharger
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ArticleHistoryList;