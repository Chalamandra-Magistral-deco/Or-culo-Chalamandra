import { useState, useCallback } from 'react';
import { StrategicMethod, ContextOption } from '../lib/types';
import { apiClient } from '../lib/apiClient';

export const useOracle = (initialMethods: StrategicMethod[]) => {
  const [selectedMethod, setSelectedMethod] = useState<StrategicMethod | null>(
    initialMethods.length > 0 ? initialMethods[0] : null
  );
  const [selectedContext, setSelectedContext] = useState<ContextOption>('Decisión laboral');
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!selectedMethod) {
      setError('Por favor, selecciona un método estratégico.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedQuestions([]);

    try {
      const data = await apiClient.post<{ questions: string[] }>('/api/generate', {
        method: selectedMethod.name,
      });
      setGeneratedQuestions(data.questions);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al generar las preguntas.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMethod]);

  return {
    selectedMethod,
    setSelectedMethod,
    selectedContext,
    setSelectedContext,
    generatedQuestions,
    isLoading,
    error,
    handleGenerate,
  };
};
