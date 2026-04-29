import React from 'react';
import { TokenSearch } from '../components/token/TokenSearch';
import { TrendingTokens } from '../components/token/TrendingTokens';
import { TokenFilters } from '../components/token/TokenFilters';
import { mockTokens, mockTrendingTokens } from '../data/mockTokens';
import { Token, TokenSearchQuery, TrendingToken } from '../types/token';

export default function TokenSearchDemo() {
  const handleTokenSelect = (token: Token) => {
    console.log('Selected token:', token);
    alert(`Selected: ${token.name} (${token.symbol}) - $${token.price.toFixed(6)}`);
  };

  const handleQueryChange = (query: TokenSearchQuery) => {
    console.log('Filter query changed:', query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Advanced Token Search Demo
          </h1>
          <p className="text-gray-600">
            Experience fuzzy search, filters, and trending tokens for energy, REC, and utility tokens
          </p>
        </div>

        {/* Main Search Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🔍 Token Search
            </h2>
            <TokenSearch
              tokens={mockTokens}
              trendingTokens={mockTrendingTokens}
              onTokenSelect={handleTokenSelect}
              placeholder="Search for energy, REC, or utility tokens..."
              showFilters={true}
              showTrending={true}
              showHistory={true}
              className="mb-6"
            />
            
            <div className="text-sm text-gray-500">
              <p>💡 Try searching for:</p>
              <ul className="mt-2 space-y-1">
                <li>• Token names: "Solar", "Wind", "Hydro"</li>
                <li>• Symbols: "SOLAR", "WIND", "REC"</li>
                <li>• Contract addresses: "0x1234..."</li>
                <li>• Use arrow keys to navigate, Enter to select</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              🎛️ Token Filters
            </h2>
            <TokenFilters
              query={{}}
              onQueryChange={handleQueryChange}
              className="mb-4"
            />
            <div className="text-sm text-gray-500">
              <p>✨ Features:</p>
              <ul className="mt-2 space-y-1">
                <li>• Filter by token type (Energy, REC, Utility)</li>
                <li>• Price range filtering</li>
                <li>• Market cap range filtering</li>
                <li>• Verified and trending filters</li>
                <li>• Energy source filtering for energy tokens</li>
              </ul>
            </div>
          </div>

          {/* Trending Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📈 Trending Tokens
            </h2>
            <TrendingTokens
              trendingTokens={mockTrendingTokens}
              onTokenSelect={handleTokenSelect}
              maxDisplay={5}
              showRank={true}
              showVolume={true}
              showSentiment={true}
              className="mb-4"
            />
            <div className="text-sm text-gray-500">
              <p>🔥 Trending Features:</p>
              <ul className="mt-2 space-y-1">
                <li>• Real-time trending rankings</li>
                <li>• Volume and price change indicators</li>
                <li>• Sentiment analysis</li>
                <li>• Trend strength visualization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Token Statistics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockTokens.length}
              </div>
              <div className="text-sm text-gray-500">Total Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockTokens.filter(t => t.type === 'energy').length}
              </div>
              <div className="text-sm text-gray-500">Energy Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {mockTokens.filter(t => t.type === 'rec').length}
              </div>
              <div className="text-sm text-gray-500">REC Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {mockTokens.filter(t => t.type === 'utility').length}
              </div>
              <div className="text-sm text-gray-500">Utility Tokens</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {mockTokens.filter(t => t.isVerified).length}
                </div>
                <div className="text-sm text-gray-500">Verified Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {mockTokens.filter(t => t.isTrending).length}
                </div>
                <div className="text-sm text-gray-500">Trending Tokens</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {mockTrendingTokens.length}
                </div>
                <div className="text-sm text-gray-500">Trending Now</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(mockTokens.reduce((acc, t) => acc + t.priceChange24h, 0) / mockTokens.length)}%
                </div>
                <div className="text-sm text-gray-500">Avg 24h Change</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Section */}
        <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">
            🎯 How to Use
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Search Features:</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• 🔍 Fuzzy search across name, symbol, and address</li>
                <li>• ⌨️ Arrow key navigation (↑↓) and Enter to select</li>
                <li>• 🕐 Recent search history (stored locally)</li>
                <li>• ⚡ Debounced input to reduce API calls</li>
                <li>• 🎨 Highlighted matching characters</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Filter Features:</h3>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• 🔋 Filter by token type (Energy/REC/Utility)</li>
                <li>• 💰 Price and market cap range filters</li>
                <li>• ✅ Verified tokens only filter</li>
                <li>• 📈 Trending tokens only filter</li>
                <li>• 🌍 Energy source and region filters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
