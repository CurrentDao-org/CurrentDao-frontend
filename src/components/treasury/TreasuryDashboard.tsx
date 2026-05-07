import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  Activity,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useTreasury } from '../../hooks/useTreasury';
import { TreasuryHelpers } from '../../utils/treasuryHelpers';
import { FundCategory, ProposalStatus } from '../../types/treasury';

interface TreasuryDashboardProps {
  treasuryId: string;
}

export const TreasuryDashboard: React.FC<TreasuryDashboardProps> = ({ treasuryId }) => {
  const { state, getFilteredProposals, getFilteredFunds, getTreasuryAnalytics } = useTreasury({ treasuryId });

  const metrics = state.metrics;
  const recentProposals = getFilteredProposals()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const funds = getFilteredFunds();
  const analytics = getTreasuryAnalytics();

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    change?: number,
    changeLabel?: string
  ) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {change >= 0 ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span>{Math.abs(change)}% {changeLabel}</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );

  const renderFundDistribution = () => {
    const totalAllocated = funds.reduce((sum, fund) => sum + fund.allocatedAmount, 0);
    
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fund Distribution</h3>
        
        <div className="space-y-3">
          {funds.map((fund) => {
            const percentage = totalAllocated > 0 ? (fund.allocatedAmount / totalAllocated) * 100 : 0;
            const utilization = TreasuryHelpers.calculateFundUtilization(fund);
            const status = TreasuryHelpers.getFundStatus(fund);
            
            return (
              <div key={fund.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${TreasuryHelpers.getCategoryColor(fund.category).split(' ')[1]}`} />
                    <span className="text-sm font-medium text-gray-900">{fund.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {TreasuryHelpers.formatCurrency(fund.allocatedAmount)}
                    </div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'overBudget' ? 'bg-red-500' :
                      status === 'critical' ? 'bg-orange-500' :
                      status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{TreasuryHelpers.formatCurrency(fund.spentAmount)} spent</span>
                  <span>{utilization.toFixed(1)}% utilized</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRecentProposals = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Proposals</h3>
        <span className="text-sm text-gray-500">
          {recentProposals.length} proposals
        </span>
      </div>
      
      <div className="space-y-3">
        {recentProposals.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent proposals</p>
        ) : (
          recentProposals.map((proposal) => {
            const voteResults = TreasuryHelpers.getProposalVoteResults(proposal);
            
            return (
              <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{proposal.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{proposal.description}</p>
                    
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                      <span>{TreasuryHelpers.formatCurrency(proposal.requestedAmount)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${TreasuryHelpers.getProposalStatusColor(proposal.status)}`}>
                        {proposal.status}
                      </span>
                      <span>{proposal.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  {proposal.status === ProposalStatus.VOTING && (
                    <div className="ml-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {voteResults.percentage.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">support</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderCashFlowChart = () => {
    if (!analytics?.cashFlow.trend.length) {
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow</h3>
          <p className="text-gray-500 text-center py-8">No cash flow data available</p>
        </div>
      );
    }

    const recentTrend = analytics.cashFlow.trend.slice(-7);
    const maxAmount = Math.max(...recentTrend.map(t => Math.max(t.inflow, t.outflow)));

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow (7 days)</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-gray-600">Inflow</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-gray-600">Outflow</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {recentTrend.map((day, index) => (
              <div key={day.date} className="flex items-center space-x-2">
                <div className="w-16 text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                </div>
                
                <div className="flex-1 flex space-x-1">
                  <div className="flex-1 bg-gray-200 rounded h-4 relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-green-500"
                      style={{ width: `${(day.inflow / maxAmount) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 bg-gray-200 rounded h-4 relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-red-500"
                      style={{ width: `${(day.outflow / maxAmount) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="w-20 text-xs text-right">
                  <div className="text-green-600">
                    {TreasuryHelpers.formatLargeNumber(day.inflow)}
                  </div>
                  <div className="text-red-600">
                    {TreasuryHelpers.formatLargeNumber(day.outflow)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Net Flow</span>
            <span className={`font-medium ${
              analytics.cashFlow.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {TreasuryHelpers.formatCurrency(Math.abs(analytics.cashFlow.netFlow))}
              {analytics.cashFlow.netFlow >= 0 ? ' positive' : ' negative'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderRiskIndicators = () => {
    if (!analytics?.riskIndicators) {
      return null;
    }

    const risks = [
      {
        name: 'Concentration Risk',
        value: analytics.riskIndicators.concentrationRisk,
        threshold: 50,
        description: 'Single fund concentration'
      },
      {
        name: 'Liquidity Risk',
        value: analytics.riskIndicators.liquidityRisk,
        threshold: 30,
        description: 'Monthly burn rate vs balance'
      },
      {
        name: 'Budget Variance',
        value: analytics.riskIndicators.budgetVariance,
        threshold: 20,
        description: 'Budget deviation percentage'
      },
      {
        name: 'Proposal Backlog',
        value: analytics.riskIndicators.proposalBacklog,
        threshold: 10,
        description: 'Pending proposals count'
      }
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Indicators</h3>
        
        <div className="space-y-3">
          {risks.map((risk) => {
            const isHighRisk = risk.value > risk.threshold;
            
            return (
              <div key={risk.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{risk.name}</span>
                    <span className={`text-sm font-medium ${
                      isHighRisk ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {typeof risk.value === 'number' && risk.value < 1 
                        ? risk.value 
                        : `${risk.value.toFixed(1)}%`
                      }
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isHighRisk ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(risk.value, 100)}%` }}
                    />
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1">{risk.description}</p>
                </div>
                
                {isHighRisk && (
                  <AlertTriangle className="h-5 w-5 text-red-500 ml-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
          <p className="text-gray-600">Loading treasury data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard(
          'Total Balance',
          TreasuryHelpers.formatCurrency(metrics.totalTreasuryValue),
          <Wallet className="h-6 w-6 text-blue-600" />
        )}
        
        {renderMetricCard(
          'Allocated Funds',
          TreasuryHelpers.formatCurrency(metrics.totalAllocatedFunds),
          <PieChart className="h-6 w-6 text-purple-600" />
        )}
        
        {renderMetricCard(
          'Available Balance',
          TreasuryHelpers.formatCurrency(metrics.availableBalance),
          <DollarSign className="h-6 w-6 text-green-600" />
        )}
        
        {renderMetricCard(
          'Runway',
          metrics.runwayMonths === Infinity ? 'Unlimited' : `${metrics.runwayMonths} months`,
          <Clock className="h-6 w-6 text-orange-600" />
        )}
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderMetricCard(
          'Monthly Burn Rate',
          TreasuryHelpers.formatCurrency(metrics.monthlyBurnRate),
          <TrendingDown className="h-6 w-6 text-red-600" />
        )}
        
        {renderMetricCard(
          'Budget Utilization',
          `${metrics.budgetUtilization.toFixed(1)}%`,
          <Activity className="h-6 w-6 text-blue-600" />
        )}
        
        {renderMetricCard(
          'Active Proposals',
          metrics.activeProposals,
          <FileText className="h-6 w-6 text-purple-600" />
        )}
      </div>

      {/* Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderFundDistribution()}
        {renderCashFlowChart()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderRecentProposals()}
        {renderRiskIndicators()}
      </div>
    </div>
  );
};
