import axios from './axios';
import { differenceInDays } from 'date-fns';
import { DISCOUNT_TYPE } from '../types/enums/discount-types';
import { upload } from './upload';
import { api } from '.';
import {

  ToastValidation,
  UpdateQuotationSequentialNumber
} from '@/types';
import { QUOTATION_FILTER_ATTRIBUTES } from '@/constants/quotation.filter-attributes';
import { CreateExpensQuotationDto, DuplicateExpensQuotationDto, ExpensQuotation, EXPENSQUOTATION_STATUS, ExpensQuotationUploadedFile, PagedExpensQuotation, UpdateExpensQuotationDto } from '@/types/expensequotation';

const factory = (): CreateExpensQuotationDto => {
  return {
    date: '',
    dueDate: '',
    status: EXPENSQUOTATION_STATUS.Draft,
    generalConditions: '',
    total: 0,
    subTotal: 0,
    discount: 0,
    discount_type: DISCOUNT_TYPE.AMOUNT,
    currencyId: 0,
    firmId: 0,
    interlocutorId: 0,
    notes: '',
    articleQuotationEntries: [],
    expenseQuotationMetaData: {
      showDeliveryAddress: true,
      showInvoiceAddress: true,
      hasBankingDetails: true,
      hasGeneralConditions: true,
      showArticleDescription: true,
      taxSummary: []
    },
    files: []
  };
};

/*const findPaginated = async (
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string,
  search: string = '',
  relations: string[] = ['firm', 'interlocutor'],
  firmId?: number,
  interlocutorId?: number
): Promise<PagedExpenseQuotation> => {
  const generalFilter = search
    ? Object.values(QUOTATION_FILTER_ATTRIBUTES)
        .map((key) => `${key}||$cont||${search}`)
        .join('||$or||')
    : '';
  const firmCondition = firmId ? `firmId||$eq||${firmId}` : '';
  const interlocutorCondition = interlocutorId ? `interlocutorId||$cont||${interlocutorId}` : '';
  const filters = [generalFilter, firmCondition, interlocutorCondition].filter(Boolean).join(',');

  const response = await axios.get<PagedExpenseQuotation>(
    new String().concat(
      'public/expensequotation/list?',
      `sort=${sortKey},${order}&`,
      `filter=${filters}&`,
      `limit=${size}&page=${page}&`,
      `join=${relations.join(',')}`
    )
  );
  return response.data;
};*/const findPaginated = async (
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string,
  search: string = '',
  relations: string[] = ['firm', 'interlocutor'],
  firmId?: number,
  interlocutorId?: number
): Promise<PagedExpensQuotation> => {
  const generalFilter = search
    ? Object.values(QUOTATION_FILTER_ATTRIBUTES)
        .map((key) => `${key}||$cont||${search}`)
        .join('||$or||')
    : '';
  const firmCondition = firmId ? `firmId||$eq||${firmId}` : '';
  const interlocutorCondition = interlocutorId ? `interlocutorId||$cont||${interlocutorId}` : '';
  const filters = [generalFilter, firmCondition, interlocutorCondition].filter(Boolean).join(',');

  const response = await axios.get<PagedExpensQuotation>(
    `public/expensquotation/list?sort=${sortKey},${order}&filter=${filters}&limit=${size}&page=${page}&join=${relations.join(',')}`
  );
  return response.data;
};

const findChoices = async (status: EXPENSQUOTATION_STATUS): Promise<ExpensQuotation[]> => {
  const response = await axios.get<ExpensQuotation[]>(
    `public/expensequotation/all?filter=status||$eq||${status}`
  );
  return response.data;
};

const findOne = async (
  id: number,
  relations: string[] = [
    'firm',
    'currency',
    'bankAccount',
    'interlocutor',
    'firm.currency',
    'quotationMetaData',
    'uploads',
    'invoices',
    'uploads.upload',
    'firm.deliveryAddress',
    'firm.invoicingAddress',
    'articleQuotationEntries',
    'firm.interlocutorsToFirm',
    'articleQuotationEntries.article',
    'articleQuotationEntries.articleQuotationEntryTaxes',
    'articleQuotationEntries.articleQuotationEntryTaxes.tax'
  ]
): Promise<ExpensQuotation & { files: ExpensQuotationUploadedFile[] }> => {
  const response = await axios.get<ExpensQuotation>(`public/expensquotation/${id}?join=${relations.join(',')}`);
  return { ...response.data, files: await getQuotationUploads(response.data) };
};

const uploadQuotationFiles = async (files: File[]): Promise<number[]> => {
  return files && files?.length > 0 ? await upload.uploadFiles(files) : [];
};
/*
const create = async (quotation: CreateExpenseQuotationDto, files: File[]): Promise<ExpenseQuotation> => {
  try {
    // Télécharger les fichiers associés au devis
    const uploadIds = await uploadQuotationFiles(files);

    // Envoyer la requête POST pour créer la quotation en ajoutant les fichiers
    const response = await axios.post<ExpenseQuotation>('public/expensquotation/save', {
      ...quotation,
      uploads: uploadIds.map((id) => ({
        uploadId: id
      }))
    });

    return response.data;
  } catch (error) {
    console.error('Error creating expense quotation:', error);
    throw new Error('Failed to create expense quotation');
  }
};


*/

const create = async (expense_quotation: CreateExpensQuotationDto): Promise<ExpensQuotation> => {
  const response = await axios.post<ExpensQuotation>('public/expensquotation/save', expense_quotation);
  return response.data;
};



const getQuotationUploads = async (quotation: ExpensQuotation): Promise<ExpensQuotationUploadedFile[]> => {
  if (!quotation?.uploads) return [];

  const uploads = await Promise.all(
    quotation.uploads.map(async (u) => {
      if (u?.upload?.slug) {
        const blob = await api.upload.fetchBlobBySlug(u.upload.slug);
        const filename = u.upload.filename || '';
        if (blob)
          return { upload: u, file: new File([blob], filename, { type: u.upload.mimetype }) };
      }
      return { upload: u, file: undefined };
    })
  );
  return uploads
    .filter((u) => !!u.file)
    .sort(
      (a, b) =>
        new Date(a.upload.createdAt ?? 0).getTime() - new Date(b.upload.createdAt ?? 0).getTime()
    ) as ExpensQuotationUploadedFile[];
};

const download = async (id: number, template: string): Promise<any> => {
  const quotation = await findOne(id, []);
  const response = await axios.get<string>(`public/expensquotation/${id}/download?template=${template}`, {
    responseType: 'blob'
  });
  const blob = new Blob([response.data], { type: response.headers['content-type'] });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = `${quotation.sequential}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return response;
};

const duplicate = async (duplicateQuotationDto: DuplicateExpensQuotationDto): Promise<ExpensQuotation> => {
  const response = await axios.post<ExpensQuotation>(
    '/public/expensquotation/duplicate',
    duplicateQuotationDto
  );
  return response.data;
};

const update = async (quotation: UpdateExpensQuotationDto, files: File[]): Promise<ExpensQuotation> => {
  const uploadIds = await uploadQuotationFiles(files);
  const response = await axios.put<ExpensQuotation>(`public/expensquotation/${quotation.id}`, {
    ...quotation,
    uploads: [
      ...(quotation.uploads || []),
      ...uploadIds.map((id) => {
        return { uploadId: id };
      })
    ]
  });
  return response.data;
};

const invoice = async (id?: number, createInvoice?: boolean): Promise<ExpensQuotation> => {
  const response = await axios.put<ExpensQuotation>(`public/expensequotation/invoice/${id}/${createInvoice}`);
  return response.data;
};

const remove = async (id: number): Promise<ExpensQuotation> => {
  const response = await axios.delete<ExpensQuotation>(`public/expensequotation/${id}`);
  return response.data;
};

const validate = (quotation: Partial<ExpensQuotation>): ToastValidation => {
  if (!quotation.date) return { message: 'La date est obligatoire' };
  if (!quotation.dueDate) return { message: "L'échéance est obligatoire" };
  if (!quotation.object) return { message: "L'objet est obligatoire" };
  if (differenceInDays(new Date(quotation.date), new Date(quotation.dueDate)) >= 0)
    return { message: "L'échéance doit être supérieure à la date" };
  if (!quotation.firmId || !quotation.interlocutorId)
    return { message: 'Entreprise et interlocuteur sont obligatoire' };
  return { message: '' };
};

const updateQuotationsSequentials = async (updatedSequenceDto: UpdateQuotationSequentialNumber) => {
  const response = await axios.put<ExpensQuotation>(
    `/public/expensquotation/update-quotation-sequences`,
    updatedSequenceDto
  );
  return response.data;
};

export const expense_quotation = {
  factory,
  findPaginated,
  findOne,
  findChoices,
  create,
  download,
  invoice,
  duplicate,
  update,
  updateQuotationsSequentials,
  remove,
  validate
};
