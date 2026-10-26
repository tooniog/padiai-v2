/** Mock-only UI checks. Run: node tests/ui-flows.mjs
 * Optional PADI_PLAYWRIGHT_MODULE (absolute module file) and PADI_CHROME_PATH.
 * Uses already-installed browser tooling. Never calls a live AI provider.
 */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import { PUBLIC_FILES } from '../scripts/public-files.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'evaluations/ui');
const playwrightModule = process.env.PADI_PLAYWRIGHT_MODULE || '/Users/toonioguntayo/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const { chromium } = await import(pathToFileURL(playwrightModule).href);
const executablePath = process.env.PADI_CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const allowed = new Set(PUBLIC_FILES);
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const unexpectedAPI = [];
const server = createServer(async (req, res) => {
  try {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname.startsWith('/api/')) unexpectedAPI.push(pathname);
    const file = decodeURIComponent(pathname).replace(/^\//, '') || 'index.html';
    if (!allowed.has(file)) { res.writeHead(404).end('Not found'); return; }
    const bytes = await readFile(resolve(root, file));
    res.setHeader('Content-Type', `${types[extname(file)] || 'application/octet-stream'}; charset=utf-8`);
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404).end('Not found'); }
});
let browser;
let page;
const passed = [];
const screenshots = [];
const errors = [];
const record = name => passed.push(name);

try {
  await mkdir(output, { recursive: true });
  await rm(resolve(output, 'flows-failure.png'), { force: true });
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  // Any accidental remote request is blocked; API responses below are local fixtures.
  await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/status', route => route.fulfill({ json: { ready: true, researchAvailable: true } }));
  const requests = [];
  const answer = {
    answer: 'Start by isolating x. Subtract 3 from both sides.\nTry this short question.',
    strategy: 'PRACTISE',
    practice: { id: 'linear-1', topic: 'Linear equations', question: 'What is x if x + 3 = 5?', options: ['2', '8', '3'], correctIndex: 0, explanation: 'Subtract 3 from both sides: x = 2.' },
    sources: [{ title: 'Trusted source', url: 'https://example.com/reference' }, { title: 'Unsafe link', url: 'javascript:alert(1)' }],
    meta: { id: 'fixture-one', model: 'mock-only', grounding: 'general', searched: false, generatedAt: '2026-10-25T12:00:00Z' }, warnings: []
  };
  await page.route('**/api/chat', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ json: answer });
  });

  for (const [width, height, label] of [[1440, 1000, 'desktop'], [375, 812, 'mobile']]) {
    await page.setViewportSize({ width, height });
    await page.goto(base + '/');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `landing overflows at ${width}px`);
    assert.equal(await page.locator('.home-nav .brand-logo').getAttribute('src'), '/icon-192.png');
    assert.equal(await page.locator('.home-nav .brand-logo').evaluate(image => image.complete && image.naturalWidth > 0), true);
    assert.equal(await page.locator('.orbit-core img').getAttribute('src'), '/icon-512.png');
    assert.equal(await page.locator('.orbit-core img').evaluate(image => image.complete && image.naturalWidth > 0), true);
    assert.equal(await page.locator('.home-footer .brand-logo').count(), 1);
    assert.equal(await page.locator('.brand-symbol').count(), 0);
    const file = `landing-${label}.png`;
    await page.screenshot({ path: resolve(output, file), fullPage: true });
    screenshots.push(`evaluations/ui/${file}`);
    record(`landing ${width}px: original logo loaded, no horizontal overflow`);
  }
  for (const [width, height, label] of [[1440, 1000, 'desktop'], [375, 812, 'mobile']]) {
    await page.setViewportSize({ width, height });
    await page.goto(base + '/tutor.html?mode=learn&q=Help%20with%20algebra');
    await page.waitForFunction(() => !document.querySelector('#send').disabled);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `assistant overflows at ${width}px`);
    assert.equal(await page.locator('.sidebar .brand-logo').getAttribute('src'), '/icon-192.png');
    assert.equal(await page.locator('.sidebar .brand-logo').evaluate(image => image.complete && image.naturalWidth > 0), true);
    assert.equal(await page.locator('.brand-symbol').count(), 0);
    const file = `assistant-${label}.png`;
    await page.screenshot({ path: resolve(output, file), fullPage: true });
    screenshots.push(`evaluations/ui/${file}`);
    record(`assistant ${width}px: original logo loaded, no horizontal overflow`);
  }
  for (const file of ['privacy.html', 'education-os.html']) {
    await page.goto(`${base}/${file}`);
    assert.equal(await page.locator('.brand-logo').getAttribute('src'), '/icon-192.png');
    assert.equal(await page.locator('.brand-logo').evaluate(image => image.complete && image.naturalWidth > 0), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
    assert.equal(await page.locator('.brand-symbol').count(), 0);
    const screenshot = `${file.replace('.html', '')}-mobile.png`;
    await page.screenshot({ path: resolve(output, screenshot), fullPage: true });
    screenshots.push(`evaluations/ui/${screenshot}`);
    record(`${file}: original logo loaded, no horizontal overflow at 375px`);
  }
  await page.goto(base + '/tutor.html?mode=learn&q=Help%20with%20algebra');
  await page.waitForFunction(() => !document.querySelector('#send').disabled);
  assert.equal(await page.locator('#message').inputValue(), 'Help with algebra');
  assert.equal(await page.locator('[data-mode=learn]').getAttribute('aria-pressed'), 'true');
  assert.equal(requests.length, 0);
  record('mode and draft URL parameters do not auto-submit');
  assert.equal(await page.evaluate(() => localStorage.getItem('padi.assistant.memory.v1')), null);

  await page.locator('#send').click();
  await page.locator('.practice-option').first().waitFor();
  assert.equal(requests[0].mode, 'learn');
  assert.equal(await page.locator('a[href^="javascript:"]').count(), 0);
  assert.equal(await page.locator('.answer-details a').count(), 1);
  record('unsafe source protocol filtered');
  await page.locator('.practice-option').first().click();
  await page.locator('#show-progress').click();
  assert.equal(await page.locator('#attempt-count').textContent(), '1');
  assert.equal(await page.locator('#correct-count').textContent(), '1');
  await page.locator('#progress-dialog .close-dialog').click();
  await page.locator('#message').fill('One more question');
  await page.locator('#send').click();
  await page.waitForFunction(() => document.querySelectorAll('.chat-message.assistant').length === 2);
  assert.equal(requests[1].history.some(item => item.content.includes('Practice attempt') && item.content.includes('My answer: 2') && item.content.includes('correct')), true, 'next request misses actual practice evidence');
  await page.locator('#show-progress').click();
  assert.equal(await page.locator('#attempt-count').textContent(), '1', 'duplicate practice counted');
  await page.locator('#progress-dialog .close-dialog').click();
  record('actual practice attempt visible, sent to tutor and counted once');
  assert.equal(await page.evaluate(() => localStorage.getItem('padi.assistant.memory.v1')), null, 'memory-off persists transcript');
  record('memory off: no transcript persistence');

  await page.locator('#open-profile').click();
  await page.locator('#remember').check();
  await page.locator('#subject').fill('Mathematics');
  await page.locator('#profile-form button[type=submit]').click();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('padi.assistant.memory.v1')).remember), true);
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('#send').disabled);
  assert.equal(await page.locator('.chat-message.assistant').count(), 2);
  assert.equal(await page.locator('#resume-banner').isVisible(), true);
  await page.locator('#open-profile').click();
  assert.equal(await page.locator('#subject').inputValue(), 'Mathematics');
  record('opt-in persistence, profile editing and resumed conversation');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#export-data').click()]);
  assert.match(download.suggestedFilename(), /^padi-my-data/);
  record('data export produces a download');
  await page.evaluate(() => {
    for (const key of ['naija_ai_lang', 'naija_ai_track', 'naija_ai_score']) { localStorage.setItem(key, 'test'); sessionStorage.setItem(key, 'test'); }
  });
  await page.locator('#clear-data').click();
  assert.equal(await page.evaluate(() => ['naija_ai_lang', 'naija_ai_track', 'naija_ai_score'].every(key => localStorage.getItem(key) === null && sessionStorage.getItem(key) === null)), true, 'legacy library data remains');
  assert.equal(await page.evaluate(() => localStorage.getItem('padi.assistant.memory.v1')), null);
  assert.equal(await page.locator('.chat-message').count(), 0);
  record('delete clears assistant and legacy library local/session data');
  await page.locator('#profile-dialog .close-dialog').click();
  await page.evaluate(() => localStorage.setItem('padi.assistant.memory.v1', '{broken'));
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('#send').disabled);
  assert.equal(await page.locator('.chat-message').count(), 0);
  assert.equal(await page.evaluate(() => localStorage.getItem('padi.assistant.memory.v1')), null);
  record('corrupt saved memory recovers cleanly');
  await page.route('**/api/status', route => route.fulfill({ json: { ready: false, researchAvailable: false } }));
  await page.reload();
  await page.waitForFunction(() => document.querySelector('#request-status').textContent.includes('temporarily unavailable'));
  assert.equal(await page.locator('#send').isDisabled(), true);
  record('unavailable service is clearly disclosed and sending disabled');
  await page.route('**/api/status', route => route.fulfill({ json: { ready: false, researchAvailable: false, aiPaused: true, freeToolsAvailable: true } }));
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('#service-notice').hidden);
  assert.equal(await page.locator('#send').isDisabled(), false);
  assert.equal(await page.locator('[data-mode=research]').isDisabled(), true);
  assert.equal(await page.locator('[data-mode=learn]').isDisabled(), true);
  assert.match(await page.locator('#starters').innerText(), /Lagos time/);
  record('paid pause is disclosed while free tools remain usable and paid modes are disabled');
  await page.route('**/api/chat', route => {
    const body = route.request().postDataJSON();
    return body.message === '15% of 20000'
      ? route.fulfill({ json: { answer: '15% of 20000 = 3,000.', practice: null, sources: [], warnings: [], meta: { model: 'local-tools', grounding: 'calculated', searched: false } } })
      : route.fulfill({ status: 503, json: { error: { code: 'AI_PAUSED', message: 'Paid AI is paused.' } } });
  });
  await page.locator('#message').fill('15% of 20000'); await page.locator('#send').click();
  await page.waitForFunction(() => document.querySelector('.chat-message.assistant')?.textContent.includes('3,000'));
  assert.equal(await page.locator('#service-notice').isVisible(), true);
  record('a free calculation completes while the paid-pause notice stays visible');
  await page.locator('#message').fill('Draft a customer reply.'); await page.locator('#send').click();
  await page.waitForFunction(() => !document.querySelector('#error-box').hidden);
  assert.match(await page.locator('#error-text').innerText(), /AI replies and online research are paused/);
  assert.equal(await page.locator('#retry').isVisible(), false);
  await page.screenshot({ path: resolve(output, 'paid-paused-mobile.png'), fullPage: true });
  screenshots.push('evaluations/ui/paid-paused-mobile.png');
  record('unsupported paid tasks explain the pause without encouraging a paid retry');
  assert.deepEqual(unexpectedAPI, [], 'an API request escaped the mock routes');
  assert.deepEqual(errors, []);
  const result = { suite: 'ui-flows', mockOnly: true, passed, screenshots, pageErrors: errors };
  await writeFile(resolve(output, 'flows-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  await writeFile(resolve(output, 'flows-results.json'), JSON.stringify({ suite: 'ui-flows', mockOnly: true, passed, screenshots, pageErrors: errors, failed: String(error) }, null, 2) + '\n').catch(() => {});
  if (page) await page.screenshot({ path: resolve(output, 'flows-failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  try { if (browser) await browser.close(); }
  finally {
    server.closeAllConnections();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
}
