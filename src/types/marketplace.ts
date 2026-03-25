export type RenewableSource = 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass';

export interface EnergyListing {
  id: string;
  providerName: string;
  providerLogoUrl: string;
  providerRating: number; // 1-5
  quantityKwh: number;
  pricePerKwh: number;
  location: {
    city: string;
    state: string;
    country: string;
  };
  renewableSource: RenewableSource;
  createdAt: string; // ISO 8601 date string
  expiresAt: string; // ISO 8601 date string
  currentBid?: {
    amount: number;
    bidder: string;
    timestamp: string;
  };
}

export interface MarketplaceFilters {
  priceRange: [number, number];
  quantityRange: [number, number];
  location: string;
  renewableSources: RenewableSource[];
}

export type SortKey = 'price' | 'time' | 'rating';
export type SortDirection = 'asc' | 'desc';

export interface SortOption {
  key: SortKey;
  direction: SortDirection;
}