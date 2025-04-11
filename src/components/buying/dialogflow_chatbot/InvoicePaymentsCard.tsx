import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Key } from "react";

// Define the ExpensePayment type
type ExpensePayment = {
  amount?: number;
  date: string | Date;
  mode: string;
  notes?: string;
};

// Define the InvoicePaymentsResponse type
type InvoicePaymentsResponse = {
  success: boolean;
  invoiceNumber: string;
  total: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  payments: ExpensePayment[];
  message?: string;
};

const InvoicePaymentsCard = ({ 
  payments, 
  languageCode 
}: { 
  payments: InvoicePaymentsResponse,
  languageCode: 'fr' | 'en' | 'es' 
}) => {
  const t = {
    fr: {
      title: 'Paiements de la facture',
      total: 'Total facture',
      paid: 'Montant payé',
      remaining: 'Reste à payer',
      amount: 'Montant',
      date: 'Date',
      mode: 'Mode',
      notes: 'Notes',
      noPayments: 'Aucun paiement trouvé'
    },
    en: {
      title: 'Invoice payments',
      total: 'Invoice total',
      paid: 'Amount paid',
      remaining: 'Remaining',
      amount: 'Amount',
      date: 'Date',
      mode: 'Mode',
      notes: 'Notes',
      noPayments: 'No payments found'
    },
    es: {
      title: 'Pagos de la factura',
      total: 'Total factura',
      paid: 'Monto pagado',
      remaining: 'Restante',
      amount: 'Monto',
      date: 'Fecha',
      mode: 'Modo',
      notes: 'Notas',
      noPayments: 'No se encontraron pagos'
    }
  }[languageCode];

  const formatCurrency = (amount?: number, currencyCode: string = 'EUR') => {
    if (amount === undefined) return 'N/A';
    
    const currencySymbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
    };
  
    return new Intl.NumberFormat(languageCode === 'fr' ? 'fr-FR' : languageCode === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol'
    }).format(amount).replace(currencyCode, currencySymbols[currencyCode] || currencyCode);
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(languageCode === 'fr' ? 'fr-FR' : languageCode === 'es' ? 'es-ES' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Card className="mt-2">
      <CardHeader className="p-3 pb-0">
        <h4 className="font-medium text-sm">
          {t.title} {payments.invoiceNumber}
        </h4>
      </CardHeader>
      <CardContent className="p-3 pt-0 text-sm">
        <div className="mb-3">
          <p><strong>{t.total}:</strong> {formatCurrency(payments.total, payments.currency)}</p>
          <p><strong>{t.paid}:</strong> {formatCurrency(payments.paidAmount, payments.currency)}</p>
          <p><strong>{t.remaining}:</strong> {formatCurrency(payments.remainingAmount, payments.currency)}</p>
        </div>

        {payments.payments.length > 0 ? (
          <div className="border-t pt-2">
            <div className="grid grid-cols-12 gap-1 font-semibold text-xs mb-1">
              <div className="col-span-3">{t.amount}</div>
              <div className="col-span-3">{t.date}</div>
              <div className="col-span-3">{t.mode}</div>
              <div className="col-span-3">{t.notes}</div>
            </div>
            {payments.payments.map((payment: ExpensePayment, index: Key) => (
              <div key={index} className="grid grid-cols-12 gap-1 text-xs py-1 border-b last:border-b-0">
                <div className="col-span-3">{formatCurrency(payment.amount, payments.currency)}</div>
                <div className="col-span-3">{formatDate(payment.date)}</div>
                <div className="col-span-3">{payment.mode}</div>
                <div className="col-span-3 truncate">{payment.notes}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t.noPayments}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicePaymentsCard;