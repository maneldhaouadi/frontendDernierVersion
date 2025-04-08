import React from 'react';

export const ChatbotActionsContext = React.createContext({
  openDeleteDialog: () => {},
  searchTerm: '',
  setSearchTerm: (value: string) => {},
  page: 1,
  totalPageCount: 1,
  setPage: (value: number) => {},
  size: 10,
  setSize: (value: number) => {},
  order: true,
  sortKey: '',
  setSortDetails: (order: boolean, sortKey: string) => {},
  languageCode: 'fr' as 'fr' | 'en' | 'es',
  setLanguageCode: (value: 'fr' | 'en' | 'es') => {},
  selectedMessage: null as any,
  setSelectedMessage: (message: any) => {}
});

export const useChatbotActions = () => React.useContext(ChatbotActionsContext);