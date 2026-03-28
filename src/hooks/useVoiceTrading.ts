import { useState, useCallback, useEffect } from 'react';
import { VoiceStatus, VoiceState, TradingCommand, SupportedLanguageCode } from '@/types/voice';
import { voiceService } from '@/services/voice/voice-service';

export const useVoiceTrading = () => {
  const [state, setState] = useState<VoiceState>({
    status: 'idle',
    isSupported: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
    language: 'en-US',
  });

  const setStatus = useCallback((status: VoiceStatus) => {
    setState(prev => ({ ...prev, status }));
  }, []);

  const setLanguage = useCallback((language: SupportedLanguageCode) => {
    setState(prev => ({ ...prev, language }));
  }, []);

  const processText = useCallback(async (text: string) => {
    setStatus('processing');
    try {
      const { command, processingTime } = await voiceService.processVoiceInput(text, state.language);
      
      setState(prev => ({
        ...prev,
        status: 'idle',
        lastCommand: command || undefined,
        error: !command ? 'Command not recognized' : undefined,
      }));

      return { command, processingTime };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Processing failed',
      }));
      return { command: null, processingTime: 0 };
    }
  }, [state.language, setStatus]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  return {
    ...state,
    setStatus,
    setLanguage,
    processText,
    clearError,
    analytics: voiceService.getAnalyticsSummary(),
  };
};
