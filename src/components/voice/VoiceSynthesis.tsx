'use client';

import React, { useEffect, useCallback } from 'react';
import { VoiceStatus, SupportedLanguageCode } from '@/types/voice';

interface VoiceSynthesisProps {
  text: string;
  language: SupportedLanguageCode;
  onStatusChange: (status: VoiceStatus) => void;
  onComplete: () => void;
}

export const VoiceSynthesis: React.FC<VoiceSynthesisProps> = ({
  text,
  language,
  onStatusChange,
  onComplete,
}) => {
  const speak = useCallback((textToSpeak: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = language;
    
    // Select a voice that matches the language
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => onStatusChange('speaking');
    utterance.onend = () => {
      onStatusChange('idle');
      onComplete();
    };
    utterance.onerror = (event) => {
      console.error('[VoiceSynthesis] Error:', event.error);
      onStatusChange('error');
    };

    window.speechSynthesis.speak(utterance);
  }, [language, onStatusChange, onComplete]);

  useEffect(() => {
    if (text) {
      speak(text);
    }
  }, [text, speak]);

  return null; // This is a headless component
};
