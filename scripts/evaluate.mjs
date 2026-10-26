import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validatePayload } from '../lib/contracts.js';
import { runAssistant, validatePractice } from '../lib/intelligence.js';

const root = resolve(import.meta.dirname, '..');
try { process.loadEnvFile(resolve(root, '.env.local')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
if (!process.env.OPENAI_API_KEY) throw new Error('A dedicated local API key is required. No secret was displayed.');
const fixtures = JSON.parse(await readFile(resolve(root, 'evaluations/cases.json'), 'utf8'));
const caseId = process.argv.find(v => v.startsWith('--case='))?.slice(7);
const selectedIds = process.argv.find(v => v.startsWith('--ids='))?.slice(6).split(',');
const rawLimit = Number(process.argv.find(v => v.startsWith('--limit='))?.slice(8) || 20);
const limit = Number.isInteger(rawLimit) ? Math.min(Math.max(rawLimit, 1), 20) : 20;
const cases = fixtures.cases.filter(c => (!caseId || c.id === caseId) && (!selectedIds || selectedIds.includes(c.id))).slice(0, limit);
if (!cases.length) throw new Error('No matching evaluation cases.');
const records = [];
let consecutiveFailures = 0;
for (const item of cases) {
  const started = Date.now();
  try {
    const result = await runAssistant(validatePayload(item.request));
    const checks = {
      nonemptyAnswer: Boolean(result.answer?.trim()),
      requiredSearchCompleted: !item.mustSearch || (result.meta.searched && result.sources.length > 0),
      sourceUrlsSafe: result.sources.every(s => /^https?:\/\//.test(s.url)),
      practiceWellFormed: result.practice === null || Boolean(validatePractice(result.practice)),
    };
    records.push({ id: item.id, category: item.category, expectations: item.expectations, automatedChecks: checks,
      functionalChecksPassed: Object.values(checks).every(Boolean), reviewRequired: true,
      elapsedMs: Date.now() - started, result });
    consecutiveFailures = 0;
    console.log(JSON.stringify({ id: item.id, functionalChecksPassed: Object.values(checks).every(Boolean),
      latencyMs: Date.now() - started, strategy: result.strategy, sources: result.sources.length,
      inputTokens: result.meta.inputTokens, outputTokens: result.meta.outputTokens }));
  } catch (e) {
    records.push({ id: item.id, category: item.category, functionalChecksPassed: false, reviewRequired: true,
      error: { code: e.code || 'EVALUATION_ERROR', providerCode: e.providerCode, providerStatus: e.providerStatus },
      usage: e.usage, elapsedMs: Date.now() - started });
    console.log(JSON.stringify({ id: item.id, error: e.code || 'EVALUATION_ERROR', providerCode: e.providerCode }));
    consecutiveFailures++;
    if (consecutiveFailures >= 2) break;
  }
}
const totals = records.reduce((a, r) => ({
  inputTokens: a.inputTokens + (r.result?.meta.inputTokens || r.usage?.inputTokens || 0),
  outputTokens: a.outputTokens + (r.result?.meta.outputTokens || r.usage?.outputTokens || 0),
  searchCalls: a.searchCalls + (r.result?.meta.searchCalls || r.usage?.searchCalls || 0)
}), { inputTokens: 0, outputTokens: 0, searchCalls: 0 });
const textCost = records.reduce((sum, r) => {
  const meta = r.result?.meta || r.usage;
  if (!meta) return sum;
  const rates = meta.model?.startsWith('gpt-5.6-terra') ? [2, 12] : [0.75, 4.5];
  return sum + ((meta.inputTokens || 0) * rates[0] + (meta.outputTokens || 0) * rates[1]) / 1_000_000;
}, 0);
const report = { generatedAt: new Date().toISOString(), syntheticInputsOnly: true,
  scope: 'One bounded live run. Functional checks do not establish factual, educational or safety quality.',
  requested: cases.length, completed: records.length, functionalChecksPassed: records.filter(r => r.functionalChecksPassed).length,
  totals, estimatedTextTokenCostUsd: textCost,
  pricingNote: 'Text token estimate uses observed response model: GPT-5.4 mini $0.75/$4.50, GPT-5.6 Terra $2/$12 per million input/output tokens. Includes aggregated verifier usage at the generating model rate; custom verification-model routing may differ. Excludes web-search tool fees, hosting, retries and caching effects. Confirm live provider billing.',
  records };
await mkdir(resolve(root, 'evaluations'), { recursive: true });
await writeFile(resolve(root, caseId ? `evaluations/live-${caseId}.json` : selectedIds ? 'evaluations/live-regression-results.json' : 'evaluations/live-results.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ completed: report.completed, functionalChecksPassed: report.functionalChecksPassed, totals }));
