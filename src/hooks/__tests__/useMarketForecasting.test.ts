import { renderHook, act } from '@testing-library/react';
import { useMarketForecasting } from '../useMarketForecasting';
import * as forecastingService from '@/services/forecasting/forecasting-service';
import { ForecastData, ScenarioResult } from '@/types/forecasting';

jest.mock('@/services/forecasting/forecasting-service');

describe('useMarketForecasting', () => {
  const mockData: Partial<ForecastData> = {
    horizon: '24H',
    currentPrice: 120,
    predictedPrice: 125,
    accuracy: 85,
    history: [],
    forecast: [],
    weatherImpact: { condition: 'Clear', impactPercentage: 10 } as any,
    economicIndicators: [],
    ensembleModels: [],
    overallAccuracyScore: 85
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches forecasting data successfully', async () => {
    (forecastingService.getMarketForecasts as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useMarketForecasting('24H'));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    
    await act(async () => {
      // wait for effect to settle
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles error when fetching fails', async () => {
    const error = new Error('Network error');
    (forecastingService.getMarketForecasts as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useMarketForecasting('1H'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(error);
  });

  it('can analyze a scenario successfully', async () => {
    (forecastingService.getMarketForecasts as jest.Mock).mockResolvedValue(mockData);
    
    const mockScenarioResult: Partial<ScenarioResult> = {
      scenarioForecast: 150,
      variancePercentage: 20
    };
    (forecastingService.runScenarioAnalysis as jest.Mock).mockResolvedValue(mockScenarioResult);

    const { result } = renderHook(() => useMarketForecasting('7D'));

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.data).toBeTruthy();

    await act(async () => {
      await result.current.analyzeScenario({
        demandMultiplier: 1.2,
        supplyMultiplier: 1.0,
        weatherSeverity: 'normal',
        economicDownturn: false
      });
    });

    expect(result.current.scenarioResult).toEqual(mockScenarioResult);
    expect(result.current.scenarioLoading).toBe(false);
  });
});
