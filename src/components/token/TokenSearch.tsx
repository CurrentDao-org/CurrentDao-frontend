import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, ChevronDown, Clock, TrendingUp, Zap } from 'lucide-react';
import Fuse from 'fuse.js';
import { Token, TokenSearchQuery, TokenSearchResult, TokenSearchHistory, TrendingToken } from '../../types/token';
import { highlightText, createHighlightedRenderer } from '../../utils/highlightText';

interface TokenSearchProps {
  tokens: Token[];
  trendingTokens?: TrendingToken[];
  onTokenSelect?: (token: Token) => void;
  placeholder?: string;
  showFilters?: boolean;
  showTrending?: boolean;
  showHistory?: boolean;
  className?: string;
}

export function TokenSearch({
  tokens,
  trendingTokens = [],
  onTokenSelect,
  placeholder = 'Search tokens by name, symbol, or address...',
  showFilters = true,
  showTrending = true,
  showHistory = true,
  className = ''
}: TokenSearchProps) {
  const [query, setQuery] = useState<TokenSearchQuery>({});
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<Token[]>([]);
  const [filteredResults, setFilteredResults] = useState<Token[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [searchHistory, setSearchHistory] = useState<TokenSearchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fuseRef = useRef<Fuse<Token> | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Initialize Fuse.js for fuzzy search
  useEffect(() => {
    fuseRef.current = new Fuse(tokens, {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'symbol', weight: 0.3 },
        { name: 'contractAddress', weight: 0.2 },
        { name: 'description', weight: 0.1 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    });
  }, [tokens]);

  // Load search history from localStorage
  useEffect(() => {
    if (showHistory) {
      const history = localStorage.getItem('token_search_history');
      if (history) {
        try {
          setSearchHistory(JSON.parse(history));
        } catch (e) {
          console.error('Failed to load search history:', e);
        }
      }
    }
  }, [showHistory]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchText.length >= 2) {
      debounceRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setResults([]);
      setFilteredResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchText, query.type, query.verifiedOnly, query.trendingOnly]);

  const performSearch = useCallback(() => {
    if (!fuseRef.current || !searchText) {
      setResults([]);
      setFilteredResults([]);
      return;
    }

    setLoading(true);
    
    try {
      // Perform fuzzy search
      const fuseResults = fuseRef.current.search(searchText);
      const searchResults = fuseResults.map(result => result.item);
      
      // Apply additional filters
      let filtered = searchResults;

      if (query.type && query.type.length > 0) {
        filtered = filtered.filter(token => query.type!.includes(token.type));
      }

      if (query.verifiedOnly) {
        filtered = filtered.filter(token => token.isVerified);
      }

      if (query.trendingOnly) {
        filtered = filtered.filter(token => token.isTrending);
      }

      if (query.priceRange) {
        filtered = filtered.filter(token => 
          token.price >= query.priceRange![0] && token.price <= query.priceRange![1]
        );
      }

      if (query.marketCapRange) {
        filtered = filtered.filter(token => 
          token.marketCap >= query.marketCapRange![0] && token.marketCap <= query.marketCapRange![1]
        );
      }

      setResults(searchResults);
      setFilteredResults(filtered);

      // Add to search history
      if (showHistory && searchText) {
        const historyItem: TokenSearchHistory = {
          id: Date.now().toString(),
          query: { ...query, text: searchText },
          timestamp: new Date(),
          resultCount: filtered.length
        };

        setSearchHistory(prev => {
          const updated = [historyItem, ...prev.slice(0, 19)]; // Keep last 20
          localStorage.setItem('token_search_history', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchText, query, showHistory]);

  const handleInputChange = (value: string) => {
    setSearchText(value);
    setShowSuggestions(true);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const allSuggestions = [...filteredResults, ...searchHistory.slice(0, 5)];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          const selected = allSuggestions[selectedSuggestionIndex];
          if ('name' in selected) {
            handleTokenSelect(selected as Token);
          } else {
            const historyItem = selected as TokenSearchHistory;
            setSearchText(historyItem.query.text || '');
            setQuery(historyItem.query);
          }
        } else if (filteredResults.length > 0) {
          handleTokenSelect(filteredResults[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const handleTokenSelect = (token: Token) => {
    onTokenSelect?.(token);
    setShowSuggestions(false);
    setIsExpanded(false);
    setSearchText('');
    setResults([]);
    setFilteredResults([]);
    
    // Update search history with selected token
    if (showHistory && searchHistory.length > 0) {
      const updatedHistory = searchHistory.map(item => 
        item.id === searchHistory[0].id 
          ? { ...item, selectedTokenId: token.id }
          : item
      );
      setSearchHistory(updatedHistory);
      localStorage.setItem('token_search_history', JSON.stringify(updatedHistory));
    }
  };

  const handleHistoryClick = (historyItem: TokenSearchHistory) => {
    setSearchText(historyItem.query.text || '');
    setQuery(historyItem.query);
    setShowSuggestions(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('token_search_history');
  };

  const updateFilter = (field: keyof TokenSearchQuery, value: any) => {
    setQuery(prev => ({ ...prev, [field]: value }));
    setActiveFilters(prev => {
      const updated = new Set(prev);
      if (value) {
        updated.add(field);
      } else {
        updated.delete(field);
      }
      return Array.from(updated);
    });
  };

  const clearFilters = () => {
    setQuery({});
    setActiveFilters([]);
  };

  const highlightMatch = (text: string, matches: any[]) => {
    if (!matches || matches.length === 0) return text;

    let highlightedText = text;
    matches.forEach((match: any) => {
      const { indices } = match;
      indices.reverse().forEach(([start, end]: [number, number]) => {
        highlightedText = 
          highlightedText.slice(0, start) +
          `<mark class="bg-yellow-200 text-yellow-900">${highlightedText.slice(start, end + 1)}</mark>` +
          highlightedText.slice(end + 1);
      });
    });
    return highlightedText;
  };

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    }).format(price);
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`;
    return `$${marketCap.toFixed(2)}`;
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-3 flex items-center space-x-2">
            {activeFilters.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-gray-400 hover:text-gray-600"
                title="Clear filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {showFilters && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-gray-600"
                title="Toggle filters"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-12 top-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && (filteredResults.length > 0 || (showHistory && searchHistory.length > 0)) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {/* Search Results */}
            {filteredResults.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 mb-2">
                  Search Results ({filteredResults.length})
                </div>
                {filteredResults.map((token, index) => (
                  <button
                    key={token.id}
                    onClick={() => handleTokenSelect(token)}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                      selectedSuggestionIndex === index ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {getTokenIcon(token.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{token.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getTokenTypeColor(token.type)}`}>
                            {token.type.toUpperCase()}
                          </span>
                          {token.isVerified && (
                            <Zap className="h-3 w-3 text-blue-500 fill-current" />
                          )}
                          {token.isTrending && (
                            <TrendingUp className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {token.symbol} • {formatPrice(token.price)}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {token.contractAddress}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(token.price)}
                        </div>
                        <div className={`text-xs ${
                          token.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Search History */}
            {showHistory && searchHistory.length > 0 && (
              <div className="p-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-gray-500">Recent Searches</div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Clear
                  </button>
                </div>
                {searchHistory.slice(0, 5).map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleHistoryClick(item)}
                    className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                      selectedSuggestionIndex === filteredResults.length + index ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-gray-700">{item.query.text}</span>
                      <span className="text-xs text-gray-500">
                        {item.resultCount} results
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Search Panel */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-40">
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Filters */}
              {showFilters && (
                <div className="lg:col-span-1">
                  <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
                  
                  {/* Token Type Filter */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Token Type
                    </label>
                    <div className="space-y-2">
                      {['energy', 'rec', 'utility'].map(type => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={query.type?.includes(type as any) || false}
                            onChange={(e) => {
                              const currentTypes = query.type || [];
                              const newTypes = e.target.checked
                                ? [...currentTypes, type as any]
                                : currentTypes.filter(t => t !== type);
                              updateFilter('type', newTypes.length > 0 ? newTypes : undefined);
                            }}
                            className="mr-2"
                          />
                          <div className="flex items-center space-x-2">
                            {getTokenIcon(type)}
                            <span className="capitalize">{type}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={query.verifiedOnly || false}
                        onChange={(e) => updateFilter('verifiedOnly', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Verified Only</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={query.trendingOnly || false}
                        onChange={(e) => updateFilter('trendingOnly', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Trending Only</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Results and Trending */}
              <div className="lg:col-span-2">
                {/* Trending Tokens */}
                {showTrending && trendingTokens.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-red-500" />
                      Trending Tokens
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {trendingTokens.slice(0, 6).map((trending) => (
                        <button
                          key={trending.token.id}
                          onClick={() => handleTokenSelect(trending.token)}
                          className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getTokenIcon(trending.token.type)}
                              <span className="font-medium text-gray-900">
                                {trending.token.symbol}
                              </span>
                              <span className="text-xs text-gray-500">
                                #{trending.rank}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                trending.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {trending.priceChange >= 0 ? '+' : ''}{trending.priceChange.toFixed(2)}%
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Results Summary */}
                {searchText && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      {filteredResults.length} results for "{searchText}"
                    </h3>
                    {filteredResults.length === 0 && !loading && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">No tokens found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your filters or search terms
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
