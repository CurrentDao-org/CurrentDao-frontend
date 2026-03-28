'use client';

import React from 'react';
import { VoiceStatus } from '@/types/voice';

interface VoiceCommandsProps {
  status: VoiceStatus;
  lastCommand?: string;
  error?: string;
}

export const VoiceCommands: React.FC<VoiceCommandsProps> = ({
  status,
  lastCommand,
  error,
}) => {
  const commands = [
    { label: 'Buy 100 BTC', description: 'Place a buy order for BTC' },
    { label: 'Sell 50 ETH at 2500', description: 'Place a sell order for ETH at a specific price' },
    { label: 'Check my status', description: 'View your account balance and open orders' },
    { label: 'What is the price of SOL?', description: 'Get the current market price of SOL' },
    { label: 'Cancel all orders', description: 'Cancel all your active trading orders' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Voice Commands</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            status === 'listening' ? 'bg-green-500 animate-pulse' :
            status === 'processing' ? 'bg-blue-500' :
            status === 'speaking' ? 'bg-purple-500' :
            status === 'error' ? 'bg-red-500' :
            'bg-gray-400'
          }`} />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 capitalize">
            {status}
          </span>
        </div>
      </div>

      {lastCommand && (
        <div className="mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded border-l-4 border-blue-500">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Command</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white italic">"{lastCommand}"</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/30 rounded border-l-4 border-red-500">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Try saying:</p>
        {commands.map((cmd, idx) => (
          <div key={idx} className="group p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-800">
            <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
              "{cmd.label}"
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {cmd.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Accuracy: &gt;95%</span>
          <span>Latency: &lt;500ms</span>
        </div>
      </div>
    </div>
  );
};
