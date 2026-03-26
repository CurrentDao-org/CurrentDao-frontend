import React from 'react';
import { ProgressVisualization as ProgressVisualizationType } from '@/types/tracking';
import { formatDuration, getRelativeTime } from '@/utils/statusHelpers';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Timer
} from 'lucide-react';

interface ProgressVisualizationProps {
  progress: ProgressVisualizationType;
  className?: string;
  compact?: boolean;
  showEstimatedTime?: boolean;
}

const ProgressVisualization: React.FC<ProgressVisualizationProps> = ({
  progress,
  className = '',
  compact = false,
  showEstimatedTime = true,
}) => {
  const getStageIcon = (status: 'completed' | 'active' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'active':
        return <Clock className="w-5 h-5 animate-pulse" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5" />;
      case 'pending':
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  const getStageColor = (status: 'completed' | 'active' | 'pending' | 'failed') => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'active':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'failed':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'pending':
      default:
        return 'text-gray-400 bg-gray-100 dark:text-gray-500 dark:bg-gray-800';
    }
  };

  const getConnectorColor = (index: number) => {
    if (index < progress.currentStage - 1) {
      return 'bg-green-500';
    } else if (index === progress.currentStage - 1) {
      return 'bg-blue-500';
    } else {
      return 'bg-gray-300 dark:bg-gray-600';
    }
  };

  const progressPercentage = (progress.currentStage / progress.totalStages) * 100;

  if (compact) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {progress.currentStage}/{progress.totalStages}
          </span>
        </div>
        
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="mt-2 flex justify-between">
            {progress.stages.map((stage, index) => (
              <div
                key={stage.name}
                className={`flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                  getStageColor(stage.status)
                } ${
                  index < progress.currentStage 
                    ? 'border-green-500' 
                    : index === progress.currentStage - 1
                    ? 'border-blue-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                title={stage.name}
              >
                {index < progress.currentStage ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <Circle className="w-3 h-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {showEstimatedTime && progress.estimatedTimeRemaining && (
          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
            <Timer className="w-4 h-4 mr-1" />
            Est. {formatDuration(progress.estimatedTimeRemaining)} remaining
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Trade Progress
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stage {progress.currentStage} of {progress.totalStages}
          </p>
        </div>
        
        {showEstimatedTime && progress.estimatedTimeRemaining && (
          <div className="text-right">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Timer className="w-4 h-4 mr-1" />
              Est. Time Remaining
            </div>
            <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {formatDuration(progress.estimatedTimeRemaining)}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        <div className="mt-2 flex justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">0%</span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {Math.round(progressPercentage)}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">100%</span>
        </div>
      </div>

      {/* Stage Details */}
      <div className="space-y-3">
        {progress.stages.map((stage, index) => (
          <div key={stage.name} className="flex items-start space-x-3">
            {/* Stage Icon */}
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getStageColor(stage.status)} ${
              index < progress.currentStage 
                ? 'border-green-500' 
                : index === progress.currentStage - 1
                ? 'border-blue-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {getStageIcon(stage.status)}
            </div>

            {/* Stage Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  {stage.name}
                </h4>
                {stage.timestamp && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getRelativeTime(stage.timestamp)}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stage.description}
              </p>
              
              {stage.timestamp && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Completed at {new Date(stage.timestamp).toLocaleString()}
                </p>
              )}
            </div>

            {/* Connector Line */}
            {index < progress.stages.length - 1 && (
              <div className="flex items-center">
                <div 
                  className={`w-8 h-0.5 ${getConnectorColor(index)} transition-colors duration-300`}
                />
                <ArrowRight className={`w-4 h-4 -ml-1 ${getConnectorColor(index)}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Current Status Highlight */}
      {progress.stages.some(stage => stage.status === 'active') && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Currently Processing
            </h4>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
            {progress.stages.find(stage => stage.status === 'active')?.description}
          </p>
        </div>
      )}

      {/* Failed Status Alert */}
      {progress.stages.some(stage => stage.status === 'failed') && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className="font-medium text-red-900 dark:text-red-100">
              Process Failed
            </h4>
          </div>
          <p className="text-sm text-red-800 dark:text-red-200 mt-1">
            {progress.stages.find(stage => stage.status === 'failed')?.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressVisualization;
