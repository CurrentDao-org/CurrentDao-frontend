'use client';

import React, { useState, useCallback } from 'react';
import { useVoiceTrading } from '@/hooks/useVoiceTrading';
import { SpeechRecognition } from './SpeechRecognition';
import { VoiceSynthesis } from './VoiceSynthesis';
import { VoiceCommands } from './VoiceCommands';
import { SUPPORTED_LANGUAGES, SupportedLanguageCode } from '@/types/voice';

export const VoiceInterface: React.FC = () => {
  const {
    status,
    lastCommand,
    error,
    isSupported,
    language,
    setStatus,
    setLanguage,
    processText,
    clearError,
    analytics,
  } = useVoiceTrading();

  const [synthesisText, setSynthesisText] = useState('');
  const [isActive, setIsActive] = useState(false);

  const handleSpeechResult = useCallback(async (text: string) => {
    const { command, processingTime } = await processText(text);
    
    if (command) {
      let response = '';
      switch (command.intent) {
        case 'BUY':
          response = `Executing buy order for ${command.amount} ${command.pair} at ${command.price || 'market price'}. Total time: ${processingTime.toFixed(0)} milliseconds.`;
          break;
        case 'SELL':
          response = `Executing sell order for ${command.amount} ${command.pair} at ${command.price || 'market price'}. Total time: ${processingTime.toFixed(0)} milliseconds.`;
          break;
        case 'STATUS':
          response = 'Your account status: Portfolio balance is healthy, and all orders are currently active.';
          break;
        case 'PRICE_CHECK':
          response = `The current price of ${command.pair} is approximately 2,500 units.`;
          break;
        case 'CANCEL':
          response = 'Canceling all active orders. Please wait a moment.';
          break;
        default:
          response = 'Command recognized but no action defined.';
      }
      setSynthesisText(response);
    } else {
      setSynthesisText('I am sorry, I did not quite catch that command. Could you please repeat?');
    }
  }, [processText]);

  const handleSynthesisComplete = useCallback(() => {
    setSynthesisText('');
  }, []);

  if (!isSupported) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
        Voice trading is not supported in this browser. Please use a modern browser like Chrome or Edge.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Voice Trading Interface</h1>
          <p className="text-gray-600 dark:text-gray-400">Hands-free energy trading with voice commands</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voice Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguageCode)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Voice Activation</span>
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Voice Analytics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Commands</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-white">{analytics.totalCommands}</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">Success Rate</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-white">{analytics.successRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg col-span-2">
                  <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Avg. Processing Time</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-white">{analytics.averageProcessingTime.toFixed(0)}ms</p>
                </div>
              </div>
            </div>
          </div>

          <VoiceCommands
            status={status}
            lastCommand={lastCommand?.originalText}
            error={error}
          />
        </div>
      </div>

      <SpeechRecognition
        onResult={handleSpeechResult}
        onStatusChange={setStatus}
        language={language}
        isActive={isActive}
      />

      <VoiceSynthesis
        text={synthesisText}
        language={language}
        onStatusChange={setStatus}
        onComplete={handleSynthesisComplete}
      />
    </div>
  );
};
