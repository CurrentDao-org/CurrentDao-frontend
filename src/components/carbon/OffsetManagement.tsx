import React, { useState } from 'react';
import { 
  Plus, 
  ShoppingCart, 
  Leaf, 
  TreePine, 
  Sun, 
  Wind, 
  Factory, 
  Droplets, 
  Award,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Download,
  Filter,
  Search,
  Calendar,
  CreditCard,
  Shield,
  Info
} from 'lucide-react';
import { useCarbonTracking } from '../../hooks/useCarbonTracking';
import { 
  CarbonOffset, 
  OffsetProvider, 
  OffsetType, 
  MarketplaceListing,
  CarbonCredit,
  OffsetStatus 
} from '../../types/carbon';

interface OffsetManagementProps {
  userId: string;
}

export const OffsetManagement: React.FC<OffsetManagementProps> = ({ userId }) => {
  const { 
    state, 
    loadOffsets, 
    purchaseOffset, 
    retireOffset, 
    getAvailableCredits,
    purchaseCredit,
    exportData 
  } = useCarbonTracking({ userId });

  const [showMarketplace, setShowMarketplace] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<MarketplaceListing | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvider, setFilterProvider] = useState<OffsetProvider | 'all'>('all');
  const [filterType, setFilterType] = useState<OffsetType | 'all'>('all');
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const filteredOffsets = state.offsets.filter(offset => {
    if (searchTerm && !offset.projectName.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterProvider !== 'all' && offset.provider !== filterProvider) return false;
    if (filterType !== 'all' && offset.type !== filterType) return false;
    return true;
  });

  const getProviderIcon = (provider: OffsetProvider) => {
    switch (provider) {
      case OffsetProvider.GOLD_STANDARD:
        return <Award className="h-5 w-5" />;
      case OffsetProvider.VERRA:
        return <CheckCircle className="h-5 w-5" />;
      case OffsetProvider.CLIMATEWORKS:
        return <Leaf className="h-5 w-5" />;
      case OffsetProvider.NATURE_CONSERVANCY:
        return <TreePine className="h-5 w-5" />;
      case OffsetProvider.SOUTH_POLE:
        return <Sun className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getProviderColor = (provider: OffsetProvider) => {
    switch (provider) {
      case OffsetProvider.GOLD_STANDARD:
        return 'text-yellow-600 bg-yellow-50';
      case OffsetProvider.VERRA:
        return 'text-blue-600 bg-blue-50';
      case OffsetProvider.CLIMATEWORKS:
        return 'text-green-600 bg-green-50';
      case OffsetProvider.NATURE_CONSERVANCY:
        return 'text-emerald-600 bg-emerald-50';
      case OffsetProvider.SOUTH_POLE:
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type: OffsetType) => {
    switch (type) {
      case OffsetType.REFORESTATION:
        return <TreePine className="h-5 w-5" />;
      case OffsetType.RENEWABLE_ENERGY:
        return <Sun className="h-5 w-5" />;
      case OffsetType.ENERGY_EFFICIENCY:
        return <Zap className="h-5 w-5" />;
      case OffsetType.METHANE_CAPTURE:
        return <Factory className="h-5 w-5" />;
      case OffsetType.CARBON_CAPTURE:
        return <Filter className="h-5 w-5" />;
      case OffsetType.BIOCHAR:
        return <Leaf className="h-5 w-5" />;
      case OffsetType.SOIL_CARBON:
        return <Droplets className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: OffsetType) => {
    switch (type) {
      case OffsetType.REFORESTATION:
        return 'text-green-600 bg-green-50';
      case OffsetType.RENEWABLE_ENERGY:
        return 'text-yellow-600 bg-yellow-50';
      case OffsetType.ENERGY_EFFICIENCY:
        return 'text-blue-600 bg-blue-50';
      case OffsetType.METHANE_CAPTURE:
        return 'text-purple-600 bg-purple-50';
      case OffsetType.CARBON_CAPTURE:
        return 'text-indigo-600 bg-indigo-50';
      case OffsetType.BIOCHAR:
        return 'text-emerald-600 bg-emerald-50';
      case OffsetType.SOIL_CARBON:
        return 'text-teal-600 bg-teal-50';
      case OffsetType.BLUE_CARBON:
        return 'text-cyan-600 bg-cyan-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: OffsetStatus) => {
    switch (status) {
      case OffsetStatus.ACTIVE:
        return 'text-green-600 bg-green-50';
      case OffsetStatus.EXPIRED:
        return 'text-red-600 bg-red-50';
      case OffsetStatus.PENDING:
        return 'text-yellow-600 bg-yellow-50';
      case OffsetStatus.RETIRED:
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handlePurchaseOffset = async (offsetData: Omit<CarbonOffset, 'id' | 'purchasedAt'>) => {
    const success = await purchaseOffset(offsetData);
    if (success) {
      setShowPurchaseForm(false);
    }
  };

  const handlePurchaseCredit = async (credit: MarketplaceListing, amount: number) => {
    const success = await purchaseCredit(credit.id, amount);
    if (success) {
      setShowMarketplace(false);
      setSelectedCredit(null);
    }
  };

  const handleRetireOffset = async (id: string) => {
    const success = await retireOffset(id);
    // Show success message
  };

  const renderOffsetCard = (offset: CarbonOffset) => {
    const daysUntilExpiry = offset.expiresAt 
      ? Math.ceil((offset.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <div key={offset.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getProviderColor(offset.provider)}`}>
              {getProviderIcon(offset.provider)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{offset.projectName}</h4>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProviderColor(offset.provider)}`}>
                  {offset.provider.replace('_', ' ').charAt(0).toUpperCase() + offset.provider.slice(1)}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(offset.type)}`}>
                  {offset.type.replace('_', ' ').charAt(0).toUpperCase() + offset.type.slice(1)}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(offset.status)}`}>
                  {offset.status.charAt(0).toUpperCase() + offset.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {offset.status === OffsetStatus.ACTIVE && (
              <button
                onClick={() => handleRetireOffset(offset.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retire
              </button>
            )}
            <button
              onClick={() => setShowDetails(showDetails === offset.id ? null : offset.id)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                {offset.amount.toFixed(2)} kg CO2e
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Price</p>
              <p className="text-lg font-semibold text-gray-900">
                ${offset.price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vintage</p>
              <p className="text-lg font-semibold text-gray-900">
                {offset.vintage}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Certification</span>
            <span className="font-medium text-gray-900">{offset.certification}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Location</span>
            <span className="font-medium text-gray-900">{offset.location}</span>
          </div>

          {offset.expiresAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Expires</span>
              <div className={`font-medium ${
                daysUntilExpiry && daysUntilExpiry < 30 ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {offset.expiresAt.toLocaleDateString()}
                {daysUntilExpiry && daysUntilExpiry < 30 && (
                  <span className="ml-2 text-orange-600">
                    ({daysUntilExpiry} days)
                  </span>
                )}
              </div>
            </div>
          )}

          {showDetails === offset.id && (
            <div className="pt-4 border-t border-gray-200 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Purchased</span>
                  <div className="font-medium text-gray-900">
                    {offset.purchasedAt.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Certificate</span>
                  <div className="font-medium text-gray-900">
                    {offset.certification}
                  </div>
                </div>
              </div>
              
              {offset.metadata && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Additional Details</h5>
                  <pre className="text-xs text-gray-600">
                    {JSON.stringify(offset.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMarketplaceCredit = (credit: MarketplaceListing) => {
    return (
      <div key={credit.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg ${getProviderColor(credit.credit.provider)}`}>
                {getProviderIcon(credit.credit.provider)}
              </div>
              <div>
                <h4 className="font-medium text-gray-900">{credit.credit.project}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {credit.credit.serialNumber}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(credit.credit.type)}`}>
                    {credit.credit.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${credit.pricePerCredit.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">per kg CO2e</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Available Amount</p>
              <p className="text-lg font-semibold text-gray-900">
                {credit.availableAmount.toFixed(2)} kg CO2e
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Minimum Purchase</p>
              <p className="text-lg font-semibold text-gray-900">
                {credit.minimumPurchase} kg CO2e
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Certification</span>
            <span className="font-medium text-gray-900">{credit.credit.certification}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Vintage</span>
            <span className="font-medium text-gray-900">{credit.credit.vintage}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Location</span>
            <span className="font-medium text-gray-900">{credit.credit.project}</span>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-800">
              <Info className="h-4 w-4" />
              <span>
                Minimum purchase: {credit.minimumPurchase} kg CO2e
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedCredit(credit)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Details
            </button>
            
            <button
              onClick={() => handlePurchaseCredit(credit, credit.minimumPurchase)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Purchase
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderOffsetsList = () => (
    <div className="space-y-4">
      {filteredOffsets.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Carbon Offsets</h3>
          <p className="text-gray-600 mb-6">
            Purchase carbon offsets to neutralize your emissions and support environmental projects.
          </p>
          <button
            onClick={() => setShowMarketplace(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        filteredEmissions.map(renderOffsetCard)
      )}
    </div>
  );

  const renderMarketplace = () => {
    const credits = state.credits.map(credit => ({
      id: `listing-${credit.id}`,
      credit,
      seller: 'seller-1',
      pricePerCredit: credit.price,
      minimumPurchase: 10,
      availableAmount: credit.amount,
      listingDate: new Date(),
      terms: 'Standard marketplace terms apply'
    }));

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Carbon Credit Marketplace</h3>
          
          <button
            onClick={() => setShowMarketplace(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value as OffsetProvider | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Providers</option>
              {Object.values(OffsetProvider).map(provider => (
                <option key={provider} value={provider}>
                  {provider.replace('_', ' ')}
                </option>
              ))}
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as OffsetType | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              {Object.values(OffsetType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {credits.map(renderMarketplaceCredit)}
        </div>
      </div>
    );
  };

  const renderPurchaseForm = () => {
    const newOffset = {
      userId,
      provider: OffsetProvider.GOLD_STANDARD,
      projectId: 'GS-1234',
      projectName: 'New Offset Project',
      amount: 100,
      price: 12.50,
      currency: 'USD',
      type: OffsetType.REFORESTATION,
      certification: 'Gold Standard',
      location: 'Brazil',
      vintage: 2024,
      status: 'active' as any
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Carbon Offset</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={newOffset.provider}
              >
                {Object.values(OffsetProvider).map(provider => (
                  <option key={provider} value={provider}>
                    {provider.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                defaultValue={newOffset.type}
              >
                {Object.values(OffsetType).map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (kg CO2e)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per kg CO2e ($)
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vintage Year
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="2024"
              min="2000"
              max={new Date().getFullYear()}
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => setShowPurchaseForm(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handlePurchaseOffset(newOffset)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Purchase Offset
          </button>
        </div>
      </div>
    );
  };

  const renderSummary = () => {
    const totalOffsetAmount = filteredOffsets.reduce((sum, offset) => sum + offset.amount, 0);
    const activeOffsets = filteredOffsets.filter(offset => offset.status === OffsetStatus.ACTIVE);
    const expiredOffsets = filteredOffsets.filter(offset => offset.status === OffsetStatus.EXPIRED);
    const totalValue = filteredOffsets.reduce((sum, offset) => sum + (offset.amount * offset.price), 0);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Offset Portfolio Summary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Offset Amount</span>
            <span className="text-xl font-bold text-green-600">
              {totalOffsetAmount.toFixed(2)} kg CO2e
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Value</span>
            <span className="text-xl font-bold text-gray-900">
              ${totalValue.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Active Offsets</span>
            <span className="text-xl font-bold text-green-600">
              {activeOffsets.length}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Expired Offsets</span>
            <span className="text-xl font-bold text-red-600">
              {expiredOffsets.length}
            </span>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => exportData('offsets', 'csv')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Offset Data
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Carbon Offset Management</h2>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMarketplace(!showMarketplace)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              showMarketplace 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Marketplace
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Purchase Offset
          </button>
        </div>
      </div>

      {(showMarketplace || showAddForm || editingEmission) && (
        <div className="mb-6">
          {showMarketplace && renderMarketplace()}
          {showAddForm && renderPurchaseForm()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {renderOffsetsList()}
        </div>
        
        <div className="space-y-6">
          {renderSummary()}
        </div>
      </div>
    </div>
  );
};
