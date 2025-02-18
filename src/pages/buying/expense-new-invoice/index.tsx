import React from 'react';
import { useSearchParams } from 'next/navigation';
import { ExpenseInvoiceCreateForm } from '@/components/buying/expense_invoice/ExpenseInvoiceCreateForme';

export default function Page() {
  const params = useSearchParams();
  const firmId = params.get('firmId') || undefined;
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ExpenseInvoiceCreateForm firmId={firmId} />
    </div>
  );
}
