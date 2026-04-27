'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Activity,
  Eye,
  Clock,
  MapPin,
  User,
  Zap,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  Info,
  AlertCircle
} from 'lucide-react'
import { SecurityThreat, ThreatLevel, SecurityEvent } from '@/types/security'
import { getThreatColor, getThreatTextColor } from '@/utils/security/calculations'

interface ThreatDetectorProps {
  threats: SecurityThreat[]
  events: SecurityEvent[]
  onMitigateThreat: (threatId: string) => void
  isLoading?: boolean
}

export function ThreatDetector({ threats, events, onMitigateThreat, isLoading = false }: ThreatDetectorProps) {
  const [selectedThreat, setSelectedThreat] = useState<SecurityThreat | null>(null)
  const [filter, setFilter] = useState<ThreatLevel | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showEvents, setShowEvents] = useState(false)

  const filteredThreats = threats.filter(threat => {
    const matchesFilter = filter === 'all' || threat.level === filter
    const matchesSearch = threat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.type.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const recentEvents = events.slice(0, 20)

  const getThreatIcon = (level: ThreatLevel) => {
    switch (level) {
      case 'low':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'high':
        return <XCircle className="w-5 h-5 text-orange-500" />
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-500" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const ThreatCard = ({ threat }: { threat: SecurityThreat }) => (
    <div 
      className={`bg-white rounded-lg p-4 border-l-4 cursor-pointer transition-all hover:shadow-md ${
        threat.mitigated ? 'opacity-60' : ''
      } ${getThreatColor(threat.level).replace('bg-', 'border-l-')}`}
      onClick={() => setSelectedThreat(threat)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            {getThreatIcon(threat.level)}
            <span className={`ml-2 text-sm font-semibold capitalize ${getThreatTextColor(threat.level)}`}>
              {threat.level}
            </span>
            {threat.mitigated && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                Mitigated
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-900 mb-1">{threat.description}</h4>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(threat.detectedAt).toLocaleTimeString()}
            </span>
            <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {threat.source}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(threat.confidence)}`}>
              {(threat.confidence * 100).toFixed(0)}% confidence
            </span>
          </div>
        </div>
        {!threat.mitigated && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onMitigateThreat(threat.id)
            }}
            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Mitigate Threat"
          >
            <Shield className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  )

  const EventItem = ({ event }: { event: SecurityEvent }) => (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-2 h-2 rounded-full ${getThreatColor(event.severity)}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">{event.description}</p>
          <p className="text-xs text-gray-500">
            {new Date(event.timestamp).toLocaleString()} • {event.ipAddress}
          </p>
        </div>
      </div>
      <span className={`text-xs font-medium ${getThreatTextColor(event.severity)}`}>
        {event.severity}
      </span>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="w-6 h-6 mr-2 text-blue-600" />
            Threat Detection
          </h2>
          <p className="text-gray-600 mt-1">
            Real-time monitoring and analysis of security threats
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEvents(!showEvents)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              showEvents 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Events
          </button>
        </div>
      </div>

      {/* Threat Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['critical', 'high', 'medium', 'low'] as ThreatLevel[]).map((level) => {
          const count = threats.filter(t => t.level === level && !t.mitigated).length
          return (
            <div key={level} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 capitalize">{level}</p>
                  <p className={`text-2xl font-bold ${getThreatTextColor(level)}`}>{count}</p>
                </div>
                <div className={`p-2 rounded-lg ${getThreatColor(level)} bg-opacity-10`}>
                  {getThreatIcon(level)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search threats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ThreatLevel | 'all')}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Threats List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredThreats.length > 0 ? (
            filteredThreats.map(threat => <ThreatCard key={threat.id} threat={threat} />)
          ) : (
            <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Threats</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'No threats detected at this time.' 
                  : `No ${filter} level threats found.`}
              </p>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="space-y-4">
          {/* Selected Threat Details */}
          {selectedThreat && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Threat Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <p className="font-medium capitalize">{selectedThreat.type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{selectedThreat.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Detected</p>
                  <p className="font-medium">{new Date(selectedThreat.detectedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Source</p>
                  <p className="font-medium">{selectedThreat.source}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Confidence</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${getThreatColor(selectedThreat.level)}`}
                        style={{ width: `${selectedThreat.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {(selectedThreat.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Recommended Actions</p>
                  <div className="space-y-2">
                    {selectedThreat.actions.map((action, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <Zap className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="capitalize">{action.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {!selectedThreat.mitigated && (
                  <button
                    onClick={() => onMitigateThreat(selectedThreat.id)}
                    className="w-full bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 transition-colors"
                  >
                    Mitigate Threat
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recent Events */}
          {showEvents && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h3>
              <div className="space-y-1 max-h-96 overflow-y-auto">
                {recentEvents.length > 0 ? (
                  recentEvents.map(event => <EventItem key={event.id} event={event} />)
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent events</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
