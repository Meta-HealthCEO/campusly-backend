import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { UserRole } from '../../../common/enums.js';
import { Class, Subject } from '../../Academic/model.js';
import { Homework, HomeworkSubmission } from '../model.js';
import { HomeworkService } from '../service.js';
import { Question } from '../../QuestionBank/model.js';
import { Student } from '../../Student/model.js';
import { Quiz } from '../../Learning/model.js';
import type { HomeworkActor } from '../service-access.js';
// Side-effect imports to register models referenced by populate().
import '../../Auth/model.js';
import '../../ContentLibrary/model.js';

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
    Homework.deleteMany({}),
    HomeworkSubmission.deleteMany({}),
    Class.deleteMany({}),
    Subject.deleteMany({}),
    Question.deleteMany({}),
    Student.deleteMany({}),
    Quiz.deleteMany({}),
  ]);
});

function actor(id: mongoose.Types.ObjectId, schoolId: mongoose.Types.ObjectId): HomeworkActor {
  return {
    id: id.toString(),
    schoolId: schoolId.toString(),
    email: `${id.toString()}@example.test`,
    role: UserRole.TEACHER,
  };
}

async function makeSubject(schoolId: mongoose.Types.ObjectId) {
  return Subject.create({
    schoolId,
    name: `Subject ${new mongoose.Types.ObjectId().toString().slice(-4)}`,
    code: new mongoose.Types.ObjectId().toString().slice(-6).toUpperCase(),
  });
}

async function makeClass(args: {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  gradeId: mongoose.Types.ObjectId;
}) {
  return Class.create({
    schoolId: args.schoolId,
    teacherId: args.teacherId,
    gradeId: args.gradeId,
    name: `Class ${new mongoose.Types.ObjectId().toString().slice(-4)}`,
    capacity: 30,
    classroomCode: new mongoose.Types.ObjectId().toString().slice(-8).toUpperCase(),
  });
}

async function makeQuestion(args: {
  schoolId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  gradeId: mongoose.Types.ObjectId;
  marks?: number;
  type?: 'mcq' | 'true_false' | 'short_answer';
}) {
  return Question.create({
    schoolId: args.schoolId,
    subjectId: args.subjectId,
    gradeId: args.gradeId,
    curriculumNodeId: new mongoose.Types.ObjectId(),
    type: args.type ?? 'true_false',
    stem: 'The sky is blue.',
    media: [],
    diagram: null,
    options: args.type === 'mcq'
      ? [
          { label: 'A', text: 'Blue', isCorrect: true },
          { label: 'B', text: 'Green', isCorrect: false },
        ]
      : [],
    answer: 'true',
    markingRubric: 'Award one mark for the correct answer.',
    marks: args.marks ?? 3,
    cognitiveLevel: { caps: 'knowledge', blooms: 'remember' },
    difficulty: 1,
    tags: [],
    source: 'teacher',
    status: 'approved',
    createdBy: new mongoose.Types.ObjectId(),
  });
}

async function makeStudent(args: {
  schoolId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  gradeId: mongoose.Types.ObjectId;
}) {
  return Student.create({
    schoolId: args.schoolId,
    classId: args.classId,
    gradeId: args.gradeId,
    admissionNumber: new mongoose.Types.ObjectId().toString().slice(-10),
    enrollmentStatus: 'active',
  });
}

async function makeExerciseHomework(args: {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  questionIds: mongoose.Types.ObjectId[];
  status?: 'assigned' | 'closed';
}) {
  return Homework.create({
    schoolId: args.schoolId,
    teacherId: args.teacherId,
    classId: args.classId,
    subjectId: args.subjectId,
    title: 'Exercise homework',
    type: 'exercise',
    exerciseQuestionIds: args.questionIds,
    dueDate: new Date(Date.now() + 86_400_000),
    totalMarks: 99,
    status: args.status ?? 'assigned',
    attachments: [],
    latePolicy: 'block',
    gradebookAutoPublish: false,
  });
}

describe('HomeworkService actor scoping', () => {
  it('scopes teacher list, read, update, and submissions to the owning teacher', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherA = new mongoose.Types.ObjectId();
    const teacherB = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();

    const mine = await makeExerciseHomework({
      schoolId,
      teacherId: teacherA,
      classId,
      subjectId,
      questionIds: [],
    });
    const theirs = await makeExerciseHomework({
      schoolId,
      teacherId: teacherB,
      classId,
      subjectId,
      questionIds: [],
    });

    const scoped = actor(teacherA, schoolId);
    const listed = await HomeworkService.list(scoped, { page: 1, limit: 20 });
    expect(listed.data.map((h) => h._id.toString())).toEqual([mine._id.toString()]);

    await expect(HomeworkService.getById(theirs._id.toString(), scoped))
      .rejects.toMatchObject({ statusCode: 404 });
    await expect(HomeworkService.update(theirs._id.toString(), scoped, { title: 'Nope' } as never))
      .rejects.toMatchObject({ statusCode: 404 });
    await expect(HomeworkService.getSubmissions(theirs._id.toString(), scoped))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('derives schoolId from the authenticated actor when creating homework', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const otherSchoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const subject = await makeSubject(schoolId);
    const cls = await makeClass({ schoolId, teacherId, gradeId });
    const question = await makeQuestion({
      schoolId,
      subjectId: subject._id,
      gradeId,
      marks: 4,
    });

    const homework = await HomeworkService.create({
      type: 'exercise',
      title: 'Spoof attempt',
      schoolId: otherSchoolId.toString(),
      subjectId: subject._id.toString(),
      classId: cls._id.toString(),
      dueDate: new Date(Date.now() + 86_400_000).toISOString(),
      totalMarks: 100,
      exerciseQuestionIds: [question._id.toString()],
      latePolicy: 'block',
      gradebookAutoPublish: false,
    }, actor(teacherId, schoolId));

    expect(homework.schoolId.toString()).toBe(schoolId.toString());
    expect(homework.totalMarks).toBe(4);
  });
});

describe('HomeworkService student detail', () => {
  it('returns assigned exercise questions without answer keys or rubrics', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const question = await makeQuestion({ schoolId, subjectId, gradeId, type: 'mcq' });
    const student = await makeStudent({ schoolId, classId, gradeId });
    const homework = await makeExerciseHomework({
      schoolId,
      teacherId,
      classId,
      subjectId,
      questionIds: [question._id],
    });

    const detail = await HomeworkService.getStudentById(
      homework._id.toString(),
      student._id.toString(),
      schoolId.toString(),
    );

    const questions = detail.exerciseQuestions as Array<Record<string, unknown>>;
    expect(detail.exerciseQuestionIds).toEqual([question._id.toString()]);
    expect(questions).toHaveLength(1);
    expect(questions[0]?.stem).toBe('The sky is blue.');
    expect(questions[0]?.answer).toBeUndefined();
    expect(questions[0]?.markingRubric).toBeUndefined();
    expect((questions[0]?.options as Array<Record<string, unknown>>)[0]?.isCorrect).toBeUndefined();
  });

  it('returns assigned quiz questions without correct answers', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const student = await makeStudent({ schoolId, classId, gradeId });
    const quiz = await Quiz.create({
      schoolId,
      teacherId,
      subjectId,
      classId,
      title: 'Safe quiz',
      type: 'mcq',
      questions: [{
        questionText: 'Pick the colour.',
        questionType: 'mcq',
        options: [
          { text: 'Blue', isCorrect: true },
          { text: 'Green', isCorrect: false },
        ],
        correctAnswer: 'Blue',
        points: 2,
        explanation: 'Blue is correct.',
      }],
      totalPoints: 2,
      status: 'published',
      shuffleQuestions: false,
      shuffleOptions: false,
    });
    const homework = await Homework.create({
      schoolId,
      teacherId,
      classId,
      subjectId,
      title: 'Quiz homework',
      type: 'quiz',
      quizId: quiz._id,
      dueDate: new Date(Date.now() + 86_400_000),
      totalMarks: 2,
      status: 'assigned',
      attachments: [],
      latePolicy: 'block',
      gradebookAutoPublish: false,
    });

    const detail = await HomeworkService.getStudentById(
      homework._id.toString(),
      student._id.toString(),
      schoolId.toString(),
    );

    const safeQuiz = detail.quiz as Record<string, unknown>;
    const questions = safeQuiz.questions as Array<Record<string, unknown>>;
    expect(detail.quizId).toBe(quiz._id.toString());
    expect(questions[0]?.questionText).toBe('Pick the colour.');
    expect(questions[0]?.correctAnswer).toBeUndefined();
    expect(questions[0]?.explanation).toBeUndefined();
    expect((questions[0]?.options as Array<Record<string, unknown>>)[0]?.isCorrect).toBeUndefined();
  });

  it('does not return homework assigned to another class', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const classA = new mongoose.Types.ObjectId();
    const classB = new mongoose.Types.ObjectId();
    const student = await makeStudent({ schoolId, classId: classB, gradeId });
    const homework = await makeExerciseHomework({
      schoolId,
      teacherId,
      classId: classA,
      subjectId,
      questionIds: [],
    });

    await expect(HomeworkService.getStudentById(
      homework._id.toString(),
      student._id.toString(),
      schoolId.toString(),
    )).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('HomeworkService submission validation', () => {
  it('rejects submissions from students outside the assigned class', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const classA = new mongoose.Types.ObjectId();
    const classB = new mongoose.Types.ObjectId();
    const question = await makeQuestion({ schoolId, subjectId, gradeId });
    const homework = await makeExerciseHomework({
      schoolId,
      teacherId,
      classId: classA,
      subjectId,
      questionIds: [question._id],
    });
    const student = await makeStudent({ schoolId, classId: classB, gradeId });

    await expect(HomeworkService.submitHomework(
      homework._id.toString(),
      student._id.toString(),
      schoolId.toString(),
      { type: 'exercise', answers: [{ questionId: question._id.toString(), studentAnswer: 'true' }] },
    )).rejects.toMatchObject({ statusCode: 404 });
  });

  it('rejects closed homework and tampered question sets', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const assigned = await makeQuestion({ schoolId, subjectId, gradeId });
    const extra = await makeQuestion({ schoolId, subjectId, gradeId });
    const student = await makeStudent({ schoolId, classId, gradeId });
    const closed = await makeExerciseHomework({
      schoolId,
      teacherId,
      classId,
      subjectId,
      questionIds: [assigned._id],
      status: 'closed',
    });

    await expect(HomeworkService.submitHomework(
      closed._id.toString(),
      student._id.toString(),
      schoolId.toString(),
      { type: 'exercise', answers: [{ questionId: assigned._id.toString(), studentAnswer: 'true' }] },
    )).rejects.toMatchObject({ statusCode: 400 });

    const open = await makeExerciseHomework({
      schoolId,
      teacherId,
      classId,
      subjectId,
      questionIds: [assigned._id],
    });

    await expect(HomeworkService.submitHomework(
      open._id.toString(),
      student._id.toString(),
      schoolId.toString(),
      { type: 'exercise', answers: [{ questionId: extra._id.toString(), studentAnswer: 'true' }] },
    )).rejects.toMatchObject({ statusCode: 400 });
  });

  it('grades against the assigned question set and stores the assigned max marks', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const classId = new mongoose.Types.ObjectId();
    const question = await makeQuestion({ schoolId, subjectId, gradeId, marks: 5 });
    const student = await makeStudent({ schoolId, classId, gradeId });
    const homework = await makeExerciseHomework({
      schoolId,
      teacherId,
      classId,
      subjectId,
      questionIds: [question._id],
    });

    const submission = await HomeworkService.submitHomework(
      homework._id.toString(),
      student._id.toString(),
      schoolId.toString(),
      { type: 'exercise', answers: [{ questionId: question._id.toString(), studentAnswer: 'true' }] },
    );

    expect(submission.maxMarks).toBe(5);
    expect(submission.mark).toBe(5);
    expect(submission.gradingStatus).toBe('graded');
  });
});
