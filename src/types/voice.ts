export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export interface VoiceCommand {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  originalText: string;
}

export interface VoiceState {
  status: VoiceStatus;
  lastCommand?: VoiceCommand;
  error?: string;
  isSupported: boolean;
  language: string;
}

export interface VoiceAnalytics {
  commandId: string;
  timestamp: number;
  intent: string;
  success: boolean;
  processingTime: number;
  confidence: number;
  language: string;
}

export interface VoiceSecurityVerification {
  verified: boolean;
  confidence: number;
  method: 'voiceprint' | 'passphrase';
  timestamp: number;
}

export interface TradingCommand extends VoiceCommand {
  intent: 'BUY' | 'SELL' | 'CANCEL' | 'STATUS' | 'PRICE_CHECK';
  pair?: string;
  amount?: number;
  price?: number;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];
