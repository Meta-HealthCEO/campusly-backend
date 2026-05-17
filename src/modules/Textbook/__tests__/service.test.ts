import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { UserRole } from '../../../common/enums.js';
import { Textbook } from '../model.js';
import { TextbookService } from '../service.js';
import type { TextbookActor } from '../service-access.js';
import { ContentResource } from '../../ContentLibrary/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { CurriculumFramework } from '../../TeacherWorkbench/model.js';
import { Grade, Subject } from '../../Academic/model.js';
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
    Textbook.deleteMany({}),
    ContentResource.deleteMany({}),
    CurriculumNode.deleteMany({}),
    CurriculumFramework.deleteMany({}),
    Grade.deleteMany({}),
    Subject.deleteMany({}),
  ]);
});

function actor(
  id: mongoose.Types.ObjectId,
  schoolId: mongoose.Types.ObjectId,
  role: UserRole = UserRole.TEACHER,
  flags: Partial<TextbookActor> = {},
): TextbookActor {
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

  return { framework, gradeNode, subjectNode, topicNode, grade, subject };
}

async function makeTextbook(
  ctx: Awaited<ReturnType<typeof seedAcademic>>,
  opts: {
    schoolId: mongoose.Types.ObjectId | null;
    createdBy: mongoose.Types.ObjectId;
    title: string;
    status?: 'draft' | 'published' | 'archived';
    chapters?: Array<{
      _id: mongoose.Types.ObjectId;
      title: string;
      description: string;
      curriculumNodeId: mongoose.Types.ObjectId;
      order: number;
      resources: Array<{ resourceId: mongoose.Types.ObjectId; order: number }>;
    }>;
  },
) {
  return Textbook.create({
    schoolId: opts.schoolId,
    createdBy: opts.createdBy,
    title: opts.title,
    description: '',
    frameworkId: ctx.framework._id,
    subjectId: ctx.subject._id,
    gradeId: ctx.grade._id,
    subjectNodeId: ctx.subjectNode._id,
    gradeNodeId: ctx.gradeNode._id,
    status: opts.status ?? 'draft',
    chapters: opts.chapters ?? [],
  });
}

async function makeApprovedResource(
  ctx: Awaited<ReturnType<typeof seedAcademic>>,
  schoolId: mongoose.Types.ObjectId,
  teacherId: mongoose.Types.ObjectId,
) {
  return ContentResource.create({
    schoolId,
    curriculumNodeId: ctx.topicNode._id,
    subjectId: ctx.subject._id,
    gradeId: ctx.grade._id,
    term: 1,
    type: 'reading',
    title: 'Algebra reading',
    source: 'teacher',
    status: 'approved',
    createdBy: teacherId,
    blocks: [],
  });
}

function ids(items: Array<{ _id: mongoose.Types.ObjectId }>): Set<string> {
  return new Set(items.map((item) => item._id.toString()));
}

describe('textbook visibility', () => {
  it('limits drafts and archived books to the right actors', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherA = new mongoose.Types.ObjectId();
    const teacherB = new mongoose.Types.ObjectId();
    const student = new mongoose.Types.ObjectId();
    const systemUser = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);

    const ownDraft = await makeTextbook(ctx, {
      schoolId,
      createdBy: teacherA,
      title: 'Own draft',
      status: 'draft',
    });
    const otherDraft = await makeTextbook(ctx, {
      schoolId,
      createdBy: teacherB,
      title: 'Other draft',
      status: 'draft',
    });
    const schoolPublished = await makeTextbook(ctx, {
      schoolId,
      createdBy: teacherB,
      title: 'School published',
      status: 'published',
    });
    await makeTextbook(ctx, {
      schoolId,
      createdBy: teacherB,
      title: 'Other archived',
      status: 'archived',
    });
    const nationalPublished = await makeTextbook(ctx, {
      schoolId: null,
      createdBy: systemUser,
      title: 'National published',
      status: 'published',
    });

    const studentResult = await TextbookService.listTextbooks(
      actor(student, schoolId, UserRole.STUDENT),
      {},
    );
    expect(ids(studentResult.textbooks)).toEqual(new Set([
      schoolPublished._id.toString(),
      nationalPublished._id.toString(),
    ]));
    await expect(TextbookService.getTextbook(
      ownDraft._id.toString(),
      actor(student, schoolId, UserRole.STUDENT),
    )).rejects.toMatchObject({ statusCode: 404 });

    const teacherResult = await TextbookService.listTextbooks(
      actor(teacherA, schoolId),
      {},
    );
    const teacherIds = ids(teacherResult.textbooks);
    expect(teacherIds.has(ownDraft._id.toString())).toBe(true);
    expect(teacherIds.has(schoolPublished._id.toString())).toBe(true);
    expect(teacherIds.has(nationalPublished._id.toString())).toBe(true);
    expect(teacherIds.has(otherDraft._id.toString())).toBe(false);
  });
});

describe('textbook ownership and creation', () => {
  it('prevents regular teachers from mutating another teacher textbook', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherA = new mongoose.Types.ObjectId();
    const teacherB = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);
    const otherDraft = await makeTextbook(ctx, {
      schoolId,
      createdBy: teacherB,
      title: 'Other draft',
      status: 'draft',
    });

    await expect(TextbookService.updateTextbook(
      otherDraft._id.toString(),
      actor(teacherA, schoolId),
      { title: 'Nope' },
    )).rejects.toMatchObject({ statusCode: 404 });

    const adminUpdated = await TextbookService.updateTextbook(
      otherDraft._id.toString(),
      actor(new mongoose.Types.ObjectId(), schoolId, UserRole.SCHOOL_ADMIN),
      { title: 'Admin update' },
    );
    expect(adminUpdated.title).toBe('Admin update');
  });

  it('denormalizes curriculum-node subject and grade refs when creating a textbook', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);

    const created = await TextbookService.createTextbook(
      actor(teacherId, schoolId),
      {
        title: 'Created textbook',
        description: '',
        frameworkId: ctx.framework._id.toString(),
        subjectId: ctx.subject._id.toString(),
        gradeId: ctx.grade._id.toString(),
        coverImageUrl: '',
      },
    );

    expect(created.subjectNodeId?.toString()).toBe(ctx.subjectNode._id.toString());
    expect(created.gradeNodeId?.toString()).toBe(ctx.gradeNode._id.toString());
  });
});

describe('textbook chapter and publish invariants', () => {
  it('rejects reorder payloads that repeat a chapter id', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);
    const chapterA = new mongoose.Types.ObjectId();
    const chapterB = new mongoose.Types.ObjectId();
    const textbook = await makeTextbook(ctx, {
      schoolId,
      createdBy: teacherId,
      title: 'Reorder me',
      chapters: [
        {
          _id: chapterA,
          title: 'A',
          description: '',
          curriculumNodeId: ctx.topicNode._id,
          order: 0,
          resources: [],
        },
        {
          _id: chapterB,
          title: 'B',
          description: '',
          curriculumNodeId: ctx.topicNode._id,
          order: 1,
          resources: [],
        },
      ],
    });

    await expect(TextbookService.reorderChapters(
      textbook._id.toString(),
      actor(teacherId, schoolId),
      [chapterA.toString(), chapterA.toString()],
    )).rejects.toMatchObject({ statusCode: 400 });
  });

  it('requires publishable content and prevents removing the last published resource', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacherId = new mongoose.Types.ObjectId();
    const ctx = await seedAcademic(schoolId);
    const textbook = await makeTextbook(ctx, {
      schoolId,
      createdBy: teacherId,
      title: 'Publish me',
      chapters: [{
        _id: new mongoose.Types.ObjectId(),
        title: 'Chapter',
        description: '',
        curriculumNodeId: ctx.topicNode._id,
        order: 0,
        resources: [],
      }],
    });
    const chapterId = textbook.chapters[0]._id.toString();

    await expect(TextbookService.publishTextbook(
      textbook._id.toString(),
      actor(teacherId, schoolId),
    )).rejects.toMatchObject({ statusCode: 400 });

    const resource = await makeApprovedResource(ctx, schoolId, teacherId);
    await TextbookService.addResourceToChapter(
      textbook._id.toString(),
      actor(teacherId, schoolId),
      chapterId,
      resource._id.toString(),
      0,
    );
    await TextbookService.publishTextbook(textbook._id.toString(), actor(teacherId, schoolId));

    await expect(TextbookService.removeResourceFromChapter(
      textbook._id.toString(),
      actor(teacherId, schoolId),
      chapterId,
      resource._id.toString(),
    )).rejects.toMatchObject({ statusCode: 400 });
  });
});
