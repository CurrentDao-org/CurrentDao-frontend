import React from 'react';
import { TrendingUp, ChevronUp, ChevronDown, Zap, Eye } from 'lucide-react';
import { TrendingToken, Token } from '../../types/token';

interface TrendingTokensProps {
  trendingTokens: TrendingToken[];
  onTokenSelect?: (token: Token) => void;
  maxDisplay?: number;
  showRank?: boolean;
  showVolume?: boolean;
  showSentiment?: boolean;
  className?: string;
}

export function TrendingTokens({
  trendingTokens,
  onTokenSelect,
  maxDisplay = 10,
  showRank = true,
  showVolume = true,
  showSentiment = true,
  className = ''
}: TrendingTokensProps) {
  const getTokenIcon = (type: string) => {
    switch (type) {
      case 'energy':
        return <Zap className="h-4 w-4 text-green-500" />;
      case 'rec':
        return <Zap className="h-4 w-4 text-emerald-500" />;
      case 'utility':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Zap className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTokenTypeColor = (type: string) => {
    switch (type) {
      case 'energy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rec':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'utility':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-100';
      case 'negative':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ChevronUp className="h-3 w-3" />;
      case 'negative':
        return <ChevronDown className="h-3 w-3" />;
      default:
        return <div className="h-3 w-3" />;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  const displayedTokens = trendingTokens.slice(0, maxDisplay);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900">Trending Tokens</h3>
          <span className="text-sm text-gray-500">({trendingTokens.length} total)</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Eye className="h-4 w-4" />
          <span>Live</span>
        </div>
      </div>

      {/* Trending Tokens List */}
      <div className="space-y-3">
        {displayedTokens.map((trending, index) => (
          <div
            key={trending.token.id}
            onClick={() => onTokenSelect?.(trending.token)}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              {/* Left side - Token info */}
              <div className="flex items-start space-x-3 flex-1">
                {showRank && (
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full font-semibold text-sm">
                    #{trending.rank}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    {getTokenIcon(trending.token.type)}
                    <span className="font-medium text-gray-900">
                      {trending.token.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getTokenTypeColor(trending.token.type)}`}>
                      {trending.token.type.toUpperCase()}
                    </span>
                    {trending.token.isVerified && (
                      <Zap className="h-3 w-3 text-blue-500 fill-current" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-medium">{trending.token.symbol}</span>
                    <span>{formatPrice(trending.token.price)}</span>
                    {showVolume && (
                      <span>Vol: {formatVolume(trending.token.volume24h)}</span>
                    )}
                    <span className="text-xs text-gray-500">
                      {trending.mentions} mentions
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 truncate mt-1">
                    {trending.token.contractAddress}
                  </div>
                </div>
              </div>

              {/* Right side - Price changes and sentiment */}
              <div className="flex flex-col items-end space-y-2">
                {/* Price Change */}
                <div className="flex flex-col items-end">
                  <div className={`text-sm font-medium ${
                    trending.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trending.priceChange >= 0 ? '+' : ''}{trending.priceChange.toFixed(2)}%
                  </div>
                  <div className={`text-xs ${
                    trending.volumeChange >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Vol: {trending.volumeChange >= 0 ? '+' : ''}{trending.volumeChange.toFixed(1)}%
                  </div>
                </div>

                {/* Sentiment */}
                {showSentiment && (
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getSentimentColor(trending.sentiment)}`}>
                    {getSentimentIcon(trending.sentiment)}
                    <span className="capitalize">{trending.sentiment}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress bar for trend strength */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Trend Strength</span>
                <span>{Math.min(100, Math.round((trending.mentions / 1000) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all ${
                    trending.sentiment === 'positive' ? 'bg-green-500' : 
                    trending.sentiment === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                  }`}
                  style={{ width: `${Math.min(100, (trending.mentions / 1000) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show more indicator */}
      {trendingTokens.length > maxDisplay && (
        <div className="text-center pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all {trendingTokens.length} trending tokens
          </button>
        </div>
      )}

      {/* Empty state */}
      {trendingTokens.length === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No trending tokens at the moment</p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for the latest trending tokens
          </p>
        </div>
      )}
    </div>
  );
}
