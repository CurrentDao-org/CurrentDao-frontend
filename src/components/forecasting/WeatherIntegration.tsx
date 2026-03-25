import React from 'react';
import { WeatherImpact } from '@/types/forecasting';
import { Cloud, Sun, Wind, Droplets, Zap } from 'lucide-react';

interface Props {
  data: WeatherImpact;
}

export const WeatherIntegration: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Cloud className="w-5 h-5 text-blue-500" />
          Weather Integration
        </h3>
        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center gap-1">
          <Zap className="w-3 h-3" />
          +{data.impactPercentage}% Accuracy
        </span>
      </div>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Weather data is integrated into our predictive models, improving forecast reliability by {data.impactPercentage}%.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
            <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Condition</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.condition}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-full">
            <Sun className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Solar Irradiance</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.solarIrradiance} W/m²</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="p-2 bg-teal-100 dark:bg-teal-900/50 rounded-full">
            <Wind className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Wind Speed</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.windSpeed} km/h</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
            <Droplets className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Temperature</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.temperature}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
};
