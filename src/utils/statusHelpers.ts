import { TradeStatus, Trade, StatusHistory, ProgressVisualization, StatusMetrics } from '@/types/tracking';

export const STATUS_FLOW: TradeStatus[] = [
  'initiated',
  'pending_validation',
  'validated',
  'matched',
  'executing',
  'executed',
  'settling',
  'settled',
  'completed'
];

export const STATUS_CONFIG = {
  initiated: {
    label: 'Initiated',
    description: 'Trade has been initiated and is waiting for validation',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    icon: 'clock',
    estimatedDuration: 30000, // 30 seconds
  },
  pending_validation: {
    label: 'Pending Validation',
    description: 'Trade is being validated for compliance and requirements',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'shield-check',
    estimatedDuration: 60000, // 1 minute
  },
  validated: {
    label: 'Validated',
    description: 'Trade has passed all validation checks',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: 'check-circle',
    estimatedDuration: 30000, // 30 seconds
  },
  matched: {
    label: 'Matched',
    description: 'Trade has been matched with a counterparty',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    icon: 'users',
    estimatedDuration: 15000, // 15 seconds
  },
  executing: {
    label: 'Executing',
    description: 'Trade is being executed on the blockchain',
    color: '#06B6D4',
    bgColor: '#CFFAFE',
    icon: 'cpu',
    estimatedDuration: 120000, // 2 minutes
  },
  executed: {
    label: 'Executed',
    description: 'Trade has been successfully executed',
    color: '#0EA5E9',
    bgColor: '#E0F2FE',
    icon: 'check-square',
    estimatedDuration: 30000, // 30 seconds
  },
  settling: {
    label: 'Settling',
    description: 'Trade settlement is in progress',
    color: '#6366F1',
    bgColor: '#E0E7FF',
    icon: 'arrow-right-circle',
    estimatedDuration: 60000, // 1 minute
  },
  settled: {
    label: 'Settled',
    description: 'Trade has been settled successfully',
    color: '#059669',
    bgColor: '#D1FAE5',
    icon: 'check-double',
    estimatedDuration: 15000, // 15 seconds
  },
  completed: {
    label: 'Completed',
    description: 'Trade has been completed successfully',
    color: '#10B981',
    bgColor: '#D1FAE5',
    icon: 'trophy',
    estimatedDuration: 0,
  },
  failed: {
    label: 'Failed',
    description: 'Trade has failed due to an error',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    icon: 'x-circle',
    estimatedDuration: 0,
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Trade has been cancelled',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: 'ban',
    estimatedDuration: 0,
  },
};

export const getStatusProgress = (status: TradeStatus): number => {
  const index = STATUS_FLOW.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / STATUS_FLOW.length) * 100;
};

export const getNextStatus = (status: TradeStatus): TradeStatus | null => {
  const index = STATUS_FLOW.indexOf(status);
  if (index === -1 || index === STATUS_FLOW.length - 1) return null;
  return STATUS_FLOW[index + 1];
};

export const getPreviousStatus = (status: TradeStatus): TradeStatus | null => {
  const index = STATUS_FLOW.indexOf(status);
  if (index <= 0) return null;
  return STATUS_FLOW[index - 1];
};

export const isStatusComplete = (status: TradeStatus): boolean => {
  return status === 'completed' || status === 'failed' || status === 'cancelled';
};

export const isStatusActive = (status: TradeStatus): boolean => {
  return !isStatusComplete(status);
};

export const getProgressVisualization = (trade: Trade, statusHistory: StatusHistory): ProgressVisualization => {
  const currentStatusIndex = STATUS_FLOW.indexOf(trade.status);
  const totalStages = STATUS_FLOW.length;
  
  const stages = STATUS_FLOW.map((status, index) => {
    const statusUpdate = statusHistory.updates.find(update => update.status === status);
    
    let stageStatus: 'completed' | 'active' | 'pending' | 'failed' = 'pending';
    if (index < currentStatusIndex) {
      stageStatus = 'completed';
    } else if (index === currentStatusIndex) {
      stageStatus = trade.status === 'failed' ? 'failed' : 'active';
    }
    
    return {
      name: STATUS_CONFIG[status].label,
      status: stageStatus,
      timestamp: statusUpdate?.timestamp,
      description: STATUS_CONFIG[status].description,
    };
  });

  // Calculate estimated time remaining
  let estimatedTimeRemaining: number | undefined;
  if (isStatusActive(trade.status)) {
    const remainingStages = STATUS_FLOW.slice(currentStatusIndex + 1);
    const totalTime = remainingStages.reduce((sum, status) => 
      sum + (STATUS_CONFIG[status]?.estimatedDuration || 0), 0
    );
    
    const currentStageProgress = statusHistory.progress || 0;
    const currentStageDuration = STATUS_CONFIG[trade.status]?.estimatedDuration || 0;
    const remainingInCurrentStage = currentStageDuration * (1 - currentStageProgress / 100);
    
    estimatedTimeRemaining = remainingInCurrentStage + totalTime;
  }

  return {
    currentStage: currentStatusIndex + 1,
    totalStages,
    stages,
    estimatedTimeRemaining,
  };
};

export const calculateStatusMetrics = (trades: Trade[]): StatusMetrics => {
  const totalTrades = trades.length;
  const completedTrades = trades.filter(trade => trade.status === 'completed').length;
  const failedTrades = trades.filter(trade => trade.status === 'failed').length;
  const pendingTrades = trades.filter(trade => isStatusActive(trade.status)).length;
  
  const successfulTrades = trades.filter(trade => 
    ['completed', 'settled', 'executed'].includes(trade.status)
  );
  
  const averageExecutionTime = successfulTrades.length > 0 
    ? successfulTrades.reduce((sum, trade) => {
        const executionTime = (trade.completedAt || trade.updatedAt) - trade.initiatedAt;
        return sum + executionTime;
      }, 0) / successfulTrades.length
    : 0;
  
  const successRate = totalTrades > 0 ? (completedTrades / totalTrades) * 100 : 0;
  
  const totalVolume = trades.reduce((sum, trade) => sum + trade.totalValue, 0);
  
  const tradesByStatus = trades.reduce((acc, trade) => {
    acc[trade.status] = (acc[trade.status] || 0) + 1;
    return acc;
  }, {} as Record<TradeStatus, number>);
  
  const tradesByEnergyType = trades.reduce((acc, trade) => {
    acc[trade.energyType] = (acc[trade.energyType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalTrades,
    completedTrades,
    failedTrades,
    pendingTrades,
    averageExecutionTime,
    successRate,
    totalVolume,
    tradesByStatus,
    tradesByEnergyType,
  };
};

export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

export const formatTimestamp = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) { // Less than 1 minute
    return 'Just now';
  } else if (diff < 3600000) { // Less than 1 hour
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < 86400000) { // Less than 1 day
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

export const exportToCSV = (trades: Trade[]): string => {
  const headers = [
    'ID',
    'User ID',
    'Energy Type',
    'Amount',
    'Price',
    'Total Value',
    'Status',
    'Initiated At',
    'Updated At',
    'Completed At',
    'Blockchain Tx Hash',
    'Gas Used',
  ];

  const rows = trades.map(trade => [
    trade.id,
    trade.userId,
    trade.energyType,
    trade.amount.toString(),
    trade.price.toString(),
    trade.totalValue.toString(),
    trade.status,
    formatTimestamp(trade.initiatedAt),
    formatTimestamp(trade.updatedAt),
    trade.completedAt ? formatTimestamp(trade.completedAt) : '',
    trade.blockchainTxHash || '',
    trade.gasUsed?.toString() || '',
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const exportToJSON = (trades: Trade[]): string => {
  return JSON.stringify(trades, null, 2);
};

export const filterTrades = (trades: Trade[], filters: {
  status?: TradeStatus[];
  dateRange?: { start: number; end: number };
  amountRange?: { min: number; max: number };
  energyType?: string[];
  searchTerm?: string;
}): Trade[] => {
  return trades.filter(trade => {
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(trade.status)) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      if (trade.initiatedAt < filters.dateRange.start || trade.initiatedAt > filters.dateRange.end) {
        return false;
      }
    }

    // Amount range filter
    if (filters.amountRange) {
      if (trade.totalValue < filters.amountRange.min || trade.totalValue > filters.amountRange.max) {
        return false;
      }
    }

    // Energy type filter
    if (filters.energyType && filters.energyType.length > 0) {
      if (!filters.energyType.includes(trade.energyType)) return false;
    }

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (
        !trade.id.toLowerCase().includes(searchLower) &&
        !trade.energyType.toLowerCase().includes(searchLower) &&
        !trade.status.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    return true;
  });
};

export const generateMockTrade = (id: string, userId: string): Trade => {
  const energyTypes = ['Solar', 'Wind', 'Hydro', 'Nuclear', 'Natural Gas'];
  const statuses: TradeStatus[] = ['initiated', 'pending_validation', 'validated', 'matched', 'executing', 'executed', 'settling', 'settled', 'completed'];
  
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const initiatedAt = Date.now() - (Math.random() * 24 * 60 * 60 * 1000); // Random time in last 24 hours
  const amount = Math.floor(Math.random() * 10000) + 1000;
  const price = Math.random() * 100 + 10;
  
  return {
    id,
    userId,
    energyType: energyTypes[Math.floor(Math.random() * energyTypes.length)],
    amount,
    price,
    totalValue: amount * price,
    status,
    initiatedAt,
    updatedAt: initiatedAt + (Math.random() * 60 * 60 * 1000), // Random update time
    completedAt: isStatusComplete(status) ? initiatedAt + (Math.random() * 2 * 60 * 60 * 1000) : undefined,
    counterpartyId: status !== 'initiated' ? `user_${Math.random().toString(36).substr(2, 9)}` : undefined,
    blockchainTxHash: ['executed', 'settled', 'completed'].includes(status) 
      ? `0x${Math.random().toString(16).substr(2, 64)}` 
      : undefined,
    settlementTime: ['settled', 'completed'].includes(status) ? Math.floor(Math.random() * 30) + 10 : undefined,
    gasUsed: ['executed', 'settled', 'completed'].includes(status) ? Math.floor(Math.random() * 100000) + 50000 : undefined,
    gasPrice: ['executed', 'settled', 'completed'].includes(status) ? Math.random() * 100 + 20 : undefined,
    errorMessage: status === 'failed' ? 'Insufficient liquidity' : undefined,
  };
};
