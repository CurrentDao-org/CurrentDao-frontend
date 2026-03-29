import React, { useState } from 'react';
import { LocationFilter, Coordinates, UserLocation } from '../../types/maps';
import { MapPin, Navigation, X, Plus, Filter } from 'lucide-react';

interface LocationFilterProps {
  onFiltersChange: (filters: LocationFilter[]) => void;
  userLocation?: UserLocation | null;
  className?: string;
}

interface FilterOption {
  type: 'radius' | 'region' | 'gridZone';
  label: string;
  icon: React.ReactNode;
  description: string;
}

const REGIONS = [
  { value: 'northeast', label: 'Northeast', description: 'ME, NH, VT, MA, RI, CT, NY, PA, NJ' },
  { value: 'southeast', label: 'Southeast', description: 'DE, MD, DC, VA, WV, NC, SC, GA, FL, AL, MS, TN, KY' },
  { value: 'midwest', label: 'Midwest', description: 'OH, MI, IN, IL, WI, MN, IA, MO, ND, SD, NE, KS' },
  { value: 'southwest', label: 'Southwest', description: 'TX, OK, AR, LA, NM' },
  { value: 'west', label: 'West', description: 'CA, OR, WA, NV, ID, MT, WY, CO, UT, AZ, AK, HI' },
];

const GRID_ZONES = [
  { value: 'PJM', label: 'PJM', description: 'Pennsylvania-New Jersey-Maryland Interconnection' },
  { value: 'ERCOT', label: 'ERCOT', description: 'Electric Reliability Council of Texas' },
  { value: 'CAISO', label: 'CAISO', description: 'California Independent System Operator' },
  { value: 'NYISO', label: 'NYISO', description: 'New York Independent System Operator' },
  { value: 'ISO-NE', label: 'ISO-NE', description: 'ISO New England' },
  { value: 'MISO', label: 'MISO', description: 'Midcontinent Independent System Operator' },
  { value: 'SPP', label: 'SPP', description: 'Southwest Power Pool' },
];

const RADIUS_OPTIONS = [
  { value: 10, label: '10 km', description: 'Very local area' },
  { value: 25, label: '25 km', description: 'Local area' },
  { value: 50, label: '50 km', description: 'Regional area' },
  { value: 100, label: '100 km', description: 'Extended area' },
  { value: 250, label: '250 km', description: 'Large area' },
  { value: 500, label: '500 km', description: 'Very large area' },
];

export const LocationFilterComponent: React.FC<LocationFilterProps> = ({
  onFiltersChange,
  userLocation,
  className = '',
}) => {
  const [filters, setFilters] = useState<LocationFilter[]>([]);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [selectedType, setSelectedType] = useState<'radius' | 'region' | 'gridZone'>('radius');

  const filterOptions: FilterOption[] = [
    {
      type: 'radius',
      label: 'Radius',
      icon: <MapPin className="w-4 h-4" />,
      description: 'Filter by distance from a location',
    },
    {
      type: 'region',
      label: 'Region',
      icon: <MapPin className="w-4 h-4" />,
      description: 'Filter by geographic region',
    },
    {
      type: 'gridZone',
      label: 'Grid Zone',
      icon: <Navigation className="w-4 h-4" />,
      description: 'Filter by electrical grid zone',
    },
  ];

  const addFilter = (filter: LocationFilter) => {
    const newFilters = [...filters, filter];
    setFilters(newFilters);
    onFiltersChange(newFilters);
    setShowAddFilter(false);
  };

  const removeFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const addRadiusFilter = (radius: number) => {
    if (!userLocation) {
      // For demo purposes, use a default location
      const defaultCenter = { lat: 39.8283, lng: -98.5795 };
      addFilter({
        type: 'radius',
        value: radius,
        center: defaultCenter,
        radius,
      });
    } else {
      addFilter({
        type: 'radius',
        value: radius,
        center: userLocation.coordinates,
        radius,
      });
    }
  };

  const addRegionFilter = (region: string) => {
    addFilter({
      type: 'region',
      value: region,
      region,
    });
  };

  const addGridZoneFilter = (gridZone: string) => {
    addFilter({
      type: 'gridZone',
      value: gridZone,
      gridZone,
    });
  };

  const getFilterDisplayText = (filter: LocationFilter): string => {
    switch (filter.type) {
      case 'radius':
        return `Within ${filter.radius} km`;
      case 'region':
        const region = REGIONS.find(r => r.value === filter.region);
        return region ? region.label : filter.region!;
      case 'gridZone':
        const zone = GRID_ZONES.find(z => z.value === filter.gridZone);
        return zone ? zone.label : filter.gridZone!;
      default:
        return '';
    }
  };

  const getFilterIcon = (type: 'radius' | 'region' | 'gridZone') => {
    const option = filterOptions.find(o => o.type === type);
    return option?.icon;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Location Filters
        </h3>
        <button
          onClick={() => setShowAddFilter(!showAddFilter)}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Filter
        </button>
      </div>

      {/* Active Filters */}
      {filters.length > 0 && (
        <div className="space-y-2 mb-4">
          {filters.map((filter, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <div className="text-blue-600">
                  {getFilterIcon(filter.type)}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {getFilterDisplayText(filter)}
                </span>
              </div>
              <button
                onClick={() => removeFilter(index)}
                className="text-gray-400 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Filter Modal */}
      {showAddFilter && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 mb-4">
            {filterOptions.map((option) => (
              <button
                key={option.type}
                onClick={() => setSelectedType(option.type)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors ${
                  selectedType === option.type
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option.icon}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {selectedType === 'radius' && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Select radius from {userLocation ? 'your location' : 'default location'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {RADIUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => addRadiusFilter(option.value)}
                      className="p-2 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-500">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedType === 'region' && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Select region</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {REGIONS.map((region) => (
                    <button
                      key={region.value}
                      onClick={() => addRegionFilter(region.value)}
                      className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900">{region.label}</div>
                      <div className="text-xs text-gray-500">{region.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedType === 'gridZone' && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Select grid zone</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {GRID_ZONES.map((zone) => (
                    <button
                      key={zone.value}
                      onClick={() => addGridZoneFilter(zone.value)}
                      className="w-full p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-sm text-gray-900">{zone.label}</div>
                      <div className="text-xs text-gray-500">{zone.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowAddFilter(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Summary */}
      {filters.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No location filters active</p>
          <p className="text-xs mt-1">Add filters to narrow down your search</p>
        </div>
      )}
    </div>
  );
};

export const FilterSummary: React.FC<{
  filters: LocationFilter[];
  onClearAll: () => void;
  className?: string;
}> = ({ filters, onClearAll, className = '' }) => {
  if (filters.length === 0) return null;

  return (
    <div className={`flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          {filters.length} filter{filters.length > 1 ? 's' : ''} active
        </span>
      </div>
      <button
        onClick={onClearAll}
        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        Clear all
      </button>
    </div>
  );
};
