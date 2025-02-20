import { Article } from './article';
import { BankAccount } from './bank-account';
import { Cabinet } from './cabinet';
import { Currency } from './currency';
import { DISCOUNT_TYPE } from './enums/discount-types';
import { Firm } from './firm';
import { Interlocutor } from './interlocutor';
import { Invoice } from './invoice';
import { PagedResponse } from './response';
import { DatabaseEntity } from './response/DatabaseEntity';
import { Tax } from './tax';
import { Upload } from './upload';

export enum EXPENSQUOTATION_STATUS {
  Nonexistent = 'quotation.status.non_existent',
  Expired = 'quotation.status.expired',
  Draft = 'quotation.status.draft',
  Validated = 'quotation.status.validated',
  Sent = 'quotation.status.sent',
  Accepted = 'quotation.status.accepted',
  Rejected = 'quotation.status.rejected',
  Invoiced = 'quotation.status.invoiced'
}

export interface ExpensQuotationMetaData extends DatabaseEntity {
  id?: number;
  showInvoiceAddress?: boolean;
  showDeliveryAddress?: boolean;
  showArticleDescription?: boolean;
  hasBankingDetails?: boolean;
  hasGeneralConditions?: boolean;
  hasTaxStamp?: boolean;
  taxSummary?: { taxId: number; amount: number }[];  // corresponds to the `taxSummary` JSON field in the database
}

export interface ExpensQuotationTaxEntry extends DatabaseEntity {
  id?: number;
  expenseArticleEntryId?: number;  // Linking to `expense_article_quotation_entry`
  tax?: Tax;
  taxId?: number;
}

export interface ExpensArticleQuotationEntry extends DatabaseEntity {
  id?: number;
  expenseQuotationId?: number;  // Linking to `expense_quotation`
  article?: Article;
  articleId?: number;
  unit_price?: number;
  quantity?: number;
  discount?: number;
  discount_type?: DISCOUNT_TYPE;
  articleQuotationEntryTaxes?: ExpensQuotationTaxEntry[];  // Relates to `expense_article_quotation_entry_tax`
  subTotal?: number;
  total?: number;
}

export interface CreateExpensArticleQuotationEntry extends Omit<
  ExpensArticleQuotationEntry,
  | 'id'
  | 'expenseQuotationId'
  | 'subTotal'
  | 'total'
  | 'updatedAt'
  | 'createdAt'
  | 'deletedAt'
  | 'isDeletionRestricted'
  | 'articleQuotationEntryTaxes'
> {
  taxes?: number[];  // Tax IDs
}

export interface ExpensQuotationUpload extends DatabaseEntity {
  id?: number;
  expenseQuotationId?: number;  // Linking to `expense_quotation`
  expenseQuotation?: ExpensQuotation;
  uploadId?: number;
  upload?: Upload;
}

export interface ExpensQuotation extends DatabaseEntity {
  id?: number;
  sequential?: string;
  object?: string;
  date?: string;
  dueDate?: string;
  status?: EXPENSQUOTATION_STATUS;
  generalConditions?: string;
  total?: number;
  subTotal?: number;
  discount?: number;
  discount_type?: DISCOUNT_TYPE;
  currencyId?: number | null;
  currency?: Currency;
  firmId?: number;
  firm?: Firm;
  cabinetId?: number;
  cabinet?: Cabinet;
  interlocutorId?: number;
  interlocutor?: Interlocutor;
  notes?: string;
  expenseQuotationMetaData?: ExpensQuotationMetaData;  // Relates to `expense_quotation_meta_data`
  bankAccountId?: number | null;
  bankAccount?: BankAccount;
  articleQuotationEntries?: ExpensArticleQuotationEntry[];
  uploads?: ExpensQuotationUpload[];
  invoices: Invoice[];
}

export interface CreateExpensQuotationDto
  extends Omit<
    ExpensQuotation,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'isDeletionRestricted'
    | 'firm'
    | 'cabinet'
    | 'interlocutor'
    | 'sequential'
    | 'bankAccount'
    | 'invoices'
  > {
  articleQuotationEntries?: CreateExpensArticleQuotationEntry[];  // Article entries
  files?: File[];  // Files to upload
}

export interface UpdateExpensQuotationDto extends CreateExpensQuotationDto {
  id?: number;
  createInvoice?: boolean;
}

export interface DuplicateExpensQuotationDto {
  id?: number;
  includeFiles?: boolean;
}

export interface PagedExpensQuotation extends PagedResponse<ExpensQuotation> {}

export interface ExpensQuotationUploadedFile {
  upload: ExpensQuotationUpload;
  file: File;
}
