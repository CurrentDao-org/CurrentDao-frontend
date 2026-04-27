'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Users,
  Smartphone,
  Globe,
  Clock,
  TrendingUp,
  Eye,
  Settings,
  RefreshCw,
  Bell,
  Lock,
  Unlock,
  MapPin,
  Calendar
} from 'lucide-react'
import { SecurityMetrics, ThreatLevel } from '@/types/security'
import { formatSecurityScore, getThreatColor, getThreatTextColor } from '@/utils/security/calculations'

interface SecurityDashboardProps {
  metrics: SecurityMetrics
  onRefresh?: () => void
  isLoading?: boolean
}

export function SecurityDashboard({ metrics, onRefresh, isLoading = false }: SecurityDashboardProps) {
  const [lastRefresh, setLastRefresh] = useState(new Date())
  const scoreDisplay = formatSecurityScore(metrics.overallScore)

  const handleRefresh = () => {
    setLastRefresh(new Date())
    onRefresh?.()
  }

  const getThreatIcon = (level: ThreatLevel) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'high':
        return <XCircle className="w-5 h-5 text-orange-500" />
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-500" />
    }
  }

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    color = 'text-gray-600' 
  }: {
    title: string
    value: string | number
    icon: any
    trend?: number
    color?: string
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {trend !== undefined && (
            <div className="flex items-center mt-2">
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-500 mr-1 rotate-180" />
              )}
              <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <Icon className="w-6 h-6 text-gray-600" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Security Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring and threat detection for CurrentDao energy traders
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Security Score Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Security Score</h2>
            <div className="flex items-baseline">
              <span className="text-5xl font-bold">{metrics.overallScore}</span>
              <span className="text-xl ml-2">/ 100</span>
            </div>
            <p className="text-blue-100 mt-2">{scoreDisplay.label}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end mb-4">
              {getThreatIcon(metrics.threatLevel)}
              <span className="ml-2 text-lg font-medium capitalize">{metrics.threatLevel} Risk</span>
            </div>
            <div className="w-32 h-32 relative">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="white"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - metrics.overallScore / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{metrics.overallScore}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Threats"
          value={metrics.activeThreats}
          icon={AlertTriangle}
          trend={metrics.activeThreats > 0 ? -15 : 0}
          color={metrics.activeThreats > 0 ? 'text-red-600' : 'text-green-600'}
        />
        <MetricCard
          title="Active Sessions"
          value={metrics.activeSessions}
          icon={Users}
          trend={5}
        />
        <MetricCard
          title="Trusted Devices"
          value={metrics.trustedDevices}
          icon={Smartphone}
          trend={8}
          color="text-blue-600"
        />
        <MetricCard
          title="Biometric Success Rate"
          value={`${(metrics.biometricSuccessRate * 100).toFixed(1)}%`}
          icon={Shield}
          trend={metrics.biometricSuccessRate > 0.9 ? 3 : -5}
          color={metrics.biometricSuccessRate > 0.9 ? 'text-green-600' : 'text-yellow-600'}
        />
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Level Breakdown */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Threat Level Breakdown
          </h3>
          <div className="space-y-3">
            {(['critical', 'high', 'medium', 'low'] as ThreatLevel[]).map((level) => (
              <div key={level} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${getThreatColor(level)} mr-3`} />
                  <span className="text-sm font-medium capitalize">{level}</span>
                </div>
                <span className={`text-sm font-semibold ${getThreatTextColor(level)}`}>
                  {level === metrics.threatLevel ? 'Active' : 'Clear'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Transaction Anomalies</span>
              <span className="text-sm font-semibold text-gray-900">
                {metrics.transactionAnomalies}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">IP Changes</span>
              <span className="text-sm font-semibold text-gray-900">
                {metrics.ipChanges}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Scan</span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(metrics.lastScanTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">System Status</span>
              <span className="text-sm font-semibold text-green-600">Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Eye className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">View Logs</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Alerts</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <Lock className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Lock All</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <MapPin className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Geolocation</span>
          </button>
        </div>
      </div>
    </div>
  )
}
