'use client'

import React, { useState } from 'react'
import { SpeedCostOption } from '@/types/gas'
import { formatFee, formatTime } from '@/utils/gasCalculations'
import { Hourglass, Gauge, Zap, Rocket, Clock } from 'lucide-react'

interface SpeedCostSliderProps {
  options: SpeedCostOption[]
  selectedOption?: SpeedCostOption
  onOptionSelect?: (option: SpeedCostOption) => void
  className?: string
}

const iconMap = {
  turtle: Hourglass,
  rabbit: Gauge,
  cheetah: Zap,
  rocket: Rocket
}

export const SpeedCostSlider: React.FC<SpeedCostSliderProps> = ({ 
  options, 
  selectedOption,
  onOptionSelect,
  className = ''
}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    selectedOption ? options.findIndex(opt => opt.id === selectedOption.id) : 1
  )

  const handleOptionClick = (index: number) => {
    setSelectedIndex(index)
    if (onOptionSelect) {
      onOptionSelect(options[index])
    }
  }

  const getSliderPosition = (index: number) => {
    return (index / (options.length - 1)) * 100
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500 hover:bg-green-600 text-white'
      case 'blue':
        return 'bg-blue-500 hover:bg-blue-600 text-white'
      case 'purple':
        return 'bg-purple-500 hover:bg-purple-600 text-white'
      case 'red':
        return 'bg-red-500 hover:bg-red-600 text-white'
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white'
    }
  }

  const getBorderColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'border-green-500'
      case 'blue':
        return 'border-blue-500'
      case 'purple':
        return 'border-purple-500'
      case 'red':
        return 'border-red-500'
      default:
        return 'border-gray-500'
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Speed vs Cost Trade-off</h3>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          <span>Execution Time</span>
        </div>
      </div>

      {/* Slider Track */}
      <div className="relative mb-8">
        {/* Track Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full"></div>
        
        {/* Selected Position Indicator */}
        <div 
          className="absolute top-6 w-5 h-5 bg-blue-600 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 transition-all duration-300"
          style={{ left: `${getSliderPosition(selectedIndex)}%` }}
        />
        
        {/* Option Points */}
        <div className="relative flex justify-between">
          {options.map((option, index) => {
            const Icon = iconMap[option.icon]
            const isSelected = index === selectedIndex
            
            return (
              <div
                key={option.id}
                className="flex flex-col items-center cursor-pointer group"
                onClick={() => handleOptionClick(index)}
              >
                {/* Icon Button */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isSelected 
                      ? `${getColorClass(option.color)} scale-110 shadow-lg` 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                
                {/* Option Name */}
                <div className={`mt-2 text-sm font-medium ${
                  isSelected ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                }`}>
                  {option.name}
                </div>
                
                {/* Fee */}
                <div className={`text-xs ${
                  isSelected ? 'text-gray-700' : 'text-gray-500'
                }`}>
                  {formatFee(option.fee)}
                </div>
                
                {/* Time */}
                <div className={`text-xs ${
                  isSelected ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {formatTime(option.estimatedTime)}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Option Details */}
      {options[selectedIndex] && (
        <div className={`border-2 ${getBorderColor(options[selectedIndex].color)} rounded-lg p-4`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center mb-1">
                {(() => {
                  const Icon = iconMap[options[selectedIndex].icon]
                  return <Icon className={`w-5 h-5 mr-2 text-${options[selectedIndex].color}-600`} />
                })()}
                <h4 className="text-lg font-semibold">{options[selectedIndex].name}</h4>
              </div>
              <p className="text-sm text-gray-600">{options[selectedIndex].description}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {formatFee(options[selectedIndex].fee)}
              </div>
              <div className="text-sm text-gray-500">
                {formatTime(options[selectedIndex].estimatedTime)}
              </div>
            </div>
          </div>
          
          {/* Confidence Meter */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Confidence:</span>
            <div className="flex items-center">
              <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                <div 
                  className={`bg-${options[selectedIndex].color}-500 h-2 rounded-full`}
                  style={{ width: `${options[selectedIndex].confidence}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {options[selectedIndex].confidence}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Compare All Options</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Speed</th>
                <th className="text-right py-2">Fee</th>
                <th className="text-right py-2">Time</th>
                <th className="text-right py-2">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {options.map((option, index) => {
                const Icon = iconMap[option.icon]
                const isSelected = index === selectedIndex
                
                return (
                  <tr 
                    key={option.id}
                    className={`border-b cursor-pointer hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleOptionClick(index)}
                  >
                    <td className="py-2">
                      <div className="flex items-center">
                        <Icon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className={isSelected ? 'font-medium' : ''}>
                          {option.name}
                        </span>
                      </div>
                    </td>
                    <td className={`text-right py-2 ${isSelected ? 'font-medium' : ''}`}>
                      {formatFee(option.fee)}
                    </td>
                    <td className={`text-right py-2 ${isSelected ? 'font-medium' : ''}`}>
                      {formatTime(option.estimatedTime)}
                    </td>
                    <td className="text-right py-2">
                      <div className="flex items-center justify-end">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div 
                            className={`bg-${option.color}-500 h-1.5 rounded-full`}
                            style={{ width: `${option.confidence}%` }}
                          />
                        </div>
                        <span className={isSelected ? 'font-medium' : ''}>
                          {option.confidence}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <Zap className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Tip:</strong> Choose based on your urgency. For non-urgent transactions, 
            slower options can save you significant fees. For time-sensitive operations, 
            consider faster options with higher fees.
          </div>
        </div>
      </div>
    </div>
  )
}
