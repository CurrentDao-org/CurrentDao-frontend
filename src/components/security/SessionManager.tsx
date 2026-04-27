'use client'

import { useState } from 'react'
import {
  Users,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Shield,
  ShieldOff,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  LogOut,
  Activity,
  Globe,
  Lock,
  Unlock,
  Calendar,
  Info
} from 'lucide-react'
import { SecuritySession, ThreatLevel } from '@/types/security'
import { getThreatColor, getThreatTextColor } from '@/utils/security/calculations'

interface SessionManagerProps {
  sessions: SecuritySession[]
  onRevokeSession: (sessionId: string) => void
  isLoading?: boolean
}

export function SessionManager({ sessions, onRevokeSession, isLoading = false }: SessionManagerProps) {
  const [selectedSession, setSelectedSession] = useState<SecuritySession | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active')

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && session.active) ||
                         (filter === 'inactive' && !session.active)
    return matchesSearch && matchesFilter
  })

  const activeSessions = filteredSessions.filter(s => s.active)
  const inactiveSessions = filteredSessions.filter(s => !s.active)

  const getDeviceIcon = (deviceId: string) => {
    if (deviceId.toLowerCase().includes('mobile') || deviceId.toLowerCase().includes('phone')) {
      return <Smartphone className="w-5 h-5" />
    }
    if (deviceId.toLowerCase().includes('tablet')) {
      return <Tablet className="w-5 h-5" />
    }
    return <Monitor className="w-5 h-5" />
  }

  const formatDuration = (startTime: string, lastActivity: string) => {
    const start = new Date(startTime)
    const last = new Date(lastActivity)
    const now = new Date()
    
    const duration = now.getTime() - start.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`
    return 'Less than 1 hour'
  }

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} min ago`
    
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  const SessionCard = ({ session }: { session: SecuritySession }) => (
    <div 
      className={`bg-white rounded-lg p-6 border-2 cursor-pointer transition-all hover:shadow-md ${
        session.active 
          ? 'border-green-200 bg-green-50' 
          : 'border-gray-200 bg-gray-50'
      }`}
      onClick={() => setSelectedSession(session)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            session.active ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {getDeviceIcon(session.deviceId)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{session.deviceId}</h3>
            <p className="text-sm text-gray-600">Session ID: {session.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {session.active ? (
            <Shield className="w-5 h-5 text-green-600" />
          ) : (
            <ShieldOff className="w-5 h-5 text-gray-400" />
          )}
          <span className={`px-2 py-1 text-xs rounded-full ${
            session.active 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {session.active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Risk Level</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(session.riskLevel)} bg-opacity-10 ${getThreatTextColor(session.riskLevel)}`}>
            {session.riskLevel.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Location
          </span>
          <span className="text-gray-900">{session.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <Globe className="w-4 h-4 mr-1" />
            IP Address
          </span>
          <span className="text-gray-900 font-mono text-xs">{session.ipAddress}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Duration
          </span>
          <span className="text-gray-900">{formatDuration(session.startTime, session.lastActivity)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <Activity className="w-4 h-4 mr-1" />
            Last Activity
          </span>
          <span className="text-gray-900">{formatLastActivity(session.lastActivity)}</span>
        </div>
      </div>

      {session.active && (
        <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRevokeSession(session.id)
            }}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Revoke Session
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // Extend session functionality
            }}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Clock className="w-4 h-4 mr-2" />
            Extend
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Session Management
          </h2>
          <p className="text-gray-600 mt-1">
            Monitor and control active user sessions across all devices
          </p>
        </div>
        <button
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Session Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{sessions.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Sessions</p>
              <p className="text-2xl font-bold text-green-600">
                {sessions.filter(s => s.active).length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Risk Sessions</p>
              <p className="text-2xl font-bold text-orange-600">
                {sessions.filter(s => s.riskLevel === 'high' || s.riskLevel === 'critical' && s.active).length}
              </p>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unique Locations</p>
              <p className="text-2xl font-bold text-blue-600">
                {[...new Set(sessions.map(s => s.location))].length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Sessions</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Active Sessions ({activeSessions.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive Sessions */}
      {inactiveSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ShieldOff className="w-5 h-5 mr-2 text-gray-600" />
            Inactive Sessions ({inactiveSessions.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inactiveSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {filteredSessions.length === 0 && (
        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'No sessions match your search criteria.' 
              : 'No sessions are currently active.'}
          </p>
        </div>
      )}

      {/* Selected Session Details */}
      {selectedSession && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Session ID</p>
                <p className="font-medium font-mono text-sm">{selectedSession.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Device ID</p>
                <p className="font-medium">{selectedSession.deviceId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="flex items-center">
                  {selectedSession.active ? (
                    <>
                      <Shield className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-green-600 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <ShieldOff className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600 font-medium">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Risk Level</p>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThreatColor(selectedSession.riskLevel)} bg-opacity-10 ${getThreatTextColor(selectedSession.riskLevel)}`}>
                    {selectedSession.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">IP Address</p>
                <p className="font-mono text-sm">{selectedSession.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{selectedSession.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Session Started</p>
                <p className="font-medium">{new Date(selectedSession.startTime).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Activity</p>
                <p className="font-medium">{new Date(selectedSession.lastActivity).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Session duration: {formatDuration(selectedSession.startTime, selectedSession.lastActivity)}</span>
              </div>
              {selectedSession.active && (
                <button
                  onClick={() => onRevokeSession(selectedSession.id)}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Revoke Session
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <h4 className="font-medium text-blue-900">Session Security</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This session is currently {selectedSession.active ? 'active' : 'inactive'} and 
                  has a {selectedSession.riskLevel} risk level. 
                  {selectedSession.active && ' You can revoke this session at any time for security purposes.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
