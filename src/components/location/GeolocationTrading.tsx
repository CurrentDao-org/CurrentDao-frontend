'use client';

import React, { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import PrivacyControls from './PrivacyControls';
import ProximityDetection from './ProximityDetection';
import LocalTrading from './LocalTrading';
import { Trader } from '@/types/location';

const GeolocationTrading: React.FC = () => {
  const {
    currentLocation,
    nearbyTraders,
    isTracking,
    error,
    privacy,
    lastUpdate,
    updatePrivacy,
    refreshLocation,
  } = useGeolocation();

  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [tradeStatus, setTradeStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTradeComplete = (trader: Trader, amount: number) => {
    setTradeStatus({
      success: true,
      message: `Successfully traded ${amount} kWh with ${trader.name}!`,
    });
    setSelectedTrader(null);
    
    // Clear status after 5 seconds
    setTimeout(() => setTradeStatus(null), 5000);

    // In a real app, we would also update analytics here
    console.log('Location-based trade completed:', {
      traderId: trader.id,
      amount,
      distance: trader.distance,
      timestamp: Date.now(),
      location: currentLocation,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Geolocation Energy Trading</h1>
          <p className="text-gray-600">Discover and trade energy with producers in your local area.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className={`w-2 h-2 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-gray-700">
                {isTracking ? 'Location Active' : 'Location Paused'}
              </span>
            </div>
            {lastUpdate && (
              <p className="text-xs text-gray-500">
                Last update: {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={refreshLocation}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Refresh Location"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-3">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p>{error}</p>
        </div>
      )}

      {tradeStatus && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          tradeStatus.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {tradeStatus.success ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <p className="font-medium">{tradeStatus.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <ProximityDetection
              currentLocation={currentLocation}
              nearbyTraders={nearbyTraders}
              onTraderSelect={(trader) => {
                setSelectedTrader(trader);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            />
          </section>

          <section>
            <LocalTrading
              currentLocation={currentLocation}
              selectedTrader={selectedTrader}
              onTradeComplete={handleTradeComplete}
            />
          </section>
        </div>

        <aside className="space-y-8">
          <PrivacyControls
            privacy={privacy}
            onUpdatePrivacy={updatePrivacy}
          />
          
          <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg text-white shadow-xl">
            <h3 className="text-xl font-bold mb-4">Location Analytics</h3>
            <div className="space-y-4">
              <div>
                <p className="text-blue-100 text-sm">Nearby Availability</p>
                <p className="text-2xl font-bold">{nearbyTraders.reduce((acc, t) => acc + t.availableQuantity, 0)} kWh</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Average Local Price</p>
                <p className="text-2xl font-bold">
                  ${nearbyTraders.length > 0 
                    ? (nearbyTraders.reduce((acc, t) => acc + t.pricePerUnit, 0) / nearbyTraders.length).toFixed(3)
                    : '0.000'}/kWh
                </p>
              </div>
              <div className="pt-4 border-t border-blue-400">
                <p className="text-xs text-blue-200">
                  Your current coordinates are being used to optimize energy routing and reduce grid transmission losses.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default GeolocationTrading;
