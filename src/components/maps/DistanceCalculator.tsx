import React, { useState, useMemo } from 'react';
import { Coordinates, DistanceCalculation, EnergyListing, UserLocation } from '../../types/maps';
import { 
  Route, 
  MapPin, 
  Navigation, 
  DollarSign, 
  Clock, 
  Truck,
  Calculator,
  ArrowRight,
  X,
  Plus
} from 'lucide-react';
import { calculateDistanceWithDetails, formatDistance } from '../../utils/mapHelpers';

interface DistanceCalculatorProps {
  userLocation?: UserLocation | null;
  selectedListing?: EnergyListing | null;
  onCalculationComplete?: (calculation: DistanceCalculation) => void;
  className?: string;
}

interface LocationPoint {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: 'user' | 'listing' | 'custom';
}

interface DeliveryRoute {
  from: LocationPoint;
  to: LocationPoint;
  calculation: DistanceCalculation;
}

const LocationInput: React.FC<{
  value: LocationPoint | null;
  onChange: (location: LocationPoint | null) => void;
  placeholder: string;
  label: string;
  userLocation?: UserLocation | null;
  listings?: EnergyListing[];
  disabled?: boolean;
}> = ({ value, onChange, placeholder, label, userLocation, listings = [], disabled }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = useMemo(() => {
    const suggestions: LocationPoint[] = [];
    
    if (userLocation && label.toLowerCase().includes('origin')) {
      suggestions.push({
        id: 'user-location',
        name: 'Your Current Location',
        coordinates: userLocation.coordinates,
        type: 'user',
      });
    }

    listings.forEach((listing) => {
      suggestions.push({
        id: listing.id,
        name: listing.title,
        coordinates: listing.coordinates,
        type: 'listing',
      });
    });

    return suggestions.slice(0, 5);
  }, [userLocation, listings, label]);

  const handleSuggestionClick = (suggestion: LocationPoint) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleManualInput = (lat: string, lng: string) => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    
    if (!isNaN(latNum) && !isNaN(lngNum) && 
        latNum >= -90 && latNum <= 90 && 
        lngNum >= -180 && lngNum <= 180) {
      onChange({
        id: `custom-${Date.now()}`,
        name: `Custom Location (${latNum.toFixed(4)}, ${lngNum.toFixed(4)})`,
        coordinates: { lat: latNum, lng: lngNum },
        type: 'custom',
      });
    }
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value?.name || ''}
          onChange={(e) => {
            const value = e.target.value;
            // Check if it's coordinates format (lat, lng)
            const coordsMatch = value.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
            if (coordsMatch) {
              handleManualInput(coordsMatch[1], coordsMatch[2]);
            } else if (value === '') {
              onChange(null);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
        <div className="absolute right-2 top-2.5 text-gray-400">
          <MapPin className="w-4 h-4" />
        </div>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
            >
              {suggestion.type === 'user' && <Navigation className="w-4 h-4 text-blue-600" />}
              {suggestion.type === 'listing' && <MapPin className="w-4 h-4 text-green-600" />}
              {suggestion.type === 'custom' && <MapPin className="w-4 h-4 text-gray-600" />}
              <div>
                <div className="text-sm font-medium text-gray-900">{suggestion.name}</div>
                <div className="text-xs text-gray-500">
                  {suggestion.coordinates.lat.toFixed(4)}, {suggestion.coordinates.lng.toFixed(4)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const RouteCard: React.FC<{
  route: DeliveryRoute;
  onRemove: () => void;
}> = ({ route, onRemove }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 flex items-center gap-2">
          <Route className="w-4 h-4 text-blue-600" />
          Delivery Route
        </h4>
        <button
          onClick={onRemove}
          className="text-gray-400 hover:text-red-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">From</div>
            <div className="font-medium text-gray-900">{route.from.name}</div>
            <div className="text-xs text-gray-500">
              {route.from.coordinates.lat.toFixed(4)}, {route.from.coordinates.lng.toFixed(4)}
            </div>
          </div>
          
          <div className="text-blue-600">
            <ArrowRight className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-gray-600 mb-1">To</div>
            <div className="font-medium text-gray-900">{route.to.name}</div>
            <div className="text-xs text-gray-500">
              {route.to.coordinates.lat.toFixed(4)}, {route.to.coordinates.lng.toFixed(4)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Route className="w-4 h-4" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatDistance(route.calculation.distance, route.calculation.unit)}
            </div>
            <div className="text-xs text-gray-500">Distance</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(route.calculation.estimatedCost)}
            </div>
            <div className="text-xs text-gray-500">Est. Cost</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatTime(route.calculation.estimatedTime)}
            </div>
            <div className="text-xs text-gray-500">Est. Time</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Truck className="w-4 h-4" />
            <span>
              Delivery cost calculated at $0.15 per km. Actual costs may vary based on route conditions.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DistanceCalculatorComponent: React.FC<DistanceCalculatorProps> = ({
  userLocation,
  selectedListing,
  onCalculationComplete,
  className = '',
}) => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [origin, setOrigin] = useState<LocationPoint | null>(null);
  const [destination, setDestination] = useState<LocationPoint | null>(null);
  const [costPerKm, setCostPerKm] = useState(0.15);

  // Auto-populate with user location and selected listing
  React.useEffect(() => {
    if (userLocation && !origin) {
      setOrigin({
        id: 'user-location',
        name: 'Your Current Location',
        coordinates: userLocation.coordinates,
        type: 'user',
      });
    }
  }, [userLocation, origin]);

  React.useEffect(() => {
    if (selectedListing && !destination) {
      setDestination({
        id: selectedListing.id,
        name: selectedListing.title,
        coordinates: selectedListing.coordinates,
        type: 'listing',
      });
    }
  }, [selectedListing, destination]);

  const calculateRoute = () => {
    if (!origin || !destination) return;

    const calculation = calculateDistanceWithDetails(
      origin.coordinates,
      destination.coordinates,
      'km',
      costPerKm
    );

    const newRoute: DeliveryRoute = {
      from: origin,
      to: destination,
      calculation,
    };

    setRoutes([...routes, newRoute]);
    onCalculationComplete?.(calculation);
  };

  const removeRoute = (index: number) => {
    setRoutes(routes.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setRoutes([]);
    setOrigin(null);
    setDestination(null);
  };

  const canCalculate = origin && destination;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Distance Calculator
          </h2>
          {routes.length > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-gray-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LocationInput
            value={origin}
            onChange={setOrigin}
            placeholder="Enter origin or coordinates (lat, lng)"
            label="Origin"
            userLocation={userLocation}
            listings={[selectedListing].filter(Boolean) as EnergyListing[]}
          />

          <LocationInput
            value={destination}
            onChange={setDestination}
            placeholder="Enter destination or coordinates (lat, lng)"
            label="Destination"
            userLocation={userLocation}
            listings={[selectedListing].filter(Boolean) as EnergyListing[]}
          />
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cost per Kilometer
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={costPerKm}
                onChange={(e) => setCostPerKm(parseFloat(e.target.value) || 0)}
                step="0.01"
                min="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">$ per km</span>
            </div>
          </div>

          <button
            onClick={calculateRoute}
            disabled={!canCalculate}
            className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
              canCalculate
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Calculate Route
          </button>
        </div>

        {routes.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Calculated Routes</h3>
            {routes.map((route, index) => (
              <RouteCard
                key={index}
                route={route}
                onRemove={() => removeRoute(index)}
              />
            ))}
          </div>
        )}

        {routes.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calculator className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No routes calculated yet</p>
            <p className="text-xs mt-1">Select origin and destination to calculate delivery costs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DistanceCalculatorComponent;
