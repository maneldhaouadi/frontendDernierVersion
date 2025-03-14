import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

interface ExpensePaymentControlSectionProps {
  className?: string;
  isDataAltered?: boolean;
  handleSubmit?: () => void;
  reset: () => void;
  loading?: boolean;
}

export const ExpensePaymentControlSection = ({
  className,
  isDataAltered,
  handleSubmit,
  reset,
  loading
}: ExpensePaymentControlSectionProps) => {
  const router = useRouter();
  const { t: tCommon } = useTranslation('common');

  const [calculatorInput, setCalculatorInput] = useState('');
  const [calculatorResult, setCalculatorResult] = useState('');

  const handleCalculatorButtonClick = (value: string) => {
    if (value === '=') {
      try {
        const expression = calculatorInput.replace(/×/g, '*');
        setCalculatorResult(eval(expression).toString());
      } catch (error) {
        setCalculatorResult('Error');
      }
    } else if (value === 'C') {
      setCalculatorInput('');
      setCalculatorResult('');
    } else if (value === '←') {
      if (calculatorInput.length > 0) {
        setCalculatorInput((prev) => prev.slice(0, -1));
      }
    } else {
      setCalculatorInput((prev) => prev + value);
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col w-full gap-2">
        <Button className="flex items-center" onClick={handleSubmit}>
          <Save className="h-5 w-5" />
          <span className="mx-1">{tCommon('commands.save')}</span>
        </Button>
        <Button className="flex items-center" variant={'outline'} onClick={reset}>
          <Save className="h-5 w-5" />
          <span className="mx-1">{tCommon('commands.initialize')}</span>
        </Button>
      </div>
    </div>
  );
};