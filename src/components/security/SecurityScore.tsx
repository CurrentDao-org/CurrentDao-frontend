'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Lock,
  Eye,
  Fingerprint,
  Smartphone,
  MapPin
} from 'lucide-react'
import { SecurityMetrics, ThreatLevel } from '@/types/security'
import { formatSecurityScore } from '@/utils/security/calculations'

interface SecurityScoreProps {
  metrics: SecurityMetrics
  onRefresh?: () => void
  isLoading?: boolean
}

export function SecurityScore({ metrics, onRefresh, isLoading = false }: SecurityScoreProps) {
  const [scoreHistory, setScoreHistory] = useState<number[]>([])
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null)
  const scoreDisplay = formatSecurityScore(metrics.overallScore)

  // Simulate score history
  useEffect(() => {
    const history = Array.from({ length: 30 }, (_, i) => {
      const baseScore = metrics.overallScore
      const variation = Math.sin(i / 5) * 10 + Math.random() * 5 - 2.5
      return Math.max(0, Math.min(100, baseScore + variation))
    })
    setScoreHistory(history)
  }, [metrics.overallScore])

  const securityFactors = [
    {
      id: 'threats',
      title: 'Threat Level',
      value: metrics.activeThreats,
      max: 10,
      weight: 0.25,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Active security threats detected'
    },
    {
      id: 'sessions',
      title: 'Session Security',
      value: metrics.activeSessions,
      max: 5,
      weight: 0.15,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Active user sessions monitoring'
    },
    {
      id: 'devices',
      title: 'Device Trust',
      value: metrics.trustedDevices,
      max: 10,
      weight: 0.20,
      icon: Smartphone,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Trusted devices registered'
    },
    {
      id: 'biometric',
      title: 'Biometric Health',
      value: metrics.biometricSuccessRate * 100,
      max: 100,
      weight: 0.20,
      icon: Fingerprint,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Biometric authentication success rate'
    },
    {
      id: 'transactions',
      title: 'Transaction Integrity',
      value: Math.max(0, 100 - metrics.transactionAnomalies * 10),
      max: 100,
      weight: 0.20,
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Transaction pattern analysis'
    }
  ]

  const getFactorScore = (factor: typeof securityFactors[0]) => {
    const normalizedValue = Math.min(factor.value / factor.max, 1)
    return normalizedValue * 100
  }

  const getFactorColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getFactorBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50'
    if (score >= 60) return 'bg-blue-50'
    if (score >= 40) return 'bg-yellow-50'
    return 'bg-red-50'
  }

  const ScoreRing = ({ score, size = 200, strokeWidth = 12 }: { score: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(229, 231, 235, 1)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={`text-4xl font-bold ${getFactorColor(score)}`}>{score}</span>
          <span className="text-sm text-gray-500">Score</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Target className="w-6 h-6 mr-2 text-blue-600" />
            Security Score Analysis
          </h2>
          <p className="text-gray-600 mt-1">
            Comprehensive security posture assessment and risk factor analysis
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Main Score Display */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-4">Overall Security Score</h3>
            <div className="flex items-baseline mb-4">
              <span className="text-5xl font-bold">{metrics.overallScore}</span>
              <span className="text-xl ml-2">/ 100</span>
            </div>
            <div className="flex items-center mb-4">
              {scoreDisplay.level === 'low' ? (
                <CheckCircle className="w-6 h-6 mr-2" />
              ) : scoreDisplay.level === 'medium' ? (
                <AlertTriangle className="w-6 h-6 mr-2" />
              ) : (
                <AlertTriangle className="w-6 h-6 mr-2" />
              )}
              <span className="text-lg font-medium">{scoreDisplay.label} Security Posture</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-blue-100">Threat Level</p>
                <p className="font-semibold capitalize">{metrics.threatLevel}</p>
              </div>
              <div>
                <p className="text-blue-100">Last Assessment</p>
                <p className="font-semibold">{new Date(metrics.lastScanTime).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <ScoreRing score={metrics.overallScore} />
          </div>
        </div>
      </div>

      {/* Security Factors */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Security Factors Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {securityFactors.map((factor) => {
            const factorScore = getFactorScore(factor)
            const Icon = factor.icon
            return (
              <div
                key={factor.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedFactor === factor.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
                onClick={() => setSelectedFactor(selectedFactor === factor.id ? null : factor.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${factor.bgColor}`}>
                    <Icon className={`w-5 h-5 ${factor.color}`} />
                  </div>
                  <span className={`text-sm font-semibold ${getFactorColor(factorScore)}`}>
                    {factorScore.toFixed(0)}%
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">{factor.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{factor.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Weight: {(factor.weight * 100).toFixed(0)}%</span>
                  <span>{factor.value} / {factor.max}</span>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        factorScore >= 80 ? 'bg-green-500' :
                        factorScore >= 60 ? 'bg-blue-500' :
                        factorScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${factorScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Score History Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-600" />
          30-Day Score Trend
        </h3>
        <div className="h-64 flex items-end justify-between">
          {scoreHistory.map((score, index) => (
            <div
              key={index}
              className="flex-1 mx-px bg-blue-500 rounded-t transition-all hover:bg-blue-600"
              style={{ height: `${(score / 100) * 100}%` }}
              title={`Day ${index + 1}: ${score.toFixed(1)}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Detailed Factor Analysis */}
      {selectedFactor && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {securityFactors.find(f => f.id === selectedFactor)?.title} - Detailed Analysis
            </h3>
            <button
              onClick={() => setSelectedFactor(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          {selectedFactor === 'threats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-2">Active Threats</h4>
                  <p className="text-2xl font-bold text-red-600">{metrics.activeThreats}</p>
                  <p className="text-sm text-red-700 mt-1">
                    Immediate attention required for critical threats
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Threat Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Critical</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>High</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medium</span>
                      <span className="font-medium">{metrics.activeThreats}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Low</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedFactor === 'biometric' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Success Rate</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {(metrics.biometricSuccessRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Excellent biometric performance
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Verification Speed</h4>
                  <p className="text-2xl font-bold text-blue-600">420ms</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Average response time
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Accuracy</h4>
                  <p className="text-2xl font-bold text-purple-600">99.2%</p>
                  <p className="text-sm text-purple-700 mt-1">
                    False acceptance rate
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedFactor === 'devices' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Trusted Devices</h4>
                  <p className="text-2xl font-bold text-green-600">{metrics.trustedDevices}</p>
                  <p className="text-sm text-green-700 mt-1">
                    Secure and verified devices
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-medium text-orange-900 mb-2">Device Capacity</h4>
                  <p className="text-2xl font-bold text-orange-600">
                    {((metrics.trustedDevices / 10) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    {metrics.trustedDevices} of 10 maximum devices
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600" />
          Security Recommendations
        </h3>
        <div className="space-y-4">
          {metrics.overallScore < 80 && (
            <div className="flex items-start p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-yellow-900">Improve Security Score</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your security score is below optimal. Consider enabling additional security features 
                  and addressing active threats to improve your overall security posture.
                </p>
              </div>
            </div>
          )}
          
          {metrics.activeThreats > 0 && (
            <div className="flex items-start p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-red-900">Address Active Threats</h4>
                <p className="text-sm text-red-700 mt-1">
                  You have {metrics.activeThreats} active threat{metrics.activeThreats > 1 ? 's' : ''} that require immediate attention.
                </p>
              </div>
            </div>
          )}

          {metrics.biometricSuccessRate < 0.9 && (
            <div className="flex items-start p-4 bg-blue-50 rounded-lg">
              <Fingerprint className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900">Optimize Biometric Settings</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your biometric success rate could be improved. Consider re-enrolling fingerprints 
                  or adjusting recognition sensitivity.
                </p>
              </div>
            </div>
          )}

          {metrics.trustedDevices < 3 && (
            <div className="flex items-start p-4 bg-green-50 rounded-lg">
              <Smartphone className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-green-900">Add Trusted Devices</h4>
                <p className="text-sm text-green-700 mt-1">
                  Consider adding more trusted devices to improve accessibility while maintaining security.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
