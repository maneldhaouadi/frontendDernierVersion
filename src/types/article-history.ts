import { Article } from './article'; // Assurez-vous que l'interface Article est importée

export interface ArticleHistory {
  id: number;
  version: number;
  changes: Record<string, { oldValue: any; newValue: any }>;
  date: Date;
  articleId: number;
  article?: Article;
}

export interface CreateArticleHistoryDto extends Omit<ArticleHistory, 'id' | 'date' | 'article'> {
  // Ajoutez ici des champs spécifiques à la création si nécessaire
}

export interface ResponseArticleHistoryDto extends Omit<ArticleHistory, 'article'> {
  id: number;
}

// Interface pour la mise à jour d'un article