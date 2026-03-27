import * as pushModule from '@/notifications/push/push-service'
import { pushService, PushService, urlBase64ToUint8Array } from '@/notifications/push/push-service'

describe('urlBase64ToUint8Array', () => {
  it('decodes URL-safe base64', () => {
    const out = urlBase64ToUint8Array('AQID') // [1,2,3]
    expect(Array.from(out)).toEqual([1, 2, 3])
  })
})

describe('PushService', () => {
  let originalPermission: string

  beforeEach(() => {
    localStorage.clear()
    originalPermission = Notification.permission
    Object.defineProperty(Notification, 'permission', {
      writable: true,
      configurable: true,
      value: 'default',
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
    Object.defineProperty(Notification, 'permission', {
      writable: true,
      configurable: true,
      value: originalPermission,
    })
  })

  it('requestPermission returns denied without throwing when prompt yields denied', async () => {
    const request = jest.spyOn(Notification, 'requestPermission').mockResolvedValue('denied')
    const res = await pushService.requestPermission()
    expect(request).toHaveBeenCalled()
    expect(res).toEqual({ ok: true, data: 'denied' })
  })

  it('requestPermission handles errors gracefully', async () => {
    jest.spyOn(Notification, 'requestPermission').mockRejectedValue(new Error('nope'))
    const res = await pushService.requestPermission()
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toBe('nope')
  })

  it('subscribeUser fails when VAPID key missing', async () => {
    const old = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { ready: Promise.resolve({ pushManager: { subscribe: jest.fn() } }) },
    })
    const svc = new PushService()
    const res = await svc.subscribeUser()
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toMatch(/VAPID/)
    if (old !== undefined) process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = old
  })

  it('subscribeUser stores subscription JSON on success', async () => {
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = 'test-key'
    jest.spyOn(pushModule, 'urlBase64ToUint8Array').mockReturnValue(new Uint8Array(65))
    const subscribe = jest.fn().mockResolvedValue({
      toJSON: () => ({ endpoint: 'https://example.test/push', keys: { p256dh: 'x', auth: 'y' } }),
    })
    const ready = Promise.resolve({ pushManager: { subscribe } })
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { ready },
    })

    const svc = new PushService()
    const res = await svc.subscribeUser()
    expect(res.ok).toBe(true)
    const stored = svc.getStoredSubscription()
    expect(stored?.endpoint).toBe('https://example.test/push')
  })

  it('unsubscribeUser clears storage', async () => {
    localStorage.setItem(
      'currentdao-web-push-subscription-json',
      JSON.stringify({ endpoint: 'x' }),
    )
    const unsub = jest.fn().mockResolvedValue(true)
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          pushManager: {
            getSubscription: jest.fn().mockResolvedValue({ unsubscribe: unsub }),
          },
        }),
      },
    })
    const res = await pushService.unsubscribeUser()
    expect(res.ok).toBe(true)
    expect(localStorage.getItem('currentdao-web-push-subscription-json')).toBeNull()
  })

  it('sendNotification returns error when permission not granted', async () => {
    Object.defineProperty(Notification, 'permission', { configurable: true, value: 'denied' })
    const res = await pushService.sendNotification({ title: 't', body: 'b' })
    expect(res.ok).toBe(false)
  })

  it('sendNotification calls showNotification when granted', async () => {
    Object.defineProperty(Notification, 'permission', { configurable: true, value: 'granted' })
    const show = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          showNotification: show,
        }),
      },
    })
    const res = await pushService.sendNotification({
      title: 'Hello',
      body: 'World',
      tag: 'g',
      url: '/dao',
      actions: [{ action: 'a', title: 'Go' }],
    })
    expect(res.ok).toBe(true)
    expect(show).toHaveBeenCalled()
    const opts = show.mock.calls[0][1]
    expect(opts.body).toBe('World')
    expect(opts.tag).toBe('g')
    expect(opts.data.url).toBe('/dao')
  })

  it('getSubscriptionStatus returns false when no subscription', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          pushManager: { getSubscription: jest.fn().mockResolvedValue(null) },
        }),
      },
    })
    const r = await pushService.getSubscriptionStatus()
    expect(r).toEqual({ ok: true, data: false })
  })

  it('requestPermission returns granted', async () => {
    jest.spyOn(Notification, 'requestPermission').mockResolvedValue('granted')
    const res = await pushService.requestPermission()
    expect(res).toEqual({ ok: true, data: 'granted' })
  })

  it('getSubscriptionStatus returns true when subscribed', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          pushManager: { getSubscription: jest.fn().mockResolvedValue({ endpoint: 'x' }) },
        }),
      },
    })
    const r = await pushService.getSubscriptionStatus()
    expect(r).toEqual({ ok: true, data: true })
  })

  it('attachSubscriptionChangeListener never rethrows from handler', () => {
    const cb = jest.fn().mockImplementation(() => {
      throw new Error('bad')
    })
    const listeners: Array<(e: MessageEvent) => void> = []
    const sw = {
      addEventListener: jest.fn((type: string, fn: EventListener) => {
        if (type === 'message') listeners.push(fn as (e: MessageEvent) => void)
      }),
    }
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: sw })
    pushService.attachSubscriptionChangeListener(cb)
    listeners[0]({ data: { type: 'PUSH_SUBSCRIPTION_CHANGED' } } as MessageEvent)
    expect(cb).toHaveBeenCalled()
  })

  it('sendNotification surfaces showNotification errors', async () => {
    Object.defineProperty(Notification, 'permission', { configurable: true, value: 'granted' })
    const show = jest.fn().mockRejectedValue(new Error('show failed'))
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({ showNotification: show }),
      },
    })
    const res = await pushService.sendNotification({ title: 't', body: 'b' })
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.error).toContain('show failed')
  })

  it('getStoredSubscription reads localStorage', () => {
    localStorage.setItem(
      'currentdao-web-push-subscription-json',
      JSON.stringify({ endpoint: 'https://e' }),
    )
    expect(pushService.getStoredSubscription()?.endpoint).toBe('https://e')
  })

  it('requestPermission reports unsupported when Notification API missing', async () => {
    const desc = Object.getOwnPropertyDescriptor(window, 'Notification')
    Reflect.deleteProperty(window, 'Notification')
    const res = await pushService.requestPermission()
    expect(res.ok).toBe(false)
    if (desc) Object.defineProperty(window, 'Notification', desc)
  })

  it('requestPermission maps default state', async () => {
    jest.spyOn(Notification, 'requestPermission').mockResolvedValue('default')
    const res = await pushService.requestPermission()
    expect(res).toEqual({ ok: true, data: 'default' })
  })

  it('getSubscriptionStatus handles errors', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          pushManager: { getSubscription: jest.fn().mockRejectedValue(new Error('x')) },
        }),
      },
    })
    const r = await pushService.getSubscriptionStatus()
    expect(r.ok).toBe(false)
  })

  it('urlBase64ToUint8Array throws without atob or Buffer', () => {
    const a = global.atob
    const B = global.Buffer
    Object.defineProperty(global, 'atob', { configurable: true, value: undefined })
    Object.defineProperty(global, 'Buffer', { configurable: true, value: undefined })
    expect(() => urlBase64ToUint8Array('AQID')).toThrow(/decode/)
    Object.defineProperty(global, 'atob', { configurable: true, value: a })
    Object.defineProperty(global, 'Buffer', { configurable: true, value: B })
  })
})
