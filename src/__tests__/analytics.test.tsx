import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MarketAnalyticsProvider, useMarketAnalytics } from '@/hooks/useMarketAnalytics';
import { MarketOverview } from '@/components/analytics/MarketOverview';
import { VolumeAnalysis } from '@/components/analytics/VolumeAnalysis';
import { PriceTrends } from '@/components/analytics/PriceTrends';
import { SentimentIndicators } from '@/components/analytics/SentimentIndicators';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';
import { 
  MarketMetrics, 
  VolumeAnalysis as VolumeAnalysisType, 
  PriceTrend, 
  SentimentData, 
  PredictiveAnalytics as PredictiveAnalyticsType,
  MarketDataPoint,
  EnergyType 
} from '@/types/analytics';

// Mock the analytics calculations
jest.mock('@/utils/analyticsCalculations', () => ({
  calculateMarketMetrics: jest.fn(),
  calculateVolumeAnalysis: jest.fn(),
  calculatePriceTrend: jest.fn(),
  calculateSentiment: jest.fn(),
  calculateComparativeAnalysis: jest.fn(),
  generatePredictiveAnalytics: jest.fn(),
  formatNumber: jest.fn((num) => num.toFixed(2)),
  formatPercentage: jest.fn((num) => `${num > 0 ? '+' : ''}${num.toFixed(2)}%`),
  getEnergyTypeName: jest.fn((type) => type.charAt(0).toUpperCase() + type.slice(1)),
  getEnergyTypeColor: jest.fn(() => '#3b82f6'),
}));

// Mock Recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ReferenceLine: () => <div data-testid="reference-line" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Button component
jest.mock('@/components/ui/Button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

// Test data
const mockMarketMetrics: MarketMetrics = {
  totalVolume: 1000000,
  totalValue: 50000000,
  averagePrice: 50,
  priceChange: 2.5,
  priceChangePercent: 5.2,
  volatility: 0.15,
  marketCap: 100000000,
  liquidity: 0.8,
  lastUpdated: new Date().toISOString(),
};

const mockVolumeAnalysis: VolumeAnalysisType = {
  currentVolume: 50000,
  volumeChange: 5000,
  volumeChangePercent: 10,
  averageVolume: 45000,
  volumeTrend: 'increasing',
  peakVolume: 75000,
  volumeByEnergyType: {
    solar: 20000,
    wind: 15000,
    hydro: 10000,
    nuclear: 5000,
  } as Record<EnergyType, number>,
  volumeDistribution: [
    { energyType: 'solar', volume: 20000, percentage: 40 },
    { energyType: 'wind', volume: 15000, percentage: 30 },
    { energyType: 'hydro', volume: 10000, percentage: 20 },
    { energyType: 'nuclear', volume: 5000, percentage: 10 },
  ],
};

const mockPriceTrend: PriceTrend = {
  currentPrice: 52.5,
  priceChange: 2.5,
  priceChangePercent: 5.0,
  trendDirection: 'bullish',
  supportLevels: [45, 40, 35],
  resistanceLevels: [55, 60, 65],
  technicalIndicators: {
    sma: [50, 48, 45],
    ema: [51, 49],
    rsi: 65,
    macd: { macd: 1.2, signal: 1.0, histogram: 0.2 },
    bollingerBands: { upper: 55, middle: 50, lower: 45 },
  },
  pricePredictions: {
    shortTerm: 53,
    mediumTerm: 55,
    longTerm: 58,
    confidence: 0.75,
  },
};

const mockSentimentData: SentimentData = {
  overall: 25,
  social: 30,
  news: 20,
  technical: 15,
  fundamental: 35,
  timestamp: new Date().toISOString(),
  sources: [
    { name: 'Twitter', sentiment: 30, weight: 0.3, lastUpdated: new Date().toISOString() },
    { name: 'Reddit', sentiment: 25, weight: 0.2, lastUpdated: new Date().toISOString() },
    { name: 'News API', sentiment: 20, weight: 0.3, lastUpdated: new Date().toISOString() },
    { name: 'Technical Analysis', sentiment: 15, weight: 0.2, lastUpdated: new Date().toISOString() },
  ],
};

const mockPredictiveAnalytics: PredictiveAnalyticsType = {
  priceForecast: [
    {
      timeHorizon: '1h',
      predictedPrice: 53,
      confidenceInterval: { lower: 51, upper: 55 },
      probability: 0.8,
      model: 'arima',
    },
    {
      timeHorizon: '24h',
      predictedPrice: 55,
      confidenceInterval: { lower: 52, upper: 58 },
      probability: 0.7,
      model: 'lstm',
    },
    {
      timeHorizon: '7d',
      predictedPrice: 58,
      confidenceInterval: { lower: 54, upper: 62 },
      probability: 0.6,
      model: 'linear_regression',
    },
    {
      timeHorizon: '30d',
      predictedPrice: 62,
      confidenceInterval: { lower: 56, upper: 68 },
      probability: 0.5,
      model: 'ensemble',
    },
  ],
  volumeForecast: [
    {
      timeHorizon: '1h',
      predictedVolume: 52000,
      confidenceInterval: { lower: 48000, upper: 56000 },
      probability: 0.75,
    },
    {
      timeHorizon: '24h',
      predictedVolume: 55000,
      confidenceInterval: { lower: 50000, upper: 60000 },
      probability: 0.65,
    },
    {
      timeHorizon: '7d',
      predictedVolume: 60000,
      confidenceInterval: { lower: 54000, upper: 66000 },
      probability: 0.55,
    },
    {
      timeHorizon: '30d',
      predictedVolume: 70000,
      confidenceInterval: { lower: 62000, upper: 78000 },
      probability: 0.45,
    },
  ],
  riskAssessment: {
    riskLevel: 'medium',
    factors: [
      {
        name: 'Price Volatility',
        impact: 15,
        description: 'Current volatility is 15%',
      },
      {
        name: 'Market Trend',
        impact: 10,
        description: 'Price change of 5% in the last period',
      },
      {
        name: 'Volume Stability',
        impact: 8,
        description: 'Trading volume consistency analysis',
      },
    ],
    recommendations: [
      'Exercise caution with position sizes',
      'Set appropriate stop-loss orders',
      'Monitor market closely for exit opportunities',
    ],
  },
};

const mockHistoricalData: MarketDataPoint[] = [
  {
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    price: 50,
    volume: 45000,
    high: 51,
    low: 49,
    open: 49.5,
    close: 50,
    energyType: 'solar',
  },
  {
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    price: 51,
    volume: 48000,
    high: 52,
    low: 50,
    open: 50,
    close: 51,
    energyType: 'solar',
  },
  {
    timestamp: new Date().toISOString(),
    price: 52.5,
    volume: 50000,
    high: 53,
    low: 51,
    open: 51,
    close: 52.5,
    energyType: 'solar',
  },
];

// Test helper component
const TestComponent: React.FC = () => {
  const { state, actions } = useMarketAnalytics();
  
  return (
    <div>
      <div data-testid="loading-state">{state.isLoading ? 'loading' : 'not-loading'}</div>
      <div data-testid="error-state">{state.error || 'no-error'}</div>
      <button onClick={actions.refreshData} data-testid="refresh-button">
        Refresh
      </button>
    </div>
  );
};

describe('Market Analytics Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MarketOverview', () => {
    it('renders market metrics correctly', () => {
      render(
        <MarketOverview 
          metrics={mockMarketMetrics}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Market Overview')).toBeInTheDocument();
      expect(screen.getByText('Total Volume')).toBeInTheDocument();
      expect(screen.getByText('Average Price')).toBeInTheDocument();
      expect(screen.getByText('Market Cap')).toBeInTheDocument();
      expect(screen.getByText('Volatility')).toBeInTheDocument();
    });

    it('displays loading state', () => {
      render(
        <MarketOverview 
          metrics={null}
          isLoading={true}
          error={null}
        />
      );
      
      expect(screen.getByText('Loading market overview...')).toBeInTheDocument();
    });

    it('displays error state', () => {
      render(
        <MarketOverview 
          metrics={null}
          isLoading={false}
          error="Failed to load data"
        />
      );
      
      expect(screen.getByText('Error Loading Market Data')).toBeInTheDocument();
      expect(screen.getByText('Failed to load data')).toBeInTheDocument();
    });

    it('handles refresh action', () => {
      const mockRefresh = jest.fn();
      render(
        <MarketOverview 
          metrics={mockMarketMetrics}
          isLoading={false}
          error={null}
          onRefresh={mockRefresh}
        />
      );
      
      const refreshButton = screen.getByRole('button');
      fireEvent.click(refreshButton);
      
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('displays trend indicators correctly', () => {
      render(
        <MarketOverview 
          metrics={mockMarketMetrics}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('+5.20%')).toBeInTheDocument();
      expect(screen.getByText('Bullish')).toBeInTheDocument();
    });
  });

  describe('VolumeAnalysis', () => {
    it('renders volume analysis correctly', () => {
      render(
        <VolumeAnalysis 
          data={mockVolumeAnalysis}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Volume Analysis')).toBeInTheDocument();
      expect(screen.getByText('Current Volume')).toBeInTheDocument();
      expect(screen.getByText('Volume Change')).toBeInTheDocument();
      expect(screen.getByText('Volume by Energy Type')).toBeInTheDocument();
    });

    it('displays energy type distribution', () => {
      render(
        <VolumeAnalysis 
          data={mockVolumeAnalysis}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Solar')).toBeInTheDocument();
      expect(screen.getByText('Wind')).toBeInTheDocument();
      expect(screen.getByText('Hydro')).toBeInTheDocument();
      expect(screen.getByText('Nuclear')).toBeInTheDocument();
    });

    it('handles time range change', () => {
      const mockTimeRangeChange = jest.fn();
      render(
        <VolumeAnalysis 
          data={mockVolumeAnalysis}
          isLoading={false}
          error={null}
          timeRange="1h"
          onTimeRangeChange={mockTimeRangeChange}
        />
      );
      
      const selectElement = screen.getByRole('combobox');
      fireEvent.change(selectElement, { target: { value: '1d' } });
      
      expect(mockTimeRangeChange).toHaveBeenCalledWith('1d');
    });

    it('toggles detailed breakdown', () => {
      render(
        <VolumeAnalysis 
          data={mockVolumeAnalysis}
          isLoading={false}
          error={null}
        />
      );
      
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Detailed Breakdown')).toBeInTheDocument();
    });
  });

  describe('PriceTrends', () => {
    it('renders price trends correctly', () => {
      render(
        <PriceTrends 
          data={mockPriceTrend}
          historicalData={mockHistoricalData}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Price Trends')).toBeInTheDocument();
      expect(screen.getByText('Current Price')).toBeInTheDocument();
      expect(screen.getByText('24h Change')).toBeInTheDocument();
      expect(screen.getByText('Trend')).toBeInTheDocument();
    });

    it('displays technical indicators', () => {
      render(
        <PriceTrends 
          data={mockPriceTrend}
          historicalData={mockHistoricalData}
          isLoading={false}
          error={null}
          showTechnicalIndicators={true}
        />
      );
      
      expect(screen.getByText('Technical Indicators')).toBeInTheDocument();
      expect(screen.getByText('RSI (14)')).toBeInTheDocument();
      expect(screen.getByText('MACD')).toBeInTheDocument();
      expect(screen.getByText('Bollinger Bands')).toBeInTheDocument();
    });

    it('displays support and resistance levels', () => {
      render(
        <PriceTrends 
          data={mockPriceTrend}
          historicalData={mockHistoricalData}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Support & Resistance Levels')).toBeInTheDocument();
      expect(screen.getByText('Support Levels')).toBeInTheDocument();
      expect(screen.getByText('Resistance Levels')).toBeInTheDocument();
    });

    it('toggles chart type', () => {
      render(
        <PriceTrends 
          data={mockPriceTrend}
          historicalData={mockHistoricalData}
          isLoading={false}
          error={null}
        />
      );
      
      const areaButton = screen.getByText('Area');
      const lineButton = screen.getByText('Line');
      
      fireEvent.click(lineButton);
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      
      fireEvent.click(areaButton);
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('SentimentIndicators', () => {
    it('renders sentiment indicators correctly', () => {
      render(
        <SentimentIndicators 
          data={mockSentimentData}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Market Sentiment')).toBeInTheDocument();
      expect(screen.getByText('Overall')).toBeInTheDocument();
      expect(screen.getByText('Social')).toBeInTheDocument();
      expect(screen.getByText('News')).toBeInTheDocument();
      expect(screen.getByText('Technical')).toBeInTheDocument();
    });

    it('displays sentiment distribution', () => {
      render(
        <SentimentIndicators 
          data={mockSentimentData}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Sentiment Distribution')).toBeInTheDocument();
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    it('displays source breakdown', () => {
      render(
        <SentimentIndicators 
          data={mockSentimentData}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Source Breakdown')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('toggles detailed breakdown', () => {
      render(
        <SentimentIndicators 
          data={mockSentimentData}
          isLoading={false}
          error={null}
        />
      );
      
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
    });
  });

  describe('PredictiveAnalytics', () => {
    it('renders predictive analytics correctly', () => {
      render(
        <PredictiveAnalytics 
          data={mockPredictiveAnalytics}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Predictive Analytics')).toBeInTheDocument();
      expect(screen.getByText('Risk Level')).toBeInTheDocument();
      expect(screen.getByText('24h Forecast')).toBeInTheDocument();
    });

    it('displays price forecast chart', () => {
      render(
        <PredictiveAnalytics 
          data={mockPredictiveAnalytics}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Price Forecast')).toBeInTheDocument();
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('displays volume forecast chart', () => {
      render(
        <PredictiveAnalytics 
          data={mockPredictiveAnalytics}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Volume Forecast')).toBeInTheDocument();
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });

    it('displays model performance', () => {
      render(
        <PredictiveAnalytics 
          data={mockPredictiveAnalytics}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('Model Performance')).toBeInTheDocument();
      expect(screen.getByText('Arima')).toBeInTheDocument();
      expect(screen.getByText('Lstm')).toBeInTheDocument();
      expect(screen.getByText('Linear Regression')).toBeInTheDocument();
      expect(screen.getByText('Ensemble')).toBeInTheDocument();
    });

    it('displays risk factors and recommendations', () => {
      render(
        <PredictiveAnalytics 
          data={mockPredictiveAnalytics}
          isLoading={false}
          error={null}
        />
      );
      
      // Toggle details to see risk factors
      const toggleButton = screen.getByRole('button');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Detailed Analysis')).toBeInTheDocument();
      expect(screen.getByText('Risk Factors')).toBeInTheDocument();
      expect(screen.getByText('Recommendations')).toBeInTheDocument();
    });
  });

  describe('MarketAnalyticsProvider', () => {
    it('provides context to children', () => {
      render(
        <MarketAnalyticsProvider>
          <TestComponent />
        </MarketAnalyticsProvider>
      );
      
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByTestId('refresh-button')).toBeInTheDocument();
    });

    it('handles refresh action', async () => {
      render(
        <MarketAnalyticsProvider>
          <TestComponent />
        </MarketAnalyticsProvider>
      );
      
      const refreshButton = screen.getByTestId('refresh-button');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');
      });
    });

    it('initializes with default state', () => {
      render(
        <MarketAnalyticsProvider>
          <TestComponent />
        </MarketAnalyticsProvider>
      );
      
      expect(screen.getByTestId('loading-state')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('error-state')).toHaveTextContent('no-error');
    });
  });

  describe('Error Handling', () => {
    it('handles network errors gracefully', () => {
      render(
        <MarketOverview 
          metrics={null}
          isLoading={false}
          error="Network error: Unable to connect to server"
        />
      );
      
      expect(screen.getByText('Error Loading Market Data')).toBeInTheDocument();
      expect(screen.getByText('Network error: Unable to connect to server')).toBeInTheDocument();
    });

    it('handles missing data gracefully', () => {
      render(
        <VolumeAnalysis 
          data={null}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByText('No volume data available')).toBeInTheDocument();
    });

    it('displays appropriate loading states', () => {
      render(
        <PriceTrends 
          data={null}
          isLoading={true}
          error={null}
        />
      );
      
      expect(screen.getByText('Loading price trends...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <MarketOverview 
          metrics={mockMarketMetrics}
          isLoading={false}
          error={null}
        />
      );
      
      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: 'Market Overview' })).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <VolumeAnalysis 
          data={mockVolumeAnalysis}
          isLoading={false}
          error={null}
        />
      );
      
      const toggleButton = screen.getByRole('button');
      expect(toggleButton).toHaveAttribute('type', 'button');
    });

    it('provides screen reader announcements', () => {
      render(
        <SentimentIndicators 
          data={mockSentimentData}
          isLoading={false}
          error={null}
        />
      );
      
      // Check for live regions or status updates
      expect(screen.getByRole('heading', { name: 'Market Sentiment' })).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders large datasets efficiently', () => {
      const largeHistoricalData = Array.from({ length: 1000 }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        price: 50 + Math.random() * 10,
        volume: 45000 + Math.random() * 10000,
        high: 55 + Math.random() * 5,
        low: 45 + Math.random() * 5,
        open: 48 + Math.random() * 4,
        close: 50 + Math.random() * 10,
        energyType: 'solar' as EnergyType,
      }));

      render(
        <PriceTrends 
          data={mockPriceTrend}
          historicalData={largeHistoricalData}
          isLoading={false}
          error={null}
        />
      );
      
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('handles rapid state changes', async () => {
      const { rerender } = render(
        <MarketOverview 
          metrics={mockMarketMetrics}
          isLoading={false}
          error={null}
        />
      );

      // Rapid loading state changes
      rerender(
        <MarketOverview 
          metrics={mockMarketMetrics}
          isLoading={true}
          error={null}
        />
      );

      rerender(
        <MarketOverview 
          metrics={mockMarketMetrics}
          isLoading={false}
          error={null}
        />
      );

      expect(screen.getByText('Market Overview')).toBeInTheDocument();
    });
  });

  describe('Integration', () => {
    it('integrates all components together', () => {
      render(
        <MarketAnalyticsProvider>
          <div>
            <MarketOverview metrics={mockMarketMetrics} />
            <VolumeAnalysis data={mockVolumeAnalysis} />
            <PriceTrends data={mockPriceTrend} historicalData={mockHistoricalData} />
            <SentimentIndicators data={mockSentimentData} />
            <PredictiveAnalytics data={mockPredictiveAnalytics} />
          </div>
        </MarketAnalyticsProvider>
      );
      
      expect(screen.getByText('Market Overview')).toBeInTheDocument();
      expect(screen.getByText('Volume Analysis')).toBeInTheDocument();
      expect(screen.getByText('Price Trends')).toBeInTheDocument();
      expect(screen.getByText('Market Sentiment')).toBeInTheDocument();
      expect(screen.getByText('Predictive Analytics')).toBeInTheDocument();
    });
  });
});
