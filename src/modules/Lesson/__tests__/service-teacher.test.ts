import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { UserRole } from '../../../common/enums.js';
import { Lesson } from '../model.js';
import { LessonService } from '../service.js';
import { LessonAssignmentService } from '../service-assignments.js';
import { addMaterial, deleteMaterial, regenerateMaterial } from '../service-materials.js';
import type { LessonActor } from '../service-access.js';
import { Class, Timetable } from '../../Academic/model.js';
import { Homework } from '../../Homework/model.js';

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
    Lesson.deleteMany({}),
    Class.deleteMany({}),
    Timetable.deleteMany({}),
    Homework.deleteMany({}),
  ]);
});

function actor(id: mongoose.Types.ObjectId, schoolId: mongoose.Types.ObjectId): LessonActor {
  return {
    id: id.toString(),
    schoolId: schoolId.toString(),
    email: `${id.toString()}@example.test`,
    role: UserRole.TEACHER,
  };
}

async function makeLesson(opts: {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  title?: string;
  assignedClassId?: mongoose.Types.ObjectId;
}) {
  return Lesson.create({
    schoolId: opts.schoolId,
    teacherId: opts.teacherId,
    curriculumNodeId: new mongoose.Types.ObjectId(),
    subjectId: new mongoose.Types.ObjectId(),
    gradeId: new mongoose.Types.ObjectId(),
    title: opts.title ?? 'Lesson',
    durationMinutes: 45,
    publishedAt: null,
    assignedClasses: opts.assignedClassId
      ? [{ classId: opts.assignedClassId, scheduledDate: new Date(), status: 'planned' }]
      : [],
  });
}

async function makeClass(opts: {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  name?: string;
}) {
  return Class.create({
    schoolId: opts.schoolId,
    teacherId: opts.teacherId,
    gradeId: new mongoose.Types.ObjectId(),
    name: opts.name ?? 'Grade 7A',
    capacity: 35,
    classroomCode: new mongoose.Types.ObjectId().toString().slice(-8).toUpperCase(),
    isHomeroom: true,
  });
}

async function makeHomework(opts: {
  schoolId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  title?: string;
}) {
  return Homework.create({
    schoolId: opts.schoolId,
    teacherId: opts.teacherId,
    classId: opts.classId,
    subjectId: new mongoose.Types.ObjectId(),
    title: opts.title ?? 'Homework',
    type: 'exercise',
    dueDate: new Date(Date.now() + 86_400_000),
    totalMarks: 10,
    exerciseQuestionIds: [],
    status: 'assigned',
    attachments: [],
    latePolicy: 'block',
    gradebookAutoPublish: true,
  });
}

describe('teacher lesson access', () => {
  it('scopes list, read, and update operations to the owning teacher', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherA = new mongoose.Types.ObjectId();
    const teacherB = new mongoose.Types.ObjectId();
    const mine = await makeLesson({ schoolId, teacherId: teacherA, title: 'Mine' });
    const theirs = await makeLesson({ schoolId, teacherId: teacherB, title: 'Theirs' });
    const teacherActor = actor(teacherA, schoolId);

    const listed = await LessonService.list(teacherActor, { page: 1, limit: 20 });
    expect(listed.items.map((l) => l._id.toString())).toEqual([mine._id.toString()]);

    await expect(LessonService.getById(theirs._id.toString(), teacherActor))
      .rejects.toMatchObject({ statusCode: 404 });
    await expect(LessonService.update(theirs._id.toString(), teacherActor, { title: 'Nope' }))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('only lets a teacher assign lessons to classes they teach', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherA = new mongoose.Types.ObjectId();
    const teacherB = new mongoose.Types.ObjectId();
    const ownedClass = await makeClass({ schoolId, teacherId: teacherA, name: 'Owned' });
    const otherClass = await makeClass({ schoolId, teacherId: teacherB, name: 'Other' });
    const lesson = await makeLesson({ schoolId, teacherId: teacherA });
    const teacherActor = actor(teacherA, schoolId);

    await expect(LessonAssignmentService.assignClass(
      lesson._id.toString(),
      teacherActor,
      { classId: otherClass._id.toString(), scheduledDate: new Date().toISOString() },
    )).rejects.toMatchObject({ statusCode: 403 });

    const assigned = await LessonAssignmentService.assignClass(
      lesson._id.toString(),
      teacherActor,
      { classId: ownedClass._id.toString(), scheduledDate: new Date().toISOString() },
    );
    expect(assigned.assignedClasses).toHaveLength(1);
    expect(assigned.assignedClasses[0].classId.toString()).toBe(ownedClass._id.toString());
  });
});

describe('lesson material safety', () => {
  it('blocks linking another teacher-owned homework', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherA = new mongoose.Types.ObjectId();
    const teacherB = new mongoose.Types.ObjectId();
    const cls = await makeClass({ schoolId, teacherId: teacherA });
    const lesson = await makeLesson({ schoolId, teacherId: teacherA, assignedClassId: cls._id });
    const otherHomework = await makeHomework({ schoolId, teacherId: teacherB, classId: cls._id });

    await expect(addMaterial(lesson._id.toString(), actor(teacherA, schoolId), {
      kind: 'homework',
      phase: 'homework',
      title: 'Linked homework',
      existingHomeworkId: otherHomework._id.toString(),
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  it('removing a linked homework material does not soft-delete the homework', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const cls = await makeClass({ schoolId, teacherId });
    const homework = await makeHomework({ schoolId, teacherId, classId: cls._id });
    const lesson = await makeLesson({ schoolId, teacherId, assignedClassId: cls._id });
    const materialId = new mongoose.Types.ObjectId();
    lesson.materials.push({
      _id: materialId,
      kind: 'homework',
      title: 'Linked homework',
      homeworkId: homework._id,
    } as never);
    lesson.phases[4].materialIds.push(materialId);
    await lesson.save();

    await deleteMaterial(lesson._id.toString(), materialId.toString(), actor(teacherId, schoolId));

    const [freshLesson, freshHomework] = await Promise.all([
      Lesson.findById(lesson._id).lean(),
      Homework.findById(homework._id).lean(),
    ]);
    expect(freshLesson?.materials).toHaveLength(0);
    expect(freshHomework?.isDeleted).toBe(false);
  });

  it('failed regeneration leaves the original material in place', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherA = new mongoose.Types.ObjectId();
    const teacherB = new mongoose.Types.ObjectId();
    const cls = await makeClass({ schoolId, teacherId: teacherA });
    const ownHomework = await makeHomework({ schoolId, teacherId: teacherA, classId: cls._id, title: 'Own' });
    const otherHomework = await makeHomework({ schoolId, teacherId: teacherB, classId: cls._id, title: 'Other' });
    const lesson = await makeLesson({ schoolId, teacherId: teacherA, assignedClassId: cls._id });
    const materialId = new mongoose.Types.ObjectId();
    lesson.materials.push({
      _id: materialId,
      kind: 'homework',
      title: 'Original',
      homeworkId: ownHomework._id,
    } as never);
    lesson.phases[4].materialIds.push(materialId);
    await lesson.save();

    await expect(regenerateMaterial(
      lesson._id.toString(),
      materialId.toString(),
      actor(teacherA, schoolId),
      {
        kind: 'homework',
        phase: 'homework',
        title: 'Bad replacement',
        existingHomeworkId: otherHomework._id.toString(),
      },
    )).rejects.toMatchObject({ statusCode: 400 });

    const freshLesson = await Lesson.findById(lesson._id).lean();
    expect(freshLesson?.materials).toHaveLength(1);
    expect(freshLesson?.materials[0]._id.toString()).toBe(materialId.toString());
    expect(freshLesson?.phases[4].materialIds.map(String)).toContain(materialId.toString());
  });
});
