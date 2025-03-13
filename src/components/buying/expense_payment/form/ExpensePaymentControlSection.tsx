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

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">{tCommon('calculator.title')}</h2>
          <div className="p-6 border-2 border-blue-300 rounded-lg shadow-md bg-white">
            <div className="mb-6">
              <div className="text-right text-gray-700 text-2xl p-3 border-2 border-blue-300 rounded bg-gray-50">
                {calculatorInput || '0'}
              </div>
              <div className="text-right text-gray-900 text-3xl font-bold p-3">
                {calculatorResult || '0'}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {['C', '←', '%', '/'].map((button) => (
                <button
                  key={button}
                  onClick={() => handleCalculatorButtonClick(button)}
                  className={`
                    p-4 text-xl font-bold rounded-lg
                    ${button === 'C' ? 'bg-blue-300 text-white' : 'bg-blue-100 text-blue-700'}
                    hover:bg-blue-200 transition-all border-2 border-blue-300
                  `}
                >
                  {button}
                </button>
              ))}

              {['7', '8', '9', '×'].map((button) => (
                <button
                  key={button}
                  onClick={() => handleCalculatorButtonClick(button)}
                  className={`
                    p-4 text-xl font-bold rounded-lg
                    ${button === '×' ? 'bg-blue-300 text-white' : 'bg-blue-100 text-blue-700'}
                    hover:bg-blue-200 transition-all border-2 border-blue-300
                  `}
                >
                  {button}
                </button>
              ))}

              {['4', '5', '6', '-'].map((button) => (
                <button
                  key={button}
                  onClick={() => handleCalculatorButtonClick(button)}
                  className={`
                    p-4 text-xl font-bold rounded-lg
                    ${button === '-' ? 'bg-blue-300 text-white' : 'bg-blue-100 text-blue-700'}
                    hover:bg-blue-200 transition-all border-2 border-blue-300
                  `}
                >
                  {button}
                </button>
              ))}

              {['1', '2', '3', '+'].map((button) => (
                <button
                  key={button}
                  onClick={() => handleCalculatorButtonClick(button)}
                  className={`
                    p-4 text-xl font-bold rounded-lg
                    ${button === '+' ? 'bg-blue-300 text-white' : 'bg-blue-100 text-blue-700'}
                    hover:bg-blue-200 transition-all border-2 border-blue-300
                  `}
                >
                  {button}
                </button>
              ))}

              {['0', '.', '=', '+/-'].map((button) => (
                <button
                  key={button}
                  onClick={() => handleCalculatorButtonClick(button)}
                  className={`
                    p-4 text-xl font-bold rounded-lg
                    ${button === '=' ? 'bg-blue-300 text-white' : 'bg-blue-100 text-blue-700'}
                    hover:bg-blue-200 transition-all border-2 border-blue-300
                  `}
                >
                  {button}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};