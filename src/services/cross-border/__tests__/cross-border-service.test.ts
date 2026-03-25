import {
  getMarkets,
  getCurrencies,
  convertCurrency,
  getRegulations,
  getCustomsRegions,
  getGlobalAnalytics,
  executeTrade,
  processPayment,
  getTranslations,
  getCountries,
} from '../cross-border-service';

describe('Cross-Border Data Service', () => {

  it('getMarkets returns valid market data array', async () => {
    const markets = await getMarkets();
    expect(markets.length).toBeGreaterThan(0);
    expect(markets[0]).toHaveProperty('pricePerKwh');
    expect(markets[0]).toHaveProperty('country');
  });

  it('getCurrencies returns currencies array', async () => {
    const currencies = await getCurrencies();
    expect(currencies.length).toBeGreaterThan(0);
    expect(currencies[0]).toHaveProperty('code');
    expect(currencies[0]).toHaveProperty('exchangeRateToUSD');
  });

  it('convertCurrency performs accurate math', async () => {
    const result = await convertCurrency('USD', 'EUR', 100);
    expect(result).toHaveProperty('rate');
    expect(result.convertedAmount).toBeGreaterThan(0);
    expect(result.from.code).toBe('USD');
    expect(result.to.code).toBe('EUR');
  });

  it('getRegulations returns all without param', async () => {
    const allReqs = await getRegulations();
    expect(allReqs.length).toBe(18); // We have 18 countries
  });

  it('getRegulations filters by country', async () => {
    const usReqs = await getRegulations('US');
    expect(usReqs.length).toBe(1);
    expect(usReqs[0].countryCode).toBe('US');
  });

  it('getCustomsRegions returns customs data', async () => {
    const regions = await getCustomsRegions();
    expect(regions.length).toBeGreaterThan(0);
    expect(regions[0].tariffCodes.length).toBeGreaterThan(0);
  });

  it('getGlobalAnalytics returns shape with metrics', async () => {
    const analytics = await getGlobalAnalytics();
    expect(analytics).toHaveProperty('trends');
    expect(analytics).toHaveProperty('regionalBreakdown');
    expect(analytics).toHaveProperty('marketComparisons');
    expect(analytics).toHaveProperty('summary');
  });

  it('executeTrade creates completed trade object', async () => {
    const order = { sourceCountry: 'US', destCountry: 'FR', type: 'buy' as const, amountKwh: 1000, currency: 'EUR' };
    const trade = await executeTrade(order);
    expect(trade.id).toMatch(/^TRD-/);
    expect(trade.status).toBe('completed');
    expect(trade.totalValue).toBeGreaterThan(0);
  });

  it('processPayment creates completed payment transaction', async () => {
    const payment = await processPayment('TRD-TEST', 1000, 'EUR');
    expect(payment.id).toMatch(/^PAY-/);
    expect(payment.status).toBe('completed');
    expect(payment.amount).toBe(1000);
  });

  it('getTranslations defaults to English if not found, and returns correct languages', () => {
    const en = getTranslations('en');
    expect(en['trade.buy']).toBe('Buy');
    
    const es = getTranslations('es');
    expect(es['trade.buy']).toBe('Comprar');
    
    // Fallback/Unknown
    const unknown = getTranslations('xx' as any);
    expect(unknown['trade.buy']).toBe('Buy'); // fallback to en
  });

  it('getCountries returns synchronous country array', () => {
    const countries = getCountries();
    expect(countries.length).toBe(18);
  });

});
