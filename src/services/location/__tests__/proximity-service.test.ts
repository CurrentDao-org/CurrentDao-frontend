import { proximityService } from '../proximity-service';
import { Coordinates, LocationPricingConfig, Trader } from '@/types/location';

describe('proximityService', () => {
  const userLocation: Coordinates = {
    latitude: 34.0522,
    longitude: -118.2437, // Los Angeles
  };

  const mockTrader: Trader = {
    id: '1',
    name: 'Solar Hub Alpha',
    coordinates: { latitude: 34.0522, longitude: -118.2437 }, // At the same location
    energyType: 'Solar',
    pricePerUnit: 0.12,
    availableQuantity: 500,
    rating: 4.8,
  };

  it('finds nearby traders correctly', async () => {
    const nearby = await proximityService.findNearbyTraders(userLocation, 10);
    expect(nearby.length).toBeGreaterThan(0);
    expect(nearby[0].distance).toBe(0); // Solar Hub Alpha is at user location
  });

  it('calculates location-based pricing correctly', () => {
    const config: LocationPricingConfig = {
      basePrice: 0.15,
      proximityDiscountRate: 0.01, // $0.01 discount per km
      regionalMultiplier: 1.0,
    };

    // Trader at distance 0
    const priceAtDistanceZero = proximityService.calculateLocationBasedPrice(
      mockTrader,
      userLocation,
      config
    );
    expect(priceAtDistanceZero).toBe(0.12); // No distance discount

    // Trader at distance 5km
    const farLocation: Coordinates = { latitude: 34.0922, longitude: -118.2437 }; // ~4.5km
    const priceAtDistanceFar = proximityService.calculateLocationBasedPrice(
      mockTrader,
      farLocation,
      config
    );
    expect(priceAtDistanceFar).toBeLessThan(0.12);
  });

  it('gets regional demand multiplier', () => {
    const multiplier = proximityService.getRegionalDemandMultiplier(userLocation);
    expect(multiplier).toBe(1.1);
  });
});
