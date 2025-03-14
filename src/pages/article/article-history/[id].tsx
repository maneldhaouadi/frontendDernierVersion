import { useRouter } from 'next/router';
import ArticleHistoryList from '@/components/article/ArticleHistory';
import React, { useEffect, useState } from 'react';

export default function Page() {
  const router = useRouter();
  const { id } = router.query;
  const [articleId, setArticleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si router.query est prêt
    if (router.isReady) {
      // Convertir l'ID en nombre
      const parsedId = parseInt(id as string, 10);

      // Vérifier si l'ID est un nombre valide
      if (isNaN(parsedId)) {
        console.error('ID d\'article invalide:', id);
        setIsLoading(false);
      } else {
        setArticleId(parsedId);
        setIsLoading(false);
      }
    }
  }, [router.isReady, id]);

  if (isLoading) {
    return <div>Chargement de l'ID de l'article...</div>;
  }

  if (!articleId) {
    return <div>ID d'article invalide</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ArticleHistoryList articleId={articleId} />
    </div>
  );
}