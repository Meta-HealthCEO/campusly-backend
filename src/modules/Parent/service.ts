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

  static async getById(id: string): Promise<IParent> {
    const parent = await Parent.findOne({ _id: id, isDeleted: false })
      .populate('userId', 'firstName lastName email phone profileImage')
      .populate({
        path: 'childrenIds',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      });

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
    const parent = await Parent.findOne({ _id: parentId, isDeleted: false });
    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    const student = await Student.findOne({ _id: childId, isDeleted: false });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    await Parent.findByIdAndUpdate(parentId, {
      $addToSet: { childrenIds: childId },
    });

    await Student.findByIdAndUpdate(childId, {
      $addToSet: { guardianIds: parentId },
    });

    return ParentService.getById(parentId);
  }

  static async unlinkChild(parentId: string, childId: string): Promise<IParent> {
    const parent = await Parent.findOne({ _id: parentId, isDeleted: false });
    if (!parent) {
      throw new NotFoundError('Parent not found');
    }

    const student = await Student.findOne({ _id: childId, isDeleted: false });
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    await Parent.findByIdAndUpdate(parentId, {
      $pull: { childrenIds: childId },
    });

    await Student.findByIdAndUpdate(childId, {
      $pull: { guardianIds: parentId },
    });

    return ParentService.getById(parentId);
  }
}
