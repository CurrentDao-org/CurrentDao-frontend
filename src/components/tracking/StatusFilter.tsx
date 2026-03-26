import React, { useState } from 'react';
import { StatusFilter, TradeStatus } from '@/types/tracking';
import { STATUS_CONFIG } from '@/utils/statusHelpers';
import { 
  Filter, 
  X, 
  Calendar, 
  DollarSign, 
  Zap, 
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface StatusFilterProps {
  filters: StatusFilter;
  onFiltersChange: (filters: Partial<StatusFilter>) => void;
  onClearFilters: () => void;
  className?: string;
  compact?: boolean;
}

const StatusFilterComponent: React.FC<StatusFilterProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = '',
  compact = false,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['status']));
  const [dateRangeType, setDateRangeType] = useState<'custom' | 'preset'>('preset');

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleStatusChange = (status: TradeStatus, checked: boolean) => {
    const currentStatuses = filters.status || [];
    let newStatuses: TradeStatus[];
    
    if (checked) {
      newStatuses = [...currentStatuses, status];
    } else {
      newStatuses = currentStatuses.filter(s => s !== status);
    }
    
    onFiltersChange({ status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const handleDateRangeChange = (type: 'today' | 'week' | 'month' | 'custom') => {
    const now = Date.now();
    let start: number;
    let end: number = now;

    switch (type) {
      case 'today':
        start = new Date().setHours(0, 0, 0, 0);
        break;
      case 'week':
        start = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = now - (30 * 24 * 60 * 60 * 1000);
        break;
      case 'custom':
        setDateRangeType('custom');
        return;
      default:
        return;
    }

    onFiltersChange({ 
      dateRange: { start, end },
    });
    setDateRangeType('preset');
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    const timestamp = new Date(value).getTime();
    if (isNaN(timestamp)) return;

    const currentRange = filters.dateRange || { start: 0, end: Date.now() };
    onFiltersChange({
      dateRange: {
        ...currentRange,
        [field]: timestamp,
      },
    });
  };

  const handleAmountRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    const currentRange = filters.amountRange || { min: 0, max: Infinity };
    onFiltersChange({
      amountRange: {
        ...currentRange,
        [field]: numValue,
      },
    });
  };

  const hasActiveFilters = !!(
    filters.status?.length ||
    filters.dateRange ||
    filters.amountRange ||
    filters.energyType?.length ||
    filters.searchTerm
  );

  const energyTypes = ['Solar', 'Wind', 'Hydro', 'Nuclear', 'Natural Gas'];

  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search trades..."
              value={filters.searchTerm || ''}
              onChange={(e) => onFiltersChange({ searchTerm: e.target.value || undefined })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <select
            value={filters.status?.[0] || ''}
            onChange={(e) => {
              const status = e.target.value as TradeStatus;
              onFiltersChange({ status: status ? [status] : undefined });
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Filters
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              Active
            </span>
          )}
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Search */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Search className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Search</h4>
          </div>
          <input
            type="text"
            placeholder="Search by trade ID, energy type, or status..."
            value={filters.searchTerm || ''}
            onChange={(e) => onFiltersChange({ searchTerm: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Status Filter */}
        <div>
          <button
            onClick={() => toggleSection('status')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Status</h4>
            </div>
            {expandedSections.has('status') ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {expandedSections.has('status') && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.status?.includes(key as TradeStatus) || false}
                    onChange={(e) => handleStatusChange(key as TradeStatus, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {config.label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div>
          <button
            onClick={() => toggleSection('date')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Date Range</h4>
            </div>
            {expandedSections.has('date') ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {expandedSections.has('date') && (
            <div className="mt-3 space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDateRangeChange('today')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRangeType === 'preset' && 
                    filters.dateRange?.start === new Date().setHours(0, 0, 0, 0)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => handleDateRangeChange('week')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRangeType === 'preset' && 
                    filters.dateRange?.start === Date.now() - (7 * 24 * 60 * 60 * 1000)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => handleDateRangeChange('month')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRangeType === 'preset' && 
                    filters.dateRange?.start === Date.now() - (30 * 24 * 60 * 60 * 1000)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => handleDateRangeChange('custom')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    dateRangeType === 'custom'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Custom
                </button>
              </div>

              {dateRangeType === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="datetime-local"
                      value={filters.dateRange?.start ? new Date(filters.dateRange.start).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleCustomDateChange('start', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="datetime-local"
                      value={filters.dateRange?.end ? new Date(filters.dateRange.end).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleCustomDateChange('end', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Amount Range Filter */}
        <div>
          <button
            onClick={() => toggleSection('amount')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Amount Range</h4>
            </div>
            {expandedSections.has('amount') ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {expandedSections.has('amount') && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Minimum Amount
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.amountRange?.min || ''}
                  onChange={(e) => handleAmountRangeChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Maximum Amount
                </label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={filters.amountRange?.max === Infinity ? '' : filters.amountRange?.max || ''}
                  onChange={(e) => handleAmountRangeChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Energy Type Filter */}
        <div>
          <button
            onClick={() => toggleSection('energy')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Energy Type</h4>
            </div>
            {expandedSections.has('energy') ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {expandedSections.has('energy') && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
              {energyTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.energyType?.includes(type) || false}
                    onChange={(e) => {
                      const currentTypes = filters.energyType || [];
                      let newTypes: string[];
                      
                      if (e.target.checked) {
                        newTypes = [...currentTypes, type];
                      } else {
                        newTypes = currentTypes.filter(t => t !== type);
                      }
                      
                      onFiltersChange({ 
                        energyType: newTypes.length > 0 ? newTypes : undefined 
                      });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatusFilterComponent;
