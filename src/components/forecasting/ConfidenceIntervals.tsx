import React from 'react';
import { ConfidenceIntervalDataPoint, DataPoint } from '@/types/forecasting';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Activity } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  history: DataPoint[];
  forecast: ConfidenceIntervalDataPoint[];
  scenarioForecast?: DataPoint[];
}

export const ConfidenceIntervals: React.FC<Props> = ({ history, forecast, scenarioForecast }) => {
  // Merge history and forecast into one dataset for continuous plotting
  const data = [
    ...history.map(d => ({
      timestamp: d.timestamp,
      displayTime: format(new Date(d.timestamp), 'MMM dd HH:mm'),
      historyValue: d.value,
      forecastValue: null,
      range: null,
      scenarioValue: null
    })),
    ...forecast.map((d, i) => {
      // Find matching scenario point if exists
      const matchScenario = scenarioForecast?.[i];
      return {
        timestamp: d.timestamp,
        displayTime: format(new Date(d.timestamp), 'MMM dd HH:mm'),
        historyValue: null,
        forecastValue: d.value,
        range: [d.lowerBound, d.upperBound],
        scenarioValue: matchScenario ? matchScenario.value : null
      };
    })
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-96 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Price Forecast & Confidence Intervals
        </h3>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Displays historical prices and future projections with uncertainty bands.
      </p>

      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="displayTime" 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              tickMargin={10}
              minTickGap={30}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#6B7280' }} 
              domain={['auto', 'auto']}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#F9FAFB' }}
              itemStyle={{ color: '#F9FAFB' }}
              labelStyle={{ color: '#9CA3AF', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            
            {/* Confidence Interval Band */}
            <Area 
              type="monotone" 
              dataKey="range" 
              fill="#818CF8" 
              stroke="none" 
              fillOpacity={0.2} 
              name="95% Confidence Interval"
              connectNulls
            />

            {/* Historical Line */}
            <Line 
              type="monotone" 
              dataKey="historyValue" 
              stroke="#9CA3AF" 
              strokeWidth={2} 
              dot={false}
              name="Historical Price"
              connectNulls
            />

            {/* Forecast Line */}
            <Line 
              type="monotone" 
              dataKey="forecastValue" 
              stroke="#6366F1" 
              strokeWidth={3} 
              dot={false}
              name="Predicted Price"
              connectNulls
            />

            {/* Scenario Analysis Line */}
            {scenarioForecast && scenarioForecast.length > 0 && (
              <Line 
                type="monotone" 
                dataKey="scenarioValue" 
                stroke="#F59E0B" 
                strokeWidth={3} 
                strokeDasharray="5 5"
                dot={false}
                name="Scenario Projection"
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
