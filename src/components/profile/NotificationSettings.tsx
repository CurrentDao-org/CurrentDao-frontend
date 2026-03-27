'use client';

import { useState, useEffect } from 'react';
import { Save, Bell, Mail, Smartphone, Monitor, Shield, MessageSquare, CreditCard, TrendingUp } from 'lucide-react';
import { NotificationSettingsProps } from '@/types/profile';

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

// Channel section component
function NotificationChannel({ 
  title, 
  icon: Icon, 
  enabled, 
  onEnabledChange, 
  notifications, 
  onNotificationChange, 
  disabled = false, 
  color = 'blue' 
}: {
  title: string;
  icon: any;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  notifications: Record<string, boolean>;
  onNotificationChange: (type: string, enabled: boolean) => void;
  disabled?: boolean;
  color?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
  };

  const iconColorClasses = {
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400',
  };

  return (
    <div className={`rounded-lg border p-4 space-y-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${iconColorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>
        </div>
        <ToggleField
          label=""
          enabled={enabled}
          onChange={onEnabledChange}
          disabled={disabled}
        />
      </div>

      {enabled && (
        <div className="space-y-3 pl-14">
          <ToggleField
            label="Trade Notifications"
            description="Updates about your energy trades"
            enabled={notifications.trades}
            onChange={(value) => onNotificationChange('trades', value)}
            disabled={disabled}
          />
          <ToggleField
            label="Messages"
            description="New messages from other traders"
            enabled={notifications.messages}
            onChange={(value) => onNotificationChange('messages', value)}
            disabled={disabled}
          />
          <ToggleField
            label="Proposals"
            description="New DAO proposals and voting reminders"
            enabled={notifications.proposals}
            onChange={(value) => onNotificationChange('proposals', value)}
            disabled={disabled}
          />
          <ToggleField
            label="Payment Updates"
            description="Transaction confirmations and payment status"
            enabled={notifications.payments}
            onChange={(value) => onNotificationChange('payments', value)}
            disabled={disabled}
          />
          <ToggleField
            label="Security Alerts"
            description="Important security notifications"
            enabled={notifications.security}
            onChange={(value) => onNotificationChange('security', value)}
            disabled={disabled}
          />
          {notifications.marketing !== undefined && (
            <ToggleField
              label="Marketing Emails"
              description="Product updates and promotional content"
              enabled={notifications.marketing}
              onChange={(value) => onNotificationChange('marketing', value)}
              disabled={disabled}
            />
          )}
          {notifications.system !== undefined && (
            <ToggleField
              label="System Updates"
              description="Platform maintenance and updates"
              enabled={notifications.system}
              onChange={(value) => onNotificationChange('system', value)}
              disabled={disabled}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function NotificationSettings({ preferences, onUpdate, isLoading = false, className = '' }: NotificationSettingsProps) {
  const [formData, setFormData] = useState({
    email: { ...preferences.email },
    push: { ...preferences.push },
    inApp: { ...preferences.inApp },
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasFormChanges = 
      JSON.stringify(formData.email) !== JSON.stringify(preferences.email) ||
      JSON.stringify(formData.push) !== JSON.stringify(preferences.push) ||
      JSON.stringify(formData.inApp) !== JSON.stringify(preferences.inApp);
    setHasChanges(hasFormChanges);
  }, [formData, preferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await onUpdate(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
    }
  };

  const handleEmailChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      email: { ...prev.email, [field]: value }
    }));
  };

  const handlePushChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      push: { ...prev.push, [field]: value }
    }));
  };

  const handleInAppChange = (field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      inApp: { ...prev.inApp, [field]: value }
    }));
  };

  const handleEmailEnabledChange = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      email: { 
        ...prev.email, 
        enabled,
        // When disabling email, turn off all email notifications
        ...(enabled ? {} : {
          trades: false,
          messages: false,
          proposals: false,
          payments: false,
          security: false,
          marketing: false,
        })
      }
    }));
  };

  const handlePushEnabledChange = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      push: { 
        ...prev.push, 
        enabled,
        // When disabling push, turn off all push notifications
        ...(enabled ? {} : {
          trades: false,
          messages: false,
          proposals: false,
          payments: false,
          security: false,
        })
      }
    }));
  };

  const handleInAppEnabledChange = (enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      inApp: { 
        ...prev.inApp, 
        enabled,
        // When disabling in-app, turn off all in-app notifications
        ...(enabled ? {} : {
          trades: false,
          messages: false,
          proposals: false,
          payments: false,
          security: false,
          system: false,
        })
      }
    }));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Bell className="w-6 h-6" />
            <span>Notification Settings</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage how you receive notifications across different channels
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Notifications */}
        <NotificationChannel
          title="Email Notifications"
          icon={Mail}
          enabled={formData.email.enabled}
          onEnabledChange={handleEmailEnabledChange}
          notifications={formData.email}
          onNotificationChange={handleEmailChange}
          disabled={isLoading}
          color="blue"
        />

        {/* Push Notifications */}
        <NotificationChannel
          title="Push Notifications"
          icon={Smartphone}
          enabled={formData.push.enabled}
          onEnabledChange={handlePushEnabledChange}
          notifications={formData.push}
          onNotificationChange={handlePushChange}
          disabled={isLoading}
          color="green"
        />

        {/* In-App Notifications */}
        <NotificationChannel
          title="In-App Notifications"
          icon={Monitor}
          enabled={formData.inApp.enabled}
          onEnabledChange={handleInAppEnabledChange}
          notifications={formData.inApp}
          onNotificationChange={handleInAppChange}
          disabled={isLoading}
          color="purple"
        />

        {/* Notification Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Notification Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {Object.values(formData.email).filter(Boolean).length - 1}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Email Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Object.values(formData.push).filter(Boolean).length - 1}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Push Active</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {Object.values(formData.inApp).filter(Boolean).length - 1}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In-App Active</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: { enabled: true, trades: true, messages: true, proposals: true, payments: true, security: true, marketing: false },
                push: { enabled: true, trades: true, messages: true, proposals: false, payments: true, security: true },
                inApp: { enabled: true, trades: true, messages: true, proposals: true, payments: true, security: true, system: true },
              });
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enable Essential
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: { enabled: true, trades: true, messages: true, proposals: true, payments: true, security: true, marketing: true },
                push: { enabled: true, trades: true, messages: true, proposals: true, payments: true, security: true },
                inApp: { enabled: true, trades: true, messages: true, proposals: true, payments: true, security: true, system: true },
              });
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enable All
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                email: { enabled: false, trades: false, messages: false, proposals: false, payments: false, security: false, marketing: false },
                push: { enabled: false, trades: false, messages: false, proposals: false, payments: false, security: false },
                inApp: { enabled: false, trades: false, messages: false, proposals: false, payments: false, security: false, system: false },
              });
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Disable All
          </button>
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
