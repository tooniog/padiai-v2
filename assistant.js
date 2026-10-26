/* Padi's standalone assistant. Browser memory is strictly opt-in. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const MEMORY_KEY = 'padi.assistant.memory.v1';
  const MODES = ['ask', 'learn', 'work', 'plan', 'research'];
  const PROFILE_FIELDS = ['level', 'language', 'subject', 'goal', 'style', 'area'];
  const defaultProfile = () => ({ level: 'adult', language: 'en', subject: '', goal: '', style: 'simple', area: '' });
  const descriptions = {
    ask: 'A clear answer, with a practical next step.',
    learn: 'Understand the idea. Try it yourself. Learn from your mistakes.',
    work: 'Turn a rough idea into useful work, in your own voice.',
    plan: 'A realistic next step, built around your time and priorities.',
    research: 'Explore a question and check the evidence behind the answer.'
  };
  const starters = {
    ask: [
      ['↗', 'Make my day easier', 'Sort out a practical question.', 'I have a lot on my mind today. Help me sort out what matters first. Ask me one useful question.'],
      ['◎', 'Think it through', 'A little clarity, without pressure.', 'I need to talk through a decision. Help me compare my options without deciding for me.'],
      ['⌁', 'Lagos, made clearer', 'Start with what you need.', 'Help me think through a journey across Lagos. Ask where I am starting, where I am going and when. Do not invent live traffic or fares.']
    ],
    learn: [
      ['✳', 'Explain it simply', 'Find the missing piece.', 'Help me understand a topic I am struggling with. Ask me the topic and what I already know.'],
      ['▤', 'Prepare for an exam', 'A manageable study session.', 'Help me revise for an exam. Ask my subject, exam pathway and the time I have today.'],
      ['↗', 'Give me a challenge', 'Learn by trying it yourself.', 'Give me one short practice question with feedback. First ask what topic and level I want to practise.']
    ],
    work: [
      ['↗', 'Reply to a customer', 'Clear, professional, still you.', 'Help me draft a polite customer reply for my Nigerian small business. Ask what happened and the outcome I want.'],
      ['▤', 'Improve my writing', 'Bring a rough draft or an idea.', 'Help me improve something I have written. Ask me to paste my draft and tell you who it is for. Preserve my meaning.'],
      ['✳', 'Prepare for an interview', 'Practise one answer at a time.', 'Help me prepare for a job interview. Ask me the role, then practise one question at a time.']
    ],
    plan: [
      ['◷', 'Make a realistic plan', 'Work with the time you have.', 'Help me plan my day realistically. Ask my available time and the three things I need to do. Include breaks.'],
      ['▤', 'Break down a big task', 'Make the next step obvious.', 'I am putting off a task because it feels too big. Help me break it into small steps. Ask what the task is.'],
      ['◎', 'Compare my options', 'Weigh time, cost and effort.', 'Help me compare options for something I need to do in Lagos. Ask my goal, budget, area and constraints.']
    ],
    research: [
      ['⌕', 'Check a claim', 'See what the evidence says.', 'Help me verify a claim. Ask me the claim and where I saw it. Distinguish evidence, inference and anything unknown.'],
      ['▤', 'Understand a process', 'Find the official starting point.', 'Help me research an official application process in Nigeria. Ask which process, then use official sources and flag changing requirements.'],
      ['↗', 'Research a decision', 'Useful evidence, fewer tabs.', 'Help me research a decision. Ask the question, my constraints and what would count as reliable evidence.']
    ]
  };
  let state = { mode: 'ask', profile: defaultProfile(), remember: false, messages: [], attempts: [] };
  let busy = false;
  let controller = null;
  let requestNumber = 0;
  let lastRequest = null;
  let service = { ready: false, researchAvailable: false };

  const text = (tag, content, className) => {
    const node = document.createElement(tag);
    if (content !== undefined) node.textContent = String(content);
    if (className) node.className = className;
    return node;
  };
  const short = (value, limit = 100) => typeof value === 'string' ? value.slice(0, limit) : '';
  const validPractice = (practice) => practice && typeof practice.question === 'string' && practice.question.length <= 3000 &&
    Array.isArray(practice.options) && practice.options.length >= 2 && practice.options.length <= 6 &&
    practice.options.every(option => typeof option === 'string' && option.length <= 1000) &&
    Number.isInteger(practice.correctIndex) && practice.correctIndex >= 0 && practice.correctIndex < practice.options.length;
  function cleanProfile(profile = {}) {
    const clean = defaultProfile();
    if (['primary', 'secondary', 'university', 'adult'].includes(profile.level)) clean.level = profile.level;
    if (['en', 'pcm', 'yo', 'ha', 'ig'].includes(profile.language)) clean.language = profile.language;
    if (['simple', 'steps', 'deep'].includes(profile.style)) clean.style = profile.style;
    clean.subject = short(profile.subject, 100); clean.area = short(profile.area, 100); clean.goal = short(profile.goal, 200);
    return clean;
  }
  function safeURL(value) {
    if (typeof value !== 'string') return null;
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
  }
  function cleanSources(sources) {
    return Array.isArray(sources) ? sources.slice(0, 15).filter(source => source && safeURL(source.url)).map(source => ({ title: short(source.title || source.url, 200), url: safeURL(source.url) })) : [];
  }
  function cleanResponse(data) {
    if (!data || typeof data.answer !== 'string' || !data.answer.trim() || data.answer.length > 30000) throw new Error('Padi could not read that answer. Please try again.');
    const meta = data.meta && typeof data.meta === 'object' ? data.meta : {};
    return { role: 'assistant', content: data.answer, strategy: short(data.strategy, 40),
      practice: validPractice(data.practice) ? { id: short(data.practice.id, 100), topic: short(data.practice.topic || 'Practice', 100), question: data.practice.question, options: data.practice.options, correctIndex: data.practice.correctIndex, explanation: short(data.practice.explanation, 3000) } : null,
      sources: cleanSources(data.sources), warnings: Array.isArray(data.warnings) ? data.warnings.filter(warning => typeof warning === 'string').slice(0, 4).map(warning => short(warning, 800)) : [],
      meta: { id: short(meta.id, 120), model: short(meta.model, 100), grounding: short(meta.grounding, 160), searched: meta.searched === true, generatedAt: short(meta.generatedAt, 50), latencyMs: Number.isFinite(meta.latencyMs) ? meta.latencyMs : null }
    };
  }
  function restore() {
    try {
      const raw = localStorage.getItem(MEMORY_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.version !== 1 || saved.remember !== true || !Array.isArray(saved.messages) || !Array.isArray(saved.attempts)) throw new Error('invalid memory');
      const messages = saved.messages.slice(-24).filter(message => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string' && message.content.length <= 30000).map(message => message.role === 'user' ? { role: 'user', content: message.content, ...(message.kind === 'practice' ? { kind: 'practice' } : {}) } : cleanResponse({ ...message, answer: message.content }));
      const seen = new Set();
      const attempts = saved.attempts.slice(-500).filter(attempt => {
        if (!attempt || typeof attempt.key !== 'string' || attempt.key.length > 100 || typeof attempt.correct !== 'boolean' || typeof attempt.topic !== 'string' || !Number.isInteger(attempt.selected) || seen.has(attempt.key)) return false;
        seen.add(attempt.key); return true;
      }).map(attempt => ({ key: attempt.key, correct: attempt.correct, topic: short(attempt.topic, 100), selected: attempt.selected, at: short(attempt.at, 50) }));
      state = { mode: MODES.includes(saved.mode) ? saved.mode : 'ask', profile: cleanProfile(saved.profile), remember: true, messages, attempts };
      $('resume-banner').hidden = messages.length === 0;
    } catch {
      $('request-status').textContent = 'Saved data could not be opened. You can keep using Padi with a fresh session.';
      try { localStorage.removeItem(MEMORY_KEY); } catch { /* Browser storage may be blocked. */ }
    }
  }
  function removeSaved(includeLibrary = false) {
    let removed = true;
    const keys = includeLibrary ? [MEMORY_KEY, 'naija_ai_lang', 'naija_ai_track', 'naija_ai_score'] : [MEMORY_KEY];
    for (const key of keys) {
      try { localStorage.removeItem(key); } catch { removed = false; }
      if (includeLibrary) { try { sessionStorage.removeItem(key); } catch { removed = false; } }
    }
    return removed;
  }
  function save() {
    if (!state.remember) return;
    try { localStorage.setItem(MEMORY_KEY, JSON.stringify({ version: 1, ...state, messages: state.messages.slice(-24), attempts: state.attempts.slice(-500) })); }
    catch { state.remember = false; $('remember').checked = false; removeSaved(); $('data-status').textContent = 'This browser could not save your data. Your current work is available in this session only.'; $('request-status').textContent = 'Browser memory is unavailable. This conversation is session only.'; }
  }
  function updateProfileForm() {
    for (const field of PROFILE_FIELDS) $(field).value = state.profile[field];
    $('remember').checked = state.remember;
  }
  function setMode(mode, persist = true) {
    state.mode = mode;
    document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    $('mode-description').textContent = descriptions[mode] + (mode === 'research' && !service.researchAvailable ? ' Online search is not currently available; Padi will say when it cannot verify something.' : '');
    $('starters').replaceChildren();
    for (const [icon, title, detail, prompt] of starters[mode]) {
      const button = text('button', undefined, 'starter-card'); button.type = 'button';
      const symbol = text('span', icon, 'card-icon'); symbol.setAttribute('aria-hidden', 'true');
      const arrow = text('span', '↗', 'card-arrow'); arrow.setAttribute('aria-hidden', 'true');
      button.append(symbol, text('strong', title), text('span', detail, 'card-detail'), arrow);
      button.addEventListener('click', () => { $('message').value = prompt; $('message').focus(); });
      $('starters').append(button);
    }
    if (persist) save();
  }
  function practiceKey(practice) {
    // Same question/options count once even if an answer is returned again.
    const value = JSON.stringify([practice.question.trim(), practice.options, practice.correctIndex]);
    let hash = 2166136261;
    for (let index = 0; index < value.length; index++) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 16777619); }
    return `q-${(hash >>> 0).toString(16)}-${value.length}`;
  }
  function renderPractice(practice) {
    const card = text('section', undefined, 'practice-card');
    card.append(text('h3', 'Try it yourself'), text('p', practice.question));
    const options = text('div', undefined, 'practice-options');
    const feedback = text('p', '', 'practice-feedback'); feedback.setAttribute('role', 'status');
    const key = practiceKey(practice);
    function mark(attempt) {
      Array.from(options.children).forEach((button, index) => {
        button.disabled = true;
        if (index === practice.correctIndex) button.classList.add('correct');
        if (index === attempt.selected && !attempt.correct) button.classList.add('incorrect');
        if (index === attempt.selected) button.setAttribute('aria-label', `${practice.options[index]} — your answer`);
      });
      feedback.textContent = `${attempt.correct ? 'That’s right.' : 'A useful one to review.'} ${practice.explanation}${attempt.correct ? '' : ` The correct answer is: ${practice.options[practice.correctIndex]}.`} This question has been counted once.`;
    }
    practice.options.forEach((option, selected) => {
      const button = text('button', option, 'practice-option'); button.type = 'button';
      button.addEventListener('click', () => {
        if (state.attempts.some(attempt => attempt.key === key)) return;
        const attempt = { key, selected, correct: selected === practice.correctIndex, topic: practice.topic, at: new Date().toISOString() };
        state.attempts.push(attempt);
        state.messages.push({ role: 'user', kind: 'practice', content: `Practice attempt\nQuestion: ${practice.question}\nMy answer: ${practice.options[selected]}\nPadi’s practice feedback: ${attempt.correct ? 'correct' : 'needs review'}.\nAnswer shown by Padi: ${practice.options[practice.correctIndex]}\nExplanation shown: ${practice.explanation}\nThis is feedback from an AI-generated practice question, not a teacher’s assessment.` });
        state.messages = state.messages.slice(-24); save();
        // Update duplicate cards too, without adding duplicate evidence.
        renderMessages();
        $('request-status').textContent = attempt.correct ? 'Practice recorded. One question answered correctly.' : 'Practice recorded. This topic is marked for review.';
      });
      options.append(button);
    });
    card.append(options, feedback);
    const existing = state.attempts.find(attempt => attempt.key === key);
    if (existing) mark(existing);
    return card;
  }
  function renderMessage(message) {
    const article = text('article', undefined, `chat-message ${message.role}`);
    const body = text('div', undefined, 'message-body');
    if (message.role === 'assistant' && message.meta?.searched) {
      let cursor = 0;
      for (const citation of message.content.matchAll(/\[(\d{1,2})\]/g)) {
        body.append(document.createTextNode(message.content.slice(cursor, citation.index)));
        const source = message.sources?.[Number(citation[1]) - 1];
        const href = source && safeURL(source.url);
        if (href) {
          const link = text('a', citation[0]); link.href = href; link.target = '_blank';
          link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer';
          link.setAttribute('aria-label', `Source ${citation[1]}: ${source.title}`); body.append(link);
        } else body.append(document.createTextNode(citation[0]));
        cursor = citation.index + citation[0].length;
      }
      body.append(document.createTextNode(message.content.slice(cursor)));
    } else body.textContent = message.content;
    article.append(text('div', message.kind === 'practice' ? 'YOUR PRACTICE' : message.role === 'user' ? 'YOU' : 'PADI', 'message-label'), body);
    if (message.role === 'assistant') {
      for (const warning of message.warnings || []) article.append(text('p', warning, 'answer-warning'));
      if (validPractice(message.practice)) article.append(renderPractice(message.practice));
      const details = text('details', undefined, 'answer-details');
      const sourceCount = (message.sources || []).length;
      details.append(text('summary', message.meta?.grounding === 'handoff' ? 'Continue in Maps · external link' : sourceCount ? `Sources & answer details · ${sourceCount} link${sourceCount === 1 ? '' : 's'}` : 'About this answer'));
      details.append(text('p', message.meta?.searched ? 'Online sources were used for this answer. Open them to check the details.' : 'This answer was not verified with a live web search. Check changing or important facts with an official source.'));
      if (sourceCount) {
        const list = text('ul');
        for (const source of message.sources) {
          const url = safeURL(source.url); if (!url) continue;
          const link = text('a', source.title); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer';
          const item = text('li'); item.append(link); list.append(item);
        }
        details.append(list);
      }
      const generated = message.meta?.generatedAt ? new Date(message.meta.generatedAt) : null;
      if (generated && !Number.isNaN(generated.getTime())) details.append(text('p', `Answered ${generated.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}.`));
      details.append(text('p', 'Padi offers help with thinking and learning. You decide what to do. No booking, payment, message or human referral has been made.'));
      article.append(details);
    }
    return article;
  }
  function renderMessages() {
    $('messages').replaceChildren(...state.messages.map(renderMessage));
    $('starters').hidden = state.messages.length > 0;
    $('intro').hidden = state.messages.length > 0;
  }
  function updateBusy(value) {
    busy = value;
    $('send').disabled = value || !service.ready;
    $('cancel').hidden = !value;
    $('message').readOnly = value;
    $('notes').readOnly = value;
    $('messages').setAttribute('aria-busy', String(value));
    document.querySelectorAll('[data-mode]').forEach(button => { button.disabled = value; });
  }
  function showError(message) { $('error-text').textContent = message; $('error-box').hidden = false; $('retry').hidden = !lastRequest || !service.ready; }
  function requestBody(message) {
    if (message.length > 4000) throw new Error('Please shorten your question to 4,000 characters or fewer. Your draft is still here.');
    const history = state.messages.slice(-10).map(item => {
      const prefix = item.role === 'assistant' ? '[Earlier reply shortened]\n' : '[Earlier message shortened]\n';
      return { role: item.role, content: item.content.length > 6000 ? prefix + item.content.slice(0, 6000 - prefix.length) : item.content };
    });
    while (history.reduce((total, item) => total + item.content.length, 0) > 24000) history.shift();
    const notes = $('notes').value.trim();
    if (notes.length > 12000) throw new Error('Please shorten your pasted notes to 12,000 characters or fewer. Your draft is still here.');
    const body = { message, mode: state.mode, history, profile: { ...state.profile }, notes };
    const size = () => new TextEncoder().encode(JSON.stringify(body)).byteLength;
    while (history.length && size() > 32768) history.shift();
    if (size() > 32768) throw new Error('There is too much text in this question and its notes. Please shorten the notes or split them into smaller parts. Your draft has not been sent.');
    return body;
  }
  async function send(retry = false) {
    if (busy || !service.ready) return;
    let body;
    if (retry && lastRequest) body = lastRequest;
    else {
      const message = $('message').value.trim();
      if (!message) { $('message').focus(); return; }
      try { body = requestBody(message); }
      catch (error) { lastRequest = null; showError(error.message); return; }
      state.messages.push({ role: 'user', content: message });
      state.messages = state.messages.slice(-24);
      $('message').value = ''; renderMessages(); save();
    }
    lastRequest = body; $('error-box').hidden = true; $('resume-banner').hidden = true;
    controller = new AbortController(); const activeController = controller; const number = ++requestNumber;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; activeController.abort(); }, 90000);
    updateBusy(true);
    $('request-status').textContent = body.mode === 'research' && service.researchAvailable ? 'Padi is looking into your question…' : 'Padi is thinking it through…';
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: activeController.signal, credentials: 'same-origin' });
      let data; try { data = await response.json(); } catch { throw new Error('Padi could not read the reply. Please try again.'); }
      if (!response.ok) {
        const safeErrors = {
          GROUNDING_UNAVAILABLE: 'Padi could not confirm reliable sources for this answer. Try a narrower question or check the original organisation.',
          PRIVATE_DATA: 'Remove passwords, security codes, identity numbers or API keys before sending this question.',
          REQUEST_TOO_LARGE: 'This question and its notes are too long. Shorten them and try again.',
          AI_TIMEOUT: 'Padi took too long to finish. Try a smaller task; your question is still here.'
        };
        if (safeErrors[data?.error?.code]) throw new Error(safeErrors[data.error.code]);
        if (response.status === 429) throw new Error('Padi has reached a usage limit. Please wait a little before trying again.');
        if (response.status === 503) throw new Error('Padi is temporarily unavailable. Your question is still here; try again shortly.');
        throw new Error('Padi could not finish that request. Please try again.');
      }
      const message = cleanResponse(data);
      if (number !== requestNumber) return;
      state.messages.push(message); state.messages = state.messages.slice(-24); lastRequest = null;
      renderMessages(); save(); $('request-status').textContent = '';
    } catch (error) {
      if (number !== requestNumber) return;
      $('request-status').textContent = '';
      const message = activeController.signal.aborted ? (timedOut ? 'That took longer than expected. Please try again.' : 'Stopped waiting for this answer. You can try again or start a new question.') : error.message;
      showError(message);
    } finally {
      clearTimeout(timer);
      if (number === requestNumber) { controller = null; updateBusy(false); }
    }
  }
  function newTask() {
    requestNumber++; if (controller) controller.abort(); controller = null;
    state.messages = []; lastRequest = null; $('message').value = ''; $('notes').value = '';
    $('error-box').hidden = true; $('resume-banner').hidden = true; $('request-status').textContent = service.ready ? '' : 'Padi is not currently available. Please try again later.';
    updateBusy(false); renderMessages(); save(); $('message').focus();
  }
  function showProgress() {
    $('attempt-count').textContent = String(state.attempts.length);
    $('correct-count').textContent = String(state.attempts.filter(attempt => attempt.correct).length);
    $('progress-topics').replaceChildren();
    const topics = new Map();
    for (const attempt of state.attempts) { const item = topics.get(attempt.topic) || { total: 0, correct: 0 }; item.total++; if (attempt.correct) item.correct++; topics.set(attempt.topic, item); }
    if (!topics.size) $('progress-topics').append(text('p', 'No practice answers yet. Choose Learn and try a practice question. Your progress will come from what you actually attempt.', 'empty-progress'));
    for (const [topic, result] of topics) { const row = text('div', undefined, 'topic-row'); row.append(text('strong', topic), text('span', `${result.correct} of ${result.total} correct · ${result.correct < result.total ? 'Needs review' : 'Keep practising to build evidence'}`)); $('progress-topics').append(row); }
    $('progress-storage-note').textContent = state.remember ? 'Browser memory is on. These results are saved on this device.' : 'Results stay in this session unless you choose browser memory.';
    $('progress-dialog').showModal();
  }
  async function checkService() {
    $('request-status').textContent = 'Checking Padi’s availability…';
    const availabilityController = new AbortController();
    const availabilityTimer = setTimeout(() => availabilityController.abort(), 10000);
    try {
      const response = await fetch('/api/status', { credentials: 'same-origin', cache: 'no-store', signal: availabilityController.signal });
      if (!response.ok) throw new Error('unavailable');
      const status = await response.json();
      service = { ready: status.ready === true, researchAvailable: status.researchAvailable === true };
      $('request-status').textContent = service.ready ? '' : 'Padi is temporarily unavailable. You can still explore the learning library.';
    } catch { service.ready = false; $('request-status').textContent = 'Padi could not connect. Check your connection and reload to try again. Your learning library is still available.'; }
    finally { clearTimeout(availabilityTimer); }
    setMode(state.mode, false); updateBusy(false);
  }

  $('composer').addEventListener('submit', event => { event.preventDefault(); send(); });
  $('message').addEventListener('keydown', event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); send(); } });
  $('cancel').addEventListener('click', () => controller?.abort());
  $('retry').addEventListener('click', () => send(true));
  $('new-task').addEventListener('click', newTask);
  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  $('open-profile').addEventListener('click', () => { updateProfileForm(); $('profile-dialog').showModal(); });
  document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  $('dismiss-resume').addEventListener('click', () => { $('resume-banner').hidden = true; });
  $('show-progress').addEventListener('click', showProgress);
  $('practice-start').addEventListener('click', () => { $('progress-dialog').close(); setMode('learn'); $('message').value = 'Help me practise a topic. Ask me what topic and level, then give me one question at a time.'; $('message').focus(); });
  $('profile-form').addEventListener('submit', event => {
    event.preventDefault();
    state.profile = cleanProfile(Object.fromEntries(PROFILE_FIELDS.map(field => [field, $(field).value])));
    state.remember = $('remember').checked;
    if (!state.remember && !removeSaved()) { $('data-status').textContent = 'This browser blocked deletion of saved data. Clear this site’s data in your browser settings before using a shared device.'; return; }
    save(); updateProfileForm(); $('profile-dialog').close();
    $('request-status').textContent = state.remember ? 'Preferences saved on this browser. You can change or delete them anytime.' : 'Preferences updated for this session. Browser memory is off.';
  });
  $('export-data').addEventListener('click', () => {
    try {
      const blob = new Blob([JSON.stringify({ app: 'PadiAI', exportedAt: new Date().toISOString(), browserMemory: state.remember, profile: state.profile, conversation: state.messages, practice: state.attempts }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `padi-my-data-${new Date().toISOString().slice(0, 10)}.json`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      $('data-status').textContent = 'Your preferences, current conversation and practice results have been exported. Keep the file somewhere private.';
    } catch { $('data-status').textContent = 'This browser could not export your data. Please try again in a browser that allows downloads.'; }
  });
  $('clear-data').addEventListener('click', () => {
    const removed = removeSaved(true);
    state = { mode: 'ask', profile: defaultProfile(), remember: false, messages: [], attempts: [] };
    newTask(); setMode('ask', false); updateProfileForm();
    $('data-status').textContent = removed ? 'Your Padi preferences, saved conversation, practice results and learning-library language, track and score on this browser have been deleted. This does not delete data already processed by service providers.' : 'The current session was cleared, but this browser blocked saved-data deletion. Clear this site’s data in your browser settings.';
  });
  // Keep other open Padi tabs from restoring data after deletion in this tab.
  window.addEventListener('storage', event => { if ((event.key === MEMORY_KEY && event.newValue === null) || event.key === null) { state.remember = false; state.profile = defaultProfile(); state.attempts = []; newTask(); updateProfileForm(); $('request-status').textContent = 'Browser memory was cleared in another tab. This session is now private to this tab.'; } });
  restore();
  const entry = new URLSearchParams(window.location.search);
  if (MODES.includes(entry.get('mode'))) state.mode = entry.get('mode');
  if (entry.get('q')) $('message').value = entry.get('q').slice(0, 4000);
  setMode(state.mode, false); renderMessages(); updateProfileForm(); updateBusy(false); checkService();
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js', { updateViaCache: 'none' }).catch(() => {
        // Online use remains available when a browser does not allow offline installation.
      });
    }, { once: true });
  }
})();
