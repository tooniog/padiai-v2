import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../main.js', import.meta.url), 'utf8');
function fixture({ answers = [], blockStorage = false } = {}) {
  const local = new Map(); const session = new Map(); const items = new Map();
  const make = () => ({ textContent: '', style: {}, setAttribute() {}, before() {}, focus() { this.focused = true; } });
  for (const id of ['submit-button', 'result', 'after-quiz', 'tutor-button']) items.set(id, make());
  const storage = map => ({ getItem: key => { if (blockStorage) throw Error('blocked'); return map.get(key) ?? null; }, setItem: (key, value) => { if (blockStorage) throw Error('blocked'); map.set(key, value); }, removeItem: key => { if (blockStorage) throw Error('blocked'); map.delete(key); } });
  const context = vm.createContext({
    localStorage: storage(local), sessionStorage: storage(session), navigator: {},
    window: { location: { href: '', search: '', reload() {} }, addEventListener() {} },
    document: { addEventListener() {}, createElement: () => make(),
      getElementById: id => items.get(id),
      querySelector: selector => selector.includes(':checked') ? answers[selector.includes('q1') ? 0 : 1] : make() },
  });
  // Inserted validation node is represented without needing a browser DOM.
  context.document.createElement = () => { const node = make(); Object.defineProperty(node, 'id', { set(id) { items.set(id, node); } }); return node; };
  vm.runInContext(source, context);
  return { context, local, session, items, run: code => vm.runInContext(code, context) };
}

test('an unanswered legacy quiz cannot create a score or a success result', () => {
  const app = fixture(); app.run('submitQuiz()');
  assert.match(app.items.get('quiz-validation').textContent, /Answer both/);
  assert.equal(app.session.has('naija_ai_score'), false);
  assert.equal(app.items.get('after-quiz').style.display, undefined);
});

test('legacy quiz feedback records actual answers for the session only', () => {
  const app = fixture({ answers: [{ value: '0' }, { value: '1' }] }); app.run('submitQuiz()');
  assert.equal(app.session.get('naija_ai_score'), '1');
  assert.equal(app.local.has('naija_ai_score'), false);
  assert.match(app.items.get('result').textContent, /1\/2.*Review/);
});

test('learning navigation survives blocked storage and rejects corrupt track choices', () => {
  const app = fixture({ blockStorage: true });
  assert.equal(app.run('getLanguage()'), 'en');
  app.run("startTrack('students')");
  assert.equal(app.run('getTrack()'), 'students');
  assert.equal(app.context.window.location.href, 'lesson.html?v=17');
  app.context.window.location.href = '';
  app.run("startTrack('../../private')");
  assert.equal(app.context.window.location.href, '');
});
