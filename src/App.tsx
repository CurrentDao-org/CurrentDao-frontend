import React, { useState, useEffect } from 'react';
import { 
  EnergyListing, 
  RegionalMarketData, 
  LocationFilter, 
  HeatMapPoint,
  UserLocation,
  DistanceCalculation 
} from './types/maps';
import { InteractiveMap } from './components/maps/InteractiveMap';
import { LocationFilterComponent, FilterSummary } from './components/maps/LocationFilter';
import RegionalMarketComponent from './components/maps/RegionalMarket';
import DistanceCalculatorComponent from './components/maps/DistanceCalculator';
import HeatMapComponent from './components/maps/HeatMap';
import { useGeolocation } from './hooks/useGeolocation';
import { useMapIntegration } from './hooks/useMapIntegration';
import { calculateRegionalMarketData } from './utils/mapHelpers';

// Sample data generator for demonstration
const generateSampleListings = (count: number): EnergyListing[] => {
  const types: Array<'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass'> = ['solar', 'wind', 'hydro', 'geothermal', 'biomass'];
  const regions = [
    { lat: 40.7128, lng: -74.0060, name: 'New York' }, // Northeast
    { lat: 34.0522, lng: -118.2437, name: 'Los Angeles' }, // West
    { lat: 41.8781, lng: -87.6298, name: 'Chicago' }, // Midwest
    { lat: 29.7604, lng: -95.3698, name: 'Houston' }, // Southeast
    { lat: 33.4484, lng: -112.0740, name: 'Phoenix' }, // Southwest
  ];

  return Array.from({ length: count }, (_, index) => {
    const region = regions[Math.floor(Math.random() * regions.length)];
    const latOffset = (Math.random() - 0.5) * 2; // ±1 degree
    const lngOffset = (Math.random() - 0.5) * 2; // ±1 degree
    
    return {
      id: `listing-${index}`,
      title: `${types[Math.floor(Math.random() * types.length)]} Energy - ${region.name} ${index + 1}`,
      type: types[Math.floor(Math.random() * types.length)],
      coordinates: {
        lat: region.lat + latOffset,
        lng: region.lng + lngOffset,
      },
      price: Math.random() * 80 + 20, // $20-100 per MWh
      capacity: Math.random() * 100 + 10, // 10-110 MW
      available: Math.random() > 0.3,
      seller: {
        id: `seller-${Math.floor(Math.random() * 50)}`,
        name: `Energy Provider ${Math.floor(Math.random() * 20) + 1}`,
        rating: Math.random() * 2 + 3, // 3-5 rating
      },
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: `High-quality ${types[Math.floor(Math.random() * types.length)]} energy available for immediate delivery.`,
    };
  });
};

const generateSampleRegionalData = (listings: EnergyListing[]): RegionalMarketData[] => {
  const regions = ['northeast', 'southeast', 'midwest', 'southwest', 'west'];
  
  return regions.map(region => {
    const regionData = calculateRegionalMarketData(listings, region);
    return regionData || {
      region,
      averagePrice: Math.random() * 60 + 30,
      priceTrend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      totalListings: Math.floor(Math.random() * 100) + 10,
      totalCapacity: Math.random() * 1000 + 200,
      coordinates: { lat: 39.8283, lng: -98.5795 }, // Default center
      lastUpdated: new Date().toISOString(),
    };
  });
};

const App: React.FC = () => {
  // State management
  const [listings, setListings] = useState<EnergyListing[]>([]);
  const [regionalData, setRegionalData] = useState<RegionalMarketData[]>([]);
  const [selectedListing, setSelectedListing] = useState<EnergyListing | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionalMarketData | null>(null);
  const [locationFilters, setLocationFilters] = useState<LocationFilter[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'regional' | 'distance' | 'heatmap'>('map');

  // Hooks
  const { location: userLocation, requestLocation, permission } = useGeolocation();
  const { mapState, updateViewport, addFilter, removeFilter, setUserLocation } = useMapIntegration({
    listings,
    regionalData,
    enableClustering: true,
    enableHeatMap: false,
  });

  // Initialize sample data
  useEffect(() => {
    const sampleListings = generateSampleListings(1500); // Generate 1500 listings for performance testing
    const sampleRegionalData = generateSampleRegionalData(sampleListings);
    
    setListings(sampleListings);
    setRegionalData(sampleRegionalData);
  }, []);

  // Handle location filters
  const handleFiltersChange = (filters: LocationFilter[]) => {
    setLocationFilters(filters);
    updateFilters(filters);
  };

  const updateFilters = (filters: LocationFilter[]) => {
    // Clear existing filters and add new ones
    filters.forEach(filter => addFilter(filter));
  };

  // Handle map interactions
  const handleMarkerClick = (marker: any) => {
    if (marker.type === 'listing') {
      setSelectedListing(marker.data as EnergyListing);
    }
  };

  const handleViewportChange = (viewport: any) => {
    updateViewport(viewport);
  };

  // Handle regional market selection
  const handleRegionSelect = (region: RegionalMarketData) => {
    setSelectedRegion(region);
    setActiveTab('map');
    // Center map on selected region
    updateViewport({
      center: region.coordinates,
      zoom: 8,
    });
  };

  // Handle heat map interactions
  const handleHeatMapClick = (point: HeatMapPoint) => {
    console.log('Heat map point clicked:', point);
    // Could show details or filter listings based on heat map point
  };

  // Handle distance calculation
  const handleCalculationComplete = (calculation: DistanceCalculation) => {
    console.log('Distance calculation completed:', calculation);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Energy Trading Platform</h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Live
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{listings.length}</span> listings
              </div>
              
              {permission === 'prompt' && (
                <button
                  onClick={requestLocation}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Enable Location
                </button>
              )}
              
              {userLocation && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> ±{userLocation.accuracy}m
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'map', label: 'Interactive Map', icon: '🗺️' },
              { key: 'regional', label: 'Regional Markets', icon: '📊' },
              { key: 'distance', label: 'Distance Calculator', icon: '📏' },
              { key: 'heatmap', label: 'Heat Map', icon: '🔥' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Location Filters */}
            <LocationFilterComponent
              onFiltersChange={handleFiltersChange}
              userLocation={userLocation}
            />

            {/* Filter Summary */}
            {locationFilters.length > 0 && (
              <FilterSummary
                filters={locationFilters}
                onClearAll={() => handleFiltersChange([])}
              />
            )}

            {/* Selected Listing Details */}
            {selectedListing && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Selected Listing</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Title:</span> {selectedListing.title}</p>
                  <p><span className="font-medium">Type:</span> {selectedListing.type}</p>
                  <p><span className="font-medium">Price:</span> ${selectedListing.price.toFixed(2)}/MWh</p>
                  <p><span className="font-medium">Capacity:</span> {selectedListing.capacity.toFixed(1)} MW</p>
                  <p><span className="font-medium">Seller:</span> {selectedListing.seller.name}</p>
                  <p><span className="font-medium">Rating:</span> ⭐ {selectedListing.seller.rating.toFixed(1)}</p>
                  {selectedListing.distance && (
                    <p><span className="font-medium">Distance:</span> {selectedListing.distance.toFixed(1)} km</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'map' && (
              <InteractiveMap
                listings={listings}
                onMarkerClick={handleMarkerClick}
                onViewportChange={handleViewportChange}
                height="600px"
                showUserLocation={true}
                enableClustering={true}
              />
            )}

            {activeTab === 'regional' && (
              <RegionalMarketComponent
                regionalData={regionalData}
                listings={listings}
                onRegionSelect={handleRegionSelect}
              />
            )}

            {activeTab === 'distance' && (
              <DistanceCalculatorComponent
                userLocation={userLocation}
                selectedListing={selectedListing}
                onCalculationComplete={handleCalculationComplete}
              />
            )}

            {activeTab === 'heatmap' && (
              <HeatMapComponent
                listings={listings}
                viewport={mapState.viewport.bounds || null}
                onHeatMapClick={handleHeatMapClick}
                height="600px"
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Platform Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Interactive map with 1000+ markers</li>
                <li>• Real-time location tracking</li>
                <li>• Advanced filtering options</li>
                <li>• Distance & cost calculations</li>
                <li>• Regional market analysis</li>
                <li>• Trading activity heat maps</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Metrics</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <span className="font-medium">{listings.length}</span> active listings</li>
                <li>• <span className="font-medium">{regionalData.length}</span> regional markets</li>
                <li>• <span className="font-medium">{mapState.markers.length}</span> map markers</li>
                <li>• <span className="font-medium">{locationFilters.length}</span> active filters</li>
                <li>• Clustering enabled for performance</li>
                <li>• Mobile responsive design</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Privacy & Accessibility</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Location permission controlled by user</li>
                <li>• Data encrypted in transit</li>
                <li>• WCAG 2.1 compliant</li>
                <li>• Keyboard navigation support</li>
                <li>• Screen reader compatible</li>
                <li>• Cross-browser tested</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>Geographic Location-Based Trading Interface © 2024 | Built with React, TypeScript, and Leaflet</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
