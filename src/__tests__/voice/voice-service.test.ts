import { voiceService } from '@/services/voice/voice-service';

describe('VoiceService', () => {
  it('should process voice input correctly', async () => {
    const text = 'Buy 100 BTC';
    const language = 'en-US';
    const result = await voiceService.processVoiceInput(text, language);
    
    expect(result.command?.intent).toBe('BUY');
    expect(result.verification.verified).toBe(true);
    expect(result.processingTime).toBeGreaterThan(0);
  });

  it('should log and return analytics summary', async () => {
    const text = 'Sell 50 ETH';
    const language = 'en-US';
    await voiceService.processVoiceInput(text, language);
    
    const summary = voiceService.getAnalyticsSummary();
    expect(summary.totalCommands).toBeGreaterThan(0);
    expect(summary.successRate).toBeGreaterThan(0);
  });
});
