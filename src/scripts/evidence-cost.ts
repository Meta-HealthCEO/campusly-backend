// src/scripts/evidence-cost.ts
//
// Planning estimates for the configured model (spec §6.6: claude-sonnet-5 at
// $2 / $10 per million tokens) and R18 to the dollar. Printed before any
// --apply; the measured cost comes from DiagnosisRequest.usage.
export const USD_PER_MTOK_IN = 2;
export const USD_PER_MTOK_OUT = 10;
export const ZAR_PER_USD = 18;

export function estimateRand(inputTokens: number, outputTokens: number, batch: boolean): number {
  const usd = (inputTokens * USD_PER_MTOK_IN + outputTokens * USD_PER_MTOK_OUT) / 1_000_000;
  return Math.round(usd * ZAR_PER_USD * (batch ? 0.5 : 1) * 100) / 100;
}
