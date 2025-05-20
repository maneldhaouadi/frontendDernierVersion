import { PagedResponse } from './response';
import { DatabaseEntity } from './response/DatabaseEntity';

/**
 * Statuts possibles des articles
 */
export type ArticleStatus = 
  | 'draft' 
  | 'active' 
  | 'inactive' 
  | 'archived' 
  | 'out_of_stock' 
  | 'pending_review' 
  | 'deleted';

/**
 * Interface pour le fichier justificatif
 */
export interface JustificatifFile {
  data: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  originalname?: string;
  buffer?: Buffer;
}

/**
 * Historique des modifications d'un article
 */
export interface ArticleHistory {
  version: number;
  changes: Record<string, { oldValue: any; newValue: any }>;
  date: Date;
  changedBy?: string;
  articleId?: number;
}

/**
 * Interface de base pour un article
 */
export interface Article {
  id: number;
  title: string | null;
  description: string | null;
  reference: string;
  quantityInStock: number;
  status: ArticleStatus;
  version: number;
  notes: string | null;
  justificatifFile?: JustificatifFile;
  justificatifFileName?: string;
  justificatifMimeType?: string;
  justificatifFileSize?: number;
  unitPrice: number;
  history?: ArticleHistory[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * DTO pour la création d'un article
 */
export interface CreateArticleDto {
  title?: string;
  description?: string;
  reference: string;
  quantityInStock: number;
  status?: ArticleStatus;
  notes?: string;
  justificatifFile?: Express.Multer.File;
  unitPrice: number;
}

/**
 * DTO pour la réponse d'un article
 */
export interface ResponseArticleDto {
  id: number;
  title?: string;
  description?: string;
  reference: string;
  quantityInStock: number;
  status: ArticleStatus;
  version: number;
  notes?: string;
  justificatifFile?: JustificatifFile;
  justificatifFileName?: string;
  justificatifMimeType?: string;
  justificatifFileSize?: number;
  unitPrice: number;
  history?: ArticleHistory[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/**
 * DTO pour la mise à jour d'un article
 */
export interface UpdateArticleDto extends Partial<CreateArticleDto> {
  version?: number;
}

/**
 * Représentation paginée des articles
 */
export interface PagedArticle extends PagedResponse<Article> {}

/**
 * Données extraites d'un article (OCR/PDF)
 */
export interface ArticleExtractedData {
  title?: string;
  description?: string;
  reference?: string;
  quantityInStock?: number;
  status?: ArticleStatus;
  unitPrice?: number;
  notes?: string;
  rawText?: string;
  confidenceScores?: {
    title?: number;
    reference?: number;
    quantity?: number;
    price?: number;
    [key: string]: number | undefined;
  };
}


interface ArticleStatusUpdateResponse {
  id: number;
  status: ArticleStatus;
  previousStatus: ArticleStatus;
  updatedAt: Date;
}

interface VersionRestoreResponse {
  id: number;
  version: number;
  restoredFields: string[];
}

/**
 * Résultat de comparaison d'un champ
 */
export interface FieldComparisonResult {
  field: string;
  match: boolean;
  articleValue: any;
  extractedValue: any;
  confidence?: number;
}

/**
 * Résultat de comparaison d'un article
 */
export interface ArticleComparisonResult {
  article: Article;
  sourceType: 'pdf' | 'image' | 'ocr';
  sourceName: string;
  matches: Record<string, boolean>;
  differences: Record<string, {
    articleValue: any;
    extractedValue: any;
  }>;
  similarityScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  processingTimeMs?: number;
  fieldResults: FieldComparisonResult[];
  extractedData?: ArticleExtractedData;
}

/**
 * DTO de réponse pour la comparaison d'articles
 */
export interface ArticleCompareResponseDto {
  success: boolean;
  comparison?: ArticleComparisonResult;
  error?: string;
  warnings?: string[];
}

/**
 * Résultat de traitement OCR
 */
export interface OcrProcessingResult {
  text: string;
  confidence: number;
  imageMetrics?: {
    sharpness: number;
    contrast: number;
    brightness: number;
  };
  language?: string;
}

/**
 * Résultat d'extraction PDF
 */
export interface PdfExtractionResult extends ArticleExtractedData {
  pagesProcessed: number;
  extractionMethod: 'text' | 'table' | 'mixed';
  metadata?: Record<string, any>;
}

/**
 * Suggestion de référence
 */
export interface ReferenceSuggestion {
  reference: string;
  similarity: number;
  existing?: boolean;
  matchType?: 'exact' | 'partial' | 'fuzzy';
}

/**
 * Résultat de validation de référence
 */
export interface ReferenceValidationResult {
  valid: boolean;
  suggestedReferences?: ReferenceSuggestion[];
  exactMatch?: boolean;
  existingId?: number;
}

/**
 * Info de version d'article
 */
export interface ArticleVersionInfo {
  version: number;
  date: Date;
  changesSummary: string[];
  changedBy?: string;
  changesCount?: number;
}

/**
 * Réponse des versions d'article
 */
export interface ArticleVersionsResponse {
  currentVersion: number;
  availableVersions: ArticleVersionInfo[];
  totalVersions: number;
}

/**
 * Score de qualité d'article
 */
export interface ArticleQualityScore {
  id: number;
  reference: string;
  title?: string;
  score: number; // 0-100
  missingFields: string[];
  completeness: 'complete' | 'partial' | 'incomplete';
}

/**
 * Article suspect
 */
export interface SuspiciousArticle {
  id: number;
  reference: string;
  title?: string;
  issue: 'zero_price' | 'high_stock' | 'invalid_reference' | 'inactive_with_stock';
  value?: number;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Statistiques d'articles
 */
export interface ArticleStats {
  totalArticles: number;
  statusDistribution: Record<ArticleStatus, number>;
  outOfStockCount: number;
  totalStockValue: number;
  averageStockPerArticle: number;
  lowStockCount: number;
  stockHealth: {
    healthy: number;
    warning: number;
    critical: number;
  };
}

/**
 * DTO de réponse des statistiques d'articles
 */
export interface ArticleStatsResponseDto extends ArticleStats {
  statusPercentages: Record<ArticleStatus, string>;
  topStockValueArticles: Array<{
    reference: string;
    title?: string;
    value: number;
    status: ArticleStatus;
  }>;
  stockRiskPredictions: Array<{
    reference: string;
    title?: string;
    daysToOutOfStock: number;
    currentStock: number;
  }>;
  toArchiveSuggestions: string[];
  lastUpdated: Date;
}

export interface UpdateArticleDto {
  title?: string;
  description?: string;
  reference: string;
  quantityInStock?: number;
  status?: ArticleStatus;
  notes?: string;
  unitPrice?: number;
  version?: number;
}

/**
 * Réponse de recherche par QR code
 */
export interface QrCodeSearchResponse {
  article?: Article;
  message?: string;
  found: boolean;
  scanDate: Date;
}

/**
 * Réponse de recherche par code-barres
 */
export interface BarcodeSearchResponse {
  article?: Article;
  message?: string;
  found: boolean;
  barcodeType?: string;
}

// Interfaces supplémentaires pour les fonctionnalités avancées

export interface ArticleStatusChange {
  from: ArticleStatus;
  to: ArticleStatus;
  date: Date;
  changedBy?: string;
  reason?: string;
}

export interface ArticleStatusHistory {
  articleId: number;
  changes: ArticleStatusChange[];
}

export interface ArticleBulkUpdateResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    id: number;
    error: string;
  }>;
}

export interface ArticleImportResult {
  imported: number;
  skipped: number;
  duplicates: number;
  errors: Array<{
    line: number;
    error: string;
  }>;
}