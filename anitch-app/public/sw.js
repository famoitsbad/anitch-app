const CACHE_NAME = 'anitch-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/anitch-logo.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/manifest.json'
]

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  )
})

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch — network first, fall back to cache
self.addEventListener('fetch', event => {
  // Skip non-GET and non-http requests
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith('http')) return
  // Skip Supabase API calls — always need fresh data
  if (event.request.url.includes('supabase.co')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache successful responses
        if (response && response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        }
        return response
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(event.request)
          .then(cached => cached || caches.match('/index.html'))
      })
  )
})

// Push notifications support
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {
    title: 'Anitch 🌿',
    body: 'Time to log your skin condition today!'
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'anitch-daily',
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow('/'))
})
