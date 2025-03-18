/*import React from 'react';
import { api } from '@/api';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectShimmer,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/common';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { getErrorMessage } from '@/utils/errors';
import { useRouter } from 'next/router';
import { Currency, Article } from '@/types';
import { UneditableInput } from '@/components/ui/uneditable/uneditable-input';

import { useMutation } from '@tanstack/react-query';
import { ArticleActionDialog } from '../dialogs/ArticleActionDialog';
import { ArticleDeleteDialog } from '../dialogs/ArticleDeleteDialog';

interface ArticleLifecycle {
  label: string;
  key: string;
  variant: 'default' | 'outline';
  icon: React.ReactNode;
  onClick?: () => void;
  loading: boolean;
  when: {
    membership: 'IN' | 'OUT';
    set: (ARTICLE_STATUS | undefined)[];
  };
}

interface ArticleControlSectionProps {
  className?: string;
  status?: ARTICLE_STATUS;
  isDataAltered?: boolean;
  currencies: Currency[];
  handleSubmit?: () => void;
  handleSubmitDraft: () => void;
  handleSubmitValidated: () => void;
  handleSubmitDuplicate?: () => void;
  reset: () => void;
  loading?: boolean;
  edit?: boolean;
}

export const ArticleControlSection = ({
  className,
  status = undefined,
  isDataAltered,
  currencies,
  handleSubmit,
  handleSubmitDraft,
  handleSubmitValidated,
  handleSubmitDuplicate,
  reset,
  loading,
  edit = true
}: ArticleControlSectionProps) => {
  const router = useRouter();
  const { t: tArticle } = useTranslation('article');
  const { t: tCommon } = useTranslation('common');
  const { t: tCurrency } = useTranslation('currency');

  const articleManager = useArticleManager();
  const controlManager = useArticleControlManager();

  // Action dialog
  const [actionDialog, setActionDialog] = React.useState<boolean>(false);
  const [actionName, setActionName] = React.useState<string>();
  const [action, setAction] = React.useState<() => void>(() => {});

  // Duplicate dialog
  const [duplicateDialog, setDuplicateDialog] = React.useState(false);

  // Duplicate Article
  const { mutate: duplicateArticle, isPending: isDuplicationPending } = useMutation({
    mutationFn: (id: number) => api.article.duplicate(id),
    onSuccess: async (data) => {
      toast.success(tArticle('article.action_duplicate_success'));
      await router.push('/inventory/article/' + data.id);
      setDuplicateDialog(false);
    },
    onError: (error) => {
      toast.error(
        getErrorMessage('article', error, tArticle('article.action_duplicate_failure'))
      );
    }
  });

  // Delete dialog
  const [deleteDialog, setDeleteDialog] = React.useState(false);

  // Delete Article
  const { mutate: removeArticle, isPending: isDeletePending } = useMutation({
    mutationFn: (id: number) => api.article.remove(id),
    onSuccess: () => {
      toast.success(tArticle('article.action_remove_success'));
      router.push('/inventory/articles');
    },
    onError: (error) => {
      toast.error(getErrorMessage('', error, tArticle('article.action_remove_failure')));
    }
  });

  const buttonsWithHandlers: ArticleLifecycle[] = [
    {
      ...ARTICLE_LIFECYCLE_ACTIONS.save,
      key: 'save',
      onClick: () => {
        setActionName(tCommon('commands.save'));
        !!handleSubmit &&
          setAction(() => {
            return () => handleSubmit();
          });
        setActionDialog(true);
      },
      loading: false
    },
    {
      ...ARTICLE_LIFECYCLE_ACTIONS.draft,
      key: 'draft',
      onClick: () => {
        setActionName(tCommon('commands.save'));
        !!handleSubmitDraft &&
          setAction(() => {
            return () => handleSubmitDraft();
          });
        setActionDialog(true);
      },
      loading: false
    },
    {
      ...ARTICLE_LIFECYCLE_ACTIONS.validated,
      key: 'validated',
      onClick: () => {
        setActionName(tCommon('commands.validate'));
        !!handleSubmitValidated &&
          setAction(() => {
            return () => handleSubmitValidated();
          });
        setActionDialog(true);
      },
      loading: false
    },
    {
      ...ARTICLE_LIFECYCLE_ACTIONS.duplicate,
      key: 'duplicate',
      onClick: () => {
        setDuplicateDialog(true);
      },
      loading: false
    },
    {
      ...ARTICLE_LIFECYCLE_ACTIONS.delete,
      key: 'delete',
      onClick: () => {
        setDeleteDialog(true);
      },
      loading: false
    },
    {
      ...ARTICLE_LIFECYCLE_ACTIONS.reset,
      key: 'reset',
      onClick: () => {
        setActionName(tCommon('commands.initialize'));
        !!reset &&
          setAction(() => {
            return () => reset();
          });
        setActionDialog(true);
      },
      loading: false
    }
  ];

  return (
    <>
      <ArticleActionDialog
        id={articleManager?.id || 0}
        action={actionName}
        open={actionDialog}
        callback={action}
        isCallbackPending={loading}
        onClose={() => setActionDialog(false)}
      />
      <ArticleDuplicateDialog
        id={articleManager?.id || 0}
        open={duplicateDialog}
        duplicateArticle={() => {
          articleManager?.id && duplicateArticle(articleManager?.id);
        }}
        isDuplicationPending={isDuplicationPending}
        onClose={() => setDuplicateDialog(false)}
      />
      <ArticleDeleteDialog
        id={articleManager?.id || 0}
        open={deleteDialog}
        deleteArticle={() => {
          articleManager?.id && removeArticle(articleManager?.id);
        }}
        isDeletionPending={isDeletePending}
        onClose={() => setDeleteDialog(false)}
      />

      <div className={cn(className)}>
        <div className="flex flex-col border-b w-full gap-2 pb-5">
          {/* Article status *//*}
          {status && (
            <Label className="text-base my-2 text-center">
              <span className="font-bold">{tArticle('article.attributes.status')} :</span>
              <span className="font-extrabold text-gray-500 mx-2">{tArticle(status)}</span>
            </Label>
          )}
          {/* Article lifecycle actions }*/
         /* {buttonsWithHandlers.map((lifecycle: ArticleLifecycle) => {
            const idisplay = lifecycle.when?.set?.includes(status);
            const display = lifecycle.when?.membership == 'IN' ? idisplay : !idisplay;
            const disabled =
              isDataAltered && (lifecycle.key === 'save' || lifecycle.key === 'reset');
            return (
              display && (
                <Button
                  disabled={disabled}
                  variant={lifecycle.variant}
                  key={lifecycle.label}
                  className="flex items-center"
                  onClick={lifecycle.onClick}>
                  {lifecycle.icon}
                  <span className="mx-1">{tCommon(lifecycle.label)}</span>
                  <Spinner className="ml-2" size={'small'} show={lifecycle.loading} />
                </Button>
              )
            );
          })}
        </div>

        {/* Currency choices *//*}
        <div className="border-b w-full mt-5">
          <h1 className="font-bold">{tArticle('controls.currency_details')}</h1>
          {edit ? (
            <div>
              {currencies.length != 0 && (
                <div className="my-5">
                  <SelectShimmer isPending={loading}>
                    <Select
                      key={articleManager.currency?.id || 'currency'}
                      onValueChange={(e) => {
                        articleManager.set(
                          'currency',
                          currencies.find((currency) => currency.id == parseInt(e))
                        );
                      }}
                      defaultValue={articleManager?.currency?.id?.toString() || ''}>
                      <SelectTrigger className="mty1 w-full">
                        <SelectValue
                          placeholder={tArticle('controls.currency_select_placeholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies?.map((currency: Currency) => {
                          return (
                            <SelectItem
                              key={currency.id}
                              value={currency?.id?.toString() || ''}>
                              {currency?.code && tCurrency(currency?.code)} ({currency.symbol})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </SelectShimmer>
                </div>
              )}
            </div>
          ) : (
            <UneditableInput
              className="font-bold my-4"
              value={
                articleManager.currency &&
                `${articleManager.currency?.code && tCurrency(articleManager.currency?.code)} (${articleManager?.currency?.symbol})`
              }
            />
          )}
        </div>

        {/* Article description switch *//*}
        <div className={cn('w-full py-5', !controlManager.isArticleDescriptionHidden && 'border-b')}>
          <h1 className="font-bold">{tArticle('controls.article_description')}</h1>
          <div className="flex w-full items-center mt-1">
            <Label className="w-full">{tArticle('controls.article_description')}</Label>
            <div className="w-full m-1 text-right">
              <Switch
                onClick={() => {
                  controlManager.set(
                    'isArticleDescriptionHidden',
                    !controlManager.isArticleDescriptionHidden
                  );
                }}
                {...{ checked: !controlManager.isArticleDescriptionHidden }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};*/