import { DatabaseEntity } from './response/DatabaseEntity';
import { PagedResponse } from './response';

export interface Template extends DatabaseEntity {
  id?: number;
  name: string;
  content: string;
  type: TemplateType;
  isDefault: boolean;
  sequentialNumber?: string;
}

export enum TemplateType {
  INVOICE = 'invoice',
  QUOTATION = 'quotation',
  PAYMENT = 'payment'
}

// Utilisez cette syntaxe pour le type
export type TemplateTypeValues = `${TemplateType}`; // 'invoice' | 'quotation' | 'payment'

export interface CreateTemplateDto
  extends Omit<
    Template,
    'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeletionRestricted'
  > {}

export interface UpdateTemplateDto
  extends Omit<Template, 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeletionRestricted'> {}

export type TemplateQueryKeyParams = { [P in keyof Template]?: boolean };

export interface PagedTemplate extends PagedResponse<Template> {}