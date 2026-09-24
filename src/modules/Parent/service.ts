import mongoose from 'mongoose';
import { Parent, IParent } from './model.js';
import { Student } from '../Student/model.js';
import { Class, Grade } from '../Academic/model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

function resolveObjectId(value: unknown): string | null {
  if (value && typeof value === 'object' && '_id' in value) {
    return String((value as { _id: unknown })._id);
  }
  return value ? String(value) : null;
}

type ChildRow = { _id: unknown; classId?: unknown; gradeId?: unknown } & Record<string, unknown>;

/** Adds className and gradeName to each child (ids stay as they are, for callers that use them). */
async function withClassAndGradeNames(children: ChildRow[], schoolId: string): Promise<ChildRow[]> {
  const ids = (key: 'classId' | 'gradeId') => children.map((c) => String(c[key] ?? '')).filter((v) => mongoose.Types.ObjectId.isValid(v)).map((v) => new mongoose.Types.ObjectId(v));
  const [classes, grades] = await Promise.all([
    Class.find({ _id: { $in: ids('classId') }, schoolId, isDeleted: false }).select('name').lean(),
    Grade.find({ _id: { $in: ids('gradeId') }, schoolId, isDeleted: false }).select('name').lean(),
  ]);
  const className = new Map(classes.map((c) => [String(c._id), c.name]));
  const gradeName = new Map(grades.map((g) => [String(g._id), g.name]));
  return children.map((c) => ({ ...c, className: className.get(String(c.classId)) ?? '', gradeName: gradeName.get(String(c.gradeId)) ?? '' }));
}

export class ParentService {
  static async create(data: Partial<IParent>): Promise<IParent> {
    const parent = new Parent(data);
    return parent.save();
  }

  static async list(
    schoolId: string,
    query: ListQuery,
  ): Promise<{
    parents: IParent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
    const limit = Math.min(
      Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
      PAGINATION_DEFAULTS.maxLimit,
    );
    const skip = (page - 1) * limit;
    const sortField = query.sort ?? '-createdAt';

    const filter: Record<string, unknown> = {
      schoolId,
      isDeleted: false,
    };

    const [parents, total] = await Promise.all([
      Parent.find(filter)
        .populate('userId', 'firstName lastName email phone')
        .populate({
          path: 'childrenIds',
          populate: { path: 'userId', select: 'firstName lastName email' },
        })
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Parent.countDocuments(filter),
    ]);

    return {
      parents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async listForTeacher(
    schoolId: string,
    teacherId: string,
    query: ListQuery,
  ): Promise<{
    parents: IParent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { AcademicService } = await import('../Academic/service.js');
    const load = await AcademicService.getTeacherTeachingLoad(teacherId, schoolId);
    const classIds = [
      resolveObjectId(load.homeroom?.class),
      ...load.subjectClasses.map((entry) => resolveObjectId(entry.class)),
    ].filter((id): id is string => Boolean(id));

    if (classIds.length === 0) {
      const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
      const limit = Math.min(
        Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
        PAGINATION_DEFAULTS.maxLimit,
      );
      return { parents: [], total: 0, page, limit, totalPages: 0 };
    }

    const students = await Student.find({
      schoolId,
      classId: { $in: classIds },
      enrollmentStatus: 'active',
      isDeleted: false,
    }).select('guardianIds').lean();

    const guardianIds = [
      ...new Set(students.flatMap((student) => student.guardianIds.map((id) => id.toString()))),
    ];

    if (guardianIds.length === 0) {
      const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
      const limit = Math.min(
        Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
        PAGINATION_DEFAULTS.maxLimit,
      );
      return { parents: [], total: 0, page, limit, totalPages: 0 };
    }

    const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
    const limit = Math.min(
      Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
      PAGINATION_DEFAULTS.maxLimit,
    );
    const skip = (page - 1) * limit;
    const sortField = query.sort ?? '-createdAt';

    const filter: Record<string, unknown> = {
      _id: { $in: guardianIds },
      schoolId,
      isDeleted: false,
    };

    const [parents, total] = await Promise.all([
      Parent.find(filter)
        .populate('userId', 'firstName lastName email phone')
        .populate({
          path: 'childrenIds',
          populate: { path: 'userId', select: 'firstName lastName email' },
        })
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Parent.countDocuments(filter),
    ]);

    return {
      parents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getByUserId(userId: string): Promise<IParent> {
    const parent = await Parent.findOne({ userId, isDeleted: false })
      .populate('userId', 'firstName lastName email phone profileImage')
      .populate({
        path: 'childrenIds',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .lean();

    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    // Children who name this parent as a guardian count too (linked from the learner's side).
    const listed = new Set((parent.childrenIds as unknown as Array<{ _id: unknown }>).map((c) => String(c._id)));
    const guardianOf = await Student.find({ guardianIds: parent._id, schoolId: parent.schoolId, isDeleted: false })
      .populate('userId', 'firstName lastName email phone')
      .lean();
    const extra = guardianOf.filter((s) => !listed.has(String(s._id)));
    const children = [...(parent.childrenIds as unknown as ChildRow[]), ...(extra as unknown as ChildRow[])];
    return { ...parent, childrenIds: await withClassAndGradeNames(children, String(parent.schoolId)) } as unknown as IParent;
  }

  static async getById(id: string, schoolId: string): Promise<IParent> {
    const parent = await Parent.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('userId', 'firstName lastName email phone profileImage')
      .populate({
        path: 'childrenIds',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .lean();

    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    return parent;
  }

  static async update(id: string, schoolId: string, data: Partial<IParent>): Promise<IParent> {
    const parent = await Parent.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('userId', 'firstName lastName email phone')
      .populate({
        path: 'childrenIds',
        populate: { path: 'userId', select: 'firstName lastName email' },
      });

    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    return parent;
  }

  static async delete(id: string, schoolId: string): Promise<IParent> {
    const parent = await Parent.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    return parent;
  }

  static async linkChild(parentId: string, childId: string, schoolId: string): Promise<IParent> {
    const [parent, student] = await Promise.all([
      Parent.findOne({ _id: parentId, schoolId, isDeleted: false }),
      Student.findOne({ _id: childId, schoolId, isDeleted: false }),
    ]);
    if (!parent) {
      throw new NotFoundError('Parent not found');
    }
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [updatedParent] = await Promise.all([
        Parent.findByIdAndUpdate(parentId, {
          $addToSet: { childrenIds: childId },
        }, { session, new: true })
          .populate('userId', 'firstName lastName email phone profileImage')
          .populate({
            path: 'childrenIds',
            populate: { path: 'userId', select: 'firstName lastName email phone' },
          }),
        Student.findByIdAndUpdate(childId, {
          $addToSet: { guardianIds: parentId },
        }, { session }),
      ]);

      await session.commitTransaction();
      return updatedParent!;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  static async unlinkChild(parentId: string, childId: string, schoolId: string): Promise<IParent> {
    const [parent, student] = await Promise.all([
      Parent.findOne({ _id: parentId, schoolId, isDeleted: false }),
      Student.findOne({ _id: childId, schoolId, isDeleted: false }),
    ]);
    if (!parent) {
      throw new NotFoundError('Parent not found');
    }
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [updatedParent] = await Promise.all([
        Parent.findByIdAndUpdate(parentId, {
          $pull: { childrenIds: childId },
        }, { session, new: true })
          .populate('userId', 'firstName lastName email phone profileImage')
          .populate({
            path: 'childrenIds',
            populate: { path: 'userId', select: 'firstName lastName email phone' },
          }),
        Student.findByIdAndUpdate(childId, {
          $pull: { guardianIds: parentId },
        }, { session }),
      ]);

      await session.commitTransaction();
      return updatedParent!;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}
