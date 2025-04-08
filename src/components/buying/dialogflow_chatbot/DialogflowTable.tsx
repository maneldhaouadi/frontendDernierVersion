import { useState, useEffect, useRef } from 'react';
import { api } from '@/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

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

    setMessages(prev => [...prev, {
      sender: 'bot',
      text: response.fulfillmentText,
      type: response.payload?.type,
      details: response.payload?.details,
      timestamp: new Date()
    }]);
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

  const userMessage = { 
    sender: 'user' as const, 
    text: queryText,
    timestamp: new Date()
  };
  setMessages(prev => [...prev, userMessage]);
  setQueryText('');
  setIsTyping(true);

  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  try {
    const currentStep = getCurrentStep();
    let parameters = {};

    if (isInQuotationFlow()) {
      switch (currentStep) {
        case 'sequentialNumbr':
          parameters = { sequentialNumbr: queryText };
          break;
        case 'object':
          parameters = { object: queryText };
          break;
        case 'firmName': // Modifié
        case 'InterlocutorName': // Modifié
          parameters = { [currentStep]: queryText };
          break;
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

    const typingDelay = 1000 + Math.random() * 2000; // 1-3 secondes
    
    typingTimeoutRef.current = setTimeout(async () => {
      const response = await api.dialogflow.sendRequest({
        languageCode,
        queryText,
        sessionId,
        parameters,
        outputContexts: currentContexts
      });

      handleDialogflowResponse(response);
    }, typingDelay);

  } catch (error) {
    console.error('API Error:', error);
    setMessages(prev => [...prev, {
      sender: 'bot',
      text: languageCode === 'fr' 
        ? 'Erreur de communication avec le serveur'
        : 'Server communication error',
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