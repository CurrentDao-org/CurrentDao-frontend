import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCrossBorderTrading } from '../useCrossBorderTrading';
import type { CrossBorderTrade } from '@/types/cross-border';

// Mock the service layer
jest.mock('@/services/cross-border/cross-border-service', () => ({
  getMarkets: jest.fn().mockResolvedValue([{ id: 'MKT-US', country: { code: 'US', name: 'United States' } }]),
  getCurrencies: jest.fn().mockResolvedValue([{ code: 'USD', name: 'US Dollar' }]),
  convertCurrency: jest.fn().mockResolvedValue({ rate: 1.08, convertedAmount: 108 }),
  getRegulations: jest.fn().mockResolvedValue([{ countryCode: 'US', overallStatus: 'compliant' }]),
  getCustomsRegions: jest.fn().mockResolvedValue([{ id: 'eu', name: 'European Union' }]),
  getGlobalAnalytics: jest.fn().mockResolvedValue({ summary: { totalVolume: 1000 } }),
  executeTrade: jest.fn().mockResolvedValue({
    id: 'TRD-TEST',
    sourceCountry: 'US',
    destCountry: 'FR',
    type: 'buy',
    amountKwh: 1000,
    pricePerKwh: 0.1,
    currency: 'EUR',
    totalValue: 100,
    status: 'completed',
  } as CrossBorderTrade),
  processPayment: jest.fn().mockResolvedValue({ id: 'PAY-TEST', status: 'completed' }),
  getTranslations: jest.fn((lang) => ({ 'trade.buy': lang === 'es' ? 'Comprar' : 'Buy' })),
  SUPPORTED_LANGUAGES: [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
  ],
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useCrossBorderTrading Hook', () => {

  it('initializes with default state', () => {
    const { result } = renderHook(() => useCrossBorderTrading(), { wrapper });

    expect(result.current.activeTab).toBe('markets');
    expect(result.current.language).toBe('en');
    expect(result.current.languages.length).toBe(2);
    expect(result.current.recentTrades).toEqual([]);
    expect(result.current.t['trade.buy']).toBe('Buy');
  });

  it('can switch tabs', () => {
    const { result } = renderHook(() => useCrossBorderTrading(), { wrapper });

    act(() => {
      result.current.setActiveTab('analytics');
    });

    expect(result.current.activeTab).toBe('analytics');
  });

  it('can switch languages and fetch updated translations', () => {
    const { result } = renderHook(() => useCrossBorderTrading(), { wrapper });

    act(() => {
      result.current.setLanguage('es');
    });

    expect(result.current.language).toBe('es');
    expect(result.current.t['trade.buy']).toBe('Comprar');
  });

  it('fetches market data initially', async () => {
    const { result } = renderHook(() => useCrossBorderTrading(), { wrapper });
    
    // In Test Environment with instant mocks, it may resolve immediately
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoadingMarkets).toBe(false);
    expect(result.current.markets.length).toBeGreaterThan(0);
  });

  it('executes a trade and updates recentTrades', async () => {
    const { result } = renderHook(() => useCrossBorderTrading(), { wrapper });

    await act(async () => {
      result.current.executeTrade({
        sourceCountry: 'US',
        destCountry: 'FR',
        type: 'buy',
        amountKwh: 1000,
        currency: 'EUR'
      });
    });

    expect(result.current.recentTrades.length).toBe(1);
    expect(result.current.recentTrades[0].id).toBe('TRD-TEST');
  });

  it('can convert currency', async () => {
    const { result } = renderHook(() => useCrossBorderTrading(), { wrapper });

    let conversion;
    await act(async () => {
      conversion = await result.current.convertCurrency('USD', 'EUR', 100);
    });

    expect(conversion).toHaveProperty('rate', 1.08);
  });
});
