import { api } from '@/api';
import { useState, useEffect } from 'react';

type DocumentDetails = {
  amount?: number;
  dueDate?: string;
  paidAmount?: number;
  date?: string;
  currency?: string; // Ajout pour gérer les devises
};

type DialogflowResponse = {
  fulfillmentText: string;
  fulfillmentMessages?: {
    text: {
      text: string[];
    };
  }[];
  payload?: {
    type: 'invoice' | 'quotation' | 'currency';
    number?: string;
    status?: string;
    statusMessage?: string;
    details?: DocumentDetails;
    timestamp?: string;
    currency?: { // Ajout pour le payload des devises
      code: string;
      label: string;
      symbol: string;
    };
  };
};

const DialogflowTable = () => {
  const [languageCode, setLanguageCode] = useState<'es' | 'en' | 'fr'>('es');
  const [queryText, setQueryText] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState<{ 
    sender: string; 
    text: string; 
    details?: DocumentDetails;
    type?: 'invoice' | 'quotation' | 'currency';
    currency?: { // Ajout pour les messages de devise
      code: string;
      label: string;
      symbol: string;
    };
  }[]>([]);

  useEffect(() => {
    const generatedSessionId = `session_${Date.now()}`;
    setSessionId(generatedSessionId);
    setMessages([{ 
      sender: 'bot', 
      text: languageCode === 'es' 
        ? '¡Hola! ¿En qué puedo ayudarte hoy? Puedes crear facturas, devisos o gestionar divisas.' 
        : languageCode === 'en' 
        ? 'Hello! How can I help you today? You can create invoices, quotations or manage currencies.' 
        : 'Bonjour ! Comment puis-je vous aider ? Vous pouvez créer des factures, devis ou gérer des devises.' 
    }]);
  }, [languageCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;

    // Ajouter le message de l'utilisateur
    setMessages(prev => [...prev, { sender: 'user', text: queryText }]);

    try {
      const response = await api.dialogflow.sendRequest(languageCode, queryText, sessionId);
      
      // Ajouter la réponse du bot avec les détails
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'bot', 
          text: response.fulfillmentText,
          details: response.payload?.details,
          type: response.payload?.type,
          currency: response.payload?.currency
        }
      ]);

    } catch (error) {
      const errorMessage = languageCode === 'es' 
        ? 'Error al procesar la solicitud' 
        : languageCode === 'en' 
        ? 'Error processing request' 
        : 'Erreur de traitement';
      setMessages(prev => [...prev, { sender: 'bot', text: errorMessage }]);
    } finally {
      setQueryText('');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(languageCode, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount?: number, currencyCode: string = 'EUR') => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat(languageCode, {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };

  return (
    <div style={{ 
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ textAlign: 'center' }}>
        {languageCode === 'es' ? 'Sistema de Facturas y Divisas' : 
         languageCode === 'en' ? 'Invoice and Currency System' : 'Système de Facturation et Devises'}
      </h1>

      <div style={{ 
        height: '500px',
        overflowY: 'auto',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#fafafa'
      }}>
        {messages.map((message, index) => (
          <div key={index} style={{ 
            marginBottom: '15px',
            padding: '10px',
            borderRadius: '8px',
            backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
            borderLeft: `4px solid ${message.sender === 'user' ? '#2196f3' : '#4caf50'}`
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
              {message.sender === 'user' 
                ? languageCode === 'es' ? 'Tú' : languageCode === 'en' ? 'You' : 'Vous'
                : languageCode === 'es' ? 'Sistema' : languageCode === 'en' ? 'System' : 'Système'}
            </div>
            <div>{message.text}</div>
            
            {/* Affichage des détails si disponibles */}
            {(message.details || message.currency) && (
              <div style={{ 
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#fff',
                borderRadius: '4px',
                border: '1px solid #eee'
              }}>
                {message.type === 'currency' && message.currency && (
                  <>
                    <h4 style={{ marginBottom: '8px' }}>
                      {languageCode === 'es' ? 'Detalles de la divisa' : 
                       languageCode === 'en' ? 'Currency details' : 'Détails de la devise'}
                    </h4>
                    <div>
                      <strong>{languageCode === 'es' ? 'Código:' : 
                              languageCode === 'en' ? 'Code:' : 'Code :'}</strong> 
                      {message.currency.code}
                    </div>
                    <div>
                      <strong>{languageCode === 'es' ? 'Nombre:' : 
                              languageCode === 'en' ? 'Name:' : 'Nom :'}</strong> 
                      {message.currency.label}
                    </div>
                    <div>
                      <strong>{languageCode === 'es' ? 'Símbolo:' : 
                              languageCode === 'en' ? 'Symbol:' : 'Symbole :'}</strong> 
                      {message.currency.symbol}
                    </div>
                  </>
                )}
                
                {message.type === 'invoice' && message.details && (
                  <>
                    <h4 style={{ marginBottom: '8px' }}>
                      {languageCode === 'es' ? 'Detalles de la factura' : 
                       languageCode === 'en' ? 'Invoice details' : 'Détails de la facture'}
                    </h4>
                    <div>
                      <strong>{languageCode === 'es' ? 'Monto total:' : 
                              languageCode === 'en' ? 'Total amount:' : 'Montant total:'}</strong> 
                      {formatCurrency(message.details.amount, message.details.currency)}
                    </div>
                    <div>
                      <strong>{languageCode === 'es' ? 'Monto pagado:' : 
                              languageCode === 'en' ? 'Paid amount:' : 'Montant payé:'}</strong> 
                      {formatCurrency(message.details.paidAmount, message.details.currency)}
                    </div>
                    <div>
                      <strong>{languageCode === 'es' ? 'Fecha vencimiento:' : 
                              languageCode === 'en' ? 'Due date:' : 'Date d\'échéance:'}</strong> 
                      {formatDate(message.details.dueDate)}
                    </div>
                  </>
                )}
                
                {message.type === 'quotation' && message.details && (
                  <>
                    <h4 style={{ marginBottom: '8px' }}>
                      {languageCode === 'es' ? 'Detalles del presupuesto' : 
                       languageCode === 'en' ? 'Quotation details' : 'Détails du devis'}
                    </h4>
                    <div>
                      <strong>{languageCode === 'es' ? 'Monto:' : 
                              languageCode === 'en' ? 'Amount:' : 'Montant:'}</strong> 
                      {formatCurrency(message.details.amount, message.details.currency)}
                    </div>
                    <div>
                      <strong>{languageCode === 'es' ? 'Fecha creación:' : 
                              languageCode === 'en' ? 'Creation date:' : 'Date de création:'}</strong> 
                      {formatDate(message.details.date)}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <select
          value={languageCode}
          onChange={(e) => setLanguageCode(e.target.value as 'es' | 'en' | 'fr')}
          style={{ padding: '8px', borderRadius: '4px' }}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
        
        <input
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder={
            languageCode === 'es' ? 'Escribe tu mensaje (ej: "Nueva divisa [code:USD] [label:Dólar americano] [symbol:$]")...' :
            languageCode === 'en' ? 'Type your message (ex: "New currency [code:USD] [label:US Dollar] [symbol:$]")...' :
            'Tapez votre message (ex: "Nouvelle devise [code:USD] [label:Dollar américain] [symbol:$]")...'
          }
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
        
        <button 
          type="submit" 
          style={{ 
            padding: '8px 16px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {languageCode === 'es' ? 'Enviar' : 
           languageCode === 'en' ? 'Send' : 'Envoyer'}
        </button>
      </form>
    </div>
  );
};

export default DialogflowTable;