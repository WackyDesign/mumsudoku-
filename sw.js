const PREFIX = 'sudoku-v';
const CACHE = PREFIX + '17';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  // nur eigene alte Speicher löschen, nicht die der anderen Sudoku-Version
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put('index.html', copy)); return res;
    }).catch(() => caches.match('index.html', {cacheName: CACHE})));
    return;
  }
  e.respondWith(
    caches.open(CACHE).then(c => c.match(req, {ignoreSearch: true})).then(hit => hit || fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque') && (req.url.startsWith(self.location.origin) || req.url.includes('fonts.g'))) {
        const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }))
  );
});
