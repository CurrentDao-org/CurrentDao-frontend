// ============================================================================
// Cross-Border Trading Types
// ============================================================================

// --- Language & i18n ---

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ar' | 'pt';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
}

export type TranslationKey =
  | 'nav.markets'
  | 'nav.currency'
  | 'nav.compliance'
  | 'nav.customs'
  | 'nav.analytics'
  | 'header.title'
  | 'header.subtitle'
  | 'markets.title'
  | 'markets.searchPlaceholder'
  | 'markets.country'
  | 'markets.price'
  | 'markets.volume'
  | 'markets.change'
  | 'markets.status'
  | 'markets.trade'
  | 'trade.buy'
  | 'trade.sell'
  | 'trade.amount'
  | 'trade.execute'
  | 'trade.processing'
  | 'trade.success'
  | 'trade.totalValue'
  | 'currency.title'
  | 'currency.from'
  | 'currency.to'
  | 'currency.convert'
  | 'currency.rate'
  | 'currency.favorites'
  | 'compliance.title'
  | 'compliance.selectCountry'
  | 'compliance.status'
  | 'compliance.requirements'
  | 'compliance.compliant'
  | 'compliance.pending'
  | 'compliance.nonCompliant'
  | 'customs.title'
  | 'customs.selectRegion'
  | 'customs.clearanceTime'
  | 'customs.documents'
  | 'customs.tariffCode'
  | 'customs.dutyRate'
  | 'analytics.title'
  | 'analytics.totalVolume'
  | 'analytics.activeMarkets'
  | 'analytics.avgPrice'
  | 'analytics.topSpread'
  | 'analytics.arbitrage'
  | 'analytics.trends'
  | 'common.loading'
  | 'common.error'
  | 'common.noData';

export type Translations = Record<TranslationKey, string>;

// --- Countries & Markets ---

export interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
  regulatoryBody: string;
  energyGridType: string;
  timezone: string;
  currency: string;
}

export type MarketStatus = 'open' | 'closed' | 'restricted' | 'pre-market';

export interface EnergyMarket {
  id: string;
  country: Country;
  pricePerKwh: number;
  currency: string;
  volume24h: number;
  change24h: number;
  status: MarketStatus;
  peakHours: string;
  renewablePercentage: number;
  lastUpdated: string;
}

// --- Currencies ---

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  exchangeRateToUSD: number;
  country: string;
}

export interface CurrencyConversion {
  from: Currency;
  to: Currency;
  rate: number;
  amount: number;
  convertedAmount: number;
  timestamp: string;
}

export interface CurrencyPair {
  from: string;
  to: string;
  label: string;
}

// --- Regulatory Compliance ---

export type ComplianceStatus = 'compliant' | 'pending' | 'non-compliant';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  status: ComplianceStatus;
  mandatory: boolean;
  deadline?: string;
}

export interface CountryRegulation {
  countryCode: string;
  countryName: string;
  flag: string;
  regulatoryBody: string;
  overallStatus: ComplianceStatus;
  riskLevel: RiskLevel;
  carbonTaxRate: number;
  requirements: ComplianceRequirement[];
  importRules: string[];
  exportRules: string[];
  lastAudit: string;
}

// --- Customs ---

export type DocumentStatus = 'submitted' | 'pending' | 'approved' | 'rejected';
export type ClearanceStepStatus = 'completed' | 'in-progress' | 'pending';

export interface CustomsDocument {
  id: string;
  name: string;
  required: boolean;
  status: DocumentStatus;
  description: string;
}

export interface ClearanceStep {
  id: number;
  name: string;
  description: string;
  status: ClearanceStepStatus;
  estimatedTime: string;
}

export interface CustomsRegion {
  id: string;
  name: string;
  code: string;
  clearanceTimeAvg: string;
  tariffCodes: TariffCode[];
  requiredDocuments: CustomsDocument[];
  clearanceSteps: ClearanceStep[];
  notes: string;
}

export interface TariffCode {
  code: string;
  description: string;
  dutyRate: number;
  unit: string;
}

// --- Trading ---

export type TradeType = 'buy' | 'sell';
export type TradeStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CrossBorderTrade {
  id: string;
  sourceCountry: string;
  destCountry: string;
  type: TradeType;
  amountKwh: number;
  pricePerKwh: number;
  currency: string;
  totalValue: number;
  status: TradeStatus;
  createdAt: string;
  completedAt?: string;
  estimatedCompletion: string;
}

export interface TradeOrder {
  sourceCountry: string;
  destCountry: string;
  type: TradeType;
  amountKwh: number;
  currency: string;
}

export interface PaymentTransaction {
  id: string;
  tradeId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  processedAt?: string;
}

// --- Analytics ---

export interface ArbitrageOpportunity {
  id: string;
  buyMarket: string;
  buyPrice: number;
  sellMarket: string;
  sellPrice: number;
  spread: number;
  spreadPercent: number;
  volume: number;
  currency: string;
  risk: RiskLevel;
}

export interface GlobalTrend {
  date: string;
  totalVolume: number;
  avgPrice: number;
  activeMarkets: number;
  crossBorderTrades: number;
}

export interface RegionalBreakdown {
  region: string;
  volume: number;
  percentage: number;
  color: string;
}

export interface MarketComparison {
  country: string;
  flag: string;
  price: number;
  volume: number;
  renewable: number;
}

export interface GlobalAnalyticsData {
  trends: GlobalTrend[];
  regionalBreakdown: RegionalBreakdown[];
  marketComparisons: MarketComparison[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  summary: {
    totalVolume: number;
    activeMarkets: number;
    avgPrice: number;
    topArbitrageSpread: number;
  };
}

// --- Tab Navigation ---

export type CrossBorderTab = 'markets' | 'currency' | 'compliance' | 'customs' | 'analytics';
