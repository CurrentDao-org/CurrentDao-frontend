import { notificationPersonalizer, NotificationPersonalizer } from '@/notifications/personalization/personalizer'

describe('NotificationPersonalizer', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('enriches payload with display name and favors DAO', () => {
    const p = new NotificationPersonalizer().personalizePayload(
      { title: 'Hi {{name}}', body: 'About {{dao}}', tag: 'proposal-new' },
      {
        userId: '1',
        displayName: 'Alex',
        favoriteDaos: ['Solar DAO'],
        voteParticipation: 0.2,
      },
    )
    expect(p.title).toContain('Alex')
    expect(p.body).toContain('Solar DAO')
    expect(p.actions?.length).toBeGreaterThan(0)
  })

  it('classifies segments', () => {
    const p = new NotificationPersonalizer()
    expect(p.getUserSegment({ userId: 'a', daysSinceActive: 40, voteParticipation: 0 })).toBe(
      'dormant',
    )
    expect(p.getUserSegment({ userId: 'b', accountAgeDays: 5 })).toBe('new_user')
    expect(p.getUserSegment({ userId: 'c', voteParticipation: 0.6 })).toBe('active_voter')
    expect(p.getUserSegment({ userId: 'd', economicWeight: 0.9 })).toBe('whale')
    expect(p.getUserSegment({ userId: 'e' })).toBe('standard')
  })

  it('selectTemplate returns segment-specific copy', () => {
    const p = new NotificationPersonalizer()
    const t = p.selectTemplate('whale', 'treasury_alert')
    expect(t.title.toLowerCase()).toContain('treasury')
  })

  it('trackEngagement persists events', () => {
    const r = notificationPersonalizer.trackEngagement('nid-1', 'open')
    expect(r.ok).toBe(true)
    const rawCorrect = localStorage.getItem('currentdao-notification-engagement')
    expect(rawCorrect).toBeTruthy()
    const parsed = JSON.parse(rawCorrect!) as Record<string, unknown>
    expect(parsed['nid-1']).toBeDefined()
  })

  it('respects explicit actions and locale prefix', () => {
    const p = new NotificationPersonalizer().personalizePayload(
      {
        title: 'T',
        body: 'B',
        actions: [{ action: 'x', title: 'Custom' }],
      },
      { userId: '1', locale: 'de' },
    )
    expect(p.title.startsWith('[DE]')).toBe(true)
    expect(p.actions?.[0].title).toBe('Custom')
  })

  it('maps tags to events for templates', () => {
    const p = new NotificationPersonalizer()
    const t = p.personalizePayload(
      { title: '{{name}}', body: '{{dao}}', tag: 'vote-reminder' },
      { userId: '1', displayName: 'Sam', favoriteDaos: ['X'] },
    )
    expect(t.body).toContain('X')
  })
})
