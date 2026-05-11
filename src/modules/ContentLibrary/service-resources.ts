import mongoose from 'mongoose';
import { ContentResource } from './model.js';
import { LessonPlan } from '../LessonPlan/model.js';
import { resolveAcademicFilterIds } from '../Academic/services/global-academic-lookup.js';
import { NotFoundError, ForbiddenError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateResourceInput, UpdateResourceInput, ResourceQueryInput } from './validation.js';

const POPULATE_LIST = [
  { path: 'curriculumNodeId', select: 'title code type' },
  { path: 'lessonPlanId', select: 'topic date durationMinutes' },
  { path: 'subjectId', select: 'name' },
  { path: 'gradeId', select: 'name level' },
  { path: 'createdBy', select: 'firstName lastName email' },
];

const POPULATE_DETAIL = [
  ...POPULATE_LIST,
  { path: 'reviewedBy', select: 'firstName lastName email' },
  { path: 'prerequisites', select: 'title code type' },
];

export class ResourcesService {
  static async listResources(
    schoolId: string,
    userId: string,
    userRole: string,
    filters: ResourceQueryInput,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);
    const { subjectIds, gradeIds } = await resolveAcademicFilterIds({
      subjectId: filters.subjectId,
      gradeId: filters.gradeId,
    });
    const query: Record<string, unknown> = { isDeleted: false };

    // ── Visibility rules ──
    if (filters.mine) {
      query.createdBy = uoid;
    } else {
      const orConditions: Record<string, unknown>[] = [
        // System-wide approved (schoolId null) visible to all
        { schoolId: null, status: 'approved' },
        // School approved visible to school members
        { schoolId: soid, status: 'approved' },
        // Own drafts/rejected visible to creator
        { createdBy: uoid, schoolId: soid, status: { $in: ['draft', 'rejected'] } },
      ];

      // HOD/admin can see pending_review for their school
      const reviewRoles = ['super_admin', 'school_admin', 'principal', 'hod'];
      if (reviewRoles.includes(userRole)) {
        orConditions.push({ schoolId: soid, status: 'pending_review' });
      }

      query.$or = orConditions;
    }

    // ── Filters ──
    if (filters.curriculumNodeId) {
      query.curriculumNodeId = new mongoose.Types.ObjectId(filters.curriculumNodeId);
    }
    if (filters.lessonPlanId) {
      query.lessonPlanId = new mongoose.Types.ObjectId(filters.lessonPlanId);
    }
    if (filters.type) query.type = filters.type;
    if (filters.format) query.format = filters.format;
    if (filters.status) query.status = filters.status;
    if (subjectIds) query.subjectId = { $in: subjectIds };
    if (gradeIds) query.gradeId = { $in: gradeIds };
    if (filters.term) query.term = filters.term;
    if (filters.source) query.source = filters.source;
    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [resources, total] = await Promise.all([
      ContentResource.find(query)
        .select('-blocks -aiPrompt')
        .populate(POPULATE_LIST)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContentResource.countDocuments(query),
    ]);

    return { resources, total, page: filters.page ?? 1, limit };
  }

  static async getResource(id: string, schoolId: string, userId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);

    const resource = await ContentResource.findOne({
      _id: oid,
      isDeleted: false,
      $or: [
        { schoolId: null, status: 'approved' },
        { schoolId: soid },
        { createdBy: uoid },
      ],
    })
      .populate(POPULATE_DETAIL)
      .lean();

    if (!resource) throw new NotFoundError('Content resource not found');
    return resource;
  }

  static async createResource(
    schoolId: string,
    userId: string,
    data: CreateResourceInput,
  ) {
    if (data.lessonPlanId) {
      const linkedLesson = await LessonPlan.findOne({
        _id: data.lessonPlanId,
        schoolId,
        isDeleted: false,
      }).select('_id').lean();
      if (!linkedLesson) throw new ForbiddenError('Lesson plan does not belong to this school');
    }

    const resource = await ContentResource.create({
      curriculumNodeId: new mongoose.Types.ObjectId(data.curriculumNodeId),
      lessonPlanId: data.lessonPlanId ? new mongoose.Types.ObjectId(data.lessonPlanId) : null,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      type: data.type,
      format: data.format,
      title: data.title,
      blocks: data.blocks.map((b) => ({
        ...b,
        curriculumNodeId: b.curriculumNodeId
          ? new mongoose.Types.ObjectId(b.curriculumNodeId)
          : null,
      })),
      source: data.source,
      sourceAttribution: data.sourceAttribution,
      gradeId: new mongoose.Types.ObjectId(data.gradeId),
      subjectId: new mongoose.Types.ObjectId(data.subjectId),
      term: data.term,
      tags: data.tags,
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
      difficulty: data.difficulty,
      estimatedMinutes: data.estimatedMinutes,
      prerequisites: data.prerequisites.map((p) => new mongoose.Types.ObjectId(p)),
      sourceImport: data.sourceImport
        ? {
            jobId: new mongoose.Types.ObjectId(data.sourceImport.jobId),
            storagePath: data.sourceImport.storagePath,
            filename: data.sourceImport.filename,
            mimeType: data.sourceImport.mimeType,
            pageRange: data.sourceImport.pageRange,
          }
        : undefined,
      needsReview: data.needsReview ?? false,
    });

    return resource.toObject();
  }

  static async updateResource(
    id: string,
    schoolId: string,
    userId: string,
    data: UpdateResourceInput,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);

    const resource = await ContentResource.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!resource) throw new NotFoundError('Content resource not found');
    if (resource.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only the creator can edit this resource');
    }
    if (resource.status !== 'draft' && resource.status !== 'rejected') {
      throw new ForbiddenError('Only draft or rejected resources can be edited');
    }

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.format !== undefined) update.format = data.format;
    if (data.difficulty !== undefined) update.difficulty = data.difficulty;
    if (data.estimatedMinutes !== undefined) update.estimatedMinutes = data.estimatedMinutes;
    if (data.tags !== undefined) update.tags = data.tags;
    if (data.prerequisites !== undefined) {
      update.prerequisites = data.prerequisites.map((p) => new mongoose.Types.ObjectId(p));
    }
    if (data.blocks !== undefined) {
      update.blocks = data.blocks.map((b) => ({
        ...b,
        curriculumNodeId: b.curriculumNodeId
          ? new mongoose.Types.ObjectId(b.curriculumNodeId)
          : null,
      }));
    }

    // Reset to draft if it was rejected
    if (resource.status === 'rejected') {
      update.status = 'draft';
    }

    const updated = await ContentResource.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate(POPULATE_DETAIL)
      .lean();

    return updated;
  }

  static async deleteResource(
    id: string,
    schoolId: string,
    userId: string,
    userRole: string,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const resource = await ContentResource.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!resource) throw new NotFoundError('Content resource not found');

    const isAdmin = ['super_admin', 'school_admin', 'principal'].includes(userRole);
    const isCreator = resource.createdBy.toString() === userId;
    if (!isAdmin && !isCreator) {
      throw new ForbiddenError('Only the creator or an admin can delete this resource');
    }

    await ContentResource.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { isDeleted: true } },
    );

    return { deleted: true };
  }
}
