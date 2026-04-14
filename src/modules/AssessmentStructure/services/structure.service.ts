import mongoose from 'mongoose';
import { AssessmentStructure, IAssessmentStructure } from '../model.js';
import { Class } from '../../Academic/model.js';
import { Mark } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '../../../common/errors.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantFilter {
  teacherId: string;
  schoolId: string | null;
}

interface ListQuery {
  term?: number;
  year?: number;
  classId?: string;
  subjectId?: string;
}

interface CreateData {
  subjectId?: string | null;
  subjectName: string;
  classId?: string | null;
  gradeId?: string | null;
  term: 1 | 2 | 3 | 4;
  academicYear: number;
  name: string;
  studentIds?: string[];
  categories?: unknown[];
}

interface UpdateData {
  name?: string;
  subjectName?: string;
  gradeId?: string | null;
}

interface LockResult {
  structure?: IAssessmentStructure;
  errors?: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildTenantFilter(tenant: TenantFilter): Record<string, unknown> {
  return {
    teacherId: new mongoose.Types.ObjectId(tenant.teacherId),
    schoolId: tenant.schoolId
      ? new mongoose.Types.ObjectId(tenant.schoolId)
      : null,
    isDeleted: false,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class StructureService {
  // ── Create ──────────────────────────────────────────────────────────────────

  static async create(
    tenant: TenantFilter,
    data: CreateData,
  ): Promise<IAssessmentStructure> {
    try {
      const doc = new AssessmentStructure({
        ...data,
        teacherId: new mongoose.Types.ObjectId(tenant.teacherId),
        schoolId: tenant.schoolId
          ? new mongoose.Types.ObjectId(tenant.schoolId)
          : null,
        subjectId: data.subjectId
          ? new mongoose.Types.ObjectId(data.subjectId)
          : null,
        classId: data.classId
          ? new mongoose.Types.ObjectId(data.classId)
          : null,
        gradeId: data.gradeId
          ? new mongoose.Types.ObjectId(data.gradeId)
          : null,
        studentIds: (data.studentIds ?? []).map(
          (id: string) => new mongoose.Types.ObjectId(id),
        ),
        status: 'draft',
        isTemplate: false,
      });
      return await doc.save();
    } catch (err: unknown) {
      const mongoErr = err as { code?: number };
      if (mongoErr.code === 11000) {
        throw new ConflictError(
          'A structure already exists for this subject/class/term/year combination.',
        );
      }
      throw err;
    }
  }

  // ── List ────────────────────────────────────────────────────────────────────

  static async list(
    tenant: TenantFilter,
    query: ListQuery,
  ): Promise<IAssessmentStructure[]> {
    const filter: Record<string, unknown> = {
      ...buildTenantFilter(tenant),
      isTemplate: false,
    };

    if (query.term !== undefined) filter.term = query.term;
    if (query.year !== undefined) filter.academicYear = query.year;
    if (query.classId) filter.classId = new mongoose.Types.ObjectId(query.classId);
    if (query.subjectId) filter.subjectId = new mongoose.Types.ObjectId(query.subjectId);

    return AssessmentStructure.find(filter)
      .sort({ updatedAt: -1 })
      .lean()
      .exec() as unknown as IAssessmentStructure[];
  }

  // ── Get By ID ────────────────────────────────────────────────────────────────

  static async getById(
    id: string,
    tenant: TenantFilter,
  ): Promise<IAssessmentStructure> {
    const filter = {
      _id: new mongoose.Types.ObjectId(id),
      ...buildTenantFilter(tenant),
    };

    const structure = await AssessmentStructure.findOne(filter)
      .lean()
      .exec() as unknown as IAssessmentStructure | null;

    if (!structure) throw new NotFoundError('Assessment structure not found.');
    return structure;
  }

  // ── Update ───────────────────────────────────────────────────────────────────

  static async update(
    id: string,
    tenant: TenantFilter,
    data: UpdateData,
  ): Promise<IAssessmentStructure> {
    const filter = {
      _id: new mongoose.Types.ObjectId(id),
      ...buildTenantFilter(tenant),
    };

    const structure = await AssessmentStructure.findOne(filter);
    if (!structure) throw new NotFoundError('Assessment structure not found.');
    if (structure.status === 'locked') {
      throw new BadRequestError('Cannot update a locked structure.');
    }

    if (data.name !== undefined) structure.name = data.name;
    if (data.subjectName !== undefined) structure.subjectName = data.subjectName;
    if (data.gradeId !== undefined) {
      structure.gradeId = data.gradeId
        ? new mongoose.Types.ObjectId(data.gradeId)
        : null;
    }

    return structure.save();
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  static async delete(id: string, tenant: TenantFilter): Promise<void> {
    const filter = {
      _id: new mongoose.Types.ObjectId(id),
      ...buildTenantFilter(tenant),
    };

    const structure = await AssessmentStructure.findOne(filter);
    if (!structure) throw new NotFoundError('Assessment structure not found.');
    if (structure.status !== 'draft') {
      throw new BadRequestError('Only draft structures can be deleted.');
    }

    structure.isDeleted = true;
    await structure.save();
  }

  // ── Activate ─────────────────────────────────────────────────────────────────

  static async activate(
    id: string,
    tenant: TenantFilter,
  ): Promise<IAssessmentStructure> {
    const filter = {
      _id: new mongoose.Types.ObjectId(id),
      ...buildTenantFilter(tenant),
    };

    const structure = await AssessmentStructure.findOne(filter);
    if (!structure) throw new NotFoundError('Assessment structure not found.');
    if (structure.status !== 'draft') {
      throw new BadRequestError('Only draft structures can be activated.');
    }

    if (structure.categories.length === 0) {
      throw new BadRequestError('Structure must have at least one category.');
    }

    // Validate category weights sum to 100
    const totalWeight = structure.categories.reduce(
      (sum, cat) => sum + cat.weight,
      0,
    );
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new BadRequestError(
        `Category weights must sum to 100%. Current total: ${totalWeight}%.`,
      );
    }

    for (const cat of structure.categories) {
      // Each category must have >= 1 line item
      if (cat.lineItems.length === 0) {
        throw new BadRequestError(
          `Category "${cat.name}" must have at least one line item.`,
        );
      }

      for (const item of cat.lineItems) {
        // Each line item must have totalMarks
        if (item.totalMarks == null || item.totalMarks <= 0) {
          throw new BadRequestError(
            `Line item "${item.name}" in category "${cat.name}" must have totalMarks set.`,
          );
        }
      }

      // If line items have custom weights, they must sum to 100% within the category
      const weightedItems = cat.lineItems.filter(
        (li) => li.weight != null,
      );
      if (weightedItems.length > 0 && weightedItems.length === cat.lineItems.length) {
        const lineItemWeightTotal = cat.lineItems.reduce(
          (sum, li) => sum + (li.weight ?? 0),
          0,
        );
        if (Math.abs(lineItemWeightTotal - 100) > 0.01) {
          throw new BadRequestError(
            `Line item weights in category "${cat.name}" must sum to 100%. Current total: ${lineItemWeightTotal}%.`,
          );
        }
      }
    }

    structure.status = 'active';
    return structure.save();
  }

  // ── Lock ─────────────────────────────────────────────────────────────────────

  static async lock(
    id: string,
    tenant: TenantFilter,
  ): Promise<LockResult> {
    const filter = {
      _id: new mongoose.Types.ObjectId(id),
      ...buildTenantFilter(tenant),
    };

    const structure = await AssessmentStructure.findOne(filter);
    if (!structure) throw new NotFoundError('Assessment structure not found.');
    if (structure.status !== 'active') {
      throw new BadRequestError('Only active structures can be locked.');
    }

    const errors: string[] = [];

    // Validate: every line item must be closed
    for (const cat of structure.categories) {
      for (const item of cat.lineItems) {
        if (item.status !== 'closed') {
          errors.push(
            `Line item "${item.name}" in category "${cat.name}" is not closed (status: ${item.status}).`,
          );
        }
      }
    }

    // Validate: every student has marks or isAbsent for every line item
    const studentIds = await StructureService.getStudentIds(structure);

    for (const cat of structure.categories) {
      for (const item of cat.lineItems) {
        if (!item.assessmentId) continue;

        for (const studentId of studentIds) {
          const mark = await Mark.findOne({
            assessmentId: item.assessmentId,
            studentId,
            isDeleted: false,
          }).lean();

          if (!mark) {
            errors.push(
              `Student ${studentId.toString()} has no mark for line item "${item.name}" in category "${cat.name}".`,
            );
          }
        }
      }
    }

    if (errors.length > 0) {
      return { errors };
    }

    structure.status = 'locked';
    structure.lockedAt = new Date();
    await structure.save();

    return { structure };
  }

  // ── Unlock ───────────────────────────────────────────────────────────────────

  static async unlock(
    id: string,
    tenant: TenantFilter,
    userId: string,
    reason: string,
  ): Promise<IAssessmentStructure> {
    const filter = {
      _id: new mongoose.Types.ObjectId(id),
      ...buildTenantFilter(tenant),
    };

    const structure = await AssessmentStructure.findOne(filter);
    if (!structure) throw new NotFoundError('Assessment structure not found.');
    if (structure.status !== 'locked') {
      throw new BadRequestError('Only locked structures can be unlocked.');
    }

    structure.status = 'active';
    structure.unlockedBy = new mongoose.Types.ObjectId(userId);
    structure.unlockReason = reason;
    structure.unlockedAt = new Date();
    return structure.save();
  }

  // ── Get Student IDs ──────────────────────────────────────────────────────────

  static async getStudentIds(
    structure: IAssessmentStructure,
  ): Promise<mongoose.Types.ObjectId[]> {
    if (structure.studentIds && structure.studentIds.length > 0) {
      return structure.studentIds as mongoose.Types.ObjectId[];
    }

    if (structure.classId) {
      const students = await Student.find(
        { classId: structure.classId, isDeleted: false },
        { _id: 1 },
      ).lean();
      return students.map((s) => s._id as mongoose.Types.ObjectId);
    }

    return [];
  }
}
