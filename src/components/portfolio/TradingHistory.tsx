import React, { useState, useMemo } from 'react';
import { Trade } from '../../types/portfolio';

interface TradingHistoryProps {
  trades: Trade[];
  onTradeUpdate?: (tradeId: string, updates: Partial<Trade>) => void;
  onTradeDelete?: (tradeId: string) => void;
  className?: string;
}

export const TradingHistory: React.FC<TradingHistoryProps> = ({
  trades,
  onTradeUpdate,
  onTradeDelete,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAsset, setFilterAsset] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'asset' | 'value' | 'type'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const filteredAndSortedTrades = useMemo(() => {
    let filtered = trades.filter(trade => {
      const matchesSearch = trade.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           trade.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAsset = filterAsset === 'all' || trade.asset === filterAsset;
      const matchesType = filterType === 'all' || trade.type === filterType;
      const matchesStatus = filterStatus === 'all' || trade.status === filterStatus;
      
      return matchesSearch && matchesAsset && matchesType && matchesStatus;
    });

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'timestamp':
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
          break;
        case 'asset':
          aValue = a.asset;
          bValue = b.asset;
          break;
        case 'value':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [trades, searchTerm, filterAsset, filterType, filterStatus, sortBy, sortOrder]);

  const uniqueAssets = useMemo(() => {
    return Array.from(new Set(trades.map(trade => trade.asset))).sort();
  }, [trades]);

  const handleSort = (column: 'timestamp' | 'asset' | 'value' | 'type') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getAssetTypeColor = (assetType: string) => {
    const colors: Record<string, string> = {
      solar: 'bg-yellow-100 text-yellow-800',
      wind: 'bg-blue-100 text-blue-800',
      hydro: 'bg-cyan-100 text-cyan-800',
      nuclear: 'bg-purple-100 text-purple-800',
      fossil: 'bg-gray-100 text-gray-800',
      battery: 'bg-green-100 text-green-800',
      grid: 'bg-orange-100 text-orange-800'
    };
    return colors[assetType] || 'bg-gray-100 text-gray-800';
  };

  const getTradeTypeColor = (type: 'buy' | 'sell') => {
    return type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Asset', 'Asset Type', 'Quantity', 'Price', 'Total Value', 'Fees', 'Status'];
    const rows = filteredAndSortedTrades.map(trade => [
      formatDate(trade.timestamp),
      trade.type.toUpperCase(),
      trade.asset,
      trade.assetType,
      trade.quantity.toString(),
      formatCurrency(trade.price),
      formatCurrency(trade.totalValue),
      formatCurrency(trade.fees),
      trade.status.toUpperCase()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Trading History</h2>
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search trades..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asset</label>
          <select
            value={filterAsset}
            onChange={(e) => setFilterAsset(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Assets</option>
            {uniqueAssets.map(asset => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [column, order] = e.target.value.split('-');
              setSortBy(column as any);
              setSortOrder(order as any);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="timestamp-desc">Latest First</option>
            <option value="timestamp-asc">Oldest First</option>
            <option value="asset-asc">Asset (A-Z)</option>
            <option value="asset-desc">Asset (Z-A)</option>
            <option value="value-desc">Value (High-Low)</option>
            <option value="value-asc">Value (Low-High)</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('timestamp')}
                  className="flex items-center hover:text-gray-700"
                >
                  Date & Time
                  {sortBy === 'timestamp' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('asset')}
                  className="flex items-center hover:text-gray-700"
                >
                  Asset
                  {sortBy === 'asset' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('value')}
                  className="flex items-center hover:text-gray-700"
                >
                  Total Value
                  {sortBy === 'value' && (
                    <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                  )}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fees</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTrade(trade)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(trade.timestamp)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTradeTypeColor(trade.type)}`}>
                    {trade.type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {trade.asset}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAssetTypeColor(trade.assetType)}`}>
                    {trade.assetType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trade.quantity.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(trade.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(trade.totalValue)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(trade.fees)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trade.status)}`}>
                    {trade.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-2">
                    {onTradeUpdate && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                    )}
                    {onTradeDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTradeDelete(trade.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedTrades.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No trades found matching your criteria.</p>
        </div>
      )}

      {selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Trade Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Trade ID</p>
                <p className="font-medium">{selectedTrade.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-medium">{formatDate(selectedTrade.timestamp)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{selectedTrade.type.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Asset</p>
                <p className="font-medium">{selectedTrade.asset}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Quantity</p>
                <p className="font-medium">{selectedTrade.quantity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-medium">{formatCurrency(selectedTrade.price)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="font-medium">{formatCurrency(selectedTrade.totalValue)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fees</p>
                <p className="font-medium">{formatCurrency(selectedTrade.fees)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{selectedTrade.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Portfolio ID</p>
                <p className="font-medium">{selectedTrade.portfolioId}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTrade(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
