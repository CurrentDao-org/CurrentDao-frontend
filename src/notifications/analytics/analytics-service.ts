import type { PushResult } from '@/notifications/types'

export type AnalyticsEventKind = 'delivery' | 'open' | 'conversion'

export interface AnalyticsEvent {
  kind: AnalyticsEventKind
  notificationId: string
  userId: string
  timestamp: string
  /** Milliseconds from send/delivery intent to this event (for &lt;5s delivery validation). */
  latencyMs: number
  action?: string
}

export interface AnalyticsMetrics {
  deliveryRate: number
  openRate: number
  conversionRate: number
  averageDeliveryLatencyMs: number
}

export interface NotificationReport {
  notificationId: string
  deliveries: number
  opens: number
  conversions: number
  events: AnalyticsEvent[]
}

const STORAGE_KEY = 'currentdao-notification-analytics-events'

/**
 * Client-side analytics with swappable persistence (localStorage today, API later).
 */
export class NotificationAnalyticsService {
  private memory: AnalyticsEvent[] = []

  private readAll(): AnalyticsEvent[] {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          return JSON.parse(raw) as AnalyticsEvent[]
        }
      }
    } catch {
      /* ignore */
    }
    return [...this.memory]
  }

  private writeAll(events: AnalyticsEvent[]): void {
    this.memory = events
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
      }
    } catch {
      /* ignore */
    }
  }

  private append(event: AnalyticsEvent): PushResult<void> {
    try {
      const all = this.readAll()
      all.push(event)
      this.writeAll(all)
      return { ok: true, data: undefined }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'append failed'
      return { ok: false, error: message }
    }
  }

  /**
   * Records a successful push delivery (client or worker acknowledged receipt).
   */
  trackDelivery(
    notificationId: string,
    userId: string,
    timestamp: string,
    latencyMs: number,
  ): PushResult<void> {
    return this.append({
      kind: 'delivery',
      notificationId,
      userId,
      timestamp,
      latencyMs,
    })
  }

  /**
   * Records that the user opened or focused the notification surface.
   */
  trackOpen(notificationId: string, userId: string, timestamp: string, latencyMs: number): PushResult<void> {
    return this.append({
      kind: 'open',
      notificationId,
      userId,
      timestamp,
      latencyMs,
    })
  }

  /**
   * Records a downstream conversion (vote, deposit, CTA, etc.).
   */
  trackConversion(
    notificationId: string,
    userId: string,
    action: string,
    timestamp: string,
    latencyMs: number,
  ): PushResult<void> {
    return this.append({
      kind: 'conversion',
      notificationId,
      userId,
      timestamp,
      latencyMs,
      action,
    })
  }

  /**
   * Aggregated KPIs; filter narrows by `userId` or `notificationId` when provided.
   */
  getMetrics(filter?: { userId?: string; notificationId?: string }): AnalyticsMetrics {
    const events = this.readAll().filter((e) => {
      if (filter?.userId && e.userId !== filter.userId) return false
      if (filter?.notificationId && e.notificationId !== filter.notificationId) return false
      return true
    })
    const deliveries = events.filter((e) => e.kind === 'delivery')
    const opens = events.filter((e) => e.kind === 'open')
    const conversions = events.filter((e) => e.kind === 'conversion')
    const denom = Math.max(1, deliveries.length)
    const openRate = opens.length / denom
    const conversionRate = conversions.length / denom
    const averageDeliveryLatencyMs =
      deliveries.length ?
        deliveries.reduce((s, e) => s + e.latencyMs, 0) / deliveries.length
      : 0
    return {
      deliveryRate: deliveries.length > 0 ? 1 : 0,
      openRate,
      conversionRate,
      averageDeliveryLatencyMs,
    }
  }

  /**
   * Per-notification funnel view for ops / QA.
   */
  getNotificationReport(notificationId: string): NotificationReport {
    const events = this.readAll().filter((e) => e.notificationId === notificationId)
    return {
      notificationId,
      deliveries: events.filter((e) => e.kind === 'delivery').length,
      opens: events.filter((e) => e.kind === 'open').length,
      conversions: events.filter((e) => e.kind === 'conversion').length,
      events,
    }
  }

  /** Test helper — clears backing store. */
  _resetForTests(): void {
    this.memory = []
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(STORAGE_KEY)
      }
    } catch {
      /* ignore */
    }
  }
}

export const notificationAnalyticsService = new NotificationAnalyticsService()
