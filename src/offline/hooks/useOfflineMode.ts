import { useState, useEffect, useCallback } from 'react'
import { NetworkMonitor, NetworkStatus } from '../monitoring/network-monitor'
import { OfflineManager } from '../offline-manager'
import { OfflineTransaction } from '../storage/local-storage.service'

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [queue, setQueue] = useState<OfflineTransaction[]>([])
  const offlineManager = OfflineManager.getInstance()
  const networkMonitor = NetworkMonitor.getInstance()

  useEffect(() => {
    setIsOnline(networkMonitor.isOnline())
    setQueue(offlineManager.getQueue())

    const unsubscribe = networkMonitor.subscribe((status) => {
      setIsOnline(status === 'online')
    })

    // Poll for queue changes (simple approach for this task)
    const interval = setInterval(() => {
      setQueue(offlineManager.getQueue())
    }, 1000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const addTrade = useCallback(async (trade: { type: 'BUY' | 'SELL'; amount: number; price: number }) => {
    await offlineManager.addTrade(trade)
    setQueue(offlineManager.getQueue())
  }, [])

  const startSync = useCallback(async () => {
    await offlineManager.startSync()
  }, [])

  const pendingCount = queue.filter((t) => t.status === 'PENDING').length
  const failedCount = queue.filter((t) => t.status === 'FAILED').length

  return {
    isOnline,
    queue,
    pendingCount,
    failedCount,
    addTrade,
    startSync,
  }
}
