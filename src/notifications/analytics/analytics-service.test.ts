import {
  notificationAnalyticsService,
  NotificationAnalyticsService,
} from '@/notifications/analytics/analytics-service'

describe('NotificationAnalyticsService', () => {
  let svc: NotificationAnalyticsService

  beforeEach(() => {
    localStorage.clear()
    svc = new NotificationAnalyticsService()
  })

  it('trackDelivery trackOpen trackConversion include latencyMs', () => {
    const ts = '2024-01-01T00:00:00Z'
    const d = svc.trackDelivery('n1', 'u1', ts, 1200)
    expect(d.ok).toBe(true)
    svc.trackOpen('n1', 'u1', ts, 2000)
    svc.trackConversion('n1', 'u1', 'voted', ts, 3500)
    const report = svc.getNotificationReport('n1')
    expect(report.deliveries).toBe(1)
    expect(report.opens).toBe(1)
    expect(report.conversions).toBe(1)
    report.events.forEach((e) => {
      expect(typeof e.latencyMs).toBe('number')
    })
  })

  it('getMetrics aggregates rates', () => {
    const ts = '2024-01-02T10:00:00Z'
    svc.trackDelivery('a', 'u', ts, 1000)
    svc.trackOpen('a', 'u', ts, 1500)
    svc.trackConversion('a', 'u', 'click', ts, 2000)
    const m = svc.getMetrics()
    expect(m.deliveryRate).toBe(1)
    expect(m.openRate).toBe(1)
    expect(m.conversionRate).toBe(1)
    expect(m.averageDeliveryLatencyMs).toBe(1000)
  })

  it('getMetrics respects filter', () => {
    svc.trackDelivery('x', 'alice', 't', 500)
    svc.trackDelivery('y', 'bob', 't', 700)
    const m = svc.getMetrics({ userId: 'alice' })
    expect(m.averageDeliveryLatencyMs).toBe(500)
  })
})

describe('singleton analytics', () => {
  beforeEach(() => {
    notificationAnalyticsService._resetForTests()
  })

  it('persists to localStorage', () => {
    notificationAnalyticsService.trackDelivery('z', 'u', 't', 100)
    const raw = localStorage.getItem('currentdao-notification-analytics-events')
    expect(raw).toBeTruthy()
  })
})
