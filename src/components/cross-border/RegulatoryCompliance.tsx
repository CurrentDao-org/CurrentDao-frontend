'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react'
import type { CountryRegulation, Translations, ComplianceStatus, RiskLevel } from '@/types/cross-border'

interface RegulatoryComplianceProps {
  regulations: CountryRegulation[]
  t: Translations
  isLoading: boolean
}

const statusColors: Record<ComplianceStatus, { bg: string; text: string; icon: typeof CheckCircle }> = {
  compliant: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
  'non-compliant': { bg: 'bg-red-100', text: 'text-red-700', icon: AlertTriangle },
}

const riskColors: Record<RiskLevel, string> = {
  low: 'bg-emerald-500',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
}

export function RegulatoryCompliance({ regulations, t, isLoading }: RegulatoryComplianceProps) {
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [expandedReq, setExpandedReq] = useState<string | null>(null)

  const selectedReg = regulations.find(r => r.countryCode === selectedCountry)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header + Country Selector */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{t['compliance.title']}</h3>
              <p className="text-sm text-emerald-100">Regulatory requirements for 18 countries</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t['compliance.selectCountry']}</label>
          <select
            value={selectedCountry}
            onChange={e => setSelectedCountry(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white text-sm"
          >
            <option value="">— {t['compliance.selectCountry']} —</option>
            {regulations.map(r => (
              <option key={r.countryCode} value={r.countryCode}>
                {r.flag} {r.countryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Country Overview Cards */}
      {!selectedCountry && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {regulations.map(reg => {
            const s = statusColors[reg.overallStatus]
            const StatusIcon = s.icon
            return (
              <motion.button
                key={reg.countryCode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedCountry(reg.countryCode)}
                className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{reg.flag}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{reg.countryName}</p>
                      <p className="text-xs text-gray-500">{reg.regulatoryBody}</p>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${riskColors[reg.riskLevel]}`} title={`${reg.riskLevel} risk`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                    <StatusIcon className="w-3 h-3" />
                    {t[`compliance.${reg.overallStatus === 'non-compliant' ? 'nonCompliant' : reg.overallStatus}` as keyof Translations]}
                  </span>
                  <span className="text-xs text-gray-400">Carbon: {reg.carbonTaxRate}%</span>
                </div>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Selected Country Detail */}
      <AnimatePresence>
        {selectedReg && (
          <motion.div
            key={selectedReg.countryCode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* Overview Banner */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedReg.flag}</span>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">{selectedReg.countryName}</h4>
                    <p className="text-sm text-gray-500">Regulated by {selectedReg.regulatoryBody}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {(() => {
                    const s = statusColors[selectedReg.overallStatus]
                    const StatusIcon = s.icon
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${s.bg} ${s.text}`}>
                        <StatusIcon className="w-4 h-4" />
                        {t[`compliance.${selectedReg.overallStatus === 'non-compliant' ? 'nonCompliant' : selectedReg.overallStatus}` as keyof Translations]}
                      </span>
                    )
                  })()}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                    <div className={`w-2 h-2 rounded-full ${riskColors[selectedReg.riskLevel]}`} />
                    <span className="text-sm font-medium text-gray-700 capitalize">{selectedReg.riskLevel} Risk</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Carbon Tax</p>
                  <p className="text-lg font-bold text-gray-900">{selectedReg.carbonTaxRate}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Requirements</p>
                  <p className="text-lg font-bold text-gray-900">{selectedReg.requirements.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Compliant</p>
                  <p className="text-lg font-bold text-emerald-600">{selectedReg.requirements.filter(r => r.status === 'compliant').length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-500">Last Audit</p>
                  <p className="text-lg font-bold text-gray-900">{selectedReg.lastAudit}</p>
                </div>
              </div>
            </div>

            {/* Requirements List */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  {t['compliance.requirements']}
                </h4>
              </div>
              <div className="divide-y divide-gray-100">
                {selectedReg.requirements.map(req => {
                  const s = statusColors[req.status]
                  const StatusIcon = s.icon
                  const isExpanded = expandedReq === req.id
                  return (
                    <div key={req.id}>
                      <button
                        onClick={() => setExpandedReq(isExpanded ? null : req.id)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`w-5 h-5 ${s.text}`} />
                          <div className="text-left">
                            <p className="font-medium text-gray-900 text-sm">{req.name}</p>
                            {req.mandatory && (
                              <span className="text-[10px] font-semibold bg-red-50 text-red-600 px-1.5 py-0.5 rounded">MANDATORY</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
                            {t[`compliance.${req.status === 'non-compliant' ? 'nonCompliant' : req.status}` as keyof Translations]}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 pl-14 text-sm text-gray-600">
                              {req.description}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Import / Export Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                <h5 className="font-semibold text-gray-900 mb-3">Import Rules</h5>
                <ul className="space-y-2">
                  {selectedReg.importRules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
                <h5 className="font-semibold text-gray-900 mb-3">Export Rules</h5>
                <ul className="space-y-2">
                  {selectedReg.exportRules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
