import { OfflineValidator } from '../validation/offline-validator'

describe('OfflineValidator', () => {
  it('should validate correct trades', () => {
    const result = OfflineValidator.validate({
      id: '1',
      type: 'BUY',
      amount: 10,
      price: 0.08
    })
    expect(result.isValid).toBe(true)
  })

  it('should fail if amount is 0 or negative', () => {
    expect(OfflineValidator.validate({ id: '1', type: 'BUY', amount: 0, price: 1 }).isValid).toBe(false)
    expect(OfflineValidator.validate({ id: '1', type: 'BUY', amount: -1, price: 1 }).isValid).toBe(false)
  })

  it('should fail if price is 0 or negative', () => {
    expect(OfflineValidator.validate({ id: '1', type: 'BUY', amount: 1, price: 0 }).isValid).toBe(false)
  })

  it('should fail if ID is missing', () => {
    expect(OfflineValidator.validate({ type: 'BUY', amount: 1, price: 1 } as any).isValid).toBe(false)
  })
})
