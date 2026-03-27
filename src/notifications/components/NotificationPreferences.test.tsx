/**
 * @jest-environment jsdom
 */

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { NotificationPreferences } from '@/notifications/components/NotificationPreferences'
import { notificationPreferencesManager } from '@/notifications/preferences/preferences-manager'
import { pushService } from '@/notifications/push/push-service'

jest.mock('@/notifications/push/push-service', () => ({
  pushService: {
    requestPermission: jest.fn(),
    subscribeUser: jest.fn(),
    unsubscribeUser: jest.fn(),
    sendNotification: jest.fn(),
    getSubscriptionStatus: jest.fn().mockResolvedValue({ ok: true, data: false }),
    attachSubscriptionChangeListener: jest.fn(),
  },
}))

const mockedPush = pushService as jest.Mocked<typeof pushService>

describe('NotificationPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
    mockedPush.getSubscriptionStatus.mockResolvedValue({ ok: true, data: false })
  })

  it('renders category toggles and frequency controls', () => {
    const root = document.createElement('div')
    document.body.appendChild(root)
    act(() => {
      createRoot(root).render(<NotificationPreferences userId="tester" />)
    })
    expect(root.textContent).toContain('Governance proposals')
    expect(root.textContent).toContain('Votes & results')
    expect(root.textContent).toContain('Treasury alerts')
    expect(root.textContent).toContain('Web push')
  })

  it('master toggle requests permission and subscribes', async () => {
    mockedPush.requestPermission.mockResolvedValue({ ok: true, data: 'granted' })
    mockedPush.subscribeUser.mockResolvedValue({
      ok: true,
      data: { endpoint: 'https://x.test' },
    })
    const root = document.createElement('div')
    document.body.appendChild(root)
    await act(async () => {
      createRoot(root).render(<NotificationPreferences userId="t2" />)
    })
    const master = root.querySelector('input[aria-label="Enable push notifications"]') as HTMLInputElement
    await act(async () => {
      master.click()
    })
    expect(mockedPush.requestPermission).toHaveBeenCalled()
    expect(mockedPush.subscribeUser).toHaveBeenCalled()
  })

  it('master toggle off unsubscribes', async () => {
    mockedPush.unsubscribeUser.mockResolvedValue({ ok: true, data: true })
    notificationPreferencesManager.updatePreferences('t-off', { masterPushEnabled: true })
    const root = document.createElement('div')
    document.body.appendChild(root)
    await act(async () => {
      createRoot(root).render(<NotificationPreferences userId="t-off" />)
    })
    const master = root.querySelector('input[aria-label="Enable push notifications"]') as HTMLInputElement
    expect(master.checked).toBe(true)
    await act(async () => {
      master.click()
    })
    expect(mockedPush.unsubscribeUser).toHaveBeenCalled()
  })

  it('test notification invokes sendNotification', async () => {
    mockedPush.sendNotification.mockResolvedValue({ ok: true, data: 'nid' })
    const root = document.createElement('div')
    document.body.appendChild(root)
    await act(async () => {
      createRoot(root).render(<NotificationPreferences userId="t3" />)
    })
    const btn = [...root.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Send test notification'),
    ) as HTMLButtonElement
    await act(async () => {
      btn.click()
    })
    expect(mockedPush.sendNotification).toHaveBeenCalled()
    const arg = mockedPush.sendNotification.mock.calls[0][0]
    expect(arg.title).toContain('test')
  })
})
