'use client';

import { useFraudDetection } from '@/hooks/useFraudDetection';
import { Shield, ShieldOff, Zap, ShieldAlert, BarChart3, Activity } from 'lucide-react';

export function PreventionMechanisms() {
  const { mechanisms, toggleMechanism, isLoading } = useFraudDetection();

  if (isLoading) return <div className="h-96 flex items-center justify-center">Loading mechanisms...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6" />
              Automated Prevention Governance
            </h3>
            <p className="opacity-80 max-w-xl text-sm leading-relaxed">
              Configure and manage autonomous fraud prevention layers. Our adaptive system currently maintains a 
              <strong> 98.4% success rate </strong> in blocking known threat vectors without manual intervention.
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold">1,894</p>
              <p className="text-[10px] uppercase font-bold opacity-60">Total Blocks</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <p className="text-3xl font-bold">98.4%</p>
              <p className="text-[10px] uppercase font-bold opacity-60">Success Rate</p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center text-green-300">
              <div className="flex items-center justify-center gap-1.5 mb-1 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <p className="text-[10px] font-bold uppercase">Optimal</p>
              </div>
              <p className="text-[10px] uppercase font-bold opacity-60">System State</p>
            </div>
          </div>
        </div>
        {/* Background Decoration */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-10">
          <Shield className="w-64 h-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mechanisms.map((m) => (
          <div 
            key={m.id} 
            className={`p-6 rounded-2xl border transition-all duration-300 ${
              m.enabled 
                ? 'bg-white border-blue-200 shadow-sm' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${m.enabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                  {m.name === 'Sybil Defense' ? <Zap className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className={`font-bold transition-colors ${m.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                    {m.name}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{m.description}</p>
                </div>
              </div>
              <button 
                onClick={() => toggleMechanism(m.id, !m.enabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-transparent ring-offset-2 ${
                  m.enabled ? 'bg-blue-600 ring-blue-500' : 'bg-gray-300 ring-gray-200'
                }`}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    m.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} 
                />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className={`text-sm font-bold ${m.enabled ? 'text-blue-600' : 'text-gray-400'}`}>
                  {m.blockCount}
                </p>
                <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Blocked</p>
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${m.enabled ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {m.autoBlockThreshold * 100}%
                </p>
                <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Threshold</p>
              </div>
              <div className="text-center">
                <p className={`text-[10px] font-bold ${m.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {m.enabled ? 'ACTIVE' : 'IDLE'}
                </p>
                <p className="text-[10px] uppercase font-bold text-gray-400 mt-1">Status</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-gray-500">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Detection Accuracy: {0.95 + Math.random() * 0.04 > 0.99 ? '99.2%' : '97.8%'}</span>
              </div>
              {m.enabled ? (
                <div className="flex items-center gap-1 text-green-600 font-bold uppercase tracking-widest text-[10px]">
                  <Shield className="w-3 h-3" />
                  Optimal Safeguard
                </div>
              ) : (
                <div className="flex items-center gap-1 text-orange-600 font-bold uppercase tracking-widest text-[10px]">
                  <ShieldOff className="w-3 h-3" />
                  Unprotected
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-12">
        <h4 className="font-bold text-gray-900 mb-4">Mechanism Policy Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-50">
            <div>
              <p className="text-sm font-bold text-gray-800">Global Block Delay</p>
              <p className="text-xs text-gray-500">Wait time before reapplying block on cooled-down IPs</p>
            </div>
            <select className="bg-gray-50 border-none rounded-lg text-xs font-bold px-4 py-2 ring-1 ring-gray-200">
              <option>30 Minutes</option>
              <option>1 Hour</option>
              <option>24 Hours</option>
            </select>
          </div>
          <div className="flex items-center justify-between pb-4 border-b border-gray-50">
            <div>
              <p className="text-sm font-bold text-gray-800">Sensitivity Level</p>
              <p className="text-xs text-gray-500">Strictness of anomaly detection algorithms</p>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-lg ring-1 ring-gray-200">
              {['Low', 'Medium', 'Aggressive'].map((lvl) => (
                <button 
                  key={lvl}
                  className={`px-4 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                    lvl === 'Aggressive' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
