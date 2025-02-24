import axios from './axios';
import { Article, CreateArticleDto, PagedArticle } from '@/types';

// Fonction de récupération paginée des articles
const findPaginated = async (
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string,
  search: string = '',
  relations: string[] = []
): Promise<PagedArticle> => { 

  const generalFilter = search ? `title||$cont||${search}` : '';  // Filtre de recherche
  const filters = generalFilter ? `filter=${generalFilter}` : '';  // Ajout du filtre

  try {
    const response = await axios.get<PagedArticle>(
      `/public/article/list?sort=${sortKey},${order}&${filters}&limit=${size}&page=${page}&join=${relations.join(',')}`
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des articles paginés:", error);
    throw new Error("Impossible de récupérer les articles.");
  }
};

// Autres méthodes CRUD pour l'article
const findOne = async (id: number): Promise<Article> => {
  const response = await axios.get<Article>(`/public/article/${id}`);
  return response.data;
};

const create = async (article: CreateArticleDto): Promise<Article> => {
  const response = await axios.post<Article>('/public/article/save', article);
  return response.data;
};

// Nouvelle méthode pour enregistrer un article en vérifiant si le titre existe déjà
const createWithFilterTitle = async (article: CreateArticleDto): Promise<Article | null> => {
  try {
    const response = await axios.post<Article>('/public/article/save-with-filter-title', article);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création de l'article avec filtre de titre:", error);
    return null; // Retourne null si l'article existe déjà
  }
};

const remove = async (id: number): Promise<Article> => {
  const response = await axios.delete<Article>(`/public/article/delete/${id}`);
  return response.data;
};

export const article = {
  findPaginated,
  findOne,
  create,
  createWithFilterTitle,  // Ajout de la nouvelle méthode
  remove,
};
