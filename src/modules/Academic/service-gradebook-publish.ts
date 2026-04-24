import mongoose from 'mongoose';
import { Assessment, Mark, type IMark } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';

export interface PublishMarkInput {
  schoolId: string;
  assessmentId: string;
  studentId: string;
  mark: number;
  comment?: string;
  isAbsent?: boolean;
}

export async function publishMarkToGradebook(input: PublishMarkInput): Promise<IMark> {
  if (!Number.isFinite(input.mark) || input.mark < 0) {
    throw new BadRequestError('Mark must be a non-negative number.');
  }

  const schoolOid = new mongoose.Types.ObjectId(input.schoolId);
  const assessmentOid = new mongoose.Types.ObjectId(input.assessmentId);
  const studentOid = new mongoose.Types.ObjectId(input.studentId);

  const assessment = await Assessment.findOne({
    _id: assessmentOid,
    schoolId: schoolOid,
    isDeleted: false,
  }).lean();

  if (!assessment) throw new NotFoundError('Assessment not found');

  if (input.mark > assessment.totalMarks) {
    throw new BadRequestError(
      `Mark (${input.mark}) cannot exceed assessment total (${assessment.totalMarks}).`,
    );
  }

  const percentage = assessment.totalMarks > 0
    ? Math.round((input.mark / assessment.totalMarks) * 1000) / 10
    : 0;

  const updated = await Mark.findOneAndUpdate(
    { assessmentId: assessmentOid, studentId: studentOid },
    {
      $set: {
        schoolId: schoolOid,
        mark: input.mark,
        total: assessment.totalMarks,
        percentage,
        comment: input.comment,
        isAbsent: input.isAbsent ?? false,
        isDeleted: false,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  if (!updated) throw new Error('Mark upsert failed');
  return updated.toObject() as IMark;
}
