import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/common';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { useMediaQuery } from '@/hooks/other/useMediaQuery';
import { Label } from '@/components/ui/label';

interface ArticleActionDialogProps {
  className?: string;
  id?: number;
  action?: string;
  title: string;
  open: boolean;
  callback: () => void;
  isCallbackPending?: boolean;
  onClose: () => void;
}

export const ArticleActionDialog: React.FC<ArticleActionDialogProps> = ({
  className,
  id,
  action,
  title,
  open,
  callback,
  isCallbackPending,
  onClose,
}) => {
  const { t: tCommon } = useTranslation('common');
  const isDesktop = useMediaQuery('(min-width: 1500px)');

  const header = (
    <Label className="leading-5">
      Voulez-vous vraiment {action?.toLowerCase()} l'article{' '}
      <span className="font-semibold">{title}</span> ?
    </Label>
  );

  const footer = (
    <div className="flex gap-2 mt-2 items-center justify-center">
      <Button
        className="w-1/2 flex gap-2"
        onClick={() => {
          callback();
          onClose();
        }}
      >
        <Check />
        {action}
        <Spinner className="ml-2" size={'small'} show={isCallbackPending} />
      </Button>
      <Button
        className="w-1/2 flex gap-2"
        variant={'secondary'}
        onClick={() => {
          onClose();
        }}
      >
        <X />
        {tCommon('answer.no')}
      </Button>
    </div>
  );

  if (isDesktop)
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className={cn('max-w-[25vw] p-8', className)}>
          <DialogHeader>
            <DialogTitle />
            <DialogDescription className="flex gap-2 pt-4 items-center px-2">
              {header}
            </DialogDescription>
          </DialogHeader>
          {footer}
        </DialogContent>
      </Dialog>
    );

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle />
          <DrawerDescription className="flex gap-2 pt-4 items-center px-2">
            {header}
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="border-t pt-2">{footer}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};