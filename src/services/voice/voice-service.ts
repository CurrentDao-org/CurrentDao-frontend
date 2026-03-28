import { VoiceAnalytics, TradingCommand, VoiceSecurityVerification } from '@/types/voice';
import { nlpService } from './nlp-service';

export class VoiceService {
  private static instance: VoiceService;
  private analytics: VoiceAnalytics[] = [];

  private constructor() {}

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public async processVoiceInput(text: string, language: string): Promise<{
    command: TradingCommand | null;
    verification: VoiceSecurityVerification;
    processingTime: number;
  }> {
    const startTime = performance.now();
    
    // 1. Security Verification (Mocked)
    const verification = await this.verifyVoice(text);
    if (!verification.verified) {
      throw new Error('Unauthorized voice access');
    }

    // 2. NLP Processing
    const command = await nlpService.parseCommand(text);

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    // 3. Log Analytics
    this.logAnalytics({
      commandId: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      intent: command?.intent || 'UNKNOWN',
      success: !!command,
      processingTime,
      confidence: command?.confidence || 0,
      language,
    });

    return { command, verification, processingTime };
  }

  private async verifyVoice(text: string): Promise<VoiceSecurityVerification> {
    // In a real application, this would analyze voice characteristics (voiceprint)
    // For this implementation, we'll simulate a high-confidence verification
    return {
      verified: true,
      confidence: 0.99,
      method: 'voiceprint',
      timestamp: Date.now(),
    };
  }

  private logAnalytics(entry: VoiceAnalytics) {
    this.analytics.push(entry);
    // Persist to storage or backend if needed
    console.log('[Voice Analytics]', entry);
  }

  public getAnalyticsSummary() {
    const total = this.analytics.length;
    const successful = this.analytics.filter(a => a.success).length;
    const avgProcessingTime = this.analytics.reduce((acc, a) => acc + a.processingTime, 0) / total || 0;

    return {
      totalCommands: total,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      averageProcessingTime: avgProcessingTime,
    };
  }
}

export const voiceService = VoiceService.getInstance();
