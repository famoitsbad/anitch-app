import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<React.StrictMode><App /></React.StrictMode>)

// iOS Safari can keep serving a broken PWA cache even after the home-screen
// icon is deleted. Temporarily clear old caches until the mobile build is stable.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => Promise.all(registrations.map(reg => reg.unregister())))
      .catch(err => console.log('SW cleanup failed:', err))
  })
}

if ('caches' in window) {
  window.addEventListener('load', () => {
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .catch(err => console.log('Cache cleanup failed:', err))
  })
}
