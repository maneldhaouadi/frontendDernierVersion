import axios from './axios';
import { QUOTATION_STATUS } from '@/types';
import { DISCOUNT_TYPE } from '../types/enums/discount-types';
import {
  CreateQuotationDto,
  PagedQuotation,
  Quotation,
  QuotationUploadedFile,
  UpdateQuotationDto
} from '@/types';
import { QUOTATION_FILTER_ATTRIBUTES } from '@/constants/quotation.filter-attributes';

const factory = (): CreateQuotationDto => {
  return {
    date: '',
    dueDate: '',
    status: QUOTATION_STATUS.Draft,
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
    quotationMetaData: {
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

const findPaginated = async (
  page: number = 1,
  size: number = 5,
  order: 'ASC' | 'DESC' = 'ASC',
  sortKey: string,
  search: string = '',
  relations: string[] = ['firm', 'interlocutor'],
  firmId?: number,
  interlocutorId?: number
): Promise<PagedQuotation> => {
  const generalFilter = search
    ? Object.values(QUOTATION_FILTER_ATTRIBUTES)
        .map((key) => `${key}||$cont||${search}`)
        .join('||$or||')
    : '';
  const firmCondition = firmId ? `firmId||$eq||${firmId}` : '';
  const interlocutorCondition = interlocutorId ? `interlocutorId||$cont||${interlocutorId}` : '';
  const filters = [generalFilter, firmCondition, interlocutorCondition].filter(Boolean).join(',');

  const response = await axios.get<PagedQuotation>(
    `public/expensquotation/list?sort=${sortKey},${order}&filter=${filters}&limit=${size}&page=${page}&join=${relations.join(',')}`
  );
  return response.data;
};
const create = async (quotation: CreateQuotationDto): Promise<Quotation> => {
  const response = await axios.post<Quotation>('public/expensquotation/save', quotation);
  return response.data;
};


const findOne = async (id: number): Promise<Quotation & { files: QuotationUploadedFile[] }> => {
  const response = await axios.get<Quotation>(`public/expensquotation/${id}`);
  return { ...response.data, files: [] };
};

const update = async (quotation: UpdateQuotationDto): Promise<Quotation> => {
  const response = await axios.put<Quotation>(`public/expensquotation/${quotation.id}`, quotation);
  return response.data;
};

const remove = async (id: number): Promise<Quotation> => {
  const response = await axios.delete<Quotation>(`public/expensquotation/${id}`);
  return response.data;
};

export const quotation_achat = {
  factory,
  findPaginated,
  findOne,
  update,
  remove,
  create
};
