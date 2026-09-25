// src/modules/Evidence/ai-fixture.ts
//
// Canned model replies for EVIDENCE_DIAGNOSIS_MODE=fixture (plan ruling P16):
// the walkthrough runs the real pipeline without an API key. Zero tokens.
import type { EvidencePrompt, EvidenceReply } from './ai-transport.js';

export const FIXTURE_EXPLANATION = 'Check the step where this went wrong, then work it through again.';

const SEED_TYPES = [
  ['sign-error', 'procedural', 'Sign error', 'Got a sign wrong', 'A plus or minus sign is lost or flipped part-way through.'],
  ['wrong-formula', 'misconception', 'Wrong formula used', 'Used the wrong formula', 'A formula for a different quantity is used.'],
  ['step-skipped', 'procedural', 'A step is missing', 'Skipped a step', 'The answer jumps over a step the method needs.'],
  ['concept-confused', 'misconception', 'Two ideas confused', 'Mixed up two ideas', 'Two related ideas of the topic are treated as the same thing.'],
  ['graph-misread', 'procedural', 'Graph or table misread', 'Misread the graph', 'A value is read from the wrong place on a graph or table.'],
  ['rule-overused', 'misconception', 'Rule used where it does not apply', 'Used a rule too widely', 'A rule is applied outside the cases it covers.'],
  ['rounding-early', 'procedural', 'Rounded too early', 'Rounded too early', 'Values are rounded mid-way, so the final answer drifts.'],
  ['definition-partial', 'misconception', 'Definition only partly known', 'Definition not complete', 'A definition is stated with a key condition missing.'],
] as const;

function body(prompt: EvidencePrompt): unknown {
  const refs = prompt.hint.refs ?? [];
  const firstCode = prompt.hint.codes?.[0] ?? null;
  switch (prompt.kind) {
    case 'seed':
      return { types: SEED_TYPES.map(([slug, kind, label, learnerLabel, description]) => ({ slug, kind, label, learnerLabel, description })) };
    case 'diagnosis':
      return { items: refs.map((ref: string) => ({ ref, code: firstCode ?? 'GEN.incomplete-answer', explanation: FIXTURE_EXPLANATION, confidence: 0.8, checkMark: false })) };
    case 'tagging':
      return { items: refs.map((ref: string) => ({ ref, topicCode: firstCode, capsLevel: 'routine' })) };
    case 'tidy':
      return { pairs: [] };
  }
}

export function fixtureReply(prompt: EvidencePrompt): EvidenceReply {
  return { customId: prompt.customId, ok: true, text: JSON.stringify(body(prompt)), usage: { input: 0, output: 0 }, error: null, retryable: false };
}
