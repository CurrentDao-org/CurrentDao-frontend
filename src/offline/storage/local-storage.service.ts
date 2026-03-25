export interface OfflineTransaction {
  id: string
  type: 'BUY' | 'SELL'
  amount: number
  price: number
  timestamp: number
  status: 'PENDING' | 'SYNCED' | 'FAILED'
  error?: string
}

const STORAGE_KEY = 'currentdao_offline_trades'
const MAX_QUEUE_SIZE = 1000

export class LocalStorageService {
  public static getQueue(): OfflineTransaction[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  public static saveQueue(queue: OfflineTransaction[]) {
    if (typeof window === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue.slice(0, MAX_QUEUE_SIZE)))
  }

  public static addTransaction(transaction: Omit<OfflineTransaction, 'status' | 'timestamp'>): OfflineTransaction {
    const queue = this.getQueue()
    const newTransaction: OfflineTransaction = {
      ...transaction,
      status: 'PENDING',
      timestamp: Date.now(),
    }
    
    // Add to start of queue
    const updatedQueue = [newTransaction, ...queue].slice(0, MAX_QUEUE_SIZE)
    this.saveQueue(updatedQueue)
    return newTransaction
  }

  public static updateTransaction(id: string, updates: Partial<OfflineTransaction>) {
    const queue = this.getQueue()
    const updatedQueue = queue.map((t) => (t.id === id ? { ...t, ...updates } : t))
    this.saveQueue(updatedQueue)
  }

  public static removeTransaction(id: string) {
    const queue = this.getQueue()
    const updatedQueue = queue.filter((t) => t.id !== id)
    this.saveQueue(updatedQueue)
  }

  public static clearQueue() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
  }

  public static getPendingTransactions(): OfflineTransaction[] {
    return this.getQueue().filter((t) => t.status === 'PENDING')
  }
}
