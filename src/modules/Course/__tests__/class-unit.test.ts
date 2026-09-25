import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../../jobs/course-generation.job.js', () => ({ enqueueCourseGeneration: vi.fn(async () => undefined) }));

import { enqueueCourseGeneration } from '../../../jobs/course-generation.job.js';
import { AIService } from '../../../services/ai.service.js';
import { ClassUnitService } from '../service-class-unit.js';
import { Course, CourseLesson, CourseModule } from '../model.js';
import { Class, Grade, Subject } from '../../Academic/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import type { CourseActor } from '../service.js';
// Side-effect import: getCourse populates createdBy.
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

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(enqueueCourseGeneration).mockClear();
});

const AI_OUTLINE = {
  modules: [
    { title: 'Counting to 99', topicIndex: 1, objectives: ['I can count to 99'], items: [
      { kind: 'notes', title: 'Counting in tens', minutes: 8, brief: 'Count in tens to 90' },
      { kind: 'worked_example', title: 'Counting on from 47', minutes: 6, brief: 'Count on in ones' },
      { kind: 'quick_check', title: 'Check: counting', minutes: 5, brief: 'Four questions' },
    ] },
    { title: 'Number patterns', topicIndex: 2, items: [
      { kind: 'notes', title: 'What a pattern is', minutes: 7 },
      { kind: 'quick_check', title: 'Check: patterns', minutes: 5 },
    ] },
  ],
};

async function fixture() {
  const schoolId = oid();
  const teacherId = oid();
  const gradeId = oid();
  const subjectId = oid();
  const classId = oid();
  const topicIds = [oid(), oid()];
  await Grade.collection.insertOne({ _id: gradeId, schoolId, name: 'Grade 1', level: 1, isDeleted: false });
  await Subject.collection.insertOne({ _id: subjectId, schoolId, name: 'Mathematics', gradeIds: [gradeId], isDeleted: false });
  await Class.collection.insertOne({ _id: classId, schoolId, gradeId, teacherId, name: 'Grade 1 - A', classroomCode: `C${classId}`, isDeleted: false });
  await CurriculumNode.collection.insertMany([
    { _id: topicIds[0], type: 'topic', title: 'Numbers, Operations and Relationships', description: 'Count to 99', schoolId: null, isDeleted: false, code: `T-${topicIds[0]}`, metadata: { capsReference: 'NOR', weekNumbers: [1, 2] } },
    { _id: topicIds[1], type: 'topic', title: 'Patterns, Functions and Algebra', description: 'Number patterns', schoolId: null, isDeleted: false, code: `T-${topicIds[1]}`, metadata: { capsReference: 'PFA', weekNumbers: [3] } },
  ]);
  const actor: CourseActor = { userId: String(teacherId), role: 'teacher' as CourseActor['role'], isHOD: false, isSchoolPrincipal: false };
  const input = { classId: String(classId), subjectId: String(subjectId), termNumber: 3, topicNodeIds: topicIds.map(String) };
  return { schoolId: String(schoolId), actor, input, classId, topicIds };
}

describe('ClassUnitService.create', () => {
  it('makes a class unit scoped to the class grade, with a plain default title', async () => {
    const f = await fixture();
    const unit = await ClassUnitService.create(f.schoolId, f.actor, f.input);
    expect(unit).toMatchObject({ kind: 'class_unit', title: 'Mathematics · Grade 1 · Term 3', status: 'draft', outlineStatus: 'none' });
    // Not released to any class yet — only /release does that.
    expect(unit.scope?.classIds).toEqual([]);
    expect(String(unit.scope?.builtForClassId)).toBe(String(f.classId));
    expect(unit.scope?.termNumber).toBe(3);
  });

  it("refuses a class that isn't the teacher's", async () => {
    const f = await fixture();
    const other = oid();
    await Class.collection.insertOne({ _id: other, schoolId: new mongoose.Types.ObjectId(f.schoolId), gradeId: oid(), teacherId: oid(), name: 'Grade 2 - B', classroomCode: `C${other}`, isDeleted: false });
    await expect(ClassUnitService.create(f.schoolId, f.actor, { ...f.input, classId: String(other) }))
      .rejects.toThrow('You can only build units for classes you teach');
  });

});

describe('ClassUnitService.draftOutline', () => {
  it('writes modules and items from the AI outline, replacing an earlier draft', async () => {
    const f = await fixture();
    const unit = await ClassUnitService.create(f.schoolId, f.actor, f.input);
    const ai = vi.spyOn(AIService, 'generateJSON').mockResolvedValue(AI_OUTLINE);
    await ClassUnitService.draftOutline(String(unit._id), f.schoolId, f.actor);
    const second = await ClassUnitService.draftOutline(String(unit._id), f.schoolId, f.actor);

    expect(ai).toHaveBeenCalledTimes(2);
    expect(ai.mock.calls[0][1]).toContain('1. Numbers, Operations and Relationships');
    expect(second.outlineStatus).toBe('drafted');
    expect(second.aiGenerated).toBe(true);
    expect(second.modules.map((m) => m.title)).toEqual(['Counting to 99', 'Number patterns']);
    expect(second.modules[0].lessons.map((l) => [l.itemKind, l.type, l.minutes, l.capsRef])).toEqual([
      ['notes', 'content', 8, 'NOR'], ['worked_example', 'content', 6, 'NOR'], ['quick_check', 'quiz', 5, 'NOR'],
    ]);
    expect(second.modules[0].lessons[2].passMarkPercent).toBe(50);
    const live = await CourseModule.countDocuments({ courseId: unit._id, isDeleted: false });
    const gone = await CourseModule.countDocuments({ courseId: unit._id, isDeleted: true });
    expect([live, gone]).toEqual([2, 2]);
  });

  it('leaves the unit as it was when the AI fails', async () => {
    const f = await fixture();
    const unit = await ClassUnitService.create(f.schoolId, f.actor, f.input);
    vi.spyOn(AIService, 'generateJSON').mockRejectedValue(new Error('AI down'));
    await expect(ClassUnitService.draftOutline(String(unit._id), f.schoolId, f.actor)).rejects.toThrow('AI down');
    expect(await CourseModule.countDocuments({ courseId: unit._id })).toBe(0);
    expect((await Course.findById(unit._id).lean())?.outlineStatus).toBe('none');
  });

  it("won't let another teacher draft someone else's unit", async () => {
    const f = await fixture();
    const unit = await ClassUnitService.create(f.schoolId, f.actor, f.input);
    const stranger: CourseActor = { ...f.actor, userId: String(oid()) };
    await expect(ClassUnitService.draftOutline(String(unit._id), f.schoolId, stranger)).rejects.toThrow('You can only edit your own courses');
  });
});

describe('ClassUnitService.approveOutline', () => {
  it('marks every item to be written, queues the writing, and then refuses a redraft', async () => {
    const f = await fixture();
    const unit = await ClassUnitService.create(f.schoolId, f.actor, f.input);
    vi.spyOn(AIService, 'generateJSON').mockResolvedValue(AI_OUTLINE);
    await ClassUnitService.draftOutline(String(unit._id), f.schoolId, f.actor);
    const approved = await ClassUnitService.approveOutline(String(unit._id), f.schoolId, f.actor);

    expect(approved.outlineStatus).toBe('approved');
    expect(approved.generation).toMatchObject({ status: 'queued', total: 5, done: 0, failed: 0 });
    const statuses = await CourseLesson.distinct('genStatus', { courseId: unit._id, isDeleted: false });
    expect(statuses).toEqual(['pending']);
    expect(enqueueCourseGeneration).toHaveBeenCalledWith({ courseId: String(unit._id), schoolId: f.schoolId });
    await expect(ClassUnitService.draftOutline(String(unit._id), f.schoolId, f.actor))
      .rejects.toThrow('This outline is approved. Its items are being written.');
  });

  it('needs a drafted outline first', async () => {
    const f = await fixture();
    const unit = await ClassUnitService.create(f.schoolId, f.actor, f.input);
    await expect(ClassUnitService.approveOutline(String(unit._id), f.schoolId, f.actor)).rejects.toThrow('Draft the outline first');
  });
});
