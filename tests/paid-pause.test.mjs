import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createChatHandler } from '../api/chat.js';
import { createStatusHandler } from '../api/status.js';
import { runAssistant } from '../lib/intelligence.js';
import { validatePayload } from '../lib/contracts.js';

const env = { VERCEL: '1', VERCEL_ENV: 'production', PADI_AI_ENABLED: 'false', OPENAI_API_KEY: 'placeholder-never-send', PADI_EDGE_RATE_LIMITED: 'true' };
function response() {
  const res = new EventEmitter();
  res.headers = {}; res.writableEnded = false;
  res.setHeader = (key, value) => { res.headers[key.toLowerCase()] = value; };
  res.end = body => { res.body = JSON.parse(body); res.writableEnded = true; };
  return res;
}
function request(message, mode = 'ask') {
  return { method: 'POST', headers: { host: 'padiai.vercel.app', origin: 'https://padiai.vercel.app', 'content-type': 'application/json' }, body: { message, mode } };
}

test('paid pause blocks all model task modes even when a working-looking key and protection exist', async () => {
  let calls = 0;
  const handler = createChatHandler({ env, fetchImpl: async () => { calls++; throw new Error('A paused app must not contact the provider'); } });
  for (const mode of ['ask', 'learn', 'work', 'plan', 'research']) {
    const res = response();
    await handler(request('Explain fractions with an example.', mode), res);
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.error.code, 'AI_PAUSED');
    assert.ok(!JSON.stringify(res.body).includes(env.OPENAI_API_KEY));
  }
  assert.equal(calls, 0);
});

test('free time, date and calculation tools continue with no provider calls while paid AI is paused', async () => {
  let calls = 0;
  const handler = createChatHandler({ env, now: () => new Date('2026-10-26T12:00:00Z'), fetchImpl: async () => { calls++; throw new Error('No paid call allowed'); } });
  for (const [message, expected] of [['What time is it in Lagos?', /1:00:00/], ['What is the date in Nigeria?', /26 October 2026/], ['15% of 20000', /3,000/]]) {
    const res = response(); await handler(request(message), res);
    assert.equal(res.statusCode, 200);
    assert.match(res.body.answer, expected);
    assert.equal(res.body.meta.modelCalls, 0);
  }
  assert.equal(calls, 0);
});

test('direct evaluation and script entry points also respect paid pause', async () => {
  let calls = 0;
  await assert.rejects(runAssistant(validatePayload({ message: 'Draft a customer reply.', mode: 'work' }), { env, fetchImpl: async () => { calls++; } }), { code: 'AI_PAUSED' });
  assert.equal(calls, 0);
});

test('paused status distinguishes free tools from paid AI and research', () => {
  const res = response(); createStatusHandler(env)({ method: 'GET' }, res);
  assert.equal(res.body.ready, false);
  assert.equal(res.body.aiPaused, true);
  assert.equal(res.body.freeToolsAvailable, true);
  assert.equal(res.body.researchAvailable, false);
  assert.ok(!res.body.features.includes('ai-help'));
  assert.ok(!res.body.features.includes('web-research'));
  assert.ok(!JSON.stringify(res.body).includes(env.OPENAI_API_KEY));
});
