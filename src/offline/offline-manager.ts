import { NetworkMonitor } from './monitoring/network-monitor'
import { LocalStorageService, OfflineTransaction } from './storage/local-storage.service'
import { OfflineValidator } from './validation/offline-validator'
import { SyncService } from './sync/sync-service'

export class OfflineManager {
  private static instance: OfflineManager
  private networkMonitor: NetworkMonitor

  private constructor() {
    this.networkMonitor = NetworkMonitor.getInstance()
    this.networkMonitor.subscribe((status) => {
      if (status === 'online') {
        this.startSync()
      }
    })
  }

  public static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager()
    }
    return OfflineManager.instance
  }

  public async addTrade(trade: { type: 'BUY' | 'SELL'; amount: number; price: number }) {
    const id = `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const transaction: Partial<OfflineTransaction> = { ...trade, id }

    const validation = OfflineValidator.validate(transaction)
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid trade data')
    }

    LocalStorageService.addTransaction(transaction as OfflineTransaction)

    if (this.networkMonitor.isOnline()) {
      await this.startSync()
    }
  }

  public async startSync() {
    if (this.networkMonitor.isOnline()) {
      await SyncService.sync()
    }
  }

  public getQueue() {
    return LocalStorageService.getQueue()
  }

  public clearQueue() {
    LocalStorageService.clearQueue()
  }
}
