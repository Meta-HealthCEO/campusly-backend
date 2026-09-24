import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import { Lesson } from '../../Lesson/model.js';
import { Homework, QuizSubmissionModel } from '../../Homework/model.js';
import { AssessmentPaper } from '../../QuestionBank/model-papers.js';
import { PaperSubmission } from '../../QuestionBank/model-submissions.js';
import { PaperMarking } from '../../AITools/model-marking.js';
import { Student, type IStudent } from '../model.js';
import { buildStudentDashboard } from '../service-dashboard.js';

// Scope all deletes/seeds to this file's schoolId so parallel test files
// using the same MongoDB database don't clobber each other's data.
const FILE_SCHOOL_ID = new mongoose.Types.ObjectId();

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
  await Lesson.deleteMany({ schoolId: FILE_SCHOOL_ID });
  await Homework.deleteMany({ schoolId: FILE_SCHOOL_ID });
  await AssessmentPaper.deleteMany({ schoolId: FILE_SCHOOL_ID });
  await QuizSubmissionModel.deleteMany({ schoolId: FILE_SCHOOL_ID });
  await PaperSubmission.deleteMany({ schoolId: FILE_SCHOOL_ID });
  await PaperMarking.deleteMany({ schoolId: FILE_SCHOOL_ID });
  await Student.deleteMany({ schoolId: FILE_SCHOOL_ID });
});

interface SeedResult {
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  gradeId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  student: HydratedDocument<IStudent>;
}

async function seed(): Promise<SeedResult> {
  const schoolId = FILE_SCHOOL_ID;
  const classId = new mongoose.Types.ObjectId();
  const subjectId = new mongoose.Types.ObjectId();
  const gradeId = new mongoose.Types.ObjectId();
  const teacherId = new mongoose.Types.ObjectId();
  const studentId = new mongoose.Types.ObjectId();
  // Return the freshly created HydratedDocument so tests aren't fragile if
  // a parallel test file's unscoped `Student.deleteMany({})` removes the
  // record before we round-trip via `findById`.
  const student = await Student.create({
    _id: studentId,
    schoolId,
    classId,
    gradeId,
    admissionNumber: `ADM-${studentId.toString().slice(-6)}`,
    enrollmentStatus: 'active',
  });
  return { schoolId, classId, subjectId, gradeId, teacherId, studentId, student };
}

interface MakeLessonOpts {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  /** Defaults to published-now if omitted. Pass null for unpublished drafts. */
  publishedAt?: Date | null;
  classId: mongoose.Types.ObjectId;
  scheduledDate: Date;
  assignmentStatus: 'planned' | 'taught';
  taughtAt?: Date;
}

async function makeLesson(o: MakeLessonOpts): Promise<void> {
  await Lesson.create({
    schoolId: o.schoolId,
    teacherId: o.teacherId,
    subjectId: o.subjectId,
    curriculumNodeId: new mongoose.Types.ObjectId(),
    title: o.title,
    durationMinutes: 30,
    publishedAt: o.publishedAt === undefined ? new Date() : o.publishedAt,
    assignedClasses: [
      {
        classId: o.classId,
        scheduledDate: o.scheduledDate,
        status: o.assignmentStatus,
        ...(o.taughtAt ? { taughtAt: o.taughtAt } : {}),
      },
    ],
  });
}

interface MakeHwOpts {
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title: string;
  dueDate: Date;
}

async function makeHomework(o: MakeHwOpts): Promise<HydratedDocument<{ _id: mongoose.Types.ObjectId }>> {
  return Homework.create({
    schoolId: o.schoolId,
    classId: o.classId,
    subjectId: o.subjectId,
    teacherId: o.teacherId,
    title: o.title,
    type: 'quiz',
    dueDate: o.dueDate,
    totalMarks: 10,
    status: 'assigned',
  }) as unknown as HydratedDocument<{ _id: mongoose.Types.ObjectId }>;
}

async function submitHomework(
  schoolId: mongoose.Types.ObjectId,
  studentId: mongoose.Types.ObjectId,
  homeworkId: mongoose.Types.ObjectId,
): Promise<void> {
  await QuizSubmissionModel.create({
    schoolId,
    studentId,
    homeworkId,
    homeworkVersion: 1,
    submittedAt: new Date(),
    maxMarks: 10,
    gradingStatus: 'pending',
    answers: [],
  });
}

describe('buildStudentDashboard.recentLesson', () => {
  it('returns the most recent taught lesson assigned to the student class', async () => {
    const { schoolId, classId, subjectId, teacherId, student } = await seed();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    await makeLesson({
      schoolId, teacherId, subjectId, classId,
      title: 'Older taught lesson',
      scheduledDate: twoDaysAgo, assignmentStatus: 'taught', taughtAt: twoDaysAgo,
    });
    await makeLesson({
      schoolId, teacherId, subjectId, classId,
      title: 'Most recent taught lesson',
      scheduledDate: yesterday, assignmentStatus: 'taught', taughtAt: yesterday,
    });
    await makeLesson({
      schoolId, teacherId, subjectId, classId,
      title: 'Planned for tomorrow (should be ignored)',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), assignmentStatus: 'planned',
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.recentLesson).not.toBeNull();
    expect(dashboard.recentLesson?.title).toBe('Most recent taught lesson');
  });

  it('returns null recentLesson when the class has no lesson taught or past its date', async () => {
    const { schoolId, classId, subjectId, teacherId, student } = await seed();
    await makeLesson({
      schoolId, teacherId, subjectId, classId,
      title: 'Planned for tomorrow',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), assignmentStatus: 'planned',
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.recentLesson).toBeNull();
  });
  // The teacher doesn't always tick "taught": a lesson whose date has passed
  // is still the learner's most recent lesson, so the card agrees with
  // "Lessons this week".
  it('counts a planned lesson whose date has passed as the most recent lesson', async () => {
    const { schoolId, classId, subjectId, teacherId, student } = await seed();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    await makeLesson({
      schoolId, teacherId, subjectId, classId,
      title: 'Taught two days ago',
      scheduledDate: twoDaysAgo, assignmentStatus: 'taught', taughtAt: twoDaysAgo,
    });
    await makeLesson({
      schoolId, teacherId, subjectId, classId,
      title: 'Yesterday, not ticked taught',
      scheduledDate: yesterday, assignmentStatus: 'planned',
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.recentLesson?.title).toBe('Yesterday, not ticked taught');
  });

  it('leaves unpublished drafts out of the recent lesson and the week count', async () => {
    const { schoolId, classId, subjectId, teacherId, student } = await seed();
    const aMinuteAgo = new Date(Date.now() - 60 * 1000);
    await makeLesson({
      schoolId, teacherId, subjectId, classId, publishedAt: null,
      title: 'Draft', scheduledDate: aMinuteAgo, assignmentStatus: 'taught', taughtAt: aMinuteAgo,
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.recentLesson).toBeNull();
    expect(dashboard.counts.lessonsThisWeek).toBe(0);
  });
});

describe('buildStudentDashboard.counts.lessonsThisWeek', () => {
  it('counts lessons assigned in the current week, excluding earlier weeks', async () => {
    const { schoolId, classId, subjectId, teacherId, student } = await seed();
    const today = new Date();
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    await makeLesson({
      schoolId, teacherId, subjectId, classId,
      title: 'In-week 1',
      scheduledDate: today, assignmentStatus: 'planned',
    });
    await makeLesson({
      schoolId, teacherId, subjectId, classId,
      title: 'In-week 2',
      scheduledDate: today, assignmentStatus: 'taught', taughtAt: today,
    });
    await makeLesson({
      schoolId, teacherId, subjectId, classId,
      title: 'Old',
      scheduledDate: tenDaysAgo, assignmentStatus: 'taught', taughtAt: tenDaysAgo,
    });
    // Wrong class — should not count.
    await makeLesson({
      schoolId, teacherId, subjectId,
      classId: new mongoose.Types.ObjectId(),
      title: 'Wrong class',
      scheduledDate: today, assignmentStatus: 'planned',
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.counts.lessonsThisWeek).toBe(2);
  });
});

describe('buildStudentDashboard.homework exclusion', () => {
  it('excludes homework that the student has already submitted', async () => {
    const { schoolId, classId, subjectId, teacherId, studentId, student } = await seed();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Overdue homework that is already submitted — should be excluded everywhere.
    const submittedHw = await makeHomework({
      schoolId, classId, subjectId, teacherId,
      title: 'Already submitted (overdue)', dueDate: yesterday,
    });
    await submitHomework(schoolId, studentId, submittedHw._id);

    // Pending homework (not submitted) — should appear as nextHomework.
    const pendingHw = await makeHomework({
      schoolId, classId, subjectId, teacherId,
      title: 'Pending future homework', dueDate: tomorrow,
    });

    // Another overdue homework that is NOT submitted — should count once.
    await makeHomework({
      schoolId, classId, subjectId, teacherId,
      title: 'Other overdue unsubmitted', dueDate: yesterday,
    });

    const dashboard = await buildStudentDashboard(student);

    expect(dashboard.nextHomework).not.toBeNull();
    expect(dashboard.nextHomework?.id).toBe(pendingHw._id.toString());
    expect(dashboard.nextHomework?.title).toBe('Pending future homework');
    expect(dashboard.counts.homeworkOverdue).toBe(1);
  });

  it('counts homework due this week excluding submitted', async () => {
    const { schoolId, classId, subjectId, teacherId, studentId, student } = await seed();
    // 4 hours from now — keeps us inside the current week boundary almost always.
    const inWeek = new Date(Date.now() + 4 * 60 * 60 * 1000);

    const submitted = await makeHomework({
      schoolId, classId, subjectId, teacherId,
      title: 'Submitted in-week', dueDate: inWeek,
    });
    await submitHomework(schoolId, studentId, submitted._id);

    await makeHomework({
      schoolId, classId, subjectId, teacherId,
      title: 'Unsubmitted in-week', dueDate: inWeek,
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.counts.homeworkDueThisWeek).toBe(1);
  });
});

describe('buildStudentDashboard.nextTest', () => {
  it('returns the upcoming assessment paper assigned to the student class', async () => {
    const { schoolId, classId, subjectId, gradeId, teacherId, student } = await seed();
    const release = new Date(Date.now() - 60 * 60 * 1000);
    const due = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await AssessmentPaper.create({
      schoolId, title: 'Term Test', subjectId, gradeId,
      topicIds: [new mongoose.Types.ObjectId()],
      term: 1, year: 2026, paperType: 'class_test',
      totalMarks: 50, duration: 60, sections: [], status: 'finalised',
      createdBy: teacherId,
      assignments: [{
        _id: new mongoose.Types.ObjectId(),
        classId, mode: 'digital',
        releaseAt: release, dueAt: due,
        assignedBy: teacherId, assignedAt: new Date(),
      }],
    });

    // Paper assigned to a different class — should not appear.
    await AssessmentPaper.create({
      schoolId, title: 'Other class test', subjectId, gradeId,
      topicIds: [new mongoose.Types.ObjectId()],
      term: 1, year: 2026, paperType: 'class_test',
      totalMarks: 50, duration: 60, sections: [], status: 'finalised',
      createdBy: teacherId,
      assignments: [{
        _id: new mongoose.Types.ObjectId(),
        classId: new mongoose.Types.ObjectId(), mode: 'digital',
        releaseAt: release, dueAt: due,
        assignedBy: teacherId, assignedAt: new Date(),
      }],
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.nextTest).not.toBeNull();
    expect(dashboard.nextTest?.title).toBe('Term Test');
    expect(dashboard.counts.testsScheduled).toBe(1);
  });
});

async function makePaper(o: {
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  gradeId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title: string;
  releaseAt: Date;
  dueAt: Date;
}): Promise<mongoose.Types.ObjectId> {
  const paper = await AssessmentPaper.create({
    schoolId: o.schoolId, title: o.title, subjectId: o.subjectId, gradeId: o.gradeId,
    topicIds: [new mongoose.Types.ObjectId()],
    term: 3, year: 2026, paperType: 'class_test',
    totalMarks: 10, duration: 30, sections: [], status: 'finalised',
    createdBy: o.teacherId,
    assignments: [{
      _id: new mongoose.Types.ObjectId(),
      classId: o.classId, mode: 'paper',
      releaseAt: o.releaseAt, dueAt: o.dueAt,
      assignedBy: o.teacherId, assignedAt: o.releaseAt,
    }],
  });
  return paper._id as mongoose.Types.ObjectId;
}

describe('buildStudentDashboard tests: upcoming, overdue and done', () => {
  const day = 24 * 60 * 60 * 1000;

  it('shows only a test still to come as the next test, and counts a missed one as overdue', async () => {
    const { schoolId, classId, subjectId, gradeId, teacherId, student } = await seed();
    await makePaper({
      schoolId, classId, subjectId, gradeId, teacherId,
      title: 'Missed test', releaseAt: new Date(Date.now() - 4 * day), dueAt: new Date(Date.now() - 2 * day),
    });
    await makePaper({
      schoolId, classId, subjectId, gradeId, teacherId,
      title: 'Coming test', releaseAt: new Date(Date.now() + day), dueAt: new Date(Date.now() + 3 * day),
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.nextTest?.title).toBe('Coming test');
    expect(dashboard.counts.testsScheduled).toBe(1);
    expect(dashboard.counts.testsOverdue).toBe(1);
  });

  it('leaves out a test the learner has written and the teacher has marked', async () => {
    const { schoolId, classId, subjectId, gradeId, teacherId, studentId, student } = await seed();
    const paperId = await makePaper({
      schoolId, classId, subjectId, gradeId, teacherId,
      title: 'Marked test', releaseAt: new Date(Date.now() - 4 * day), dueAt: new Date(Date.now() - 2 * day),
    });
    await PaperMarking.collection.insertOne({
      schoolId, teacherId, paperId, studentId, classId, paperType: 'assessment',
      studentName: 'Learner', status: 'completed', issuedToStudent: true, isDeleted: false,
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.nextTest).toBeNull();
    expect(dashboard.counts.testsScheduled).toBe(0);
    expect(dashboard.counts.testsOverdue).toBe(0);
  });

  it('leaves out a digital test the learner has handed in before its due date', async () => {
    const { schoolId, classId, subjectId, gradeId, teacherId, studentId, student } = await seed();
    const paperId = await makePaper({
      schoolId, classId, subjectId, gradeId, teacherId,
      title: 'Handed in', releaseAt: new Date(Date.now() - day), dueAt: new Date(Date.now() + day),
    });
    await PaperSubmission.collection.insertOne({
      schoolId, classId, paperId, studentId, assignmentId: new mongoose.Types.ObjectId(),
      studentName: 'Learner', status: 'submitted', isDeleted: false,
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.nextTest).toBeNull();
    expect(dashboard.counts.testsScheduled).toBe(0);
  });
});

describe('buildStudentDashboard.multi-tenancy', () => {
  it('does not leak homework or lessons from another school', async () => {
    const { classId, subjectId, teacherId, student } = await seed();
    const otherSchool = new mongoose.Types.ObjectId();

    await makeLesson({
      schoolId: otherSchool, teacherId, subjectId, classId,
      title: 'Other school taught',
      scheduledDate: new Date(), assignmentStatus: 'taught', taughtAt: new Date(),
    });
    await makeHomework({
      schoolId: otherSchool, classId, subjectId, teacherId,
      title: 'Other school homework',
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });

    const dashboard = await buildStudentDashboard(student);
    expect(dashboard.recentLesson).toBeNull();
    expect(dashboard.counts.homeworkOverdue).toBe(0);
  });
});
