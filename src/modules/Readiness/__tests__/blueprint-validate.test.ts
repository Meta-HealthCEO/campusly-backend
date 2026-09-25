// src/modules/Readiness/__tests__/blueprint-validate.test.ts
import { describe, expect, it } from 'vitest';
import {
  NON_CONTENT_TITLE, blueprintFileSchema, gradeOfCode, isBlueprintVerified, validateBlueprint, type BlueprintFile, type NodeInfo,
} from '../blueprint-validate.js';

const node = (code: string, type: 'topic' | 'subtopic', title: string, parent: string | null = null, termNumber: number | null = 1): NodeInfo => ({
  id: `id-${code}`, code, type, title, parentId: parent ? `id-${parent}` : null, termNumber, system: true, deleted: false,
});
const NODES: NodeInfo[] = [
  node('X-MATHS-GR12-T1-FUNC', 'topic', 'Functions'),
  node('X-MATHS-GR12-T1-FUNC-01', 'subtopic', 'Inverses', 'X-MATHS-GR12-T1-FUNC'),
  node('X-MATHS-GR11-T2-FUNC', 'topic', 'Functions (including trig)', null, 2),
  node('X-MATHS-GR11-T2-FUNC-03', 'subtopic', 'Trigonometric graphs', 'X-MATHS-GR11-T2-FUNC', 2),
  node('X-MATHS-GR12-T1-TRIG', 'topic', 'Trigonometry'),
  node('X-MATHS-GR12-T4-REV', 'topic', 'Revision', null, 4),
  node('X-MATHS-GR11-T4-MEAS', 'topic', 'Measurement (Revision)', null, 4),
];
const byCode = new Map(NODES.map((n) => [n.code, n]));

function file(over: Partial<BlueprintFile> = {}): BlueprintFile {
  return blueprintFileSchema.parse({
    family: 'X-NSC-MATHS-GR12', examBody: 'DBE', qualification: 'NSC', session: 'november', subjectKey: 'X-MATHS', slug: 'maths',
    subjectTitle: 'Maths', grade: 12, examYear: 2026, sources: [],
    cognitiveScheme: { key: 'maths-4', levels: [
      { key: 'knowledge', label: 'Knowledge', percent: 20, fromStored: ['knowledge'] },
      { key: 'routine', label: 'Routine procedures', percent: 35, fromStored: ['routine'] },
      { key: 'complex', label: 'Complex procedures', percent: 30, fromStored: ['complex'] },
      { key: 'problem_solving', label: 'Problem solving', percent: 15, fromStored: ['problem_solving'] },
    ] },
    papers: [
      { key: 'P1', title: 'Paper 1', totalMarks: 50, durationMinutes: 60, topics: [
        { key: 'P1.FUNC', label: 'Functions', group: 'Functions', marks: 50, nodes: ['X-MATHS-GR12-T1-FUNC', 'X-MATHS-GR11-T2-FUNC'] },
      ] },
      { key: 'P2', title: 'Paper 2', totalMarks: 40, durationMinutes: 60, topics: [
        { key: 'P2.TRIG', label: 'Trigonometry', group: 'Trig', marks: 30, nodes: ['X-MATHS-GR12-T1-TRIG', 'X-MATHS-GR11-T2-FUNC-03'] },
        { key: 'P2.MEAS', label: 'Measurement', group: 'Trig', marks: 10, nodes: ['X-MATHS-GR11-T4-MEAS'] },
      ] },
    ],
    ...over,
  });
}

describe('validateBlueprint', () => {
  it('resolves nodes with their grade and term, and reports every unverified value', () => {
    const r = validateBlueprint(file(), byCode, NODES);
    expect(r.errors).toEqual([]);
    expect(r.data?.papers[0].topics[0].nodes).toEqual([
      { code: 'X-MATHS-GR12-T1-FUNC', nodeId: 'id-X-MATHS-GR12-T1-FUNC', level: 'topic', grade: 12, termNumber: 1 },
      { code: 'X-MATHS-GR11-T2-FUNC', nodeId: 'id-X-MATHS-GR11-T2-FUNC', level: 'topic', grade: 11, termNumber: 2 },
    ]);
    expect(r.unverified).toEqual(expect.arrayContaining(['P1: total, duration', 'P1: exam date missing', 'P2.TRIG: marks and nodes', 'Level knowledge: 20%']));
  });

  it('refuses topic marks that do not add up to the paper total, and levels that do not add up to 100', () => {
    const bad = file();
    const r = validateBlueprint({
      ...bad,
      papers: [{ ...bad.papers[0], totalMarks: 60 }, bad.papers[1]],
      cognitiveScheme: { ...bad.cognitiveScheme, levels: bad.cognitiveScheme.levels.map((l) => (l.key === 'knowledge' ? { ...l, percent: 25 } : l)) },
    }, byCode, NODES);
    expect(r.errors).toEqual(expect.arrayContaining(['P1: topic marks add up to 50, not 60', 'Cognitive levels add up to 105%, not 100%']));
    expect(r.data).toBeNull();
  });

  it('refuses unknown codes, another subject family, a code twice in one paper, and a date outside the exam year', () => {
    const base = file();
    const r = validateBlueprint({ ...base, papers: [
      { ...base.papers[0], examDate: '2027-11-02', topics: [{ ...base.papers[0].topics[0], nodes: ['X-MATHS-GR12-T1-FUNC', 'X-MATHS-GR12-T1-FUNC', 'Y-OTHER-GR12-T1'] }] },
      base.papers[1],
    ] }, new Map([...byCode, ['Y-OTHER-GR12-T1', node('Y-OTHER-GR12-T1', 'topic', 'Other')]]), NODES);
    expect(r.errors).toEqual(expect.arrayContaining([
      'P1: X-MATHS-GR12-T1-FUNC is mapped twice',
      'P1.FUNC: Y-OTHER-GR12-T1 is not a X-MATHS node',
      'P1: exam date 2027-11-02 is not in 2026',
    ]));
  });

  it('warns about content no paper maps, and about whole-title revision nodes, but not "(Revision)" content', () => {
    const r = validateBlueprint(file(), byCode, NODES);
    expect(r.warnings).toEqual([]);
    const withRev = file();
    withRev.papers[1].topics[1].nodes.push('X-MATHS-GR12-T4-REV');
    expect(validateBlueprint(withRev, byCode, NODES).warnings).toEqual(['P2.MEAS: X-MATHS-GR12-T4-REV "Revision" is not content']);
    const missing = file();
    missing.papers[1].topics[0].nodes = ['X-MATHS-GR12-T1-TRIG'];
    missing.papers[1].topics[1].nodes = ['X-MATHS-GR11-T4-MEAS'];
    expect(validateBlueprint(missing, byCode, NODES).warnings).toEqual([]);
    expect(NON_CONTENT_TITLE.test('Measurement (Revision)')).toBe(false);
    expect(NON_CONTENT_TITLE.test('Final NSC Examination')).toBe(true);
    expect(NON_CONTENT_TITLE.test('Revision and Trial Examination')).toBe(true);
  });

  it('warns about a content topic that neither it nor any subtopic of it maps', () => {
    const extra = [...NODES, node('X-MATHS-GR12-T3-STAT', 'topic', 'Statistics', null, 3)];
    expect(validateBlueprint(file(), new Map(extra.map((n) => [n.code, n])), extra).warnings)
      .toEqual(['Not in any paper: X-MATHS-GR12-T3-STAT "Statistics"']);
  });
});

describe('gradeOfCode and isBlueprintVerified', () => {
  it('reads the grade from a code', () => {
    expect(gradeOfCode('CAPS-MATHEMATICS-GR10-T2-FUNC-05')).toBe(10);
    expect(gradeOfCode('CAPS-GR12')).toBe(12);
    expect(gradeOfCode('CAPS-FET')).toBeNull();
  });

  it('is verified only when every paper, topic and level is, and every paper has a date', () => {
    const data = validateBlueprint(file(), byCode, NODES).data!;
    expect(isBlueprintVerified(data)).toBe(false);
    const all = {
      cognitiveScheme: { ...data.cognitiveScheme, levels: data.cognitiveScheme.levels.map((l) => ({ ...l, verified: true })) },
      papers: data.papers.map((p) => ({ ...p, verified: true, examDate: '2026-10-27', topics: p.topics.map((t) => ({ ...t, verified: true })) })),
    };
    expect(isBlueprintVerified(all)).toBe(true);
    expect(isBlueprintVerified({ ...all, papers: [{ ...all.papers[0], examDate: null }, all.papers[1]] })).toBe(false);
  });
});
