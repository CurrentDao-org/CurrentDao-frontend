import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  BarChart3,
  Activity,
  Share2,
  Printer,
  Filter,
  Search,
  Award,
  AlertCircle,
  Info
} from 'lucide-react';
import { useCarbonTracking } from '../../hooks/useCarbonTracking';
import { 
  ImpactReport, 
  ReportPeriod,
  Recommendation,
  RecommendationType,
  DifficultyLevel,
  Priority,
  EmissionCategory,
  CarbonAnalytics,
  SustainabilityGoal,
  MetricTrend 
} from '../../types/carbon';

interface ImpactReportsProps {
  userId: string;
}

export const ImpactReports: React.FC<ImpactReportsProps> = ({ userId }) => {
  const { 
    state, 
    generateReport, 
    loadReports, 
    analytics,
    getRecommendations,
    exportData 
  } = useCarbonTracking({ userId });

  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>(ReportPeriod.QUARTERLY);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ImpactReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredReports = state.reports.filter(report => {
    if (searchTerm && !report.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedPeriod !== report.period) return false;
    return true;
  });

  const getPeriodDisplayName = (period: ReportPeriod) => {
    switch (period) {
      case ReportPeriod.WEEKLY:
        return 'Weekly';
      case ReportPeriod.MONTHLY:
        return 'Monthly';
      case ReportPeriod.QUARTERLY:
        return 'Quarterly';
      case ReportPeriod.YEARLY:
        return 'Yearly';
      case ReportPeriod.CUSTOM:
        return 'Custom';
      default:
        return period;
    }
  };

  const getReportStatusColor = (report: ImpactReport) => {
    if (report.netEmissions <= 0) return 'text-green-600';
    if (report.reductionPercentage >= 20) return 'text-green-600';
    if (report.reductionPercentage >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReportIcon = (report: ImpactReport) => {
    if (report.netEmissions <= 0) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (report.reductionPercentage >= 20) {
      return <TrendingDown className="h-5 w-5 text-green-500" />;
    } else if (report.reductionPercentage >= 10) {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <TrendingUp className="h-5 w-5 text-red-500" />;
    }
  };

  const handleGenerateReport = async (period: ReportPeriod) => {
    const report = await generateReport(period);
    if (report) {
      setShowGenerateForm(false);
      setSelectedReport(report);
    }
  };

  const handleExportReport = async (reportId: string) => {
    const report = state.reports.find(r => r.id === reportId);
    if (!report) return false;
    
    const success = await exportData('reports', 'json');
    return success;
  };

  const renderReportCard = (report: ImpactReport) => {
    const statusColor = getReportStatusColor(report);
    
    return (
      <div key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{report.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor} bg-opacity-10 ${
                statusColor.includes('green') ? 'text-green-700 bg-green-100' :
                statusColor.includes('yellow') ? 'text-yellow-700 bg-yellow-100' :
                'text-red-700 bg-red-100'
              }`}>
                {getReportIcon(report)}
                <span className="ml-1">
                  {report.netEmissions <= 0 ? 'Carbon Neutral' : 'Net Emissions'}
                </span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedReport(selectedReport === report.id ? null : report.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {selectedReport === report.id ? (
                <Eye className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={() => handleExportReport(report.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {report.totalEmissions.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Emissions</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {report.totalOffsets.toFixed(2)}
            </div>
            <div className="text-sm text-green-600">Total Offsets</div>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-900">
              {report.netEmissions.toFixed(2)}
            </div>
            <div className="text-sm text-red-600">Net Emissions</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Reduction Achievement</span>
            <span className={`font-semibold ${
              report.reductionPercentage >= 20 ? 'text-green-600' : 
              report.reductionPercentage >= 10 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {report.reductionPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-green-500 transition-all duration-500"
              style={{ width: `${Math.min(report.reductionPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Key Metrics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Period:</span>
              <div className="font-medium text-gray-900">
                {getPeriodDisplayName(report.period)} ({report.startDate.toLocaleDateString()} - {report.endDate.toLocaleDateString()})
              </div>
            </div>
            <div>
              <span className="text-gray-600">Generated:</span>
              <div className="font-medium text-gray-900">
                {report.generatedAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {showDetails === report.id && (
          <div className="pt-4 border-t border-gray-200 mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h4>
            <div className="space-y-2">
              {report.recommendations.slice(0, 3).map(rec => (
                <div key={rec.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{rec.title}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      rec.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      rec.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                      rec.difficulty === 'challenging' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {rec.difficulty.charAt(0).toUpperCase() + rec.difficulty.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <div>
                    <span className="text-sm font-medium text-green-600">
                      Impact: {rec.impact.toFixed(1)} kg CO2e
                    </span>
                    {rec.cost && (
                      <span className="text-sm text-gray-600">
                        Cost: ${rec.cost > 0 ? `$${rec.cost}` : 'Free'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications</h4>
            <div className="space-y-2">
              {report.certifications.map(cert => (
                <div key={cert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Award className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">{cert.name}</div>
                      <div className="text-sm text-gray-600">{cert.issuer}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Valid until: {certification.expiresAt ? cert.expiresAt.toLocaleDateString() : 'No expiration'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGenerateForm = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="Generate Impact Report</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Period
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {Object.values(ReportPeriod).map(period => (
              <option key={period} value={period}>
                {getPeriodDisplayName(period)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Title
          </label>
          <input
            type="text"
            value={`${selectedPeriod} Carbon Impact Report`}
            onChange={(e) => {
              // In a real implementation, this would update the form state
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter report title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe the report content and key findings"
          />
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => setShowGenerateForm(false)}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => handleGenerateReport(selectedPeriod)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Report
        </button>
      </div>
    </div>
  );

  const renderSummary = () => {
    const totalReports = filteredReports.length;
    const quarterlyReports = filteredReports.filter(r => r.period === ReportPeriod.QUARTERLY);
    const latestReport = filteredReports.length > 0 ? 
      filteredReports.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())[0] : null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Summary</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{totalReports}</div>
            <div className="text-sm text-blue-700">Total Reports</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{quarterlyReports}</div>
            <div className="text-sm text-green-700">Quarterly Reports</div>
          </div>
        </div>

        {latestReport && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Latest Report</h4>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Generated:</span>
              <span className="font-medium text-gray-900">
                {latestReport.generatedAt.toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Period:</span>
              <span className="font-medium text-gray-900">
                {getPeriodDisplayName(latestReport.period)}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Net Emissions:</span>
              <span className={`font-medium ${
                latestReport.netEmissions <= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(latestReport.netEmissions).toFixed(2)} kg CO2e
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Impact Reports</h2>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowGenerateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </button>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as ReportPeriod)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              {Object.values(ReportPeriod).map(period => (
                <option key={period} value={period}>
                  {getPeriodDisplayName(period)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reports..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
        </div>
      </div>

      {(showGenerateForm || selectedReport) && (
        <div className="mb-6">
          {showGenerateForm && renderGenerateForm()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredReports.map(renderReportCard)}
          </div>
        </div>
        
        <div className="space-y-6">
          {renderSummary()}
        </div>
      </div>
    </div>
  );
};
