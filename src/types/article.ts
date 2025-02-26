import { PagedResponse } from './response';
import { DatabaseEntity } from './response/DatabaseEntity';

// L'interface `Article` rend `id` obligatoire en cas de retour ou d'affichage des articles
export interface Article extends DatabaseEntity {
  id: number;  // L'ID est obligatoire ici pour les articles existants
  title?: string;
  description?: string;
}

// Création d'un article sans `id` car c'est généré par le backend
export interface CreateArticleDto extends Omit<Article, 'id'> {}

// Réponse d'un article où `id` est obligatoire et `description` est omis
export interface ResponseArticleDto extends Omit<Article, 'description'> {
  id: number;  // L'ID est obligatoire pour les articles dans la réponse
}

// Représentation paginée des articles
export interface PagedArticle extends PagedResponse<Article> {}
