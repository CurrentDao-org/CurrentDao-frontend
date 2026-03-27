import '@testing-library/jest-dom'

// React 18 concurrent features in tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

// jsdom does not always define Notification; Push API tests need a minimal stub
if (typeof globalThis.Notification === 'undefined') {
  type Perm = 'default' | 'denied' | 'granted'
  class NotificationStub {
    static permission: Perm = 'default'

    static requestPermission(): Promise<Perm> {
      return Promise.resolve(NotificationStub.permission)
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).Notification = NotificationStub
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock html2canvas
jest.mock('html2canvas', () =>
  jest.fn(() =>
    Promise.resolve({
      toBlob: (callback: Function) => callback(new Blob()),
    })
  )
)

// Mock TextEncoder for Stellar SDK
global.TextEncoder = require('util').TextEncoder

// Mock TextDecoder for Stellar SDK
global.TextDecoder = require('util').TextDecoder

// Mock localStorage
const localStorageMock = (function () {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    clear: () => {
      store = {}
    },
    removeItem: (key: string) => {
      delete store[key]
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})
