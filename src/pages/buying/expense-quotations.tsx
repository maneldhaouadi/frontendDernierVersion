import { ExpenseQuotationMain } from '@/components/buying/ExpenseQuotationMain';
import React from 'react';

export default function ExpenseQuotationsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-auto p-8">
      <ExpenseQuotationMain className="p-5 my-10" />
    </div>
  );
}
