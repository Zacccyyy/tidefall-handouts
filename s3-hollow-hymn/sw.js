// Eight Bells offline cache. Built by build_site.py; the version is a hash of every file.
// Cache-first from one versioned cache, so the page, bells and hymn always come from the
// same build. A new deploy installs a new cache, which takes over once old tabs are closed.
const VERSION = 'eight-bells-05329e739274';
const FILES = ["./", "index.html", "manifest.webmanifest", "hymn-3a620991fa.bin", "bells/bell-1.mp3", "bells/bell-2.mp3", "bells/bell-3.mp3", "bells/bell-4.mp3", "bells/bell-5.mp3", "bells/bell-6.mp3", "bells/bell-7.mp3", "bells/bell-8.mp3", "icon-180.png", "icon-192.png", "icon-512.png", "fonts/cinzel-400.woff2", "fonts/cinzel-700.woff2", "fonts/cormorant-500.woff2", "fonts/cormorant-500i.woff2"];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c =>
    Promise.all(FILES.map(f => fetch(f, {cache: 'reload'}).then(r => {
      if (!r.ok) throw new Error(f + ' ' + r.status);
      return c.put(f, r);
    })))));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k.startsWith('eight-bells-') && k !== VERSION).map(k => caches.delete(k)))));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;           // fonts etc. go to the network
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, {ignoreSearch: true})
      || (e.request.mode === 'navigate' ? await c.match('./') : undefined);
    return hit || fetch(e.request);
  }));
});
