import mongoose from 'mongoose';
import { LessonPlan, ILessonPlan } from './model.js';
import { Class, Subject, Timetable } from '../Academic/model.js';
import { CurriculumNode, ICurriculumNode } from '../CurriculumStructure/model.js';
import { Homework, IHomework } from '../Homework/model.js';
import { School } from '../School/model.js';
import { User } from '../Auth/model.js';
import type { CreateHomeworkInput } from '../Homework/validation.js';
import { GenerationService } from '../ContentLibrary/service-generation.js';
import type { GenerateLessonMaterialInput } from './validation.js';
import { generateLessonPlanPdf } from './pdf-generator.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { escapeRegex } from '../../common/utils.js';

const ADMIN_ROLES = new Set(['school_admin', 'super_admin']);

/**
 * Assert that the caller may perform `action` on the given lesson plan.
 * Only the plan's teacher OR a school/super admin is permitted.
 * Throws ForbiddenError with an action-specific message otherwise.
 *
 * `teacherId` may arrive as an ObjectId, a string, or a populated User doc.
 * We resolve all three safely; a populated doc falls back to its `_id`.
 */
export function assertLessonPlanAccess(
  plan: Pick<ILessonPlan, '_id' | 'teacherId'>,
  actorId: string,
  actorRole: string,
  action: 'update' | 'delete' | 'attach' | 'detach' | 'access',
): void {
  const teacherIdStr =
    typeof plan.teacherId === 'string'
      ? plan.teacherId
      : plan.teacherId && typeof plan.teacherId === 'object' && '_id' in plan.teacherId
        ? String((plan.teacherId as { _id: unknown })._id)
        : String(plan.teacherId);
  const isOwner = teacherIdStr === actorId;
  const isAdmin = ADMIN_ROLES.has(actorRole);
  if (!isOwner && !isAdmin) {
    throw new ForbiddenError(`You can only ${action} your own lesson plans`);
  }
}

const LESSON_PLAN_CURRICULUM_NODE_TYPES = ['topic', 'subtopic', 'outcome'] as const;

/** Verify a class, subject, and (optionally) curriculum node all belong to the school or the global library. */
export async function verifyRefs(schoolId: string, classId: string, subjectId: string, curriculumTopicId?: string): Promise<void> {
  const [cls, subject] = await Promise.all([
    Class.findOne({ _id: classId, schoolId, isDeleted: false }).lean(),
    Subject.findOne({ _id: subjectId, schoolId, isDeleted: false }).lean(),
  ]);
  if (!cls) throw new BadRequestError('Class does not belong to this school');
  if (!subject) throw new BadRequestError('Subject does not belong to this school');

  const subjectGradeIds = (subject.gradeIds ?? []).map((gradeId) => String(gradeId));
  if (subjectGradeIds.length > 0 && !subjectGradeIds.includes(String(cls.gradeId))) {
    throw new BadRequestError('Subject is not available for this class grade');
  }

  if (curriculumTopicId) {
    const topic = await CurriculumNode.findOne({
      _id: curriculumTopicId,
      type: { $in: LESSON_PLAN_CURRICULUM_NODE_TYPES },
      isDeleted: false,
      $or: [{ schoolId }, { schoolId: null }],
    }).lean();
    if (!topic) throw new BadRequestError('Curriculum item does not belong to this school');
  }
}

/**
 * Ensure the curriculum topic's ancestor `grade` node matches the class's grade.
 * Walks up parent chain from the topic until it finds a node with `type: 'grade'`.
 * If both a grade node and the class's grade name are resolvable and differ, throws.
 */
const MAX_CURRICULUM_DEPTH = 10;

export async function assertTopicMatchesClassGrade(
  curriculumTopicId: string,
  classId: string,
  schoolId: string,
): Promise<void> {
  const [topic, cls] = await Promise.all([
    // I4: scope topic lookup to the school (mirrors verifyRefs: allow schoolId-null shared CAPS)
    CurriculumNode.findOne({
      _id: curriculumTopicId,
      isDeleted: false,
      $or: [{ schoolId }, { schoolId: null }],
    }),
    Class.findOne({ _id: classId, schoolId, isDeleted: false }).populate('gradeId', 'name'),
  ]);
  if (!topic) throw new BadRequestError('Curriculum topic not found');
  if (!cls) throw new BadRequestError('Class not found');

  // I1/I3: Traverse ancestors to find the grade node. Bound by MAX_DEPTH + visited-set to
  // prevent infinite loops on malformed curriculum cycles. Parent walk filters isDeleted.
  let gradeNode: ICurriculumNode | null = topic;
  const visited = new Set<string>();
  let depth = 0;
  while (gradeNode && gradeNode.type !== 'grade' && gradeNode.parentId && depth < MAX_CURRICULUM_DEPTH) {
    const parentIdStr = String(gradeNode.parentId);
    if (visited.has(parentIdStr)) break;
    visited.add(parentIdStr);
    const parent: ICurriculumNode | null = await CurriculumNode.findOne({
      _id: gradeNode.parentId,
      isDeleted: false,
    });
    if (!parent) break;
    gradeNode = parent;
    depth++;
  }

  // I2: fail closed when no grade ancestor resolves
  if (!gradeNode || gradeNode.type !== 'grade') {
    throw new BadRequestError(
      'Curriculum topic has no resolvable grade ancestor — please contact your admin',
    );
  }

  const classGradeName = (cls.gradeId as unknown as { name: string } | null)?.name;
  if (classGradeName && gradeNode.title !== classGradeName) {
    const normalize = (value: string) => value.trim().toLowerCase();
    if (normalize(gradeNode.title) === normalize(classGradeName)) return;
    throw new BadRequestError(
      `Curriculum topic is for ${gradeNode.title}, but class is ${classGradeName}`,
    );
  }
}

export async function assertTeacherCanPlanForClassSubject(
  teacherId: string,
  actorRole: string,
  schoolId: string,
  classId: string,
  subjectId: string,
): Promise<void> {
  if (ADMIN_ROLES.has(actorRole)) return;

  const [homeroom, timetableEntry] = await Promise.all([
    Class.findOne({ _id: classId, schoolId, teacherId, isDeleted: false }).select('_id').lean(),
    Timetable.findOne({ schoolId, teacherId, classId, subjectId, isDeleted: false }).select('_id').lean(),
  ]);

  if (homeroom || timetableEntry) return;
  throw new ForbiddenError('You can only create lesson plans for classes and subjects you teach');
}

function parseTermNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const direct = value.match(/\bT([1-4])\b/i);
  if (direct?.[1]) return Number(direct[1]);
  const labelled = value.match(/\bterm\s*([1-4])\b/i);
  if (labelled?.[1]) return Number(labelled[1]);
  return null;
}

async function resolveTermForCurriculumNode(curriculumNodeId: string): Promise<number> {
  let current = await CurriculumNode.findById(curriculumNodeId)
    .select('type title code parentId')
    .lean();

  for (let depth = 0; current && depth < 8; depth += 1) {
    const parsed = parseTermNumber(`${current.code} ${current.title}`);
    if (parsed) return parsed;
    if (!current.parentId) break;
    current = await CurriculumNode.findById(current.parentId)
      .select('type title code parentId')
      .lean();
  }

  return 1;
}

function resolveObjectId(value: unknown): string {
  if (value && typeof value === 'object' && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  return String(value);
}

function buildLessonMaterialInstructions(
  plan: Pick<ILessonPlan, 'topic' | 'durationMinutes' | 'objectives' | 'activities' | 'resources'>,
  teacherInstructions: string,
): string {
  const lines = [
    'This resource must support this saved lesson plan.',
    `LESSON TITLE: ${plan.topic}`,
    `LESSON DURATION: ${plan.durationMinutes} minutes`,
  ];

  if (plan.objectives?.length) {
    lines.push(`LESSON OBJECTIVES:\n- ${plan.objectives.join('\n- ')}`);
  }
  if (plan.activities?.length) {
    lines.push(`PLANNED LESSON ACTIVITIES:\n- ${plan.activities.join('\n- ')}`);
  }
  if (plan.resources?.length) {
    lines.push(`EXISTING RESOURCE NOTES:\n- ${plan.resources.join('\n- ')}`);
  }
  if (teacherInstructions.trim()) {
    lines.push(`ADDITIONAL TEACHER INSTRUCTIONS:\n${teacherInstructions.trim()}`);
  }

  lines.push('The generated material should feel like part of the same lesson workspace, not a generic standalone resource.');

  return lines.join('\n\n');
}

export class LessonPlanService {
  static async createLessonPlan(
    data: Partial<ILessonPlan>,
    teacherId: string,
    actorRole = 'teacher',
  ): Promise<ILessonPlan> {
    if (!data.schoolId || !data.classId || !data.subjectId) {
      throw new BadRequestError('schoolId, classId, and subjectId are required');
    }
    await verifyRefs(
      String(data.schoolId),
      String(data.classId),
      String(data.subjectId),
      data.curriculumTopicId ? String(data.curriculumTopicId) : undefined,
    );
    if (data.curriculumTopicId) {
      await assertTopicMatchesClassGrade(
        String(data.curriculumTopicId),
        String(data.classId),
        String(data.schoolId),
      );
    }
    await assertTeacherCanPlanForClassSubject(
      teacherId,
      actorRole,
      String(data.schoolId),
      String(data.classId),
      String(data.subjectId),
    );
    const plan = await LessonPlan.create({
      teacherId,
      schoolId: data.schoolId,
      subjectId: data.subjectId,
      classId: data.classId,
      curriculumTopicId: data.curriculumTopicId,
      date: data.date,
      topic: data.topic,
      durationMinutes: data.durationMinutes ?? 45,
      objectives: data.objectives ?? [],
      activities: data.activities ?? [],
      resources: data.resources ?? [],
      homeworkIds: data.homeworkIds ?? [],
      reflectionNotes: data.reflectionNotes,
      aiGenerated: data.aiGenerated ?? false,
    });
    return plan;
  }

  static async listLessonPlans(
    filters: { schoolId: string; teacherId?: string; classId?: string; subjectId?: string; search?: string },
    page = 1,
    limit = 20,
  ) {
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const filter: Record<string, unknown> = { schoolId: filters.schoolId, isDeleted: false };
    if (filters.teacherId) filter.teacherId = filters.teacherId;
    if (filters.classId) filter.classId = filters.classId;
    if (filters.subjectId) filter.subjectId = filters.subjectId;
    if (filters.search) {
      filter.topic = new RegExp(escapeRegex(filters.search), 'i');
    }

    const [data, total] = await Promise.all([
      LessonPlan.find(filter)
        .populate('subjectId', 'name code')
        .populate('classId', 'name')
        .populate('curriculumTopicId', 'title code')
        .populate({ path: 'homeworkIds', match: { isDeleted: false }, select: 'type title' })
        .sort('-date')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      LessonPlan.countDocuments(filter),
    ]);

    return { data, total, page: sanitizedPage, limit: sanitizedLimit, totalPages: Math.ceil(total / sanitizedLimit) };
  }

  static async getLessonPlanById(
    id: string,
    schoolId: string,
    actorId?: string,
    actorRole?: string,
  ): Promise<ILessonPlan> {
    const plan = await LessonPlan.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .populate('curriculumTopicId', 'title code')
      .populate({ path: 'homeworkIds', match: { isDeleted: false } })
      .lean();
    if (!plan) throw new NotFoundError('Lesson plan not found');
    if (actorId && actorRole) {
      assertLessonPlanAccess(plan, actorId, actorRole, 'access');
    }
    return plan;
  }

  static async updateLessonPlan(
    id: string,
    schoolId: string,
    data: Partial<ILessonPlan>,
    actorId: string,
    actorRole: string,
  ): Promise<ILessonPlan> {
    // Ownership: only the plan's teacher OR a school admin may update
    const existing = await LessonPlan.findOne({ _id: id, schoolId, isDeleted: false }).lean();
    if (!existing) throw new NotFoundError('Lesson plan not found');
    assertLessonPlanAccess(existing, actorId, actorRole, 'update');

    // If classId/subjectId/topicId are being changed, re-verify they belong to the school
    if (data.classId || data.subjectId || data.curriculumTopicId) {
      await verifyRefs(
        schoolId,
        String(data.classId ?? existing.classId),
        String(data.subjectId ?? existing.subjectId),
        data.curriculumTopicId ? String(data.curriculumTopicId) : undefined,
      );
    }

    if (data.classId || data.subjectId) {
      await assertTeacherCanPlanForClassSubject(
        actorId,
        actorRole,
        schoolId,
        String(data.classId ?? existing.classId),
        String(data.subjectId ?? existing.subjectId),
      );
    }

    // Grade-topic coherence: re-check when either topic or class is changing
    if (data.curriculumTopicId || data.classId) {
      const effectiveTopicId = String(data.curriculumTopicId ?? existing.curriculumTopicId);
      const effectiveClassId = String(data.classId ?? existing.classId);
      if (effectiveTopicId && effectiveClassId) {
        await assertTopicMatchesClassGrade(effectiveTopicId, effectiveClassId, schoolId);
      }
    }

    const plan = await LessonPlan.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('curriculumTopicId', 'title code');
    if (!plan) throw new NotFoundError('Lesson plan not found');
    return plan;
  }

  static async deleteLessonPlan(
    id: string,
    schoolId: string,
    actorId: string,
    actorRole: string,
  ): Promise<ILessonPlan> {
    const existing = await LessonPlan.findOne({ _id: id, schoolId, isDeleted: false }).lean();
    if (!existing) throw new NotFoundError('Lesson plan not found');
    assertLessonPlanAccess(existing, actorId, actorRole, 'delete');

    // I5: cascade FIRST — if the homework update fails, the plan remains live so a retry works.
    // Submissions are preserved (we only soft-delete homework, not submissions).
    if (existing.homeworkIds && existing.homeworkIds.length) {
      await Homework.updateMany(
        { _id: { $in: existing.homeworkIds }, schoolId, isDeleted: false },
        { $set: { isDeleted: true } },
      );
    }

    const plan = await LessonPlan.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!plan) throw new NotFoundError('Lesson plan not found');

    return plan;
  }

  /** Render a populated lesson plan to a PDF buffer via PDFKit. */
  static async getLessonPlanPdfBuffer(
    id: string,
    schoolId: string,
    actorId: string,
    actorRole: string,
  ): Promise<Buffer> {
    const plan = await LessonPlan.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('curriculumTopicId', 'title code description')
      .populate({ path: 'homeworkIds', match: { isDeleted: false } });
    if (!plan) throw new NotFoundError('Lesson plan not found');
    assertLessonPlanAccess(plan, actorId, actorRole, 'access');

    const [school, teacher] = await Promise.all([
      School.findById(plan.schoolId).select('name').lean(),
      User.findById(plan.teacherId).select('firstName lastName').lean(),
    ]);
    if (!school || !teacher) throw new NotFoundError('School or teacher missing');

    // The generator expects a PopulatedPlan shape — the populate calls above match it.
    return generateLessonPlanPdf(plan as never, school, teacher);
  }

  static async generateLessonMaterial(
    id: string,
    schoolId: string,
    actorId: string,
    actorRole: string,
    data: GenerateLessonMaterialInput,
  ) {
    const plan = await LessonPlan.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('classId', 'name gradeId')
      .populate('subjectId', 'name code')
      .populate('curriculumTopicId', 'title code parentId type description')
      .lean();

    if (!plan) throw new NotFoundError('Lesson plan not found');
    assertLessonPlanAccess(plan, actorId, actorRole, 'access');

    const classRef = plan.classId as unknown as { _id: unknown; gradeId?: unknown };
    if (!classRef?.gradeId) {
      throw new BadRequestError('Lesson teaching group is missing a grade');
    }

    const curriculumNodeId = resolveObjectId(plan.curriculumTopicId);
    const term = await resolveTermForCurriculumNode(curriculumNodeId);

    return GenerationService.generateContent(schoolId, actorId, {
      curriculumNodeId,
      type: data.type,
      gradeId: String(classRef.gradeId),
      subjectId: resolveObjectId(plan.subjectId),
      term,
      blockTypes: data.blockTypes,
      difficulty: data.difficulty,
      instructions: buildLessonMaterialInstructions(plan, data.instructions),
    });
  }

  /**
   * Create a Homework record and attach it to the given lesson plan.
   * Multi-tenancy: the homework's schoolId/classId/subjectId must match the plan.
   * MongoDB is standalone — no transaction; if `plan.save()` fails after the
   * homework is created, the homework may orphan. Accepted risk (see Task 8).
   */
  static async attachHomeworkToLessonPlan(
    planId: string,
    schoolId: string,
    input: CreateHomeworkInput,
    actorId: string,
    actorRole: string,
  ): Promise<IHomework> {
    const plan = await LessonPlan.findOne({ _id: planId, schoolId, isDeleted: false });
    if (!plan) throw new NotFoundError('Lesson plan not found');
    assertLessonPlanAccess(plan, actorId, actorRole, 'attach');

    if (String(input.schoolId) !== String(plan.schoolId)) {
      throw new BadRequestError('Homework must belong to the same school as the lesson plan');
    }
    if (String(input.classId) !== String(plan.classId)) {
      throw new BadRequestError('Homework class must match lesson plan class');
    }
    if (String(input.subjectId) !== String(plan.subjectId)) {
      throw new BadRequestError('Homework subject must match lesson plan subject');
    }

    const hw = await Homework.create({ ...input, teacherId: actorId });
    plan.homeworkIds.push(hw._id as mongoose.Types.ObjectId);
    await plan.save();
    return hw;
  }

  /** Detach a homework from the plan and soft-delete the homework record. */
  static async detachHomeworkFromLessonPlan(
    planId: string,
    schoolId: string,
    homeworkId: string,
    actorId: string,
    actorRole: string,
  ): Promise<void> {
    const plan = await LessonPlan.findOne({ _id: planId, schoolId, isDeleted: false });
    if (!plan) throw new NotFoundError('Lesson plan not found');
    assertLessonPlanAccess(plan, actorId, actorRole, 'detach');

    const before = plan.homeworkIds.length;
    const filtered = plan.homeworkIds.filter((id) => id.toString() !== homeworkId);
    if (filtered.length === before) {
      throw new NotFoundError('Homework not attached to this lesson plan');
    }
    plan.homeworkIds = filtered as ILessonPlan['homeworkIds'];
    await plan.save();
    await Homework.updateOne({ _id: homeworkId, schoolId }, { $set: { isDeleted: true } });
  }
}
