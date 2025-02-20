import React from 'react';
import { useRouter } from 'next/router';
import { ExpenseQuotationCreateForm } from '@/components/buying/ExpenseQuotationCreateForm';

export default function Page() {
  const router = useRouter();
  const firmId = router.query.firmId ? String(router.query.firmId) : undefined;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ExpenseQuotationCreateForm firmId={firmId} />
    </div>
  );
}
