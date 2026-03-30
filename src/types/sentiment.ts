// Sentiment Analysis Types for CurrentDao Energy Trading Platform

import { EnergyType } from './analytics';

// Sentiment Score Range (-100 to 100)
export type SentimentScore = number;

// News Source
export interface NewsSource {
  id: string;
  name: string;
  url: string;
  category: 'energy' | 'finance' | 'climate' | 'technology' | 'policy';
  credibilityScore: number; // 0-100
  language: string;
}

// News Article
export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  sourceId: string;
  source: NewsSource;
  url: string;
  publishedAt: string;
  retrievedAt: string;
  sentiment: SentimentScore;
  sentimentLabel: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  keywords: string[];
  energyTypes: EnergyType[];
  importance: number; // 0-100
  viewCount: number;
}

// Social Media Platform
export type SocialMediaPlatform = 'twitter' | 'reddit' | 'discord' | 'telegram' | 'tiktok' | 'instagram';

// Social Media Post
export interface SocialMediaPost {
  id: string;
  platform: SocialMediaPlatform;
  author: string;
  content: string;
  timestamp: string;
  retrievedAt: string;
  likes: number;
  retweets: number;
  replies: number;
  shares: number;
  engagement: number; // Total engagement metric
  sentiment: SentimentScore;
  sentimentLabel: 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';
  keywords: string[];
  energyTypes: EnergyType[];
  verified: boolean;
  influenceScore: number; // 0-100
  virality: number; // 0-100
}

// Sentiment Metrics by Source Type
export interface SentimentBySource {
  source: string;
  sentiment: SentimentScore;
  weight: number; // 0-1
  lastUpdated: string;
  dataPoints: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Historical Sentiment Data Point
export interface HistoricalSentimentPoint {
  timestamp: string;
  date: string;
  overall: SentimentScore;
  news: SentimentScore;
  social: SentimentScore;
  technical: SentimentScore;
  fundamental: SentimentScore;
}

// Sentiment Alert
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface SentimentAlert {
  id: string;
  type: 'sentiment_change' | 'news_event' | 'viral_post' | 'price_correlation' | 'anomaly';
  title: string;
  description: string;
  severity: AlertSeverity;
  sentimentChange: number; // Points change
  timestamp: string;
  data: {
    energyType?: EnergyType;
    platform?: SocialMediaPlatform;
    engagement?: number;
  };
  dismissed: boolean;
}

// Trading Signal
export type SignalType = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
export type SignalConfidence = 'very_high' | 'high' | 'medium' | 'low' | 'very_low';

export interface TradingSignal {
  id: string;
  timestamp: string;
  energyType: EnergyType;
  signal: SignalType;
  confidence: SignalConfidence;
  confidenceScore: number; // 0-100
  sentimentScore: SentimentScore;
  technicalScore: number; // 0-100
  fundamentalScore: number; // 0-100
  reasoning: string;
  targetPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  validUntil: string;
}

// Sentiment Heat Map Data
export interface HeatMapCell {
  energyType: EnergyType;
  timestamp: string;
  date: string;
  sentiment: SentimentScore;
  intensity: number; // 0-100
  newsCount: number;
  socialCount: number;
}

// Regional Sentiment
export interface RegionalSentiment {
  region: string;
  country: string;
  sentiment: SentimentScore;
  energyTypes: {
    energyType: EnergyType;
    sentiment: SentimentScore;
    newsCount: number;
    socialCount: number;
  }[];
}

// Correlations
export interface SentimentCorrelation {
  energyType1: EnergyType;
  energyType2: EnergyType;
  correlation: number; // -1 to 1
  significance: number; // 0-1 (p-value)
}

// Customizable Sentiment Metric
export interface SentimentMetric {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1
  type: 'news' | 'social' | 'technical' | 'fundamental' | 'custom';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Sentiment Dashboard Data
export interface SentimentDashboardData {
  overall: SentimentScore;
  bySource: SentimentBySource[];
  byEnergyType: {
    energyType: EnergyType;
    sentiment: SentimentScore;
    trend: 'increasing' | 'decreasing' | 'stable';
    newsCount: number;
    socialCount: number;
  }[];
  topNewsArticles: NewsArticle[];
  topSocialPosts: SocialMediaPost[];
  tradingSignals: TradingSignal[];
  recentAlerts: SentimentAlert[];
  historicalData: HistoricalSentimentPoint[];
  heatMapData: HeatMapCell[];
  regionalData: RegionalSentiment[];
  lastUpdated: string;
}

// Sentiment Service Response
export interface SentimentServiceResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  cacheHit: boolean;
  version: string;
}

// API Configuration
export interface SentimentAPIConfig {
  newsApiKey: string;
  twitterApiKey: string;
  redditClientId: string;
  redditClientSecret: string;
  endpoints: {
    base: string;
    sentiment: string;
    news: string;
    social: string;
    signals: string;
    alerts: string;
  };
}

// Sentiment Query Options
export interface SentimentQueryOptions {
  timeRange: '1h' | '4h' | '1d' | '7d' | '30d' | '1y';
  energyTypes?: EnergyType[];
  newsOnly?: boolean;
  socialOnly?: boolean;
  minCredibility?: number;
  minEngagement?: number;
  platforms?: SocialMediaPlatform[];
}

// Sentiment Analysis Result
export interface SentimentAnalysisResult {
  query: SentimentQueryOptions;
  results: SentimentDashboardData;
  statistics: {
    totalArticles: number;
    totalPosts: number;
    averageSentiment: number;
    sentimentStdDev: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
  };
  processingTime: number; // milliseconds
}
