'use client';

import { useState } from 'react';
import { Save, Shield, Key, Smartphone, Mail, Clock, Trash2, Copy, Eye, EyeOff, Plus, AlertTriangle } from 'lucide-react';
import { SecuritySettingsProps } from '@/types/profile';
import { formatDistanceToNow } from 'date-fns';

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
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type={type === 'password' && !showPassword ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
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

export function SecuritySettings({ 
  settings, 
  onUpdate, 
  onPasswordChange, 
  onTwoFactorToggle, 
  onSessionRevoke, 
  onApiKeyRevoke, 
  onApiKeyCreate, 
  isLoading = false, 
  className = '' 
}: SecuritySettingsProps) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [newApiKey, setNewApiKey] = useState({
    name: '',
    permissions: [] as ('read' | 'write' | 'trade')[],
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: Record<string, string> = {};

    // Validation
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});

    try {
      await onPasswordChange(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const handleTwoFactorToggle = () => {
    if (settings.twoFactorEnabled) {
      onTwoFactorToggle(false);
    } else {
      // In a real app, this would open a modal to select method
      onTwoFactorToggle(true, 'authenticator');
    }
  };

  const handleApiKeyCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newApiKey.name.trim()) {
      return;
    }

    if (newApiKey.permissions.length === 0) {
      return;
    }

    try {
      await onApiKeyCreate(newApiKey.name, newApiKey.permissions);
      setNewApiKey({ name: '', permissions: [] });
      setShowApiKeyForm(false);
    } catch (error) {
      console.error('API key creation failed:', error);
    }
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'read':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'write':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'trade':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>Security Settings</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account security and access controls
          </p>
        </div>
      </div>

      {/* Password Change */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(value) => setPasswordForm(prev => ({ ...prev, currentPassword: value }))}
              type="password"
              placeholder="Enter current password"
              required
              disabled={isLoading}
              error={passwordErrors.currentPassword}
            />
            <FormField
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(value) => setPasswordForm(prev => ({ ...prev, newPassword: value }))}
              type="password"
              placeholder="Enter new password"
              required
              disabled={isLoading}
              error={passwordErrors.newPassword}
              helperText="Must be at least 8 characters"
            />
            <FormField
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(value) => setPasswordForm(prev => ({ ...prev, confirmPassword: value }))}
              type="password"
              placeholder="Confirm new password"
              required
              disabled={isLoading}
              error={passwordErrors.confirmPassword}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Change Password
          </button>
        </form>
      </div>

      {/* Two-Factor Authentication */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Two-Factor Authentication
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3">
                <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {settings.twoFactorEnabled 
                      ? `Using ${settings.twoFactorMethod}` 
                      : 'Add an extra layer of security to your account'
                    }
                  </p>
                </div>
              </div>
            </div>
            <ToggleField
              label=""
              enabled={settings.twoFactorEnabled}
              onChange={handleTwoFactorToggle}
              disabled={isLoading}
            />
          </div>
          {settings.twoFactorEnabled && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Last configured: {formatDistanceToNow(new Date(settings.lastPasswordChange), { addSuffix: true })}</p>
            </div>
          )}
        </div>
      </div>

      {/* Active Sessions */}
      <div className="border-b pb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Sessions
        </h3>
        <div className="space-y-3">
          {settings.activeSessions.map((session) => (
            <div key={session.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {session.device}
                      {session.isCurrent && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {session.browser} • {session.location}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Last active {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}</span>
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => onSessionRevoke(session.id)}
                    disabled={isLoading}
                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            API Keys
          </h3>
          <button
            onClick={() => setShowApiKeyForm(!showApiKeyForm)}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Create API Key</span>
          </button>
        </div>

        {/* Create API Key Form */}
        {showApiKeyForm && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <form onSubmit={handleApiKeyCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newApiKey.name}
                  onChange={(e) => setNewApiKey(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Trading Bot"
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'read', label: 'Read', description: 'View account data and transactions' },
                    { value: 'write', label: 'Write', description: 'Modify account settings' },
                    { value: 'trade', label: 'Trade', description: 'Execute energy trades' },
                  ].map((permission) => (
                    <label key={permission.value} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={newApiKey.permissions.includes(permission.value as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewApiKey(prev => ({
                              ...prev,
                              permissions: [...prev.permissions, permission.value as any]
                            }));
                          } else {
                            setNewApiKey(prev => ({
                              ...prev,
                              permissions: prev.permissions.filter(p => p !== permission.value)
                            }));
                          }
                        }}
                        disabled={isLoading}
                        className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {permission.label}
                        </span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {permission.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading || newApiKey.permissions.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Key
                </button>
                <button
                  type="button"
                  onClick={() => setShowApiKeyForm(false)}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing API Keys */}
        <div className="space-y-3">
          {settings.apiKeys.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No API keys created yet</p>
              <p className="text-sm">Create an API key to access your account programmatically</p>
            </div>
          ) : (
            settings.apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {apiKey.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Created {formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true })}
                      {apiKey.lastUsed && (
                        <span> • Last used {formatDistanceToNow(new Date(apiKey.lastUsed), { addSuffix: true })}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                      disabled={isLoading}
                      className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {copiedKey === apiKey.id ? (
                        <div className="w-4 h-4 bg-green-600 rounded" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onApiKeyRevoke(apiKey.id)}
                      disabled={isLoading}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {apiKey.permissions.map((permission) => (
                    <span
                      key={permission}
                      className={`px-2 py-1 text-xs rounded-full ${getPermissionColor(permission)}`}
                    >
                      {permission}
                    </span>
                  ))}
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    apiKey.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    {apiKey.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="mt-2 font-mono text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
                  {apiKey.key.substring(0, 8)}••••••••••••••••{apiKey.key.substring(apiKey.key.length - 4)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Security Best Practices
            </h4>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
              <li>• Use a strong, unique password for your account</li>
              <li>• Enable two-factor authentication for added security</li>
              <li>• Regularly review and revoke unused API keys</li>
              <li>• Monitor your active sessions and log out from unknown devices</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
