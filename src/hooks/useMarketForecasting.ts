import { useState, useCallback, useEffect } from 'react';
import { ForecastHorizon, ForecastData, ScenarioParams, ScenarioResult } from '@/types/forecasting';
import { getMarketForecasts, runScenarioAnalysis } from '@/services/forecasting/forecasting-service';

export const useMarketForecasting = (initialHorizon: ForecastHorizon = '24H') => {
  const [horizon, setHorizon] = useState<ForecastHorizon>(initialHorizon);
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [scenarioLoading, setScenarioLoading] = useState<boolean>(false);
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);

  const fetchData = useCallback(async (selectedHorizon: ForecastHorizon) => {
    try {
      setLoading(true);
      setError(null);
      // Performance requirement: forecasts generate under 2 minutes
      // Since it's mock, it resolves quickly. In real app, we handle loaders.
      const result = await getMarketForecasts(selectedHorizon);
      setData(result);
      // Reset scenario on horizon change
      setScenarioResult(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch forecasting data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(horizon);
  }, [horizon, fetchData]);

  const analyzeScenario = useCallback(async (params: ScenarioParams) => {
    if (!data) return;
    try {
      setScenarioLoading(true);
      // Cast the forecast data to DataPoint array for the scenario analysis
      const baseForecast = data.forecast.map(f => ({ timestamp: f.timestamp, value: f.value }));
      const result = await runScenarioAnalysis(params, baseForecast);
      setScenarioResult(result);
    } catch (err) {
      console.error('Scenario analysis failed', err);
    } finally {
      setScenarioLoading(false);
    }
  }, [data]);

  return {
    horizon,
    setHorizon,
    data,
    loading,
    error,
    scenarioLoading,
    scenarioResult,
    analyzeScenario,
    refetch: () => fetchData(horizon)
  };
};
