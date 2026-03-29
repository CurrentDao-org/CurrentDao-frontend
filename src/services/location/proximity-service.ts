import { Coordinates, Trader, LocationPricingConfig } from '@/types/location';
import { locationService } from './location-service';

export const proximityService = {
  // Simulated data for demo purposes
  mockTraders: [
    {
      id: '1',
      name: 'Solar Hub Alpha',
      coordinates: { latitude: 34.0522, longitude: -118.2437 }, // Los Angeles
      energyType: 'Solar',
      pricePerUnit: 0.12,
      availableQuantity: 500,
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Wind Farm Beta',
      coordinates: { latitude: 34.0622, longitude: -118.2537 },
      energyType: 'Wind',
      pricePerUnit: 0.15,
      availableQuantity: 1200,
      rating: 4.5,
    },
    {
      id: '3',
      name: 'Community Battery Gamma',
      coordinates: { latitude: 34.0422, longitude: -118.2337 },
      energyType: 'Battery',
      pricePerUnit: 0.18,
      availableQuantity: 200,
      rating: 4.9,
    },
  ],

  async findNearbyTraders(
    currentLocation: Coordinates,
    radiusKm: number = 5
  ): Promise<Trader[]> {
    // In a real app, this would be an API call
    return this.mockTraders
      .map((trader) => ({
        ...trader,
        distance: locationService.calculateDistance(currentLocation, trader.coordinates),
      }))
      .filter((trader) => trader.distance <= radiusKm)
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  },

  calculateLocationBasedPrice(
    trader: Trader,
    userLocation: Coordinates,
    config: LocationPricingConfig
  ): number {
    const distance = locationService.calculateDistance(userLocation, trader.coordinates);
    
    // Price reduces if trader is closer
    const proximityDiscount = Math.max(0, distance * config.proximityDiscountRate);
    const adjustedPrice = (trader.pricePerUnit - proximityDiscount) * config.regionalMultiplier;
    
    return Math.max(0.01, adjustedPrice); // Minimum price
  },

  getRegionalDemandMultiplier(location: Coordinates): number {
    // Simulated logic: higher demand in city centers
    // This could be based on real-time data from an API
    return 1.1; 
  },
};
