import mongoose from 'mongoose';
import { AssessmentStructure } from '../model.js';
import type { IAssessmentStructure } from '../model.js';
import { NotFoundError, ConflictError } from '../../../common/errors.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantFilter {
  teacherId: string;
  schoolId: string | null;
}

interface CreateFromTemplateData {
  name: string;
  subjectId?: string | null;
  subjectName: string;
  classId?: string | null;
  gradeId?: string | null;
  term: 1 | 2 | 3 | 4;
  academicYear: number;
}

interface CloneData {
  classId?: string | null;
  gradeId?: string | null;
  term: 1 | 2 | 3 | 4;
  academicYear: number;
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

function cleanCategories(
  source: IAssessmentStructure,
): IAssessmentStructure['categories'] {
  return source.categories.map((cat) => ({
    _id: new mongoose.Types.ObjectId(),
    name: cat.name,
    type: cat.type,
    weight: cat.weight,
    lineItems: cat.lineItems.map((li) => ({
      _id: new mongoose.Types.ObjectId(),
      name: li.name,
      totalMarks: li.totalMarks,
      weight: li.weight,
      date: undefined,
      assessmentId: undefined,
      status: 'pending' as const,
    })),
  }));
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class TemplateService {
  // ── Save As Template ─────────────────────────────────────────────────────────

  static async saveAsTemplate(
    structureId: string,
    tenant: TenantFilter,
    templateName: string,
  ): Promise<IAssessmentStructure> {
    const filter = {
      _id: new mongoose.Types.ObjectId(structureId),
      ...buildTenantFilter(tenant),
    };

    const source = await AssessmentStructure.findOne(filter)
      .lean()
      .exec() as unknown as IAssessmentStructure | null;

    if (!source) throw new NotFoundError('Assessment structure not found.');

    const doc = new AssessmentStructure({
      teacherId: new mongoose.Types.ObjectId(tenant.teacherId),
      schoolId: tenant.schoolId
        ? new mongoose.Types.ObjectId(tenant.schoolId)
        : null,
      subjectId: source.subjectId ?? null,
      subjectName: source.subjectName,
      classId: null,
      gradeId: source.gradeId ?? null,
      term: source.term,
      academicYear: source.academicYear,
      name: source.name,
      studentIds: [],
      categories: cleanCategories(source),
      status: 'draft',
      isTemplate: true,
      templateName,
      isDeleted: false,
    });

    return doc.save();
  }

  // ── List Templates ───────────────────────────────────────────────────────────

  static async listTemplates(
    tenant: TenantFilter,
  ): Promise<IAssessmentStructure[]> {
    const filter = {
      ...buildTenantFilter(tenant),
      isTemplate: true,
    };

    return AssessmentStructure.find(filter)
      .sort({ updatedAt: -1 })
      .lean()
      .exec() as unknown as IAssessmentStructure[];
  }

  // ── Delete Template ──────────────────────────────────────────────────────────

  static async deleteTemplate(
    id: string,
    tenant: TenantFilter,
  ): Promise<void> {
    const filter = {
      _id: new mongoose.Types.ObjectId(id),
      ...buildTenantFilter(tenant),
      isTemplate: true,
    };

    const template = await AssessmentStructure.findOne(filter);
    if (!template) throw new NotFoundError('Template not found.');

    template.isDeleted = true;
    await template.save();
  }

  // ── Create From Template ─────────────────────────────────────────────────────

  static async createFromTemplate(
    templateId: string,
    tenant: TenantFilter,
    data: CreateFromTemplateData,
  ): Promise<IAssessmentStructure> {
    const filter = {
      _id: new mongoose.Types.ObjectId(templateId),
      ...buildTenantFilter(tenant),
      isTemplate: true,
    };

    const template = await AssessmentStructure.findOne(filter)
      .lean()
      .exec() as unknown as IAssessmentStructure | null;

    if (!template) throw new NotFoundError('Template not found.');

    try {
      const doc = new AssessmentStructure({
        teacherId: new mongoose.Types.ObjectId(tenant.teacherId),
        schoolId: tenant.schoolId
          ? new mongoose.Types.ObjectId(tenant.schoolId)
          : null,
        subjectId: data.subjectId
          ? new mongoose.Types.ObjectId(data.subjectId)
          : null,
        subjectName: data.subjectName,
        classId: data.classId
          ? new mongoose.Types.ObjectId(data.classId)
          : null,
        gradeId: data.gradeId
          ? new mongoose.Types.ObjectId(data.gradeId)
          : null,
        term: data.term,
        academicYear: data.academicYear,
        name: data.name,
        studentIds: [],
        categories: cleanCategories(template),
        status: 'draft',
        isTemplate: false,
        isDeleted: false,
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

  // ── Clone ────────────────────────────────────────────────────────────────────

  static async clone(
    structureId: string,
    tenant: TenantFilter,
    data: CloneData,
  ): Promise<IAssessmentStructure> {
    const filter = {
      _id: new mongoose.Types.ObjectId(structureId),
      ...buildTenantFilter(tenant),
      isTemplate: false,
    };

    const source = await AssessmentStructure.findOne(filter)
      .lean()
      .exec() as unknown as IAssessmentStructure | null;

    if (!source) throw new NotFoundError('Assessment structure not found.');

    try {
      const doc = new AssessmentStructure({
        teacherId: new mongoose.Types.ObjectId(tenant.teacherId),
        schoolId: tenant.schoolId
          ? new mongoose.Types.ObjectId(tenant.schoolId)
          : null,
        subjectId: source.subjectId ?? null,
        subjectName: source.subjectName,
        classId: data.classId
          ? new mongoose.Types.ObjectId(data.classId)
          : null,
        gradeId: data.gradeId
          ? new mongoose.Types.ObjectId(data.gradeId)
          : null,
        term: data.term,
        academicYear: data.academicYear,
        name: `${source.name} (copy)`,
        studentIds: [],
        categories: cleanCategories(source),
        status: 'draft',
        isTemplate: false,
        isDeleted: false,
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
}
