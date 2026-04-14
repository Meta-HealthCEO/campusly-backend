import mongoose from 'mongoose';
import { AssessmentStructure } from '../model.js';
import type { IAssessmentStructure, ICategory, ILineItem } from '../model.js';
import { Assessment, Mark } from '../../Academic/model.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantFilter {
  teacherId: string;
  schoolId: string | null;
}

interface AddCategoryData {
  name: string;
  type: ICategory['type'];
  weight: number;
}

interface UpdateCategoryData {
  name?: string;
  type?: ICategory['type'];
  weight?: number;
}

interface AddLineItemData {
  name: string;
  totalMarks: number;
  weight?: number;
  date?: Date;
  existingAssessmentId?: string;
}

interface UpdateLineItemData {
  name?: string;
  totalMarks?: number;
  weight?: number;
  date?: Date;
  status?: ILineItem['status'];
}

// ─── Private Helpers ─────────────────────────────────────────────────────────

function buildTenantFilter(tenant: TenantFilter): Record<string, unknown> {
  return {
    teacherId: new mongoose.Types.ObjectId(tenant.teacherId),
    schoolId: tenant.schoolId
      ? new mongoose.Types.ObjectId(tenant.schoolId)
      : null,
    isDeleted: false,
  };
}

async function findStructure(
  id: string,
  tenant: TenantFilter,
): Promise<IAssessmentStructure> {
  const filter = {
    _id: new mongoose.Types.ObjectId(id),
    ...buildTenantFilter(tenant),
  };
  const structure = await AssessmentStructure.findOne(filter);
  if (!structure) throw new NotFoundError('Assessment structure not found.');
  if (structure.status === 'locked') {
    throw new BadRequestError('Cannot modify a locked structure.');
  }
  return structure;
}

function findCategory(
  structure: IAssessmentStructure,
  catId: string,
): ICategory {
  const category = structure.categories.find(
    (c) => c._id.toString() === catId,
  );
  if (!category) throw new NotFoundError('Category not found.');
  return category;
}

function findLineItem(category: ICategory, itemId: string): ILineItem {
  const item = category.lineItems.find(
    (li) => li._id.toString() === itemId,
  );
  if (!item) throw new NotFoundError('Line item not found.');
  return item;
}

async function hasMarks(assessmentId: mongoose.Types.ObjectId): Promise<boolean> {
  const count = await Mark.countDocuments({
    assessmentId,
    isDeleted: false,
  });
  return count > 0;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class CategoryService {
  // ── Category Methods ─────────────────────────────────────────────────────────

  static async addCategory(
    structureId: string,
    tenant: TenantFilter,
    data: AddCategoryData,
  ): Promise<IAssessmentStructure> {
    const structure = await findStructure(structureId, tenant);

    structure.categories.push({
      _id: new mongoose.Types.ObjectId(),
      name: data.name,
      type: data.type,
      weight: data.weight,
      lineItems: [],
    });

    return structure.save();
  }

  static async updateCategory(
    structureId: string,
    catId: string,
    tenant: TenantFilter,
    data: UpdateCategoryData,
  ): Promise<IAssessmentStructure> {
    const structure = await findStructure(structureId, tenant);
    const category = findCategory(structure, catId);

    if (data.name !== undefined) category.name = data.name;
    if (data.type !== undefined) category.type = data.type;
    if (data.weight !== undefined) category.weight = data.weight;

    return structure.save();
  }

  static async deleteCategory(
    structureId: string,
    catId: string,
    tenant: TenantFilter,
  ): Promise<IAssessmentStructure> {
    const structure = await findStructure(structureId, tenant);
    const category = findCategory(structure, catId);

    for (const item of category.lineItems) {
      if (item.assessmentId) {
        const marksExist = await hasMarks(item.assessmentId);
        if (marksExist) {
          throw new BadRequestError(
            `Cannot delete category: line item "${item.name}" has marks recorded.`,
          );
        }
      }
    }

    structure.categories = structure.categories.filter(
      (c) => c._id.toString() !== catId,
    );

    return structure.save();
  }

  // ── Line Item Methods ─────────────────────────────────────────────────────────

  static async addLineItem(
    structureId: string,
    catId: string,
    tenant: TenantFilter,
    data: AddLineItemData,
  ): Promise<IAssessmentStructure> {
    const structure = await findStructure(structureId, tenant);
    const category = findCategory(structure, catId);

    let assessmentId: mongoose.Types.ObjectId | undefined;

    if (data.existingAssessmentId) {
      assessmentId = new mongoose.Types.ObjectId(data.existingAssessmentId);
      await Assessment.findByIdAndUpdate(assessmentId, {
        structureId: new mongoose.Types.ObjectId(structureId),
      });
    } else if (
      structure.subjectId &&
      structure.schoolId
    ) {
      const assessmentType =
        category.type === 'other' ? 'test' : category.type;

      const newAssessment = new Assessment({
        name: data.name,
        subjectId: structure.subjectId,
        classId: structure.classId,
        schoolId: structure.schoolId,
        type: assessmentType,
        totalMarks: data.totalMarks,
        weight: data.weight ?? 0,
        term: structure.term,
        academicYear: structure.academicYear,
        date: data.date ?? new Date(),
        paperId: null,
        structureId: new mongoose.Types.ObjectId(structureId),
      });

      const saved = await newAssessment.save();
      assessmentId = saved._id as mongoose.Types.ObjectId;
    }

    category.lineItems.push({
      _id: new mongoose.Types.ObjectId(),
      name: data.name,
      totalMarks: data.totalMarks,
      weight: data.weight,
      date: data.date,
      assessmentId,
      status: 'pending',
    });

    return structure.save();
  }

  static async updateLineItem(
    structureId: string,
    catId: string,
    itemId: string,
    tenant: TenantFilter,
    data: UpdateLineItemData,
  ): Promise<IAssessmentStructure> {
    const structure = await findStructure(structureId, tenant);
    const category = findCategory(structure, catId);
    const item = findLineItem(category, itemId);

    if (data.totalMarks !== undefined && data.totalMarks !== item.totalMarks) {
      if (item.assessmentId) {
        const marksExist = await hasMarks(item.assessmentId);
        if (marksExist) {
          throw new BadRequestError(
            'Cannot change totalMarks: marks have already been recorded for this line item.',
          );
        }
      }
    }

    if (data.status !== undefined && data.status !== item.status) {
      if (structure.status !== 'active') {
        throw new BadRequestError(
          'Cannot change line item status: structure must be active.',
        );
      }
    }

    if (data.name !== undefined) item.name = data.name;
    if (data.totalMarks !== undefined) item.totalMarks = data.totalMarks;
    if (data.weight !== undefined) item.weight = data.weight;
    if (data.date !== undefined) item.date = data.date;
    if (data.status !== undefined) item.status = data.status;

    return structure.save();
  }

  static async deleteLineItem(
    structureId: string,
    catId: string,
    itemId: string,
    tenant: TenantFilter,
  ): Promise<IAssessmentStructure> {
    const structure = await findStructure(structureId, tenant);
    const category = findCategory(structure, catId);
    const item = findLineItem(category, itemId);

    if (item.assessmentId) {
      const marksExist = await hasMarks(item.assessmentId);
      if (marksExist) {
        throw new BadRequestError(
          'Cannot delete line item: marks have already been recorded.',
        );
      }
    }

    category.lineItems = category.lineItems.filter(
      (li) => li._id.toString() !== itemId,
    );

    return structure.save();
  }

  static async linkAssessment(
    structureId: string,
    catId: string,
    itemId: string,
    tenant: TenantFilter,
    assessmentId: string,
  ): Promise<IAssessmentStructure> {
    const structure = await findStructure(structureId, tenant);
    const category = findCategory(structure, catId);
    const item = findLineItem(category, itemId);

    const oid = new mongoose.Types.ObjectId(assessmentId);
    item.assessmentId = oid;

    await Assessment.findByIdAndUpdate(oid, {
      structureId: new mongoose.Types.ObjectId(structureId),
    });

    return structure.save();
  }

  // ── Student Methods (standalone) ──────────────────────────────────────────────

  static async addStudents(
    structureId: string,
    tenant: TenantFilter,
    studentIds: string[],
  ): Promise<IAssessmentStructure> {
    const structure = await findStructure(structureId, tenant);

    if (structure.classId) {
      throw new BadRequestError(
        'Cannot add standalone students: structure is linked to a class.',
      );
    }

    const existing = new Set(
      structure.studentIds.map((id) => id.toString()),
    );

    const toAdd = studentIds
      .filter((id) => !existing.has(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    structure.studentIds.push(...toAdd);

    return structure.save();
  }

  static async removeStudent(
    structureId: string,
    studentId: string,
    tenant: TenantFilter,
  ): Promise<IAssessmentStructure> {
    const structure = await findStructure(structureId, tenant);

    if (structure.classId) {
      throw new BadRequestError(
        'Cannot remove standalone students: structure is linked to a class.',
      );
    }

    structure.studentIds = structure.studentIds.filter(
      (id) => id.toString() !== studentId,
    );

    return structure.save();
  }
}
