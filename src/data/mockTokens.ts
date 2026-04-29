import { Token, TrendingToken, TokenType } from '../types/token';

export const mockTokens: Token[] = [
  // Energy Tokens
  {
    id: '1',
    name: 'Solar Energy Token',
    symbol: 'SOLAR',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    type: 'energy',
    decimals: 18,
    totalSupply: '1000000000000000000000000',
    price: 0.0254,
    marketCap: 25400000,
    volume24h: 1250000,
    priceChange24h: 5.2,
    description: 'Renewable solar energy token representing 1 MWh of solar power generation',
    website: 'https://solarenergy.io',
    whitepaper: 'https://docs.solarenergy.io',
    isVerified: true,
    isTrending: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      energySource: 'solar',
      region: 'California',
      certification: 'ISO 14001',
      carbonCredits: 1000,
      efficiency: 22.5,
      gridConnection: true,
      storageCapacity: 500,
      peakOutput: 100
    }
  },
  {
    id: '2',
    name: 'Wind Power Token',
    symbol: 'WIND',
    contractAddress: '0x2345678901bcdef2345678901bcdef2345678901',
    type: 'energy',
    decimals: 18,
    totalSupply: '500000000000000000000000',
    price: 0.0187,
    marketCap: 18700000,
    volume24h: 890000,
    priceChange24h: -2.1,
    description: 'Offshore wind energy token representing clean wind power generation',
    website: 'https://windpower.io',
    whitepaper: 'https://docs.windpower.io',
    isVerified: true,
    isTrending: false,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      energySource: 'wind',
      region: 'North Sea',
      certification: 'REC',
      carbonCredits: 800,
      efficiency: 35.2,
      gridConnection: true,
      storageCapacity: 200,
      peakOutput: 150
    }
  },
  {
    id: '3',
    name: 'Hydro Electric Token',
    symbol: 'HYDRO',
    contractAddress: '0x3456789012cdef3456789012cdef3456789012c',
    type: 'energy',
    decimals: 18,
    totalSupply: '750000000000000000000000',
    price: 0.0321,
    marketCap: 32100000,
    volume24h: 2100000,
    priceChange24h: 8.7,
    description: 'Hydroelectric power token representing clean water-based energy generation',
    website: 'https://hydroelectric.io',
    whitepaper: 'https://docs.hydroelectric.io',
    isVerified: true,
    isTrending: true,
    createdAt: new Date('2022-11-10'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      energySource: 'hydro',
      region: 'Pacific Northwest',
      certification: 'Green-e',
      carbonCredits: 1200,
      efficiency: 45.8,
      gridConnection: true,
      storageCapacity: 1000,
      peakOutput: 200
    }
  },
  {
    id: '4',
    name: 'Geothermal Energy Token',
    symbol: 'GEO',
    contractAddress: '0x4567890123def4567890123def4567890123def',
    type: 'energy',
    decimals: 18,
    totalSupply: '300000000000000000000000',
    price: 0.0412,
    marketCap: 12300000,
    volume24h: 560000,
    priceChange24h: 3.4,
    description: 'Geothermal energy token representing earth-based heat power generation',
    website: 'https://geothermal.io',
    whitepaper: 'https://docs.geothermal.io',
    isVerified: false,
    isTrending: false,
    createdAt: new Date('2023-06-15'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      energySource: 'geothermal',
      region: 'Iceland',
      certification: 'ISO 14001',
      carbonCredits: 600,
      efficiency: 28.3,
      gridConnection: true,
      storageCapacity: 300,
      peakOutput: 80
    }
  },
  {
    id: '5',
    name: 'Biomass Energy Token',
    symbol: 'BIO',
    contractAddress: '0x5678901234ef5678901234ef5678901234ef56',
    type: 'energy',
    decimals: 18,
    totalSupply: '200000000000000000000000',
    price: 0.0156,
    marketCap: 7800000,
    volume24h: 340000,
    priceChange24h: -1.8,
    description: 'Biomass energy token representing organic waste-to-energy conversion',
    website: 'https://biomass.io',
    whitepaper: 'https://docs.biomass.io',
    isVerified: false,
    isTrending: false,
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      energySource: 'biomass',
      region: 'Midwest USA',
      certification: 'Carbon Neutral',
      carbonCredits: 400,
      efficiency: 18.7,
      gridConnection: true,
      storageCapacity: 150,
      peakOutput: 50
    }
  },

  // REC Tokens
  {
    id: '6',
    name: 'Renewable Energy Credit',
    symbol: 'REC',
    contractAddress: '0x6789012345f6789012345f6789012345f67890',
    type: 'rec',
    decimals: 18,
    totalSupply: '1000000000000000000000000',
    price: 12.45,
    marketCap: 124500000,
    volume24h: 8900000,
    priceChange24h: 12.3,
    description: 'Standard Renewable Energy Credit representing 1 MWh of renewable energy',
    website: 'https://rec-standard.io',
    whitepaper: 'https://docs.rec-standard.io',
    isVerified: true,
    isTrending: true,
    createdAt: new Date('2022-05-20'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      recSerial: 'REC-2024-001',
      recExpiration: new Date('2025-12-31'),
      region: 'Global',
      certification: 'I-REC Standard'
    }
  },
  {
    id: '7',
    name: 'Carbon Offset Token',
    symbol: 'CARBON',
    contractAddress: '0x7890123456g7890123456g7890123456g78901',
    type: 'rec',
    decimals: 18,
    totalSupply: '500000000000000000000000',
    price: 8.92,
    marketCap: 44600000,
    volume24h: 2340000,
    priceChange24h: 6.7,
    description: 'Carbon offset token representing verified carbon reduction projects',
    website: 'https://carbonoffset.io',
    whitepaper: 'https://docs.carbonoffset.io',
    isVerified: true,
    isTrending: false,
    createdAt: new Date('2023-02-10'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      recSerial: 'CARBON-2024-042',
      recExpiration: new Date('2026-06-30'),
      region: 'Global',
      certification: 'Verra Verified Carbon Standard'
    }
  },
  {
    id: '8',
    name: 'Green Energy Certificate',
    symbol: 'GEC',
    contractAddress: '0x8901234567h8901234567h8901234567h89012',
    type: 'rec',
    decimals: 18,
    totalSupply: '750000000000000000000000',
    price: 15.67,
    marketCap: 117525000,
    volume24h: 5670000,
    priceChange24h: 9.1,
    description: 'Green Energy Certificate for renewable energy tracking and trading',
    website: 'https://greenenergy.io',
    whitepaper: 'https://docs.greenenergy.io',
    isVerified: true,
    isTrending: true,
    createdAt: new Date('2022-08-15'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      recSerial: 'GEC-2024-089',
      recExpiration: new Date('2025-09-30'),
      region: 'EU',
      certification: 'European Energy Certificate System'
    }
  },

  // Utility Tokens
  {
    id: '9',
    name: 'CurrentDAO Governance',
    symbol: 'CGOV',
    contractAddress: '0x9012345678i9012345678i9012345678i90123',
    type: 'utility',
    decimals: 18,
    totalSupply: '1000000000000000000000000',
    price: 2.34,
    marketCap: 234000000,
    volume24h: 12300000,
    priceChange24h: 15.6,
    description: 'Governance token for CurrentDAO platform voting and proposals',
    website: 'https://currentdao.io',
    whitepaper: 'https://docs.currentdao.io',
    isVerified: true,
    isTrending: true,
    createdAt: new Date('2021-12-01'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      utilityType: 'governance',
      governancePower: 1,
      stakingAPY: 8.5
    }
  },
  {
    id: '10',
    name: 'Energy Payment Token',
    symbol: 'EPT',
    contractAddress: '0xa123456789ja123456789ja123456789ja1234',
    type: 'utility',
    decimals: 18,
    totalSupply: '500000000000000000000000',
    price: 0.89,
    marketCap: 44500000,
    volume24h: 3450000,
    priceChange24h: -3.2,
    description: 'Payment token for energy transactions and marketplace operations',
    website: 'https://energypay.io',
    whitepaper: 'https://docs.energypay.io',
    isVerified: true,
    isTrending: false,
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      utilityType: 'payment'
    }
  },
  {
    id: '11',
    name: 'Staking Rewards Token',
    symbol: 'SRT',
    contractAddress: '0xb234567890kb234567890kb234567890kb23456',
    type: 'utility',
    decimals: 18,
    totalSupply: '300000000000000000000000',
    price: 1.56,
    marketCap: 46800000,
    volume24h: 1890000,
    priceChange24h: 4.8,
    description: 'Staking token providing rewards for liquidity providers',
    website: 'https://stakingrewards.io',
    whitepaper: 'https://docs.stakingrewards.io',
    isVerified: false,
    isTrending: false,
    createdAt: new Date('2023-07-20'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      utilityType: 'staking',
      stakingAPY: 12.3
    }
  },
  {
    id: '12',
    name: 'Energy Marketplace Token',
    symbol: 'EMT',
    contractAddress: '0xc345678901lc345678901lc345678901lc34567',
    type: 'utility',
    decimals: 18,
    totalSupply: '800000000000000000000000',
    price: 0.67,
    marketCap: 53600000,
    volume24h: 4560000,
    priceChange24h: 7.9,
    description: 'Marketplace utility token for energy trading platform fees and discounts',
    website: 'https://energymarket.io',
    whitepaper: 'https://docs.energymarket.io',
    isVerified: true,
    isTrending: true,
    createdAt: new Date('2022-10-05'),
    updatedAt: new Date('2024-04-28'),
    metadata: {
      utilityType: 'payment'
    }
  }
];

export const mockTrendingTokens: TrendingToken[] = [
  {
    token: mockTokens[0], // SOLAR
    rank: 1,
    volumeChange: 25.6,
    priceChange: 5.2,
    mentions: 1250,
    sentiment: 'positive'
  },
  {
    token: mockTokens[2], // HYDRO
    rank: 2,
    volumeChange: 18.3,
    priceChange: 8.7,
    mentions: 980,
    sentiment: 'positive'
  },
  {
    token: mockTokens[5], // REC
    rank: 3,
    volumeChange: 32.1,
    priceChange: 12.3,
    mentions: 890,
    sentiment: 'positive'
  },
  {
    token: mockTokens[8], // CGOV
    rank: 4,
    volumeChange: 45.7,
    priceChange: 15.6,
    mentions: 2340,
    sentiment: 'positive'
  },
  {
    token: mockTokens[7], // GEC
    rank: 5,
    volumeChange: 28.9,
    priceChange: 9.1,
    mentions: 567,
    sentiment: 'positive'
  },
  {
    token: mockTokens[11], // EMT
    rank: 6,
    volumeChange: 15.4,
    priceChange: 7.9,
    mentions: 445,
    sentiment: 'neutral'
  },
  {
    token: mockTokens[3], // GEO
    rank: 7,
    volumeChange: 12.8,
    priceChange: 3.4,
    mentions: 234,
    sentiment: 'neutral'
  },
  {
    token: mockTokens[1], // WIND
    rank: 8,
    volumeChange: -8.2,
    priceChange: -2.1,
    mentions: 189,
    sentiment: 'negative'
  }
];

export const getTokenBySymbol = (symbol: string): Token | undefined => {
  return mockTokens.find(token => token.symbol.toLowerCase() === symbol.toLowerCase());
};

export const getTokenById = (id: string): Token | undefined => {
  return mockTokens.find(token => token.id === id);
};

export const getTokensByType = (type: TokenType): Token[] => {
  return mockTokens.filter(token => token.type === type);
};

export const getVerifiedTokens = (): Token[] => {
  return mockTokens.filter(token => token.isVerified);
};

export const getTrendingTokens = (): Token[] => {
  return mockTokens.filter(token => token.isTrending);
};

export const searchTokens = (query: string): Token[] => {
  const lowercaseQuery = query.toLowerCase();
  return mockTokens.filter(token => 
    token.name.toLowerCase().includes(lowercaseQuery) ||
    token.symbol.toLowerCase().includes(lowercaseQuery) ||
    token.contractAddress.toLowerCase().includes(lowercaseQuery) ||
    token.description?.toLowerCase().includes(lowercaseQuery)
  );
};
