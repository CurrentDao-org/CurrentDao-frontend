import type {
  NotificationEventType,
  NotificationPayload,
  PushResult,
  UserProfile,
  UserSegment,
} from '@/notifications/types'

const ENGAGEMENT_STORE_KEY = 'currentdao-notification-engagement'

export interface NotificationTemplate {
  title: string
  body: string
  /** Default CTA label */
  cta?: string
}

const TEMPLATES: Record<UserSegment, Partial<Record<NotificationEventType, NotificationTemplate>>> = {
  active_voter: {
    proposal_created: {
      title: 'New proposal — your vote matters',
      body: 'Hi {{name}}, {{dao}} posted a proposal you usually engage with.',
      cta: 'Review proposal',
    },
    vote_reminder: {
      title: 'Voting closes soon',
      body: '{{name}}, cast your vote on {{dao}} before the deadline.',
      cta: 'Vote now',
    },
    treasury_alert: {
      title: 'Treasury movement',
      body: '{{name}}, a large treasury transfer on {{dao}} may need your attention.',
      cta: 'View treasury',
    },
    mention: {
      title: 'You were mentioned',
      body: '{{name}}, someone tagged you in {{dao}} governance.',
      cta: 'Open thread',
    },
    campaign: {
      title: 'Updates for engaged members',
      body: '{{name}}, curated updates based on your voting history.',
      cta: 'Learn more',
    },
  },
  new_user: {
    proposal_created: {
      title: 'Welcome — explore your first proposal',
      body: 'Hi {{name}}, start with this lightweight proposal on {{dao}}.',
      cta: 'Get started',
    },
    vote_reminder: {
      title: 'Try voting once',
      body: '{{name}}, voting takes under a minute on {{dao}}.',
      cta: 'Try it',
    },
    treasury_alert: {
      title: 'Treasury snapshot',
      body: '{{name}}, see how {{dao}} allocates funds.',
      cta: 'View snapshot',
    },
    mention: {
      title: 'Someone reached out',
      body: '{{name}}, open your mentions on {{dao}}.',
      cta: 'Open',
    },
    campaign: {
      title: 'Quick tour',
      body: '{{name}}, finish onboarding with a 60-second tour.',
      cta: 'Start tour',
    },
  },
  whale: {
    treasury_alert: {
      title: 'High-impact treasury event',
      body: '{{name}}, a material movement affects {{dao}} positions you hold.',
      cta: 'Analyze impact',
    },
    proposal_created: {
      title: 'Governance alert',
      body: '{{name}}, proposal risk/liquidity notes for {{dao}}.',
      cta: 'Open analysis',
    },
    vote_reminder: {
      title: 'Your vote shifts outcomes',
      body: '{{name}}, quorum-sensitive vote on {{dao}}.',
      cta: 'Vote',
    },
    mention: {
      title: 'Direct line',
      body: '{{name}}, priority mention on {{dao}}.',
      cta: 'Respond',
    },
    campaign: {
      title: 'Private roadmap',
      body: '{{name}}, stakeholder-only updates for {{dao}}.',
      cta: 'View roadmap',
    },
  },
  dormant: {
    campaign: {
      title: 'We miss you',
      body: '{{name}}, here is one high-signal update from {{dao}}.',
      cta: 'Re-engage',
    },
    vote_reminder: {
      title: 'Missed a vote?',
      body: '{{name}}, catch up on {{dao}} in one tap.',
      cta: 'Catch up',
    },
    proposal_created: {
      title: 'Lightweight catch-up',
      body: '{{name}}, a short summary from {{dao}}.',
      cta: 'Read summary',
    },
    treasury_alert: {
      title: 'Monthly treasury digest',
      body: '{{name}}, condensed treasury moves on {{dao}}.',
      cta: 'Digest',
    },
    mention: {
      title: 'You have unread activity',
      body: '{{name}}, mentions while you were away on {{dao}}.',
      cta: 'View',
    },
  },
  standard: {
    proposal_created: { title: 'New proposal', body: '{{dao}} has a new proposal.', cta: 'Open' },
    vote_reminder: { title: 'Vote reminder', body: 'Voting is open on {{dao}}.', cta: 'Vote' },
    treasury_alert: { title: 'Treasury alert', body: 'Treasury activity on {{dao}}.', cta: 'View' },
    mention: { title: 'Mention', body: 'You have a new mention.', cta: 'Open' },
    campaign: { title: 'CurrentDao update', body: 'Platform news for {{name}}.', cta: 'Details' },
  },
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key: string) => vars[key] ?? '')
}

/**
 * Personalization and segment-aware templates.
 *
 * **Target:** ~30% engagement uplift vs untargeted blast notifications, by matching copy and CTAs
 * to behavior (e.g. stronger treasury framing for whales, reactivation for dormant users).
 *
 * **Feedback loop:** {@link NotificationPersonalizer.trackEngagement} records open / dismiss / click
 * per `notificationId`; downstream ranking can suppress low-performing templates per segment and
 * boost variants correlated with clicks—closing the loop without requiring a live ML backend yet.
 */
export class NotificationPersonalizer {
  /**
   * Enriches a base payload with profile-aware copy and optional locale tweaks.
   */
  personalizePayload(base: NotificationPayload, profile: UserProfile): NotificationPayload {
    const segment = this.getUserSegment(profile)
    const dao = profile.favoriteDaos?.[0] ?? 'your DAO'
    const name = profile.displayName ?? 'there'
    const vars: Record<string, string> = {
      name,
      dao,
    }

    let title = interpolate(base.title, vars)
    let body = interpolate(base.body, vars)

    if (profile.locale && profile.locale !== 'en') {
      title = `[${profile.locale.toUpperCase()}] ${title}`
    }

    const tpl = this.selectTemplate(segment, guessEventFromPayload(base))
    const ctaLabel = tpl.cta

    const actions =
      base.actions?.length ?
        base.actions
      : ctaLabel ?
        [{ action: 'open', title: ctaLabel, icon: base.icon }]
      : undefined

    return {
      ...base,
      title,
      body,
      actions,
      data: {
        ...(base.data ?? {}),
        segment,
        personalized: true,
      },
    }
  }

  /**
   * Classifies the user for template selection.
   */
  getUserSegment(profile: UserProfile): UserSegment {
    if ((profile.daysSinceActive ?? 0) > 30 && (profile.voteParticipation ?? 0) < 0.15) {
      return 'dormant'
    }
    if ((profile.accountAgeDays ?? 999) < 14) {
      return 'new_user'
    }
    if ((profile.voteParticipation ?? 0) > 0.55) {
      return 'active_voter'
    }
    if ((profile.economicWeight ?? 0) > 0.75) {
      return 'whale'
    }
    return 'standard'
  }

  /**
   * Returns the best-fit template for a `(segment, eventType)` pair.
   */
  selectTemplate(segment: UserSegment, eventType: NotificationEventType): NotificationTemplate {
    const seg = TEMPLATES[segment][eventType]
    if (seg) return seg
    const fallback = TEMPLATES.standard[eventType]
    return fallback ?? { title: 'Update', body: 'You have a new notification.' }
  }

  /**
   * Records engagement signals for personalization feedback (local persistence for now).
   */
  trackEngagement(notificationId: string, action: 'open' | 'dismiss' | 'click'): PushResult<void> {
    try {
      if (typeof window === 'undefined') {
        return { ok: false, error: 'trackEngagement requires a browser context' }
      }
      const raw = window.localStorage.getItem(ENGAGEMENT_STORE_KEY)
      const store: Record<string, { action: string; at: string }[]> = raw ? JSON.parse(raw) : {}
      if (!store[notificationId]) store[notificationId] = []
      store[notificationId].push({ action, at: new Date().toISOString() })
      window.localStorage.setItem(ENGAGEMENT_STORE_KEY, JSON.stringify(store))
      return { ok: true, data: undefined }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'trackEngagement failed'
      return { ok: false, error: message }
    }
  }
}

function guessEventFromPayload(base: NotificationPayload): NotificationEventType {
  const tag = (base.tag ?? '').toLowerCase()
  if (tag.includes('proposal')) return 'proposal_created'
  if (tag.includes('vote')) return 'vote_reminder'
  if (tag.includes('treasury')) return 'treasury_alert'
  if (tag.includes('social') || tag.includes('mention')) return 'mention'
  return 'campaign'
}

export const notificationPersonalizer = new NotificationPersonalizer()
