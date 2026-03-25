import React from 'react';
import { EnsembleModel, DataPoint } from '@/types/forecasting';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Network, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  models: EnsembleModel[];
  baselineForecast: DataPoint[]; // Reference optimal forecast
}

const COLORS = ['#10B981', '#F59E0B', '#EC4899', '#6366F1'];

export const EnsembleModels: React.FC<Props> = ({ models, baselineForecast }) => {
  // Merge multiple datasets by timestamp
  const dataMap = new Map<string, any>();
  
  baselineForecast.forEach(d => {
    dataMap.set(d.timestamp, { 
      timestamp: d.timestamp,
      displayTime: format(new Date(d.timestamp), 'MMM dd HH:mm'),
      'Aggregated Ensemble (Best)': d.value
    });
  });

  models.forEach(model => {
    model.predictions.forEach(p => {
      const existing = dataMap.get(p.timestamp);
      if (existing) {
        existing[model.name] = p.value;
      }
    });
  });

  const chartData = Array.from(dataMap.values()).sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-500" />
          Ensemble Models Comparison
        </h3>
        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          15% Error Reduction
        </span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Combining predictions from multiple algorithms dramatically reduces variance and improves overall forecast accuracy.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {models.map((model, idx) => (
          <div key={idx} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate pr-2" title={model.name}>
                {model.name}
              </span>
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{(model.weight * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-right">Accuracy</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{model.accuracy}%</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.3} />
            <XAxis 
              dataKey="displayTime" 
              tick={{ fontSize: 10, fill: '#6B7280' }} 
              minTickGap={20}
            />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#F9FAFB' }}
            />
            {/* Aggregated Line */}
            <Line 
              type="monotone" 
              dataKey="Aggregated Ensemble (Best)" 
              stroke="#6366F1" 
              strokeWidth={3} 
              dot={false} 
            />
            {/* Individual Models */}
            {models.map((model, idx) => (
              <Line 
                key={model.name}
                type="monotone" 
                dataKey={model.name} 
                stroke={COLORS[idx % COLORS.length]} 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
