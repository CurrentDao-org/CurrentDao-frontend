'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  ProfileState,
  ProfileContextType,
  UserProfile,
  UserStats,
  AccountSettings,
  TradingPreferences,
  NotificationPreferences,
  SecuritySettings,
  ApiKey,
  ValidationError
} from '@/types/profile';

const initialState: ProfileState = {
  profile: null,
  stats: null,
  accountSettings: null,
  tradingPreferences: null,
  notificationPreferences: null,
  securitySettings: null,
  isLoading: false,
  error: null,
  isUpdating: false,
};

// Mock data for development - replace with actual API calls
const mockProfile: UserProfile = {
  id: '1',
  email: 'user@currentdao.io',
  name: 'John Doe',
  username: 'johndoe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe',
  bio: 'Renewable energy enthusiast and DAO participant',
  location: 'San Francisco, CA',
  website: 'https://johndoe.io',
  joinDate: '2023-01-15T00:00:00Z',
  lastActive: '2024-03-27T10:30:00Z',
  isVerified: true,
  reputation: 850,
  level: 'advanced',
};

const mockStats: UserStats = {
  totalTrades: 156,
  successfulTrades: 148,
  totalVolume: '125000',
  averageRating: 4.8,
  totalReviews: 42,
  energySaved: '25000',
  co2Offset: '15000',
  daoParticipation: 12,
};

const mockAccountSettings: AccountSettings = {
  email: 'user@currentdao.io',
  name: 'John Doe',
  username: 'johndoe',
  bio: 'Renewable energy enthusiast and DAO participant',
  location: 'San Francisco, CA',
  website: 'https://johndoe.io',
  timezone: 'America/Los_Angeles',
  language: 'en',
  currency: 'USD',
};

const mockTradingPreferences: TradingPreferences = {
  defaultEnergyType: 'solar',
  locationRadius: 50,
  autoAcceptTrades: false,
  minimumRating: 4.0,
  priceAlerts: true,
  tradeNotifications: true,
  preferredPaymentMethod: 'stellar',
  maxTradeAmount: '10000',
  minTradeAmount: '100',
};

const mockNotificationPreferences: NotificationPreferences = {
  email: {
    enabled: true,
    trades: true,
    messages: true,
    proposals: true,
    payments: true,
    security: true,
    marketing: false,
  },
  push: {
    enabled: true,
    trades: true,
    messages: true,
    proposals: false,
    payments: true,
    security: true,
  },
  inApp: {
    enabled: true,
    trades: true,
    messages: true,
    proposals: true,
    payments: true,
    security: true,
    system: true,
  },
};

const mockSecuritySettings: SecuritySettings = {
  twoFactorEnabled: false,
  twoFactorMethod: 'authenticator',
  phoneNumber: '+1234567890',
  lastPasswordChange: '2024-01-15T00:00:00Z',
  activeSessions: [
    {
      id: '1',
      device: 'Chrome on Windows',
      browser: 'Chrome 120.0',
      location: 'San Francisco, CA',
      ipAddress: '192.168.1.1',
      lastActive: '2024-03-27T10:30:00Z',
      isCurrent: true,
    },
  ],
  apiKeys: [],
  loginAlerts: true,
  withdrawalWhitelist: [],
};

export function useProfile(): ProfileContextType {
  const [state, setState] = useState<ProfileState>(initialState);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setUpdating = useCallback((updating: boolean) => {
    setState(prev => ({ ...prev, isUpdating: updating }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const refreshProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        profile: mockProfile,
        stats: mockStats,
        accountSettings: mockAccountSettings,
        tradingPreferences: mockTradingPreferences,
        notificationPreferences: mockNotificationPreferences,
        securitySettings: mockSecuritySettings,
      }));
      
      toast.success('Profile loaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!state.profile) return;
    
    setUpdating(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
      }));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, [state.profile, setUpdating, setError]);

  const updateAccountSettings = useCallback(async (settings: Partial<AccountSettings>) => {
    if (!state.accountSettings) return;
    
    setUpdating(true);
    setError(null);
    
    try {
      // Validate email format
      if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
        throw new Error('Invalid email format');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        accountSettings: prev.accountSettings ? { ...prev.accountSettings, ...settings } : null,
      }));
      
      toast.success('Account settings updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update account settings';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, [state.accountSettings, setUpdating, setError]);

  const updateTradingPreferences = useCallback(async (preferences: Partial<TradingPreferences>) => {
    if (!state.tradingPreferences) return;
    
    setUpdating(true);
    setError(null);
    
    try {
      // Validate preferences
      if (preferences.locationRadius !== undefined && (preferences.locationRadius < 1 || preferences.locationRadius > 1000)) {
        throw new Error('Location radius must be between 1 and 1000 km');
      }
      
      if (preferences.minimumRating !== undefined && (preferences.minimumRating < 0 || preferences.minimumRating > 5)) {
        throw new Error('Minimum rating must be between 0 and 5');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        tradingPreferences: prev.tradingPreferences ? { ...prev.tradingPreferences, ...preferences } : null,
      }));
      
      toast.success('Trading preferences updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update trading preferences';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, [state.tradingPreferences, setUpdating, setError]);

  const updateNotificationPreferences = useCallback(async (preferences: Partial<NotificationPreferences>) => {
    if (!state.notificationPreferences) return;
    
    setUpdating(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        notificationPreferences: prev.notificationPreferences ? { ...prev.notificationPreferences, ...preferences } : null,
      }));
      
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update notification preferences';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, [state.notificationPreferences, setUpdating, setError]);

  const updateSecuritySettings = useCallback(async (settings: Partial<SecuritySettings>) => {
    if (!state.securitySettings) return;
    
    setUpdating(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        securitySettings: prev.securitySettings ? { ...prev.securitySettings, ...settings } : null,
      }));
      
      toast.success('Security settings updated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update security settings';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, [state.securitySettings, setUpdating, setError]);

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    setUpdating(true);
    setError(null);
    
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
      
      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, avatar: avatarUrl } : null,
      }));
      
      toast.success('Avatar uploaded successfully');
      return avatarUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload avatar';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [setUpdating, setError]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setUpdating(true);
    setError(null);
    
    try {
      // Validate passwords
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }
      
      if (currentPassword === newPassword) {
        throw new Error('New password must be different from current password');
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        securitySettings: prev.securitySettings 
          ? { ...prev.securitySettings, lastPasswordChange: new Date().toISOString() }
          : null,
      }));
      
      toast.success('Password changed successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [setUpdating, setError]);

  const enableTwoFactor = useCallback(async (method: 'sms' | 'email' | 'authenticator') => {
    setUpdating(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        securitySettings: prev.securitySettings 
          ? { ...prev.securitySettings, twoFactorEnabled: true, twoFactorMethod: method }
          : null,
      }));
      
      toast.success('Two-factor authentication enabled');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable two-factor authentication';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [setUpdating, setError]);

  const disableTwoFactor = useCallback(async () => {
    setUpdating(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        securitySettings: prev.securitySettings 
          ? { ...prev.securitySettings, twoFactorEnabled: false }
          : null,
      }));
      
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disable two-factor authentication';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [setUpdating, setError]);

  const revokeSession = useCallback(async (sessionId: string) => {
    if (!state.securitySettings) return;
    
    setUpdating(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        securitySettings: prev.securitySettings 
          ? {
              ...prev.securitySettings,
              activeSessions: prev.securitySettings.activeSessions.filter(s => s.id !== sessionId)
            }
          : null,
      }));
      
      toast.success('Session revoked successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to revoke session';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, [state.securitySettings, setUpdating, setError]);

  const revokeApiKey = useCallback(async (keyId: string) => {
    if (!state.securitySettings) return;
    
    setUpdating(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setState(prev => ({
        ...prev,
        securitySettings: prev.securitySettings 
          ? {
              ...prev.securitySettings,
              apiKeys: prev.securitySettings.apiKeys.filter(k => k.id !== keyId)
            }
          : null,
      }));
      
      toast.success('API key revoked successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to revoke API key';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, [state.securitySettings, setUpdating, setError]);

  const createApiKey = useCallback(async (name: string, permissions: ('read' | 'write' | 'trade')[]): Promise<ApiKey> => {
    setUpdating(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newApiKey: ApiKey = {
        id: Date.now().toString(),
        name,
        key: `ck_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        permissions,
        createdAt: new Date().toISOString(),
        isActive: true,
      };
      
      setState(prev => ({
        ...prev,
        securitySettings: prev.securitySettings 
          ? {
              ...prev.securitySettings,
              apiKeys: [...prev.securitySettings.apiKeys, newApiKey]
            }
          : null,
      }));
      
      toast.success('API key created successfully');
      return newApiKey;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create API key';
      setError(errorMessage);
      toast.error(errorMessage);
      throw error;
    } finally {
      setUpdating(false);
    }
  }, [setUpdating, setError]);

  // Load profile data on mount
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return {
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
    refreshProfile,
  };
}
