import React from 'react';

interface ArticleActionsContextProps {
  openDeleteDialog?: (id: number) => void;
  openDuplicateDialog?: (id: number) => void;
  searchTerm?: string;
  setSearchTerm?: (value: string) => void;
  page?: number;
  totalPageCount?: number;
  setPage?: (value: number) => void;
  size?: number;
  setSize?: (value: number) => void;
  order?: boolean;
  sortKey?: string;
  setSortDetails?: (order: boolean, sortKey: string) => void;
}

export const ArticleActionsContext = React.createContext<ArticleActionsContextProps>({});