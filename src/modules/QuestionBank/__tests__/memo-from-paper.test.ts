import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { buildPaperMemo, memoSectionsFromPaper } from '../service-paper-memo-build.js';
import { AssessmentPaper } from '../model.js';
import { PaperMemo } from '../../TeacherWorkbench/model.assessment.js';
import { updatePaperQuestion } from '../service-paper-questions.js';

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
    // An unanswered question stores an empty answer, not a placeholder
    // string — that string would otherwise print as real content on the
    // memo PDF. The UI is responsible for showing a placeholder.
    expect(memo[0].answers[1].expectedAnswer).toBe('');
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

  it('gives a finalised paper that has no memo a final memo, without changing the paper', async () => {
    const f = await paper('finalised');
    const memo = await buildPaperMemo(f.paperId, f.schoolId, f.teacherId, 'teacher');
    expect(memo.status).toBe('final');
    expect((await AssessmentPaper.findById(f.paperId).lean())?.status).toBe('finalised');
  });

  it("refuses someone else's paper", async () => {
    const f = await paper('draft');
    await expect(buildPaperMemo(f.paperId, f.schoolId, String(oid()), 'teacher')).rejects.toThrow(/own papers/);
  });

  it('keeps a memo answer the teacher typed by hand when a later edit only touches marks', async () => {
    const f = await paper('draft');
    const memo = await buildPaperMemo(f.paperId, f.schoolId, f.teacherId, 'teacher');
    // The question that starts with no model answer — simulate the teacher
    // typing a fuller answer straight into the memo tab (PaperDetailMemoTab),
    // which never writes back to the question's own modelAnswer field.
    await PaperMemo.updateOne(
      { _id: memo._id },
      { $set: { 'sections.0.answers.1.expectedAnswer': 'Because it kept a steady pace.' } },
    );

    // Edit the question itself, but only its marks — the frontend patch for
    // this action does not include modelAnswer.
    await updatePaperQuestion(f.paperId, f.schoolId, 0, 1, { marks: 4 }, f.teacherId, 'teacher');

    const reloaded = await PaperMemo.findById(memo._id).lean();
    expect(reloaded?.sections[0].answers[1].expectedAnswer).toBe('Because it kept a steady pace.');
    expect(reloaded?.sections[0].answers[1].markAllocation[0].marks).toBe(4);
  });

  it('does resync the memo answer when the edit changes modelAnswer itself', async () => {
    const f = await paper('draft');
    const memo = await buildPaperMemo(f.paperId, f.schoolId, f.teacherId, 'teacher');
    await PaperMemo.updateOne(
      { _id: memo._id },
      { $set: { 'sections.0.answers.1.expectedAnswer': 'Stale answer.' } },
    );

    await updatePaperQuestion(
      f.paperId, f.schoolId, 0, 1,
      { modelAnswer: 'Steady, unhurried effort.' },
      f.teacherId, 'teacher',
    );

    const reloaded = await PaperMemo.findById(memo._id).lean();
    expect(reloaded?.sections[0].answers[1].expectedAnswer).toBe('Steady, unhurried effort.');
  });
});
