import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Smile,
  Frown,
  Meh,
  RefreshCw,
  AlertTriangle,
  Info,
  ChevronDown,
  MessageCircle,
  Newspaper,
  BarChart3,
  Brain,
  Twitter,
  Globe
} from 'lucide-react';
import { SentimentIndicatorsProps, SentimentData } from '@/types/analytics';
import { formatPercentage } from '@/utils/analyticsCalculations';
import { Button } from '@/components/ui/Button';

const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#6b7280',
};

const SENTIMENT_THRESHOLDS = {
  very_positive: 50,
  positive: 20,
  neutral: -20,
  negative: -50,
  very_negative: -100,
};

const sourceIcons = {
  Twitter: <Twitter className="w-4 h-4" />,
  Reddit: <MessageCircle className="w-4 h-4" />,
  'News API': <Newspaper className="w-4 h-4" />,
  'Technical Analysis': <BarChart3 className="w-4 h-4" />,
};

export const SentimentIndicators: React.FC<SentimentIndicatorsProps> = ({
  data,
  isLoading = false,
  error = null,
  className = '',
  showBreakdown = true,
  historicalSentiment = [],
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const getSentimentIcon = (value: number) => {
    if (value > SENTIMENT_THRESHOLDS.positive) {
      return <Smile className="w-4 h-4 text-green-600" />;
    } else if (value < SENTIMENT_THRESHOLDS.negative) {
      return <Frown className="w-4 h-4 text-red-600" />;
    } else {
      return <Meh className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSentimentColor = (value: number) => {
    if (value > SENTIMENT_THRESHOLDS.positive) {
      return 'text-green-600';
    } else if (value < SENTIMENT_THRESHOLDS.negative) {
      return 'text-red-600';
    } else {
      return 'text-gray-600';
    }
  };

  const getSentimentBg = (value: number) => {
    if (value > SENTIMENT_THRESHOLDS.positive) {
      return 'bg-green-50';
    } else if (value < SENTIMENT_THRESHOLDS.negative) {
      return 'bg-red-50';
    } else {
      return 'bg-gray-50';
    }
  };

  const getSentimentLabel = (value: number) => {
    if (value > SENTIMENT_THRESHOLDS.very_positive) return 'Very Positive';
    if (value > SENTIMENT_THRESHOLDS.positive) return 'Positive';
    if (value > SENTIMENT_THRESHOLDS.neutral) return 'Neutral';
    if (value > SENTIMENT_THRESHOLDS.negative) return 'Negative';
    return 'Very Negative';
  };

  // Prepare data for pie chart
  const sentimentDistribution = [
    { name: 'Positive', value: Math.max(0, data.overall), color: SENTIMENT_COLORS.positive },
    { name: 'Negative', value: Math.max(0, -data.overall), color: SENTIMENT_COLORS.negative },
    { name: 'Neutral', value: Math.max(0, 100 - Math.abs(data.overall)), color: SENTIMENT_COLORS.neutral },
  ];

  // Prepare data for source breakdown
  const sourceData = data.sources.map(source => ({
    name: source.name,
    sentiment: source.sentiment,
    weight: source.weight * 100,
    color: source.sentiment > 0 ? SENTIMENT_COLORS.positive : 
           source.sentiment < 0 ? SENTIMENT_COLORS.negative : SENTIMENT_COLORS.neutral,
  }));

  // Prepare historical data for trend chart
  const historicalChartData = historicalSentiment.map((sentiment, index) => ({
    time: new Date(sentiment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    overall: sentiment.overall,
    social: sentiment.social,
    news: sentiment.news,
    technical: sentiment.technical,
    fundamental: sentiment.fundamental,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatPercentage(entry.value)}
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
            <h3 className="font-semibold">Error Loading Sentiment Data</h3>
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
          <span className="ml-3 text-gray-600">Loading sentiment indicators...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 text-gray-500">
          <Info className="w-5 h-5" />
          <p>No sentiment data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Market Sentiment</h2>
            <p className="text-sm text-gray-500">Social and news sentiment analysis</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
          </span>
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

      {/* Sentiment Overview */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Overall Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${getSentimentBg(data.overall)} rounded-lg p-4 border`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Overall</span>
              {getSentimentIcon(data.overall)}
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${getSentimentColor(data.overall)}`}>
                {formatPercentage(data.overall)}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {getSentimentLabel(data.overall)}
              </p>
            </div>
          </motion.div>

          {/* Social Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${getSentimentBg(data.social)} rounded-lg p-4 border`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Social</span>
              </div>
              {getSentimentIcon(data.social)}
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${getSentimentColor(data.social)}`}>
                {formatPercentage(data.social)}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {getSentimentLabel(data.social)}
              </p>
            </div>
          </motion.div>

          {/* News Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${getSentimentBg(data.news)} rounded-lg p-4 border`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">News</span>
              </div>
              {getSentimentIcon(data.news)}
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${getSentimentColor(data.news)}`}>
                {formatPercentage(data.news)}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {getSentimentLabel(data.news)}
              </p>
            </div>
          </motion.div>

          {/* Technical Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${getSentimentBg(data.technical)} rounded-lg p-4 border`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Technical</span>
              </div>
              {getSentimentIcon(data.technical)}
            </div>
            <div className="space-y-1">
              <p className={`text-2xl font-bold ${getSentimentColor(data.technical)}`}>
                {formatPercentage(data.technical)}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {getSentimentLabel(data.technical)}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Sentiment Distribution Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pie Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatPercentage(value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sentimentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6b7280"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => formatPercentage(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="sentiment" fill="#8884d8">
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Historical Trend */}
        {historicalSentiment.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Trend</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="time" 
                      stroke="#6b7280"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => formatPercentage(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="overall"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                      name="Overall"
                    />
                    <Line
                      type="monotone"
                      dataKey="social"
                      stroke="#10b981"
                      strokeWidth={1}
                      dot={false}
                      name="Social"
                    />
                    <Line
                      type="monotone"
                      dataKey="news"
                      stroke="#8b5cf6"
                      strokeWidth={1}
                      dot={false}
                      name="News"
                    />
                    <Line
                      type="monotone"
                      dataKey="technical"
                      stroke="#f59e0b"
                      strokeWidth={1}
                      dot={false}
                      name="Technical"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

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
              
              {/* Source Details */}
              <div className="space-y-4">
                {data.sources.map((source, index) => (
                  <motion.div
                    key={source.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSource === source.name 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedSource(selectedSource === source.name ? null : source.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {sourceIcons[source.name as keyof typeof sourceIcons] || <Globe className="w-4 h-4" />}
                          <span className="font-medium text-gray-900">{source.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Weight: {formatPercentage(source.weight * 100)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${getSentimentColor(source.sentiment)}`}>
                          {formatPercentage(source.sentiment)}
                        </span>
                        {getSentimentIcon(source.sentiment)}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {selectedSource === source.name && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-gray-200"
                        >
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Last Updated:</span>
                              <span className="ml-2 font-medium">
                                {new Date(source.lastUpdated).toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Contribution:</span>
                              <span className="ml-2 font-medium">
                                {formatPercentage(source.sentiment * source.weight)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Fundamental Analysis */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Fundamental Analysis</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatPercentage(data.fundamental)}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      Based on market fundamentals and economic indicators
                    </p>
                  </div>
                  {getSentimentIcon(data.fundamental)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sentiment Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                data.overall > 0 ? 'bg-green-500' : 
                data.overall < 0 ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                Market Sentiment: {getSentimentLabel(data.overall)}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Sources: {data.sources.length}</span>
              <span>•</span>
              <span>Updated: {new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentIndicators;
