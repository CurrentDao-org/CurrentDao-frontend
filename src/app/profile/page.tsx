'use client';

import { useState } from 'react';
import { User, Settings, Bell, Shield, Upload, ArrowLeft } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { ProfileOverview } from '@/components/profile/ProfileOverview';
import { AccountSettings } from '@/components/profile/AccountSettings';
import { TradingPreferences } from '@/components/profile/TradingPreferences';
import { NotificationSettings } from '@/components/profile/NotificationSettings';
import { SecuritySettings } from '@/components/profile/SecuritySettings';
import { AvatarUpload } from '@/components/profile/AvatarUpload';

type TabType = 'overview' | 'account' | 'trading' | 'notifications' | 'security';

export default function ProfilePage() {
  const { 
    state, 
    updateProfile, 
    updateAccountSettings, 
    updateTradingPreferences, 
    updateNotificationPreferences, 
    updateSecuritySettings, 
    uploadAvatar, 
    changePassword, 
    enableTwoFactor, 
    disableTwoFactor, 
    revokeSession, 
    revokeApiKey, 
    createApiKey, 
    refreshProfile 
  } = useProfile();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'account', label: 'Account Settings', icon: Settings },
    { id: 'trading', label: 'Trading Preferences', icon: Upload },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ] as const;

  const handleEditProfile = () => {
    setActiveTab('account');
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const avatarUrl = await uploadAvatar(file);
      return avatarUrl;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw error;
    }
  };

  if (state.isLoading && !state.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (state.error && !state.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">{state.error}</p>
            <button
              onClick={refreshProfile}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Profile Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your account, preferences, and security settings
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && state.profile && state.stats && (
            <div className="space-y-6">
              <ProfileOverview
                profile={state.profile}
                stats={state.stats}
                onEdit={handleEditProfile}
              />
              
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setShowAvatarUpload(true)}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                  >
                    <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="font-medium text-gray-900 dark:text-white">Update Avatar</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Change profile picture</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('account')}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                  >
                    <Settings className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                    <p className="font-medium text-gray-900 dark:text-white">Edit Profile</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update personal info</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('trading')}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                  >
                    <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                    <p className="font-medium text-gray-900 dark:text-white">Trading Settings</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Configure preferences</p>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('security')}
                    className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                  >
                    <Shield className="w-6 h-6 text-red-600 dark:text-red-400 mb-2" />
                    <p className="font-medium text-gray-900 dark:text-white">Security</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Manage security</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Settings Tab */}
          {activeTab === 'account' && state.accountSettings && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AccountSettings
                  settings={state.accountSettings}
                  onUpdate={updateAccountSettings}
                  isLoading={state.isUpdating}
                />
              </div>
              <div>
                <AvatarUpload
                  currentAvatar={state.profile?.avatar}
                  onUpload={handleAvatarUpload}
                  isLoading={state.isUpdating}
                />
              </div>
            </div>
          )}

          {/* Trading Preferences Tab */}
          {activeTab === 'trading' && state.tradingPreferences && (
            <TradingPreferences
              preferences={state.tradingPreferences}
              onUpdate={updateTradingPreferences}
              isLoading={state.isUpdating}
            />
          )}

          {/* Notification Settings Tab */}
          {activeTab === 'notifications' && state.notificationPreferences && (
            <NotificationSettings
              preferences={state.notificationPreferences}
              onUpdate={updateNotificationPreferences}
              isLoading={state.isUpdating}
            />
          )}

          {/* Security Settings Tab */}
          {activeTab === 'security' && state.securitySettings && (
            <SecuritySettings
              settings={state.securitySettings}
              onUpdate={updateSecuritySettings}
              onPasswordChange={changePassword}
              onTwoFactorToggle={(enabled, method) => 
                enabled ? enableTwoFactor(method || 'authenticator') : disableTwoFactor()
              }
              onSessionRevoke={revokeSession}
              onApiKeyRevoke={revokeApiKey}
              onApiKeyCreate={createApiKey}
              isLoading={state.isUpdating}
            />
          )}
        </div>

        {/* Avatar Upload Modal */}
        {showAvatarUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update Avatar
                </h3>
                <button
                  onClick={() => setShowAvatarUpload(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ×
                </button>
              </div>
              <AvatarUpload
                currentAvatar={state.profile?.avatar}
                onUpload={async (file) => {
                  try {
                    await handleAvatarUpload(file);
                    setShowAvatarUpload(false);
                  } catch (error) {
                    console.error('Avatar upload failed:', error);
                  }
                }}
                isLoading={state.isUpdating}
              />
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {state.isUpdating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-900 dark:text-white">Updating...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
