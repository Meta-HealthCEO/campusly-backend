import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { UserRole } from '../../../common/enums.js';
import { Grade, Subject, Class, Assessment, Mark } from '../../Academic/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { CurriculumFramework } from '../../TeacherWorkbench/model.js';
import { Student } from '../../Student/model.js';
import {
  Assignment,
  AssignmentSubmission,
  type IAssignment,
} from '../model.js';
import {
  addClassAssignment,
  createAssignment,
  getAssignmentById,
  listAssignments,
  listAssignmentsForStudent,
  listSubmissionsForAssignment,
  markSubmission,
  submitAssignment,
  updateAssignment,
} from '../service.js';
import type { AssignmentActor } from '../service-access.js';
import '../../Auth/model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

beforeEach(async () => {
  await Promise.all([
    Assignment.deleteMany({}),
    AssignmentSubmission.deleteMany({}),
    Assessment.deleteMany({}),
    Mark.deleteMany({}),
    Student.deleteMany({}),
    Class.deleteMany({}),
    Subject.deleteMany({}),
    Grade.deleteMany({}),
    CurriculumNode.deleteMany({}),
    CurriculumFramework.deleteMany({}),
  ]);
});

function actor(
  id: mongoose.Types.ObjectId,
  schoolId: mongoose.Types.ObjectId,
  role: UserRole = UserRole.TEACHER,
  flags: Partial<AssignmentActor> = {},
): AssignmentActor {
  return {
    id: id.toString(),
    schoolId: schoolId.toString(),
    email: `${id.toString()}@example.test`,
    role,
    ...flags,
  };
}

async function seedAcademic(schoolId: mongoose.Types.ObjectId) {
  const suffix = new mongoose.Types.ObjectId().toString();
  const framework = await CurriculumFramework.create({
    schoolId: null,
    name: `CAPS ${suffix}`,
    description: '',
    isDefault: true,
    createdBy: null,
  });
  const gradeNode = await CurriculumNode.create({
    frameworkId: framework._id,
    type: 'grade',
    title: 'Grade 8',
    code: `G8-${suffix}`,
    order: 0,
    schoolId: null,
  });
  const subjectNode = await CurriculumNode.create({
    frameworkId: framework._id,
    type: 'subject',
    parentId: gradeNode._id,
    title: 'Mathematics',
    code: `MATH-${suffix}`,
    order: 0,
    schoolId: null,
  });
  const topicNode = await CurriculumNode.create({
    frameworkId: framework._id,
    type: 'topic',
    parentId: subjectNode._id,
    title: 'Algebra',
    code: `ALG-${suffix}`,
    order: 0,
    schoolId: null,
  });
  const otherSubjectNode = await CurriculumNode.create({
    frameworkId: framework._id,
    type: 'subject',
    parentId: gradeNode._id,
    title: 'History',
    code: `HIS-${suffix}`,
    order: 1,
    schoolId: null,
  });
  const otherTopicNode = await CurriculumNode.create({
    frameworkId: framework._id,
    type: 'topic',
    parentId: otherSubjectNode._id,
    title: 'Ancient history',
    code: `HIST-${suffix}`,
    order: 0,
    schoolId: null,
  });
  const grade = await Grade.create({
    schoolId,
    name: 'Grade 8',
    orderIndex: 8,
    curriculumNodeId: gradeNode._id,
  });
  const subject = await Subject.create({
    schoolId,
    name: 'Mathematics',
    code: 'MATH',
    gradeIds: [grade._id],
    curriculumNodeId: subjectNode._id,
  });

  return { grade, subject, topicNode, otherTopicNode };
}

async function makeClass(opts: {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  gradeId: mongoose.Types.ObjectId;
  name?: string;
}) {
  return Class.create({
    schoolId: opts.schoolId,
    teacherId: opts.teacherId,
    gradeId: opts.gradeId,
    name: opts.name ?? 'Grade 8A',
    capacity: 35,
    classroomCode: new mongoose.Types.ObjectId().toString().slice(-8).toUpperCase(),
    isHomeroom: true,
  });
}

async function makeStudent(opts: {
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  gradeId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
}) {
  return Student.create({
    schoolId: opts.schoolId,
    classId: opts.classId,
    gradeId: opts.gradeId,
    userId: opts.userId,
    admissionNumber: new mongoose.Types.ObjectId().toString().slice(-10),
    enrollmentStatus: 'active',
  });
}

async function makeAssignment(opts: {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  gradeId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  status?: 'draft' | 'published' | 'archived';
  assignedClassId?: mongoose.Types.ObjectId;
  releaseAt?: Date | null;
  dueAt?: Date | null;
}) {
  return Assignment.create({
    schoolId: opts.schoolId,
    teacherId: opts.teacherId,
    title: 'Long project',
    brief: '<p>Do the project.</p>',
    subjectId: opts.subjectId,
    gradeId: opts.gradeId,
    topicIds: [opts.topicId],
    totalMarks: 10,
    rubric: [
      { name: 'Content', description: '', maxMarks: 6 },
      { name: 'Presentation', description: '', maxMarks: 4 },
    ],
    submissionFormat: 'text',
    status: opts.status ?? 'draft',
    assignedClasses: opts.assignedClassId
      ? [{
        classId: opts.assignedClassId,
        releaseAt: opts.releaseAt ?? null,
        dueAt: opts.dueAt ?? null,
        assignedBy: opts.teacherId,
        assignedAt: new Date(),
      }]
      : [],
    latePolicy: 'accept',
    gradebookAutoPublish: false,
  });
}

function markPayload(assignment: IAssignment, first = 5, second = 3) {
  return {
    rubricMarks: [
      { criterionId: assignment.rubric[0]._id.toString(), awarded: first },
      { criterionId: assignment.rubric[1]._id.toString(), awarded: second },
    ],
    publish: false,
  };
}

describe('assignment ownership and academic context', () => {
  it('scopes teacher list, read, update, submissions, and marking to the owner', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherA = new mongoose.Types.ObjectId();
    const teacherB = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);

    const mine = await makeAssignment({
      schoolId,
      teacherId: teacherA,
      subjectId: ctx.subject._id,
      gradeId: ctx.grade._id,
      topicId: ctx.topicNode._id,
    });
    const theirs = await makeAssignment({
      schoolId,
      teacherId: teacherB,
      subjectId: ctx.subject._id,
      gradeId: ctx.grade._id,
      topicId: ctx.topicNode._id,
      status: 'published',
    });
    const submission = await AssignmentSubmission.create({
      assignmentId: theirs._id,
      studentId: new mongoose.Types.ObjectId(),
      schoolId,
      classId: new mongoose.Types.ObjectId(),
      assignmentVersion: 1,
      files: [],
      textAnswer: 'Work',
      submittedAt: new Date(),
      isLate: false,
      status: 'submitted',
    });

    const teacherActor = actor(teacherA, schoolId);
    const listed = await listAssignments(teacherActor, { page: 1, limit: 20 });
    expect(listed.data.map((a) => a._id.toString())).toEqual([mine._id.toString()]);

    await expect(getAssignmentById(theirs._id.toString(), teacherActor))
      .rejects.toMatchObject({ statusCode: 404 });
    await expect(updateAssignment(theirs._id.toString(), teacherActor, { title: 'Nope' }))
      .rejects.toMatchObject({ statusCode: 404 });
    await expect(listSubmissionsForAssignment(theirs._id.toString(), teacherActor))
      .rejects.toMatchObject({ statusCode: 404 });
    await expect(markSubmission(submission._id.toString(), teacherActor, teacherA.toString(), markPayload(theirs)))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('validates subject, grade, and topic alignment on create', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);

    await expect(createAssignment({
      title: 'Bad topic',
      brief: '<p>Mismatch.</p>',
      subjectId: ctx.subject._id.toString(),
      gradeId: ctx.grade._id.toString(),
      topicIds: [ctx.otherTopicNode._id.toString()],
      totalMarks: 10,
      rubric: [{ name: 'Content', maxMarks: 10 }],
      submissionFormat: 'text',
      latePolicy: 'accept',
      gradebookAutoPublish: false,
    }, teacherId.toString(), actor(teacherId, schoolId))).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('assignment student lifecycle', () => {
  it('hides future-release assignments and blocks early submission/detail access', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const studentUserId = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);
    const cls = await makeClass({ schoolId, teacherId, gradeId: ctx.grade._id });
    const student = await makeStudent({
      schoolId,
      classId: cls._id,
      gradeId: ctx.grade._id,
      userId: studentUserId,
    });
    const assignment = await makeAssignment({
      schoolId,
      teacherId,
      subjectId: ctx.subject._id,
      gradeId: ctx.grade._id,
      topicId: ctx.topicNode._id,
      status: 'published',
      assignedClassId: cls._id,
      releaseAt: new Date(Date.now() + 86_400_000),
    });

    await expect(getAssignmentById(
      assignment._id.toString(),
      actor(studentUserId, schoolId, UserRole.STUDENT),
    )).rejects.toMatchObject({ statusCode: 404 });
    expect(await listAssignmentsForStudent(student._id.toString(), schoolId.toString())).toHaveLength(0);
    await expect(submitAssignment(
      assignment._id.toString(),
      student._id.toString(),
      schoolId.toString(),
      { files: [], textAnswer: 'Too early' },
    )).rejects.toMatchObject({ statusCode: 404 });

    assignment.assignedClasses[0].releaseAt = new Date(Date.now() - 60_000);
    await assignment.save();

    expect(await listAssignmentsForStudent(student._id.toString(), schoolId.toString())).toHaveLength(1);
    await expect(submitAssignment(
      assignment._id.toString(),
      student._id.toString(),
      schoolId.toString(),
      { files: [], textAnswer: 'Released now' },
    )).resolves.toMatchObject({ status: 'submitted' });
  });

  it('only lets a teacher push assignments to classes they teach', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherA = new mongoose.Types.ObjectId();
    const teacherB = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);
    const ownClass = await makeClass({ schoolId, teacherId: teacherA, gradeId: ctx.grade._id, name: 'Own' });
    const otherClass = await makeClass({ schoolId, teacherId: teacherB, gradeId: ctx.grade._id, name: 'Other' });
    const assignment = await makeAssignment({
      schoolId,
      teacherId: teacherA,
      subjectId: ctx.subject._id,
      gradeId: ctx.grade._id,
      topicId: ctx.topicNode._id,
      status: 'published',
    });

    await expect(addClassAssignment(
      assignment._id.toString(),
      actor(teacherA, schoolId),
      teacherA.toString(),
      { classId: otherClass._id.toString() },
    )).rejects.toMatchObject({ statusCode: 403 });

    const pushed = await addClassAssignment(
      assignment._id.toString(),
      actor(teacherA, schoolId),
      teacherA.toString(),
      { classId: ownClass._id.toString() },
    );
    expect(pushed).toHaveLength(1);
    expect(pushed[0].classId.toString()).toBe(ownClass._id.toString());
  });
});

describe('assignment marking and gradebook publishing', () => {
  it('rejects duplicate rubric criteria while marking', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);
    const cls = await makeClass({ schoolId, teacherId, gradeId: ctx.grade._id });
    const student = await makeStudent({ schoolId, classId: cls._id, gradeId: ctx.grade._id });
    const assignment = await makeAssignment({
      schoolId,
      teacherId,
      subjectId: ctx.subject._id,
      gradeId: ctx.grade._id,
      topicId: ctx.topicNode._id,
      status: 'published',
      assignedClassId: cls._id,
    });
    const submission = await AssignmentSubmission.create({
      assignmentId: assignment._id,
      studentId: student._id,
      schoolId,
      classId: cls._id,
      assignmentVersion: 1,
      files: [],
      textAnswer: 'Work',
      submittedAt: new Date(),
      isLate: false,
      status: 'submitted',
    });

    await expect(markSubmission(
      submission._id.toString(),
      actor(teacherId, schoolId),
      teacherId.toString(),
      {
        rubricMarks: [
          { criterionId: assignment.rubric[0]._id.toString(), awarded: 4 },
          { criterionId: assignment.rubric[0]._id.toString(), awarded: 4 },
        ],
        publish: false,
      },
    )).rejects.toMatchObject({ statusCode: 400 });
  });

  it('publishes multi-class assignment marks into separate class assessments', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);
    const classA = await makeClass({ schoolId, teacherId, gradeId: ctx.grade._id, name: 'A' });
    const classB = await makeClass({ schoolId, teacherId, gradeId: ctx.grade._id, name: 'B' });
    const studentA = await makeStudent({ schoolId, classId: classA._id, gradeId: ctx.grade._id });
    const studentB = await makeStudent({ schoolId, classId: classB._id, gradeId: ctx.grade._id });
    const assignment = await makeAssignment({
      schoolId,
      teacherId,
      subjectId: ctx.subject._id,
      gradeId: ctx.grade._id,
      topicId: ctx.topicNode._id,
      status: 'published',
      assignedClassId: classA._id,
    });
    assignment.assignedClasses.push({
      _id: new mongoose.Types.ObjectId(),
      classId: classB._id,
      releaseAt: null,
      dueAt: null,
      assignedBy: teacherId,
      assignedAt: new Date(),
    });
    await assignment.save();

    const subA = await AssignmentSubmission.create({
      assignmentId: assignment._id,
      studentId: studentA._id,
      schoolId,
      classId: classA._id,
      assignmentVersion: 1,
      files: [],
      textAnswer: 'A',
      submittedAt: new Date(),
      isLate: false,
      status: 'submitted',
    });
    const subB = await AssignmentSubmission.create({
      assignmentId: assignment._id,
      studentId: studentB._id,
      schoolId,
      classId: classB._id,
      assignmentVersion: 1,
      files: [],
      textAnswer: 'B',
      submittedAt: new Date(),
      isLate: false,
      status: 'submitted',
    });

    await markSubmission(
      subA._id.toString(),
      actor(teacherId, schoolId),
      teacherId.toString(),
      { ...markPayload(assignment), publish: true },
    );
    await markSubmission(
      subB._id.toString(),
      actor(teacherId, schoolId),
      teacherId.toString(),
      { ...markPayload(assignment, 6, 4), publish: true },
    );

    const assessments = await Assessment.find({
      schoolId,
      type: 'assignment',
      name: assignment.title,
    }).lean();
    expect(assessments).toHaveLength(2);
    expect(new Set(assessments.map((a) => a.classId?.toString()))).toEqual(new Set([
      classA._id.toString(),
      classB._id.toString(),
    ]));

    const marks = await Mark.find({ schoolId }).lean();
    expect(marks).toHaveLength(2);
    expect(new Set(marks.map((m) => m.assessmentId.toString())).size).toBe(2);
  });
});
