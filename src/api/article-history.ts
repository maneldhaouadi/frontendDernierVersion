import { CreateArticleHistoryDto, ResponseArticleHistoryDto } from '@/types/article-history';
import axios from './axios';

/**
 * Crée une nouvelle entrée d'historique pour un article.
 * @param createArticleHistoryDto - Les données de l'entrée d'historique à créer.
 * @returns L'entrée d'historique créée.
 */
const createHistoryEntry = async (
  createArticleHistoryDto: CreateArticleHistoryDto,
): Promise<ResponseArticleHistoryDto> => {
  try {
    const response = await axios.post<ResponseArticleHistoryDto>(
      '/article-history/create',
      createArticleHistoryDto,
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'entrée d'historique:", error);
    throw new Error("Impossible de créer l'entrée d'historique.");
  }
};

/**
 * Récupère l'historique d'un article.
 * @param articleId - L'ID de l'article.
 * @returns La liste des entrées d'historique.
 */
const getArticleHistory = async (articleId: number): Promise<ResponseArticleHistoryDto[]> => {
  try {
    const response = await axios.get<ResponseArticleHistoryDto[]>(
      `/public/article-history/${articleId}/history`,
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique de l'article:", error);
    throw new Error("Impossible de récupérer l'historique de l'article.");
  }
};

/**
 * Génère un fichier PDF pour un article spécifique.
 * @param articleId - L'ID de l'article.
 * @returns Un message de succès ou d'erreur.
 */
const generatePdf = async (articleId: number): Promise<string> => {
  try {
    const response = await axios.get<string>(
      `/public/article-history/${articleId}/generate-files`,
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    throw new Error("Impossible de générer le PDF.");
  }
};

/**
 * Télécharge le fichier PDF pour un article spécifique.
 * @param articleId - L'ID de l'article.
 * @returns Le fichier PDF téléchargé.
 */
const downloadPdf = async (articleId: number): Promise<void> => {
  try {
    const response = await axios.get(`/public/article/${articleId}/download-pdf`, {
      responseType: 'blob', // Indique que la réponse est un fichier binaire (Blob)
    });

    // Créer un lien pour télécharger le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `article_${articleId}_fiche.pdf`); // Nom du fichier
    document.body.appendChild(link);
    link.click();

    // Nettoyer le lien après le téléchargement
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Erreur lors du téléchargement du PDF:", error);
    throw new Error("Impossible de télécharger le PDF.");
  }
};

export const articleHistory = {
  createHistoryEntry,
  getArticleHistory,
  generatePdf,
  downloadPdf,
};