import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../../jobs/course-generation.job.js', () => ({ enqueueCourseGeneration: vi.fn(async () => undefined) }));
vi.mock('../../QuestionBank/service-questions-generation.js', () => ({ generateAIQuestions: vi.fn() }));

import { generateAIQuestions } from '../../QuestionBank/service-questions-generation.js';
import { AIService } from '../../../services/ai.service.js';
import { GenerationService } from '../../ContentLibrary/service-generation.js';
import { ClassUnitService } from '../service-class-unit.js';
import { runCourseGeneration } from '../service-course-generation.js';
import { CourseService, type CourseActor } from '../service.js';
import { Course, CourseLesson, CourseModule } from '../model.js';
import { Class, Grade, Subject } from '../../Academic/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { ContentResource } from '../../ContentLibrary/model.js';
import { Question } from '../../QuestionBank/model.js';
import { checkUsageLimit } from '../../../middleware/usageLimits.js';
import '../../Auth/model.js';

const oid = () => new mongoose.Types.ObjectId();
const OUTLINE = { modules: [{ title: 'Counting', topicIndex: 1, items: [{ kind: 'notes', title: 'Tens', minutes: 6 }, { kind: 'quick_check', title: 'Check', minutes: 5 }] }] };

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
  vi.mocked(generateAIQuestions).mockReset();
});

async function teacherWithClass() {
  const schoolId = oid();
  const teacherId = oid();
  const gradeId = oid();
  const subjectId = oid();
  const classId = oid();
  const topicId = oid();
  await Grade.collection.insertOne({ _id: gradeId, schoolId, name: 'Grade 1', level: 1, isDeleted: false });
  await Subject.collection.insertOne({ _id: subjectId, schoolId, name: 'Mathematics', gradeIds: [gradeId], isDeleted: false });
  await Class.collection.insertOne({ _id: classId, schoolId, gradeId, teacherId, name: 'Grade 1 - A', classroomCode: `C${classId}`, isDeleted: false });
  await CurriculumNode.collection.insertOne({ _id: topicId, type: 'topic', title: 'Numbers', code: `T-${topicId}`, schoolId: null, isDeleted: false, metadata: { capsReference: 'NOR', weekNumbers: [1] } });
  const actor: CourseActor = { userId: String(teacherId), role: 'teacher' as CourseActor['role'], isHOD: false, isSchoolPrincipal: false };
  const input = { classId: String(classId), subjectId: String(subjectId), termNumber: 3, topicNodeIds: [String(topicId)] };
  return { schoolId: String(schoolId), soid: schoolId, actor, input };
}

async function approvedUnit() {
  const f = await teacherWithClass();
  const unit = await ClassUnitService.create(f.schoolId, f.actor, f.input);
  vi.spyOn(AIService, 'generateJSON').mockResolvedValue(OUTLINE);
  await ClassUnitService.draftOutline(String(unit._id), f.schoolId, f.actor, false);
  await ClassUnitService.approveOutline(String(unit._id), f.schoolId, f.actor);
  return { ...f, courseId: String(unit._id) };
}

describe('I4: a free teacher can redraft a unit they already have', () => {
  it('does not count the unit being redrafted against the free allowance', async () => {
    const f = await teacherWithClass();
    const first = await ClassUnitService.create(f.schoolId, f.actor, f.input);
    vi.spyOn(AIService, 'generateJSON').mockResolvedValue(OUTLINE);
    await ClassUnitService.draftOutline(String(first._id), f.schoolId, f.actor, true);
    await Course.collection.insertOne({ schoolId: f.soid, slug: `other-${oid()}`, title: 'Second', aiGenerated: true, isDeleted: false });
    const redrafted = await ClassUnitService.draftOutline(String(first._id), f.schoolId, f.actor, true);
    expect(redrafted.outlineStatus).toBe('drafted');
  });
});

describe('I3: writing a unit does not use up the school daily AI allowance', () => {
  it('tags unit resources and leaves them out of the daily count', async () => {
    const f = await approvedUnit();
    const content = vi.spyOn(GenerationService, 'generateContent').mockImplementation(async () => ({ _id: oid() }) as never);
    vi.mocked(generateAIQuestions).mockImplementation(async () => []);
    await runCourseGeneration(f.courseId, f.schoolId);
    expect(content.mock.calls[0][3]).toEqual({ skipUsageLimit: true, tags: ['class_unit'] });

    await ContentResource.collection.insertMany([
      { schoolId: f.soid, source: 'ai_generated', tags: ['class_unit'], isDeleted: false, createdAt: new Date() },
      { schoolId: f.soid, source: 'ai_generated', tags: [], isDeleted: false, createdAt: new Date() },
    ]);
    expect((await checkUsageLimit(f.schoolId, 'maxAiGenerationsPerDay')).current).toBe(1);
  });
});

describe('I1: a unit can never be stuck writing', () => {
  it('picks up an item left "writing" by a restart, and lets the teacher retry it', async () => {
    const f = await approvedUnit();
    const stale = new Date(Date.now() - 11 * 60 * 1000);
    const [notes] = await CourseLesson.find({ courseId: f.courseId, itemKind: 'notes' }).lean();
    await CourseLesson.collection.updateOne({ _id: notes._id }, { $set: { genStatus: 'generating', updatedAt: stale } });
    await ClassUnitService.retryItem(f.courseId, String(notes._id), f.schoolId, f.actor);
    expect((await CourseLesson.findById(notes._id).lean())?.genStatus).toBe('pending');

    await CourseLesson.collection.updateOne({ _id: notes._id }, { $set: { genStatus: 'generating', updatedAt: stale } });
    vi.spyOn(GenerationService, 'generateContent').mockImplementation(async () => ({ _id: oid() }) as never);
    vi.mocked(generateAIQuestions).mockImplementation(async () => []);
    await runCourseGeneration(f.courseId, f.schoolId);
    expect((await CourseLesson.findById(notes._id).lean())?.genStatus).toBe('ready');
  });

  it('leaves an item that is being written right now alone', async () => {
    const f = await approvedUnit();
    const [notes] = await CourseLesson.find({ courseId: f.courseId, itemKind: 'notes' }).lean();
    await CourseLesson.collection.updateOne({ _id: notes._id }, { $set: { genStatus: 'generating', updatedAt: new Date() } });
    await expect(ClassUnitService.retryItem(f.courseId, String(notes._id), f.schoolId, f.actor))
      .rejects.toThrow("Only an item that couldn't be written can be tried again");
  });
});

describe('Quick checks are always answerable', () => {
  it('fails the item when the AI returns a question without answer choices', async () => {
    const f = await approvedUnit();
    vi.spyOn(GenerationService, 'generateContent').mockImplementation(async () => ({ _id: oid() }) as never);
    const bad = await Question.collection.insertOne({ schoolId: f.soid, type: 'true_false', stem: 'Is 10 even?', options: [], isDeleted: false });
    vi.mocked(generateAIQuestions).mockImplementation(async () => [bad.insertedId]);
    await runCourseGeneration(f.courseId, f.schoolId);
    const check = await CourseLesson.findOne({ courseId: f.courseId, itemKind: 'quick_check' }).lean();
    expect(check).toMatchObject({ genStatus: 'failed', genError: "The quick check came back without answer choices. Try again." });
    expect((await Question.findById(bad.insertedId).lean())?.isDeleted).toBe(true);
  });
});

describe('I2: a class unit is only released from its unit page', () => {
  it('refuses the catalogue review and assign routes for class units', async () => {
    const f = await approvedUnit();
    await expect(CourseService.submitForReview(f.courseId, f.schoolId, f.actor)).rejects.toThrow('Release this unit from its unit page');
    await Course.updateOne({ _id: f.courseId }, { $set: { status: 'published' } });
    const [klass] = await Class.find({ schoolId: f.soid }).lean();
    await expect(CourseService.assignCourseToClass(f.courseId, f.schoolId, f.actor, { classId: String(klass._id) }))
      .rejects.toThrow('Release this unit from its unit page');
    const admin: CourseActor = { ...f.actor, role: 'school_admin' as CourseActor['role'] };
    await Course.updateOne({ _id: f.courseId }, { $set: { status: 'in_review' } });
    await expect(CourseService.publishCourse(f.courseId, f.schoolId, admin)).rejects.toThrow('Release this unit from its unit page');
    // The module stays intact for the real release.
    expect(await CourseModule.countDocuments({ courseId: f.courseId, isDeleted: false })).toBe(1);
  });
});
