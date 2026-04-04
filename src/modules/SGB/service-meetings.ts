import { SgbMeeting } from './model.js';
import type { ISgbMeeting } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateMeetingInput, UpdateMeetingInput, RecordMinutesInput } from './validation.js';
import { logger } from '../../common/logger.js';

interface ListMeetingsQuery {
  schoolId: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export class SgbMeetingService {
  static async createMeeting(
    data: CreateMeetingInput,
    schoolId: string,
    createdBy: string,
  ): Promise<ISgbMeeting> {
    const meeting = await SgbMeeting.create({
      ...data,
      schoolId,
      createdBy,
      status: 'scheduled',
    });

    logger.info({ schoolId, meetingId: meeting._id }, 'SGB meeting created');
    return meeting;
  }

  static async listMeetings(query: ListMeetingsQuery): Promise<{
    meetings: ISgbMeeting[];
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

    if (query.status) filter.status = query.status;
    if (query.type) filter.type = query.type;

    const [meetings, total] = await Promise.all([
      SgbMeeting.find(filter)
        .populate('attendees', 'firstName lastName position')
        .populate('apologies', 'firstName lastName position')
        .sort('-date')
        .skip(skip)
        .limit(limit)
        .lean(),
      SgbMeeting.countDocuments(filter),
    ]);

    return { meetings: meetings as ISgbMeeting[], total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getMeeting(id: string, schoolId: string): Promise<ISgbMeeting> {
    const meeting = await SgbMeeting.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('attendees', 'firstName lastName position')
      .populate('apologies', 'firstName lastName position')
      .lean();

    if (!meeting) {
      throw new NotFoundError('SGB meeting not found');
    }

    return meeting as ISgbMeeting;
  }

  static async updateMeeting(
    id: string,
    schoolId: string,
    data: UpdateMeetingInput,
  ): Promise<ISgbMeeting> {
    const meeting = await SgbMeeting.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).lean();

    if (!meeting) {
      throw new NotFoundError('SGB meeting not found');
    }

    return meeting as ISgbMeeting;
  }

  static async deleteMeeting(id: string, schoolId: string): Promise<void> {
    const meeting = await SgbMeeting.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!meeting) {
      throw new NotFoundError('SGB meeting not found');
    }
  }

  static async recordMinutes(
    id: string,
    schoolId: string,
    data: RecordMinutesInput,
  ): Promise<ISgbMeeting> {
    const updateData: Record<string, unknown> = { minutes: data.content };
    if (data.attendees) updateData.attendees = data.attendees;
    if (data.apologies) updateData.apologies = data.apologies;

    const meeting = await SgbMeeting.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .populate('attendees', 'firstName lastName position')
      .populate('apologies', 'firstName lastName position')
      .lean();

    if (!meeting) {
      throw new NotFoundError('SGB meeting not found');
    }

    logger.info({ schoolId, meetingId: id }, 'SGB meeting minutes recorded');
    return meeting as ISgbMeeting;
  }
}
