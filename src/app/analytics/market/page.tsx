'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  RefreshCw,
  Settings,
  Download,
  Bell,
  TrendingUp,
  Activity,
  Zap,
  Wind,
  Droplet,
  Atom,
  Flame,
  Factory,
  Leaf
} from 'lucide-react';
import { MarketAnalyticsProvider, useMarketAnalytics } from '@/hooks/useMarketAnalytics';
import { MarketOverview } from '@/components/analytics/MarketOverview';
import { VolumeAnalysis } from '@/components/analytics/VolumeAnalysis';
import { PriceTrends } from '@/components/analytics/PriceTrends';
import { SentimentIndicators } from '@/components/analytics/SentimentIndicators';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';
import { EnergyType, TimeInterval } from '@/types/analytics';
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

const energyTypes: EnergyType[] = ['solar', 'wind', 'hydro', 'nuclear', 'natural_gas', 'coal', 'biomass'];

// Main dashboard component
function MarketAnalyticsDashboard() {
  const { state, actions, config, updateConfig } = useMarketAnalytics();
  const [selectedEnergyType, setSelectedEnergyType] = useState<EnergyType>('solar');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeInterval>('1h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await actions.refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = () => {
    // Export functionality
    const data = {
      metrics: state.metrics,
      volumeAnalysis: state.volumeAnalysis,
      priceTrends: state.priceTrends,
      sentiment: state.sentiment,
      comparative: state.comparative,
      predictive: state.predictive,
      lastUpdated: state.lastUpdated,
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTimeRangeChange = (range: TimeInterval) => {
    setSelectedTimeRange(range);
    actions.fetchPriceTrends(selectedEnergyType, range);
  };

  const handleEnergyTypeChange = (energyType: EnergyType) => {
    setSelectedEnergyType(energyType);
    actions.fetchPriceTrends(energyType, selectedTimeRange);
    actions.fetchPredictive(energyType);
  };

  useEffect(() => {
    // Initial data fetch
    actions.fetchPriceTrends(selectedEnergyType, selectedTimeRange);
    actions.fetchPredictive(selectedEnergyType);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Market Analytics</h1>
                <p className="text-sm text-gray-500">Real-time energy market insights and predictions</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Energy Type Selector */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                {energyTypes.slice(0, 4).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleEnergyTypeChange(type)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      selectedEnergyType === type
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {energyTypeIcons[type]}
                      <span className="capitalize">{type}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2"
                >
                  <Bell className="w-4 h-4" />
                  {state.events.filter(e => !e.acknowledged).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleExportData}
                  className="p-2"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing || state.isLoading}
                  className="p-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing || state.isLoading ? 'animate-spin' : ''}`} />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>Energy Type: <span className="font-medium text-gray-900 capitalize">{selectedEnergyType}</span></span>
              <span>•</span>
              <span>Time Range: <span className="font-medium text-gray-900">{selectedTimeRange}</span></span>
              <span>•</span>
              <span>Last Updated: <span className="font-medium text-gray-900">
                {state.lastUpdated ? new Date(state.lastUpdated).toLocaleTimeString() : 'Never'}
              </span></span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                state.isLoading ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              <span>{state.isLoading ? 'Loading...' : 'Live'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel */}
      {showNotifications && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-white border-b border-gray-200 shadow-lg z-10"
        >
          <div className="px-4 py-3 sm:px-6 lg:px-8">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Market Alerts</h3>
            <div className="space-y-2">
              {state.events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className={`p-2 rounded-lg text-sm ${
                    event.severity === 'critical' ? 'bg-red-50 text-red-900' :
                    event.severity === 'high' ? 'bg-orange-50 text-orange-900' :
                    event.severity === 'medium' ? 'bg-yellow-50 text-yellow-900' :
                    'bg-blue-50 text-blue-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{event.title}</span>
                      <span className="ml-2 text-xs opacity-75">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs mt-1 opacity-90">{event.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Error Display */}
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-900">Data Loading Error</h3>
                <p className="text-sm text-red-700">{state.error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => actions.clearError()}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </motion.div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Market Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 xl:col-span-3"
          >
            <MarketOverview
              metrics={state.metrics}
              isLoading={state.isLoading}
              error={state.error}
              refreshInterval={config.refreshInterval}
              onRefresh={actions.refreshData}
            />
          </motion.div>

          {/* Price Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 xl:col-span-2"
          >
            <PriceTrends
              data={state.priceTrends}
              historicalData={state.historicalData}
              isLoading={state.isLoading}
              error={state.error}
              timeRange={selectedTimeRange}
              onTimeRangeChange={handleTimeRangeChange}
              showTechnicalIndicators={true}
            />
          </motion.div>

          {/* Volume Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 xl:col-span-1"
          >
            <VolumeAnalysis
              data={state.volumeAnalysis}
              isLoading={state.isLoading}
              error={state.error}
              timeRange={selectedTimeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </motion.div>

          {/* Sentiment Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 xl:col-span-1"
          >
            <SentimentIndicators
              data={state.sentiment}
              isLoading={state.isLoading}
              error={state.error}
              showBreakdown={true}
              historicalSentiment={[]}
            />
          </motion.div>

          {/* Predictive Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2 xl:col-span-2"
          >
            <PredictiveAnalytics
              data={state.predictive}
              isLoading={state.isLoading}
              error={state.error}
              showConfidence={true}
              timeHorizon="24h"
            />
          </motion.div>
        </div>

        {/* Additional Analytics Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Energy Type Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {energyTypes.map((type, index) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedEnergyType === type
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-gray-200'
                }`}
                onClick={() => handleEnergyTypeChange(type)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      {energyTypeIcons[type]}
                    </div>
                    <span className="font-medium text-gray-900 capitalize">{type}</span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${(45 + Math.random() * 110).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Volume</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(1000 + Math.random() * 9000).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">24h Change</span>
                    <span className={`text-sm font-medium ${
                      Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {Math.random() > 0.5 ? '+' : ''}{(Math.random() * 20 - 10).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Page component with provider
export default function MarketAnalyticsPage() {
  return (
    <MarketAnalyticsProvider>
      <MarketAnalyticsDashboard />
    </MarketAnalyticsProvider>
  );
}
