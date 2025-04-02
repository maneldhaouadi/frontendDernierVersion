import { useState, useEffect } from 'react';
import { api } from '@/api';

type DocumentDetails = {
  number?: string;
  amount?: number;
  date?: string;
  dueDate?: string;
  status?: string;
  articleCount?: number;
};

type DialogflowResponse = {
  fulfillmentText: string;
  outputContexts?: Array<{
    name: string;
    lifespanCount: number;
    parameters?: {
      currentStep?: string;
      quotationData?: any;
      [key: string]: any;
    };
  }>;
  payload?: {
    type: 'invoice' | 'quotation';
    details?: DocumentDetails;
  };
};

const DialogflowTable = () => {
  const [languageCode, setLanguageCode] = useState<'fr' | 'en' | 'es'>('fr');
  const [queryText, setQueryText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<{
    sender: 'user' | 'bot';
    text: string;
    details?: DocumentDetails;
    type?: 'invoice' | 'quotation';
  }[]>([]);
  const [currentContexts, setCurrentContexts] = useState<any[]>([]);

  useEffect(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([{
      sender: 'bot',
      text: languageCode === 'fr' 
        ? 'Bonjour ! Comment puis-je vous aider ? Dites "créer un devis" pour commencer.' 
        : languageCode === 'en' 
        ? 'Hello! How can I help you? Say "create quotation" to start.'
        : '¡Hola! ¿Cómo puedo ayudarte? Di "crear presupuesto" para empezar.'
    }]);
  }, [languageCode]);

  const handleDialogflowResponse = (response: DialogflowResponse) => {
    if (response.outputContexts) {
      setCurrentContexts(response.outputContexts);
    }

    setMessages(prev => [...prev, {
      sender: 'bot',
      text: response.fulfillmentText,
      type: response.payload?.type,
      details: response.payload?.details
    }]);
  };

  const isInQuotationFlow = () => {
    return currentContexts.some(ctx => ctx.name.includes('awaiting_quotation'));
  };

  const getCurrentStep = () => {
    const context = currentContexts.find(ctx => ctx.name.includes('awaiting_quotation'));
    return context?.parameters?.currentStep || '';
  };

  // First, define a type for the placeholders keys
type QuotationStep = 
| 'sequentialNumbr' 
| 'object' 
| 'firmId' 
| 'interlocutorId' 
| 'date' 
| 'duedate' 
| 'status' 
| 'articleId' 
| 'quantity' 
| 'unitPrice' 
| 'discount' 
| 'moreArticles' 
| 'finalize';

// Then update the getInputPlaceholder function
const getInputPlaceholder = () => {
if (!isInQuotationFlow()) {
  return languageCode === 'fr' 
    ? 'Tapez votre message...' 
    : languageCode === 'en' 
    ? 'Type your message...'
    : 'Escribe tu mensaje...';
}

const step = getCurrentStep() as QuotationStep; // Cast to the correct type
const placeholders: Record<QuotationStep, string> = {
  'sequentialNumbr': languageCode === 'fr' ? 'Numéro séquentiel (ex: QUO-123456)' : 'Sequential number (ex: QUO-123456)',
  'object': languageCode === 'fr' ? 'Objet du devis' : 'Quotation subject',
  'firmId': languageCode === 'fr' ? 'ID de la firme (nombre entier)' : 'Firm ID (integer)',
  'interlocutorId': languageCode === 'fr' ? 'ID interlocuteur (nombre entier)' : 'Interlocutor ID (integer)',
  'date': languageCode === 'fr' ? 'Date (JJ-MM-AAAA)' : 'Date (DD-MM-YYYY)',
  'duedate': languageCode === 'fr' ? 'Date échéance (JJ-MM-AAAA)' : 'Due date (DD-MM-YYYY)',
  'status': languageCode === 'fr' ? 'Statut (Brouillon, En attente, Validé, Refusé)' : 'Status (Draft, Pending, Validated, Rejected)',
  'articleId': languageCode === 'fr' ? 'ID article (nombre entier)' : 'Article ID (integer)',
  'quantity': languageCode === 'fr' ? 'Quantité (nombre entier)' : 'Quantity (integer)',
  'unitPrice': languageCode === 'fr' ? 'Prix unitaire (nombre décimal ou "défaut")' : 'Unit price (decimal or "default")',
  'discount': languageCode === 'fr' ? 'Remise (nombre décimal ou pourcentage, ex: 10 ou 10%)' : 'Discount (decimal or percentage, ex: 10 or 10%)',
  'moreArticles': languageCode === 'fr' ? 'Ajouter un autre article ? (Oui/Non)' : 'Add another item? (Yes/No)',
  'finalize': languageCode === 'fr' ? 'Confirmer la création ? (Oui/Non)' : 'Confirm creation? (Yes/No)'
};

return placeholders[step] || (languageCode === 'fr' ? 'Répondez à la question...' : 'Answer the question...');
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text: queryText }]);

    try {
      const currentStep = getCurrentStep();
      let parameters = {};

      // Structure les paramètres selon l'étape en cours
      if (isInQuotationFlow()) {
        switch (currentStep) {
          case 'sequentialNumbr':
            parameters = { sequentialNumbr: queryText };
            break;
          case 'object':
            parameters = { object: queryText };
            break;
          case 'firmId':
          case 'interlocutorId':
          case 'articleId':
          case 'quantity':
            parameters = { [currentStep]: parseInt(queryText) || 0 };
            break;
          case 'date':
          case 'duedate':
            parameters = { [currentStep]: queryText };
            break;
          case 'status':
            parameters = { status: queryText };
            break;
          case 'unitPrice':
            parameters = { unitPrice: queryText.toLowerCase() === 'défaut' ? 'défaut' : parseFloat(queryText) };
            break;
          case 'discount':
            parameters = { 
              discount: parseFloat(queryText.replace('%', '')),
              discountType: queryText.includes('%') ? 'PERCENTAGE' : 'AMOUNT'
            };
            break;
          case 'moreArticles':
          case 'finalize':
            parameters = { queryText: queryText };
            break;
          default:
            parameters = { queryText: queryText };
        }
      }

      const response = await api.dialogflow.sendRequest({
        languageCode,
        queryText,
        sessionId,
        parameters,
        outputContexts: currentContexts
      });

      handleDialogflowResponse(response);

    } catch (error) {
      console.error('API Error:', error);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: languageCode === 'fr' 
          ? 'Erreur de communication avec le serveur'
          : 'Server communication error'
      }]);
    } finally {
      setQueryText('');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(languageCode);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat(languageCode === 'fr' ? 'fr-FR' : languageCode === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="dialogflow-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-sender">
              {msg.sender === 'user' 
                ? languageCode === 'fr' ? 'Vous' : languageCode === 'en' ? 'You' : 'Tú'
                : 'Système'}
            </div>
            <div className="message-text">{msg.text}</div>
            
            {msg.details && (
              <div className="document-details">
                <h4>
                  {msg.type === 'quotation'
                    ? languageCode === 'fr' 
                      ? 'Détails du devis' 
                      : languageCode === 'en' 
                      ? 'Quotation details'
                      : 'Detalles del presupuesto'
                    : languageCode === 'fr'
                    ? 'Détails de la facture'
                    : languageCode === 'en'
                    ? 'Invoice details'
                    : 'Detalles de la factura'}
                </h4>
                <p><strong>{languageCode === 'fr' ? 'Numéro' : 'Number'}:</strong> {msg.details.number || 'N/A'}</p>
                <p><strong>{languageCode === 'fr' ? 'Montant' : 'Amount'}:</strong> {formatCurrency(msg.details.amount)}</p>
                <p><strong>{languageCode === 'fr' ? 'Date' : 'Date'}:</strong> {formatDate(msg.details.date)}</p>
                {msg.details.dueDate && (
                  <p><strong>{languageCode === 'fr' ? 'Échéance' : 'Due date'}:</strong> {formatDate(msg.details.dueDate)}</p>
                )}
                {msg.details.status && (
                  <p><strong>{languageCode === 'fr' ? 'Statut' : 'Status'}:</strong> {msg.details.status}</p>
                )}
                {msg.details.articleCount !== undefined && (
                  <p><strong>{languageCode === 'fr' ? 'Articles' : 'Items'}:</strong> {msg.details.articleCount}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-form">
        <select
          value={languageCode}
          onChange={(e) => setLanguageCode(e.target.value as 'fr' | 'en' | 'es')}
          className="language-selector"
        >
          <option value="fr">Français</option>
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>

        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder={getInputPlaceholder()}
          className="message-input"
        />

        <button type="submit" className="send-button">
          {languageCode === 'fr' ? 'Envoyer' : languageCode === 'en' ? 'Send' : 'Enviar'}
        </button>
      </form>

      <style jsx>{`
        .dialogflow-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }
        .messages-container {
          height: 500px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          background: #fafafa;
        }
        .message {
          margin-bottom: 15px;
          padding: 10px;
          border-radius: 8px;
        }
        .message.user {
          background: #e3f2fd;
          border-left: 4px solid #2196f3;
        }
        .message.bot {
          background: #f5f5f5;
          border-left: 4px solid #4caf50;
        }
        .message-sender {
          font-weight: bold;
          margin-bottom: 5px;
        }
        .document-details {
          margin-top: 10px;
          padding: 10px;
          background: white;
          border-radius: 4px;
          border: 1px solid #eee;
        }
        .input-form {
          display: flex;
          gap: 10px;
        }
        .language-selector {
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .message-input {
          flex: 1;
          padding: 8px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        .send-button {
          padding: 8px 16px;
          background: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .send-button:hover {
          background: #43a047;
        }
      `}</style>
    </div>
  );
};

export default DialogflowTable;