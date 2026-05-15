'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { Answers } from './types';

interface SurveyContextValue {
  answers: Answers;
  setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  reset: () => void;
}

const SurveyContext = createContext<SurveyContextValue | null>(null);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});

  const setAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const reset = () => setAnswers({});

  return (
    <SurveyContext.Provider value={{ answers, setAnswer, reset }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurvey must be used within SurveyProvider');
  return ctx;
}
