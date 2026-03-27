import React, { useState, useEffect, useMemo } from 'react';
import { useOrderBook } from '@/hooks/useOrderBook';
import { PriceLevel } from '@/types/orderbook';
import { ArrowUpIcon, ArrowDownIcon, RefreshCwIcon, SettingsIcon } from 'lucide-react';

interface OrderBookProps {
  symbol?: string;
  maxLevels?: number;
  showSettings?: boolean;
  className?: string;
}

export function OrderBook({ 
  symbol = 'BTC/USD', 
  maxLevels = 15,
  showSettings = true,
  className = ''
}: OrderBookProps) {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [groupingSize, setGroupingSize] = useState(0.01);

  const {
    orderBook,
    isLoading,
    error,
    isConnected,
    refresh
  } = useOrderBook({
    symbol,
    settings: {
      maxLevels,
      groupingSize,
      autoRefresh: true,
      refreshInterval: 100
    }
  });

  const displayBids = useMemo(() => {
    return orderBook.bids.slice(0, maxLevels);
  }, [orderBook.bids, maxLevels]);

  const displayAsks = useMemo(() => {
    return orderBook.asks.slice(0, maxLevels);
  }, [orderBook.asks, maxLevels]);

  const maxTotalVolume = useMemo(() => {
    const allLevels = [...displayBids, ...displayAsks];
    return Math.max(...allLevels.map(level => level.total), 1);
  }, [displayBids, displayAsks]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatQuantity = (quantity: number) => {
    if (quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)}K`;
    }
    return quantity.toFixed(4);
  };

  const formatTotal = (total: number) => {
    if (total >= 1000000) {
      return `$${(total / 1000000).toFixed(2)}M`;
    } else if (total >= 1000) {
      return `$${(total / 1000).toFixed(1)}K`;
    }
    return `$${total.toFixed(2)}`;
  };

  const getRowClass = (price: number) => {
    if (selectedPrice === price) {
      return 'bg-blue-500 bg-opacity-20';
    }
    return 'hover:bg-gray-700 hover:bg-opacity-50';
  };

  const getBarWidth = (total: number) => {
    return (total / maxTotalVolume) * 100;
  };

  const getSpreadColor = () => {
    const spreadPercentage = orderBook.spreadPercentage;
    if (spreadPercentage < 0.01) return 'text-green-400';
    if (spreadPercentage < 0.05) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (error) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="text-red-400 text-center">
          <p>Error loading order book</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Order Book</h2>
            <span className="text-gray-400">{symbol}</span>
            <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
              <span className="text-xs">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          
          {showSettings && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <SettingsIcon className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={refresh}
                disabled={isLoading}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCwIcon className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">Spread:</span>
              <span className={`ml-2 font-medium ${getSpreadColor()}`}>
                {formatPrice(orderBook.spread)} ({orderBook.spreadPercentage.toFixed(3)}%)
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-400">Volume:</span>
              <span className="ml-2 text-white font-medium">
                {formatTotal(orderBook.totalVolume)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showSettingsPanel && (
        <div className="bg-gray-750 p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Grouping:</label>
              <select
                value={groupingSize}
                onChange={(e) => setGroupingSize(Number(e.target.value))}
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
              >
                <option value={0.001}>0.001</option>
                <option value={0.01}>0.01</option>
                <option value={0.1}>0.1</option>
                <option value={1}>1</option>
                <option value={10}>10</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-400">Levels:</label>
              <select
                value={maxLevels}
                onChange={(e) => setSelectedPrice(Number(e.target.value))}
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 text-xs text-gray-400 p-3 border-b border-gray-700">
        <div>Price</div>
        <div className="text-right">Quantity</div>
        <div className="text-right">Total</div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-gray-700">
          {displayAsks.map((ask, index) => (
            <div
              key={`ask-${index}`}
              className={`grid grid-cols-3 p-3 text-xs cursor-pointer transition-colors ${getRowClass(ask.price)}`}
              onClick={() => setSelectedPrice(ask.price)}
            >
              <div className="text-red-400 font-medium">
                {formatPrice(ask.price)}
              </div>
              <div className="text-right text-gray-300">
                {formatQuantity(ask.quantity)}
              </div>
              <div className="text-right text-gray-300 relative">
                <div className="absolute inset-0 bg-red-500 opacity-10" style={{ width: `${getBarWidth(ask.total)}%` }} />
                <span className="relative">{formatTotal(ask.total)}</span>
              </div>
            </div>
          ))}

          <div className="bg-gray-750 p-3 border-y-2 border-gray-600">
            <div className="grid grid-cols-3 text-sm font-bold">
              <div className="text-green-400">
                {displayBids[0] ? formatPrice(displayBids[0].price) : '--'}
              </div>
              <div className="text-center text-gray-400">
                {displayBids[0] && displayAsks[0] ? formatPrice((displayBids[0].price + displayAsks[0].price) / 2) : '--'}
              </div>
              <div className="text-red-400 text-right">
                {displayAsks[0] ? formatPrice(displayAsks[0].price) : '--'}
              </div>
            </div>
          </div>

          {displayBids.map((bid, index) => (
            <div
              key={`bid-${index}`}
              className={`grid grid-cols-3 p-3 text-xs cursor-pointer transition-colors ${getRowClass(bid.price)}`}
              onClick={() => setSelectedPrice(bid.price)}
            >
              <div className="text-green-400 font-medium">
                {formatPrice(bid.price)}
              </div>
              <div className="text-right text-gray-300">
                {formatQuantity(bid.quantity)}
              </div>
              <div className="text-right text-gray-300 relative">
                <div className="absolute inset-0 bg-green-500 opacity-10" style={{ width: `${getBarWidth(bid.total)}%` }} />
                <span className="relative">{formatTotal(bid.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 p-3 border-t border-gray-700">
        <div className="grid grid-cols-2 text-xs text-gray-400">
          <div>
            <span>24h High: </span>
            <span className="text-green-400 font-medium">
              {formatPrice(orderBook.high24h)}
            </span>
          </div>
          <div className="text-right">
            <span>24h Low: </span>
            <span className="text-red-400 font-medium">
              {formatPrice(orderBook.low24h)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
