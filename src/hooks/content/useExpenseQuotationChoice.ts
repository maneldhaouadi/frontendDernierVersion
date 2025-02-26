import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { EXPENSQUOTATION_STATUS } from '@/types';

const useExpenseQuotationChoices = (status: EXPENSQUOTATION_STATUS, enabled: boolean = true) => {
  
  const { isLoading: isFetchQuotationPending, data: quotationsResp } = useQuery({
    queryKey: ['quotation-choices', status],
    queryFn: () => api.expense_quotation.findChoices(),
    enabled: enabled
  });


  const quotations = React.useMemo(() => {
    if (!quotationsResp) return [];
    return quotationsResp;  // Pas besoin de .data car il s'agit déjà d'un tableau
  }, [quotationsResp]);

  return {
    quotations,
    isFetchQuotationPending
  };
};

export default useExpenseQuotationChoices;