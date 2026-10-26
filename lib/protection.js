import { createHash } from 'node:crypto';
import { PadiError } from './contracts.js';

const localCounters = new Map();
let activeRequests = 0;
export const isProduction = env => env.VERCEL === '1' || env.NODE_ENV === 'production';
export const aiEnabled = env => env.PADI_AI_ENABLED !== 'false' && (!isProduction(env) || env.PADI_AI_ENABLED === 'true');

export function protectionMode(env) {
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) return 'durable';
  if (isProduction(env)) return env.PADI_EDGE_RATE_LIMITED === 'true' ? 'edge' : 'unconfigured';
  return 'local';
}

export function configuration(env) {
  const protection = protectionMode(env);
  return { ready: Boolean(env.OPENAI_API_KEY?.trim()) && aiEnabled(env) && protection !== 'unconfigured', protection };
}

export function assertOrigin(req, env) {
  const origin = req.headers?.origin;
  const host = String(req.headers?.host ?? '').toLowerCase();
  const fetchSite = req.headers?.['sec-fetch-site'];
  if (fetchSite === 'cross-site') throw new PadiError(403, 'ORIGIN_DENIED', 'Open Padi directly to send this question.');
  if (!origin) {
    if (isProduction(env)) throw new PadiError(403, 'ORIGIN_DENIED', 'Open Padi directly to send this question.');
    if (!/^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)) throw new PadiError(403, 'ORIGIN_DENIED', 'Local development is limited to this computer.');
    return;
  }
  let parsed;
  try { parsed = new URL(origin); } catch { throw new PadiError(403, 'ORIGIN_DENIED', 'This request origin is invalid.'); }
  if (parsed.origin !== origin || parsed.username || parsed.password || !['https:', 'http:'].includes(parsed.protocol)) throw new PadiError(403, 'ORIGIN_DENIED', 'This request origin is invalid.');
  const configured = String(env.PADI_ALLOWED_ORIGINS ?? '').split(',').map(v => v.trim()).filter(Boolean);
  const sameHost = parsed.host.toLowerCase() === host && (parsed.protocol === 'https:' || (!isProduction(env) && /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host)));
  if (!sameHost && !configured.includes(origin)) throw new PadiError(403, 'ORIGIN_DENIED', 'Open Padi directly to send this question.');
}

function limitValue(raw, fallback, max) {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? Math.min(value, max) : fallback;
}

export async function checkRateLimit(req, env, fetchImpl = fetch, now = Date.now()) {
  const mode = protectionMode(env);
  if (mode === 'unconfigured') throw new PadiError(503, 'PROTECTION_REQUIRED', 'Padi is being prepared for safe public access. Please try again later.');
  const limits = {
    minute: limitValue(env.PADI_REQUESTS_PER_MINUTE, 8, 60),
    day: limitValue(env.PADI_REQUESTS_PER_DAY, 50, 500),
    global: limitValue(env.PADI_GLOBAL_DAILY_REQUESTS, 300, 10_000),
  };
  const ip = String(req.headers?.['x-vercel-forwarded-for'] ?? req.headers?.['x-real-ip'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0].trim().slice(0,128);
  const identity = createHash('sha256').update(env.PADI_LIMIT_SALT || env.OPENAI_API_KEY || 'local-development').update('\0' + ip).digest('hex').slice(0,32);
  const minute = Math.floor(now / 60_000);
  const day = Math.floor(now / 86_400_000);
  let counts;
  if (mode === 'durable') {
    let endpoint;
    try {
      endpoint = new URL(env.UPSTASH_REDIS_REST_URL);
      if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new Error();
    } catch { throw new PadiError(503, 'PROTECTION_UNAVAILABLE', 'Padi cannot safely accept another question right now.'); }
    const script = 'local r={} for i=1,3 do r[i]=redis.call("INCR",KEYS[i]); if r[i]==1 then redis.call("EXPIRE",KEYS[i],ARGV[i]) end end return r';
    try {
      const response = await fetchImpl(endpoint.href, {
        method: 'POST', headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['EVAL', script, '3', `padi:minute:${minute}:${identity}`, `padi:day:${day}:${identity}`, `padi:global:${day}`, '120', '172800', '172800']),
        signal: AbortSignal.timeout(4000),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      counts = data.result;
      if (!Array.isArray(counts) || counts.length !== 3 || !counts.every(Number.isFinite)) throw new Error();
    } catch { throw new PadiError(503, 'PROTECTION_UNAVAILABLE', 'Padi cannot safely accept another question right now. Please try again later.'); }
  } else {
    // Local/verified-edge guard is a backstop, not a distributed budget guarantee.
    if (localCounters.size > 5000) {
      for (const [key, item] of localCounters) if (item.expires < now) localCounters.delete(key);
      if (localCounters.size > 5000) throw new PadiError(429, 'BUSY', 'Padi is busy. Please try again in a minute.');
    }
    const entries = [[`m:${minute}:${identity}`, now + 120_000], [`d:${day}:${identity}`, now + 172_800_000], [`g:${day}`, now + 172_800_000]];
    counts = entries.map(([key, expires]) => {
      const item = localCounters.get(key) ?? { count: 0, expires };
      item.count += 1;
      localCounters.set(key, item);
      return item.count;
    });
  }
  if (counts[0] > limits.minute || counts[1] > limits.day || counts[2] > limits.global) throw new PadiError(429, 'RATE_LIMITED', 'Padi has reached a usage limit. Please take a break and try again later.', { retryAfter: counts[0] > limits.minute ? 60 : 3600 });
  return mode;
}

export function acquireCapacity() {
  if (activeRequests >= 8) throw new PadiError(429, 'BUSY', 'Padi is helping several people. Please try again shortly.', { retryAfter: 10 });
  activeRequests += 1;
  return () => { activeRequests = Math.max(0, activeRequests - 1); };
}

export function clearLocalLimitsForTests() { localCounters.clear(); activeRequests = 0; }
