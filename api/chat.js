import { PadiError, readBody } from '../lib/contracts.js';
import { acquireCapacity, assertOrigin, checkRateLimit, configuration } from '../lib/protection.js';
import { localResponse, runAssistant } from '../lib/intelligence.js';

export function createChatHandler({ env = process.env, fetchImpl = fetch, now = () => new Date() } = {}) {
  return async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
    let release;
    const controller = new AbortController();
    const onClose = () => { if (!res.writableEnded) controller.abort(); };
    res.on?.('close', onClose);
    try {
      if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); throw new PadiError(405, 'METHOD_NOT_ALLOWED', 'Use POST to send a question.'); }
      assertOrigin(req, env);
      const payload = await readBody(req);
      const clock = now();
      const local = localResponse(payload, clock);
      if (local) { res.statusCode = 200; res.end(JSON.stringify(local)); return; }
      if (env.PADI_AI_ENABLED === 'false') throw new PadiError(503, 'AI_PAUSED', 'AI replies and online research are paused. Free lessons, Lagos time/date and percentage calculations are still available.');
      if (!configuration(env).ready) throw new PadiError(503, 'AI_NOT_CONFIGURED', 'Padi’s AI is not available yet. You can still use the learning missions and quizzes.');
      await checkRateLimit(req, env, fetchImpl, clock.getTime());
      release = acquireCapacity();
      const result = await runAssistant(payload, { env, fetchImpl, now: clock, signal: controller.signal });
      if (!controller.signal.aborted) { res.statusCode = 200; res.end(JSON.stringify(result)); }
    } catch (error) {
      if (controller.signal.aborted || res.writableEnded) return;
      const known = error instanceof PadiError;
      res.statusCode = known ? error.status : 500;
      if (known && error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter));
      res.end(JSON.stringify({ error: { code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'Padi could not complete this request. Please try again.' } }));
    } finally {
      release?.();
      res.off?.('close', onClose);
    }
  };
}

export default createChatHandler();
