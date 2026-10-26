const fields = ['inputTokens', 'outputTokens', 'searchCalls'];
const observedCount = value => Number.isSafeInteger(value) && value >= 0 ? value : null;

// Keep unknown paid usage distinct from a measured zero, including failed calls.
export function summariseUsage(records) {
  const totals = Object.fromEntries(fields.map(field => [field, 0]));
  const knownTotals = { ...totals };
  let usageRecordsIncomplete = 0;
  let costRecordsIncomplete = 0;
  let estimatedKnownTextTokenCostUsd = 0;
  for (const record of records) {
    const meta = record.result?.meta ?? record.usage;
    const counts = Object.fromEntries(fields.map(field => [field, observedCount(meta?.[field])]));
    if (fields.some(field => counts[field] === null)) usageRecordsIncomplete++;
    for (const field of fields) {
      if (counts[field] === null) totals[field] = null;
      else {
        knownTotals[field] += counts[field];
        if (totals[field] !== null) totals[field] += counts[field];
      }
    }
    const rates = meta?.model?.startsWith('gpt-5.6-terra') ? [2, 12]
      : meta?.model?.startsWith('gpt-5.4-mini') ? [0.75, 4.5] : null;
    if (counts.inputTokens === 0 && counts.outputTokens === 0) continue;
    if (!rates || counts.inputTokens === null || counts.outputTokens === null) costRecordsIncomplete++;
    else estimatedKnownTextTokenCostUsd += (counts.inputTokens * rates[0] + counts.outputTokens * rates[1]) / 1_000_000;
  }
  return {
    totals, knownTotals, usageRecordsIncomplete, costRecordsIncomplete,
    estimatedKnownTextTokenCostUsd,
    estimatedTextTokenCostUsd: costRecordsIncomplete ? null : estimatedKnownTextTokenCostUsd,
  };
}
