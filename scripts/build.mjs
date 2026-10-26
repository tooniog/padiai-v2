import { mkdir, readFile, rm, copyFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

import { PUBLIC_FILES } from './public-files.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'public');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of PUBLIC_FILES) {
  if (file.endsWith('.js') || file.endsWith('.html')) {
    const text = await readFile(resolve(root, file), 'utf8');
    if (/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/.test(text)) throw new Error('Private credential pattern in a public asset.');
  }
  await copyFile(resolve(root, file), resolve(output, file));
}
if ((await readdir(output)).length !== PUBLIC_FILES.length) throw new Error('Unexpected public output.');
console.log(`Built ${PUBLIC_FILES.length} public assets; private configuration and server source excluded.`);
