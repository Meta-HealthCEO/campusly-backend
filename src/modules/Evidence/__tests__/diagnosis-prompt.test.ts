// src/modules/Evidence/__tests__/diagnosis-prompt.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { AssessmentPaper, Question } from '../../QuestionBank/model.js';
import { Quiz } from '../../Learning/model.js';
import { MisconceptionType } from '../model-taxonomy.js';
import { resetGenericTypeCache, genericTypeId } from '../taxonomy-generic.js';
import { DIAGNOSIS_SYSTEM, DiagnosisReplySchema, diagnosisUserPrompt } from '../diagnosis-prompt.js';
import { questionContexts } from '../question-context.js';
import { topicTaxonomy, typeForItem } from '../diagnosis-types.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const schoolId = oid();
const topic = oid();
const code = `E-DP-${String(topic)}`;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await CurriculumNode.collection.insertOne({ _id: topic, frameworkId: oid(), type: 'topic', parentId: null, title: 'Functions', code, metadata: {}, order: 0, schoolId: null, isDeleted: false });
  await MisconceptionType.create({ code: `${code}.domain-not-restricted`, kind: 'misconception', topicNodeId: topic, label: 'Domain not restricted on inverse',
    learnerLabel: "Didn't restrict the domain", description: 'Gives the inverse of a many-to-one function without restricting the domain.', status: 'seeded', origin: 'ai_seed' });
});
beforeEach(() => resetGenericTypeCache());
afterAll(async () => {
  await Promise.all([
    CurriculumNode.deleteMany({ code: /^E-DP-/ }), MisconceptionType.deleteMany({ code: new RegExp(`^${code}`) }),
    Question.deleteMany({ schoolId }), AssessmentPaper.deleteMany({ schoolId }), Quiz.deleteMany({ schoolId }),
  ]);
  await mongoose.disconnect();
});

describe('the prompt', () => {
  it('lists the general codes the model may choose, but not the ones decided by rule or flag', () => {
    expect(DIAGNOSIS_SYSTEM).toContain('GEN.careless-arithmetic');
    expect(DIAGNOSIS_SYSTEM).not.toContain('GEN.unanswered');
    expect(DIAGNOSIS_SYSTEM).not.toContain('GEN.possible-marking-error');
  });

  it('puts the topic block before the items, and every item has its ref, marks and answer', () => {
    const user = diagnosisUserPrompt(
      { subject: 'Mathematics', grade: 'Grade 12', topic: 'Functions', subtopics: ['Inverses'], types: [{ code: 'X.a', label: 'A', description: 'd' }] },
      [{ ref: 'a1', stem: 'Find f^-1', memo: 'x/3', guideline: '', awarded: 1, available: 2, markerNote: 'Swapped only', answer: 'y = 3x' }],
    );
    expect(user.indexOf('Topic codes:')).toBeLessThan(user.indexOf('[a1]'));
    expect(user).toContain('Marks: 1 of 2');
    expect(user).toContain("Learner's answer: y = 3x");
  });

  it('trims an over-long explanation instead of rejecting the reply, and rejects a bad confidence', () => {
    const long = 'x'.repeat(400);
    const ok = DiagnosisReplySchema.parse({ items: [{ ref: 'a1', code: 'X.a', explanation: long, confidence: 0.7 }] });
    expect(ok.items[0].explanation).toHaveLength(240);
    expect(ok.items[0].checkMark).toBe(false);
    expect(DiagnosisReplySchema.safeParse({ items: [{ ref: 'a1', explanation: 'e', confidence: 2 }] }).success).toBe(false);
  });
});

describe('questionContexts', () => {
  it('finds stem, memo and guideline for bank, paper, quiz keys; skips unknown ones', async () => {
    const q = await Question.create({ curriculumNodeId: topic, schoolId, subjectId: oid(), gradeId: oid(), type: 'short_answer', stem: 'Find f^-1(x) for f(x) = 3x',
      answer: 'x/3', markingRubric: 'Swap and solve', marks: 2, cognitiveLevel: { caps: 'routine', blooms: 'apply' }, createdBy: oid() });
    const paper = await AssessmentPaper.create({ schoolId, title: 'T', subjectId: oid(), gradeId: oid(), topicIds: [topic], term: 1, year: 2026, paperType: 'class_test',
      duration: 10, totalMarks: 3, createdBy: oid(), sections: [{ title: 'A', order: 0, questions: [{ questionText: 'Is y = x² one-to-one?', marks: 3, position: 0, modelAnswer: 'No', markingGuideline: 'Horizontal line test' }] }] });
    const quiz = await Quiz.collection.insertOne({ schoolId, questions: [{ questionText: '2 + 2', questionType: 'mcq', options: [], correctAnswer: '4', points: 1, explanation: 'Add' }] });
    const keys = [`q:${String(q._id)}`, `p:${String(paper._id)}:v1:1.1`, `lq:${String(quiz.insertedId)}:0`, 'zz:nope'];
    const ctx = await questionContexts(keys, schoolId);
    expect(ctx.get(keys[0])).toEqual({ stem: 'Find f^-1(x) for f(x) = 3x', memo: 'x/3', guideline: 'Swap and solve' });
    expect(ctx.get(keys[1])).toEqual({ stem: 'Is y = x² one-to-one?', memo: 'No', guideline: 'Horizontal line test' });
    expect(ctx.get(keys[2])).toEqual({ stem: '2 + 2', memo: '4', guideline: 'Add' });
    expect(ctx.has('zz:nope')).toBe(false);
  });
});

describe('typeForItem', () => {
  it('a listed code, a general code, a proposal, a check-mark flag, and an unknown code', async () => {
    const tax = (await topicTaxonomy(topic))!;
    const listed = await typeForItem(tax, { ref: 'a1', code: `${code}.domain-not-restricted`, explanation: 'e', confidence: 0.9, checkMark: false });
    expect(String(listed)).toBe(String(tax.byCode.get(`${code}.domain-not-restricted`)));
    expect(String(await typeForItem(tax, { ref: 'a1', code: 'GEN.careless-arithmetic', explanation: 'e', confidence: 0.9, checkMark: false })))
      .toBe(String(await genericTypeId('careless-arithmetic')));
    const proposed = await typeForItem(tax, { ref: 'a1', code: null, proposed: { slug: 'swapped-not-solved', kind: 'procedural', label: 'Swapped but did not solve', learnerLabel: 'Stopped after swapping', description: 'Swaps x and y, then stops.' }, explanation: 'e', confidence: 0.8, checkMark: false });
    expect(await MisconceptionType.findById(proposed).lean()).toMatchObject({ code: `${code}.swapped-not-solved`, status: 'proposed', origin: 'ai_proposed' });
    expect(String(await typeForItem(tax, { ref: 'a1', code: 'X.whatever', explanation: 'e', confidence: 0.9, checkMark: true })))
      .toBe(String(await genericTypeId('possible-marking-error')));
    expect(String(await typeForItem(tax, { ref: 'a1', code: 'X.unknown', explanation: 'e', confidence: 0.9, checkMark: false })))
      .toBe(String(await genericTypeId('incomplete-answer')));
  });
});
