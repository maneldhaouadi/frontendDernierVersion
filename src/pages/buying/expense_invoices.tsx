import { ExpenseInvoiceMain } from '@/components/buying/expense_invoice/ExpenseInvoiceMain';
import React from 'react';

export default function InvoicesPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden p-8">
      <ExpenseInvoiceMain className="p-5 my-10" />
    </div>
  );
}
