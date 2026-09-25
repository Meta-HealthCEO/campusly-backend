// src/modules/Evidence/__tests__/tagging.test.ts
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../../config/env.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../../config/env.js')>();
  return { config: { ...real.config, evidence: { mode: 'fixture', enabled: true } } };
});

import { AssessmentPaper } from '../../QuestionBank/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { School } from '../../School/model.js';
import { DiagnosisRequest } from '../model-taxonomy.js';
import { finalisePaper } from '../../QuestionBank/service-papers-pdf-finalise.js';
import { DIAGNOSIS_POOL_FREE } from '../diagnosis-pool.js';
import { candidateTopics, isNonContentTitle, tagPaperQuestions } from '../tagging.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const schoolId = oid();
const teacherId = oid();
const subject = oid();
const functions = oid();
const revision = oid();
const sequences = oid();

async function nodes(): Promise<void> {
  const n = (_id: Oid, type: string, title: string, parentId: Oid | null) => ({
    _id, type, title, parentId, subjectId: subject, frameworkId: oid(), code: `E-TAG-${title.replace(/\s/g, '')}-${String(_id)}`, metadata: {}, order: 0, schoolId: null, isDeleted: false,
  });
  await CurriculumNode.collection.insertMany([
    n(subject, 'subject', 'Mathematics', null), n(functions, 'topic', 'Functions', subject), n(sequences, 'topic', 'Number patterns', subject),
    n(revision, 'topic', 'Revision', subject), n(oid(), 'subtopic', 'Inverse functions', functions),
  ]);
}

async function paper(topicIds: Oid[], status = 'finalised'): Promise<Oid> {
  const p = await AssessmentPaper.create({
    schoolId, title: 'June test', subjectId: oid(), gradeId: oid(), topicIds, term: 2, year: 2026, paperType: 'class_test', duration: 60, totalMarks: 5,
    status, createdBy: teacherId,
    sections: [{ title: 'A', instructions: '', order: 0, questions: [
      { questionText: 'Find the inverse of y = 2x + 1.', marks: 3, position: 0, modelAnswer: 'y = (x - 1)/2' },
      { questionText: 'Give T10 of 3; 7; 11.', marks: 2, position: 1, modelAnswer: '39', capsLevel: 'routine', tagFrom: 'teacher' },
    ] }],
  });
  return p._id as Oid;
}

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await nodes();
  await School.collection.insertOne({ _id: schoolId, name: 'E tagging', joinCode: `ET${String(schoolId).slice(-8)}`, plan: 'standalone', isDeleted: false });
});
afterAll(async () => {
  await Promise.all([
    AssessmentPaper.deleteMany({ schoolId }), CurriculumNode.deleteMany({ code: /^E-TAG-/ }), School.deleteMany({ _id: schoolId }),
    DiagnosisRequest.deleteMany({ schoolId }),
  ]);
  await mongoose.disconnect();
});

describe('candidateTopics', () => {
  it('a "Revision" topic is replaced by the subject’s content topics, with subtopics', async () => {
    const titles = (await candidateTopics({ schoolId, topicIds: [revision] })).map((c) => c.title).sort();
    expect(titles).toEqual(['Functions', 'Inverse functions', 'Number patterns']);
  });

  it('keeps a content topic marked "(Revision)"; swaps an assessment or planning node for the subject’s content topics', async () => {
    const literacy = oid();
    const [measurement, fat, planning, data] = [oid(), oid(), oid(), oid()];
    const n = (_id: Oid, type: string, title: string, parentId: Oid | null) => ({
      _id, type, title, parentId, subjectId: literacy, frameworkId: oid(), code: `E-TAG-ML-${String(_id)}`, metadata: {}, order: 0, schoolId: null, isDeleted: false,
    });
    await CurriculumNode.collection.insertMany([
      n(literacy, 'subject', 'Mathematical Literacy', null), n(measurement, 'topic', 'Measurement (Revision)', literacy),
      n(fat, 'topic', 'Formal Assessment Task: Investigation', literacy), n(planning, 'topic', 'Planning for 2024/25', literacy),
      n(data, 'topic', 'Data Handling', literacy),
    ]);
    const titles = async (topicIds: Oid[]) => (await candidateTopics({ schoolId, topicIds })).map((c) => c.title).sort();
    expect(await titles([measurement])).toEqual(['Measurement (Revision)']);
    expect(await titles([fat, planning])).toEqual(['Data Handling', 'Measurement (Revision)']);
  });
});

describe('isNonContentTitle (titles from the CAPS data)', () => {
  it.each([
    'Revision', 'Formal Assessment Task: Investigation', 'Revision and Final Examination', 'Final NSC Examination', 'Planning for 2024/25',
    'Weeks 9-10: Assessment and Consolidation', 'Revision of All Grade 12 Topics', 'End-of-Year Examinations', 'Paper 1 revision', 'Test',
    'Prior Knowledge Assessment (Grades 8 & 9)', 'Revision and PAT Completion',
  ])('%s is not content', (title) => {
    expect(isNonContentTitle(title)).toBe(true);
  });

  it.each([
    'Measurement (Revision)', 'Revision of lines, angles and triangles', 'Finance revision', 'Study Skills and Examination Preparation',
    'Assessment of Entrepreneurial Qualities in Business', 'Production Planning and Control', 'Genetic engineering, paternity testing and genetic links',
    'Team Performance Assessment',
  ])('%s is content', (title) => {
    expect(isNonContentTitle(title)).toBe(false);
  });
});

describe('tagPaperQuestions', () => {
  it('fills only what is missing, marks it ai_tag, and costs one unit of the pool', async () => {
    const id = await paper([functions]);
    const outcome = await tagPaperQuestions(id, schoolId);
    expect(outcome).toMatchObject({ tagged: 2, untagged: 0, skipped: null });
    const [first, second] = (await AssessmentPaper.findById(id).lean())!.sections[0].questions;
    expect(first).toMatchObject({ capsLevel: 'routine', tagFrom: 'ai_tag' });
    expect(first.curriculumNodeId).not.toBeNull();
    expect(second.tagFrom).toBe('teacher');
    expect(await DiagnosisRequest.countDocuments({ kind: 'tagging', paperId: id })).toBe(1);
    expect((await AssessmentPaper.findById(id).lean())!.version).toBe(1);
  });

  it('reads the paper only inside the given school', async () => {
    const id = await paper([functions]);
    expect(await tagPaperQuestions(id, oid())).toMatchObject({ tagged: 0, skipped: 'none' });
    expect(await DiagnosisRequest.countDocuments({ kind: 'tagging', paperId: id })).toBe(0);
  });

  it('does nothing when every question is tagged, and skips when the pool is used', async () => {
    const id = await paper([functions]);
    await tagPaperQuestions(id, schoolId);
    expect((await tagPaperQuestions(id, schoolId)).skipped).toBe('none');
    await DiagnosisRequest.collection.insertOne({ kind: 'diagnosis', schoolId, mode: 'batch', state: 'done', model: 'm', createdAt: new Date(),
      items: Array.from({ length: DIAGNOSIS_POOL_FREE }, (_, i) => ({ ref: `a${i}`, cacheKey: `k${i}` })) });
    expect((await tagPaperQuestions(await paper([functions]), schoolId)).skipped).toBe('budget');
  });

  it('finalising a paper tags it in the background', async () => {
    await DiagnosisRequest.deleteMany({ schoolId });
    const id = await paper([functions], 'draft');
    await AssessmentPaper.updateOne({ _id: id }, { $set: { 'sections.0.questions.1.curriculumNodeId': sequences } });
    await finalisePaper(String(id), String(schoolId), String(teacherId), 'teacher', false, true);
    await vi.waitFor(async () => {
      expect((await AssessmentPaper.findById(id).lean())!.sections[0].questions[0].tagFrom).toBe('ai_tag');
    }, { timeout: 5000 });
  });
});
