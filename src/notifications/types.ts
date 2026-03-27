/**
 * Shared types for the notification subsystem (Web Push path on iOS Safari 16.4+,
 * Android Chrome, and desktop browsers that support PushManager + service workers).
 */

export type NotificationPermissionState = 'granted' | 'denied' | 'default'

export interface NotificationActionDef {
  action: string
  title: string
  icon?: string
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  image?: string
  actions?: NotificationActionDef[]
  tag?: string
  data?: Record<string, unknown>
  url?: string
  /** Optional id for analytics correlation (stored in notification data). */
  notificationId?: string
}

export type NotificationFrequency = 'realtime' | 'daily_digest' | 'weekly'

export type NotificationChannel = 'web' | 'email' | 'mobile'

export type NotificationCategory =
  | 'proposals'
  | 'votes'
  | 'treasury'
  | 'social'
  | 'marketing'

export interface CategoryPreferences {
  enabled: boolean
  channels: NotificationChannel[]
  frequency: NotificationFrequency
}

export interface UserNotificationPreferences {
  userId: string
  masterPushEnabled: boolean
  categories: Record<NotificationCategory, CategoryPreferences>
  updatedAt: string
}

export type UserSegment =
  | 'active_voter'
  | 'new_user'
  | 'whale'
  | 'dormant'
  | 'standard'

export interface UserProfile {
  userId: string
  displayName?: string
  locale?: string
  /** Voting participation score 0–1 */
  voteParticipation?: number
  /** Days since signup */
  accountAgeDays?: number
  /** Normalized wallet / stake size bucket 0–1 */
  economicWeight?: number
  /** Days since last meaningful activity */
  daysSinceActive?: number
  /** DAO / asset names for interpolation */
  favoriteDaos?: string[]
}

export type NotificationEventType =
  | 'proposal_created'
  | 'vote_reminder'
  | 'treasury_alert'
  | 'mention'
  | 'campaign'

export interface DeliveryOptions {
  scheduledAt: string
  timezone: string
  intelligent?: boolean
}

export interface ScheduledNotificationRecord {
  id: string
  notification: NotificationPayload
  deliveryOptions: DeliveryOptions
  userId?: string
  /** ISO time when the job should run (after intelligent scheduling if applied). */
  effectiveScheduledAt: string
  createdAt: string
}

export type PushResult<T> = { ok: true; data: T } | { ok: false; error: string }
