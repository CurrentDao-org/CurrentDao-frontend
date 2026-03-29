import React, { useState, useMemo } from 'react';
import { RegionalMarketData, EnergyListing } from '../../types/maps';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Zap, 
  DollarSign, 
  BarChart3,
  Activity,
  Clock,
  MapPin
} from 'lucide-react';

interface RegionalMarketProps {
  regionalData: RegionalMarketData[];
  listings: EnergyListing[];
  onRegionSelect?: (region: RegionalMarketData) => void;
  className?: string;
}

interface MarketStats {
  totalRegions: number;
  averagePrice: number;
  totalCapacity: number;
  totalListings: number;
  priceRange: { min: number; max: number };
  trendingUp: number;
  trendingDown: number;
  stable: number;
}

const RegionalMarketCard: React.FC<{
  region: RegionalMarketData;
  onSelect: (region: RegionalMarketData) => void;
  isSelected: boolean;
}> = ({ region, onSelect, isSelected }) => {
  const getTrendIcon = () => {
    switch (region.priceTrend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (region.priceTrend) {
      case 'up':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'down':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatCapacity = (capacity: number) => {
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)} GW`;
    }
    return `${capacity.toFixed(0)} MW`;
  };

  return (
    <div
      onClick={() => onSelect(region)}
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{region.region}</h3>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${getTrendColor()}`}>
          {getTrendIcon()}
          <span>{region.priceTrend}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Avg Price</p>
            <p className="text-sm font-semibold text-gray-900">{formatPrice(region.averagePrice)}/MWh</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Total Capacity</p>
            <p className="text-sm font-semibold text-gray-900">{formatCapacity(region.totalCapacity)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">{region.totalListings} listings</span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{new Date(region.lastUpdated).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

const MarketOverview: React.FC<{ stats: MarketStats }> = ({ stats }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const formatCapacity = (capacity: number) => {
    if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)} GW`;
    }
    return `${capacity.toFixed(0)} MW`;
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        Market Overview
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.totalRegions}</p>
          <p className="text-xs text-gray-600">Regions</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{formatPrice(stats.averagePrice)}</p>
          <p className="text-xs text-gray-600">Avg Price/MWh</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600">{formatCapacity(stats.totalCapacity)}</p>
          <p className="text-xs text-gray-600">Total Capacity</p>
        </div>
        
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.totalListings}</p>
          <p className="text-xs text-gray-600">Total Listings</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <span className="text-gray-600">{stats.trendingUp} rising</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-4 h-4 text-green-600" />
              <span className="text-gray-600">{stats.trendingDown} falling</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">{stats.stable} stable</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Range: {formatPrice(stats.priceRange.min)} - {formatPrice(stats.priceRange.max)}
          </div>
        </div>
      </div>
    </div>
  );
};

export const RegionalMarketComponent: React.FC<RegionalMarketProps> = ({
  regionalData,
  listings,
  onRegionSelect,
  className = '',
}) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionalMarketData | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'capacity' | 'listings' | 'trend'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Calculate market statistics
  const marketStats = useMemo((): MarketStats => {
    if (regionalData.length === 0) {
      return {
        totalRegions: 0,
        averagePrice: 0,
        totalCapacity: 0,
        totalListings: 0,
        priceRange: { min: 0, max: 0 },
        trendingUp: 0,
        trendingDown: 0,
        stable: 0,
      };
    }

    const prices = regionalData.map(r => r.averagePrice);
    const totalCapacity = regionalData.reduce((sum, r) => sum + r.totalCapacity, 0);
    const totalListings = regionalData.reduce((sum, r) => sum + r.totalListings, 0);
    
    const trends = regionalData.reduce(
      (acc, r) => {
        acc[r.priceTrend]++;
        return acc;
      },
      { up: 0, down: 0, stable: 0 }
    );

    return {
      totalRegions: regionalData.length,
      averagePrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      totalCapacity,
      totalListings,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
      },
      trendingUp: trends.up,
      trendingDown: trends.down,
      stable: trends.stable,
    };
  }, [regionalData]);

  // Sort regional data
  const sortedRegionalData = useMemo(() => {
    const sorted = [...regionalData].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = a.averagePrice - b.averagePrice;
          break;
        case 'capacity':
          comparison = a.totalCapacity - b.totalCapacity;
          break;
        case 'listings':
          comparison = a.totalListings - b.totalListings;
          break;
        case 'trend':
          const trendOrder = { up: 2, stable: 1, down: 0 };
          comparison = trendOrder[a.priceTrend] - trendOrder[b.priceTrend];
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [regionalData, sortBy, sortOrder]);

  const handleRegionSelect = (region: RegionalMarketData) => {
    setSelectedRegion(region);
    onRegionSelect?.(region);
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Regional Markets
          </h2>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="price">Price</option>
              <option value="capacity">Capacity</option>
              <option value="listings">Listings</option>
              <option value="trend">Trend</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <MarketOverview stats={marketStats} />

        {sortedRegionalData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No regional market data available</p>
            <p className="text-xs mt-1">Check back later for market updates</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sortedRegionalData.map((region) => (
              <RegionalMarketCard
                key={region.region}
                region={region}
                onSelect={handleRegionSelect}
                isSelected={selectedRegion?.region === region.region}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegionalMarketComponent;
