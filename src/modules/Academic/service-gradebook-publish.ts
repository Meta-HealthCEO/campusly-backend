import mongoose, { type Types as MTypes } from 'mongoose';
import { Assessment, Mark, type IMark } from './model.js';
import { AssessmentPaper } from '../QuestionBank/model.js';
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

/**
 * Find or lazily create an Assessment record linked to a paper.
 * Idempotent — caches the link on AssessmentPaper.assessmentId.
 *
 * Resolution order:
 *   (a) cached AssessmentPaper.assessmentId
 *   (b) match by metadata (school + class + subject + name + term + year)
 *   (c) create new Assessment from paper metadata
 */
export async function findOrCreateAssessmentForPaper(input: {
  paperId: string;
  schoolId: string;
  classId: string;
  subjectId: string;
}): Promise<{ _id: MTypes.ObjectId; totalMarks: number }> {
  const paper = await AssessmentPaper.findOne({
    _id: new mongoose.Types.ObjectId(input.paperId),
    schoolId: new mongoose.Types.ObjectId(input.schoolId),
    isDeleted: false,
  });
  if (!paper) throw new NotFoundError('Paper not found');

  // (a) cached link
  if (paper.assessmentId) {
    const existing = await Assessment.findOne({
      _id: paper.assessmentId,
      schoolId: new mongoose.Types.ObjectId(input.schoolId),
      isDeleted: false,
    });
    if (existing) {
      return { _id: existing._id as MTypes.ObjectId, totalMarks: existing.totalMarks };
    }
    // cached link is stale (target deleted); fall through to recreate
  }

  // (b) match by metadata
  const byMatch = await Assessment.findOne({
    schoolId: new mongoose.Types.ObjectId(input.schoolId),
    classId: new mongoose.Types.ObjectId(input.classId),
    subjectId: new mongoose.Types.ObjectId(input.subjectId),
    name: paper.title,
    term: paper.term,
    academicYear: paper.year,
    isDeleted: false,
  });
  if (byMatch) {
    paper.assessmentId = byMatch._id as MTypes.ObjectId;
    await paper.save();
    return { _id: byMatch._id as MTypes.ObjectId, totalMarks: byMatch.totalMarks };
  }

  // (c) create. Assessment.type enum is restrictive
  // ('test' | 'exam' | 'assignment' | 'practical' | 'project') and does not
  // align 1:1 with PAPER_TYPES, so we hard-code 'test' as the safe default.
  const created = await Assessment.create({
    name: paper.title,
    subjectId: new mongoose.Types.ObjectId(input.subjectId),
    classId: new mongoose.Types.ObjectId(input.classId),
    schoolId: new mongoose.Types.ObjectId(input.schoolId),
    type: 'test',
    totalMarks: paper.totalMarks,
    weight: 1,
    term: paper.term,
    academicYear: paper.year,
    date: new Date(),
    paperId: paper._id,
  });
  paper.assessmentId = created._id as MTypes.ObjectId;
  await paper.save();
  return { _id: created._id as MTypes.ObjectId, totalMarks: created.totalMarks };
}
