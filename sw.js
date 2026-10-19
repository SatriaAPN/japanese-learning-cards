// KataKata service worker: makes the app open instantly and work offline.
// App files are served from cache and quietly refreshed in the background,
// so a new version shows up on the next launch. Bump VERSION when SHELL changes.
const VERSION = 'v1';
const SHELL_CACHE = `katakata-shell-${VERSION}`;
const FONT_CACHE = 'katakata-fonts';
const SHELL = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-192.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('katakata-shell-') && k !== SHELL_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(cacheFirst(req, FONT_CACHE));
    return;
  }
  if (url.origin === 'https://fonts.googleapis.com') {
    event.respondWith(staleWhileRevalidate(event, req, FONT_CACHE));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // Always answer page loads with the cached app page. Fetch it by its real
    // URL (not the navigation request) so redirects can't break the response.
    const index = new URL('index.html', self.registration.scope).href;
    event.respondWith(
      staleWhileRevalidate(event, new Request(index, { cache: 'no-cache' }), SHELL_CACHE, true)
        .then(res => (res.redirected ? Response.redirect(res.url, 302) : res))
    );
    return;
  }
  event.respondWith(staleWhileRevalidate(event, req, SHELL_CACHE, true));
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
    return res;
  } catch (err) {
    return Response.error();
  }
}

async function staleWhileRevalidate(event, req, cacheName, ignoreSearch = false) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req, { ignoreSearch });
  const network = fetch(req)
    .then(res => {
      // Never cache redirects: replaying one for a page load would break the app.
      if ((res.ok && !res.redirected) || res.type === 'opaque') return cache.put(req, res.clone()).then(() => res);
      return res;
    })
    .catch(() => null);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  const res = await network;
  return res || new Response('You are offline.', { status: 503, headers: { 'Content-Type': 'text/plain' } });
}
