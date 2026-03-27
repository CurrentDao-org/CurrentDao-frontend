import { getOptimalDeliveryTimeInternal, NotificationScheduler } from '@/notifications/scheduling/scheduler'

describe('getOptimalDeliveryTimeInternal', () => {
  it('avoids 2–6am local when alternatives exist in window', () => {
    const hourly = new Array(24).fill(0.2)
    const now = new Date('2024-06-01T04:30:00Z')
    const optimal = getOptimalDeliveryTimeInternal('u1', now, 'UTC', 4, hourly)
    expect(optimal.getUTCHours()).toBeGreaterThanOrEqual(6)
  })

  it('prefers higher-engagement hours inside the scheduling window', () => {
    const hourly = new Array(24).fill(0.1)
    hourly[10] = 0.99
    const now = new Date('2024-06-01T08:00:00Z')
    const optimal = getOptimalDeliveryTimeInternal('u1', now, 'UTC', 4, hourly)
    expect(optimal.getUTCHours()).toBe(10)
  })
})

describe('NotificationScheduler', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('dispatches immediately when scheduled in the past', async () => {
    const dispatch = jest.fn().mockResolvedValue(undefined)
    const sched = new NotificationScheduler({ dispatch, now: () => new Date('2024-01-01T12:00:00Z') })
    const r = await sched.scheduleNotification(
      { title: 't', body: 'b' },
      { scheduledAt: '2024-01-01T11:00:00Z', timezone: 'UTC' },
    )
    expect(r.ok).toBe(true)
    await jest.runAllTimersAsync()
    expect(dispatch).toHaveBeenCalledTimes(1)
  })

  it('intelligent scheduling overrides scheduledAt', async () => {
    const dispatch = jest.fn().mockResolvedValue(undefined)
    const fixed = new Date('2024-06-01T14:00:00Z')
    const sched = new NotificationScheduler({
      dispatch,
      now: () => fixed,
    })
    jest.spyOn(sched, 'getOptimalDeliveryTime').mockReturnValue(new Date('2024-06-01T15:30:00Z'))
    const r = await sched.scheduleNotification(
      { title: 't', body: 'b' },
      { scheduledAt: '2024-06-01T20:00:00Z', timezone: 'UTC', intelligent: true },
    )
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.data.effectiveScheduledAt).toBe('2024-06-01T15:30:00.000Z')
    }
  })

  it('cancelScheduled removes pending job', async () => {
    const dispatch = jest.fn()
    const sched = new NotificationScheduler({
      dispatch,
      now: () => new Date('2024-01-01T12:00:00Z'),
    })
    const r = await sched.scheduleNotification(
      { title: 't', body: 'b' },
      { scheduledAt: '2024-01-01T13:00:00Z', timezone: 'UTC' },
    )
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const cancel = sched.cancelScheduled(r.data.id)
    expect(cancel.ok).toBe(true)
    await jest.runAllTimersAsync()
    expect(dispatch).not.toHaveBeenCalled()
    expect(sched.getPendingNotifications().length).toBe(0)
  })

  it('getPendingNotifications lists queue', async () => {
    const sched = new NotificationScheduler({
      now: () => new Date('2024-01-01T12:00:00Z'),
    })
    await sched.scheduleNotification(
      { title: 't', body: 'b' },
      { scheduledAt: '2024-01-01T15:00:00Z', timezone: 'UTC' },
    )
    expect(sched.getPendingNotifications().length).toBe(1)
  })

  it('exposes getOptimalDeliveryTime using scheduler clock', () => {
    const sched = new NotificationScheduler({
      now: () => new Date('2024-06-01T08:00:00Z'),
    })
    const t = sched.getOptimalDeliveryTime('u')
    expect(t.getTime()).toBeGreaterThan(0)
  })

  it('generate ids without randomUUID uses fallback', async () => {
    const orig = global.crypto
    Object.defineProperty(global, 'crypto', { value: {}, configurable: true })
    const sched = new NotificationScheduler({
      now: () => new Date('2024-01-01T12:00:00Z'),
    })
    const r = await sched.scheduleNotification(
      { title: 't', body: 'b' },
      { scheduledAt: '2024-01-01T15:00:00Z', timezone: 'UTC' },
    )
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.data.id).toContain('sched-')
    Object.defineProperty(global, 'crypto', { value: orig, configurable: true })
  })
})
