import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Assessment, Mark } from '../model.js';
import { publishMarkToGradebook } from '../service-gradebook-publish.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('publishMarkToGradebook', () => {
  it('creates a Mark when none exists', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const assessment = await Assessment.create({
      name: 'Test 1', subjectId: new mongoose.Types.ObjectId(), classId: null,
      schoolId, type: 'test', totalMarks: 50, weight: 20, term: 1,
      academicYear: 2026, date: new Date(),
    });
    const studentId = new mongoose.Types.ObjectId();

    const result = await publishMarkToGradebook({
      schoolId: schoolId.toString(),
      assessmentId: assessment._id.toString(),
      studentId: studentId.toString(),
      mark: 40,
      comment: 'Good work',
    });
    expect(result.mark).toBe(40);
    expect(result.total).toBe(50);
    expect(result.percentage).toBe(80);

    const stored = await Mark.findOne({ assessmentId: assessment._id, studentId });
    expect(stored?.comment).toBe('Good work');
  });

  it('upserts (second call replaces first)', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const assessment = await Assessment.create({
      name: 'T2', subjectId: new mongoose.Types.ObjectId(), classId: null,
      schoolId, type: 'test', totalMarks: 20, weight: 10, term: 1,
      academicYear: 2026, date: new Date(),
    });
    const studentId = new mongoose.Types.ObjectId();

    await publishMarkToGradebook({
      schoolId: schoolId.toString(), assessmentId: assessment._id.toString(),
      studentId: studentId.toString(), mark: 10,
    });
    await publishMarkToGradebook({
      schoolId: schoolId.toString(), assessmentId: assessment._id.toString(),
      studentId: studentId.toString(), mark: 18,
    });

    const all = await Mark.find({ assessmentId: assessment._id, studentId });
    expect(all.length).toBe(1);
    expect(all[0].mark).toBe(18);
  });

  it('rejects mark greater than totalMarks', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const assessment = await Assessment.create({
      name: 'T3', subjectId: new mongoose.Types.ObjectId(), classId: null,
      schoolId, type: 'test', totalMarks: 10, weight: 5, term: 1,
      academicYear: 2026, date: new Date(),
    });
    await expect(publishMarkToGradebook({
      schoolId: schoolId.toString(), assessmentId: assessment._id.toString(),
      studentId: new mongoose.Types.ObjectId().toString(), mark: 11,
    })).rejects.toThrow(/cannot exceed/i);
  });

  it('rejects cross-tenant assessment', async () => {
    const schoolA = new mongoose.Types.ObjectId();
    const schoolB = new mongoose.Types.ObjectId();
    const assessment = await Assessment.create({
      name: 'T4', subjectId: new mongoose.Types.ObjectId(), classId: null,
      schoolId: schoolA, type: 'test', totalMarks: 10, weight: 5, term: 1,
      academicYear: 2026, date: new Date(),
    });
    await expect(publishMarkToGradebook({
      schoolId: schoolB.toString(), assessmentId: assessment._id.toString(),
      studentId: new mongoose.Types.ObjectId().toString(), mark: 5,
    })).rejects.toThrow(/not found/i);
  });

  it('rejects negative mark', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const assessment = await Assessment.create({
      name: 'T5', subjectId: new mongoose.Types.ObjectId(), classId: null,
      schoolId, type: 'test', totalMarks: 10, weight: 5, term: 1,
      academicYear: 2026, date: new Date(),
    });
    await expect(publishMarkToGradebook({
      schoolId: schoolId.toString(), assessmentId: assessment._id.toString(),
      studentId: new mongoose.Types.ObjectId().toString(), mark: -1,
    })).rejects.toThrow(/non-negative|negative/i);
  });
});
