'use client'

export type NetworkStatus = 'online' | 'offline'

export class NetworkMonitor {
  private static instance: NetworkMonitor
  private status: NetworkStatus = 'online'
  private listeners: ((status: NetworkStatus) => void)[] = []

  private constructor() {
    if (typeof window !== 'undefined') {
      this.status = navigator.onLine ? 'online' : 'offline'
      window.addEventListener('online', () => this.updateStatus('online'))
      window.addEventListener('offline', () => this.updateStatus('offline'))
    }
  }

  public static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor()
    }
    return NetworkMonitor.instance
  }

  public getStatus(): NetworkStatus {
    return this.status
  }

  public isOnline(): boolean {
    return this.status === 'online'
  }

  public subscribe(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  private updateStatus(status: NetworkStatus) {
    this.status = status
    this.listeners.forEach((l) => l(status))
  }
}
