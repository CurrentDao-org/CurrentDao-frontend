export type TradeStatus = 
  | 'initiated'
  | 'pending_validation'
  | 'validated'
  | 'matched'
  | 'executing'
  | 'executed'
  | 'settling'
  | 'settled'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface TradeStatusUpdate {
  id: string;
  tradeId: string;
  status: TradeStatus;
  timestamp: number;
  message: string;
  details?: Record<string, any>;
  userId: string;
  isAutomated: boolean;
}

export interface Trade {
  id: string;
  userId: string;
  energyType: string;
  amount: number;
  price: number;
  totalValue: number;
  status: TradeStatus;
  initiatedAt: number;
  updatedAt: number;
  completedAt?: number;
  counterpartyId?: string;
  blockchainTxHash?: string;
  settlementTime?: number;
  gasUsed?: number;
  gasPrice?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface StatusHistory {
  tradeId: string;
  updates: TradeStatusUpdate[];
  currentStatus: TradeStatus;
  progress: number;
  estimatedCompletion?: number;
  nextStatus?: TradeStatus;
}

export interface StatusFilter {
  status?: TradeStatus[];
  dateRange?: {
    start: number;
    end: number;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  energyType?: string[];
  userId?: string;
  searchTerm?: string;
}

export interface ProgressVisualization {
  currentStage: number;
  totalStages: number;
  stages: {
    name: string;
    status: 'completed' | 'active' | 'pending' | 'failed';
    timestamp?: number;
    description: string;
  }[];
  estimatedTimeRemaining?: number;
}

export interface StatusAlert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  tradeId: string;
  timestamp: number;
  isRead: boolean;
  actionUrl?: string;
}

export interface TrackingState {
  trades: Trade[];
  statusHistory: Record<string, StatusHistory>;
  alerts: StatusAlert[];
  filters: StatusFilter;
  loading: boolean;
  error: string | null;
  lastUpdated: number;
}

export interface ExportOptions {
  format: 'CSV' | 'PDF' | 'JSON';
  includeDetails: boolean;
  dateRange?: {
    start: number;
    end: number;
  };
  statusFilter?: TradeStatus[];
}

export interface StatusMetrics {
  totalTrades: number;
  completedTrades: number;
  failedTrades: number;
  pendingTrades: number;
  averageExecutionTime: number;
  successRate: number;
  totalVolume: number;
  tradesByStatus: Record<TradeStatus, number>;
  tradesByEnergyType: Record<string, number>;
}

export interface RealTimeUpdate {
  type: 'status_update' | 'new_trade' | 'alert';
  data: TradeStatusUpdate | Trade | StatusAlert;
  timestamp: number;
}
