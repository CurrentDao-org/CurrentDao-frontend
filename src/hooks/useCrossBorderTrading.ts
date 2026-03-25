'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import type {
  CrossBorderTab,
  SupportedLanguage,
  Translations,
  CrossBorderTrade,
  TradeOrder,
  CurrencyConversion,
} from '@/types/cross-border';
import {
  getMarkets,
  getCurrencies,
  convertCurrency,
  getRegulations,
  getCustomsRegions,
  getGlobalAnalytics,
  executeTrade,
  processPayment,
  getTranslations,
  SUPPORTED_LANGUAGES,
} from '@/services/cross-border/cross-border-service';

export function useCrossBorderTrading() {
  // --- UI State ---
  const [activeTab, setActiveTab] = useState<CrossBorderTab>('markets');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [recentTrades, setRecentTrades] = useState<CrossBorderTrade[]>([]);

  // --- Translations ---
  const t: Translations = useMemo(() => getTranslations(language), [language]);

  // --- Queries ---
  const marketsQuery = useQuery({
    queryKey: ['cross-border-markets'],
    queryFn: getMarkets,
    refetchInterval: 30000,
  });

  const currenciesQuery = useQuery({
    queryKey: ['cross-border-currencies'],
    queryFn: getCurrencies,
  });

  const regulationsQuery = useQuery({
    queryKey: ['cross-border-regulations'],
    queryFn: () => getRegulations(),
  });

  const customsQuery = useQuery({
    queryKey: ['cross-border-customs'],
    queryFn: getCustomsRegions,
  });

  const analyticsQuery = useQuery({
    queryKey: ['cross-border-analytics'],
    queryFn: getGlobalAnalytics,
    refetchInterval: 60000,
  });

  // --- Mutations ---
  const tradeMutation = useMutation({
    mutationFn: async (order: TradeOrder) => {
      const trade = await executeTrade(order);
      await processPayment(trade.id, trade.totalValue, trade.currency);
      return trade;
    },
    onSuccess: (trade) => {
      setRecentTrades(prev => [trade, ...prev].slice(0, 10));
    },
  });

  // --- Currency conversion ---
  const convertCurrencyFn = useCallback(
    async (from: string, to: string, amount: number): Promise<CurrencyConversion> => {
      return convertCurrency(from, to, amount);
    },
    []
  );

  return {
    // UI state
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    t,
    languages: SUPPORTED_LANGUAGES,

    // Data
    markets: marketsQuery.data ?? [],
    currencies: currenciesQuery.data ?? [],
    regulations: regulationsQuery.data ?? [],
    customsRegions: customsQuery.data ?? [],
    analytics: analyticsQuery.data ?? null,

    // Loading states
    isLoadingMarkets: marketsQuery.isLoading,
    isLoadingCurrencies: currenciesQuery.isLoading,
    isLoadingRegulations: regulationsQuery.isLoading,
    isLoadingCustoms: customsQuery.isLoading,
    isLoadingAnalytics: analyticsQuery.isLoading,

    // Trade
    recentTrades,
    executeTrade: tradeMutation.mutate,
    isExecutingTrade: tradeMutation.isLoading,
    tradeError: tradeMutation.error,

    // Currency
    convertCurrency: convertCurrencyFn,
  };
}
