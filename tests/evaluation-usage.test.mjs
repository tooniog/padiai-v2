import test from 'node:test';
import assert from 'node:assert/strict';
import { summariseUsage } from '../scripts/evaluation-usage.mjs';

test('evaluation costs include successful and rejected calls with measured usage', () => {
  const report = summariseUsage([
    { result: { meta: { model: 'gpt-5.4-mini', inputTokens: 1000, outputTokens: 100, searchCalls: 0 } } },
    { usage: { model: 'gpt-5.6-terra', inputTokens: 2000, outputTokens: 200, searchCalls: 1 } },
  ]);
  assert.deepEqual(report.totals, { inputTokens: 3000, outputTokens: 300, searchCalls: 1 });
  assert.equal(report.usageRecordsIncomplete, 0);
  assert.ok(Math.abs(report.estimatedTextTokenCostUsd - 0.0076) < 1e-10);
});

test('partial or missing usage leaves totals and full cost unknown while retaining measured subtotals', () => {
  const report = summariseUsage([
    { result: { meta: { model: 'gpt-5.4-mini', inputTokens: 1000, outputTokens: 100, searchCalls: 0 } } },
    { usage: { model: 'gpt-5.4-mini', inputTokens: 500, outputTokens: null, searchCalls: 1 } },
    { error: { code: 'PROVIDER_TIMEOUT' } },
  ]);
  assert.deepEqual(report.totals, { inputTokens: null, outputTokens: null, searchCalls: null });
  assert.deepEqual(report.knownTotals, { inputTokens: 1500, outputTokens: 100, searchCalls: 1 });
  assert.equal(report.usageRecordsIncomplete, 2);
  assert.equal(report.costRecordsIncomplete, 2);
  assert.equal(report.estimatedTextTokenCostUsd, null);
  assert.ok(Math.abs(report.estimatedKnownTextTokenCostUsd - 0.0012) < 1e-10);
});

test('measured no-call responses cost zero and unknown model prices are not guessed', () => {
  const local = summariseUsage([{ result: { meta: { model: null, inputTokens: 0, outputTokens: 0, searchCalls: 0 } } }]);
  assert.equal(local.estimatedTextTokenCostUsd, 0);
  assert.equal(local.costRecordsIncomplete, 0);
  const custom = summariseUsage([{ result: { meta: { model: 'custom-model', inputTokens: 10, outputTokens: 5, searchCalls: 0 } } }]);
  assert.equal(custom.estimatedTextTokenCostUsd, null);
  assert.equal(custom.usageRecordsIncomplete, 0);
  assert.equal(custom.costRecordsIncomplete, 1);
});
