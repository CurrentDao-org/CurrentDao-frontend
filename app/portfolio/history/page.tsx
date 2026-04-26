import React, { useState } from 'react';
import { usePortfolioAnalytics } from '../../../hooks/usePortfolioAnalytics';
import { TradingHistory } from '../../../components/portfolio/TradingHistory';
import { PerformanceMetrics } from '../../../components/portfolio/PerformanceMetrics';
import { ProfitLoss } from '../../../components/portfolio/ProfitLoss';
import { AssetAllocation } from '../../../components/portfolio/AssetAllocation';
import { TradingStatistics } from '../../../components/portfolio/TradingStatistics';
import { ExportOptions } from '../../../types/portfolio';

export default function PortfolioHistoryPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'metrics' | 'pnl' | 'allocation' | 'statistics'>('overview');
  const [dateRange, setDateRange] = useState<'1m' | '3m' | '6m' | '1y' | 'all'>('all');
  const [isExporting, setIsExporting] = useState(false);

  const { analytics, loading, error, trades, portfolio, performance, profitLoss, allocation, statistics, exportData, refreshData, addTrade, updateTrade, deleteTrade } = usePortfolioAnalytics({
    autoRefresh: true,
    refreshInterval: 30000
  });

  const handleExport = async (format: 'csv' | 'pdf' | 'json' | 'excel') => {
    if (!analytics) return;

    setIsExporting(true);
    try {
      const exportOptions: ExportOptions = {
        format,
        dateRange: {
          start: dateRange === 'all' ? new Date('2020-01-01') : new Date(Date.now() - (dateRange === '1m' ? 30 : dateRange === '3m' ? 90 : dateRange === '6m' ? 180 : 365) * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        includeMetrics: ['performance', 'allocation', 'pnl', 'statistics'],
        includeCharts: true
      };

      const data = await exportData(exportOptions);
      
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 
              format === 'csv' ? 'text/csv' : 
              format === 'pdf' ? 'application/pdf' : 
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'history', label: 'Trading History', icon: '📈' },
    { id: 'metrics', label: 'Performance', icon: '🎯' },
    { id: 'pnl', label: 'P&L Analysis', icon: '💰' },
    { id: 'allocation', label: 'Allocation', icon: '🎨' },
    { id: 'statistics', label: 'Statistics', icon: '📋' }
  ];

  const dateRanges = [
    { id: '1m', label: '1 Month' },
    { id: '3m', label: '3 Months' },
    { id: '6m', label: '6 Months' },
    { id: '1y', label: '1 Year' },
    { id: 'all', label: 'All Time' }
  ];

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading portfolio analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Portfolio Analytics</h1>
              {portfolio && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Total Value:</span>
                  <span className="font-semibold text-gray-900">
                    ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`ml-2 ${portfolio.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ({portfolio.totalProfit >= 0 ? '+' : ''}{portfolio.totalProfitPercentage.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Period:</span>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1"
                >
                  {dateRanges.map(range => (
                    <option key={range.id} value={range.id}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Export Button */}
              <div className="relative">
                <button
                  disabled={isExporting}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <span>📤</span>
                  <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                </button>
                
                {isExporting && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <div className="py-1">
                      {(['csv', 'pdf', 'json', 'excel'] as const).map(format => (
                        <button
                          key={format}
                          onClick={() => handleExport(format)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Export as {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                🔄
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            {portfolio && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Value</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${portfolio.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-sm mt-1 ${portfolio.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {portfolio.totalProfit >= 0 ? '+' : ''}{portfolio.totalProfitPercentage.toFixed(2)}%
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Investment</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${portfolio.totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm font-medium text-gray-600 mb-1">Total Profit</div>
                  <div className={`text-2xl font-bold ${portfolio.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${portfolio.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-sm font-medium text-gray-600 mb-1">Assets</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {portfolio.assets.length}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            {performance && <PerformanceMetrics metrics={performance} />}
          </div>
        )}

        {activeTab === 'history' && (
          <TradingHistory
            trades={trades}
            onAddTrade={addTrade}
            onUpdateTrade={updateTrade}
            onDeleteTrade={deleteTrade}
            loading={loading}
          />
        )}

        {activeTab === 'metrics' && performance && (
          <PerformanceMetrics metrics={performance} />
        )}

        {activeTab === 'pnl' && profitLoss && (
          <ProfitLoss data={profitLoss} />
        )}

        {activeTab === 'allocation' && allocation && portfolio && (
          <AssetAllocation
            allocation={allocation}
            portfolio={portfolio}
          />
        )}

        {activeTab === 'statistics' && statistics && (
          <TradingStatistics statistics={statistics} />
        )}
      </div>
    </div>
  );
}
