'use client';

import { useMemo } from 'react';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import { 
  AlertCircle, Activity, User, Globe, ShieldAlert, 
  ArrowUpRight, Clock, Zap 
} from 'lucide-react';
import { format } from 'date-fns';

export function RealTimeMonitoring() {
  const { alerts, lastUpdate, getSeverityColor, isLoading } = useFraudDetection();

  // Mocking behavior tracking since it's a "live" feature
  const behaviors = useMemo(() => [
    { id: 'b1', user: '0x742d...424', activity: 'Rapid Trade Execution', risk: 65, time: '2s ago' },
    { id: 'b2', user: '0x123a...bc9', activity: 'New IP Login (Vietnam)', risk: 42, time: '15s ago' },
    { id: 'b3', user: '0x99ef...112', activity: 'High Volume Transfer', risk: 88, time: '1m ago' },
    { id: 'b4', user: '0x456c...dee', activity: 'Failed Signature Attempt', risk: 12, time: '3m ago' },
  ], []);

  if (isLoading) return <div className="h-96 flex items-center justify-center">Loading live monitor...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
      {/* Live Alert Feed */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-500 animate-pulse" />
            Live Suspicious Activity Stream
          </h3>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Synced: {format(lastUpdate, 'HH:mm:ss')}
          </div>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all group overflow-hidden relative"
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-bold text-gray-900 truncate">
                      {alert.type}
                    </h4>
                    <span className="text-[10px] font-mono text-gray-400">
                      {format(alert.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">{alert.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Object.entries(alert.metadata).map(([key, value]) => (
                      <span key={key} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] font-medium text-gray-500">
                        {key}: {value}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="self-center p-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                  <ArrowUpRight className="w-4 h-4 text-blue-600" />
                </button>
              </div>
              {/* Severity Decorator */}
              <div className={`absolute top-0 right-0 w-1 h-full ${
                alert.severity === 'critical' ? 'bg-red-500' : 
                alert.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'
              }`}></div>
            </div>
          ))}
        </div>
        
        {alerts.length === 0 && (
          <div className="h-64 flex flex-col items-center justify-center text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <ShieldAlert className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">No active alerts detected in the last window.</p>
          </div>
        )}
      </div>

      {/* Behavior Tracking & User Stats */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
          <h4 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            Active Behavior Tracking
          </h4>
          
          <div className="space-y-4">
            {behaviors.map((b) => (
              <div key={b.id} className="group cursor-default">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-mono font-bold text-gray-800">{b.user}</span>
                  <span className="text-[10px] text-gray-400">{b.time}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        b.risk > 80 ? 'bg-red-500' : b.risk > 50 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${b.risk}%` }}
                    ></div>
                  </div>
                  <span className={`text-[10px] font-bold w-12 text-right ${
                    b.risk > 80 ? 'text-red-600' : b.risk > 50 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {b.risk}% Risk
                  </span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Activity: {b.activity}
                </p>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all flex items-center justify-center gap-2">
            <Globe className="w-3.5 h-3.5" />
            View Global Traffic Map
          </button>
        </div>

        <div className="bg-gray-900 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="p-3 bg-white/10 rounded-xl w-fit mb-4 group-hover:bg-blue-600/20 transition-colors">
              <Zap className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
            </div>
            <h5 className="text-lg font-bold mb-1">Adaptive ML Engine</h5>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              Our models are retraining every 15 minutes based on live network patterns and investigation resolutions.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex flex-col">
                <span className="text-xl font-bold">12.4ms</span>
                <span className="text-[8px] uppercase font-bold text-white/40 tracking-widest">Latent Logic</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xl font-bold">99.9%</span>
                <span className="text-[8px] uppercase font-bold text-white/40 tracking-widest">Uptime</span>
              </div>
            </div>
          </div>
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
        </div>
      </div>
    </div>
  );
}
