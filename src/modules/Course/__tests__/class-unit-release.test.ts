import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../../jobs/course-generation.job.js', () => ({ enqueueCourseGeneration: vi.fn(async () => undefined) }));

import { enqueueCourseGeneration } from '../../../jobs/course-generation.job.js';
import { ClassUnitService } from '../service-class-unit.js';
import { CourseService } from '../service.js';
import { Course, CourseLesson, CourseModule, Enrolment } from '../model.js';
import { Class } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
import { ContentResource } from '../../ContentLibrary/model.js';
import type { CourseActor } from '../service.js';
import '../../Auth/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** A unit whose outline is approved and whose two items were written (or one failed). */
async function writtenUnit(opts: { failOne?: boolean; learners?: number } = {}) {
  const schoolId = oid();
  const teacherId = oid();
  const classId = oid();
  await Class.collection.insertOne({ _id: classId, schoolId, gradeId: oid(), teacherId, name: 'Grade 1 - A', classroomCode: `C${classId}`, isDeleted: false });
  const learners = opts.learners ?? 3;
  if (learners > 0) {
    await Student.collection.insertMany(Array.from({ length: learners }, (_, i) => ({
      schoolId, classId, admissionNumber: `A${i}-${classId}`, firstName: `L${i}`, lastName: 'Test', isDeleted: false,
    })));
  }
  const resource = await ContentResource.collection.insertOne({
    schoolId, title: 'Counting in tens', type: 'study_notes', format: 'static', status: 'draft', isDeleted: false,
    blocks: [{ type: 'text', order: 0, content: 'Ten, twenty, thirty.' }],
  });
  const course = await Course.create({
    schoolId, title: 'Mathematics · Grade 1 · Term 3', slug: `unit-${oid()}`, createdBy: teacherId, kind: 'class_unit', outlineStatus: 'approved',
    scope: { gradeId: oid(), subjectId: oid(), termNumber: 3, topicNodeIds: [oid()], classIds: [classId] },
    generation: { status: 'done', total: 2, done: opts.failOne ? 1 : 2, failed: opts.failOne ? 1 : 0 },
  });
  const mod = await CourseModule.create({ schoolId, courseId: course._id, title: 'Counting', orderIndex: 0, curriculumNodeId: oid() });
  const [notes] = await CourseLesson.insertMany([
    { schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 0, title: 'Counting in tens', type: 'content', itemKind: 'notes', genStatus: 'ready', contentResourceId: resource.insertedId },
    { schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 1, title: 'Counting on', type: 'content', itemKind: 'worked_example', genStatus: opts.failOne ? 'failed' : 'ready', genError: opts.failOne ? 'timeout' : '', contentResourceId: opts.failOne ? null : resource.insertedId },
  ]);
  const actor: CourseActor = { userId: String(teacherId), role: 'teacher' as CourseActor['role'], isHOD: false, isSchoolPrincipal: false };
  return { schoolId: String(schoolId), courseId: String(course._id), classId: String(classId), actor, notesId: String(notes._id) };
}

describe('ClassUnitService.release', () => {
  it("won't release a unit with an item that still needs attention", async () => {
    const f = await writtenUnit({ failOne: true });
    await expect(ClassUnitService.release(f.courseId, f.schoolId, f.actor, [f.classId])).rejects.toThrow('1 item still needs attention');
    expect((await Course.findById(f.courseId).lean())?.status).toBe('draft');
  });

  it('refuses a class with no learners before changing anything', async () => {
    const f = await writtenUnit({ learners: 0 });
    await expect(ClassUnitService.release(f.courseId, f.schoolId, f.actor, [f.classId])).rejects.toThrow('Grade 1 - A has no learners yet');
    expect((await Course.findById(f.courseId).lean())?.status).toBe('draft');
  });

  it('publishes the unit and enrols the class', async () => {
    const f = await writtenUnit();
    const result = await ClassUnitService.release(f.courseId, f.schoolId, f.actor, [f.classId]);
    expect(result.classes).toEqual([{ classId: f.classId, name: 'Grade 1 - A', newEnrolments: 3 }]);
    const unit = await Course.findById(f.courseId).lean();
    expect(unit).toMatchObject({ status: 'published' });
    expect(await Enrolment.countDocuments({ courseId: f.courseId, isDeleted: false })).toBe(3);
  });

  it("won't let another teacher release someone else's unit", async () => {
    const f = await writtenUnit();
    const stranger: CourseActor = { ...f.actor, userId: String(oid()) };
    await expect(ClassUnitService.release(f.courseId, f.schoolId, stranger, [f.classId])).rejects.toThrow('You can only edit your own courses');
  });

  it('refuses to release a unit whose items were all removed', async () => {
    const f = await writtenUnit();
    await CourseLesson.updateMany({ courseId: f.courseId }, { $set: { isDeleted: true } });
    await expect(ClassUnitService.release(f.courseId, f.schoolId, f.actor, [f.classId])).rejects.toThrow('This unit has no items left. Add some before releasing.');
    expect((await Course.findById(f.courseId).lean())?.status).toBe('draft');
  });

  it('records only the classes that actually enrolled, not the whole batch, when one fails mid-release', async () => {
    const f = await writtenUnit();
    const schoolId = new mongoose.Types.ObjectId(f.schoolId);
    const classB = oid();
    await Class.collection.insertOne({ _id: classB, schoolId, gradeId: oid(), teacherId: new mongoose.Types.ObjectId(f.actor.userId), name: 'Grade 1 - B', classroomCode: `C${classB}`, isDeleted: false });
    await Student.collection.insertOne({ schoolId, classId: classB, admissionNumber: `B0-${classB}`, firstName: 'L0', lastName: 'Test', isDeleted: false });

    let calls = 0;
    const spy = vi.spyOn(CourseService, 'assignCourseToClass').mockImplementation(async (crsId, sid, actor, data) => {
      calls += 1;
      if (calls === 2) throw new Error('enrolment failed');
      const soid = new mongoose.Types.ObjectId(sid);
      const classOid = new mongoose.Types.ObjectId(data.classId);
      const students = await Student.find({ classId: classOid, schoolId: soid, isDeleted: false }).select('_id').lean();
      await Enrolment.insertMany(students.map((s) => ({
        schoolId: soid, courseId: new mongoose.Types.ObjectId(crsId), studentId: s._id,
        enrolledBy: new mongoose.Types.ObjectId(actor.userId), classId: classOid, status: 'active',
      })));
      return { attempted: students.length, newEnrolments: students.length, alreadyEnroled: 0 };
    });

    await expect(ClassUnitService.release(f.courseId, f.schoolId, f.actor, [f.classId, String(classB)])).rejects.toThrow('enrolment failed');
    const unit = await Course.findById(f.courseId).lean();
    // The unit really was released to the class that succeeded — status reflects that truthfully,
    // and only the class that actually got enrolled is recorded as released (order of the two isn't guaranteed).
    expect(unit?.status).toBe('published');
    expect(unit?.scope?.classIds).toHaveLength(1);
    expect([f.classId, String(classB)]).toContain(String(unit?.scope?.classIds[0]));
    expect(await Enrolment.countDocuments({ courseId: f.courseId, isDeleted: false })).toBe(3);
    spy.mockRestore();
  });
});

describe('ClassUnitService.previewItem and retryItem', () => {
  it("shows the teacher an item's content", async () => {
    const f = await writtenUnit();
    const preview = await ClassUnitService.previewItem(f.courseId, f.notesId, f.schoolId, f.actor);
    expect(preview).toMatchObject({ kind: 'content', title: 'Counting in tens', blocks: [{ type: 'text', content: 'Ten, twenty, thirty.' }] });
  });

  it('re-queues only an item that failed', async () => {
    const f = await writtenUnit({ failOne: true });
    const failed = await CourseLesson.findOne({ courseId: f.courseId, genStatus: 'failed' }).lean();
    await ClassUnitService.retryItem(f.courseId, String(failed!._id), f.schoolId, f.actor);
    expect(enqueueCourseGeneration).toHaveBeenCalledWith({ courseId: f.courseId, schoolId: f.schoolId, lessonId: String(failed!._id) });
    await expect(ClassUnitService.retryItem(f.courseId, f.notesId, f.schoolId, f.actor)).rejects.toThrow("Only an item that couldn't be written can be tried again");
  });
});
