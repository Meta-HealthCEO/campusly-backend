// src/modules/Readiness/__tests__/draft-blueprint.test.ts
//
// The draft Mathematics blueprint (spec §2.6, ruling RP11) validates against the CAPS files the repo holds, and
// nothing in it is verified: it cannot reach a learner until Shaun's 2026 Examination Guidelines are checked.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { blueprintFileSchema, isBlueprintVerified, validateBlueprint, type NodeInfo } from '../blueprint-validate.js';

interface OutputNode { type: string; code: string; title: string; parentCode: string | null }
const nodes: NodeInfo[] = [10, 11, 12].flatMap((g: number) => {
  const file = JSON.parse(readFileSync(`scripts/output/caps-mathematics-gr${g}.json`, 'utf8')) as { nodes: OutputNode[] };
  return file.nodes.filter((n) => n.type === 'topic' || n.type === 'subtopic').map((n): NodeInfo => ({
    id: n.code, code: n.code, type: n.type, title: n.title, parentId: n.parentCode, termNumber: null, system: true, deleted: false,
  }));
});
const draft = blueprintFileSchema.parse(JSON.parse(readFileSync('scripts/blueprints/nsc-mathematics-gr12-2026.json', 'utf8')));
const report = validateBlueprint(draft, new Map(nodes.map((n) => [n.code, n])), nodes);

describe('the draft NSC Mathematics 2026 blueprint', () => {
  it('has no errors and maps every Grade 10–12 content topic exactly once', () => {
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
  });

  it('adds up: Paper 1 and Paper 2 are 150 each, and the levels are 20/35/30/15', () => {
    expect(draft.papers.map((p) => [p.key, p.totalMarks, p.topics.reduce((s, t) => s + t.marks, 0)])).toEqual([['P1', 150, 150], ['P2', 150, 150]]);
    expect(draft.cognitiveScheme.levels.map((l) => l.percent)).toEqual([20, 35, 30, 15]);
  });

  it('is entirely unverified, has no exam dates, and carries the Paper 2 conflict note', () => {
    expect(isBlueprintVerified(report.data!)).toBe(false);
    expect(draft.papers.every((p) => !p.verified && p.examDate === null && p.topics.every((t) => !t.verified))).toBe(true);
    expect(draft.cognitiveScheme.levels.every((l) => !l.verified)).toBe(true);
    for (const key of ['P2.TRIG', 'P2.GEOM']) {
      expect(draft.papers[1].topics.find((t) => t.key === key)?.note).toMatch(/conflict/i);
    }
  });

  it('sends Grade 10–11 trigonometric graphs to Paper 2, not Paper 1', () => {
    const trig = draft.papers[1].topics.find((t) => t.key === 'P2.TRIG')!;
    expect(trig.nodes).toEqual(expect.arrayContaining(['CAPS-MATHEMATICS-GR10-T2-FUNC-05', 'CAPS-MATHEMATICS-GR11-T2-FUNC-06']));
  });
});
