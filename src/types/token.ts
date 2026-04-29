export type TokenType = 'energy' | 'rec' | 'utility';

export interface Token {
  id: string;
  name: string;
  symbol: string;
  contractAddress: string;
  type: TokenType;
  decimals: number;
  totalSupply: string;
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
  description?: string;
  icon?: string;
  website?: string;
  whitepaper?: string;
  isVerified: boolean;
  isTrending: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: TokenMetadata;
}

export interface TokenMetadata {
  energySource?: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass';
  region?: string;
  certification?: string;
  carbonCredits?: number;
  efficiency?: number;
  gridConnection?: boolean;
  storageCapacity?: number;
  peakOutput?: number;
  recSerial?: string;
  recExpiration?: Date;
  utilityType?: 'payment' | 'staking' | 'governance' | 'rewards';
  stakingAPY?: number;
  governancePower?: number;
}

export interface TokenSearchQuery {
  text?: string;
  type?: TokenType[];
  priceRange?: [number, number];
  marketCapRange?: [number, number];
  volumeRange?: [number, number];
  verifiedOnly?: boolean;
  trendingOnly?: boolean;
  energySource?: string[];
  region?: string[];
  sortBy?: 'name' | 'price' | 'market_cap' | 'volume' | 'price_change' | 'trending';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TokenSearchResult {
  tokens: Token[];
  total: number;
  hasMore: boolean;
  query: TokenSearchQuery;
  responseTime: number;
  suggestions: string[];
  trending: Token[];
}

export interface TokenSearchHistory {
  id: string;
  query: TokenSearchQuery;
  timestamp: Date;
  resultCount: number;
  selectedTokenId?: string;
}

export interface TokenSearchFilter {
  field: keyof TokenSearchQuery;
  operator: 'equals' | 'contains' | 'range' | 'in' | 'greater_than' | 'less_than';
  value: any;
  label?: string;
}

export interface TokenSearchSuggestion {
  text: string;
  type: 'token' | 'symbol' | 'address' | 'type';
  token?: Token;
  relevance: number;
}

export interface TrendingToken {
  token: Token;
  rank: number;
  volumeChange: number;
  priceChange: number;
  mentions: number;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface TokenSearchAnalytics {
  totalSearches: number;
  popularQueries: Array<{
    query: string;
    count: number;
    lastUsed: Date;
  }>;
  popularTokens: Array<{
    token: Token;
    searchCount: number;
    selectCount: number;
  }>;
  averageResponseTime: number;
  filterUsage: Record<string, number>;
}
