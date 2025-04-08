export type LanguageCode = 'fr' | 'en' | 'es';

export type DocumentDetails = {
  number?: string;
  amount?: number;
  date?: string;
  dueDate?: string;
  status?: string;
  articleCount?: number;
};

export type DocumentType = 'invoice' | 'quotation';

export type MessageSender = 'user' | 'bot';

export interface Message {
  id: string;
  sender: MessageSender;
  text: string;
  type?: DocumentType;
  details?: DocumentDetails;
  timestamp?: string | Date;
  context?: {
    currentStep?: string;
    [key: string]: any;
  };
}

// Types spécifiques à Dialogflow
export type DialogflowContext = {
  name: string;
  lifespanCount: number;
  parameters?: {
    currentStep?: string;
    [key: string]: any;
  };
};

export type DialogflowResponse = {
  fulfillmentText: string;
  outputContexts?: DialogflowContext[];
  intent?: string;
  parameters?: Record<string, any>;
  payload?: {
    type?: DocumentType;
    details?: DocumentDetails;
    [key: string]: any;
  };
};

export type DialogflowRequest = {
  languageCode: LanguageCode;
  queryText: string;
  sessionId: string;
  parameters?: Record<string, any>;
  outputContexts?: DialogflowContext[];
};

// Helper types
export type QuotationStep = 
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