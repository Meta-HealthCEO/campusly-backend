import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../QuestionBank/service-questions-generation.js', () => ({ generateAIQuestions: vi.fn() }));

import { generateAIQuestions } from '../../QuestionBank/service-questions-generation.js';
import { GenerationService } from '../../ContentLibrary/service-generation.js';
import { friendlyGenerationError, resetItemForRetry, runCourseGeneration } from '../service-course-generation.js';
import { Course, CourseLesson, CourseModule } from '../model.js';
import { Grade } from '../../Academic/model.js';
import { Question } from '../../QuestionBank/model.js';

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
  vi.mocked(generateAIQuestions).mockReset();
  // Real multiple-choice questions: quick checks are only kept when every question is answerable.
  vi.mocked(generateAIQuestions).mockImplementation(async (input) => {
    const docs = [1, 2, 3, 4].map((n) => ({
      _id: oid(), schoolId: new mongoose.Types.ObjectId(input.schoolId), type: 'mcq', stem: `Q${n}`, isDeleted: false,
      options: [{ label: 'A', text: 'right', isCorrect: true }, { label: 'B', text: 'wrong', isCorrect: false }],
    }));
    await Question.collection.insertMany(docs);
    return docs.map((d) => d._id);
  });
});

/** An approved unit: 2 modules, 5 items waiting to be written. */
async function approvedUnit(opts: { editedTitle?: string } = {}) {
  const schoolId = oid();
  const gradeId = oid();
  await Grade.collection.insertOne({ _id: gradeId, schoolId, name: 'Grade 1', level: 1, isDeleted: false });
  const course = await Course.create({
    schoolId, title: 'Mathematics · Grade 1 · Term 3', slug: `unit-${oid()}`, createdBy: oid(), kind: 'class_unit', outlineStatus: 'approved',
    scope: { gradeId, subjectId: oid(), termNumber: 3, topicNodeIds: [oid()], classIds: [oid()] },
    generation: { status: 'queued', total: 5, done: 0, failed: 0, message: '' },
  });
  const items = [
    [['notes', 'Counting in tens'], ['worked_example', 'Counting on from 47'], ['quick_check', 'Check: counting']],
    [['notes', 'What a pattern is'], ['quick_check', 'Check: patterns']],
  ] as const;
  for (const [mi, moduleItems] of items.entries()) {
    const mod = await CourseModule.create({ schoolId, courseId: course._id, title: `Module ${mi + 1}`, orderIndex: mi, curriculumNodeId: oid() });
    await CourseLesson.insertMany(moduleItems.map(([kind, title], i) => ({
      schoolId, courseId: course._id, moduleId: mod._id, orderIndex: i, title, type: kind === 'quick_check' ? 'quiz' : 'content',
      itemKind: kind, minutes: 6, brief: `Teach ${title}`, genStatus: 'pending', teacherEdited: title === opts.editedTitle,
    })));
  }
  return { courseId: String(course._id), schoolId: String(schoolId) };
}

const resource = () => ({ _id: oid() }) as unknown as Awaited<ReturnType<typeof GenerationService.generateContent>>;

describe('runCourseGeneration', () => {
  it('writes every pending item and reports the unit done', async () => {
    const f = await approvedUnit();
    const content = vi.spyOn(GenerationService, 'generateContent').mockImplementation(async () => resource());
    await runCourseGeneration(f.courseId, f.schoolId);

    const unit = await Course.findById(f.courseId).lean();
    expect(unit?.generation).toMatchObject({ status: 'done', total: 5, done: 5, failed: 0, message: 'All 5 items are ready.' });
    const items = await CourseLesson.find({ courseId: f.courseId }).sort({ moduleId: 1, orderIndex: 1 }).lean();
    expect(items.every((i) => i.genStatus === 'ready')).toBe(true);
    expect(items.filter((i) => i.itemKind !== 'quick_check').every((i) => i.contentResourceId)).toBe(true);
    expect(items.filter((i) => i.itemKind === 'quick_check').every((i) => i.quizQuestionIds.length === 4)).toBe(true);
    expect(content).toHaveBeenCalledTimes(3);
    expect(content.mock.calls[0][3]).toEqual({ skipUsageLimit: true, tags: ['class_unit', 'class_unit_initial'] });
    expect(content.mock.calls.map((c) => c[2].type).sort()).toEqual(['study_notes', 'study_notes', 'worked_example']);
    expect(vi.mocked(generateAIQuestions).mock.calls[0][0]).toMatchObject({ count: 4, questionTypes: ['mcq'] });
  });

  it('finishes the rest when one item fails, and says which', async () => {
    const f = await approvedUnit();
    vi.spyOn(GenerationService, 'generateContent').mockImplementation(async (_s, _u, data) => {
      if (data.type === 'worked_example') throw new Error("AI isn't set up on this server yet.");
      return resource();
    });
    await runCourseGeneration(f.courseId, f.schoolId);

    const unit = await Course.findById(f.courseId).lean();
    expect(unit?.generation).toMatchObject({ status: 'done', done: 4, failed: 1, message: "4 of 5 ready; 1 couldn't be written." });
    const failed = await CourseLesson.findOne({ courseId: f.courseId, genStatus: 'failed' }).lean();
    expect(failed).toMatchObject({ title: 'Counting on from 47', genError: "AI isn't set up on this server yet." });
  });

  it("never writes over an item the teacher has edited", async () => {
    const f = await approvedUnit({ editedTitle: 'What a pattern is' });
    const content = vi.spyOn(GenerationService, 'generateContent').mockImplementation(async () => resource());
    await runCourseGeneration(f.courseId, f.schoolId);
    expect(content).toHaveBeenCalledTimes(2);
    const edited = await CourseLesson.findOne({ courseId: f.courseId, title: 'What a pattern is' }).lean();
    expect(edited).toMatchObject({ genStatus: 'ready', contentResourceId: null });
  });

  it('retries one failed item only, and puts the counts right', async () => {
    const f = await approvedUnit();
    const content = vi.spyOn(GenerationService, 'generateContent').mockRejectedValueOnce(new Error('timeout')).mockImplementation(async () => resource());
    await runCourseGeneration(f.courseId, f.schoolId);
    const failed = await CourseLesson.findOne({ courseId: f.courseId, genStatus: 'failed' }).lean();
    expect(failed).not.toBeNull();

    content.mockClear();
    await resetItemForRetry(f.courseId, f.schoolId, String(failed!._id));
    expect((await Course.findById(f.courseId).lean())?.generation.status).toBe('queued');
    await runCourseGeneration(f.courseId, f.schoolId, String(failed!._id));

    expect(content).toHaveBeenCalledTimes(1);
    const unit = await Course.findById(f.courseId).lean();
    expect(unit?.generation).toMatchObject({ status: 'done', done: 5, failed: 0, message: 'All 5 items are ready.' });
  });

  it("stores a plain sentence instead of a raw zod dump, but keeps a friendly message as it was", async () => {
    const f = await approvedUnit();
    vi.spyOn(GenerationService, 'generateContent').mockImplementation(async (_s, _u, data) => {
      if (data.type === 'worked_example') {
        const zodLike = new Error(JSON.stringify([{ code: 'invalid_type', path: ['title'], message: 'Required' }], null, 2));
        zodLike.name = 'ZodError';
        throw zodLike;
      }
      return resource();
    });
    await runCourseGeneration(f.courseId, f.schoolId);
    const failed = await CourseLesson.findOne({ courseId: f.courseId, genStatus: 'failed' }).lean();
    expect(failed?.genError).toBe("This item couldn't be written right now. Try again.");
  });

  it("never overwrites an item the teacher saved while the background write was still in flight", async () => {
    const f = await approvedUnit();
    const [notes] = await CourseLesson.find({ courseId: f.courseId, itemKind: 'notes' }).sort({ orderIndex: 1 }).lean();
    const teachersOwnResourceId = oid();
    vi.spyOn(GenerationService, 'generateContent').mockImplementation(async (_s, _u, data) => {
      if (data.instructions.includes(notes.title)) {
        // The teacher's own save lands while this background write is still running.
        await CourseLesson.updateOne({ _id: notes._id }, { $set: { teacherEdited: true, contentResourceId: teachersOwnResourceId, genStatus: 'ready' } });
      }
      return resource();
    });
    await runCourseGeneration(f.courseId, f.schoolId);
    const saved = await CourseLesson.findById(notes._id).lean();
    expect(saved).toMatchObject({ teacherEdited: true, contentResourceId: teachersOwnResourceId, genStatus: 'ready' });
  });

  it('stops spending AI on items claimed after the unit was deleted mid-run', async () => {
    const f = await approvedUnit();
    // The unit is deleted partway through the run (simulated by the first
    // write itself soft-deleting it) — items claimed afterwards (once a lane
    // frees up, since only 3 run at a time for these 5 items) must not spend
    // AI writing for a unit that's gone.
    let first = true;
    const content = vi.spyOn(GenerationService, 'generateContent').mockImplementation(async () => {
      if (first) { first = false; await Course.updateOne({ _id: f.courseId }, { $set: { isDeleted: true } }); }
      return resource();
    });
    await runCourseGeneration(f.courseId, f.schoolId);
    const totalCalls = content.mock.calls.length + vi.mocked(generateAIQuestions).mock.calls.length;
    expect(totalCalls).toBeLessThan(5);
  });
});

describe('friendlyGenerationError', () => {
  it('keeps a plain, human-written message unchanged', () => {
    expect(friendlyGenerationError(new Error('This item has no CAPS topic to write from'))).toBe('This item has no CAPS topic to write from');
  });
  it('replaces a raw JSON dump (e.g. a ZodError) with a plain sentence', () => {
    expect(friendlyGenerationError(new Error('[{"code":"invalid_type","path":["title"]}]'))).toBe("This item couldn't be written right now. Try again.");
  });
  it('replaces a non-Error rejection with a plain sentence', () => {
    expect(friendlyGenerationError('boom')).toBe("This item couldn't be written right now. Try again.");
  });
});
