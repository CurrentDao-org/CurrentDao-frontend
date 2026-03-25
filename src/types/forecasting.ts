export type ForecastHorizon = '1H' | '24H' | '7D' | '30D' | '1Y';

export interface DataPoint {
  timestamp: string;
  value: number;
}

export interface ConfidenceIntervalDataPoint extends DataPoint {
  lowerBound: number;
  upperBound: number;
}

export interface WeatherImpact {
  condition: string;
  temperature: number;
  windSpeed: number;
  solarIrradiance: number;
  impactPercentage: number; // e.g., 10 for +10% impact
}

export interface EconomicIndicator {
  name: string;
  currentValue: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  correlationScore: number; // -1 to 1
}

export interface EnsembleModel {
  name: string;
  weight: number;
  accuracy: number;
  predictions: DataPoint[];
}

export interface ForecastData {
  horizon: ForecastHorizon;
  currentPrice: number;
  predictedPrice: number;
  accuracy: number;
  history: DataPoint[];
  forecast: ConfidenceIntervalDataPoint[];
  weatherImpact: WeatherImpact;
  economicIndicators: EconomicIndicator[];
  ensembleModels: EnsembleModel[];
  overallAccuracyScore: number; // e.g. 85 for 85%
}

export interface ScenarioParams {
  demandMultiplier: number; // e.g. 1.2 for 20% increase
  supplyMultiplier: number;
  weatherSeverity: 'normal' | 'severe' | 'extreme';
  economicDownturn: boolean;
}

export interface ScenarioResult {
  scenarioName: string;
  baselineForecast: number;
  scenarioForecast: number;
  variancePercentage: number;
  forecastData: DataPoint[];
}
