import type {
  DeliveryOptions,
  NotificationPayload,
  ScheduledNotificationRecord,
} from '@/notifications/types'
import type { PushResult } from '@/notifications/types'

/** Mock hourly open-rate weights (0–1) for intelligent scheduling when no backend exists. */
const DEFAULT_HOURLY_ENGAGEMENT: number[] = [
  0.05, 0.04, 0.04, 0.04, 0.04, 0.05, 0.12, 0.18, 0.22, 0.24, 0.26, 0.27, 0.28, 0.26, 0.25, 0.24, 0.23,
  0.25, 0.28, 0.3, 0.29, 0.22, 0.14, 0.08,
]

const LOW_ENGAGEMENT_HOURS = { start: 2, end: 6 }

function randomId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `sched-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * Picks the optimal instant inside `[now, now + windowHours]` using `timezone` for hour-of-day checks.
 */
export function getOptimalDeliveryTimeInternal(
  userId: string,
  now: Date,
  timezone: string,
  windowHours: number,
  hourlyEngagement: number[] = DEFAULT_HOURLY_ENGAGEMENT,
): Date {
  void userId
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hourCycle: 'h23',
  })

  let best: { at: Date; score: number } | null = null
  const end = now.getTime() + windowHours * 60 * 60 * 1000

  for (let t = now.getTime(); t <= end; t += 15 * 60 * 1000) {
    const at = new Date(t)
    const hour = Number(formatter.formatToParts(at).find((p) => p.type === 'hour')?.value ?? '12')
    if (hour >= LOW_ENGAGEMENT_HOURS.start && hour < LOW_ENGAGEMENT_HOURS.end) {
      continue
    }
    const score = hourlyEngagement[hour] ?? 0.1
    if (!best || score > best.score) {
      best = { at, score }
    }
  }

  if (!best) {
    for (let t = now.getTime(); t <= end; t += 15 * 60 * 1000) {
      const at = new Date(t)
      const hour = Number(formatter.formatToParts(at).find((p) => p.type === 'hour')?.value ?? '12')
      const score = hourlyEngagement[hour] ?? 0.1
      if (!best || score > best.score) {
        best = { at, score }
      }
    }
  }

  return best?.at ?? new Date(now.getTime() + 60 * 60 * 1000)
}

export type ScheduleDispatchFn = (payload: NotificationPayload) => Promise<unknown>

export interface NotificationSchedulerOptions {
  /** Hours ahead for intelligent optimization (default 4). */
  intelligentWindowHours?: number
  dispatch?: ScheduleDispatchFn
  now?: () => Date
}

/**
 * Client-side scheduler queue. For production, mirror the same records server-side.
 */
export class NotificationScheduler {
  private queue: Map<string, ScheduledNotificationRecord> = new Map()

  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map()

  private readonly intelligentWindowHours: number

  private readonly dispatch: ScheduleDispatchFn

  private readonly clock: () => Date

  constructor(options: NotificationSchedulerOptions = {}) {
    this.intelligentWindowHours = options.intelligentWindowHours ?? 4
    this.dispatch =
      options.dispatch ??
      (async () => {
        /* default no-op */
      })
    this.clock = options.now ?? (() => new Date())
  }

  /**
   * When `intelligent` is true, replaces `scheduledAt` with {@link getOptimalDeliveryTime}.
   */
  async scheduleNotification(
    notification: NotificationPayload,
    deliveryOptions: DeliveryOptions,
    userId?: string,
  ): Promise<PushResult<ScheduledNotificationRecord>> {
    try {
      let effective = deliveryOptions.scheduledAt
      if (deliveryOptions.intelligent) {
        const optimal = this.getOptimalDeliveryTime(userId ?? 'anonymous')
        effective = optimal.toISOString()
      }
      const rec: ScheduledNotificationRecord = {
        id: randomId(),
        notification,
        deliveryOptions: { ...deliveryOptions, scheduledAt: effective },
        userId,
        effectiveScheduledAt: effective,
        createdAt: this.clock().toISOString(),
      }
      this.queue.set(rec.id, rec)
      const delay = Math.max(0, new Date(effective).getTime() - this.clock().getTime())
      const handle = setTimeout(() => {
        void this.dispatch(rec.notification).finally(() => {
          this.queue.delete(rec.id)
          this.timers.delete(rec.id)
        })
      }, delay)
      this.timers.set(rec.id, handle)
      return { ok: true, data: rec }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'scheduleNotification failed'
      return { ok: false, error: message }
    }
  }

  /**
   * Computes a delivery instant that avoids 02:00–06:00 local time and prefers high-engagement hours.
   */
  getOptimalDeliveryTime(userId: string): Date {
    return getOptimalDeliveryTimeInternal(
      userId,
      this.clock(),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      this.intelligentWindowHours,
    )
  }

  /**
   * Removes a pending scheduled notification if it has not fired yet.
   */
  cancelScheduled(notificationId: string): PushResult<boolean> {
    try {
      const t = this.timers.get(notificationId)
      if (t) {
        clearTimeout(t)
        this.timers.delete(notificationId)
      }
      const existed = this.queue.delete(notificationId)
      return { ok: true, data: existed }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'cancelScheduled failed'
      return { ok: false, error: message }
    }
  }

  /**
   * Snapshot of queued notifications (including those not yet due).
   */
  getPendingNotifications(): ScheduledNotificationRecord[] {
    return Array.from(this.queue.values())
  }
}
