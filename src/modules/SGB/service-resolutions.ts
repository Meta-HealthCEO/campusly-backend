import { SgbResolution } from './model.js';
import type { ISgbResolution, VoteChoice } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { CreateResolutionInput } from './validation.js';
import { logger } from '../../common/logger.js';

interface ListResolutionsQuery {
  schoolId: string;
  status?: string;
  meetingId?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export class SgbResolutionService {
  static async createResolution(
    meetingId: string,
    data: CreateResolutionInput,
    schoolId: string,
    proposedBy: string,
  ): Promise<ISgbResolution> {
    const resolution = await SgbResolution.create({
      ...data,
      meetingId,
      schoolId,
      proposedBy,
      status: 'proposed',
      votes: { for: 0, against: 0, abstain: 0 },
      voterRecords: [],
    });

    logger.info({ schoolId, resolutionId: resolution._id }, 'SGB resolution created');
    return resolution;
  }

  static async listResolutions(query: ListResolutionsQuery): Promise<{
    resolutions: ISgbResolution[];
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
    if (query.meetingId) filter.meetingId = query.meetingId;
    if (query.category) filter.category = query.category;

    const [resolutions, total] = await Promise.all([
      SgbResolution.find(filter)
        .populate('meetingId', 'title date')
        .populate('proposedBy', 'firstName lastName')
        .populate('linkedDocumentId', 'title category')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      SgbResolution.countDocuments(filter),
    ]);

    return { resolutions: resolutions as ISgbResolution[], total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async castVote(
    resolutionId: string,
    schoolId: string,
    voterId: string,
    vote: VoteChoice,
  ): Promise<{ votes: { for: number; against: number; abstain: number }; userVote: VoteChoice }> {
    const resolution = await SgbResolution.findOne({
      _id: resolutionId,
      schoolId,
      isDeleted: false,
    });

    if (!resolution) {
      throw new NotFoundError('Resolution not found');
    }

    if (resolution.status !== 'proposed') {
      throw new BadRequestError('Voting is closed for this resolution');
    }

    // Check if voter already voted — update their vote
    const existingIdx = resolution.voterRecords.findIndex(
      (r) => r.voterId.toString() === voterId,
    );

    if (existingIdx >= 0) {
      const oldVote = resolution.voterRecords[existingIdx].vote;
      // Decrement old vote
      resolution.votes[oldVote] = Math.max(0, resolution.votes[oldVote] - 1);
      // Update record
      resolution.voterRecords[existingIdx].vote = vote;
      resolution.voterRecords[existingIdx].votedAt = new Date();
    } else {
      resolution.voterRecords.push({
        voterId: voterId as unknown as import('mongoose').Types.ObjectId,
        vote,
        votedAt: new Date(),
      });
    }

    // Increment new vote
    resolution.votes[vote] += 1;

    await resolution.save();

    logger.info({ schoolId, resolutionId, voterId, vote }, 'SGB vote cast');

    return { votes: resolution.votes, userVote: vote };
  }

  static async createPolicyResolution(
    data: { documentId: string; title: string; description?: string; meetingId: string },
    schoolId: string,
    proposedBy: string,
  ): Promise<ISgbResolution> {
    const resolution = await SgbResolution.create({
      meetingId: data.meetingId,
      schoolId,
      title: data.title,
      description: data.description,
      category: 'policy',
      status: 'proposed',
      requiresVote: true,
      votes: { for: 0, against: 0, abstain: 0 },
      voterRecords: [],
      linkedDocumentId: data.documentId,
      proposedBy,
    });

    logger.info({ schoolId, resolutionId: resolution._id }, 'Policy resolution proposed');
    return resolution;
  }
}
