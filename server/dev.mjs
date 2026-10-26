import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
try { process.loadEnvFile(resolve(root, '.env.local')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
process.env.PADI_AI_ENABLED ??= 'true';
const build = spawnSync(process.execPath, [resolve(root, 'scripts/build.mjs')], { cwd: root, stdio: 'inherit' });
if (build.status !== 0) process.exit(1);
const { PUBLIC_FILES } = await import('../scripts/public-files.mjs');
const allowed = new Set(PUBLIC_FILES);
const { default: chat } = await import('../api/chat.js');
const { default: status } = await import('../api/status.js');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.json': 'application/json; charset=utf-8' };

const server = createServer(async (req, res) => {
  res.status = code => { res.statusCode = code; return res; };
  res.json = body => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(body)); };
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch { return res.status(400).end('Invalid URL'); }
  try {
    if (url.pathname === '/api/chat') return await chat(req, res);
    if (url.pathname === '/api/status') return await status(req, res);
    if (!['GET', 'HEAD'].includes(req.method)) return res.status(405).end('Method not allowed');
    const file = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
    if (!allowed.has(file)) return res.status(404).end('Not found');
    const bytes = await readFile(resolve(root, 'public', file));
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action 'self' https://formspree.io; base-uri 'self'; object-src 'none'; frame-ancestors 'none'");
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch {
    if (!res.headersSent) res.status(500).json({ error: { message: 'Padi could not complete that request.' } });
    else res.end();
  }
});
server.requestTimeout = 65_000;
server.listen(Number(process.env.PORT || 8787), '127.0.0.1', () => console.log(`PadiAI is running at http://127.0.0.1:${server.address().port}`));
