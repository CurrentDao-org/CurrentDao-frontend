import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Leaf, 
  Zap, 
  Droplets, 
  Recycle, 
  BarChart3,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useCarbonTracking } from '../../hooks/useCarbonTracking';
import { 
  SustainabilityMetric, 
  MetricType, 
  MetricPeriod, 
  MetricTrend,
  CarbonAnalytics 
} from '../../types/carbon';

interface SustainabilityMetricsProps {
  userId: string;
}

export const SustainabilityMetrics: React.FC<SustainabilityMetricsProps> = ({ userId }) => {
  const { 
    state, 
    analytics, 
    loadAnalytics,
    exportData 
  } = useCarbonTracking({ userId });

  const [selectedPeriod, setSelectedPeriod] = useState<MetricPeriod>('monthly');
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const getMetricIcon = (type: MetricType) => {
    switch (type) {
      case MetricType.CARBON_FOOTPRINT:
        return <Leaf className="h-5 w-5" />;
      case MetricType.ENERGY_CONSUMPTION:
        return <Zap className="h-5 w-5" />;
      case MetricType.WATER_USAGE:
        return <Droplets className="h-5 w-5" />;
      case MetricType.WASTE_GENERATED:
        return <Recycle className="h-5 w-5" />;
      case MetricType.RENEWABLE_ENERGY_PERCENTAGE:
        return <Activity className="h-5 w-5" />;
      case MetricType.CARBON_INTENSITY:
        return <BarChart3 className="h-5 w-5" />;
      case MetricType.SUSTAINABILITY_SCORE:
        return <Award className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  const getMetricColor = (type: MetricType) => {
    switch (type) {
      case MetricType.CARBON_FOOTPRINT:
        return 'text-red-600 bg-red-50';
      case MetricType.ENERGY_CONSUMPTION:
        return 'text-yellow-600 bg-yellow-50';
      case MetricType.WATER_USAGE:
        return 'text-blue-600 bg-blue-50';
      case MetricType.WASTE_GENERATED:
        return 'text-gray-600 bg-gray-50';
      case MetricType.RENEWABLE_ENERGY_PERCENTAGE:
        return 'text-green-600 bg-green-50';
      case MetricType.CARBON_INTENSITY:
        return 'text-orange-600 bg-orange-50';
      case MetricType.SUSTAINABILITY_SCORE:
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = (trend: MetricTrend) => {
    switch (trend) {
      case MetricTrend.INCREASING:
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case MetricTrend.DECREASING:
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case MetricTrend.STABLE:
        return <Target className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPerformanceColor = (current: number, target: number) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceStatus = (current: number, target: number) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    if (percentage >= 100) return 'On Target';
    if (percentage >= 75) return 'Good Progress';
    if (percentage >= 50) return 'Needs Attention';
    return 'Critical';
  };

  const renderMetricCard = (metric: SustainabilityMetric) => {
    const performance = metric.target ? (metric.value / metric.target) * 100 : 0;
    const status = getPerformanceStatus(metric.value, metric.target);
    
    return (
      <div key={metric.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getMetricColor(metric.type)}`}>
              {getMetricIcon(metric.type)}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {metric.type.replace('_', ' ').charAt(0).toUpperCase() + 
                 metric.type.slice(1).replace('_', ' ')}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMetricColor(metric.type)}`}>
                  {metric.period.charAt(0).toUpperCase() + metric.period.slice(1)}
                </span>
                <div className="flex items-center">
                  {getTrendIcon(metric.trend)}
                  <span className={`text-xs ml-1 ${
                    metric.trend === MetricTrend.INCREASING ? 'text-red-600' :
                    metric.trend === MetricTrend.DECREASING ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {metric.trend.charAt(0).toUpperCase() + metric.trend.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(showDetails === metric.id ? null : metric.id)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-gray-900">
              {metric.value.toFixed(2)}
            </span>
            <span className="text-sm text-gray-600">{metric.unit}</span>
          </div>

          {metric.target && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Target</span>
                <span className="font-medium text-gray-900">
                  {metric.target.toFixed(2)} {metric.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    performance >= 100 ? 'bg-green-500' :
                    performance >= 75 ? 'bg-yellow-500' :
                    performance >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(performance, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-600">Progress</span>
                <span className={`font-medium ${getPerformanceColor(metric.value, metric.target)}`}>
                  {performance.toFixed(1)}%
                </span>
              </div>
              <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                status === 'On Target' ? 'text-green-700 bg-green-100' :
                status === 'Good Progress' ? 'text-yellow-700 bg-yellow-100' :
                status === 'Needs Attention' ? 'text-orange-700 bg-orange-100' :
                'text-red-700 bg-red-100'
              }`}>
                {status}
              </div>
            </div>
          )}

          {showDetails === metric.id && (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Date</span>
                  <div className="font-medium text-gray-900">
                    {metric.date.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated</span>
                  <div className="font-medium text-gray-900">
                    {metric.updatedAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderOverallScore = () => {
    if (!analytics) return null;
    
    const score = 100 - (analytics.netEmissions / analytics.totalEmissions) * 100;
    const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : score >= 40 ? 'text-orange-600' : 'text-red-600';
    
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sustainability Score</h3>
          <div className={`text-4xl font-bold ${scoreColor} mb-2`}>
            {score.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Based on emissions, offsets, and reduction progress
          </div>
          
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">{analytics.totalEmissions.toFixed(0)}</div>
              <div className="text-gray-600">Total Emissions</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${scoreColor}`}>{analytics.netEmissions.toFixed(0)}</div>
              <div className="text-gray-600">Net Emissions</div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${scoreColor}`}>{(analytics.totalOffsets / analytics.totalEmissions * 100).toFixed(1)}%</div>
              <div className="text-gray-600">Offset Coverage</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderKeyMetrics = () => {
    if (!analytics) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Emissions</span>
            <Leaf className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {analytics.totalEmissions.toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">kg CO2e</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Total Offsets</span>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {analytics.totalOffsets.toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">kg CO2e</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Net Emissions</span>
            {analytics.netEmissions > 0 ? (
              <TrendingUp className="h-5 w-5 text-red-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-500" />
            )}
          </div>
          <div className={`text-2xl font-bold ${
            analytics.netEmissions > 0 ? 'text-red-600' : 'text-green-600'
          }`}>
            {Math.abs(analytics.netEmissions).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">kg CO2e</div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Reduction Rate</span>
            <TrendingDown className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {analytics.yearOverYearComparison.changePercentage.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Year over Year</div>
        </div>
      </div>
    );
  };

  const renderCategoryBreakdown = () => {
    if (!analytics) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions by Category</h3>
        
        <div className="space-y-3">
          {Object.entries(analytics.categoryBreakdown).map(([category, amount]) => {
            const percentage = analytics.totalEmissions > 0 ? (amount / analytics.totalEmissions) * 100 : 0;
            const categoryColors = {
              'scope1': 'text-red-600 bg-red-50',
              'scope2': 'text-yellow-600 bg-yellow-50',
              'scope3': 'text-blue-600 bg-blue-50'
            };
            
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${categoryColors[category as keyof typeof categoryColors]}`} />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      category === 'scope1' ? 'bg-red-500' :
                      category === 'scope2' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTrendChart = () => {
    if (!analytics) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend</h3>
        
        <div className="space-y-3">
          {analytics.monthlyTrend.map((trend, index) => {
            const netColor = trend.net >= 0 ? 'text-red-600' : 'text-green-600';
            const netIcon = trend.net >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
            
            return (
              <div key={trend.month} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-red-600">
                      {trend.emissions.toFixed(0)} kg
                    </span>
                    <span className="text-green-600">
                      {trend.offsets.toFixed(0)} kg
                    </span>
                    <div className={`flex items-center ${netColor}`}>
                      {netIcon}
                      <span className="ml-1 font-medium">
                        {Math.abs(trend.net).toFixed(0)} kg
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded h-6 relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-red-500 opacity-50"
                      style={{ width: `${analytics.totalEmissions > 0 ? (trend.emissions / analytics.totalEmissions) * 100 : 0}%` }}
                    />
                    <div
                      className="absolute left-0 top-0 h-full bg-green-500"
                      style={{ width: `${analytics.totalEmissions > 0 ? (trend.offsets / analytics.totalEmissions) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 opacity-50 rounded" />
              <span className="text-gray-600">Emissions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-600">Offsets</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    const recommendations = state.recommendations.slice(0, 3);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
        
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      rec.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      rec.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      rec.difficulty === 'challenging' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}
                    </span>
                    <span className="text-gray-500">{rec.timeframe}</span>
                    <span className="font-medium text-gray-900">
                      {rec.impact.toFixed(1)} kg CO2e
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    rec.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    rec.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                  </span>
                  {rec.cost && (
                    <span className="text-sm text-gray-600">
                      ${rec.cost > 0 ? '$' : ''}{rec.cost}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sustainability Metrics</h2>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => loadAnalytics()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              autoRefresh 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Clock className="h-4 w-4 mr-2" />
            Auto Refresh
          </button>
          
          <button
            onClick={() => exportData('emissions', 'csv')}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {renderOverallScore()}
      {renderKeyMetrics()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {state.metrics.map(renderMetricCard)}
        </div>
        
        <div className="space-y-6">
          {renderCategoryBreakdown()}
          {renderTrendChart()}
          {renderRecommendations()}
        </div>
      </div>
    </div>
  );
};
