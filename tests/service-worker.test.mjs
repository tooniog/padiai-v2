import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../service-worker.js', import.meta.url), 'utf8');
const ORIGIN = 'https://padi.test';
const CACHE = 'padiai-v17';

function mime(path) {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.png')) return 'image/png';
  return 'application/manifest+json';
}

function harness({ timeoutMs } = {}) {
  const listeners = new Map();
  const stores = new Map();
  const networkCalls = [];
  let network = async url => {
    const path = new URL(url).pathname;
    return new Response(`network:${path}`, { headers: { 'content-type': mime(path) } });
  };
  const canonical = key => new URL(typeof key === 'string' ? key : key.url, ORIGIN).href;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async match(key) { return store.get(canonical(key))?.clone(); },
        async put(key, response) { store.set(canonical(key), response.clone()); }
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); }
  };
  const state = { skipped: false, claimed: false };
  vm.runInNewContext(source, {
    self: {
      location: { origin: ORIGIN },
      addEventListener: (name, listener) => listeners.set(name, listener),
      async skipWaiting() { state.skipped = true; },
      clients: { async claim() { state.claimed = true; } }
    },
    URL, Response, AbortController, caches,
    setTimeout: (fn, delay) => setTimeout(fn, timeoutMs ?? delay),
    clearTimeout,
    fetch: (url, options) => {
      networkCalls.push({ url, options });
      return network(url, options);
    }
  });
  return {
    stores, caches, networkCalls, state,
    setNetwork(fn) { network = fn; },
    offline() { network = async () => { throw new Error('offline'); }; },
    async lifecycle(name) {
      let result;
      listeners.get(name)({ waitUntil(promise) { result = promise; } });
      return result;
    },
    request(path, overrides = {}) {
      let result;
      const request = { url: new URL(path, ORIGIN).href, method: 'GET', mode: 'navigate', ...overrides };
      listeners.get('fetch')({ request, respondWith(promise) { result = promise; } });
      return result;
    }
  };
}

test('installation validates and stores only the public shell before activating', async () => {
  const h = harness();
  await h.lifecycle('install');
  const paths = [...h.stores.get(CACHE).keys()].map(url => new URL(url).pathname);
  assert.equal(paths.length, 15);
  for (const path of ['/index.html', '/tutor.html', '/lesson.html', '/quiz.html',
    '/privacy.html', '/education-os.html', '/assistant.js', '/assistant.css']) {
    assert.ok(paths.includes(path), path);
  }
  assert.equal(h.state.skipped, true);
  for (const call of h.networkCalls) {
    assert.equal(call.options.credentials, 'omit');
    assert.equal(call.options.redirect, 'error');
    assert.equal(new URL(call.url).search, '');
  }
});

test('a fresh install supports versioned lesson, quiz, tutor and app launch offline', async () => {
  const h = harness();
  await h.lifecycle('install');
  h.offline();
  for (const [url, content] of [
    ['/?v=17', '/index.html'], ['/lesson.html?v=14', '/lesson.html'],
    ['/quiz.html?v=3', '/quiz.html'], ['/tutor.html?v=3', '/tutor.html']
  ]) {
    const response = await h.request(url);
    assert.equal(response.status, 200);
    assert.equal(await response.text(), `network:${content}`);
  }
});

test('versioned assets use their exact public cached resource while offline', async () => {
  const h = harness();
  await h.lifecycle('install');
  h.offline();
  for (const path of ['/main.js', '/assistant.js', '/assistant.css']) {
    const response = await h.request(`${path}?v=17`, { mode: 'cors' });
    assert.equal(await response.text(), `network:${path}`);
    assert.notEqual(response.headers.get('content-type'), 'text/html');
  }
});

test('API, private, cross-origin, writes and user-specific query requests bypass the worker', async () => {
  const h = harness();
  for (const [path, overrides] of [
    ['/api/chat', {}], ['/api/chat?v=17', {}], ['/.env.local', {}],
    ['/.git/config', {}], ['/account', {}], ['/server/app.mjs', {}],
    ['https://external.test/index.html', {}], ['/index.html', { method: 'POST' }],
    ['/tutor.html?session=private', {}], ['/tutor.html?v=17&token=secret', {}],
    ['/tutor.html?v=17&v=18', {}], ['/main.js?v=17', { mode: 'navigate' }]
  ]) {
    assert.equal(h.request(path, overrides), undefined, path);
  }
  assert.equal(h.networkCalls.length, 0);
  assert.equal(h.stores.size, 0);
});

test('navigation refreshes from network and caches one canonical page across versions', async () => {
  const h = harness();
  await h.lifecycle('install');
  h.setNetwork(async () => new Response('updated tutor', { headers: { 'content-type': 'text/html' } }));
  const updated = await h.request('/tutor.html?v=18');
  assert.equal(await updated.text(), 'updated tutor');
  h.offline();
  assert.equal(await (await h.request('/tutor.html?v=19')).text(), 'updated tutor');
  const tutorKeys = [...h.stores.get(CACHE).keys()].filter(url => url.includes('/tutor.html'));
  assert.deepEqual(tutorKeys, [`${ORIGIN}/tutor.html`]);
});

test('a hanging navigation falls back within its bound and aborts its network request', async () => {
  const h = harness({ timeoutMs: 5 });
  await h.lifecycle('install');
  let signal;
  h.setNetwork((_, options) => { signal = options.signal; return new Promise(() => {}); });
  const response = await h.request('/tutor.html?v=17');
  assert.equal(await response.text(), 'network:/tutor.html');
  assert.equal(signal.aborted, true);
});

test('missing assets receive a non-HTML error, never the home page', async () => {
  const h = harness();
  h.offline();
  const response = await h.request('/assistant.js?v=17', { mode: 'cors' });
  assert.equal(response.status, 503);
  assert.match(response.headers.get('content-type'), /^text\/plain/);
  assert.equal(h.stores.get(CACHE)?.size ?? 0, 0);
});

test('HTML error or login responses cannot poison a script cache', async () => {
  for (const status of [200, 404, 500]) {
    const h = harness();
    h.setNetwork(async () => new Response('<html>error</html>', {
      status, headers: { 'content-type': 'text/html' }
    }));
    const response = await h.request('/main.js', { mode: 'cors' });
    assert.equal(response.status, 503);
    assert.equal(h.stores.get(CACHE)?.size ?? 0, 0);
  }
});

test('private and no-store responses can be displayed but never persist offline', async () => {
  for (const directive of ['private, max-age=10', 'public, no-store']) {
    const h = harness();
    h.setNetwork(async () => new Response('fresh page', {
      headers: { 'content-type': 'text/html', 'cache-control': directive }
    }));
    assert.equal(await (await h.request('/tutor.html')).text(), 'fresh page');
    h.offline();
    assert.equal((await h.request('/tutor.html')).status, 503);
    assert.equal(h.stores.get(CACHE)?.size ?? 0, 0);
  }
});

test('cache quota or storage failures do not block valid network pages and assets', async () => {
  const h = harness();
  h.caches.open = async () => ({
    async match() { throw new Error('storage unavailable'); },
    async put() { throw new Error('quota exceeded'); }
  });
  const page = await h.request('/tutor.html');
  assert.equal(page.status, 200);
  assert.equal(await page.text(), 'network:/tutor.html');
  const script = await h.request('/assistant.js?v=17', { mode: 'cors' });
  assert.equal(script.status, 200);
  assert.equal(await script.text(), 'network:/assistant.js');
});

test('installation rejects wrong content types, redirects and private cache directives', async () => {
  for (const options of [
    { headers: { 'content-type': 'text/plain' } },
    { headers: { 'content-type': 'text/html', 'cache-control': 'private' } },
    { headers: { 'content-type': 'text/html', 'cache-control': 'no-store' } },
    { headers: { 'content-type': 'text/html' }, redirected: true }
  ]) {
    const h = harness();
    h.setNetwork(async url => {
      const path = new URL(url).pathname;
      if (path !== '/index.html') return new Response('asset', { headers: { 'content-type': mime(path) } });
      const response = new Response('bad page', options);
      if (options.redirected) Object.defineProperty(response, 'redirected', { value: true });
      return response;
    });
    await assert.rejects(h.lifecycle('install'), /Cannot cache public file/);
    assert.equal(h.state.skipped, false);
    assert.equal(h.stores.get(CACHE)?.size ?? 0, 0);
  }
});

test('activation deletes only obsolete Padi caches', async () => {
  const h = harness();
  for (const name of ['padiai-v14', 'padiai-v16', CACHE, 'another-product-v2']) await h.caches.open(name);
  await h.lifecycle('activate');
  assert.deepEqual([...h.stores.keys()].sort(), ['another-product-v2', CACHE].sort());
  assert.equal(h.state.claimed, true);
});

test('a wrongly typed cached asset is rejected instead of returning HTML', async () => {
  const h = harness();
  const cache = await h.caches.open(CACHE);
  await cache.put('/assistant.js', new Response('<html>poison</html>', { headers: { 'content-type': 'text/html' } }));
  h.offline();
  const response = await h.request('/assistant.js', { mode: 'cors' });
  assert.equal(response.status, 503);
  assert.match(response.headers.get('content-type'), /^text\/plain/);
});
