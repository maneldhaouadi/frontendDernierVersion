import { create } from 'zustand';

export type ExpenseQuotationControlManager = {
  isBankAccountDetailsHidden: boolean;
  isGeneralConditionsHidden: boolean;
  isArticleDescriptionHidden: boolean;
  toggle: (field: keyof ExpenseQuotationControlManager) => void;
  set: (field: keyof ExpenseQuotationControlManager, value: boolean) => void;
  setControls: (
    data: Omit<ExpenseQuotationControlManager, 'toggle' | 'set' | 'getControls' | 'setControls' | 'reset'>
  ) => void;
  getControls: () => Omit<
    ExpenseQuotationControlManager,
    'toggle' | 'set' | 'getControls' | 'setControls' | 'reset'
  >;
  reset: () => void;
};

export const useQuotationControlManager = create<ExpenseQuotationControlManager>()((set, get) => ({
  isBankAccountDetailsHidden: false,
  isGeneralConditionsHidden: false,
  isArticleDescriptionHidden: false,
  toggle: (field: keyof ExpenseQuotationControlManager) =>
    set((state) => ({ ...state, [field]: !state[field] })),
  set: (field: keyof ExpenseQuotationControlManager, value: boolean) =>
    set((state) => ({ ...state, [field]: value })),
  setControls: (data: any) => {
    set((state) => {
      // Create the updated state by merging the current state with the new data
      const updatedState = { ...state, ...data };
  
      // Only set the state if it's actually different from the current state
      if (JSON.stringify(state) !== JSON.stringify(updatedState)) {
        return updatedState;
      }
  
      // If no changes, return the current state
      return state;
    });
  },  
  getControls: () => {
    return get();
  },
  reset: () =>
    set({
      isBankAccountDetailsHidden: false,
      isGeneralConditionsHidden: false,
      isArticleDescriptionHidden: false
    })
}));
