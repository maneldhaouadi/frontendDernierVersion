import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ExpenseQuotationCreateForm } from '@/components/buying/expense_quotation/ExpenseQuotationCreateForm';

export default function Page() {
  const params = useSearchParams();
  const firmId = params.get('firmId') || undefined;
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ExpenseQuotationCreateForm firmId={firmId} />
    </div>
  );
}
