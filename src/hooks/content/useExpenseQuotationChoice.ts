import React from 'react';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { EXPENSQUOTATION_STATUS } from '@/types';

const useExpenseQuotationChoices = (
  status: EXPENSQUOTATION_STATUS, 
  firmId?: number,
  interlocutorId?: number,
  enabled: boolean = true
) => {
  const { isLoading: isFetchQuotationPending, data: quotationsResp } = useQuery({
    queryKey: ['quotation-choices', status, firmId, interlocutorId],
    queryFn: () => api.expense_quotation.findChoices(
      firmId !== undefined ? Number(firmId) : undefined,
      interlocutorId !== undefined ? Number(interlocutorId) : undefined,
      ['expensearticleQuotationEntries', 'expensearticleQuotationEntries.article'] // Ajout des relations
    ),
    enabled: enabled && firmId !== undefined
  });

  const quotations = React.useMemo(() => {
    if (!quotationsResp) return [];
    
    // S'assurer que chaque devis a bien la propriété expensearticleQuotationEntries
    return quotationsResp.map(quotation => ({
      ...quotation,
      expensearticleQuotationEntries: quotation.expensearticleQuotationEntries || []
    }));
  }, [quotationsResp]);

  return {
    quotations,
    isFetchQuotationPending
  };
};

export default useExpenseQuotationChoices;