// Chart Components
export { default as BaseChart } from './BaseChart';
export { LineChart } from './LineChart';
export { BarChart } from './BarChart';
export { PieChart } from './PieChart';
export { AreaChart } from './AreaChart';
export { default as EnergyHeatmap } from './EnergyHeatmap';
export { default as EnergyHeatmapSimple } from './EnergyHeatmapSimple';

// Chart Types
export type {
  ChartDataPoint,
  ChartData,
  PieChartData,
  ChartTheme,
  ChartConfig,
  ChartTooltipProps,
  ChartLegendProps,
  ChartAxisProps,
  LineChartProps,
  BarChartProps,
  PieChartProps,
  AreaChartProps,
  ChartExportOptions,
  ChartInteractionState,
  ChartType,
  EnergyTradingData,
  MarketTrendData,
  UserAnalyticsData,
} from '../../types/charts';

// Heatmap Types
export type {
  HeatmapDataPoint,
  HeatmapData,
  HeatmapViewType,
  HeatmapTooltipData,
  HeatmapInteractionState,
  HeatmapConfig,
  HeatmapExportOptions,
} from '../../types/heatmap';

// Chart Utilities
export {
  defaultChartTheme,
  energyTradingTheme,
  formatChartValue,
  formatChartDate,
  processEnergyTradingData,
  processMarketTrendData,
  processUserAnalyticsData,
  generateRandomData,
  calculateChartDimensions,
  exportChart,
  debounce,
  throttle,
  validateChartData,
  getColorScale,
  getResponsiveConfig,
} from '../../utils/chartHelpers';

// Heatmap Utilities
export {
  generateMockHeatmapData,
  exportHeatmapToCSV,
  formatChartValue as formatHeatmapValue,
  formatChartDate as formatHeatmapDate,
} from '../../utils/heatmapHelpersSimple';

// Chart Hooks
export {
  useChart,
  useChartData,
  useChartAnimation,
  useChartKeyboardNavigation,
  useChartPerformance,
  useChartAccessibility,
} from '../../hooks/useCharts';
