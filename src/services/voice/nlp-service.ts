import { TradingCommand } from '@/types/voice';

export class NLPService {
  private static instance: NLPService;
  
  private patterns = [
    {
      intent: 'BUY',
      regex: /(?:buy|purchase|get)\s+(\d+(?:\.\d+)?)\s+([a-zA-Z0-9]+)(?:\s+at\s+(\d+(?:\.\d+)?))?/i,
      handler: (match: RegExpMatchArray): Partial<TradingCommand> => ({
        intent: 'BUY',
        amount: parseFloat(match[1]),
        pair: match[2].toUpperCase(),
        price: match[3] ? parseFloat(match[3]) : undefined,
      })
    },
    {
      intent: 'SELL',
      regex: /(?:sell|liquidate|dump)\s+(\d+(?:\.\d+)?)\s+([a-zA-Z0-9]+)(?:\s+at\s+(\d+(?:\.\d+)?))?/i,
      handler: (match: RegExpMatchArray): Partial<TradingCommand> => ({
        intent: 'SELL',
        amount: parseFloat(match[1]),
        pair: match[2].toUpperCase(),
        price: match[3] ? parseFloat(match[3]) : undefined,
      })
    },
    {
      intent: 'STATUS',
      regex: /(?:check|get|what is|show)\s+(?:my\s+)?(?:status|position|balance|orders)/i,
      handler: (): Partial<TradingCommand> => ({
        intent: 'STATUS',
      })
    },
    {
      intent: 'PRICE_CHECK',
      regex: /(?:what is the\s+)?price of\s+([a-zA-Z0-9]+)/i,
      handler: (match: RegExpMatchArray): Partial<TradingCommand> => ({
        intent: 'PRICE_CHECK',
        pair: match[1].toUpperCase(),
      })
    },
    {
      intent: 'CANCEL',
      regex: /(?:cancel|stop|remove)\s+(?:all\s+)?(?:orders|order|trade)/i,
      handler: (): Partial<TradingCommand> => ({
        intent: 'CANCEL',
      })
    }
  ];

  private constructor() {}

  public static getInstance(): NLPService {
    if (!NLPService.instance) {
      NLPService.instance = new NLPService();
    }
    return NLPService.instance;
  }

  public async parseCommand(text: string): Promise<TradingCommand | null> {
    const startTime = performance.now();
    const cleanText = text.trim().toLowerCase();

    for (const pattern of this.patterns) {
      const match = cleanText.match(pattern.regex);
      if (match) {
        const result = pattern.handler(match);
        const processingTime = performance.now() - startTime;
        
        return {
          ...result,
          confidence: 0.98, // Mocked confidence
          originalText: text,
          entities: result as any,
          intent: pattern.intent as any,
        } as TradingCommand;
      }
    }

    return null;
  }

  // Support for 100+ phrases can be achieved by adding more patterns or using a more sophisticated model.
  // For this implementation, we'll focus on core trading intents.
}

export const nlpService = NLPService.getInstance();
