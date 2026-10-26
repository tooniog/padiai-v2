import { configuration } from '../lib/protection.js';

export function createStatusHandler(env = process.env) {
  return function handler(req, res) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.setHeader('Allow', 'GET, HEAD'); res.statusCode = 405;
      res.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use GET to check availability.' } })); return;
    }
    const config = configuration(env);
    const body = { ready: config.ready, researchAvailable: config.ready, deploymentMode: 'consumer', institutionConnected: false, memory: 'browser-only', protection: config.protection, previewOnly: config.protection === 'protected-preview', usageLimitScope: config.protection === 'durable' ? 'distributed' : config.protection === 'unconfigured' ? 'not-configured' : 'instance-backstop', features: ['learning-missions', 'practice', 'pasted-notes', 'lagos-clock', 'percentage-calculator', ...(config.ready ? ['ai-help', 'web-research'] : [])] };
    res.statusCode = 200;
    res.end(req.method === 'HEAD' ? undefined : JSON.stringify(body));
  };
}

export default createStatusHandler();
