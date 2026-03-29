export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationPrivacy {
  hideLocation: boolean;
  blurRadius: number; // In meters, to provide approximate location
  shareWithContactsOnly: boolean;
}

export interface Trader {
  id: string;
  name: string;
  coordinates: Coordinates;
  distance?: number; // Calculated distance from current user
  energyType: string;
  pricePerUnit: number;
  availableQuantity: number;
  rating: number;
}

export interface GeolocationTradingState {
  currentLocation: Coordinates | null;
  nearbyTraders: Trader[];
  isTracking: boolean;
  error: string | null;
  privacy: LocationPrivacy;
  lastUpdate: number | null;
}

export interface LocationPricingConfig {
  basePrice: number;
  proximityDiscountRate: number; // Discount per km closer to user
  regionalMultiplier: number; // Multiplier based on local demand
}

export interface GeolocationAnalytics {
  totalTrades: number;
  averageDistance: number;
  popularLocations: {
    name: string;
    coordinates: Coordinates;
    tradeCount: number;
  }[];
  peakTradingTimes: {
    hour: number;
    count: number;
  }[];
}
