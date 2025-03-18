/*import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { useArticleActions } from '../data-table/ActionsContext';

interface ArticleGeneralConditionsProps {
  className?: string;
  hidden?: boolean;
  isPending?: boolean;
  defaultCondition?: string;
  edit?: boolean;
}

export const ArticleGeneralConditions = ({
  className,
  hidden,
  isPending,
  defaultCondition,
  edit = true
}: ArticleGeneralConditionsProps) => {
  const router = useRouter();
  const { t: tArticle } = useTranslation('article');
  const { t: tSettings } = useTranslation('settings');

  const { description, setDescription } = useArticleActions();

  return (
    <div className={cn(className)}>
      {!hidden && (
        <div className="flex flex-col gap-4">
          <Textarea
            disabled={!edit}
            placeholder={tArticle('article.attributes.description')}
            className="resize-none"
            value={description || ''}
            onChange={(e) => setDescription?.(e.target.value)}
            isPending={isPending}
            rows={7}
          />
          {edit && defaultCondition && (
            <div className="flex items-center gap-4">
              <div className="flex gap-2 items-center">
                <Button
                  disabled={description === defaultCondition}
                  onClick={() => {
                    setDescription?.(defaultCondition);
                  }}>
                  {tArticle('article.use_default_description')}
                </Button>
                <Button
                  variant={'secondary'}
                  onClick={() => {
                    setDescription?.('');
                  }}>
                  Clear
                </Button>
              </div>
            </div>
          )}
          {edit && !defaultCondition && (
            <Label
              className="font-bold underline cursor-pointer"
              onClick={() => router.push('/settings/system/descriptions')}>
              {tSettings('default_description.not_set')}
            </Label>
          )}
        </div>
      )}
    </div>
  );
};*/