import type {
  NotificationPayload,
  NotificationPermissionState,
  PushResult,
} from '@/notifications/types'

const STORAGE_KEY = 'currentdao-web-push-subscription-json'

/**
 * Cross-platform delivery uses the same Web Push stack where the browser exposes
 * `PushManager` (Android Chrome, desktop Chromium/Firefox, iOS Safari 16.4+ when added to Home Screen).
 * Native FCM is not bundled in this project; a backend still generates VAPID-signed pushes to the endpoint.
 */

/**
 * Converts a VAPID public key in URL-safe base64 to `Uint8Array` for `applicationServerKey`.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  if (typeof atob === 'function') {
    const binary = atob(base64)
    const outputArray = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; ++i) {
      outputArray[i] = binary.charCodeAt(i)
    }
    return outputArray
  }
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'))
  }
  throw new Error('Cannot decode VAPID key in this environment')
}

function getVapidPublicKey(): string | undefined {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  }
  return undefined
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined'
}

export class PushService {
  /**
   * Requests browser notification permission. Never throws; failures surface as `{ ok: false }`.
   */
  async requestPermission(): Promise<PushResult<NotificationPermissionState>> {
    try {
      if (!isBrowser() || !('Notification' in window)) {
        return { ok: false, error: 'Notifications not supported in this environment' }
      }
      const result = await Notification.requestPermission()
      if (result === 'granted') {
        return { ok: true, data: 'granted' }
      }
      if (result === 'denied') {
        return { ok: true, data: 'denied' }
      }
      return { ok: true, data: 'default' }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'requestPermission failed'
      return { ok: false, error: message }
    }
  }

  /**
   * Persists the PushSubscription JSON (endpoint + keys) for the current origin.
   */
  async subscribeUser(): Promise<PushResult<PushSubscriptionJSON | null>> {
    try {
      if (!isBrowser()) {
        return { ok: false, error: 'subscribeUser requires a browser context' }
      }
      if (!('serviceWorker' in navigator)) {
        return { ok: false, error: 'Service workers not supported' }
      }
      const vapid = getVapidPublicKey()
      if (!vapid) {
        return {
          ok: false,
          error: 'NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured; cannot subscribe to push',
        }
      }
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
      })
      const json = sub.toJSON()
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
      } catch {
        /* ignore persistence errors */
      }
      return { ok: true, data: json }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'subscribeUser failed'
      return { ok: false, error: message }
    }
  }

  /**
   * Unsubscribes the active push subscription and clears stored endpoint metadata.
   */
  async unsubscribeUser(): Promise<PushResult<boolean>> {
    try {
      if (!isBrowser() || !('serviceWorker' in navigator)) {
        return { ok: false, error: 'Service workers not supported' }
      }
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      const unsubscribed = sub ? await sub.unsubscribe() : true
      try {
        window.localStorage.removeItem(STORAGE_KEY)
      } catch {
        /* ignore */
      }
      return { ok: true, data: unsubscribed }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'unsubscribeUser failed'
      return { ok: false, error: message }
    }
  }

  /**
   * Shows a notification via the active service worker (`showNotification`).
   * Server-originated pushes still flow through the `push` event in the service worker.
   */
  async sendNotification(payload: NotificationPayload): Promise<PushResult<string>> {
    try {
      if (!isBrowser()) {
        return { ok: false, error: 'sendNotification requires a browser context' }
      }
      if (!('serviceWorker' in navigator)) {
        return { ok: false, error: 'Service workers not supported' }
      }
      const permission = Notification.permission
      if (permission !== 'granted') {
        return { ok: false, error: 'Notification permission not granted' }
      }
      const registration = await navigator.serviceWorker.ready
      const notificationId =
        payload.notificationId ??
        `local-${typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now()}`
      const data = {
        ...(payload.data ?? {}),
        url: payload.url ?? '/',
        notificationId,
      }
      await registration.showNotification(
        payload.title,
        {
          body: payload.body,
          icon: payload.icon ?? '/icons/icon-192x192.png',
          image: payload.image,
          tag: payload.tag,
          data,
          actions: payload.actions?.map((a) => ({
            action: a.action,
            title: a.title,
            icon: a.icon,
          })),
        } as Parameters<ServiceWorkerRegistration['showNotification']>[1],
      )
      return { ok: true, data: notificationId }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'sendNotification failed'
      return { ok: false, error: message }
    }
  }

  /**
   * Returns whether a push subscription is currently held for this origin.
   */
  async getSubscriptionStatus(): Promise<PushResult<boolean>> {
    try {
      if (!isBrowser() || !('serviceWorker' in navigator)) {
        return { ok: true, data: false }
      }
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      return { ok: true, data: !!sub }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'getSubscriptionStatus failed'
      return { ok: false, error: message }
    }
  }

  /**
   * Returns the last persisted subscription JSON if available.
   */
  getStoredSubscription(): PushSubscriptionJSON | null {
    try {
      if (!isBrowser()) return null
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as PushSubscriptionJSON
    } catch {
      return null
    }
  }

  /**
   * When the browser rotates push keys, the service worker can message the page to re-run subscribe.
   */
  attachSubscriptionChangeListener(resubscribe: () => void): void {
    try {
      if (!isBrowser() || !('serviceWorker' in navigator)) return
      navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
        if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
          try {
            resubscribe()
          } catch {
            /* never throw from listener */
          }
        }
      })
    } catch {
      /* ignore */
    }
  }
}

export const pushService = new PushService()
