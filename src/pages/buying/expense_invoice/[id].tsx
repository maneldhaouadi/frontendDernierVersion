import React from 'react';
import { useRouter } from 'next/router';
import { ExpenseInvoiceUpdateForm } from '@/components/buying/expense_invoice/ExpenseInvoiceUpdateForm';

export default function Page() {
  const router = useRouter();
  const id = router.query.id as string;
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ExpenseInvoiceUpdateForm invoiceId={id} />
    </div>
  );
}
