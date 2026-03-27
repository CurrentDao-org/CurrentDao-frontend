import {
  notificationPreferencesManager,
  NotificationPreferencesManager,
} from '@/notifications/preferences/preferences-manager'

describe('NotificationPreferencesManager', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getPreferences returns defaults', () => {
    const m = new NotificationPreferencesManager()
    const p = m.getPreferences('user-1')
    expect(p.categories.proposals.enabled).toBe(true)
    expect(p.categories.marketing.frequency).toBe('weekly')
  })

  it('updatePreferences merges categories', () => {
    const m = new NotificationPreferencesManager()
    const r = m.updatePreferences('user-2', {
      masterPushEnabled: true,
      categories: {
        votes: {
          enabled: false,
          channels: ['email'],
          frequency: 'daily_digest',
        },
      },
    })
    expect(r.ok).toBe(true)
    const p = m.getPreferences('user-2')
    expect(p.masterPushEnabled).toBe(true)
    expect(p.categories.votes.enabled).toBe(false)
    expect(p.categories.votes.channels).toEqual(['email'])
  })

  it('isEnabled reflects category toggle and channels', () => {
    const m = new NotificationPreferencesManager()
    m.updatePreferences('u', {
      categories: {
        treasury: { enabled: true, channels: [], frequency: 'realtime' },
      },
    })
    expect(m.isEnabled('u', 'treasury')).toBe(false)
    m.updatePreferences('u', {
      categories: {
        treasury: { enabled: true, channels: ['web'], frequency: 'realtime' },
      },
    })
    expect(m.isEnabled('u', 'treasury')).toBe(true)
  })

  it('supports all required categories', () => {
    const p = notificationPreferencesManager.getPreferences('x')
    ;(['proposals', 'votes', 'treasury', 'social', 'marketing'] as const).forEach((c) => {
      expect(p.categories[c]).toMatchObject({
        enabled: expect.any(Boolean),
        channels: expect.any(Array),
        frequency: expect.any(String),
      })
    })
  })

  it('getPreferences falls back when JSON corrupt', () => {
    localStorage.setItem('currentdao-notification-prefs:bad', '{')
    const m = new NotificationPreferencesManager()
    const p = m.getPreferences('bad')
    expect(p.userId).toBe('bad')
    expect(p.categories.proposals).toBeDefined()
  })

  it('updatePreferences returns error when persistence fails', () => {
    const spy = jest.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })
    const m = new NotificationPreferencesManager()
    const r = m.updatePreferences('q', { masterPushEnabled: true })
    expect(r.ok).toBe(false)
    spy.mockRestore()
  })
})
