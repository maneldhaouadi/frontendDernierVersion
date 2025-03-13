import { Currency, Firm, Upload } from '@/types';
import { EXPENSE_PAYMENT_MODE, ExpensePayment, ExpensePaymentUploadedFile } from '@/types/expense-payment';
import { create } from 'zustand';

type ExpensePaymentManager = {
  // data
  id?: number;
  sequentialNumbr: string; // Ajout du champ sequentialNumbr
  date?: Date | undefined;
  amount?: number;
  fee?: number;
  convertionRate: number;
  currency?: Currency;
  currencyId?: number;
  notes?: string;
  mode?: EXPENSE_PAYMENT_MODE;
  uploadedFiles: ExpensePaymentUploadedFile[];
  firm?: Firm;
  firmId?: number;
  pdfFile?: File; // Ajout du champ pdfFile
  pdfFileId?: number; // Ajout du champ pdfFileId
  uploadPdfField?: Upload; // Ajout du champ uploadPdfField
  // methods
  set: (name: keyof ExpensePaymentManager, value: any) => void;
  getPayment: () => Partial<ExpensePaymentManager>;
  setPayment: (payment: Partial<ExpensePayment & { files: ExpensePaymentUploadedFile[] }>) => void;
  reset: () => void;
};

const initialState: Omit<ExpensePaymentManager, 'set' | 'reset' | 'getPayment' | 'setPayment'> = {
  id: -1,
  sequentialNumbr: '', // Initialisation du champ sequentialNumbr
  date: undefined,
  amount: 0,
  fee: 0,
  convertionRate: 1,
  currencyId: undefined,
  notes: '',
  mode: EXPENSE_PAYMENT_MODE.Cash,
  uploadedFiles: [],
  firmId: undefined,
  pdfFile: undefined, // Initialisation du champ pdfFile
  pdfFileId: undefined, // Initialisation du champ pdfFileId
  uploadPdfField: undefined, // Initialisation du champ uploadPdfField
};

export const useExpensePaymentManager = create<ExpensePaymentManager>((set, get) => ({
  ...initialState,
  set: (name: keyof ExpensePaymentManager, value: any) => {
    if (name === 'date') {
      const dateValue = typeof value === 'string' ? new Date(value) : value;
      set((state) => ({
        ...state,
        [name]: dateValue
      }));
    } else {
      set((state) => ({
        ...state,
        [name]: value
      }));
    }
  },
  getPayment: () => {
    const { id, sequentialNumbr, date, amount, fee, convertionRate, mode, notes, uploadedFiles, pdfFile, pdfFileId, uploadPdfField, ...rest } = get();

    return {
      id,
      sequentialNumbr,
      date,
      amount,
      fee,
      convertionRate,
      notes,
      uploadedFiles,
      pdfFile, // Inclure le fichier PDF
      pdfFileId, // Inclure l'ID du fichier PDF
      uploadPdfField, // Inclure le champ uploadPdfField
    };
  },
  setPayment: (payment: Partial<ExpensePayment & { files: ExpensePaymentUploadedFile[] }>) => {
    set((state) => ({
      ...state,
      id: payment?.id,
      sequentialNumbr: payment?.sequentialNumbr, // Récupérer le sequentialNumbr
      date: payment?.date ? new Date(payment?.date) : undefined,
      amount: payment?.amount,
      fee: payment?.fee,
      convertionRate: payment?.convertionRate,
      notes: payment?.notes,
      mode: payment?.mode,
      firmId: payment?.firmId,
      firm: payment?.firm,
      currencyId: payment?.currencyId,
      currency: payment?.currency,
      uploadedFiles: payment?.files || [],
      pdfFile: payment?.pdfFile || state.pdfFile, // Garder le fichier PDF existant
      pdfFileId: payment?.pdfFileId || state.pdfFileId, // Garder l'ID du fichier PDF existant
      uploadPdfField: payment?.uploadPdfField || state.uploadPdfField, // Garder le champ uploadPdfField existant
    }));
  },
  reset: () => set({ ...initialState })
}));