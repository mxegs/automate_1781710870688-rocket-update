const CACHE_VERSION = 2;
const CACHE_NAME = `ckc-app-v${CACHE_VERSION}`;
const SHELL_URLS = ['/login', '/manifest.webmanifest', '/assets/images/app_logo.png'];

/** How long before cached pages are treated as stale (6 hours). */
const MAX_PAGE_AGE_MS = 6 * 60 * 60 * 1000;

function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/assets/') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.webmanifest')
  );
}

function isNavigationRequest(request) {
  return request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html');
}

async function trimStalePages(cache) {
  const keys = await cache.keys();
  const now = Date.now();

  await Promise.all(
    keys.map(async (request) => {
      if (isStaticAsset(new URL(request.url).pathname)) return;

      const response = await cache.match(request);
      if (!response) return;

      const cachedAt = Number(response.headers.get('x-ckc-cached-at') || 0);
      if (cachedAt && now - cachedAt > MAX_PAGE_AGE_MS) {
        await cache.delete(request);
      }
    }),
  );
}

async function cacheResponse(cache, request, response) {
  if (!response.ok || response.type !== 'basic') return;

  const headers = new Headers(response.headers);
  headers.set('x-ckc-cached-at', String(Date.now()));

  await cache.put(
    request,
    new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    }),
  );
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheResponse(cache, request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || cache.match('/login') || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cacheResponse(cache, request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    networkPromise.catch(() => {});
    return cached;
  }

  const fresh = await networkPromise;
  return fresh || Response.error();
}

async function refreshShellCache() {
  const cache = await caches.open(CACHE_NAME);
  await trimStalePages(cache);

  await Promise.all(
    SHELL_URLS.map(async (url) => {
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          await cacheResponse(cache, new Request(url), response);
        }
      } catch {
        // Offline — keep existing cache
      }
    }),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(refreshShellCache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => refreshShellCache()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (event.data?.type === 'REFRESH_CACHE') {
    event.waitUntil(refreshShellCache());
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;

  if (isNavigationRequest(event.request) || url.pathname.startsWith('/_next/data/')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});
