'use client';

import { useState } from 'react';
import { useFraudDetection } from '@/hooks/useFraudDetection';
import { InvestigationCase, InvestigationStatus } from '@/types/fraud';
import { 
  Search, Filter, MoreHorizontal, FileText, UserPlus, 
  CheckCircle, XCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';

export function InvestigationWorkflow() {
  const { cases, isLoading } = useFraudDetection();
  const [selectedCase, setSelectedCase] = useState<InvestigationCase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = cases.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: InvestigationStatus) => {
    switch (status) {
      case InvestigationStatus.PENDING: return <Clock className="w-4 h-4 text-orange-500" />;
      case InvestigationStatus.UNDER_INVESTIGATION: return <Activity className="w-4 h-4 text-blue-500" />;
      case InvestigationStatus.RESOLVED_FRAUD: return <CheckCircle className="w-4 h-4 text-red-500" />;
      case InvestigationStatus.FALSE_POSITIVE: return <CheckCircle className="w-4 h-4 text-green-500" />;
      case InvestigationStatus.CLOSED: return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: InvestigationStatus) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  if (isLoading) return <div className="h-96 flex items-center justify-center">Loading cases...</div>;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Case List */}
      <div className="xl:col-span-2 space-y-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by case ID or title..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
            <Filter className="w-4 h-4 text-gray-600" />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Generate Compliance Report
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Case Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Severity</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Assigned</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCases.map((c) => (
                  <tr 
                    key={c.id} 
                    className={`hover:bg-blue-50/50 cursor-pointer transition-colors ${selectedCase?.id === c.id ? 'bg-blue-50' : ''}`}
                    onClick={() => setSelectedCase(c)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-gray-900">{c.title}</p>
                      <p className="text-xs text-gray-500 font-mono">#{c.id} • {format(c.createdAt, 'MMM d, HH:mm')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(c.status)}
                        <span className="text-[10px] font-bold text-gray-700">{getStatusText(c.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        c.severity === 'critical' ? 'bg-red-100 text-red-600' : 
                        c.severity === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {c.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-600">{c.assignedTo || 'Unassigned'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">Showing {filteredCases.length} of {cases.length} investigation cases</p>
          </div>
        </div>
      </div>

      {/* Case Details / Evidence */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-hidden h-fit sticky top-6">
        {selectedCase ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-gray-900">Case Details</h4>
              <button 
                onClick={() => setSelectedCase(null)}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear selection
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Title</p>
                <p className="text-sm font-medium text-gray-900">{selectedCase.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                  <p className="text-xs font-semibold text-gray-700">{getStatusText(selectedCase.status)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Severity</p>
                  <p className={`text-xs font-bold ${selectedCase.severity === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
                    {selectedCase.severity.toUpperCase()}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Investigation Notes</p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {selectedCase.notes.map((note, i) => (
                    <div key={i} className="p-2 bg-gray-50 rounded text-xs text-gray-600 border-l-2 border-blue-400">
                      {note}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                <button className="px-3 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                  <UserPlus className="w-3.5 h-3.5" />
                  Assign Agent
                </button>
                <button className="px-3 py-2 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Resolve Case
                </button>
                <button className="px-3 py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flag Fraud
                </button>
                <button className="px-3 py-2 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                  <XCircle className="w-3.5 h-3.5" />
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-center opacity-50">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-600">Select a case to view details<br/>and evidence analysis</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Activity(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
