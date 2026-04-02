import mongoose from 'mongoose';
import { Parent, IParent } from './model.js';
import { Student } from '../Student/model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
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

    return parent;
  }

  static async getById(id: string): Promise<IParent> {
    const parent = await Parent.findOne({ _id: id, isDeleted: false })
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

  static async update(id: string, data: Partial<IParent>): Promise<IParent> {
    const parent = await Parent.findOneAndUpdate(
      { _id: id, isDeleted: false },
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

  static async delete(id: string): Promise<IParent> {
    const parent = await Parent.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    return parent;
  }

  static async linkChild(parentId: string, childId: string): Promise<IParent> {
    const [parent, student] = await Promise.all([
      Parent.findOne({ _id: parentId, isDeleted: false }),
      Student.findOne({ _id: childId, isDeleted: false }),
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

  static async unlinkChild(parentId: string, childId: string): Promise<IParent> {
    const [parent, student] = await Promise.all([
      Parent.findOne({ _id: parentId, isDeleted: false }),
      Student.findOne({ _id: childId, isDeleted: false }),
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
