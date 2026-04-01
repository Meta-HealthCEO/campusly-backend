import { PaperModeration, IPaperModeration } from '../model.assessment.js';
import { NotFoundError } from '../../../common/errors.js';

export class ModerationService {
  static async submitForModeration(
    paperId: string,
    teacherId: string,
    schoolId: string,
  ): Promise<IPaperModeration> {
    const moderation = new PaperModeration({
      paperId,
      schoolId,
      submittedBy: teacherId,
      submittedAt: new Date(),
      status: 'pending',
    });
    return moderation.save();
  }

  static async getModerationQueue(schoolId: string): Promise<IPaperModeration[]> {
    return PaperModeration.find({
      schoolId,
      status: 'pending',
      isDeleted: false,
    })
      .populate('paperId')
      .populate('submittedBy', 'firstName lastName email')
      .sort({ submittedAt: 1 })
      .lean()
      .exec();
  }

  static async getModerationStatus(paperId: string): Promise<IPaperModeration> {
    const moderation = await PaperModeration.findOne({ paperId })
      .populate('submittedBy', 'firstName lastName email')
      .populate('moderatorId', 'firstName lastName email')
      .lean()
      .exec();
    if (!moderation) throw new NotFoundError('Moderation record not found');
    return moderation as IPaperModeration;
  }

  static async reviewPaper(
    paperId: string,
    moderatorId: string,
    status: string,
    comments: string,
  ): Promise<IPaperModeration> {
    const historyEntry = {
      moderatorId,
      action: status,
      comment: comments,
      timestamp: new Date(),
    };

    const moderation = await PaperModeration.findOneAndUpdate(
      { paperId },
      {
        $set: {
          status,
          moderatorId,
          moderatedAt: new Date(),
          comments,
        },
        $push: { moderationHistory: historyEntry },
      },
      { new: true },
    ).lean().exec();

    if (!moderation) throw new NotFoundError('Moderation record not found');
    return moderation as IPaperModeration;
  }
}
