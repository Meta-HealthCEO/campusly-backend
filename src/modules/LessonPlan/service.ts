import { LessonPlan, ILessonPlan } from './model.js';
import { Class } from '../Academic/model.js';
import { Subject } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

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

/** Verify a class, subject, and (optionally) curriculum topic all belong to the school. */
async function verifyRefs(schoolId: string, classId: string, subjectId: string, curriculumTopicId?: string): Promise<void> {
  const [cls, subject] = await Promise.all([
    Class.findOne({ _id: classId, schoolId, isDeleted: false }).lean(),
    Subject.findOne({ _id: subjectId, schoolId, isDeleted: false }).lean(),
  ]);
  if (!cls) throw new BadRequestError('Class does not belong to this school');
  if (!subject) throw new BadRequestError('Subject does not belong to this school');

  if (curriculumTopicId) {
    const topic = await CurriculumNode.findOne({
      _id: curriculumTopicId,
      isDeleted: false,
      $or: [{ schoolId }, { schoolId: null }],
    }).lean();
    if (!topic) throw new BadRequestError('Curriculum topic does not belong to this school');
  }
}

export class LessonPlanService {
  static async createLessonPlan(data: Partial<ILessonPlan>, teacherId: string): Promise<ILessonPlan> {
    if (!data.schoolId || !data.classId || !data.subjectId) {
      throw new BadRequestError('schoolId, classId, and subjectId are required');
    }
    await verifyRefs(
      String(data.schoolId),
      String(data.classId),
      String(data.subjectId),
      data.curriculumTopicId ? String(data.curriculumTopicId) : undefined,
    );
    const plan = new LessonPlan({ ...data, teacherId });
    return plan.save();
  }

  static async listLessonPlans(
    filters: { schoolId: string; teacherId?: string; classId?: string; subjectId?: string },
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

    const [data, total] = await Promise.all([
      LessonPlan.find(filter)
        .populate('subjectId', 'name code')
        .populate('classId', 'name')
        .populate('curriculumTopicId', 'title code')
        .sort('-date')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      LessonPlan.countDocuments(filter),
    ]);

    return { data, total, page: sanitizedPage, limit: sanitizedLimit, totalPages: Math.ceil(total / sanitizedLimit) };
  }

  static async getLessonPlanById(id: string, schoolId: string): Promise<ILessonPlan> {
    const plan = await LessonPlan.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .populate('curriculumTopicId', 'title code')
      .lean();
    if (!plan) throw new NotFoundError('Lesson plan not found');
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
    const plan = await LessonPlan.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!plan) throw new NotFoundError('Lesson plan not found');
    return plan;
  }
}
