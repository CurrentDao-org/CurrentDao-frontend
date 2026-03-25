'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package, CheckCircle, Clock, AlertCircle, XCircle, FileCheck, ArrowRight } from 'lucide-react'
import type { CustomsRegion, Translations, ClearanceStepStatus, DocumentStatus } from '@/types/cross-border'

interface CustomsIntegrationProps {
  regions: CustomsRegion[]
  t: Translations
  isLoading: boolean
}

const stepStatusConfig: Record<ClearanceStepStatus, { color: string; bgColor: string; icon: typeof CheckCircle }> = {
  completed: { color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: CheckCircle },
  'in-progress': { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Clock },
  pending: { color: 'text-gray-400', bgColor: 'bg-gray-100', icon: Clock },
}

const docStatusConfig: Record<DocumentStatus, { color: string; bgColor: string; icon: typeof CheckCircle }> = {
  approved: { color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: CheckCircle },
  submitted: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: FileCheck },
  pending: { color: 'text-amber-700', bgColor: 'bg-amber-100', icon: Clock },
  rejected: { color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle },
}

export function CustomsIntegration({ regions, t, isLoading }: CustomsIntegrationProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('')

  const region = regions.find(r => r.id === selectedRegion)

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
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{t['customs.title']}</h3>
              <p className="text-sm text-orange-100">Customs procedures for 12+ regions</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t['customs.selectRegion']}</label>
          <select
            value={selectedRegion}
            onChange={e => setSelectedRegion(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white text-sm"
          >
            <option value="">— {t['customs.selectRegion']} —</option>
            {regions.map(r => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Region Overview Grid (when no specific region selected) */}
      {!selectedRegion && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {regions.map((r, i) => (
            <motion.button
              key={r.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedRegion(r.id)}
              className="bg-white rounded-xl border border-gray-200 p-4 text-left hover:shadow-md transition-shadow"
            >
              <h4 className="font-semibold text-gray-900 text-sm mb-1">{r.name}</h4>
              <span className="text-xs text-gray-400 font-mono">{r.code}</span>
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                {r.clearanceTimeAvg}
              </div>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{r.notes}</p>
            </motion.button>
          ))}
        </div>
      )}

      {/* Selected Region Detail */}
      {region && (
        <motion.div
          key={region.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Region info bar */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{region.name}</h4>
                <p className="text-sm text-gray-500 font-mono">{region.code}</p>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">{t['customs.clearanceTime']}: {region.clearanceTimeAvg}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">{region.notes}</p>
          </div>

          {/* Clearance Workflow */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-6">Clearance Workflow</h4>
            <div className="space-y-0">
              {region.clearanceSteps.map((step, i) => {
                const config = stepStatusConfig[step.status]
                const StepIcon = config.icon
                const isLast = i === region.clearanceSteps.length - 1
                return (
                  <div key={step.id} className="flex gap-4">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`w-9 h-9 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0 z-10 ${step.status === 'in-progress' ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                      >
                        <StepIcon className={`w-4 h-4 ${config.color}`} />
                      </motion.div>
                      {!isLast && (
                        <div className={`w-0.5 h-16 ${step.status === 'completed' ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pb-8">
                      <div className="flex items-center gap-3 mb-1">
                        <h5 className="font-medium text-gray-900 text-sm">{step.name}</h5>
                        <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                          {step.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{step.description}</p>
                      <p className="text-xs text-gray-400 mt-1">Est. {step.estimatedTime}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Documents & Tariffs side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Documents */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-gray-500" />
                  {t['customs.documents']}
                </h4>
              </div>
              <div className="divide-y divide-gray-100">
                {region.requiredDocuments.map(doc => {
                  const dc = docStatusConfig[doc.status]
                  const DocIcon = dc.icon
                  return (
                    <div key={doc.id} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <DocIcon className={`w-4 h-4 ${dc.color}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.required && (
                          <span className="text-[10px] font-semibold bg-red-50 text-red-600 px-1.5 py-0.5 rounded">REQ</span>
                        )}
                        <span className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${dc.bgColor} ${dc.color}`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tariff Codes */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                  Tariff Codes & Duty Rates
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-6 py-3 font-medium text-gray-600">{t['customs.tariffCode']}</th>
                      <th className="text-left px-6 py-3 font-medium text-gray-600">Description</th>
                      <th className="text-right px-6 py-3 font-medium text-gray-600">{t['customs.dutyRate']}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {region.tariffCodes.map(tc => (
                      <tr key={tc.code} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-3 font-mono text-xs text-gray-900">{tc.code}</td>
                        <td className="px-6 py-3 text-gray-600">{tc.description}</td>
                        <td className="px-6 py-3 text-right font-semibold text-gray-900">{tc.dutyRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
