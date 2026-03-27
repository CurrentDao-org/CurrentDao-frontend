'use client';

import { useState, useEffect } from 'react';
import { Save, Zap, MapPin, DollarSign, Bell, Shield, TrendingUp } from 'lucide-react';
import { TradingPreferencesProps, ValidationError } from '@/types/profile';

// Form field component
function FormField({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  required = false, 
  disabled = false, 
  error, 
  helperText, 
  min, 
  max, 
  className = '' 
}: {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  min?: number;
  max?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={type === 'number' ? '0.1' : undefined}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}

// Select field component
function SelectField({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  required = false, 
  disabled = false, 
  error, 
  helperText, 
  className = '' 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
      >
        <option value="">{placeholder || 'Select an option'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

// Toggle field component
function ToggleField({ 
  label, 
  description, 
  enabled, 
  onChange, 
  disabled = false, 
  className = '' 
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export function TradingPreferences({ preferences, onUpdate, isLoading = false, className = '' }: TradingPreferencesProps) {
  const [formData, setFormData] = useState({
    defaultEnergyType: preferences.defaultEnergyType,
    locationRadius: preferences.locationRadius,
    autoAcceptTrades: preferences.autoAcceptTrades,
    minimumRating: preferences.minimumRating,
    priceAlerts: preferences.priceAlerts,
    tradeNotifications: preferences.tradeNotifications,
    preferredPaymentMethod: preferences.preferredPaymentMethod,
    maxTradeAmount: preferences.maxTradeAmount,
    minTradeAmount: preferences.minTradeAmount,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Energy type options
  const energyTypeOptions = [
    { value: 'solar', label: 'Solar Power', description: 'Energy from solar panels' },
    { value: 'wind', label: 'Wind Power', description: 'Energy from wind turbines' },
    { value: 'hydro', label: 'Hydro Power', description: 'Energy from water flow' },
    { value: 'geothermal', label: 'Geothermal', description: 'Energy from earth heat' },
    { value: 'biomass', label: 'Biomass', description: 'Energy from organic materials' },
  ];

  // Payment method options
  const paymentMethodOptions = [
    { value: 'stellar', label: 'Stellar (XLM)', description: 'Fast and low-cost blockchain payments' },
    { value: 'crypto', label: 'Cryptocurrency', description: 'Various cryptocurrencies' },
    { value: 'fiat', label: 'Fiat Currency', description: 'Traditional currencies' },
  ];

  useEffect(() => {
    const hasFormChanges = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof typeof formData];
      const prefValue = preferences[key as keyof typeof preferences];
      return formValue !== prefValue;
    });
    setHasChanges(hasFormChanges);
  }, [formData, preferences]);

  const validateForm = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    // Location radius validation
    if (formData.locationRadius < 1) {
      validationErrors.push({ field: 'locationRadius', message: 'Location radius must be at least 1 km' });
    } else if (formData.locationRadius > 1000) {
      validationErrors.push({ field: 'locationRadius', message: 'Location radius cannot exceed 1000 km' });
    }

    // Minimum rating validation
    if (formData.minimumRating < 0) {
      validationErrors.push({ field: 'minimumRating', message: 'Minimum rating cannot be negative' });
    } else if (formData.minimumRating > 5) {
      validationErrors.push({ field: 'minimumRating', message: 'Minimum rating cannot exceed 5' });
    }

    // Trade amount validation
    const maxAmount = parseFloat(formData.maxTradeAmount);
    const minAmount = parseFloat(formData.minTradeAmount);

    if (minAmount < 0) {
      validationErrors.push({ field: 'minTradeAmount', message: 'Minimum trade amount cannot be negative' });
    }

    if (maxAmount < 0) {
      validationErrors.push({ field: 'maxTradeAmount', message: 'Maximum trade amount cannot be negative' });
    }

    if (minAmount > maxAmount) {
      validationErrors.push({ field: 'minTradeAmount', message: 'Minimum trade amount cannot exceed maximum' });
    }

    return validationErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach(error => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    setErrors({});

    try {
      await onUpdate(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update trading preferences:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Zap className="w-6 h-6" />
            <span>Trading Preferences</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure your default trading settings and preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Energy Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Zap className="w-5 h-5" />
            <span>Energy Preferences</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Default Energy Type"
              value={formData.defaultEnergyType}
              onChange={handleInputChange('defaultEnergyType')}
              options={energyTypeOptions}
              required
              disabled={isLoading}
              error={errors.defaultEnergyType}
              helperText="Your preferred type of renewable energy"
            />

            <FormField
              label="Location Radius"
              value={formData.locationRadius}
              onChange={handleInputChange('locationRadius')}
              type="number"
              placeholder="50"
              required
              disabled={isLoading}
              error={errors.locationRadius}
              helperText="Maximum distance for energy trades (in kilometers)"
              min={1}
              max={1000}
            />
          </div>
        </div>

        {/* Trading Behavior */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Trading Behavior</span>
          </h3>
          <div className="space-y-4">
            <ToggleField
              label="Auto-accept Trades"
              description="Automatically accept trades that meet your criteria"
              enabled={formData.autoAcceptTrades}
              onChange={handleInputChange('autoAcceptTrades')}
              disabled={isLoading}
            />

            <FormField
              label="Minimum Rating"
              value={formData.minimumRating}
              onChange={handleInputChange('minimumRating')}
              type="number"
              placeholder="4.0"
              required
              disabled={isLoading}
              error={errors.minimumRating}
              helperText="Minimum trader rating you're willing to work with"
              min={0}
              max={5}
              step={0.1}
            />
          </div>
        </div>

        {/* Financial Settings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>Financial Settings</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Minimum Trade Amount"
              value={formData.minTradeAmount}
              onChange={handleInputChange('minTradeAmount')}
              type="number"
              placeholder="100"
              required
              disabled={isLoading}
              error={errors.minTradeAmount}
              helperText="Smallest amount you're willing to trade"
              min={0}
              step={0.01}
            />

            <FormField
              label="Maximum Trade Amount"
              value={formData.maxTradeAmount}
              onChange={handleInputChange('maxTradeAmount')}
              type="number"
              placeholder="10000"
              required
              disabled={isLoading}
              error={errors.maxTradeAmount}
              helperText="Largest amount you're willing to trade"
              min={0}
              step={0.01}
            />

            <SelectField
              label="Preferred Payment Method"
              value={formData.preferredPaymentMethod}
              onChange={handleInputChange('preferredPaymentMethod')}
              options={paymentMethodOptions}
              required
              disabled={isLoading}
              error={errors.preferredPaymentMethod}
              helperText="Your preferred payment method for trades"
            />
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
          </h3>
          <div className="space-y-4">
            <ToggleField
              label="Price Alerts"
              description="Get notified when energy prices change significantly"
              enabled={formData.priceAlerts}
              onChange={handleInputChange('priceAlerts')}
              disabled={isLoading}
            />

            <ToggleField
              label="Trade Notifications"
              description="Receive notifications for new trade opportunities"
              enabled={formData.tradeNotifications}
              onChange={handleInputChange('tradeNotifications')}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Risk Warning */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Trading Risk Notice
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Energy trading involves financial risk. Set conservative limits and never trade more than you can afford to lose. 
                Auto-accept trades may result in unexpected transactions.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="submit"
            disabled={isLoading || !hasChanges}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
