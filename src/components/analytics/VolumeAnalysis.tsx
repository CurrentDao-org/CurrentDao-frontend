import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronDown,
  Zap,
  Wind,
  Droplet,
  Atom,
  Flame,
  Factory,
  Leaf
} from 'lucide-react';
import { VolumeAnalysisProps, TimeInterval, EnergyType } from '@/types/analytics';
import { formatNumber, formatPercentage, getEnergyTypeName, getEnergyTypeColor } from '@/utils/analyticsCalculations';
import { Button } from '@/components/ui/Button';

const energyTypeIcons: Record<EnergyType, React.ReactNode> = {
  solar: <Zap className="w-4 h-4" />,
  wind: <Wind className="w-4 h-4" />,
  hydro: <Droplet className="w-4 h-4" />,
  nuclear: <Atom className="w-4 h-4" />,
  natural_gas: <Flame className="w-4 h-4" />,
  coal: <Factory className="w-4 h-4" />,
  biomass: <Leaf className="w-4 h-4" />,
};

const timeRanges: { value: TimeInterval; label: string }[] = [
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
  { value: '1M', label: '1 Month' },
];

export const VolumeAnalysis: React.FC<VolumeAnalysisProps> = ({
  data,
  isLoading = false,
  error = null,
  className = '',
  timeRange = '1h',
  onTimeRangeChange,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEnergyType, setSelectedEnergyType] = useState<EnergyType | null>(null);

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  const getTrendBg = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return 'bg-green-50';
      case 'decreasing':
        return 'bg-red-50';
      case 'stable':
        return 'bg-gray-50';
    }
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Error Loading Volume Data</h3>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-3 text-gray-600">Loading volume analysis...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <Info className="w-5 h-5" />
          <p>No volume data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Volume Analysis</h2>
            <p className="text-sm text-gray-500">Trading volume patterns and trends</p>
          </div>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => onTimeRangeChange?.(e.target.value as TimeInterval)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Volume Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Current Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Current Volume</span>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.currentVolume)}
              </p>
              <p className="text-xs text-gray-500">
                WATT tokens
              </p>
            </div>
          </motion.div>

          {/* Volume Change */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${getTrendBg(data.volumeTrend)} rounded-lg p-4 border`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Volume Change</span>
              {getTrendIcon(data.volumeTrend)}
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${getTrendColor(data.volumeTrend)}`}>
                {formatPercentage(data.volumeChangePercent)}
              </p>
              <p className="text-xs text-gray-500">
                vs average volume
              </p>
            </div>
          </motion.div>

          {/* Peak Volume */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Peak Volume</span>
              <TrendingUp className="w-4 h-4 text-orange-600" />
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(data.peakVolume)}
              </p>
              <p className="text-xs text-gray-500">
                Highest recorded
              </p>
            </div>
          </motion.div>
        </div>

        {/* Volume by Energy Type */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Volume by Energy Type</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="p-2"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            </Button>
          </div>

          <div className="space-y-3">
            {data.volumeDistribution.map((dist, index) => (
              <motion.div
                key={dist.energyType}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setSelectedEnergyType(dist.energyType)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getEnergyTypeColor(dist.energyType) + '20' }}
                  >
                    <div style={{ color: getEnergyTypeColor(dist.energyType) }}>
                      {energyTypeIcons[dist.energyType]}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getEnergyTypeName(dist.energyType)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatNumber(dist.volume)} WATT
                    </p>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {formatPercentage(dist.percentage)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${dist.percentage}%`,
                        backgroundColor: getEnergyTypeColor(dist.energyType),
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 pt-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Average Volume */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Average Volume</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatNumber(data.averageVolume)}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Over selected period
                  </p>
                </div>

                {/* Volume Trend Analysis */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    {getTrendIcon(data.volumeTrend)}
                    <span className="text-sm font-medium text-purple-900">Trend Analysis</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900 capitalize">
                    {data.volumeTrend}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Based on recent activity
                  </p>
                </div>
              </div>

              {/* Volume by Energy Type Table */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Volume by Energy Type</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-700">Energy Type</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-700">Volume</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-700">Percentage</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-700">vs Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.volumeDistribution.map((dist) => (
                        <tr key={dist.energyType} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center"
                                style={{ backgroundColor: getEnergyTypeColor(dist.energyType) + '20' }}
                              >
                                <div style={{ color: getEnergyTypeColor(dist.energyType) }}>
                                  {energyTypeIcons[dist.energyType]}
                                </div>
                              </div>
                              <span className="font-medium">{getEnergyTypeName(dist.energyType)}</span>
                            </div>
                          </td>
                          <td className="text-right py-2 px-3 font-mono">
                            {formatNumber(dist.volume)}
                          </td>
                          <td className="text-right py-2 px-3">
                            <span className="font-medium">{formatPercentage(dist.percentage)}</span>
                          </td>
                          <td className="text-right py-2 px-3">
                            <span className={`font-medium ${
                              dist.percentage > 20 ? 'text-green-600' : 
                              dist.percentage > 10 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {dist.percentage > 20 ? '↑ High' : dist.percentage > 10 ? '→ Normal' : '↓ Low'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected Energy Type Details */}
        {selectedEnergyType && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getEnergyTypeColor(selectedEnergyType) + '20' }}
                >
                  <div style={{ color: getEnergyTypeColor(selectedEnergyType) }}>
                    {energyTypeIcons[selectedEnergyType]}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900">
                  {getEnergyTypeName(selectedEnergyType)} Details
                </h4>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedEnergyType(null)}
                className="p-1"
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Volume:</span>
                <span className="ml-2 font-medium">
                  {formatNumber(data.volumeByEnergyType[selectedEnergyType] || 0)} WATT
                </span>
              </div>
              <div>
                <span className="text-gray-600">Market Share:</span>
                <span className="ml-2 font-medium">
                  {formatPercentage(
                    data.volumeDistribution.find(d => d.energyType === selectedEnergyType)?.percentage || 0
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VolumeAnalysis;
