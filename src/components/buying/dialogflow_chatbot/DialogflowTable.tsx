import { useState, useEffect, useRef } from 'react';
import { api } from '@/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import InvoicePaymentsCard from './InvoicePaymentsCard';

type DocumentDetails = {
  number?: string;
  amount?: number;
  date?: string;
  dueDate?: string;
  status?: string;
  articleCount?: number;
};


type LateInvoice = {
  invoiceNumber: string;
  amount: number;
  amountPaid: number;
  currency: string;
  dueDate: string;
  daysLate: number;
  status: string;
  remainingAmount: number;
};

type LateInvoicesResponse = {
  success: boolean;
  invoices: LateInvoice[];
  count: number;
  totalRemaining: number;
  error?: string;
};

type ExpensePayment = {
  amount?: number;
  date: string | Date;
  mode: string;
  notes?: string;
};
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
    type?: 'invoice' | 'quotation' | 'late_invoices' | 'invoice_payments';
    details?: DocumentDetails;
    lateInvoices?: LateInvoicesResponse;
    invoicePayments?: InvoicePaymentsResponse;
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
    type?: 'invoice' | 'quotation' | 'late_invoices';
    lateInvoices?: LateInvoicesResponse;
    invoicePayments?: InvoicePaymentsResponse; // Ajoutez cette ligne
    timestamp: Date;
  }[]>([]);
  const [currentContexts, setCurrentContexts] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const newSessionId = `session-${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([{
      sender: 'bot',
      text: languageCode === 'fr' 
        ? 'Bonjour ! Comment puis-je vous aider ? Dites "créer un devis" pour commencer.' 
        : languageCode === 'en' 
        ? 'Hello! How can I help you? Say "create quotation" to start.'
        : '¡Hola! ¿Cómo puedo ayudarte? Di "crear presupuesto" para empezar.',
      timestamp: new Date()
    }]);
  }, [languageCode]);

  const handleDialogflowResponse = (response: DialogflowResponse) => {
    if (response.outputContexts) {
      setCurrentContexts(response.outputContexts);
    }
  
    const newMessage = {
      sender: 'bot' as const,
      text: response.fulfillmentText,
      type: response.payload?.type,
      details: response.payload?.details,
      lateInvoices: response.payload?.lateInvoices,
      invoicePayments: response.payload?.invoicePayments, // Ajout des paiements
      timestamp: new Date()
    };
  
    setMessages(prev => [...prev, newMessage]);
    const isInLateInvoicesFlow = currentContexts.some(ctx => 
      ctx.name.includes('awaiting_firmId') || 
      ctx.name.includes('awaiting_currency') ||
      ctx.name.includes('awaiting_minAmount') ||
      ctx.name.includes('awaiting_daysAhead')
    );
    
    // Ajouter un message spécial pour les factures en retard
    if (response.payload?.type === 'late_invoices' && response.payload.lateInvoices) {
      const lateInvoicesMessage = {
        sender: 'bot' as const,
        text: '',
        type: 'late_invoices' as const,
        lateInvoices: response.payload.lateInvoices,
        invoicePayments: response.payload.invoicePayments, // Ajoutez cette ligne
        timestamp: new Date()
      };
      setMessages(prev => [...prev, lateInvoicesMessage]);
    }
  
    setIsTyping(false);
  };

  const isInQuotationFlow = () => {
    return currentContexts.some(ctx => ctx.name.includes('awaiting_quotation'));
  };

  const getCurrentStep = () => {
    const context = currentContexts.find(ctx => ctx.name.includes('awaiting_quotation'));
    return context?.parameters?.currentStep || '';
  };

  type QuotationStep = 
  | 'sequentialNumbr' 
  | 'object' 
  | 'firmName'  // Changé de firmId à firmName
  | 'InterlocutorName' // Changé de interlocutorId à InterlocutorName
  | 'date' 
  | 'duedate' 
  | 'status' 
  | 'articleId' 
  | 'quantity' 
  | 'unitPrice' 
  | 'discount' 
  | 'moreArticles' 
  | 'finalize';

const getInputPlaceholder = () => {
  if (!isInQuotationFlow()) {
    return languageCode === 'fr' 
      ? 'Écrivez votre message...' 
      : languageCode === 'en' 
      ? 'Type your message...'
      : 'Escribe tu mensaje...';
  }

  const step = getCurrentStep() as QuotationStep;
  const placeholders: Record<QuotationStep, string> = {
    'sequentialNumbr': languageCode === 'fr' ? 'Numéro séquentiel (ex: QUO-123456)' : 'Sequential number (ex: QUO-123456)',
    'object': languageCode === 'fr' ? 'Objet du devis' : 'Quotation subject',
    'firmName': languageCode === 'fr' ? 'Nom de la firme' : 'Firm name', // Modifié
    'InterlocutorName': languageCode === 'fr' ? 'Nom complet de l\'interlocuteur' : 'Interlocutor full name', // Modifié
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

  // Ajouter le message de l'utilisateur
  const userMessage = {
    sender: 'user' as const,
    text: queryText,
    timestamp: new Date()
  };
  setMessages(prev => [...prev, userMessage]);

  // Préparer les paramètres à envoyer
  let parameters: { fields: Record<string, any> } = { fields: {} };
  const inQuotationFlow = isInQuotationFlow();
  const inLateInvoicesFlow = currentContexts.some(ctx => 
    ctx.name.includes('factures_impayees')
  );

  try {
    if (inLateInvoicesFlow) {
      // Trouver le contexte principal des factures impayées
      const mainContext = currentContexts.find(ctx => 
        ctx.name.includes('factures_impayees')
      ) || { parameters: { fields: {} } };

      // Récupérer les paramètres existants
      const existingFields = mainContext.parameters?.fields || {};
      
      // Déterminer l'ordre des paramètres attendus
      const expectedParams = [
        { name: 'firmId', type: 'number', required: true },
        { name: 'currency', type: 'string', required: true },
        { name: 'minAmount', type: 'number', required: true },
        { name: 'daysAhead', type: 'number', required: true }
      ];

      // Trouver le premier paramètre manquant
      const missingParam = expectedParams.find(param => {
        const field = existingFields[param.name];
        return !field || 
               (param.type === 'number' && field.numberValue === 0) || 
               (param.type === 'string' && field.stringValue === '');
      });

      if (missingParam) {
        // Construire les paramètres pour le champ attendu
        parameters.fields = { ...existingFields };

        switch (missingParam.name) {
          case 'firmId':
            parameters.fields.firmId = { numberValue: parseInt(queryText) || 0 };
            parameters.fields.firmId_original = { stringValue: queryText };
            break;
          case 'currency':
            parameters.fields.currency = { stringValue: queryText.toUpperCase() };
            parameters.fields.currency_original = { stringValue: queryText };
            break;
          case 'minAmount':
            parameters.fields.minAmount = { numberValue: parseFloat(queryText) || 100 };
            parameters.fields.minAmount_original = { stringValue: queryText };
            break;
          case 'daysAhead':
            parameters.fields.daysAhead = { numberValue: parseInt(queryText) || 30 };
            parameters.fields.daysAhead_original = { stringValue: queryText };
            break;
        }

        // Réinitialiser les autres paramètres non encore saisis
        expectedParams.forEach(param => {
          if (param.name !== missingParam.name && !existingFields[param.name]) {
            parameters.fields[`${param.name}_original`] = { stringValue: '' };
          }
        });
      } else {
        // Tous les paramètres sont fournis
        parameters.fields = {
          ...existingFields,
          queryText: { stringValue: queryText }
        };
      }
    }
    else if (inQuotationFlow) {
      // Réinitialiser fields pour le flux de devis
      parameters.fields = {};

      const currentStep = getCurrentStep();
      switch (currentStep) {
        case 'sequentialNumbr':
          parameters.fields.sequentialNumbr = { stringValue: queryText };
          break;
        case 'object':
          parameters.fields.object = { stringValue: queryText };
          break;
        case 'firmName':
        case 'InterlocutorName':
          parameters.fields[currentStep] = { stringValue: queryText };
          break;
        case 'articleId':
        case 'quantity':
          parameters.fields[currentStep] = { numberValue: parseInt(queryText) || 0 };
          break;
        case 'date':
        case 'duedate':
          parameters.fields[currentStep] = { stringValue: queryText };
          break;
        case 'status':
          parameters.fields.status = { stringValue: queryText };
          break;
        case 'unitPrice':
          parameters.fields.unitPrice = { 
            numberValue: queryText.toLowerCase() === 'défaut' ? 0 : parseFloat(queryText) 
          };
          break;
        case 'discount':
          parameters.fields.discount = { numberValue: parseFloat(queryText.replace('%', '')) };
          parameters.fields.discountType = { 
            stringValue: queryText.includes('%') ? 'PERCENTAGE' : 'AMOUNT' 
          };
          break;
        default:
          parameters.fields.queryText = { stringValue: queryText };
      }
    } 
    else {
      // Cas général
      parameters.fields = { queryText: { stringValue: queryText } };
    }

    // Préparer l'envoi
    setQueryText('');
    setIsTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(async () => {
      try {
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
            : 'Server communication error',
          timestamp: new Date()
        }]);
      } finally {
        setIsTyping(false);
      }
    }, 1000 + Math.random() * 2000);

  } catch (error) {
    console.error('Error:', error);
    setMessages(prev => [...prev, {
      sender: 'bot',
      text: languageCode === 'fr' 
        ? 'Erreur de traitement de votre demande' 
        : 'Error processing your request',
      timestamp: new Date()
    }]);
    setIsTyping(false);
  }
};
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(languageCode);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(languageCode, { hour: '2-digit', minute: '2-digit' });
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat(languageCode === 'fr' ? 'fr-FR' : languageCode === 'es' ? 'es-ES' : 'en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-[600px] w-[400px] border rounded-lg overflow-hidden shadow-lg bg-white">
      {/* Chat header */}
      <div className="flex items-center p-4 border-b bg-primary text-primary-foreground">
        <Avatar className="h-10 w-10">
          <AvatarImage src="https://www.gstatic.com/mobilesdk/160503_mobilesdk/chat/chatui_2x.png" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h2 className="font-semibold">
            {languageCode === 'fr' ? 'Assistant Virtuel' : languageCode === 'en' ? 'Virtual Assistant' : 'Asistente Virtual'}
          </h2>
          <p className="text-xs opacity-80">
            {languageCode === 'fr' ? 'En ligne' : languageCode === 'en' ? 'Online' : 'En línea'}
          </p>
        </div>
        <div className="ml-auto">
          <Select 
            value={languageCode}
            onValueChange={(value: 'fr' | 'en' | 'es') => setLanguageCode(value)}
          >
            <SelectTrigger className="w-[100px] h-8 bg-primary-foreground text-primary">
              <SelectValue placeholder="Langue" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="space-y-3">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <Avatar className="h-8 w-8 mt-1 mr-2">
                  <AvatarImage src="/bot-avatar.png" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              
              <div className="max-w-[80%]">
                <div 
                  className={`rounded-lg px-4 py-2 ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-white border rounded-tl-none'
                  }`}
                >
                  <div className="text-sm">{msg.text}</div>
                  <div className={`text-xs mt-1 text-right ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-gray-500'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
                
                {msg.details && (
                  <Card className={`mt-2 ${msg.sender === 'user' ? 'ml-auto' : ''}`}>
                    <CardHeader className="p-3 pb-0">
                      <h4 className="font-medium text-sm">
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
                    </CardHeader>
                    <CardContent className="p-3 pt-0 text-sm">
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
                    </CardContent>
                  </Card>
                )}
                
{msg.invoicePayments && (
  <InvoicePaymentsCard 
    payments={msg.invoicePayments} 
    languageCode={languageCode} 
  />
)}
              </div>

              {msg.sender === 'user' && (
                <Avatar className="h-8 w-8 mt-1 ml-2">
                  <AvatarImage src="/user-avatar.png" />
                  <AvatarFallback>VO</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {/* Indicateur de frappe */}
          {isTyping && (
            <div className="flex justify-start">
              <Avatar className="h-8 w-8 mt-1 mr-2">
                <AvatarImage src="/bot-avatar.png" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="bg-white border rounded-lg px-4 py-2 rounded-tl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-3 border-t bg-white">
        <div className="flex gap-2">
          <Input
            type="text"
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder={getInputPlaceholder()}
            className="flex-1 rounded-full"
          />
          <Button 
            type="submit" 
            className="rounded-full w-12 h-12 p-0"
            disabled={!queryText.trim()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DialogflowTable;