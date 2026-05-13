import { PaperMemo, PaperModeration, IPaperModeration } from '../model.assessment.js';
import { AssessmentPaper } from '../../QuestionBank/model.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../../common/errors.js';

export class ModerationService {
  static async submitForModeration(
    paperId: string,
    teacherId: string,
    schoolId: string,
  ): Promise<IPaperModeration> {
    const paper = await AssessmentPaper.findOne({
      _id: paperId,
      schoolId,
      createdBy: teacherId,
      isDeleted: false,
    }).lean();
    if (!paper) throw new NotFoundError('Paper not found');
    if (paper.status === 'finalised') {
      throw new BadRequestError('Paper has already been finalised');
    }
    const questionCount = paper.sections.reduce(
      (sum, section) => sum + section.questions.length,
      0,
    );
    if (questionCount === 0) {
      throw new BadRequestError('Add questions before submitting for moderation');
    }

    const moderation = await PaperModeration.findOneAndUpdate(
      { paperId, schoolId },
      {
        $set: {
          paperId,
          schoolId,
          submittedBy: teacherId,
          submittedAt: new Date(),
          status: 'pending',
          moderatorId: null,
          moderatedAt: null,
          comments: '',
          isDeleted: false,
        },
      },
      { new: true, upsert: true },
    );
    return moderation as IPaperModeration;
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

  static async getModerationStatus(paperId: string, schoolId: string): Promise<IPaperModeration> {
    const moderation = await PaperModeration.findOne({ paperId, schoolId, isDeleted: false })
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
    schoolId: string,
  ): Promise<IPaperModeration> {
    const paper = await AssessmentPaper.findOne({
      _id: paperId,
      schoolId,
      isDeleted: false,
    });
    if (!paper) throw new NotFoundError('Paper not found');
    const existing = await PaperModeration.findOne({
      paperId,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Moderation record not found');
    if (existing.status !== 'pending') {
      throw new ForbiddenError('Only pending papers can be reviewed');
    }

    const historyEntry = {
      moderatorId,
      action: status,
      comment: comments,
      timestamp: new Date(),
    };

    const moderation = await PaperModeration.findOneAndUpdate(
      { paperId, schoolId, isDeleted: false },
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
    if (status === 'approved') {
      paper.status = 'finalised';
      await paper.save();
      await PaperMemo.updateOne(
        { paperId, schoolId, isDeleted: false },
        { $set: { status: 'final' } },
      );
    }
    return moderation as IPaperModeration;
  }
}
