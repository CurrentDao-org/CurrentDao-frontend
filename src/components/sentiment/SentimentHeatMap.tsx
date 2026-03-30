'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSentimentHeatMap } from '@/hooks/useSentimentData'
import { HeatMapCell } from '@/types/sentiment'
import { EnergyType } from '@/types/analytics'
import { LayoutGrid, TrendingUp } from 'lucide-react'

interface SentimentHeatMapProps {
  timeRange?: '1h' | '1d' | '7d' | '30d' | '1y'
  className?: string
}

const ENERGY_TYPES: EnergyType[] = ['solar', 'wind', 'hydro', 'nuclear', 'natural_gas', 'coal', 'biomass']

const ENERGY_TYPE_COLORS: Record<EnergyType, string> = {
  solar: '#fbbf24',
  wind: '#3b82f6',
  hydro: '#06b6d4',
  nuclear: '#8b5cf6',
  natural_gas: '#ec4899',
  coal: '#6b7280',
  biomass: '#65a30d',
}

const getSentimentColor = (sentiment: number): string => {
  if (sentiment > 50) return '#10b981' // very positive
  if (sentiment > 20) return '#6ee7b7' // positive
  if (sentiment > -20) return '#d1d5db' // neutral
  if (sentiment > -50) return '#fca5a5' // negative
  return '#ef4444' // very negative
}

export const SentimentHeatMap: React.FC<SentimentHeatMapProps> = ({
  timeRange = '7d',
  className = '',
}) => {
  const { heatMapData, isLoading, error } = useSentimentHeatMap(timeRange)

  // Process heatmap data for energy type aggregation
  const aggregatedData = useMemo(() => {
    if (!heatMapData || heatMapData.length === 0) return null

    const energyTypeData: Record<EnergyType, { sentiment: number; intensity: number; newsCount: number; socialCount: number }[]> = {
      solar: [],
      wind: [],
      hydro: [],
      nuclear: [],
      natural_gas: [],
      coal: [],
      biomass: [],
    }

    // Group data by sentiment point date
    const dataByDate: Record<string, HeatMapCell[]> = {}

    heatMapData.forEach((cell) => {
      if (!dataByDate[cell.date]) {
        dataByDate[cell.date] = []
      }
      dataByDate[cell.date].push(cell)
    })

    // Aggregate by energy type
    Object.entries(dataByDate).forEach(([date, cells]) => {
      cells.forEach((cell) => {
        const key = cell.energyType as EnergyType
        if (energyTypeData[key]) {
          energyTypeData[key].push({
            sentiment: cell.sentiment,
            intensity: cell.intensity,
            newsCount: cell.newsCount,
            socialCount: cell.socialCount,
          })
        }
      })
    })

    return energyTypeData
  }, [heatMapData])

  const cellSize = 40 // pixels
  const cellMargin = 2

  if (error) {
    return (
      <div className={`rounded-lg bg-red-50 p-4 border border-red-200 ${className}`}>
        <p className="text-red-700">Failed to load heat map</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <LayoutGrid className="w-6 h-6 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-900">Sentiment Heat Map</h2>
        <span className="text-xs text-gray-600">({timeRange})</span>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-900 mb-3">Sentiment Scale</p>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#10b981' }} />
            <span className="text-xs text-gray-600">Very Positive (+50)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#6ee7b7' }} />
            <span className="text-xs text-gray-600">Positive (+20)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#d1d5db' }} />
            <span className="text-xs text-gray-600">Neutral (-20 to +20)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#fca5a5' }} />
            <span className="text-xs text-gray-600">Negative (-50)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: '#ef4444' }} />
            <span className="text-xs text-gray-600">Very Negative (-100)</span>
          </div>
        </div>
      </div>

      {/* Heat Map Grid */}
      {isLoading && !aggregatedData ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : aggregatedData ? (
        <div className="bg-white rounded-lg p-6 border border-gray-200 overflow-x-auto">
          <div className="inline-flex flex-col gap-4">
            {ENERGY_TYPES.map((energyType) => {
              const typeData = aggregatedData[energyType] || []

              return (
                <motion.div
                  key={energyType}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: ENERGY_TYPES.indexOf(energyType) * 0.05 }}
                  className="flex items-center gap-4"
                >
                  {/* Energy Type Label */}
                  <div
                    className="w-24 py-2 px-3 rounded text-xs font-semibold text-white text-center flex-shrink-0"
                    style={{ backgroundColor: ENERGY_TYPE_COLORS[energyType] }}
                  >
                    {energyType.replace('_', ' ').toUpperCase()}
                  </div>

                  {/* Cells Grid */}
                  <div className="flex gap-0.5 flex-wrap">
                    {typeData.length > 0 ? (
                      typeData.slice(0, 52).map((cell, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.2 }}
                          className="group relative"
                          style={{
                            width: cellSize,
                            height: cellSize,
                          }}
                        >
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.01 }}
                            className="w-full h-full rounded border border-gray-300 border-opacity-20 cursor-pointer"
                            style={{
                              backgroundColor: getSentimentColor(cell.sentiment),
                              opacity: Math.max(0.3, cell.intensity / 100),
                            }}
                          />

                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                            <p className="font-semibold">Sentiment: {cell.sentiment.toFixed(1)}</p>
                            <p>News: {cell.newsCount}</p>
                            <p>Social: {cell.socialCount}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No data</div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="ml-4 flex-shrink-0 text-right">
                    {typeData.length > 0 && (
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {(typeData.reduce((sum, c) => sum + c.sentiment, 0) / typeData.length).toFixed(1)}
                        </div>
                        <div className="text-xs text-gray-600">Avg</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <LayoutGrid className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No heat map data available</p>
        </div>
      )}

      {/* Key Insights */}
      {aggregatedData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Key Insights</h3>
          </div>

          <ul className="space-y-2 text-sm text-gray-700">
            {(() => {
              const allCells = Object.values(aggregatedData)
                .flat()
                .filter((c) => c !== undefined)

              if (allCells.length === 0) {
                return <li>No data available for analysis</li>
              }

              const avgSentiment = allCells.reduce((sum, c) => sum + c.sentiment, 0) / allCells.length
              const maxSentiment = Math.max(...allCells.map((c) => c.sentiment))
              const minSentiment = Math.min(...allCells.map((c) => c.sentiment))

              const bestPerforming = Object.entries(aggregatedData)
                .map(([type, cells]) => ({
                  type: type as EnergyType,
                  avg: cells.reduce((sum, c) => sum + c.sentiment, 0) / cells.length,
                }))
                .sort((a, b) => b.avg - a.avg)[0]

              const worstPerforming = Object.entries(aggregatedData)
                .map(([type, cells]) => ({
                  type: type as EnergyType,
                  avg: cells.reduce((sum, c) => sum + c.sentiment, 0) / cells.length,
                }))
                .sort((a, b) => a.avg - b.avg)[0]

              return (
                <>
                  <li>
                    <strong>Overall Average:</strong> {avgSentiment.toFixed(1)} (
                    {avgSentiment > 0 ? '🟢 Positive' : avgSentiment < 0 ? '🔴 Negative' : '🟡 Neutral'})
                  </li>
                  <li>
                    <strong>Range:</strong> {minSentiment.toFixed(1)} to {maxSentiment.toFixed(1)}
                  </li>
                  <li>
                    <strong>Best Performing:</strong> {bestPerforming.type} ({bestPerforming.avg.toFixed(1)})
                  </li>
                  <li>
                    <strong>Challenges:</strong> {worstPerforming.type} ({worstPerforming.avg.toFixed(1)})
                  </li>
                </>
              )
            })()}
          </ul>
        </div>
      )}
    </div>
  )
}
