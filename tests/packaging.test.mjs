import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const publicFiles = [
  'index.html', 'lesson.html', 'quiz.html', 'tutor.html', 'privacy.html', 'education-os.html',
  'main.js', 'assistant.js', 'style.css', 'assistant.css', 'service-worker.js', 'manifest.json',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'
];

test('the production build exposes only intended public pages and assets', async () => {
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: root, stdio: 'pipe' });
  const publicRoot = path.join(root, 'public');
  const entries = await readdir(publicRoot, { withFileTypes: true });
  assert.deepEqual(entries.map(entry => entry.name).sort(), [...publicFiles].sort());
  for (const entry of entries) {
    assert.equal(entry.isFile(), true, `${entry.name} must be a regular public file`);
    assert.equal(entry.isSymbolicLink(), false);
    assert.ok((await stat(path.join(publicRoot, entry.name))).size > 0, entry.name);
  }
});

test('Git excludes credentials and generated or machine-local files', () => {
  const privatePaths = ['.env.local', '.env.production', '.env.secret', 'node_modules/example/file.js',
    '.vercel/project.json', 'public/index.html', 'coverage/index.html'];
  const ignored = execFileSync('git', ['-c', 'core.excludesFile=/dev/null', 'check-ignore', '--no-index', '--stdin'], {
    cwd: root, input: privatePaths.join('\n') + '\n', encoding: 'utf8'
  }).trim().split('\n');
  assert.deepEqual(ignored.sort(), [...privatePaths].sort());
});
