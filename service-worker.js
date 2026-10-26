const CACHE_PREFIX = 'padiai-';
const CACHE_NAME = 'padiai-v17.2';
const NETWORK_TIMEOUT_MS = 4000;

// Only these public files may be served from offline storage. API responses,
// account data and arbitrary URLs never enter this cache.
const PUBLIC_FILES = new Map([
  ['/index.html', 'html'],
  ['/lesson.html', 'html'],
  ['/quiz.html', 'html'],
  ['/tutor.html', 'html'],
  ['/privacy.html', 'html'],
  ['/education-os.html', 'html'],
  ['/main.js', 'js'],
  ['/assistant.js', 'js'],
  ['/style.css', 'css'],
  ['/assistant.css', 'css'],
  ['/manifest.json', 'json'],
  ['/icon-192.png', 'png'],
  ['/icon-512.png', 'png'],
  ['/icon-maskable-512.png', 'png'],
  ['/apple-touch-icon.png', 'png']
]);

const CONTENT_TYPES = {
  html: ['text/html'],
  js: ['text/javascript', 'application/javascript'],
  css: ['text/css'],
  json: ['application/json', 'application/manifest+json'],
  png: ['image/png']
};

function publicFile(request) {
  if (request.method !== 'GET') return null;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return null;

  // A bounded version marker is safe to normalize; user- or session-specific
  // query parameters must retain their normal network behavior.
  const query = [...url.searchParams.entries()];
  if (query.length && (query.length !== 1 || query[0][0] !== 'v' ||
      !/^[a-zA-Z0-9._-]{1,32}$/.test(query[0][1]))) return null;

  const path = url.pathname === '/' ? '/index.html' : url.pathname;
  const kind = PUBLIC_FILES.get(path);
  if (!kind) return null;
  if (request.mode === 'navigate' && kind !== 'html') return null;
  return { path, kind };
}

function validResponse(response, file) {
  if (!response || response.status !== 200 || response.redirected ||
      response.type === 'opaque' || response.type === 'opaqueredirect') return false;
  const type = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  return CONTENT_TYPES[file.kind].includes(type);
}

function cacheable(response, file) {
  if (!validResponse(response, file)) return false;
  return !/(?:^|,)\s*(?:private|no-store)\b/i.test(response.headers.get('cache-control') || '');
}

async function fetchPublic(file) {
  const controller = new AbortController();
  let timer;
  try {
    return await Promise.race([
      fetch(new URL(file.path, self.location.origin).href, {
        credentials: 'omit',
        redirect: 'error',
        cache: 'no-store',
        signal: controller.signal
      }),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error('Public file request timed out'));
        }, NETWORK_TIMEOUT_MS);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function unavailable() {
  return new Response('This file is unavailable offline. Reconnect and try again.', {
    status: 503,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
  });
}

async function cachedFile(file) {
  const cache = await caches.open(CACHE_NAME);
  const response = await cache.match(file.path);
  return cacheable(response, file) ? response : null;
}

async function savePublic(response, file) {
  if (!cacheable(response, file)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(file.path, response.clone());
}

async function servePage(file) {
  try {
    const response = await fetchPublic(file);
    if (validResponse(response, file)) {
      // A full cache must not prevent a usable network response reaching users.
      await savePublic(response, file).catch(() => {});
      return response;
    }
  } catch (_) {
    // An already verified copy of this same page is the only fallback.
  }
  return await cachedFile(file).catch(() => null) || unavailable();
}

async function serveAsset(file) {
  const cached = await cachedFile(file).catch(() => null);
  if (cached) return cached;
  try {
    const response = await fetchPublic(file);
    if (validResponse(response, file)) {
      await savePublic(response, file).catch(() => {});
      return response;
    }
  } catch (_) {
    // Never substitute an HTML page for a script, stylesheet or other asset.
  }
  return unavailable();
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Validate the entire shell before writing it; a login/error page must not
    // silently become an offline application file.
    const entries = await Promise.all([...PUBLIC_FILES].map(async ([path, kind]) => {
      const file = { path, kind };
      const response = await fetchPublic(file);
      if (!cacheable(response, file)) throw new Error(`Cannot cache public file: ${path}`);
      return [path, response];
    }));
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(entries.map(([path, response]) => cache.put(path, response)));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const file = publicFile(event.request);
  if (!file) return;
  event.respondWith(event.request.mode === 'navigate' ? servePage(file) : serveAsset(file));
});
