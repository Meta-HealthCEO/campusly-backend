import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { Homework } from '../model.js';
import { Lesson } from '../../Lesson/model.js';
import { HomeworkService } from '../service.js';
// Side-effect imports to register models referenced via .populate() in getById.
import '../../Auth/model.js';
import '../../Academic/model.js';
import '../../ContentLibrary/model.js';
import '../../Learning/model.js';
import '../../QuestionBank/model.js';

// File-local scoped IDs so deleteMany doesn't clobber data from parallel tests.
const FILE_SCHOOL_ID = new mongoose.Types.ObjectId();
const OTHER_SCHOOL_ID = new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(
      process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test',
    );
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

beforeEach(async () => {
  await Homework.deleteMany({ schoolId: { $in: [FILE_SCHOOL_ID, OTHER_SCHOOL_ID] } });
  await Lesson.deleteMany({ schoolId: { $in: [FILE_SCHOOL_ID, OTHER_SCHOOL_ID] } });
});

async function seedHomework(schoolId: mongoose.Types.ObjectId) {
  const teacherId = new mongoose.Types.ObjectId();
  const subjectId = new mongoose.Types.ObjectId();
  const classId = new mongoose.Types.ObjectId();
  const homework = await Homework.create({
    schoolId,
    teacherId,
    subjectId,
    classId,
    title: 'Read Chapter 3',
    type: 'reading',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    totalMarks: 10,
  });
  return { homework, teacherId, subjectId, classId };
}

describe('HomeworkService.getById — sourceLesson backlink', () => {
  it('returns sourceLesson when a lesson references the homework via materials[].homeworkId', async () => {
    const { homework, teacherId, subjectId } = await seedHomework(FILE_SCHOOL_ID);

    const lesson = await Lesson.create({
      schoolId: FILE_SCHOOL_ID,
      teacherId,
      subjectId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Source lesson title',
      durationMinutes: 30,
      publishedAt: new Date(),
      materials: [
        { kind: 'homework', title: 'HW link', homeworkId: homework._id },
      ],
    });

    const result = await HomeworkService.getById(
      homework._id.toString(),
      FILE_SCHOOL_ID.toString(),
    );

    expect(result.sourceLesson).toEqual({
      id: lesson._id.toString(),
      title: 'Source lesson title',
    });
  });

  it('returns sourceLesson: null when no lesson references the homework', async () => {
    const { homework } = await seedHomework(FILE_SCHOOL_ID);

    const result = await HomeworkService.getById(
      homework._id.toString(),
      FILE_SCHOOL_ID.toString(),
    );

    expect(result.sourceLesson).toBeNull();
  });

  it('does not return a sourceLesson from another school (multi-tenancy)', async () => {
    const { homework } = await seedHomework(FILE_SCHOOL_ID);

    // A lesson in a DIFFERENT school references this homework — should NOT be matched.
    await Lesson.create({
      schoolId: OTHER_SCHOOL_ID,
      teacherId: new mongoose.Types.ObjectId(),
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Other school lesson',
      durationMinutes: 30,
      publishedAt: new Date(),
      materials: [
        { kind: 'homework', title: 'HW link', homeworkId: homework._id },
      ],
    });

    const result = await HomeworkService.getById(
      homework._id.toString(),
      FILE_SCHOOL_ID.toString(),
    );

    expect(result.sourceLesson).toBeNull();
  });

  it('ignores soft-deleted lessons', async () => {
    const { homework, teacherId } = await seedHomework(FILE_SCHOOL_ID);

    await Lesson.create({
      schoolId: FILE_SCHOOL_ID,
      teacherId,
      curriculumNodeId: new mongoose.Types.ObjectId(),
      title: 'Deleted lesson',
      durationMinutes: 30,
      publishedAt: new Date(),
      isDeleted: true,
      materials: [
        { kind: 'homework', title: 'HW link', homeworkId: homework._id },
      ],
    });

    const result = await HomeworkService.getById(
      homework._id.toString(),
      FILE_SCHOOL_ID.toString(),
    );

    expect(result.sourceLesson).toBeNull();
  });
});
