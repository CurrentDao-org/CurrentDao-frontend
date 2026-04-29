import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, TrendingUp, Shield, Zap } from 'lucide-react';
import { TokenSearchQuery, TokenType } from '../../types/token';

interface TokenFiltersProps {
  query: TokenSearchQuery;
  onQueryChange: (query: TokenSearchQuery) => void;
  className?: string;
}

export function TokenFilters({ query, onQueryChange, className = '' }: TokenFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['type', 'price']));
  const [priceRange, setPriceRange] = useState<[number, number]>(query.priceRange || [0, 100]);
  const [marketCapRange, setMarketCapRange] = useState<[number, number]>(query.marketCapRange || [0, 1000000000]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updateQuery = (updates: Partial<TokenSearchQuery>) => {
    onQueryChange({ ...query, ...updates });
  };

  const handleTypeChange = (type: TokenType, checked: boolean) => {
    const currentTypes = query.type || [];
    const newTypes = checked
      ? [...currentTypes, type]
      : currentTypes.filter(t => t !== type);
    updateQuery({ type: newTypes.length > 0 ? newTypes : undefined });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    setPriceRange([min, max]);
    updateQuery({ priceRange: [min, max] });
  };

  const handleMarketCapRangeChange = (min: number, max: number) => {
    setMarketCapRange([min, max]);
    updateQuery({ marketCapRange: [min, max] });
  };

  const clearAllFilters = () => {
    onQueryChange({});
    setPriceRange([0, 100]);
    setMarketCapRange([0, 1000000000]);
  };

  const getTokenTypeIcon = (type: TokenType) => {
    switch (type) {
      case 'energy':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'rec':
        return <Zap className="h-4 w-4 text-emerald-500" />;
      case 'utility':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTokenTypeColor = (type: TokenType) => {
    switch (type) {
      case 'energy':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'rec':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'utility':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(0)}`;
  };

  const hasActiveFilters = !!(query.type?.length || query.priceRange || query.marketCapRange || 
    query.verifiedOnly || query.trendingOnly || query.energySource?.length || query.region?.length);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm font-medium text-blue-700">Filters Active</span>
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Token Type Filters */}
      <div>
        <button
          onClick={() => toggleSection('type')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-medium text-gray-900 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Token Type
          </h3>
          {expandedSections.has('type') ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {expandedSections.has('type') && (
          <div className="mt-3 space-y-2">
            {(['energy', 'rec', 'utility'] as TokenType[]).map(type => (
              <label
                key={type}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  query.type && query.type.indexOf(type) !== -1 ? getTokenTypeColor(type) : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={query.type && query.type.indexOf(type) !== -1 || false}
                  onChange={(e) => handleTypeChange(type, e.target.checked)}
                  className="mr-3"
                />
                <div className="flex items-center space-x-2 flex-1">
                  {getTokenTypeIcon(type)}
                  <span className="font-medium capitalize">{type}</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div>
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-medium text-gray-900 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Price Range
          </h3>
          {expandedSections.has('price') ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {expandedSections.has('price') && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => handlePriceRangeChange(Number(e.target.value), priceRange[1])}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => handlePriceRangeChange(priceRange[0], Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="0.01"
              />
            </div>
            <div className="text-sm text-gray-500">
              {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </div>
          </div>
        )}
      </div>

      {/* Market Cap Range Filter */}
      <div>
        <button
          onClick={() => toggleSection('marketcap')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-medium text-gray-900 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Market Cap Range
          </h3>
          {expandedSections.has('marketcap') ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {expandedSections.has('marketcap') && (
          <div className="mt-3 space-y-3">
            <div className="flex items-center space-x-3">
              <input
                type="number"
                placeholder="Min"
                value={marketCapRange[0]}
                onChange={(e) => handleMarketCapRangeChange(Number(e.target.value), marketCapRange[1])}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1000000"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={marketCapRange[1]}
                onChange={(e) => handleMarketCapRangeChange(marketCapRange[0], Number(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                step="1000000"
              />
            </div>
            <div className="text-sm text-gray-500">
              {formatMarketCap(marketCapRange[0])} - {formatMarketCap(marketCapRange[1])}
            </div>
          </div>
        )}
      </div>

      {/* Special Filters */}
      <div>
        <button
          onClick={() => toggleSection('special')}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="font-medium text-gray-900 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Special Filters
          </h3>
          {expandedSections.has('special') ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </button>
        {expandedSections.has('special') && (
          <div className="mt-3 space-y-3">
            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <span className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Verified Only</span>
              </span>
              <input
                type="checkbox"
                checked={query.verifiedOnly || false}
                onChange={(e) => updateQuery({ verifiedOnly: e.target.checked })}
                className="h-4 w-4 text-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <span className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <span className="font-medium">Trending Only</span>
              </span>
              <input
                type="checkbox"
                checked={query.trendingOnly || false}
                onChange={(e) => updateQuery({ trendingOnly: e.target.checked })}
                className="h-4 w-4 text-red-600"
              />
            </label>
          </div>
        )}
      </div>

      {/* Energy Source Filters (for Energy tokens) */}
      {(!query.type || query.type.indexOf('energy') !== -1) && (
        <div>
          <button
            onClick={() => toggleSection('energy')}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-medium text-gray-900 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Energy Source
            </h3>
            {expandedSections.has('energy') ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>
          {expandedSections.has('energy') && (
            <div className="mt-3 space-y-2">
              {['solar', 'wind', 'hydro', 'geothermal', 'biomass'].map(source => (
                <label key={source} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={query.energySource && query.energySource.indexOf(source) !== -1 || false}
                    onChange={(e) => {
                      const currentSources = query.energySource || [];
                      const newSources = e.target.checked
                        ? [...currentSources, source]
                        : currentSources.filter(s => s !== source);
                      updateQuery({ energySource: newSources.length > 0 ? newSources : undefined });
                    }}
                    className="h-4 w-4"
                  />
                  <span className="capitalize">{source}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Filter Presets */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Quick Filters</h3>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={() => updateQuery({ 
              type: ['energy'], 
              verifiedOnly: true,
              priceRange: [0, 10] 
            })}
            className="p-3 text-left border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="font-medium text-green-700">Energy Tokens Under $10</span>
            </div>
            <p className="text-xs text-green-600 mt-1">Verified energy tokens</p>
          </button>

          <button
            onClick={() => updateQuery({ 
              type: ['rec'], 
              trendingOnly: true 
            })}
            className="p-3 text-left border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-emerald-700">Trending REC Tokens</span>
            </div>
            <p className="text-xs text-emerald-600 mt-1">Popular renewable energy credits</p>
          </button>

          <button
            onClick={() => updateQuery({ 
              type: ['utility'], 
              verifiedOnly: true,
              marketCapRange: [1000000, 100000000] 
            })}
            className="p-3 text-left border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-blue-700">Established Utility Tokens</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">Verified tokens with $1M-$100M market cap</p>
          </button>
        </div>
      </div>
    </div>
  );
}
