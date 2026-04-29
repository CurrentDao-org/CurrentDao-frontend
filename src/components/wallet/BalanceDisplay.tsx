import React, { useState } from 'react';
import { BalanceDisplayProps, WalletBalance } from '@/types/wallet';
import { formatBalance } from '@/lib/stellar';
import { 
  Zap, 
  DollarSign, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Component to display user's portfolio balances,
 * including WATT and XLM as primary assets.
 */
export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  balance,
  isLoading = false,
  error = null,
  className = '',
  showAssetDetails = true,
}) => {
  const [showFullBalance, setShowFullBalance] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const getWATTBalance = () => {
    const wattBalance = balance.find(assetBalance => assetBalance.asset_code === 'WATT');
    return wattBalance?.balance || '0';
  };

  const getXLMBalance = () => {
    const xlmBalance = balance.find(assetBalance => assetBalance.asset_code === 'XLM');
    return xlmBalance?.balance || '0';
  };

  const getOtherAssets = () => {
    return balance.filter(b => b.asset_code !== 'WATT' && b.asset_code !== 'XLM');
  };

  /**
   * Returns the appropriate icon for a given asset code.
   */
  const getAssetIcon = (assetCode: string) => {
    switch (assetCode) {
      case 'WATT':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'XLM':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      default:
        return <div className="w-5 h-5 bg-gray-300 rounded flex items-center justify-center">
          <span className="text-xs text-gray-600 font-bold">
            {assetCode.slice(0, 2)}
          </span>
        </div>;
    }
  };

  const formatPartialBalance = (fullBalance: string) => {
    if (showFullBalance) return formatBalance(fullBalance);
    
    const num = parseFloat(fullBalance);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    } else {
      return formatBalance(fullBalance);
    }
  };

  const getBalanceChange = (assetCode: string) => {
    // This would be implemented with historical balance data
    // For now, return placeholder values
    if (assetCode === 'WATT') {
      return { amount: '5.2%', trend: 'up' as const };
    } else if (assetCode === 'XLM') {
      return { amount: '2.1%', trend: 'down' as const };
    }
    return null;
  };

  const copyBalance = async (balance: string) => {
    await navigator.clipboard.writeText(balance);
    // Could show a toast notification here
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex flex-col items-center justify-center py-8">
          <Info className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Failed to Load Balance
          </h3>
          <p className="text-sm text-gray-600 text-center">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const wattBalance = getWATTBalance();
  const xlmBalance = getXLMBalance();
  const otherAssets = getOtherAssets();

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Portfolio Balance
        </h2>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFullBalance(!showFullBalance)}
            className="p-2"
          >
            {showFullBalance ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.reload()}
            disabled={isLoading}
            className="p-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && balance.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-gray-600">Loading balance...</p>
        </div>
      ) : (
        /* Balance Content */
        <div className="p-6 space-y-6">
          {/* WATT Balance - Primary Asset */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getAssetIcon('WATT')}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">WATT</h3>
                  <p className="text-sm text-gray-600">Energy Token</p>
                </div>
              </div>
              
              <div className="text-right">
                {getBalanceChange('WATT') && (
                  <div className="flex items-center gap-1 text-sm">
                    {getBalanceChange('WATT')?.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={
                      getBalanceChange('WATT')?.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }>
                      {getBalanceChange('WATT')?.amount}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-900">
                {formatPartialBalance(wattBalance)}
              </p>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyBalance(wattBalance)}
                className="p-2"
              >
                Copy
              </Button>
            </div>
            
            {showAssetDetails && (
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Available</p>
                    <p className="font-medium text-gray-900">
                      {formatBalance(wattBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Reserved</p>
                    <p className="font-medium text-gray-900">0 WATT</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* XLM Balance */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getAssetIcon('XLM')}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">XLM</h3>
                  <p className="text-sm text-gray-600">Native Asset</p>
                </div>
              </div>
              
              <div className="text-right">
                {getBalanceChange('XLM') && (
                  <div className="flex items-center gap-1 text-sm">
                    {getBalanceChange('XLM')?.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={
                      getBalanceChange('XLM')?.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }>
                      {getBalanceChange('XLM')?.amount}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-900">
                {formatPartialBalance(xlmBalance)}
              </p>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyBalance(xlmBalance)}
                className="p-2"
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Other Assets */}
          {otherAssets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Other Assets
              </h3>
              <div className="space-y-3">
                {otherAssets.map((asset) => (
                  <div
                    key={`${asset.asset_code}-${asset.asset_issuer}`}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      {getAssetIcon(asset.asset_code)}
                      <div>
                        <p className="font-medium text-gray-900">
                          {asset.asset_code}
                        </p>
                        {asset.asset_issuer && (
                          <p className="text-xs text-gray-500">
                            {formatAddress(asset.asset_issuer)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatPartialBalance(asset.balance)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyBalance(asset.balance)}
                        className="p-2"
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Value */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Total Portfolio Value
            </h3>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {/* This would calculate actual USD value */}
                $12,456.78
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Estimated USD value
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceDisplay;
