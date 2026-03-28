import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Zap, 
  Car, 
  Home, 
  Smartphone, 
  Utensils,
  Trash2,
  Edit2,
  Eye,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { useCarbonTracking } from '../../hooks/useCarbonTracking';
import { 
  CarbonEmission, 
  EmissionSource, 
  EmissionCategory,
  CarbonCalculationRequest,
  CarbonCalculationResult 
} from '../../types/carbon';

interface CarbonTrackerProps {
  userId: string;
}

export const CarbonTracker: React.FC<CarbonTrackerProps> = ({ userId }) => {
  const { 
    state, 
    filter, 
    setFilter, 
    addEmission, 
    updateEmission, 
    deleteEmission, 
    calculateEmissions,
    exportData 
  } = useCarbonTracking({ userId });

  const [showCalculator, setShowCalculator] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmission, setEditingEmission] = useState<CarbonEmission | null>(null);
  const [calculationRequest, setCalculationRequest] = useState<CarbonCalculationRequest>({
    source: EmissionSource.ELECTRICITY,
    category: EmissionCategory.SCOPE2,
    amount: 0,
    unit: 'kWh'
  });
  const [calculationResult, setCalculationResult] = useState<CarbonCalculationResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmissions = state.emissions.filter(emission => {
    if (searchTerm && !emission.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filter.source && emission.source !== filter.source) return false;
    if (filter.category && emission.category !== filter.category) return false;
    if (filter.dateRange) {
      const emissionDate = new Date(emission.date);
      if (emissionDate < filter.dateRange.start || emissionDate > filter.dateRange.end) {
        return false;
      }
    }
    return true;
  });

  const getSourceIcon = (source: EmissionSource) => {
    switch (source) {
      case EmissionSource.ELECTRICITY:
        return <Zap className="h-5 w-5" />;
      case EmissionSource.TRANSPORTATION:
        return <Car className="h-5 w-5" />;
      case EmissionSource.GAS:
        return <Home className="h-5 w-5" />;
      case EmissionSource.DIGITAL:
        return <Smartphone className="h-5 w-5" />;
      case EmissionSource.FOOD:
        return <Utensils className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const getSourceColor = (source: EmissionSource) => {
    switch (source) {
      case EmissionSource.ELECTRICITY:
        return 'text-blue-600 bg-blue-50';
      case EmissionSource.TRANSPORTATION:
        return 'text-red-600 bg-red-50';
      case EmissionSource.GAS:
        return 'text-orange-600 bg-orange-50';
      case EmissionSource.DIGITAL:
        return 'text-purple-600 bg-purple-50';
      case EmissionSource.FOOD:
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getCategoryColor = (category: EmissionCategory) => {
    switch (category) {
      case EmissionCategory.SCOPE1:
        return 'text-red-600 bg-red-50';
      case EmissionCategory.SCOPE2:
        return 'text-yellow-600 bg-yellow-50';
      case EmissionCategory.SCOPE3:
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleCalculate = async () => {
    const result = await calculateEmissions(calculationRequest);
    if (result) {
      setCalculationResult(result);
    }
  };

  const handleAddEmission = async (emission: Omit<CarbonEmission, 'id' | 'createdAt' | 'updatedAt'>) => {
    const success = await addEmission(emission);
    if (success) {
      setShowAddForm(false);
      setEditingEmission(null);
    }
  };

  const handleUpdateEmission = async (emission: Omit<CarbonEmission, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingEmission) return;
    
    const success = await updateEmission(editingEmission.id, emission);
    if (success) {
      setEditingEmission(null);
    }
  };

  const handleDeleteEmission = async (id: string) => {
    if (confirm('Are you sure you want to delete this emission record?')) {
      await deleteEmission(id);
    }
  };

  const renderCalculator = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Carbon Emissions Calculator</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emission Source
            </label>
            <select
              value={calculationRequest.source}
              onChange={(e) => setCalculationRequest({
                ...calculationRequest,
                source: e.target.value as EmissionSource
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(EmissionSource).map(source => (
                <option key={source} value={source}>
                  {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={calculationRequest.category}
              onChange={(e) => setCalculationRequest({
                ...calculationRequest,
                category: e.target.value as EmissionCategory
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(EmissionCategory).map(category => (
                <option key={category} value={category}>
                  Scope {category.slice(-1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              value={calculationRequest.amount}
              onChange={(e) => setCalculationRequest({
                ...calculationRequest,
                amount: parseFloat(e.target.value) || 0
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit
            </label>
            <input
              type="text"
              value={calculationRequest.unit}
              onChange={(e) => setCalculationRequest({
                ...calculationRequest,
                unit: e.target.value
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="kWh, miles, kg, etc."
            />
          </div>
        </div>

        <button
          onClick={handleCalculate}
          disabled={calculationRequest.amount <= 0}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <Calculator className="h-4 w-4 mr-2" />
          Calculate Emissions
        </button>

        {calculationResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Calculation Result</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Carbon Emissions:</span>
                <span className="font-semibold text-green-900">
                  {calculationResult.emissions.toFixed(2)} kg CO2e
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-green-700">Confidence:</span>
                <span className="font-semibold text-green-900">
                  {(calculationResult.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div className="text-xs text-green-600 mt-2">
                <p className="font-medium">Methodology:</p>
                <p>{calculationResult.methodology}</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                handleAddEmission({
                  userId,
                  source: calculationRequest.source,
                  category: calculationRequest.category,
                  amount: calculationResult.emissions,
                  unit: 'kg CO2e',
                  description: `Calculated from ${calculationRequest.amount} ${calculationRequest.unit}`,
                  date: new Date()
                });
                setCalculationResult(null);
                setCalculationRequest({
                  source: EmissionSource.ELECTRICITY,
                  category: EmissionCategory.SCOPE2,
                  amount: 0,
                  unit: 'kWh'
                });
              }}
              className="mt-3 w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add to Emissions
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderEmissionForm = (isEdit: boolean = false) => {
    const emission = editingEmission || {
      userId,
      source: EmissionSource.ELECTRICITY,
      category: EmissionCategory.SCOPE2,
      amount: 0,
      unit: 'kg CO2e',
      description: '',
      date: new Date()
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isEdit ? 'Edit Emission' : 'Add Emission'}
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Source
              </label>
              <select
                value={emission.source}
                onChange={(e) => setEditingEmission({
                  ...emission,
                  source: e.target.value as EmissionSource
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(EmissionSource).map(source => (
                  <option key={source} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={emission.category}
                onChange={(e) => setEditingEmission({
                  ...emission,
                  category: e.target.value as EmissionCategory
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(EmissionCategory).map(category => (
                  <option key={category} value={category}>
                    Scope {category.slice(-1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={emission.amount}
                onChange={(e) => setEditingEmission({
                  ...emission,
                  amount: parseFloat(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={emission.unit}
                onChange={(e) => setEditingEmission({
                  ...emission,
                  unit: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="kg CO2e, kWh, miles, etc."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={emission.description}
              onChange={(e) => setEditingEmission({
                ...emission,
                description: e.target.value
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the emission source and context"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={emission.date.toISOString().split('T')[0]}
              onChange={(e) => setEditingEmission({
                ...emission,
                date: new Date(e.target.value)
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              setShowAddForm(false);
              setEditingEmission(null);
            }}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => isEdit ? handleUpdateEmission(emission) : handleAddEmission(emission)}
            disabled={!emission.description || emission.amount <= 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isEdit ? 'Update' : 'Add'} Emission
          </button>
        </div>
      </div>
    );
  };

  const renderEmissionCard = (emission: CarbonEmission) => (
    <div key={emission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getSourceColor(emission.source)}`}>
            {getSourceIcon(emission.source)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{emission.description}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSourceColor(emission.source)}`}>
                {emission.source.charAt(0).toUpperCase() + emission.source.slice(1).replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(emission.category)}`}>
                Scope {emission.category.slice(-1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEditingEmission(emission)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDeleteEmission(emission.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Emissions</p>
          <p className="text-lg font-semibold text-gray-900">
            {emission.amount.toFixed(2)} {emission.unit}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Date</p>
          <p className="text-lg font-semibold text-gray-900">
            {emission.date.toLocaleDateString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Impact</p>
          <div className="flex items-center">
            {emission.amount > 100 ? (
              <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              emission.amount > 100 ? 'text-red-600' : 'text-green-600'
            }`}>
              {emission.amount > 100 ? 'High' : 'Low'}
            </span>
          </div>
        </div>
      </div>

      {emission.location && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Location:</span> {emission.location}
        </div>
      )}
    </div>
  );

  const renderSummary = () => {
    const totalEmissions = filteredEmissions.reduce((sum, e) => sum + e.amount, 0);
    const scope1Emissions = filteredEmissions.filter(e => e.category === EmissionCategory.SCOPE1).reduce((sum, e) => sum + e.amount, 0);
    const scope2Emissions = filteredEmissions.filter(e => e.category === EmissionCategory.SCOPE2).reduce((sum, e) => sum + e.amount, 0);
    const scope3Emissions = filteredEmissions.filter(e => e.category === EmissionCategory.SCOPE3).reduce((sum, e) => sum + e.amount, 0);

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emissions Summary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Total Emissions</span>
            <span className="text-xl font-bold text-gray-900">
              {totalEmissions.toFixed(2)} kg CO2e
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-600">Scope 1 (Direct)</span>
              <span className="font-medium text-red-900">
                {scope1Emissions.toFixed(2)} kg CO2e
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-600">Scope 2 (Indirect)</span>
              <span className="font-medium text-yellow-900">
                {scope2Emissions.toFixed(2)} kg CO2e
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600">Scope 3 (Other)</span>
              <span className="font-medium text-blue-900">
                {scope3Emissions.toFixed(2)} kg CO2e
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => exportData('emissions', 'csv')}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Emissions Data
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Carbon Emissions Tracker</h2>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              showCalculator 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Emission
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search emissions..."
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={filter.source || ''}
            onChange={(e) => setFilter({ ...filter, source: e.target.value as EmissionSource || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sources</option>
            {Object.values(EmissionSource).map(source => (
              <option key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
          
          <select
            value={filter.category || ''}
            onChange={(e) => setFilter({ ...filter, category: e.target.value as EmissionCategory || undefined })}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {Object.values(EmissionCategory).map(category => (
              <option key={category} value={category}>
                Scope {category.slice(-1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(showCalculator || showAddForm || editingEmission) && (
        <div className="mb-6">
          {showCalculator && renderCalculator()}
          {showAddForm && renderEmissionForm()}
          {editingEmission && renderEmissionForm(true)}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredEmissions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Emissions Recorded</h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your carbon footprint by adding your first emission record.
                </p>
                <button
                  onClick={() => setShowCalculator(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Use Calculator
                </button>
              </div>
            ) : (
              filteredEmissions.map(renderEmissionCard)
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          {renderSummary()}
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Records</span>
                <span className="font-medium text-gray-900">{filteredEmissions.length}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Average per Record</span>
                <span className="font-medium text-gray-900">
                  {filteredEmissions.length > 0 
                    ? (filteredEmissions.reduce((sum, e) => sum + e.amount, 0) / filteredEmissions.length).toFixed(2)
                    : '0'} kg CO2e
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Highest Emission</span>
                <span className="font-medium text-gray-900">
                  {filteredEmissions.length > 0 
                    ? Math.max(...filteredEmissions.map(e => e.amount)).toFixed(2)
                    : '0'} kg CO2e
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
