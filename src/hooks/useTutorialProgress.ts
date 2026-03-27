'use client';

import { useState, useEffect, useCallback } from 'react';
import { OnboardingState } from '../types/onboarding';

const STORAGE_KEY = 'tutorial_progress';

const initialState: OnboardingState = {
  isTutorialActive: false,
  currentStepIndex: 0,
  completedSteps: [],
  isDismissed: false,
};

export function useTutorialProgress() {
  const [state, setState] = useState<OnboardingState>(initialState);

  // Load progress from local storage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      setState(JSON.parse(savedProgress));
    }
  }, []);

  // Persist state changes
  const updateState = useCallback((updater: (prev: OnboardingState) => OnboardingState) => {
    setState((prev) => {
      const newState = updater(prev);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const startTutorial = useCallback(() => {
    updateState((s) => ({ ...s, isTutorialActive: true, isDismissed: false, currentStepIndex: 0 }));
  }, [updateState]);

  const nextStep = useCallback((stepId: string) => {
    updateState((s) => ({
      ...s,
      currentStepIndex: s.currentStepIndex + 1,
      completedSteps: Array.from(new Set([...s.completedSteps, stepId])),
    }));
  }, [updateState]);

  const prevStep = useCallback(() => {
    updateState((s) => ({
      ...s,
      currentStepIndex: Math.max(0, s.currentStepIndex - 1),
    }));
  }, [updateState]);

  const skipTutorial = useCallback(() => {
    updateState((s) => ({ ...s, isTutorialActive: false, isDismissed: true }));
  }, [updateState]);

  const resetTutorial = useCallback(() => {
    const newState = { ...initialState };
    updateState(() => newState);
  }, [updateState]);

  return {
    ...state,
    startTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    resetTutorial,
  };
}
