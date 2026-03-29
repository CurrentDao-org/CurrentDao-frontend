export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface EnergyListing {
  id: string;
  title: string;
  type: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass';
  coordinates: Coordinates;
  price: number;
  capacity: number;
  available: boolean;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  createdAt: string;
  description?: string;
  deliveryCost?: number;
  distance?: number;
}

export interface LocationFilter {
  type: 'radius' | 'region' | 'gridZone';
  value: number | string;
  center?: Coordinates;
  radius?: number;
  region?: string;
  gridZone?: string;
}

export interface RegionalMarketData {
  region: string;
  averagePrice: number;
  priceTrend: 'up' | 'down' | 'stable';
  totalListings: number;
  totalCapacity: number;
  coordinates: Coordinates;
  lastUpdated: string;
}

export interface HeatMapPoint {
  coordinates: Coordinates;
  intensity: number;
  label?: string;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
  bounds?: MapBounds;
}

export interface UserLocation {
  coordinates: Coordinates;
  accuracy: number;
  timestamp: number;
  permission: 'granted' | 'denied' | 'prompt';
}

export interface DistanceCalculation {
  from: Coordinates;
  to: Coordinates;
  distance: number;
  unit: 'km' | 'miles';
  estimatedCost: number;
  estimatedTime: number;
}

export interface LocationPreferences {
  defaultRadius: number;
  preferredRegions: string[];
  savedLocations: Array<{
    id: string;
    name: string;
    coordinates: Coordinates;
  }>;
  notifications: {
    nearbyListings: boolean;
    priceAlerts: boolean;
    regionalUpdates: boolean;
  };
}

export interface MapMarker {
  id: string;
  position: Coordinates;
  type: 'listing' | 'user' | 'region' | 'heat';
  data: EnergyListing | RegionalMarketData | HeatMapPoint | UserLocation;
  selected?: boolean;
  visible?: boolean;
}

export interface MapCluster {
  id: string;
  center: Coordinates;
  markers: MapMarker[];
  count: number;
  bounds: MapBounds;
}

export interface MapState {
  viewport: MapViewport;
  markers: MapMarker[];
  clusters: MapCluster[];
  filters: LocationFilter[];
  userLocation: UserLocation | null;
  selectedMarker: MapMarker | null;
  isLoading: boolean;
  error: string | null;
}

export interface GeolocationOptions {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}

export type MapProvider = 'leaflet' | 'mapbox' | 'google';

export interface MapConfig {
  provider: MapProvider;
  apiKey?: string;
  defaultCenter: Coordinates;
  defaultZoom: number;
  maxZoom: number;
  minZoom: number;
  clusterEnabled: boolean;
  heatMapEnabled: boolean;
}
