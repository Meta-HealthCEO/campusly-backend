import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { PaperMarking } from '../model-marking.js';
import { Student } from '../../Student/model.js';
import { resolveStudentForUser } from '../service-student-ownership.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('student markings access', () => {
  it('resolveStudentForUser returns studentId+schoolId; throws if not a student', async () => {
    const userId = new mongoose.Types.ObjectId();
    const schoolId = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();

    await Student.create({
      userId,
      schoolId,
      gradeId,
      classId,
      admissionNumber: `ADM-${userId.toString()}`,
      isDeleted: false,
    });

    const r = await resolveStudentForUser(String(userId), String(schoolId));
    expect(r.schoolId).toBe(String(schoolId));

    await expect(
      resolveStudentForUser(String(new mongoose.Types.ObjectId()), String(schoolId)),
    ).rejects.toThrow();
  });

  it('student query filters by issuedToStudent=true and own studentId', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const myStudentId = new mongoose.Types.ObjectId();
    const otherStudentId = new mongoose.Types.ObjectId();
    const paperId = new mongoose.Types.ObjectId();

    await PaperMarking.create([
      // Mine, issued — should be visible
      {
        schoolId, teacherId, paperId, paperType: 'generated', studentId: myStudentId,
        studentName: 'Me', imageCount: 0, totalMarks: 5, maxMarks: 10, percentage: 50,
        questions: [], status: 'published', issuedToStudent: true, issuedAt: new Date(),
      },
      // Mine, NOT issued — should be hidden
      {
        schoolId, teacherId, paperId, paperType: 'generated', studentId: myStudentId,
        studentName: 'Me', imageCount: 0, totalMarks: 5, maxMarks: 10, percentage: 50,
        questions: [], status: 'completed', issuedToStudent: false,
      },
      // Someone else's, issued — should be hidden
      {
        schoolId, teacherId, paperId, paperType: 'generated', studentId: otherStudentId,
        studentName: 'Other', imageCount: 0, totalMarks: 8, maxMarks: 10, percentage: 80,
        questions: [], status: 'published', issuedToStudent: true, issuedAt: new Date(),
      },
    ]);

    const visible = await PaperMarking.find({
      studentId: myStudentId,
      schoolId,
      issuedToStudent: true,
      isDeleted: false,
    }).lean();
    expect(visible).toHaveLength(1);
    expect(visible[0].studentName).toBe('Me');
  });
});
