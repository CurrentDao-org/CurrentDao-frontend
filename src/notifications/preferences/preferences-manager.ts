import type {
  CategoryPreferences,
  NotificationCategory,
  PushResult,
  UserNotificationPreferences,
} from '@/notifications/types'

const PREFIX = 'currentdao-notification-prefs:'

function storageKey(userId: string): string {
  return `${PREFIX}${userId}`
}

function defaultCategory(): CategoryPreferences {
  return {
    enabled: true,
    channels: ['web'],
    frequency: 'realtime',
  }
}

function defaultPreferences(userId: string): UserNotificationPreferences {
  const categories = {
    proposals: defaultCategory(),
    votes: defaultCategory(),
    treasury: defaultCategory(),
    social: { ...defaultCategory(), channels: ['web', 'mobile'] },
    marketing: {
      enabled: false,
      channels: ['email'],
      frequency: 'weekly',
    },
  } satisfies Record<NotificationCategory, CategoryPreferences>

  return {
    userId,
    masterPushEnabled: false,
    categories,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * User preference persistence (localStorage). Swap `read`/`write` for API calls later.
 */
export class NotificationPreferencesManager {
  /**
   * Loads persisted preferences or returns defaults.
   */
  getPreferences(userId: string): UserNotificationPreferences {
    try {
      if (typeof window === 'undefined') {
        return defaultPreferences(userId)
      }
      const raw = window.localStorage.getItem(storageKey(userId))
      if (!raw) {
        return defaultPreferences(userId)
      }
      const parsed = JSON.parse(raw) as UserNotificationPreferences
      if (!parsed.categories) {
        return defaultPreferences(userId)
      }
      return parsed
    } catch {
      return defaultPreferences(userId)
    }
  }

  /**
   * Shallow-merges updates into stored preferences.
   */
  updatePreferences(
    userId: string,
    updates: Partial<Omit<UserNotificationPreferences, 'userId' | 'updatedAt'>>,
  ): PushResult<UserNotificationPreferences> {
    try {
      if (typeof window === 'undefined') {
        return { ok: false, error: 'updatePreferences requires browser context' }
      }
      const current = this.getPreferences(userId)
      const next: UserNotificationPreferences = {
        ...current,
        ...updates,
        userId,
        categories: {
          ...current.categories,
          ...(updates.categories ?? {}),
        },
        updatedAt: new Date().toISOString(),
      }
      window.localStorage.setItem(storageKey(userId), JSON.stringify(next))
      return { ok: true, data: next }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'updatePreferences failed'
      return { ok: false, error: message }
    }
  }

  /**
   * Whether notifications for a category should be shown on enabled channels.
   */
  isEnabled(userId: string, notificationType: NotificationCategory): boolean {
    const prefs = this.getPreferences(userId)
    const cat = prefs.categories[notificationType]
    return !!(cat?.enabled && cat.channels.length > 0)
  }
}

export const notificationPreferencesManager = new NotificationPreferencesManager()
