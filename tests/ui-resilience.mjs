/** Mock-only resilience checks. Run: node tests/ui-resilience.mjs
 * Optional PADI_PLAYWRIGHT_MODULE (absolute module file) and PADI_CHROME_PATH.
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
const errors = [];
const passed = [];
const record = name => passed.push(name);

try {
  await mkdir(output, { recursive: true });
  await rm(resolve(output, 'resilience-failure.png'), { force: true });
  await new Promise((done, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', done); });
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ serviceWorkers: 'block' });
  await context.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
  page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/status', route => route.fulfill({ json: { ready: true, researchAvailable: false } }));
  const calls = [];
  let phase = 'error';
  const answer = { answer: '<img src=x onerror=alert(1)> should appear as plain text.', practice: null, sources: [], warnings: [], meta: { searched: false } };
  await page.route('**/api/chat', async route => {
    calls.push(route.request().postDataJSON());
    if (phase === 'error') await route.fulfill({ status: 503, json: { error: { code: 'UNKNOWN_PROVIDER_ERROR', message: 'private provider error' } } });
    else if (phase === 'grounding-error') await route.fulfill({ status: 503, json: { error: { code: 'GROUNDING_UNAVAILABLE', message: 'private provider grounding detail' } } });
    else if (phase === 'citations') await route.fulfill({ json: {
      answer: 'This checked claim has a source [1]. Missing source [9] stays plain text. <img src=x onerror=alert(1)>',
      practice: null, warnings: [],
      sources: [{ title: 'Evidence for the checked claim', url: 'https://example.com/actual-evidence' }],
      meta: { searched: true }
    } });
    else if (phase === 'cancel') {
      await new Promise(resolve => setTimeout(resolve, 1500));
      await route.fulfill({ json: answer }).catch(() => {});
    } else await route.fulfill({ json: answer });
  });
  await page.goto(base + '/tutor.html');
  await page.waitForFunction(() => !document.querySelector('#send').disabled);
  await page.locator('#message').fill('Help with a work reply');
  await page.locator('#send').click();
  await page.locator('#error-box').waitFor();
  assert.equal(await page.locator('.chat-message.user').count(), 1);
  assert.equal((await page.locator('#error-text').textContent()).includes('private provider'), false);
  record('private provider error is hidden behind a useful message');
  phase = 'success';
  await page.locator('#message').fill('Keep this next question draft');
  await page.locator('#retry').click();
  await page.locator('.chat-message.assistant').waitFor();
  assert.equal(await page.locator('.chat-message.user').count(), 1);
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(await page.locator('#message').inputValue(), 'Keep this next question draft');
  record('retry resends original request once and preserves a new draft');
  assert.equal(await page.locator('.chat-message.assistant img').count(), 0);
  assert.equal((await page.locator('.message-body').last().textContent()).startsWith('<img'), true);
  record('HTML in an answer is rendered as inert text');
  phase = 'citations';
  await page.locator('#message').fill('Show a sourced answer');
  await page.locator('#send').click();
  await page.waitForFunction(() => document.querySelectorAll('.chat-message.assistant').length === 2);
  const sourcedBody = page.locator('.chat-message.assistant .message-body').last();
  assert.equal(await sourcedBody.locator('a').count(), 1);
  assert.equal(await sourcedBody.locator('a').textContent(), '[1]');
  assert.equal(await sourcedBody.locator('a').getAttribute('href'), 'https://example.com/actual-evidence');
  assert.equal(await sourcedBody.locator('a').getAttribute('rel'), 'noopener noreferrer');
  assert.equal((await sourcedBody.textContent()).includes('[9]'), true);
  assert.equal(await sourcedBody.locator('a', { hasText: '[9]' }).count(), 0);
  assert.equal(await sourcedBody.locator('img').count(), 0);
  record('searched numeric citation maps to its actual source; missing citation and hostile HTML stay inert');
  phase = 'success';
  answer.answer = 'A'.repeat(9000);
  await page.locator('#message').fill('Show a long explanation');
  await page.locator('#send').click();
  await page.waitForFunction(() => document.querySelectorAll('.chat-message.assistant').length === 3);
  await page.locator('.notes-panel summary').click();
  await page.locator('#notes').fill('界'.repeat(8000));
  phase = 'cancel';
  await page.locator('#message').fill('Slow question');
  await page.locator('#send').click();
  await page.locator('#cancel').click();
  await page.locator('#error-box').waitFor();
  assert.match(await page.locator('#error-text').textContent(), /Stopped waiting/);
  assert.equal(await page.locator('#send').isDisabled(), false);
  record('cancel restores the composer');
  const bounded = calls.at(-1);
  assert.equal(bounded.history.every(item => item.content.length <= 6000), true);
  assert.equal(bounded.history.some(item => item.content.startsWith('[Earlier reply shortened]')), true);
  assert.equal(new TextEncoder().encode(JSON.stringify(bounded)).byteLength <= 32768, true);
  record('history and multibyte request size are bounded; shortened replies are labelled');
  await page.locator('#new-task').click();
  assert.equal(await page.locator('.chat-message').count(), 0);
  record('new conversation clears the transcript');
  phase = 'grounding-error';
  await page.locator('#message').fill('Find evidence for a current question');
  await page.locator('#send').click();
  await page.locator('#error-box').waitFor();
  assert.match(await page.locator('#error-text').textContent(), /could not confirm reliable sources/);
  assert.equal((await page.locator('#error-text').textContent()).includes('private provider'), false);
  record('known grounding error explains the verification problem without provider details');
  await page.locator('#new-task').click();
  const callCount = calls.length;
  await page.locator('#message').fill('Keep this unsent question');
  await page.locator('#notes').fill('界'.repeat(12000));
  await page.locator('#send').click();
  assert.equal(await page.locator('.chat-message').count(), 0);
  assert.equal(await page.locator('#message').inputValue(), 'Keep this unsent question');
  assert.equal(calls.length, callCount);
  assert.match(await page.locator('#error-text').textContent(), /too much text/);
  record('oversize notes are rejected before a request or partial transcript');
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', { value() { throw Error('blocked'); } });
    Object.defineProperty(Storage.prototype, 'setItem', { value() { throw Error('blocked'); } });
    Object.defineProperty(Storage.prototype, 'removeItem', { value() { throw Error('blocked'); } });
  });
  await page.reload();
  await page.waitForFunction(() => !document.querySelector('#send').disabled);
  await page.locator('#open-profile').click();
  await page.locator('#remember').check();
  await page.locator('#profile-form button[type=submit]').click();
  await page.locator('#open-profile').click();
  assert.equal(await page.locator('#remember').isChecked(), false);
  record('unavailable browser storage remains usable without false saving claims');
  await page.locator('#clear-data').click();
  assert.match(await page.locator('#data-status').textContent(), /blocked saved-data deletion/);
  record('blocked browser-data deletion is explicitly disclosed');
  assert.deepEqual(unexpectedAPI, [], 'an API request escaped the mock routes');
  assert.deepEqual(errors, []);
  const result = { suite: 'ui-resilience', mockOnly: true, passed, pageErrors: errors };
  await writeFile(resolve(output, 'resilience-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  await writeFile(resolve(output, 'resilience-results.json'), JSON.stringify({ suite: 'ui-resilience', mockOnly: true, passed, pageErrors: errors, failed: String(error) }, null, 2) + '\n').catch(() => {});
  if (page) await page.screenshot({ path: resolve(output, 'resilience-failure.png'), fullPage: true }).catch(() => {});
  throw error;
} finally {
  try { if (browser) await browser.close(); }
  finally {
    server.closeAllConnections();
    if (server.listening) await new Promise(resolve => server.close(resolve));
  }
}
