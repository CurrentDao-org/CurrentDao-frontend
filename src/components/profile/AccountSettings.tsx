'use client';

import { useState, useEffect } from 'react';
import { Save, User, Mail, Globe, MapPin, Calendar, Language, DollarSign } from 'lucide-react';
import { AccountSettingsProps, ValidationError } from '@/types/profile';

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
  className = '' 
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'url' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}) {
  const Component = type === 'textarea' ? 'textarea' : 'input';
  
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Component
        type={type === 'textarea' ? undefined : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={type === 'textarea' ? 3 : undefined}
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
  options: { value: string; label: string }[];
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
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
}

export function AccountSettings({ settings, onUpdate, isLoading = false, className = '' }: AccountSettingsProps) {
  const [formData, setFormData] = useState({
    email: settings.email,
    name: settings.name,
    username: settings.username,
    bio: settings.bio || '',
    location: settings.location || '',
    website: settings.website || '',
    timezone: settings.timezone,
    language: settings.language,
    currency: settings.currency,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Timezone options
  const timezoneOptions = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
  ];

  // Language options
  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'ja', label: '日本語' },
    { value: 'zh', label: '中文' },
  ];

  // Currency options
  const currencyOptions = [
    { value: 'USD', label: 'US Dollar ($)' },
    { value: 'EUR', label: 'Euro (€)' },
    { value: 'GBP', label: 'British Pound (£)' },
    { value: 'JPY', label: 'Japanese Yen (¥)' },
    { value: 'CNY', label: 'Chinese Yuan (¥)' },
  ];

  useEffect(() => {
    const hasFormChanges = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof typeof formData];
      const settingsValue = settings[key as keyof typeof settings];
      return formValue !== (settingsValue || '');
    });
    setHasChanges(hasFormChanges);
  }, [formData, settings]);

  const validateForm = (): ValidationError[] => {
    const validationErrors: ValidationError[] = [];

    // Email validation
    if (!formData.email) {
      validationErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      validationErrors.push({ field: 'email', message: 'Invalid email format' });
    }

    // Name validation
    if (!formData.name.trim()) {
      validationErrors.push({ field: 'name', message: 'Name is required' });
    } else if (formData.name.trim().length < 2) {
      validationErrors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    } else if (formData.name.trim().length > 50) {
      validationErrors.push({ field: 'name', message: 'Name must be less than 50 characters' });
    }

    // Username validation
    if (!formData.username.trim()) {
      validationErrors.push({ field: 'username', message: 'Username is required' });
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      validationErrors.push({ field: 'username', message: 'Username can only contain letters, numbers, and underscores' });
    } else if (formData.username.length < 3) {
      validationErrors.push({ field: 'username', message: 'Username must be at least 3 characters' });
    } else if (formData.username.length > 20) {
      validationErrors.push({ field: 'username', message: 'Username must be less than 20 characters' });
    }

    // Bio validation
    if (formData.bio && formData.bio.length > 500) {
      validationErrors.push({ field: 'bio', message: 'Bio must be less than 500 characters' });
    }

    // Website validation
    if (formData.website && formData.website.trim()) {
      try {
        new URL(formData.website);
      } catch {
        validationErrors.push({ field: 'website', message: 'Invalid website URL' });
      }
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
      console.error('Failed to update account settings:', error);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (value: string) => {
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
            <User className="w-6 h-6" />
            <span>Account Settings</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account information and preferences
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Email"
              value={formData.email}
              onChange={handleInputChange('email')}
              type="email"
              placeholder="your@email.com"
              required
              disabled={isLoading}
              error={errors.email}
              helperText="This email will be used for account notifications"
            />

            <FormField
              label="Name"
              value={formData.name}
              onChange={handleInputChange('name')}
              type="text"
              placeholder="John Doe"
              required
              disabled={isLoading}
              error={errors.name}
              helperText="Your full name as it will appear on your profile"
            />

            <FormField
              label="Username"
              value={formData.username}
              onChange={handleInputChange('username')}
              type="text"
              placeholder="johndoe"
              required
              disabled={isLoading}
              error={errors.username}
              helperText="Unique identifier for your profile URL"
            />

            <FormField
              label="Location"
              value={formData.location}
              onChange={handleInputChange('location')}
              type="text"
              placeholder="San Francisco, CA"
              disabled={isLoading}
              error={errors.location}
              helperText="Your city and country/region"
            />
          </div>

          <FormField
            label="Bio"
            value={formData.bio}
            onChange={handleInputChange('bio')}
            type="textarea"
            placeholder="Tell us about yourself and your interest in renewable energy..."
            disabled={isLoading}
            error={errors.bio}
            helperText="Brief description for your profile (max 500 characters)"
          />

          <FormField
            label="Website"
            value={formData.website}
            onChange={handleInputChange('website')}
            type="url"
            placeholder="https://yourwebsite.com"
            disabled={isLoading}
            error={errors.website}
            helperText="Your personal or professional website"
          />
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Timezone"
              value={formData.timezone}
              onChange={handleInputChange('timezone')}
              options={timezoneOptions}
              required
              disabled={isLoading}
              error={errors.timezone}
              helperText="Your local timezone"
            />

            <SelectField
              label="Language"
              value={formData.language}
              onChange={handleInputChange('language')}
              options={languageOptions}
              required
              disabled={isLoading}
              error={errors.language}
              helperText="Interface language"
            />

            <SelectField
              label="Currency"
              value={formData.currency}
              onChange={handleInputChange('currency')}
              options={currencyOptions}
              required
              disabled={isLoading}
              error={errors.currency}
              helperText="Default currency for transactions"
            />
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
