import { nlpService } from '@/services/voice/nlp-service';

describe('NLPService', () => {
  it('should parse BUY commands correctly', async () => {
    const text = 'Buy 100 BTC at 50000';
    const result = await nlpService.parseCommand(text);
    expect(result?.intent).toBe('BUY');
    expect(result?.amount).toBe(100);
    expect(result?.pair).toBe('BTC');
    expect(result?.price).toBe(50000);
  });

  it('should parse SELL commands correctly', async () => {
    const text = 'Sell 50 ETH';
    const result = await nlpService.parseCommand(text);
    expect(result?.intent).toBe('SELL');
    expect(result?.amount).toBe(50);
    expect(result?.pair).toBe('ETH');
    expect(result?.price).toBeUndefined();
  });

  it('should parse STATUS commands correctly', async () => {
    const text = 'Check my status';
    const result = await nlpService.parseCommand(text);
    expect(result?.intent).toBe('STATUS');
  });

  it('should parse PRICE_CHECK commands correctly', async () => {
    const text = 'What is the price of SOL?';
    const result = await nlpService.parseCommand(text);
    expect(result?.intent).toBe('PRICE_CHECK');
    expect(result?.pair).toBe('SOL');
  });

  it('should return null for unknown commands', async () => {
    const text = 'Hello world';
    const result = await nlpService.parseCommand(text);
    expect(result).toBeNull();
  });
});
