import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { PaperMarking } from '../model-marking.js';
import { listMarkings, getMarkingById, updateMarking } from '../service-marking-queries.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('marking queries', () => {
  it('lists markings scoped to a school', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const otherSchool = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const paperId = new mongoose.Types.ObjectId();

    await PaperMarking.create([
      { schoolId, teacherId, paperId, paperType: 'generated', studentName: 'A', imageCount: 1,
        totalMarks: 5, maxMarks: 10, percentage: 50, questions: [], status: 'completed' },
      { schoolId, teacherId, paperId, paperType: 'generated', studentName: 'B', imageCount: 1,
        totalMarks: 8, maxMarks: 10, percentage: 80, questions: [], status: 'completed' },
      { schoolId: otherSchool, teacherId, paperId, paperType: 'generated', studentName: 'C', imageCount: 1,
        totalMarks: 2, maxMarks: 10, percentage: 20, questions: [], status: 'completed' },
    ]);

    const { markings, total } = await listMarkings(schoolId.toString(), {});
    expect(markings.length).toBe(2);
    expect(total).toBe(2);
  });

  it('returns one marking by id', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const paperId = new mongoose.Types.ObjectId();
    const created = await PaperMarking.create({
      schoolId, teacherId, paperId, paperType: 'generated', studentName: 'X',
      imageCount: 1, totalMarks: 5, maxMarks: 10, percentage: 50, questions: [], status: 'completed',
    });
    const fetched = await getMarkingById(created._id.toString(), schoolId.toString());
    expect(fetched.studentName).toBe('X');
  });

  it('updates question marks and recomputes totals', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const paperId = new mongoose.Types.ObjectId();
    const created = await PaperMarking.create({
      schoolId, teacherId, paperId, paperType: 'generated', studentName: 'Y', imageCount: 1,
      totalMarks: 5, maxMarks: 10, percentage: 50,
      questions: [
        { questionNumber: '1', studentAnswer: '', correctAnswer: '', marksAwarded: 2, maxMarks: 5, feedback: '' },
        { questionNumber: '2', studentAnswer: '', correctAnswer: '', marksAwarded: 3, maxMarks: 5, feedback: '' },
      ],
      status: 'completed',
    });
    const updated = await updateMarking(created._id.toString(), schoolId.toString(), {
      questions: [{ questionNumber: '1', marksAwarded: 5, maxMarks: 5 }],
    });
    expect(updated.questions.find((q) => q.questionNumber === '1')?.marksAwarded).toBe(5);
    expect(updated.totalMarks).toBe(8);
    expect(updated.percentage).toBe(80);
  });

  it('rejects update on published marking', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const paperId = new mongoose.Types.ObjectId();
    const created = await PaperMarking.create({
      schoolId, teacherId, paperId, paperType: 'generated', studentName: 'Z', imageCount: 1,
      totalMarks: 5, maxMarks: 10, percentage: 50, questions: [], status: 'published',
    });
    await expect(
      updateMarking(created._id.toString(), schoolId.toString(), { questions: [] }),
    ).rejects.toThrow(/published/i);
  });
});
