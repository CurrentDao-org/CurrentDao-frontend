export interface HeatmapDataPoint {
  hour: number;
  day: number;
  value: number;
  timestamp?: Date;
}

export interface HeatmapData {
  week: HeatmapDataPoint[];
  metadata: {
    startDate: Date;
    endDate: Date;
    totalConsumption: number;
    averageConsumption: number;
    peakConsumption: number;
    peakHour: number;
    peakDay: number;
  };
}

export type HeatmapViewType = 'personal' | 'community' | 'grid';

export interface HeatmapTooltipData {
  hour: number;
  day: string;
  value: number;
  formattedValue: string;
  percentage: number;
  timestamp?: Date;
}

export interface HeatmapInteractionState {
  hoveredCell: { hour: number; day: number } | null;
  selectedCell: { hour: number; day: number } | null;
  isDragging: boolean;
}

export interface HeatmapConfig {
  viewType: HeatmapViewType;
  dateRange: {
    start: Date;
    end: Date;
  };
  colorScheme: 'blue' | 'green' | 'orange' | 'purple';
  showLabels: boolean;
  showGrid: boolean;
  animationEnabled: boolean;
}

export interface HeatmapExportOptions {
  format: 'png' | 'csv';
  filename: string;
  includeMetadata: boolean;
}
