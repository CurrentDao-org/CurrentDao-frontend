'use client';

import { useState, useEffect } from 'react';
import type { MarketplaceFilters, RenewableSource } from '@/types/marketplace';
import { SlidersHorizontal, Search, Bookmark, Trash2 } from 'lucide-react';

interface FilterPanelProps {
  filters: MarketplaceFilters;
  onFilterChange: (filters: MarketplaceFilters) => void;
  allRenewableSources: RenewableSource[];
  savedSearches: any[];
  onSaveSearch: (name: string) => void;
  onLoadSearch: (id: string) => void;
  onDeleteSearch: (id: string) => void;
}

export function FilterPanel({
  filters,
  onFilterChange,
  allRenewableSources,
  savedSearches,
  onSaveSearch,
  onLoadSearch,
  onDeleteSearch,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [saveName, setSaveName] = useState('');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleRangeChange = (name: 'priceRange' | 'quantityRange', value: number, index: 0 | 1) => {
    const newRange = [...localFilters[name]] as [number, number];
    newRange[index] = value;
    setLocalFilters(prev => ({ ...prev, [name]: newRange }));
  };

  const handleRenewableToggle = (source: RenewableSource) => {
    const newSources = localFilters.renewableSources.includes(source)
      ? localFilters.renewableSources.filter(s => s !== source)
      : [...localFilters.renewableSources, source];
    setLocalFilters(prev => ({ ...prev, renewableSources: newSources }));
  };

  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleSave = () => {
    if (saveName.trim()) {
      onSaveSearch(saveName.trim());
      setSaveName('');
    }
  };

  return (
    <aside className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6 h-fit sticky top-6">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <SlidersHorizontal className="w-5 h-5 text-blue-600" />
        Filters
      </h2>

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium text-gray-700">Price Range ($/kWh)</label>
        <div className="flex items-center gap-2 mt-2">
          <input type="number" value={localFilters.priceRange[0]} onChange={e => handleRangeChange('priceRange', parseFloat(e.target.value), 0)} className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
          <span>-</span>
          <input type="number" value={localFilters.priceRange[1]} onChange={e => handleRangeChange('priceRange', parseFloat(e.target.value), 1)} className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
        </div>
      </div>

      {/* Quantity Range */}
      <div>
        <label className="text-sm font-medium text-gray-700">Quantity (kWh)</label>
        <div className="flex items-center gap-2 mt-2">
          <input type="number" value={localFilters.quantityRange[0]} onChange={e => handleRangeChange('quantityRange', parseInt(e.target.value), 0)} className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
          <span>-</span>
          <input type="number" value={localFilters.quantityRange[1]} onChange={e => handleRangeChange('quantityRange', parseInt(e.target.value), 1)} className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="text-sm font-medium text-gray-700">Location</label>
        <input id="location" name="location" type="text" value={localFilters.location} onChange={handleInputChange} placeholder="City, State" className="w-full border-gray-300 rounded-md shadow-sm mt-2 text-sm" />
      </div>

      {/* Renewable Sources */}
      <div>
        <label className="text-sm font-medium text-gray-700">Renewable Source</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {allRenewableSources.map(source => (
            <button key={source} onClick={() => handleRenewableToggle(source)} className={`text-sm capitalize px-3 py-2 rounded-md transition-colors ${localFilters.renewableSources.includes(source) ? 'bg-blue-100 text-blue-800 font-semibold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {source}
            </button>
          ))}
        </div>
      </div>

      <button onClick={applyFilters} className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
        <Search className="w-4 h-4" />
        Apply Filters
      </button>

      {/* Saved Searches */}
      <div className="border-t border-gray-200 pt-6 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-blue-600" />
          Saved Searches
        </h3>
        <div className="space-y-2">
          {savedSearches.map(search => (
            <div key={search.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <button onClick={() => onLoadSearch(search.id)} className="text-sm text-gray-800 hover:text-blue-600 text-left">
                {search.name}
              </button>
              <button onClick={() => onDeleteSearch(search.id)} className="text-gray-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="Filter name" className="w-full border-gray-300 rounded-md shadow-sm text-sm" />
          <button onClick={handleSave} className="bg-gray-200 text-gray-800 px-3 rounded-md hover:bg-gray-300 text-sm font-medium">Save</button>
        </div>
      </div>
    </aside>
  );
}