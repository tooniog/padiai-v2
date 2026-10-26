export const MODES = new Set(['ask', 'learn', 'work', 'plan', 'research']);
export const STRATEGIES = new Set(['EXPLAIN', 'ASK', 'CLARIFY', 'TEST', 'PRACTISE', 'REVIEW', 'RETEACH', 'ESCALATE']);
export const MAX_BODY_BYTES = 32_768;

export class PadiError extends Error {
  constructor(status, code, message, details = {}) {
    super(message);
    this.name = 'PadiError';
    this.status = status;
    this.code = code;
    Object.assign(this, details);
  }
}

function text(value, name, max, fallback = '') {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string' || value.length > max) {
    throw new PadiError(400, 'INVALID_INPUT', `${name} must be text of at most ${max} characters.`);
  }
  return value.trim();
}

function choice(value, allowed, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  if (!allowed.includes(value)) throw new PadiError(400, 'INVALID_INPUT', 'One of the selected options is invalid.');
  return value;
}

export function validatePayload(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new PadiError(400, 'INVALID_INPUT', 'Send a question as a JSON object.');
  if (Buffer.byteLength(JSON.stringify(value), 'utf8') > MAX_BODY_BYTES) throw new PadiError(413, 'REQUEST_TOO_LARGE', 'This message is too long. Shorten your question or notes.');
  const keys = new Set(['message', 'mode', 'history', 'profile', 'notes']);
  if (Object.keys(value).some(key => !keys.has(key))) throw new PadiError(400, 'INVALID_INPUT', 'This request contains unsupported settings.');
  const message = text(value.message, 'Question', 4000);
  if (!message) throw new PadiError(400, 'EMPTY_MESSAGE', 'Write a question or task first.');
  const mode = value.mode ?? 'ask';
  if (!MODES.has(mode)) throw new PadiError(400, 'INVALID_MODE', 'Choose Ask, Learn, Work, Plan or Research.');
  const rawProfile = value.profile ?? {};
  if (!rawProfile || typeof rawProfile !== 'object' || Array.isArray(rawProfile)) throw new PadiError(400, 'INVALID_INPUT', 'Learning preferences are invalid.');
  const profileKeys = new Set(['level', 'language', 'subject', 'goal', 'style', 'area']);
  if (Object.keys(rawProfile).some(key => !profileKeys.has(key))) throw new PadiError(400, 'INVALID_INPUT', 'These preferences contain unsupported settings.');
  const profile = {
    level: choice(rawProfile.level, ['primary', 'secondary', 'university', 'adult'], 'adult'),
    language: choice(rawProfile.language, ['en', 'pcm', 'yo', 'ha', 'ig'], 'en'),
    subject: text(rawProfile.subject, 'Subject', 120),
    goal: text(rawProfile.goal, 'Goal', 240),
    style: choice(rawProfile.style, ['simple', 'steps', 'deep'], 'simple'),
    area: text(rawProfile.area, 'Area', 120),
  };
  const notes = text(value.notes, 'Notes', 12_000);
  const history = value.history ?? [];
  if (!Array.isArray(history) || history.length > 12) throw new PadiError(400, 'INVALID_HISTORY', 'Keep at most 12 recent conversation turns.');
  let historySize = 0;
  const cleanedHistory = history.map(item => {
    if (!item || typeof item !== 'object' || !['user', 'assistant'].includes(item.role)) throw new PadiError(400, 'INVALID_HISTORY', 'Conversation history is invalid.');
    const content = text(item.content, 'Previous message', 6000);
    if (!content) throw new PadiError(400, 'INVALID_HISTORY', 'Conversation history contains an empty message.');
    historySize += content.length;
    return { role: item.role, content };
  });
  if (historySize > 24_000) throw new PadiError(400, 'INVALID_HISTORY', 'The recent conversation is too long. Start a new conversation.');
  const allText = [message, notes, ...Object.values(profile), ...cleanedHistory.map(item => item.content)].join('\n');
  if (/\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/.test(allText) || /\b(?:BVN|NIN|OTP|PIN|password)\s*(?:is|:|=)?\s*\d{4,16}\b/i.test(allText)) {
    throw new PadiError(400, 'PRIVATE_DATA', 'Remove passwords, security codes, identity numbers or API keys before sending this message.');
  }
  return { message, mode, profile, notes, history: cleanedHistory };
}

export async function readBody(req) {
  const type = String(req.headers?.['content-type'] ?? '').split(';')[0].trim().toLowerCase();
  if (type !== 'application/json') throw new PadiError(415, 'JSON_REQUIRED', 'Send this request as JSON.');
  const length = Number(req.headers?.['content-length'] ?? 0);
  if (!Number.isFinite(length) || length < 0 || length > MAX_BODY_BYTES) throw new PadiError(413, 'REQUEST_TOO_LARGE', 'This message is too long.');
  let body = req.body;
  if (body === undefined) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
      const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += data.length;
      if (size > MAX_BODY_BYTES) throw new PadiError(413, 'REQUEST_TOO_LARGE', 'This message is too long.');
      chunks.push(data);
    }
    body = Buffer.concat(chunks);
  }
  if (Buffer.isBuffer(body)) body = body.toString('utf8');
  if (typeof body === 'string') {
    if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) throw new PadiError(413, 'REQUEST_TOO_LARGE', 'This message is too long.');
    try { body = JSON.parse(body); } catch { throw new PadiError(400, 'INVALID_JSON', 'This message could not be read. Please try again.'); }
  }
  return validatePayload(body);
}
