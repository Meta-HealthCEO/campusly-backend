import { SgbMember } from './model.js';
import type { ISgbMember } from './model.js';
import { NotFoundError, ConflictError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { InviteSgbMemberInput, UpdateSgbMemberInput } from './validation.js';
import { logger } from '../../common/logger.js';

interface ListMembersQuery {
  schoolId: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class SgbMemberService {
  static async inviteMember(
    data: InviteSgbMemberInput,
    schoolId: string,
    invitedBy: string,
  ): Promise<ISgbMember> {
    const existing = await SgbMember.findOne({
      email: data.email,
      schoolId,
      isDeleted: false,
    }).lean();

    if (existing) {
      throw new ConflictError('An SGB member with this email already exists for this school');
    }

    const member = await SgbMember.create({
      ...data,
      schoolId,
      invitedBy,
      invitedAt: new Date(),
      status: 'pending',
    });

    logger.info({ schoolId, email: data.email }, 'SGB member invited');
    return member;
  }

  static async listMembers(query: ListMembersQuery): Promise<{
    members: ISgbMember[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const page = Math.max(query.page ?? 1, 1);

    const filter: Record<string, unknown> = {
      schoolId: query.schoolId,
      isDeleted: false,
    };

    if (query.status) {
      filter.status = query.status;
    }

    const [members, total] = await Promise.all([
      SgbMember.find(filter)
        .populate('userId', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      SgbMember.countDocuments(filter),
    ]);

    return { members: members as ISgbMember[], total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async updateMember(
    id: string,
    schoolId: string,
    data: UpdateSgbMemberInput,
  ): Promise<ISgbMember> {
    const member = await SgbMember.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).lean();

    if (!member) {
      throw new NotFoundError('SGB member not found');
    }

    return member as ISgbMember;
  }

  static async deleteMember(id: string, schoolId: string): Promise<void> {
    const member = await SgbMember.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!member) {
      throw new NotFoundError('SGB member not found');
    }
  }
}
