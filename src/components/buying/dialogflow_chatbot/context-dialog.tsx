import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LanguageCode } from "@/types/Message";

export const ContextDialog = ({ 
  contexts,
  languageCode 
}: { 
  contexts: any[];
  languageCode: LanguageCode;
}) => {
  if (!contexts.length) return null;

  return (
    <Dialog open={contexts.length > 0}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {languageCode === 'fr' 
              ? 'Contextes actuels' 
              : languageCode === 'en' 
              ? 'Current contexts' 
              : 'Contextos actuales'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {contexts.map((ctx, i) => (
            <div key={i} className="p-2 border rounded">
              <pre>{JSON.stringify(ctx, null, 2)}</pre>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};