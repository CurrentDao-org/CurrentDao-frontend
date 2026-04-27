'use client'

import { useState } from 'react'
import {
  Smartphone,
  Monitor,
  Tablet,
  Shield,
  ShieldOff,
  MapPin,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Plus,
  Search,
  Filter,
  ChevronDown,
  Fingerprint,
  Settings,
  Info
} from 'lucide-react'
import { DeviceInfo, ThreatLevel } from '@/types/security'

interface DeviceManagerProps {
  devices: DeviceInfo[]
  onTrustDevice: (deviceId: string) => void
  onRemoveDevice: (deviceId: string) => void
  maxDevices?: number
}

export function DeviceManager({ 
  devices, 
  onTrustDevice, 
  onRemoveDevice, 
  maxDevices = 10 
}: DeviceManagerProps) {
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'trusted' | 'untrusted'>('all')
  const [showAddDevice, setShowAddDevice] = useState(false)

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.platform.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'trusted' && device.trusted) ||
                         (filter === 'untrusted' && !device.trusted)
    return matchesSearch && matchesFilter
  })

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />
      case 'desktop':
        return <Monitor className="w-5 h-5" />
      case 'tablet':
        return <Tablet className="w-5 h-5" />
      default:
        return <Monitor className="w-5 h-5" />
    }
  }

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 20) return 'text-green-600 bg-green-50'
    if (riskScore <= 40) return 'text-yellow-600 bg-yellow-50'
    if (riskScore <= 60) return 'text-orange-600 bg-orange-50'
    return 'text-red-600 bg-red-50'
  }

  const getRiskLabel = (riskScore: number) => {
    if (riskScore <= 20) return 'Low Risk'
    if (riskScore <= 40) return 'Medium Risk'
    if (riskScore <= 60) return 'High Risk'
    return 'Critical Risk'
  }

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Recently'
  }

  const DeviceCard = ({ device }: { device: DeviceInfo }) => (
    <div 
      className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer"
      onClick={() => setSelectedDevice(device)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${device.trusted ? 'bg-green-100' : 'bg-gray-100'}`}>
            {getDeviceIcon(device.type)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{device.name}</h3>
            <p className="text-sm text-gray-600">{device.platform}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {device.trusted ? (
            <Shield className="w-5 h-5 text-green-600" />
          ) : (
            <ShieldOff className="w-5 h-5 text-gray-400" />
          )}
          <span className={`px-2 py-1 text-xs rounded-full ${
            device.trusted 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {device.trusted ? 'Trusted' : 'Untrusted'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Risk Level</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(device.riskScore)}`}>
            {getRiskLabel(device.riskScore)}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Biometric Support</span>
          <div className="flex items-center">
            {device.biometricSupported ? (
              <>
                <Fingerprint className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600">Available</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-gray-500">Not Available</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            Location
          </span>
          <span className="text-gray-900">{device.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Last Seen
          </span>
          <span className="text-gray-900">{formatLastSeen(device.lastSeen)}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">IP Address</span>
          <span className="text-gray-900 font-mono text-xs">{device.ipAddress}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
        {!device.trusted && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onTrustDevice(device.id)
            }}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Shield className="w-4 h-4 mr-2" />
            Trust Device
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemoveDevice(device.id)
          }}
          className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Device Management
          </h2>
          <p className="text-gray-600 mt-1">
            Manage and monitor trusted devices for secure access
          </p>
        </div>
        <button
          onClick={() => setShowAddDevice(true)}
          disabled={devices.length >= maxDevices}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </button>
      </div>

      {/* Device Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Devices</p>
              <p className="text-2xl font-bold text-gray-900">{devices.length}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trusted Devices</p>
              <p className="text-2xl font-bold text-green-600">
                {devices.filter(d => d.trusted).length}
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
              <p className="text-sm text-gray-600">High Risk Devices</p>
              <p className="text-2xl font-bold text-orange-600">
                {devices.filter(d => d.riskScore > 60).length}
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
              <p className="text-sm text-gray-600">Biometric Enabled</p>
              <p className="text-2xl font-bold text-blue-600">
                {devices.filter(d => d.biometricSupported).length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Fingerprint className="w-6 h-6 text-blue-600" />
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
            placeholder="Search devices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'trusted' | 'untrusted')}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Devices</option>
            <option value="trusted">Trusted Only</option>
            <option value="untrusted">Untrusted Only</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDevices.map(device => (
          <DeviceCard key={device.id} device={device} />
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="bg-white rounded-lg p-8 border border-gray-200 text-center">
          <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Devices Found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'No devices match your search criteria.' 
              : 'No devices have been added yet.'}
          </p>
        </div>
      )}

      {/* Device Limit Warning */}
      {devices.length >= maxDevices && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Device Limit Reached</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You have reached the maximum limit of {maxDevices} trusted devices. 
                Remove an existing device to add a new one.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Selected Device Details */}
      {selectedDevice && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Device Details</h3>
            <button
              onClick={() => setSelectedDevice(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <EyeOff className="w-5 h-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Device Name</p>
                <p className="font-medium">{selectedDevice.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Platform</p>
                <p className="font-medium">{selectedDevice.platform}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Device Type</p>
                <p className="font-medium capitalize">{selectedDevice.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trust Status</p>
                <div className="flex items-center">
                  {selectedDevice.trusted ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-green-600 font-medium">Trusted</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                      <span className="text-yellow-600 font-medium">Untrusted</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Risk Score</p>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className={`h-2 rounded-full ${
                        selectedDevice.riskScore <= 20 ? 'bg-green-500' :
                        selectedDevice.riskScore <= 40 ? 'bg-yellow-500' :
                        selectedDevice.riskScore <= 60 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${selectedDevice.riskScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{selectedDevice.riskScore}%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">IP Address</p>
                <p className="font-mono text-sm">{selectedDevice.ipAddress}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{selectedDevice.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Active</p>
                <p className="font-medium">{new Date(selectedDevice.lastSeen).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-gray-600">
                Biometric authentication is {selectedDevice.biometricSupported ? 'available' : 'not available'} on this device.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
