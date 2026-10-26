import test from 'node:test';
import assert from 'node:assert/strict';
import { assertResearchGrounding } from '../lib/intelligence.js';

const sources = [
  { url: 'https://nimc.gov.ng/' },
  { url: 'https://www.cbn.gov.ng/' },
  { url: 'https://ndpc.gov.ng/' },
];

test('bold adjacent claims retain separate authority citations', () => {
  assert.doesNotThrow(() => assertResearchGrounding('NIMC manages identity records [1]. **Other background:** Privacy law gives rights [3].', sources));
  assert.throws(() => assertResearchGrounding('NIMC manages identity records [2]. **Other background:** Privacy law gives rights [3].', sources), { code: 'GROUNDING_UNAVAILABLE' });
});

test('citations after punctuation do not consume paragraph breaks or headings', () => {
  assert.doesNotThrow(() => assertResearchGrounding('The CBN publishes notices. [2]\n\n## NIMC\n\nNIMC manages identity records [1].', sources));
  assert.throws(() => assertResearchGrounding('The CBN publishes notices. [1]\n\n## NIMC\n\nNIMC manages identity records [1].', sources), { code: 'GROUNDING_UNAVAILABLE' });
});
