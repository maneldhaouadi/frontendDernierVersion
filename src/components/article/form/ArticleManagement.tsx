/*import React from 'react';
import { cn } from '@/lib/utils';
import {
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DndContext,
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import SortableLinks from '@/components/ui/sortable';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';
import { ArticleItem } from './ArticleItem';
import { Article } from '@/types';

interface ArticleManagementProps {
  className?: string;
  isArticleDescriptionHidden: boolean;
  edit?: boolean;
  loading?: boolean;
}

export const ArticleManagement: React.FC<ArticleManagementProps> = ({
  className,
  isArticleDescriptionHidden,
  loading,
  edit = true
}) => {
  const { t: tArticle } = useTranslation('article');
  const articleManager = useArticleManager();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = articleManager.articles.findIndex((item) => item.id === active.id);
      const newIndex = articleManager.articles.findIndex((item) => item.id === over.id);
      articleManager.setArticles(
        arrayMove(
          articleManager.articles.map((item) => item.article),
          oldIndex,
          newIndex
        )
      );
    }
  }

  function handleDelete(idToDelete: string) {
    if (articleManager.articles.length > 1) {
      articleManager.delete(idToDelete);
    }
  }

  const addNewItem = React.useCallback(() => {
    articleManager.add();
  }, [articleManager.add]);

  return (
    <div className="border-b">
      <Card className={cn('w-full border-0 shadow-none', className)}>
        <CardHeader className="space-y-1 w-full">
          <div className="flex flex-row items-center">
            <div>
              <CardTitle className="text-2xl flex justify-between">
                {tArticle('article.manager')}
              </CardTitle>
              <CardDescription>{tArticle('article.manager_statement')}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}>
            <SortableContext items={articleManager.articles} strategy={verticalListSortingStrategy}>
              {loading && <Skeleton className="h-24 mr-2 my-5" />}
              {!loading &&
                articleManager.articles.map((item) => (
                  <SortableLinks key={item.id} id={item} onDelete={edit ? handleDelete : undefined}>
                    <ArticleItem
                      article={item.article}
                      onChange={(article) => articleManager.update(item.id, article)}
                      showDescription={!isArticleDescriptionHidden}
                      edit={edit}
                    />
                  </SortableLinks>
                ))}
            </SortableContext>
          </DndContext>
         
          {edit && (
            <Button variant={'outline'} className="h-10 w-fit" onClick={addNewItem}>
              <div className="flex gap-2 items-center w-full justify-center">
                <Plus size={20} />
                {tArticle('article.new')}
              </div>
            </Button>
          )}
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
};*/