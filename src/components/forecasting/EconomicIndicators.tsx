import React from 'react';
import { EconomicIndicator } from '@/types/forecasting';
import { TrendingUp, TrendingDown, Minus, Briefcase } from 'lucide-react';

interface Props {
  indicators: EconomicIndicator[];
}

export const EconomicIndicators: React.FC<Props> = ({ indicators }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-500" />
          Economic Indicators
        </h3>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Macroeconomic variables analyzed by our models to predict market movements and energy demand.
      </p>

      <div className="space-y-4">
        {indicators.map((indicator, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{indicator.name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Prev: {indicator.previousValue}</span>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Cur: {indicator.currentValue}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Correlation</p>
                <p className={`text-sm font-semibold ${indicator.correlationScore > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {indicator.correlationScore > 0 ? '+' : ''}{indicator.correlationScore.toFixed(2)}
                </p>
              </div>
              
              <div className={`p-2 rounded-full ${
                indicator.trend === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400' :
                indicator.trend === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400' :
                'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {indicator.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                {indicator.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                {indicator.trend === 'stable' && <Minus className="w-4 h-4" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
