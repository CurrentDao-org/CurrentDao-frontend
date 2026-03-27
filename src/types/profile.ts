export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinDate: string;
  lastActive: string;
  isVerified: boolean;
  reputation: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface UserStats {
  totalTrades: number;
  successfulTrades: number;
  totalVolume: string;
  averageRating: number;
  totalReviews: number;
  energySaved: string;
  co2Offset: string;
  daoParticipation: number;
}

export interface AccountSettings {
  email: string;
  name: string;
  username: string;
  bio?: string;
  location?: string;
  website?: string;
  timezone: string;
  language: string;
  currency: string;
}

export interface TradingPreferences {
  defaultEnergyType: 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass';
  locationRadius: number; // in kilometers
  autoAcceptTrades: boolean;
  minimumRating: number;
  priceAlerts: boolean;
  tradeNotifications: boolean;
  preferredPaymentMethod: 'stellar' | 'crypto' | 'fiat';
  maxTradeAmount: string;
  minTradeAmount: string;
}

export interface NotificationPreferences {
  email: {
    enabled: boolean;
    trades: boolean;
    messages: boolean;
    proposals: boolean;
    payments: boolean;
    security: boolean;
    marketing: boolean;
  };
  push: {
    enabled: boolean;
    trades: boolean;
    messages: boolean;
    proposals: boolean;
    payments: boolean;
    security: boolean;
  };
  inApp: {
    enabled: boolean;
    trades: boolean;
    messages: boolean;
    proposals: boolean;
    payments: boolean;
    security: boolean;
    system: boolean;
  };
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'sms' | 'email' | 'authenticator';
  phoneNumber?: string;
  lastPasswordChange: string;
  activeSessions: Session[];
  apiKeys: ApiKey[];
  loginAlerts: boolean;
  withdrawalWhitelist: string[];
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: ('read' | 'write' | 'trade')[];
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export interface ProfileState {
  profile: UserProfile | null;
  stats: UserStats | null;
  accountSettings: AccountSettings | null;
  tradingPreferences: TradingPreferences | null;
  notificationPreferences: NotificationPreferences | null;
  securitySettings: SecuritySettings | null;
  isLoading: boolean;
  error: string | null;
  isUpdating: boolean;
}

export interface ProfileContextType {
  state: ProfileState;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateAccountSettings: (settings: Partial<AccountSettings>) => Promise<void>;
  updateTradingPreferences: (preferences: Partial<TradingPreferences>) => Promise<void>;
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  enableTwoFactor: (method: 'sms' | 'email' | 'authenticator') => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeApiKey: (keyId: string) => Promise<void>;
  createApiKey: (name: string, permissions: ('read' | 'write' | 'trade')[]) => Promise<ApiKey>;
  refreshProfile: () => Promise<void>;
}

export interface AvatarUploadProps {
  currentAvatar?: string;
  onUpload: (avatarUrl: string) => void;
  isLoading?: boolean;
  className?: string;
}

export interface ProfileOverviewProps {
  profile: UserProfile;
  stats: UserStats;
  onEdit: () => void;
  className?: string;
}

export interface AccountSettingsProps {
  settings: AccountSettings;
  onUpdate: (settings: Partial<AccountSettings>) => void;
  isLoading?: boolean;
  className?: string;
}

export interface TradingPreferencesProps {
  preferences: TradingPreferences;
  onUpdate: (preferences: Partial<TradingPreferences>) => void;
  isLoading?: boolean;
  className?: string;
}

export interface NotificationSettingsProps {
  preferences: NotificationPreferences;
  onUpdate: (preferences: Partial<NotificationPreferences>) => void;
  isLoading?: boolean;
  className?: string;
}

export interface SecuritySettingsProps {
  settings: SecuritySettings;
  onUpdate: (settings: Partial<SecuritySettings>) => void;
  onPasswordChange: (currentPassword: string, newPassword: string) => void;
  onTwoFactorToggle: (enabled: boolean, method?: 'sms' | 'email' | 'authenticator') => void;
  onSessionRevoke: (sessionId: string) => void;
  onApiKeyRevoke: (keyId: string) => void;
  onApiKeyCreate: (name: string, permissions: ('read' | 'write' | 'trade')[]) => void;
  isLoading?: boolean;
  className?: string;
}

export interface FormFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

export interface ToggleFieldProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export interface SelectFieldProps {
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
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ProfileUpdateResult {
  success: boolean;
  error?: string;
  validationErrors?: ValidationError[];
}

export type EnergyType = 'solar' | 'wind' | 'hydro' | 'geothermal' | 'biomass';
export type NotificationChannel = 'email' | 'push' | 'inApp';
export type TwoFactorMethod = 'sms' | 'email' | 'authenticator';
export type Permission = 'read' | 'write' | 'trade';
