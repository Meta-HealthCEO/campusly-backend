/**
 * Teacher demo data for walkthroughs (programme plan phase 0B).
 *
 * Unlike seed.ts this NEVER clears anything: it upserts a realistic week for
 * Thandi Molefe at Greenfield Primary on top of an existing dev database
 * (keeping the imported CAPS tree and plans). Safe to run repeatedly.
 *
 *   npm run seed:teacher-demo
 */
import mongoose, { Types } from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { User } from '../modules/Auth/model.js';
import { School } from '../modules/School/model.js';
import { Student } from '../modules/Student/model.js';
import { Parent } from '../modules/Parent/model.js';
import { Class, Subject, Timetable } from '../modules/Academic/model.js';
import { Attendance } from '../modules/Attendance/model.js';
import { Lesson } from '../modules/Lesson/model.js';
import { ContentResource } from '../modules/ContentLibrary/model.js';
import { CurriculumNode } from '../modules/CurriculumStructure/model.js';
import { Homework, HomeworkSubmission } from '../modules/Homework/model.js';
import { MessageThread, Message } from '../modules/Messaging/model.js';
import { AssessmentPaper } from '../modules/QuestionBank/model-papers.js';
import { demoDates, planWeek, type PlannedSlot, type TeachingPair } from './teacher-demo/plan.js';
import { CAPS_SUBJECT, DEMO_MODULES, DEMO_SUBJECTS, HOMEWORK, LESSONS, PAPERS, THREADS } from './teacher-demo/content.js';

const TEACHER_EMAIL = 'thandi.molefe@greenfieldprimary.co.za';
type Id = Types.ObjectId;

interface Ctx {
  schoolId: Id;
  teacherId: Id;
  classes: Map<string, { id: Id; gradeId: Id }>;
  subjects: Map<string, Id>;
  topics: Map<string, Id[]>;
  week: PlannedSlot<Id>[];
  dates: ReturnType<typeof demoDates>;
}

async function loadContext(): Promise<Ctx> {
  const teacher = await User.findOne({ email: TEACHER_EMAIL }).lean();
  if (!teacher?.schoolId) throw new Error(`Run npm run seed first: ${TEACHER_EMAIL} not found`);
  const schoolId = teacher.schoolId as Id;
  const teacherId = teacher._id as Id;

  const classDocs = await Class.find({ schoolId, teacherId, isDeleted: false }).lean();
  const classes = new Map(classDocs.map((c) => [c.name, { id: c._id as Id, gradeId: c.gradeId as Id }]));
  const subjectDocs = await Subject.find({ schoolId, isDeleted: false, name: { $in: DEMO_SUBJECTS } }).lean();
  // Foundation-phase subjects (they list Grade R/1 in gradeIds); the school also has FET Mathematics.
  const homeGrades = new Set(classDocs.map((c) => String(c.gradeId)));
  const subjects = new Map(subjectDocs
    .filter((s) => (s.gradeIds ?? []).some((g) => homeGrades.has(String(g))))
    .map((s) => [s.name, s._id as Id]));

  const grade1 = await CurriculumNode.findOne({ type: 'grade', title: 'Grade 1', schoolId: null, isDeleted: false }).lean();
  if (!grade1) throw new Error('CAPS tree missing: import it first (see campusly-local-run notes)');
  const topics = new Map<string, Id[]>();
  for (const [name, capsTitle] of Object.entries(CAPS_SUBJECT)) {
    const subjectNode = await CurriculumNode.findOne({ type: 'subject', parentId: grade1._id, title: capsTitle, isDeleted: false }).lean();
    const nodes = subjectNode
      ? await CurriculumNode.find({ subjectId: subjectNode._id, type: 'topic', termNumber: 3, isDeleted: false }).sort({ order: 1 }).lean()
      : [];
    topics.set(name, nodes.map((n) => n._id as Id));
  }

  const homeroomName = classes.has('Grade 1 - A') ? 'Grade 1 - A' : classDocs[0]?.name;
  const pairs: TeachingPair<Id>[] = [];
  for (const [className, cls] of classes) {
    for (const [subjectName, subjectId] of subjects) {
      if (DEMO_SUBJECTS.includes(subjectName)) pairs.push({ classId: cls.id, subjectId, homeroom: className === homeroomName });
    }
  }
  return { schoolId, teacherId, classes, subjects, topics, week: planWeek(pairs), dates: demoDates(new Date()) };
}

async function seedModulesAndTimetable(ctx: Ctx): Promise<void> {
  await School.updateOne({ _id: ctx.schoolId }, { $addToSet: { modulesEnabled: { $each: DEMO_MODULES } } });
  for (const slot of ctx.week) {
    await Timetable.updateOne(
      { classId: slot.classId, day: slot.day, period: slot.period },
      { $set: { schoolId: ctx.schoolId, teacherId: ctx.teacherId, subjectId: slot.subjectId, startTime: slot.startTime, endTime: slot.endTime, room: 'Room 4', isDeleted: false } },
      { upsert: true },
    );
  }
  // Anything else on Thandi's timetable (e.g. hand-made rows) would double-book her.
  const planned = ctx.week.map((s) => ({ classId: s.classId, day: s.day, period: s.period }));
  await Timetable.updateMany({ teacherId: ctx.teacherId, isDeleted: false, $nor: planned }, { $set: { isDeleted: true } });
}

async function seedRegister(ctx: Ctx): Promise<void> {
  const firstToday = ctx.week.find((s) => s.day === ctx.dates.weekday && s.period === 1);
  if (!firstToday) return;
  const learners = await Student.find({ classId: firstToday.classId, isDeleted: false }).select('_id').lean();
  for (const [i, learner] of learners.entries()) {
    await Attendance.updateOne(
      { studentId: learner._id, schoolId: ctx.schoolId, date: ctx.dates.registerDate, period: 1 },
      { $set: { classId: firstToday.classId, status: i === 1 ? 'late' : 'present', recordedBy: ctx.teacherId } },
      { upsert: true },
    );
  }
}

/** The next time this class has this subject, starting today. */
function nextSlotDate(ctx: Ctx, classId: Id, subjectId: Id): Date {
  const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(ctx.dates.today.getFullYear(), ctx.dates.today.getMonth(), ctx.dates.today.getDate() + offset);
    const weekday = order[(day.getDay() + 6) % 7];
    const slot = ctx.week.find((s) => s.day === weekday && String(s.classId) === String(classId) && String(s.subjectId) === String(subjectId));
    if (slot && day.getDay() !== 0 && day.getDay() !== 6) return ctx.dates.atPeriod(day, slot.period);
  }
  return ctx.dates.atPeriod(ctx.dates.today, 2);
}

async function seedLessons(ctx: Ctx): Promise<number> {
  let count = 0;
  for (const [i, demo] of LESSONS.entries()) {
    const cls = ctx.classes.get(demo.className);
    const subjectId = ctx.subjects.get(demo.subject);
    const topicId = ctx.topics.get(demo.subject)?.[i % 2];
    if (!cls || !subjectId || !topicId) continue;
    const resource = await ContentResource.findOneAndUpdate(
      { createdBy: ctx.teacherId, title: demo.notesTitle },
      {
        $set: {
          schoolId: ctx.schoolId, curriculumNodeId: topicId, type: 'study_notes', gradeId: cls.gradeId, subjectId, term: 3,
          status: 'approved', isDeleted: false,
          blocks: [{ blockId: 'notes-1', type: 'text', order: 0, content: demo.notes }],
        },
      },
      { upsert: true, returnDocument: 'after' },
    );
    const materialId = new Types.ObjectId();
    await Lesson.updateOne(
      { teacherId: ctx.teacherId, title: demo.title },
      {
        $set: {
          schoolId: ctx.schoolId, subjectId, gradeId: cls.gradeId, curriculumNodeId: topicId, termNumber: 3,
          durationMinutes: demo.durationMinutes, objectives: demo.objectives, isDeleted: false, publishedAt: new Date(),
          materials: [{ _id: materialId, kind: 'study_notes', title: demo.notesTitle, contentResourceId: resource._id }],
          phases: ['introduction', 'direct_instruction', 'practice', 'assessment', 'homework']
            .map((phase) => ({ phase, materialIds: phase === 'direct_instruction' ? [materialId] : [] })),
          assignedClasses: [{ classId: cls.id, scheduledDate: nextSlotDate(ctx, cls.id, subjectId), status: 'planned' }],
        },
      },
      { upsert: true },
    );
    count += 1;
  }
  return count;
}

async function seedHomework(ctx: Ctx): Promise<number> {
  let pending = 0;
  for (const demo of HOMEWORK) {
    const cls = ctx.classes.get(demo.className);
    const subjectId = ctx.subjects.get(demo.subject);
    if (!cls || !subjectId) continue;
    const dueDate = demo.due === 'today' ? ctx.dates.dueToday : demo.due === 'overdue' ? ctx.dates.overdue : ctx.dates.dueSoon;
    const hw = await Homework.findOneAndUpdate(
      { teacherId: ctx.teacherId, title: demo.title },
      { $set: { type: 'exercise', description: demo.description, subjectId, classId: cls.id, schoolId: ctx.schoolId, dueDate, totalMarks: 10, status: 'assigned', isDeleted: false } },
      { upsert: true, returnDocument: 'after' },
    );
    const learners = await Student.find({ classId: cls.id, isDeleted: false }).select('_id').lean();
    for (const learner of learners) {
      await HomeworkSubmission.updateOne(
        { homeworkId: hw._id, studentId: learner._id },
        {
          $setOnInsert: { schoolId: ctx.schoolId, homeworkVersion: 1, submittedAt: new Date(), maxMarks: 10, gradingStatus: 'pending', isDeleted: false },
          $unset: { mark: '' },
        },
        { upsert: true },
      );
      pending += 1;
    }
  }
  return pending;
}

async function seedMessages(ctx: Ctx): Promise<number> {
  const teacher = await User.findById(ctx.teacherId).lean();
  if (!teacher) return 0;
  let unread = 0;
  for (const demo of THREADS) {
    const learnerUser = await User.findOne({ schoolId: ctx.schoolId, firstName: demo.learnerFirstName, role: 'student' }).lean();
    const learner = learnerUser ? await Student.findOne({ userId: learnerUser._id, isDeleted: false }).lean() : null;
    const parent = learner ? await Parent.findOne({ childrenIds: learner._id }).lean() : null;
    const parentUser = parent ? await User.findById(parent.userId).lean() : null;
    if (!learner || !parentUser) continue;
    const parentName = `${parentUser.firstName} ${parentUser.lastName}`;
    let thread = await MessageThread.findOne({ schoolId: ctx.schoolId, studentId: learner._id, 'participants.userId': ctx.teacherId });
    if (!thread) {
      thread = await MessageThread.create({
        schoolId: ctx.schoolId, studentId: learner._id,
        participants: [
          { userId: ctx.teacherId, role: 'teacher', name: `${teacher.firstName} ${teacher.lastName}` },
          { userId: parentUser._id, role: 'parent', name: parentName },
        ],
      });
    }
    if ((await Message.countDocuments({ threadId: thread._id })) === 0) {
      for (const content of demo.messages) {
        await Message.create({ threadId: thread._id, schoolId: ctx.schoolId, senderId: parentUser._id, senderRole: 'parent', senderName: parentName, content });
      }
    }
    const last = demo.messages[demo.messages.length - 1];
    await MessageThread.updateOne(
      { _id: thread._id },
      { $set: { lastMessageAt: new Date(), lastMessagePreview: last.slice(0, 100), [`unreadCount.${String(ctx.teacherId)}`]: demo.messages.length, isDeleted: false } },
    );
    unread += demo.messages.length;
  }
  return unread;
}

async function seedPapers(ctx: Ctx): Promise<number> {
  let count = 0;
  for (const demo of PAPERS) {
    const cls = ctx.classes.get(demo.className);
    const subjectId = ctx.subjects.get(demo.subject);
    const topicIds = ctx.topics.get(demo.subject)?.slice(0, 2) ?? [];
    if (!cls || !subjectId || topicIds.length === 0) continue;
    const sections = demo.sections.map((s, order) => ({
      title: s.title, instructions: s.instructions, order,
      questions: s.questions.map((q, position) => ({ questionText: q.text, marks: q.marks, position, modelAnswer: q.answer })),
    }));
    const totalMarks = demo.sections.flatMap((s) => s.questions).reduce((sum, q) => sum + q.marks, 0);
    await AssessmentPaper.updateOne(
      { createdBy: ctx.teacherId, title: demo.title, schoolId: ctx.schoolId },
      { $set: { subjectId, gradeId: cls.gradeId, topicIds, term: 3, year: ctx.dates.today.getFullYear(), paperType: 'class_test', duration: demo.duration, status: demo.status, sections, totalMarks, isDeleted: false } },
      { upsert: true },
    );
    count += 1;
  }
  return count;
}

async function main(): Promise<void> {
  await mongoose.connect(config.mongodb.uri);
  try {
    const ctx = await loadContext();
    await seedModulesAndTimetable(ctx);
    await seedRegister(ctx);
    const lessons = await seedLessons(ctx);
    const submissions = await seedHomework(ctx);
    const unread = await seedMessages(ctx);
    const papers = await seedPapers(ctx);
    logger.info(`Teacher demo ready for ${TEACHER_EMAIL}: ${ctx.week.length} timetable slots, ${lessons} lessons, ${submissions} submissions to mark, ${unread} unread messages, ${papers} papers.`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'Teacher demo seed failed');
  process.exit(1);
});
