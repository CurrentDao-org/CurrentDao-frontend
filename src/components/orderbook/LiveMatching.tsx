import React, { useState, useEffect, useMemo } from 'react';
import { useOrderBook } from '@/hooks/useOrderBook';
import { LiveMatch } from '@/types/orderbook';
import { PlayIcon, PauseIcon, TrashIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

interface LiveMatchingProps {
  symbol?: string;
  maxMatches?: number;
  showAnimation?: boolean;
  autoScroll?: boolean;
  className?: string;
}

export function LiveMatching({ 
  symbol = 'BTC/USD',
  maxMatches = 50,
  showAnimation = true,
  autoScroll = true,
  className = ''
}: LiveMatchingProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const matchesEndRef = React.useRef<HTMLDivElement>(null);

  const { liveMatches, clearLiveMatches } = useOrderBook({ symbol });

  const filteredMatches = useMemo(() => {
    let matches = liveMatches.slice(0, maxMatches);
    
    if (filterType !== 'all') {
      matches = matches.filter(match => match.aggressor === filterType);
    }
    
    return matches;
  }, [liveMatches, maxMatches, filterType]);

  const matchStats = useMemo(() => {
    if (!filteredMatches.length) {
      return {
        totalMatches: 0,
        buyMatches: 0,
        sellMatches: 0,
        totalVolume: 0,
        avgPrice: 0,
        priceRange: { min: 0, max: 0 },
        buyVolume: 0,
        sellVolume: 0
      };
    }

    const buyMatches = filteredMatches.filter(m => m.aggressor === 'buy');
    const sellMatches = filteredMatches.filter(m => m.aggressor === 'sell');
    
    const prices = filteredMatches.map(m => m.price);
    const volumes = filteredMatches.map(m => m.quantity);
    
    const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    
    const buyVolume = buyMatches.reduce((sum, m) => sum + m.quantity, 0);
    const sellVolume = sellMatches.reduce((sum, m) => sum + m.quantity, 0);

    return {
      totalMatches: filteredMatches.length,
      buyMatches: buyMatches.length,
      sellMatches: sellMatches.length,
      totalVolume,
      avgPrice,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      buyVolume,
      sellVolume
    };
  }, [filteredMatches]);

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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getMatchColor = (match: LiveMatch) => {
    return match.aggressor === 'buy' ? 'text-green-400' : 'text-red-400';
  };

  const getMatchBgColor = (match: LiveMatch) => {
    return match.aggressor === 'buy' ? 'bg-green-500' : 'bg-red-500';
  };

  const scrollToBottom = () => {
    if (autoScroll && !isPaused && matchesEndRef.current) {
      matchesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [filteredMatches, autoScroll, isPaused]);

  const handleMatchClick = (matchId: string) => {
    setSelectedMatch(selectedMatch === matchId ? null : matchId);
  };

  const getAnimationClass = (index: number) => {
    if (!showAnimation) return '';
    
    const age = Date.now() - filteredMatches[index].timestamp;
    if (age < 1000) return 'animate-pulse';
    if (age < 3000) return 'opacity-90';
    if (age < 5000) return 'opacity-75';
    return 'opacity-60';
  };

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-white">Live Matching</h2>
            <span className="text-gray-400">{symbol}</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-gray-400">
                {filteredMatches.length > 0 ? 'Live' : 'Waiting'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? (
                <PlayIcon className="w-4 h-4 text-gray-400" />
              ) : (
                <PauseIcon className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <button
              onClick={clearLiveMatches}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title="Clear all"
            >
              <TrashIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
          <div className="text-center">
            <p className="text-gray-400 text-xs">Total Matches</p>
            <p className="text-white font-medium">{matchStats.totalMatches}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">Total Volume</p>
            <p className="text-white font-medium">{formatQuantity(matchStats.totalVolume)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">Avg Price</p>
            <p className="text-white font-medium">{formatPrice(matchStats.avgPrice)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-400 text-xs">Buy/Sell Ratio</p>
            <p className="text-white font-medium">
              {matchStats.buyMatches}/{matchStats.sellMatches}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded text-sm ${
                filterType === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({matchStats.totalMatches})
            </button>
            <button
              onClick={() => setFilterType('buy')}
              className={`px-3 py-1 rounded text-sm ${
                filterType === 'buy' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <TrendingUpIcon className="w-3 h-3 inline mr-1" />
              Buy ({matchStats.buyMatches})
            </button>
            <button
              onClick={() => setFilterType('sell')}
              className={`px-3 py-1 rounded text-sm ${
                filterType === 'sell' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <TrendingDownIcon className="w-3 h-3 inline mr-1" />
              Sell ({matchStats.sellMatches})
            </button>
          </div>
          
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-gray-400">Buy: {formatQuantity(matchStats.buyVolume)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-400 rounded-full" />
              <span className="text-gray-400">Sell: {formatQuantity(matchStats.sellVolume)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredMatches.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
              <p>Waiting for matches...</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredMatches.map((match, index) => (
              <div
                key={match.id}
                className={`p-3 cursor-pointer transition-all hover:bg-gray-700 hover:bg-opacity-50 ${getAnimationClass(index)} ${
                  selectedMatch === match.id ? 'bg-blue-500 bg-opacity-20' : ''
                }`}
                onClick={() => handleMatchClick(match.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${getMatchBgColor(match)} ${
                      showAnimation && Date.now() - match.timestamp < 1000 ? 'animate-ping' : ''
                    }`} />
                    <div>
                      <div className={`font-medium ${getMatchColor(match)}`}>
                        {formatPrice(match.price)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTime(match.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-white font-medium">
                      {formatQuantity(match.quantity)}
                    </div>
                    <div className={`text-xs capitalize ${getMatchColor(match)}`}>
                      {match.aggressor}
                    </div>
                  </div>
                </div>

                {selectedMatch === match.id && (
                  <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500">Match ID:</span>
                        <span className="ml-2 text-gray-300 font-mono">{match.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-2 text-gray-300">
                          {formatPrice(match.price * match.quantity)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Buy Order:</span>
                        <span className="ml-2 text-gray-300 font-mono">{match.buyOrderId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Sell Order:</span>
                        <span className="ml-2 text-gray-300 font-mono">{match.sellOrderId}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={matchesEndRef} />
          </div>
        )}
      </div>

      <div className="bg-gray-900 p-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div>
            Price Range: {formatPrice(matchStats.priceRange.min)} - {formatPrice(matchStats.priceRange.max)}
          </div>
          <div>
            Spread: {formatPrice(matchStats.priceRange.max - matchStats.priceRange.min)}
          </div>
          <div>
            {isPaused ? 'Paused' : 'Auto-scroll: ' + (autoScroll ? 'On' : 'Off')}
          </div>
        </div>
      </div>
    </div>
  );
}
