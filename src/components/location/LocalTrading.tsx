'use client';

import React, { useState } from 'react';
import { Trader, Coordinates } from '@/types/location';

interface LocalTradingProps {
  currentLocation: Coordinates | null;
  selectedTrader: Trader | null;
  onTradeComplete: (trader: Trader, amount: number) => void;
}

const LocalTrading: React.FC<LocalTradingProps> = ({
  currentLocation,
  selectedTrader,
  onTradeComplete,
}) => {
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!selectedTrader) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">Select a nearby trader from the list to start trading.</p>
      </div>
    );
  }

  const handleTrade = async () => {
    setIsProcessing(true);
    // Simulate a brief delay for processing
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onTradeComplete(selectedTrader, tradeAmount);
    setIsProcessing(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Trade with {selectedTrader.name}</h3>
        <span className="text-sm font-medium px-3 py-1 bg-green-50 text-green-700 rounded-full">
          Active Connection
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Trade Configuration</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity (kWh)
            </label>
            <input
              type="number"
              min="1"
              max={selectedTrader.availableQuantity}
              value={tradeAmount}
              onChange={(e) => setTradeAmount(parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Max available: {selectedTrader.availableQuantity} kWh
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between mb-1">
              <span className="text-sm text-blue-700 font-medium">Estimated Total</span>
              <span className="text-lg font-bold text-blue-900">
                ${(tradeAmount * selectedTrader.pricePerUnit).toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-blue-600">
              * Includes local proximity discount applied automatically.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-gray-700">Trader Location Info</h4>
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Approx. Distance:</span>
              <span className="font-medium">{selectedTrader.distance?.toFixed(2)} km</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Coordinates:</span>
              <span className="font-mono text-gray-800">
                {selectedTrader.coordinates.latitude.toFixed(4)}, {selectedTrader.coordinates.longitude.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Energy Type:</span>
              <span className="font-medium text-blue-600">{selectedTrader.energyType}</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 italic">
            Location services are continuously monitoring proximity to ensure stable connection during trade.
          </div>
        </div>
      </div>

      <button
        onClick={handleTrade}
        disabled={isProcessing || tradeAmount <= 0}
        className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all transform active:scale-95 ${
          isProcessing || tradeAmount <= 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing Trade...
          </span>
        ) : (
          `Complete Trade with ${selectedTrader.name}`
        )}
      </button>
    </div>
  );
};

export default LocalTrading;
