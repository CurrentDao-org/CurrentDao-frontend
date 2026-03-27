'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { pushService } from '@/notifications/push/push-service'
import { notificationPreferencesManager } from '@/notifications/preferences/preferences-manager'
import type {
  NotificationCategory,
  NotificationChannel,
  NotificationFrequency,
  UserNotificationPreferences,
} from '@/notifications/types'

export interface NotificationPreferencesProps {
  userId?: string
}

const CATEGORY_ORDER: NotificationCategory[] = [
  'proposals',
  'votes',
  'treasury',
  'social',
  'marketing',
]

const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  proposals: 'Governance proposals',
  votes: 'Votes & results',
  treasury: 'Treasury alerts',
  social: 'Mentions & replies',
  marketing: 'Product updates',
}

const CHANNELS: { id: NotificationChannel; label: string }[] = [
  { id: 'web', label: 'Web push' },
  { id: 'email', label: 'Email' },
  { id: 'mobile', label: 'Mobile' },
]

const FREQUENCIES: { id: NotificationFrequency; label: string }[] = [
  { id: 'realtime', label: 'Real-time' },
  { id: 'daily_digest', label: 'Daily digest' },
  { id: 'weekly', label: 'Weekly' },
]

/**
 * Full notification preferences surface (Tailwind styling aligned with existing app chrome).
 */
export function NotificationPreferences({ userId = 'default-user' }: NotificationPreferencesProps) {
  const [prefs, setPrefs] = useState<UserNotificationPreferences | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [subscribed, setSubscribed] = useState(false)

  const refresh = useCallback(() => {
    setPrefs(notificationPreferencesManager.getPreferences(userId))
  }, [userId])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    void pushService.getSubscriptionStatus().then((r) => {
      if (r.ok && r.data) setSubscribed(true)
    })
  }, [])

  useEffect(() => {
    pushService.attachSubscriptionChangeListener(() => {
      void pushService.subscribeUser()
    })
  }, [])

  const masterEnabled = prefs?.masterPushEnabled ?? false

  const setMaster = async (enable: boolean) => {
    setStatusMessage(null)
    if (enable) {
      const perm = await pushService.requestPermission()
      if (!perm.ok) {
        setStatusMessage(perm.error)
        return
      }
      if (perm.data !== 'granted') {
        setStatusMessage('Notifications were not granted.')
        return
      }
      const sub = await pushService.subscribeUser()
      if (!sub.ok) {
        setStatusMessage(sub.error)
        return
      }
      setSubscribed(!!sub.data)
      const upd = notificationPreferencesManager.updatePreferences(userId, { masterPushEnabled: true })
      if (upd.ok) setPrefs(upd.data)
      refresh()
      setStatusMessage('Push enabled for this device.')
      return
    }
    await pushService.unsubscribeUser()
    setSubscribed(false)
    const upd = notificationPreferencesManager.updatePreferences(userId, { masterPushEnabled: false })
    if (upd.ok) setPrefs(upd.data)
    refresh()
    setStatusMessage('Push disabled on this device.')
  }

  const updateCategory = (category: NotificationCategory, patch: Partial<UserNotificationPreferences['categories'][NotificationCategory]>) => {
    if (!prefs) return
    const nextCats = { ...prefs.categories, [category]: { ...prefs.categories[category], ...patch } }
    const upd = notificationPreferencesManager.updatePreferences(userId, { categories: nextCats })
    if (upd.ok) setPrefs(upd.data)
  }

  const toggleChannel = (category: NotificationCategory, channel: NotificationChannel, checked: boolean) => {
    if (!prefs) return
    const current = new Set(prefs.categories[category].channels)
    if (checked) current.add(channel)
    else current.delete(channel)
    updateCategory(category, { channels: Array.from(current) as NotificationChannel[] })
  }

  const testNotification = async () => {
    setStatusMessage(null)
    const result = await pushService.sendNotification({
      title: 'CurrentDao test',
      body: 'Your browser subscription is working.',
      tag: 'currentdao-test',
      url: '/',
      image: '/icons/icon-512x512.png',
      actions: [{ action: 'open', title: 'Open app' }],
      notificationId: `test-${Date.now()}`,
    })
    if (!result.ok) {
      setStatusMessage(result.error)
      return
    }
    setStatusMessage('Test notification sent.')
  }

  const categoriesRendered = useMemo(() => CATEGORY_ORDER, [])

  if (!prefs) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">
        Loading notification preferences…
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Notification preferences</h2>
        <p className="text-sm text-gray-600 mt-1">
          Control how CurrentDao reaches you across web, email, and mobile channels.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg bg-emerald-50 border border-emerald-100 p-4">
        <div>
          <h3 className="font-medium text-emerald-900">Enable push notifications</h3>
          <p className="text-sm text-emerald-800/90">
            {subscribed && masterEnabled ? 'This device is subscribed to web push.' : 'Allow the browser to show system notifications.'}
          </p>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-emerald-900">Push</span>
          <input
            type="checkbox"
            className="h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            checked={masterEnabled}
            onChange={(e) => void setMaster(e.target.checked)}
            aria-label="Enable push notifications"
          />
        </label>
      </div>

      <div className="space-y-4">
        {categoriesRendered.map((cat) => {
          const c = prefs.categories[cat]
          return (
            <div key={cat} className="border border-gray-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-gray-900">{CATEGORY_LABEL[cat]}</span>
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <span>On</span>
                  <input
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-emerald-600"
                    checked={c.enabled}
                    onChange={(e) => updateCategory(cat, { enabled: e.target.checked })}
                    aria-label={`Enable ${CATEGORY_LABEL[cat]}`}
                  />
                </label>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Channels</p>
                <div className="flex flex-wrap gap-3">
                  {CHANNELS.map((ch) => (
                    <label key={ch.id} className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600"
                        checked={c.channels.includes(ch.id)}
                        onChange={(e) => toggleChannel(cat, ch.id, e.target.checked)}
                      />
                      {ch.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">
                  Frequency
                </label>
                <select
                  className="w-full sm:w-64 rounded-lg border-gray-300 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  value={c.frequency}
                  onChange={(e) =>
                    updateCategory(cat, { frequency: e.target.value as NotificationFrequency })
                  }
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          onClick={() => void testNotification()}
        >
          Send test notification
        </button>
        {statusMessage ? <span className="text-sm text-gray-600">{statusMessage}</span> : null}
      </div>
    </div>
  )
}
