import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { buildPaperMemo, memoSectionsFromPaper } from '../service-paper-memo-build.js';
import { AssessmentPaper } from '../model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

const sections = [
  { title: 'Section A', order: 0, questions: [
    { questionText: 'Who won?', marks: 2, position: 0, modelAnswer: 'The tortoise.' },
    { questionText: 'Why?', marks: 3, position: 1, modelAnswer: undefined },
  ] },
];

describe('memoSectionsFromPaper', () => {
  it("numbers answers by section and question and takes each question's model answer and marks", () => {
    const memo = memoSectionsFromPaper(sections);
    expect(memo[0].sectionTitle).toBe('Section A');
    expect(memo[0].answers.map((a) => a.questionNumber)).toEqual(['1.1', '1.2']);
    expect(memo[0].answers[0]).toMatchObject({ expectedAnswer: 'The tortoise.', markAllocation: [{ criterion: 'Full marks', marks: 2 }] });
    expect(memo[0].answers[1].expectedAnswer).toBe('Add the expected answer.');
  });
});

describe('buildPaperMemo', () => {
  async function paper(status: 'draft' | 'finalised') {
    const teacherId = oid();
    const schoolId = oid();
    const p = await AssessmentPaper.create({
      schoolId, title: `Reading check ${oid().toString().slice(-4)}`, subjectId: oid(), gradeId: oid(), topicIds: [oid()],
      term: 3, year: 2026, paperType: 'class_test', duration: 30, totalMarks: 5, createdBy: teacherId, status,
      sections: sections.map((s) => ({ ...s, instructions: '', questions: s.questions.map((q) => ({ ...q })) })),
    });
    return { paperId: String(p._id), schoolId: String(schoolId), teacherId: String(teacherId) };
  }

  it('builds the memo once, however often it is asked', async () => {
    const f = await paper('draft');
    const first = await buildPaperMemo(f.paperId, f.schoolId, f.teacherId, 'teacher');
    const second = await buildPaperMemo(f.paperId, f.schoolId, f.teacherId, 'teacher');
    expect(String(second._id)).toBe(String(first._id));
    expect(first.totalMarks).toBe(5);
    expect(first.sections[0].answers).toHaveLength(2);
  });

  it('refuses to add a memo to a finalised paper', async () => {
    const f = await paper('finalised');
    await expect(buildPaperMemo(f.paperId, f.schoolId, f.teacherId, 'teacher')).rejects.toThrow(/finalised/);
  });
});
