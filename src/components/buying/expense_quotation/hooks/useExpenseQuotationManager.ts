import { api } from '@/api';
import {
  BankAccount,
  Currency,
  EXPENSQUOTATION_STATUS,
  ExpensQuotationUploadedFile,
  ExpenseQuotation,
  Firm,
  Interlocutor,
  PaymentCondition,
  Upload,
} from '@/types';
import { DISCOUNT_TYPE } from '@/types/enums/discount-types';
import { create } from 'zustand';

type ExpenseQuotationManager = {
  // Data
  id?: number;
  sequential: string;
  sequentialNumbr: string;
  date: Date | undefined;
  dueDate: Date | undefined;
  object: string;
  firm?: Firm;
  interlocutor?: Interlocutor;
  subTotal: number;
  total: number;
  discount: number;
  discount_type: DISCOUNT_TYPE;
  bankAccount?: BankAccount;
  currency?: Currency;
  notes: string;
  status: EXPENSQUOTATION_STATUS;
  generalConditions: string;
  uploadedFiles: ExpensQuotationUploadedFile[];
  pdfFile?: File;
  pdfFileId?: number;
  uploadPdfField?: Upload;
  includeFiles: boolean;
  // Errors
  errors: Record<string, string | null>;
  // Utility data
  isInterlocutorInFirm: boolean;
  // Methods
  setFirm: (firm?: Firm) => void;
  setInterlocutor: (interlocutor?: Interlocutor) => void;
  set: (name: keyof ExpenseQuotationManager, value: any) => void;
  getQuotation: () => Partial<ExpenseQuotationManager>;
  setQuotation: (
    quotation: Partial<ExpenseQuotation & { files: ExpensQuotationUploadedFile[] }>,
    firms?: Firm[],
    bankAccounts?: BankAccount[],
    includeFiles?: boolean
  ) => void;
  reset: () => void;
  setError: (field: string, message: string | null) => void;
  validateSequentialNumber: () => boolean;
};

const getDateRangeAccordingToPaymentConditions = (paymentCondition: PaymentCondition) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  if (!paymentCondition) return { date: undefined, dueDate: undefined };

  switch (paymentCondition.id) {
    case 1:
      return { date: today, dueDate: today };
    case 2:
      return { date: today, dueDate: new Date(year, month + 1, 0) };
    case 3:
      return { date: today, dueDate: new Date(year, month + 2, 0) };
    case 4:
      return { date: today, dueDate: undefined };
    default:
      return { date: undefined, dueDate: undefined };
  }
};

const initialState: Omit<
  ExpenseQuotationManager,
  'set' | 'reset' | 'setFirm' | 'setInterlocutor' | 'getQuotation' | 'setQuotation' | 'setError' | 'validateSequentialNumber'
> = {
  id: -1,
  sequential: '',
  sequentialNumbr: '',
  date: undefined,
  dueDate: undefined,
  object: '',
  firm: api?.firm?.factory() || undefined,
  interlocutor: api?.interlocutor?.factory() || undefined,
  subTotal: 0,
  total: 0,
  discount: 0,
  discount_type: DISCOUNT_TYPE.PERCENTAGE,
  bankAccount: api?.bankAccount?.factory() || undefined,
  currency: api?.currency?.factory() || undefined,
  notes: '',
  status: EXPENSQUOTATION_STATUS.Draft,
  generalConditions: '',
  isInterlocutorInFirm: false,
  uploadedFiles: [],
  pdfFile: undefined,
  pdfFileId: undefined,
  uploadPdfField: undefined,
  includeFiles: false,
  errors: {},
};

export const useExpenseQuotationManager = create<ExpenseQuotationManager>((set, get) => ({
  ...initialState,
  setFirm: (firm?: Firm) => {
    const dateRange = firm?.paymentCondition
      ? getDateRangeAccordingToPaymentConditions(firm.paymentCondition)
      : { date: undefined, dueDate: undefined };

    set((state) => ({
      ...state,
      firm,
      interlocutor:
        firm?.interlocutorsToFirm?.length === 1
          ? firm.interlocutorsToFirm[0].interlocutor
          : undefined,
      isInterlocutorInFirm: !!firm?.interlocutorsToFirm?.length,
      date: dateRange.date,
      dueDate: dateRange.dueDate,
      currency: firm?.currency || state.currency,
    }));
  },
  setInterlocutor: (interlocutor?: Interlocutor) =>
    set((state) => ({
      ...state,
      interlocutor,
      isInterlocutorInFirm: !!interlocutor,
    })),
  set: (name: keyof ExpenseQuotationManager, value: any) => {
    set((state) => {
      const newValue =
        name === 'date' || name === 'dueDate'
          ? typeof value === 'string'
            ? new Date(value)
            : value
          : value;

      if (state[name] === newValue) {
        return state;
      }

      // Reset error when field changes
      const errors = { ...state.errors };
      if (name === 'sequentialNumbr') {
        errors['sequentialNumbr'] = null;
      }

      return {
        ...state,
        [name]: newValue,
        errors,
      };
    });
  },
  getQuotation: () => {
    const {
      id,
      sequentialNumbr,
      date,
      dueDate,
      object,
      firm,
      interlocutor,
      discount,
      discount_type,
      notes,
      generalConditions,
      bankAccount,
      currency,
      uploadedFiles,
      pdfFile,
      pdfFileId,
      uploadPdfField,
      includeFiles,
      ...rest
    } = get();

    return {
      id,
      sequentialNumbr,
      date,
      dueDate,
      object,
      firmId: firm?.id,
      interlocutorId: interlocutor?.id,
      discount,
      discount_type,
      notes,
      generalConditions,
      bankAccountId: bankAccount?.id,
      currencyId: currency?.id,
      uploadedFiles,
      pdfFile,
      pdfFileId,
      uploadPdfField,
      includeFiles,
    };
  },
  setQuotation: (
    quotation: Partial<ExpenseQuotation & { files: ExpensQuotationUploadedFile[] }>,
    firms?: Firm[],
    bankAccounts?: BankAccount[],
    includeFiles?: boolean
  ) => {
    set((state) => ({
      ...state,
      id: quotation?.id,
      sequentialNumbr: quotation?.sequentialNumbr || '',
      date: quotation?.date ? new Date(quotation?.date) : undefined,
      dueDate: quotation?.dueDate ? new Date(quotation?.dueDate) : undefined,
      object: quotation?.object || '',
      firm: firms?.find((firm) => quotation?.firm?.id === firm.id),
      interlocutor: quotation?.interlocutor,
      discount: quotation?.discount || 0,
      discount_type: quotation?.discount_type || DISCOUNT_TYPE.PERCENTAGE,
      bankAccount: bankAccounts?.find((account) => account.id === quotation?.bankAccount?.id),
      currency: quotation?.currency || quotation?.firm?.currency,
      notes: quotation?.notes || '',
      generalConditions: quotation?.generalConditions || '',
      status: quotation?.status || EXPENSQUOTATION_STATUS.Draft,
      uploadedFiles: quotation?.files || [],
      pdfFile: quotation?.pdfFile || state.pdfFile,
      pdfFileId: quotation?.pdfFileId || state.pdfFileId,
      uploadPdfField: quotation?.uploadPdfField || state.uploadPdfField,
      includeFiles: includeFiles !== undefined ? includeFiles : state.includeFiles,
      errors: {},
    }));
  },
  reset: () => set({ ...initialState }),
  setError: (field: string, message: string | null) => {
    set((state) => ({
      ...state,
      errors: {
        ...state.errors,
        [field]: message,
      },
    }));
  },
  validateSequentialNumber: () => {
    const sequentialNumbr = get().sequentialNumbr;
    const sequentialNumberRegex = /^QUO-\d{4,5}$/;
    const isValid = sequentialNumberRegex.test(sequentialNumbr);
    
    if (!isValid) {
      get().setError('sequentialNumbr', 'Invalid quotation number format. Expected format: QUO-XXXX');
    } else {
      get().setError('sequentialNumbr', null);
    }
    
    return isValid;
  },
}));