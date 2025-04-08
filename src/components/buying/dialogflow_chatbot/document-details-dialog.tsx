import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Message, LanguageCode } from "@/types/Message";

export const DocumentDetailsDialog = ({
  message,
  languageCode,
  formatDate,
  formatCurrency
}: {
  message: Message | null;
  languageCode: LanguageCode;
  formatDate: (date?: string) => string;
  formatCurrency: (amount?: number) => string;
}) => {
  if (!message?.details) return null;

  const getTitle = () => {
    if (message.type === 'quotation') {
      return languageCode === 'fr' 
        ? 'Détails du devis' 
        : languageCode === 'en' 
        ? 'Quotation details'
        : 'Detalles del presupuesto';
    }
    return languageCode === 'fr'
      ? 'Détails de la facture'
      : languageCode === 'en'
      ? 'Invoice details'
      : 'Detalles de la factura';
  };

  return (
    <Dialog open={!!message?.details}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{languageCode === 'fr' ? 'Numéro' : 'Number'}:</span>
            <span>{message.details.number || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span>{languageCode === 'fr' ? 'Montant' : 'Amount'}:</span>
            <span>{formatCurrency(message.details.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span>{languageCode === 'fr' ? 'Date' : 'Date'}:</span>
            <span>{formatDate(message.details.date)}</span>
          </div>
          {message.details.dueDate && (
            <div className="flex justify-between">
              <span>{languageCode === 'fr' ? 'Échéance' : 'Due date'}:</span>
              <span>{formatDate(message.details.dueDate)}</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};