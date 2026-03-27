/* global self, caches, fetch */

const CACHE_NAME = 'currentdao-v1'
const ASSETS_TO_CACHE = ['/', '/index.html', '/manifest.json', '/favicon.ico']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    }),
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        if (response) {
          return response
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
          return response
        })
      })
      .catch(() => undefined),
  )
})

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
          return undefined
        }),
      )
    }),
  )
})

self.addEventListener('push', (event) => {
  const defaults = {
    title: 'CurrentDao',
    body: '',
    icon: '/icons/icon-192x192.png',
    image: undefined,
    tag: 'currentdao',
    url: '/',
    actions: undefined,
    data: {},
  }

  event.waitUntil(
    (async () => {
      let payload = { ...defaults }
      if (event.data) {
        try {
          const parsed = await event.data.json()
          payload = { ...defaults, ...parsed }
        } catch {
          try {
            const text = await event.data.text()
            payload = { ...defaults, ...JSON.parse(text) }
          } catch {
            /* use defaults */
          }
        }
      }

      const notificationId =
        payload.notificationId || payload.data?.notificationId || `push-${Date.now()}`
      const data = {
        ...(typeof payload.data === 'object' && payload.data ? payload.data : {}),
        url: payload.url || '/',
        notificationId,
      }

      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon,
        image: payload.image,
        tag: payload.tag,
        data,
        actions: payload.actions,
      })
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const rootData = event.notification.data || {}
  let targetUrl = typeof rootData.url === 'string' ? rootData.url : '/'

  if (event.action && rootData.actions && typeof rootData.actions === 'object') {
    const mapped = rootData.actions[event.action]
    if (typeof mapped === 'string') targetUrl = mapped
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const urlObj = new URL(targetUrl, self.location.origin)
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if ('focus' in client && client.url && client.url.indexOf(urlObj.pathname) >= 0) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlObj.href)
      }
      return undefined
    }),
  )
})

self.addEventListener('notificationclose', (event) => {
  const data = event.notification.data || {}
  const notificationId = data.notificationId || null
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({
          type: 'NOTIFICATION_DISMISSED',
          notificationId,
        })
      })
    }),
  )
})

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      clientList.forEach((client) => {
        client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' })
      })
    }),
  )
})
