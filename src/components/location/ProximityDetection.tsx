'use client';

import React from 'react';
import { Trader, Coordinates } from '@/types/location';
import { proximityService } from '@/services/location/proximity-service';

interface ProximityDetectionProps {
  currentLocation: Coordinates | null;
  nearbyTraders: Trader[];
  onTraderSelect: (trader: Trader) => void;
}

const ProximityDetection: React.FC<ProximityDetectionProps> = ({
  currentLocation,
  nearbyTraders,
  onTraderSelect,
}) => {
  if (!currentLocation) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <p className="text-gray-500">Waiting for location access to detect nearby traders...</p>
      </div>
    );
  }

  const pricingConfig = {
    basePrice: 0.15,
    proximityDiscountRate: 0.005, // $0.005 discount per km
    regionalMultiplier: proximityService.getRegionalDemandMultiplier(currentLocation),
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Nearby Traders (within 5km)</h3>
      
      {nearbyTraders.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200 text-gray-500">
          No traders found in your immediate vicinity.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {nearbyTraders.map((trader) => {
            const localPrice = proximityService.calculateLocationBasedPrice(
              trader,
              currentLocation,
              pricingConfig
            );

            return (
              <div
                key={trader.id}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 transition-colors cursor-pointer group"
                onClick={() => onTraderSelect(trader)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {trader.name}
                  </h4>
                  <span className="text-sm font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                    {trader.distance?.toFixed(2)} km
                  </span>
                </div>
                
                <div className="space-y-1 mb-3">
                  <p className="text-sm text-gray-600 flex justify-between">
                    <span>Energy:</span>
                    <span className="font-medium text-gray-800">{trader.energyType}</span>
                  </p>
                  <p className="text-sm text-gray-600 flex justify-between">
                    <span>Base Price:</span>
                    <span className="text-gray-400 line-through">${trader.pricePerUnit}/kWh</span>
                  </p>
                  <p className="text-sm text-blue-600 flex justify-between font-semibold">
                    <span>Local Rate:</span>
                    <span>${localPrice.toFixed(3)}/kWh</span>
                  </p>
                  <p className="text-sm text-gray-600 flex justify-between">
                    <span>Available:</span>
                    <span className="font-medium text-gray-800">{trader.availableQuantity} kWh</span>
                  </p>
                </div>

                <div className="flex items-center text-sm text-yellow-600">
                  <span className="mr-1">★</span>
                  <span>{trader.rating} Rating</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProximityDetection;
