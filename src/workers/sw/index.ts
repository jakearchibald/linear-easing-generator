// Give TypeScript the correct global.
declare var self: ServiceWorkerGlobalScope;

const isSafari =
  /Safari\//.test(navigator.userAgent) &&
  !/Chrom(e|ium)\//.test(navigator.userAgent);

// I keep getting reports of stuck pages from iOS Safari users.
// It happens when there's a service worker update.
// There's some kind of browser bug there that's intermittent, and difficult to reproduce.
// So, for now, I'm going to ditch service workers in Safari.
if (isSafari) {
  self.registration.unregister();
}

const versionedCache = 'static-' + VERSION;
const expectedCaches = [versionedCache];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async function () {
      const cache = await caches.open(versionedCache);
      await cache.addAll(
        // Don't cache the inlined script
        [...ASSETS.filter((item) => !item.startsWith('c/client-')), '/'],
      );
    })(),
  );
});

self.addEventListener('activate', (event) => {
  self.clients.claim();

  event.waitUntil(
    (async function () {
      // Remove old caches.
      const promises = (await caches.keys())
        .filter((cacheName) => !expectedCaches.includes(cacheName))
        .map((cacheName) => caches.delete(cacheName));

      await Promise.all(promises);
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const majorVersionRequirement = Number(url.searchParams.get('v'));

  // If the link is targeting some future version, go to the network.
  if (majorVersionRequirement && majorVersionRequirement > __MAJOR_VERSION__) {
    return;
  }

  // Don't care about other-origin URLs.
  if (url.origin !== location.origin) return;
  // We only care about GET.
  if (event.request.method !== 'GET') return;

  const request = url.pathname === '/' ? '/' : event.request;

  event.respondWith(
    (async () => {
      const response = await caches.match(request);
      if (response) return response;
      return fetch(request);
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
});

// To convince TypeScript this is a module
export {};
