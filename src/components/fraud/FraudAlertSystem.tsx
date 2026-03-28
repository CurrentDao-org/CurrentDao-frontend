'use client';

import { useState } from 'react';
import { 
  Shield, Activity, PieChart, ShieldAlert, 
  RefreshCw, ClipboardList, Zap, Settings 
} from 'lucide-react';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import { RealTimeMonitoring } from './RealTimeMonitoring';
import { PatternVisualization } from './PatternVisualization';
import { InvestigationWorkflow } from './InvestigationWorkflow';
import { PreventionMechanisms } from './PreventionMechanisms';
import { StatsCard } from '@/components/StatsCard';

type TabType = 'monitoring' | 'patterns' | 'investigation' | 'prevention';

/**
 * Fraud Alert System - Main Dashboard
 * Orchestrates real-time monitoring, pattern analysis, and investigation workflows.
 */
export function FraudAlertSystem() {
  const { 
    isLoading, isRefreshing, lastUpdate, refreshData, 
    autoRefresh, setAutoRefresh, dashboardStats 
  } = useFraudDetection();
  
  const [activeTab, setActiveTab] = useState<TabType>('monitoring');

  const tabs = [
    { id: 'monitoring', label: 'Monitoring', icon: Activity, description: 'Live alerts and user behavior stream' },
    { id: 'patterns', label: 'Patterns', icon: PieChart, description: 'Fraud distribution and historical trends' },
    { id: 'investigation', label: 'Investigation', icon: ClipboardList, description: 'Case management and compliance reporting' },
    { id: 'prevention', label: 'Prevention', icon: Shield, description: 'Active safeguards and blocking rules' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Dashboard Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100/50 text-red-600 mb-6 scale-90 -ml-2 origin-left">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Secure Core Active</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none mb-4">
            Fraud Detection <span className="text-blue-600">&</span> Alert System
          </h1>
          <p className="text-gray-500 max-w-2xl font-medium leading-relaxed">
            Protecting the CurrentDao ecosystem through real-time heuristic monitoring, 
            pattern-based threat detection, and autonomous prevention protocols.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                autoRefresh
                  ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm'
                  : 'bg-gray-50 text-gray-400 border-gray-200 opacity-60'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${autoRefresh ? 'fill-blue-600' : ''}`} />
              {autoRefresh ? 'Auto-syncing' : 'Manual mode'}
            </button>

            <button
              onClick={refreshData}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Sync Data
            </button>
          </div>
          <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">
            Network Integrity: 99.98% • Latency: 12ms
          </p>
        </div>
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-100 transition-colors"></div>
      </header>

      {/* Summary Micro-Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats?.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
              <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                 {stat.icon === 'AlertCircle' && <Activity className="w-3.5 h-3.5 text-blue-500" />}
                 {stat.icon === 'ShieldQuery' && <ClipboardList className="w-3.5 h-3.5 text-orange-500" />}
                 {stat.icon === 'ShieldCheck' && <Shield className="w-3.5 h-3.5 text-green-500" />}
                 {stat.icon === 'Activity' && <Activity className="w-3.5 h-3.5 text-purple-500" />}
              </div>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                stat.trend.includes('-') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
              }`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Tab Management */}
      <div className="space-y-6">
        <nav className="flex p-1.5 bg-gray-100 rounded-2xl w-fit border border-gray-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all relative ${
                activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-md' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
              {tab.label}
              {activeTab === tab.id && <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>}
            </button>
          ))}
        </nav>

        {/* Dynamic Content */}
        <main className="min-h-[600px] bg-white/50 rounded-3xl p-1 backdrop-blur-sm">
           {activeTab === 'monitoring' && <RealTimeMonitoring />}
           {activeTab === 'patterns' && <PatternVisualization />}
           {activeTab === 'investigation' && <InvestigationWorkflow />}
           {activeTab === 'prevention' && <PreventionMechanisms />}
        </main>
      </div>

      {/* Footer Info */}
      <footer className="pt-8 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <p>© 2026 CurrentDao Security • Distributed Intelligence v4.2.0</p>
        <div className="flex items-center gap-6">
           <button className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
             <Settings className="w-3 h-3" />
             Security Preferences
           </button>
           <p>Service Status: <span className="text-green-500">Normal</span></p>
        </div>
      </footer>
    </div>
  );
}
