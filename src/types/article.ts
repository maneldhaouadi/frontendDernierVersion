import { PagedResponse } from './response';
import { DatabaseEntity } from './response/DatabaseEntity';

// Interface de base pour un article
export interface Article extends DatabaseEntity {
  id: number; // L'ID est obligatoire pour les articles existants
  title: string;
  description: string;
  category: string;
  subCategory: string;
  purchasePrice: number;
  salePrice: number;
  quantityInStock: number;
  qrCode?: string; // Ajout du champ QR Code
  barcode?: string; // Ajout du champ code-barres
  status?: string; // Ajout du champ statut (ex: "draft", "available")
  version?: number; // Ajout du champ version pour le suivi des modifications
  history?: Array<{ // Ajout du champ historique des modifications
    version: number;
    changes: Record<string, { oldValue: any; newValue: any }>;
    date: Date;
  }>;
}

// DTO pour la création d'un article (sans ID)
export interface CreateArticleDto extends Omit<Article, 'id' | 'history'> {
  // Ajoutez ici des champs spécifiques à la création si nécessaire
}

// DTO pour la réponse d'un article (avec ID et sans description optionnelle)
export interface ResponseArticleDto extends Omit<Article, 'description'> {
  id: number; // L'ID est obligatoire pour les articles dans la réponse
}


export interface UpdateArticleDto extends Partial<Article> {
  // Vous pouvez ajouter des champs spécifiques à la mise à jour si nécessaire
}


// Représentation paginée des articles
export interface PagedArticle extends PagedResponse<Article> {}

// Interface pour la recherche par QR Code
export interface QrCodeSearchResponse {
  article?: Article;
  message?: string;
}

// Interface pour la recherche par code-barres
export interface BarcodeSearchResponse {
  article?: Article;
  message?: string;
}