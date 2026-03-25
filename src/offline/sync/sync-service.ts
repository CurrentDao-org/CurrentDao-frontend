import { LocalStorageService, OfflineTransaction } from '../storage/local-storage.service'

export class SyncService {
  private static isSyncing = false

  public static async sync() {
    if (this.isSyncing) return
    this.isSyncing = true

    const pending = LocalStorageService.getPendingTransactions()
    
    // Sort by timestamp for sequential processing
    const sorted = [...pending].sort((a, b) => a.timestamp - b.timestamp)

    for (const transaction of sorted) {
      try {
        await this.processTransaction(transaction)
        LocalStorageService.updateTransaction(transaction.id, { status: 'SYNCED' })
      } catch (error) {
        console.error(`Failed to sync transaction ${transaction.id}:`, error)
        LocalStorageService.updateTransaction(transaction.id, { 
          status: 'FAILED', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    this.isSyncing = false
  }

  private static async processTransaction(transaction: OfflineTransaction) {
    // Mock API call - in a real app, this would be an axios/fetch call to the backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Randomly fail to simulate network issues or backend validation errors
        if (Math.random() > 0.1) {
          console.log(`Successfully synced transaction ${transaction.id}`)
          resolve(true)
        } else {
          reject(new Error('Backend validation failed or network error during sync'))
        }
      }, 500)
    })
  }

  public static async resolveConflict(transactionId: string, resolution: 'RETRY' | 'DISCARD') {
    if (resolution === 'RETRY') {
      LocalStorageService.updateTransaction(transactionId, { status: 'PENDING', error: undefined })
      await this.sync()
    } else {
      LocalStorageService.removeTransaction(transactionId)
    }
  }
}
