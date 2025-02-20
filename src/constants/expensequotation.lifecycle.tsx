import { EXPENSQUOTATION_STATUS } from '@/types';
import {
  Archive,
  Check,
  Copy,
  FileCheck,
  FilePlus,
  Printer,
  Save,
  Send,
  Trash,
  X
} from 'lucide-react';

export interface ExpenseQuotationLifecycle {
  label: string;
  variant: 'default' | 'outline';
  icon: React.ReactNode;
  when: { set: (EXPENSQUOTATION_STATUS | undefined)[]; membership: 'IN' | 'OUT' };
}

export const EXPENSE_QUOTATION_LIFECYCLE_ACTIONS: Record<string, ExpenseQuotationLifecycle> = {
  save: {
    label: 'commands.save',
    variant: 'default',
    icon: <Save className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined]
    }
  },
  draft: {
    label: 'commands.draft',
    variant: 'default',

    icon: <Save className="h-5 w-5" />,
    when: { membership: 'IN', set: [undefined] }
  },
  validated: {
    label: 'commands.validate',
    variant: 'default',

    icon: <FilePlus className="h-5 w-5" />,
    when: {
      membership: 'IN',
      set: [undefined, EXPENSQUOTATION_STATUS.Draft, EXPENSQUOTATION_STATUS.Sent]
    }
  },
  sent: {
    label: 'commands.send',
    variant: 'default',
    icon: <Send className="h-5 w-5" />,
    when: {
      membership: 'IN',
      set: [undefined, EXPENSQUOTATION_STATUS.Draft, EXPENSQUOTATION_STATUS.Validated]
    }
  },
  accepted: {
    label: 'commands.accept',
    variant: 'default',
    icon: <Check className="h-5 w-5" />,
    when: {
      membership: 'IN',
      set: [EXPENSQUOTATION_STATUS.Sent]
    }
  },
  rejected: {
    label: 'commands.reject',
    variant: 'default',
    icon: <X className="h-5 w-5" />,
    when: {
      membership: 'IN',
      set: [EXPENSQUOTATION_STATUS.Sent]
    }
  },
  invoiced: {
    label: 'commands.to_invoice',
    variant: 'default',
    icon: <FileCheck className="h-5 w-5" />,
    when: {
      membership: 'IN',
      set: [EXPENSQUOTATION_STATUS.Accepted, EXPENSQUOTATION_STATUS.Invoiced]
    }
  },
  duplicate: {
    label: 'commands.duplicate',
    variant: 'default',
    icon: <Copy className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined]
    }
  },
  download: {
    label: 'commands.download',
    variant: 'default',
    icon: <Printer className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined]
    }
  },
  delete: {
    label: 'commands.delete',
    variant: 'default',
    icon: <Trash className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined, EXPENSQUOTATION_STATUS.Sent]
    }
  },
  archive: {
    label: 'commands.archive',
    variant: 'outline',
    icon: <Archive className="h-5 w-5" />,
    when: { set: [], membership: 'OUT' }
  },
  reset: {
    label: 'commands.initialize',
    variant: 'outline',
    icon: <X className="h-5 w-5" />,
    when: {
      membership: 'OUT',
      set: [undefined]
    }
  }
};
