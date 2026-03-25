import { LocalStorageService, OfflineTransaction } from '../storage/local-storage.service'

describe('LocalStorageService', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should add a transaction to the queue', () => {
    const trade = { type: 'BUY' as const, amount: 10, price: 0.08, id: '1' }
    LocalStorageService.addTransaction(trade)
    const queue = LocalStorageService.getQueue()
    expect(queue).toHaveLength(1)
    expect(queue[0].id).toBe('1')
    expect(queue[0].status).toBe('PENDING')
  })

  it('should respect MAX_QUEUE_SIZE', () => {
    for (let i = 0; i < 1100; i++) {
      LocalStorageService.addTransaction({ type: 'BUY', amount: i, price: 1, id: `t${i}` })
    }
    const queue = LocalStorageService.getQueue()
    expect(queue.length).toBeLessThanOrEqual(1000)
  })

  it('should update a transaction status', () => {
    const trade = { type: 'SELL' as const, amount: 5, price: 0.1, id: '2' }
    LocalStorageService.addTransaction(trade)
    LocalStorageService.updateTransaction('2', { status: 'SYNCED' })
    const queue = LocalStorageService.getQueue()
    expect(queue[0].status).toBe('SYNCED')
  })

  it('should remove a transaction', () => {
    LocalStorageService.addTransaction({ type: 'BUY', amount: 1, price: 1, id: '3' })
    LocalStorageService.removeTransaction('3')
    expect(LocalStorageService.getQueue()).toHaveLength(0)
  })
})
