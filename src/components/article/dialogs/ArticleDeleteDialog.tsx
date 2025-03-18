import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ArticleDeleteDialogProps {
  id?: number;
  open: boolean;
  deleteArticle: () => void;
  onClose: () => void;
}

export const ArticleDeleteDialog: React.FC<ArticleDeleteDialogProps> = ({
  id,
  open,
  deleteArticle,
  onClose,
}) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer l'article</DialogTitle>
        </DialogHeader>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={deleteArticle}>
            Supprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};