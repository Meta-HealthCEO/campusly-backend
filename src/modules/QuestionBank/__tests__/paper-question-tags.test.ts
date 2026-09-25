// src/modules/QuestionBank/__tests__/paper-question-tags.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { AssessmentPaper, Question, type IQuestion } from '../model.js';
import { INLINE_ONLY_TAG, toPaperQuestion } from '../service-paper-gen-helpers.js';
import { PapersService } from '../service-papers.js';
import { clonePaper } from '../service-papers-helpers.js';
import { addQuestionToPaper } from '../service-paper-questions.js';
import { savePaperQuestionToBank } from '../service-paper-question-bank.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import type { AddQuestionToPaperInput, UpdatePaperInput } from '../validation.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const schoolId = oid();
const teacherId = oid();

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => {
  await Promise.all([
    AssessmentPaper.deleteMany({ schoolId }), Question.deleteMany({ schoolId }), CurriculumNode.deleteMany({ code: /^E-TAGS-/ }),
  ]);
  await mongoose.disconnect();
});

async function topicNode(title = 'Functions'): Promise<Oid> {
  const id = oid();
  await CurriculumNode.collection.insertOne({
    _id: id, frameworkId: oid(), type: 'topic', parentId: null, title, code: `E-TAGS-${String(id)}`, description: '',
    metadata: {}, order: 0, schoolId: null, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
  });
  return id;
}

function generated(nodeId: Oid, subjectId: Oid): IQuestion {
  return {
    _id: oid(), curriculumNodeId: nodeId, subjectId, type: 'structured', stem: 'Find the inverse of f(x) = 2x.',
    options: [], answer: 'f^-1(x) = x/2', markingRubric: '', marks: 3,
    cognitiveLevel: { caps: 'complex', blooms: 'analyse' }, tags: [INLINE_ONLY_TAG],
  } as unknown as IQuestion;
}

async function draftPaper(topic: Oid): Promise<string> {
  const paper = await AssessmentPaper.create({
    schoolId, title: 'Functions test', subjectId: oid(), gradeId: oid(), topicIds: [topic], term: 1, year: 2026,
    paperType: 'class_test', duration: 30, totalMarks: 3, createdBy: teacherId,
    sections: [{ title: 'A', instructions: '', order: 0, questions: [{
      questionText: 'Find the inverse of f(x) = 2x.', marks: 3, position: 0, modelAnswer: 'x/2',
      curriculumNodeId: topic, capsLevel: 'complex', tagFrom: 'generator',
    }] }],
  });
  return String(paper._id);
}

describe('generated questions keep their tags', () => {
  it("keeps the generator's topic and level on an inline question", () => {
    const topic = oid();
    const pq = toPaperQuestion(generated(topic, oid()), 0);
    expect(String(pq.curriculumNodeId)).toBe(String(topic));
    expect(pq.capsLevel).toBe('complex');
    expect(pq.tagFrom).toBe('generator');
  });

  it('drops the Subject-id fallback but keeps the level', () => {
    const subjectId = oid();
    const pq = toPaperQuestion(generated(subjectId, subjectId), 0);
    expect(pq.curriculumNodeId).toBeNull();
    expect(pq.capsLevel).toBe('complex');
  });

  it('leaves a bank reference to the bank', () => {
    const bank = { ...generated(oid(), oid()), tags: [] } as unknown as IQuestion;
    const pq = toPaperQuestion(bank, 0);
    expect(pq.questionId).not.toBeNull();
    expect(pq.curriculumNodeId ?? null).toBeNull();
  });
});

describe('tags survive editing, copying and saving to the bank', () => {
  it('keeps tags when the editor saves sections without them', async () => {
    const topic = await topicNode();
    const paperId = await draftPaper(topic);
    const data = { sections: [{ title: 'A', instructions: '', questions: [
      { questionText: 'Find the inverse of f(x) = 2x.', marks: 3, position: 0, options: [] },
    ] }] } as unknown as UpdatePaperInput;
    await PapersService.updatePaper(paperId, String(schoolId), String(teacherId), 'teacher', data);
    const q = (await AssessmentPaper.findById(paperId).lean())!.sections[0].questions[0];
    expect(String(q.curriculumNodeId)).toBe(String(topic));
    expect(q.capsLevel).toBe('complex');
    expect(q.tagFrom).toBe('generator');
  });

  it('drops the old tags when the editor replaced the question', async () => {
    const paperId = await draftPaper(await topicNode());
    const data = { sections: [{ title: 'A', instructions: '', questions: [
      { questionText: 'A different question.', marks: 3, position: 0, options: [] },
    ] }] } as unknown as UpdatePaperInput;
    await PapersService.updatePaper(paperId, String(schoolId), String(teacherId), 'teacher', data);
    const q = (await AssessmentPaper.findById(paperId).lean())!.sections[0].questions[0];
    expect(q.curriculumNodeId ?? null).toBeNull();
  });

  it('a copied paper keeps its tags and its options', async () => {
    const topic = await topicNode();
    const paperId = await draftPaper(topic);
    await AssessmentPaper.updateOne({ _id: paperId }, { $set: { 'sections.0.questions.0.options': [
      { label: 'A', text: 'x/2', isCorrect: true }, { label: 'B', text: '2x', isCorrect: false },
    ] } });
    const copy = await clonePaper(paperId, String(schoolId), String(teacherId));
    const q = (await AssessmentPaper.findById(copy._id).lean())!.sections[0].questions[0];
    expect(String(q.curriculumNodeId)).toBe(String(topic));
    expect(q.options).toHaveLength(2);
  });

  it('a teacher can tag a question they add, and an unknown topic is refused', async () => {
    const topic = await topicNode('Sequences');
    const paperId = await draftPaper(await topicNode());
    const input = { questionText: 'Find T5 of 2; 5; 8', marks: 2, position: 1, options: [], curriculumNodeId: String(topic), capsLevel: 'routine' } as unknown as AddQuestionToPaperInput;
    const paper = await addQuestionToPaper(paperId, String(schoolId), 0, input, String(teacherId), 'teacher');
    const added = paper.sections[0].questions[1];
    expect(String(added.curriculumNodeId)).toBe(String(topic));
    expect(added.tagFrom).toBe('teacher');
    const bad = { ...input, curriculumNodeId: String(oid()) } as unknown as AddQuestionToPaperInput;
    await expect(addQuestionToPaper(paperId, String(schoolId), 0, bad, String(teacherId), 'teacher'))
      .rejects.toThrow('That curriculum topic is not available');
  });

  it("save to bank uses the question's own topic and level", async () => {
    const topic = await topicNode();
    const paperId = await draftPaper(await topicNode('Revision'));
    await AssessmentPaper.updateOne({ _id: paperId }, { $set: { 'sections.0.questions.0.curriculumNodeId': topic } });
    const { questionId } = await savePaperQuestionToBank(paperId, String(schoolId), 0, 0, String(teacherId));
    const saved = await Question.findById(questionId).lean();
    expect(String(saved!.curriculumNodeId)).toBe(String(topic));
    expect(saved!.cognitiveLevel.caps).toBe('complex');
  });
});
