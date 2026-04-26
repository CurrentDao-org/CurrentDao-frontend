import React from 'react';
import { PerformanceMetrics } from '../../types/portfolio';
import { TrendingUp, TrendingDown, Activity, Shield, Target, BarChart3 } from 'lucide-react';

interface PerformanceMetricsProps {
  metrics: PerformanceMetrics;
  loading?: boolean;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ 
  metrics, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatPercentage = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatRatio = (value: number) => value.toFixed(2);

  const MetricCard: React.FC<{
    title: string;
    value: string;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, subtitle, trend, icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : trend === 'down' ? <TrendingDown className="w-4 h-4" /> : null}
            <span className="text-sm font-medium">
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Performance Metrics</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Activity className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Return"
          value={formatCurrency(metrics.totalReturn)}
          subtitle={formatPercentage(metrics.totalReturnPercentage)}
          trend={metrics.totalReturn >= 0 ? 'up' : 'down'}
          icon={<TrendingUp className="w-5 h-5 text-white" />}
          color={metrics.totalReturn >= 0 ? 'bg-green-100' : 'bg-red-100'}
        />

        <MetricCard
          title="Annualized Return"
          value={formatPercentage(metrics.annualizedReturn)}
          trend={metrics.annualizedReturn >= 0 ? 'up' : 'down'}
          icon={<BarChart3 className="w-5 h-5 text-white" />}
          color={metrics.annualizedReturn >= 0 ? 'bg-blue-100' : 'bg-red-100'}
        />

        <MetricCard
          title="Sharpe Ratio"
          value={formatRatio(metrics.sharpeRatio)}
          subtitle="Risk-adjusted return"
          trend={metrics.sharpeRatio >= 1 ? 'up' : metrics.sharpeRatio >= 0 ? 'neutral' : 'down'}
          icon={<Shield className="w-5 h-5 text-white" />}
          color={metrics.sharpeRatio >= 1 ? 'bg-green-100' : metrics.sharpeRatio >= 0 ? 'bg-yellow-100' : 'bg-red-100'}
        />

        <MetricCard
          title="Volatility"
          value={formatPercentage(metrics.volatility)}
          subtitle="Risk measure"
          trend={metrics.volatility <= 20 ? 'up' : metrics.volatility <= 30 ? 'neutral' : 'down'}
          icon={<Activity className="w-5 h-5 text-white" />}
          color={metrics.volatility <= 20 ? 'bg-green-100' : metrics.volatility <= 30 ? 'bg-yellow-100' : 'bg-red-100'}
        />

        <MetricCard
          title="Max Drawdown"
          value={formatPercentage(metrics.maxDrawdown)}
          subtitle="Peak to trough"
          trend={metrics.maxDrawdown <= 10 ? 'up' : metrics.maxDrawdown <= 20 ? 'neutral' : 'down'}
          icon={<TrendingDown className="w-5 h-5 text-white" />}
          color={metrics.maxDrawdown <= 10 ? 'bg-green-100' : metrics.maxDrawdown <= 20 ? 'bg-yellow-100' : 'bg-red-100'}
        />

        <MetricCard
          title="Win Rate"
          value={formatPercentage(metrics.winRate)}
          subtitle={`${metrics.winningTrades} of ${metrics.totalTrades} trades`}
          trend={metrics.winRate >= 50 ? 'up' : 'down'}
          icon={<Target className="w-5 h-5 text-white" />}
          color={metrics.winRate >= 50 ? 'bg-green-100' : 'bg-red-100'}
        />
      </div>

      {/* Detailed Trading Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Trading Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Trades</p>
            <p className="text-xl font-bold text-gray-900">{metrics.totalTrades}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Winning Trades</p>
            <p className="text-xl font-bold text-green-600">{metrics.winningTrades}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Losing Trades</p>
            <p className="text-xl font-bold text-red-600">{metrics.losingTrades}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Profit Factor</p>
            <p className="text-xl font-bold text-gray-900">{formatRatio(metrics.profitFactor)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Average Win</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.averageWin)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Average Loss</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(metrics.averageLoss)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Largest Win</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.largestWin)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Largest Loss</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(metrics.largestLoss)}</p>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Summary</h3>
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700">
            Your portfolio has achieved a <span className="font-semibold">{formatPercentage(metrics.totalReturnPercentage)}</span> total return 
            with an annualized return of <span className="font-semibold">{formatPercentage(metrics.annualizedReturn)}</span>. 
            The Sharpe ratio of <span className="font-semibold">{formatRatio(metrics.sharpeRatio)}</span> indicates 
            {metrics.sharpeRatio >= 1 ? ' good risk-adjusted performance' : ' room for improvement in risk management'}.
          </p>
          <p className="text-gray-700 mt-2">
            With a win rate of <span className="font-semibold">{formatPercentage(metrics.winRate)}</span> and 
            volatility of <span className="font-semibold">{formatPercentage(metrics.volatility)}</span>, 
            your trading strategy shows {metrics.winRate >= 50 ? 'positive' : 'mixed'} results. 
            The maximum drawdown of <span className="font-semibold">{formatPercentage(metrics.maxDrawdown)}</span> 
            suggests {metrics.maxDrawdown <= 20 ? 'acceptable' : 'high'} risk exposure.
          </p>
        </div>
      </div>
    </div>
  );
};
