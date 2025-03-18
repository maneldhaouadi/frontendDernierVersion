import { useContext } from 'react';
import { ArticleActionsContext } from '../data-table/ActionsContext';

export const useArticleActions = () => {
  const context = useContext(ArticleActionsContext);
  if (!context) {
    throw new Error('useArticleActions must be used within an ArticleActionsProvider');
  }
  return context;
};