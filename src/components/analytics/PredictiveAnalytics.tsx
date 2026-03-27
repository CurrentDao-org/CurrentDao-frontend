import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronDown,
  Brain,
  Target,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { PredictiveAnalyticsProps } from '@/types/analytics';
import { formatNumber, formatPercentage } from '@/utils/analyticsCalculations';
import { Button } from '@/components/ui/Button';

const MODEL_COLORS = {
  arima: '#3b82f6',
  lstm: '#8b5cf6',
  linear_regression: '#10b981',
  ensemble: '#f59e0b',
};

const RISK_COLORS = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444',
  extreme: '#7c3aed',
};

const MODEL_DESCRIPTIONS = {
  arima: 'AutoRegressive Integrated Moving Average - Time series forecasting',
  lstm: 'Long Short-Term Memory - Neural network for sequence prediction',
  linear_regression: 'Linear Regression - Simple trend-based prediction',
  ensemble: 'Ensemble Model - Combined predictions from multiple models',
};

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({
  data,
  isLoading = false,
  error = null,
  className = '',
  showConfidence = true,
  timeHorizon = '24h',
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('ensemble');

  const getRiskIcon = (level: 'low' | 'medium' | 'high' | 'extreme') => {
    switch (level) {
      case 'low':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'extreme':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getRiskColor = (level: 'low' | 'medium' | 'high' | 'extreme') => {
    switch (level) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-orange-600';
      case 'extreme':
        return 'text-red-600';
    }
  };

  const getRiskBg = (level: 'low' | 'medium' | 'high' | 'extreme') => {
    switch (level) {
      case 'low':
        return 'bg-green-50';
      case 'medium':
        return 'bg-yellow-50';
      case 'high':
        return 'bg-orange-50';
      case 'extreme':
        return 'bg-red-50';
    }
  };

  // Prepare chart data for price forecasts
  const priceForecastData = data.priceForecast.map((forecast, index) => ({
    timeHorizon: forecast.timeHorizon,
    predictedPrice: forecast.predictedPrice,
    lowerBound: forecast.confidenceInterval.lower,
    upperBound: forecast.confidenceInterval.upper,
    probability: forecast.probability * 100,
    model: forecast.model,
    color: MODEL_COLORS[forecast.model as keyof typeof MODEL_COLORS],
  }));

  // Prepare chart data for volume forecasts
  const volumeForecastData = data.volumeForecast.map((forecast, index) => ({
    timeHorizon: forecast.timeHorizon,
    predictedVolume: forecast.predictedVolume,
    lowerBound: forecast.confidenceInterval.lower,
    upperBound: forecast.confidenceInterval.upper,
    probability: forecast.probability * 100,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.dataKey === 'predictedPrice' ? '$' : ''}{formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Error Loading Predictive Data</h3>
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
          <span className="ml-3 text-gray-600">Loading predictive analytics...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <Info className="w-5 h-5" />
          <p>No predictive data available</p>
        </div>
      </div>
    );
  }

  const selectedPriceForecast = data.priceForecast.find(f => f.timeHorizon === timeHorizon);
  const selectedVolumeForecast = data.volumeForecast.find(f => f.timeHorizon === timeHorizon);

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Predictive Analytics</h2>
            <p className="text-sm text-gray-500">AI-powered market forecasts and risk assessment</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Time Horizon Selector */}
          <div className="relative">
            <select
              value={timeHorizon}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">1 Hour</option>
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="p-2"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Risk Level */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${getRiskBg(data.riskAssessment.riskLevel)} rounded-lg p-4 border`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-600">Risk Level</span>
              </div>
              {getRiskIcon(data.riskAssessment.riskLevel)}
            </div>
            <div className="space-y-2">
              <p className={`text-2xl font-bold capitalize ${getRiskColor(data.riskAssessment.riskLevel)}`}>
                {data.riskAssessment.riskLevel}
              </p>
              <div className="space-y-1">
                {data.riskAssessment.factors.slice(0, 2).map((factor, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{factor.name}</span>
                    <span className="font-medium">
                      {formatPercentage(factor.impact)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Selected Forecast */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  {timeHorizon} Forecast
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {selectedPriceForecast && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-lg font-bold text-gray-900">
                      ${formatNumber(selectedPriceForecast.predictedPrice)}
                    </span>
                  </div>
                  {showConfidence && (
                    <div className="text-xs text-gray-500">
                      Range: ${formatNumber(selectedPriceForecast.confidenceInterval.lower)} - 
                      ${formatNumber(selectedPriceForecast.confidenceInterval.upper)}
                    </div>
                  )}
                </>
              )}
              {selectedVolumeForecast && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Volume</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(selectedVolumeForecast.predictedVolume)}
                    </span>
                  </div>
                  {showConfidence && (
                    <div className="text-xs text-gray-500">
                      Range: {formatNumber(selectedVolumeForecast.confidenceInterval.lower)} - 
                      {formatNumber(selectedVolumeForecast.confidenceInterval.upper)}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Price Forecast Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Forecast</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceForecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="timeHorizon" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => `$${formatNumber(value)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {/* Confidence interval */}
                  {showConfidence && (
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="#e5e7eb"
                      fill="#e5e7eb"
                      fillOpacity={0.3}
                      strokeWidth={0}
                      name="Upper Bound"
                    />
                  )}
                  
                  {/* Main prediction line */}
                  <Area
                    type="monotone"
                    dataKey="predictedPrice"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.3}
                    strokeWidth={2}
                    name="Predicted Price"
                  />
                  
                  {showConfidence && (
                    <Area
                      type="monotone"
                      dataKey="lowerBound"
                      stroke="#e5e7eb"
                      fill="#ffffff"
                      strokeWidth={0}
                      name="Lower Bound"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Volume Forecast Chart */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Volume Forecast</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeForecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="timeHorizon" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  <Line
                    type="monotone"
                    dataKey="predictedVolume"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Predicted Volume"
                  />
                  
                  {showConfidence && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="upperBound"
                        stroke="#e5e7eb"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Upper Bound"
                      />
                      <Line
                        type="monotone"
                        dataKey="lowerBound"
                        stroke="#e5e7eb"
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        dot={false}
                        name="Lower Bound"
                      />
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Model Performance */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.priceForecast.map((forecast, index) => (
              <motion.div
                key={forecast.model}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedModel === forecast.model 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedModel(forecast.model)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {forecast.model.replace('_', ' ')}
                  </span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: MODEL_COLORS[forecast.model as keyof typeof MODEL_COLORS] }}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-gray-900">
                    {formatPercentage(forecast.probability)}
                  </p>
                  <p className="text-xs text-gray-500">Confidence</p>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
              
              {/* Risk Factors */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Risk Factors</h4>
                <div className="space-y-3">
                  {data.riskAssessment.factors.map((factor, index) => (
                    <motion.div
                      key={factor.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{factor.name}</p>
                        <p className="text-sm text-gray-600">{factor.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatPercentage(factor.impact)}
                        </p>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.abs(factor.impact))}%`,
                              backgroundColor: factor.impact > 50 ? '#ef4444' : 
                                               factor.impact > 25 ? '#f59e0b' : '#10b981',
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {data.riskAssessment.recommendations.map((recommendation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-900">{recommendation}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Model Descriptions */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Model Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(MODEL_DESCRIPTIONS).map(([model, description]) => (
                    <motion.div
                      key={model}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + Object.keys(MODEL_DESCRIPTIONS).indexOf(model) * 0.1 }}
                      className={`p-3 rounded-lg border ${
                        selectedModel === model 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: MODEL_COLORS[model as keyof typeof MODEL_COLORS] }}
                        />
                        <span className="font-medium text-gray-900 capitalize">
                          {model.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                data.riskAssessment.riskLevel === 'low' ? 'bg-green-500' : 
                data.riskAssessment.riskLevel === 'medium' ? 'bg-yellow-500' : 
                data.riskAssessment.riskLevel === 'high' ? 'bg-orange-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Overall Risk: {data.riskAssessment.riskLevel.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Models: {data.priceForecast.length}</span>
              <span>•</span>
              <span>Forecast Accuracy: {formatPercentage(
                data.priceForecast.reduce((acc, f) => acc + f.probability, 0) / data.priceForecast.length * 100
              )}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictiveAnalytics;
