'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VoiceStatus, SupportedLanguageCode } from '@/types/voice';

interface SpeechRecognitionProps {
  onResult: (text: string) => void;
  onStatusChange: (status: VoiceStatus) => void;
  language: SupportedLanguageCode;
  isActive: boolean;
}

export const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  onResult,
  onStatusChange,
  language,
  isActive,
}) => {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = language;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        onStatusChange('listening');
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        const confidence = event.results[event.results.length - 1][0].confidence;
        
        // Basic noise filtering based on confidence
        if (confidence > 0.8) {
          onResult(transcript);
        } else {
          console.warn('[SpeechRecognition] Low confidence result ignored:', transcript, confidence);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('[SpeechRecognition] Error:', event.error);
        onStatusChange('error');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (isActive) {
          recognitionRef.current.start();
        } else {
          onStatusChange('idle');
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onResult, onStatusChange]);

  useEffect(() => {
    if (isActive && recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    } else if (!isActive && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isActive, isListening]);

  return null; // This is a headless component
};
