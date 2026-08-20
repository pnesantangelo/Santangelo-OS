const CACHE_NAME = 'santangelo-os-v0.10.2b3';
const APP_SHELL = ['./', './index.html?v=0.10.2b3', './styles.css?v=0.10.2b3', './app.js?v=0.10.2b3', './manifest.json?v=0.10.2b3'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).catch(() => {}));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html'))));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target = event.notification.data && event.notification.data.url ? event.notification.data.url : './?mode=app';
  event.waitUntil(
    self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(clients => {
      for (const client of clients) {
        if ('focus' in client) {
          client.postMessage({type: 'OPEN_SCREEN', screen: 'tasks'});
          return client.focus();
        }
      }
      return self.clients.openWindow(target);
    })
  );
});
