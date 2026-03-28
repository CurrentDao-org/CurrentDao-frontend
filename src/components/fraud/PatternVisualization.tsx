'use client';

import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  BarChart, Bar, Legend 
} from 'recharts';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import { FraudPattern } from '@/types/fraud';
import { TrendingUp, TrendingDown, Minus, Activity, Shield, Zap } from 'lucide-react';

export function PatternVisualization() {
  const { trends, patterns, isLoading } = useFraudDetection();

  const radarData = useMemo(() => {
    return patterns.slice(0, 6).map(p => ({
      subject: p.name,
      A: p.frequency,
      B: p.impactScore,
      fullMark: 100,
    }));
  }, [patterns]);

  const topPatterns = useMemo(() => {
    return [...patterns].sort((a, b) => b.detectedCount - a.detectedCount).slice(0, 10);
  }, [patterns]);

  if (isLoading) return <div className="h-96 flex items-center justify-center">Loading patterns...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Historical Trends - 2 Years */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              2-Year Historical Fraud Trends
            </h3>
            <p className="text-sm text-gray-500">Analysis of detected vs blocked fraud attempts</p>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Detected</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> Blocked</div>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlocked" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fill: '#94a3b8'}}
                interval={3}
              />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} name="Detected" />
              <Area type="monotone" dataKey="blockedCount" stroke="#10b981" fillOpacity={1} fill="url(#colorBlocked)" strokeWidth={2} name="Blocked" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pattern Distribution Radar */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Threat Vector Analysis
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b'}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Frequency" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                <Radar name="Impact" dataKey="B" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                <Legend iconType="circle" wrapperStyle={{fontSize: 12, paddingTop: 20}} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Fraud Types */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Top Detected Fraud Types
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {topPatterns.map((pattern, i) => (
              <div key={pattern.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white text-xs font-bold text-gray-500 border border-gray-200">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{pattern.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>Impact: {pattern.impactScore}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="flex items-center gap-0.5">
                        {pattern.trend === 'increasing' ? <TrendingUp className="w-2.5 h-2.5 text-red-500" /> : <TrendingDown className="w-2.5 h-2.5 text-green-500" />}
                        {pattern.trend}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{pattern.detectedCount.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Events</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Library of 50+ Fraud Types */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Fraud Type Library (50+ Patterns tracked)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {patterns.map(p => (
            <div key={p.id} className="p-2 rounded border border-gray-100 bg-gray-50/50 text-center hover:border-blue-200 hover:bg-blue-50 transition-all cursor-default">
              <span className="text-[10px] font-medium text-gray-700 truncate block px-1" title={p.name}>
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
