import { Card, CardContent, CardHeader } from "@/components/ui/card";

type InvoiceStatus = 'paid' | 'unpaid' | 'partially_paid' | 'overdue';

interface LateInvoice {
  invoiceNumber: string;
  amount: number;
  amountPaid: number;
  currency: string;
  dueDate: string;
  daysLate: number;
  status: InvoiceStatus;
  remainingAmount: number;
}

interface LateInvoicesResponse {
  success: boolean;
  invoices: LateInvoice[];
  count: number;
  totalRemaining: number;
  error?: string;
}

const statusTranslations = {
  fr: {
    paid: 'Payé',
    unpaid: 'Non payé',
    partially_paid: 'Partiellement payé',
    overdue: 'En retard'
  },
  en: {
    paid: 'Paid',
    unpaid: 'Unpaid',
    partially_paid: 'Partially paid',
    overdue: 'Overdue'
  },
  es: {
    paid: 'Pagado',
    unpaid: 'No pagado',
    partially_paid: 'Parcialmente pagado',
    overdue: 'Atrasado'
  }
};

const LateInvoicesCard = ({ 
  lateInvoices,
  languageCode 
}: { 
  lateInvoices: LateInvoicesResponse;
  languageCode: 'fr' | 'en' | 'es';
}) => {
  const translations = {
    fr: {
      title: 'Factures en retard',
      invoice: 'Facture',
      amount: 'Montant',
      dueDate: 'Date d\'échéance',
      status: 'Statut',
      total: 'Total restant dû',
      daysLate: 'Jours de retard'
    },
    en: {
      title: 'Late Invoices',
      invoice: 'Invoice',
      amount: 'Amount',
      dueDate: 'Due Date',
      status: 'Status',
      total: 'Total Remaining',
      daysLate: 'Days Late'
    },
    es: {
      title: 'Facturas vencidas',
      invoice: 'Factura',
      amount: 'Monto',
      dueDate: 'Fecha de vencimiento',
      status: 'Estado',
      total: 'Total pendiente',
      daysLate: 'Días de retraso'
    }
  }[languageCode];

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(languageCode, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const formatCurrency = (amount?: number, currency: string = 'EUR') => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat(languageCode === 'fr' ? 'fr-FR' : languageCode === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <Card className="mt-2">
      <CardHeader className="p-3 pb-0">
        <h4 className="font-medium text-sm">
          {translations.title} ({lateInvoices.count})
        </h4>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="max-h-60 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">{translations.invoice}</th>
                <th className="text-right py-2">{translations.amount}</th>
                <th className="text-right py-2">{translations.dueDate}</th>
                <th className="text-right py-2">{translations.status}</th>
                <th className="text-right py-2">{translations.daysLate}</th>
              </tr>
            </thead>
            <tbody>
              {lateInvoices.invoices.map((invoice) => (
                <tr key={invoice.invoiceNumber} className="border-b">
                  <td className="py-2">{invoice.invoiceNumber || 'N/A'}</td>
                  <td className="text-right py-2">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </td>
                  <td className="text-right py-2">
                    {formatDate(invoice.dueDate)}
                  </td>
                  <td className="text-right py-2">{invoice.status}</td>
                  <td className="text-right py-2">{invoice.daysLate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 font-semibold text-right">
          {translations.total}: {formatCurrency(lateInvoices.totalRemaining, lateInvoices.invoices[0]?.currency || 'EUR')}
        </div>
      </CardContent>
    </Card>
  );
};

export default LateInvoicesCard;