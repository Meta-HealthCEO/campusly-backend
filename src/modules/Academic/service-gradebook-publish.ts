import mongoose, { type Types as MTypes } from 'mongoose';
import { Assessment, Mark, type IMark } from './model.js';
import { AssessmentPaper } from '../QuestionBank/model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { Homework, type IHomework } from '../Homework/model.js';
import { Assignment, type IAssignment } from '../Assignment/model.js';

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

/**
 * Find or lazily create an Assessment record linked to a homework assignment.
 * Idempotent — caches the link on Homework.assessmentId.
 *
 * Note: Assessment.type enum is ('test' | 'exam' | 'assignment' | 'practical' | 'project').
 * 'homework' is not a valid value, so we use 'assignment' as the closest semantic match.
 */
export async function findOrCreateAssessmentForHomework(
  homework: IHomework,
): Promise<mongoose.Types.ObjectId> {
  if (homework.assessmentId) return homework.assessmentId as mongoose.Types.ObjectId;

  // Derive term from due date month (1-12 → term 1-4)
  const due = homework.dueDate;
  const month = due.getMonth() + 1;
  const term = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;
  const academicYear = due.getFullYear();

  const assessment = await Assessment.create({
    name: homework.title,
    schoolId: homework.schoolId,
    classId: homework.classId,
    subjectId: homework.subjectId,
    totalMarks: homework.totalMarks,
    term,
    academicYear,
    // 'homework' is not in the Assessment type enum; 'assignment' is the closest value
    type: 'assignment',
    weight: 1,
    date: homework.dueDate,
    paperId: null,
    isDeleted: false,
  });

  try {
    await Homework.updateOne(
      { _id: homework._id, schoolId: homework.schoolId },
      { $set: { assessmentId: assessment._id } },
    );
  } catch (err: unknown) {
    // Compensation: roll back the new assessment
    try {
      await Assessment.deleteOne({ _id: assessment._id });
    } catch (delErr: unknown) {
      logger.error({ delErr, assessmentId: assessment._id }, 'Assessment rollback failed');
    }
    throw err;
  }

  return assessment._id as mongoose.Types.ObjectId;
}

export async function publishHomeworkGrade(
  submission: {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    schoolId: mongoose.Types.ObjectId;
    mark?: number;
    maxMarks: number;
  },
  homework: IHomework,
): Promise<void> {
  if (submission.mark === undefined) return;

  const assessmentId = await findOrCreateAssessmentForHomework(homework);
  const percentage =
    submission.maxMarks > 0
      ? Math.round((submission.mark / submission.maxMarks) * 100)
      : 0;

  await Mark.findOneAndUpdate(
    { assessmentId, studentId: submission.studentId, schoolId: submission.schoolId },
    {
      $set: {
        mark: submission.mark,
        total: submission.maxMarks,
        percentage,
        isAbsent: false,
        isDeleted: false,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
}

// ─── Assignment ─────────────────────────────────────────────────────────────
// Mirrors the homework helpers above. Lazily creates an Assessment doc the
// first time we publish a grade for this assignment, caches the link on
// Assignment.assessmentId for idempotency. Same blast-radius caveat: if the
// assignment is later deleted, the Assessment is not cascaded — gradebook
// retains the historical mark on purpose.

export async function findOrCreateAssessmentForAssignment(
  assignment: IAssignment,
  classId: mongoose.Types.ObjectId,
): Promise<mongoose.Types.ObjectId> {
  const linked = assignment.assessmentLinks?.find(
    (link) => String(link.classId) === String(classId),
  );
  if (linked?.assessmentId) return linked.assessmentId as mongoose.Types.ObjectId;

  // Legacy single-cache migration: only reuse assessmentId when it belongs
  // to this class. Older assignment docs have no assessmentLinks array.
  if (assignment.assessmentId) {
    const cached = await Assessment.findOne({
      _id: assignment.assessmentId,
      schoolId: assignment.schoolId,
      classId,
      isDeleted: false,
    }).select('_id').lean<{ _id: mongoose.Types.ObjectId } | null>();
    if (cached) {
      await Assignment.updateOne(
        { _id: assignment._id, schoolId: assignment.schoolId },
        {
          $addToSet: {
            assessmentLinks: { classId, assessmentId: cached._id },
          },
        },
      );
      return cached._id;
    }
  }

  const existing = await Assessment.findOne({
    assignmentId: assignment._id,
    schoolId: assignment.schoolId,
    classId,
    isDeleted: false,
  }).select('_id').lean<{ _id: mongoose.Types.ObjectId } | null>();
  if (existing) {
    await Assignment.updateOne(
      { _id: assignment._id, schoolId: assignment.schoolId },
      {
        $addToSet: {
          assessmentLinks: { classId, assessmentId: existing._id },
        },
        ...(assignment.assessmentId ? {} : { $set: { assessmentId: existing._id } }),
      },
    );
    return existing._id;
  }

  // Pick the most relevant due date — the assignment for the supplied class.
  const classAssignment = assignment.assignedClasses.find(
    (a) => String(a.classId) === String(classId),
  );
  const due = classAssignment?.dueAt ?? new Date();
  const month = due.getMonth() + 1;
  const term = month <= 3 ? 1 : month <= 6 ? 2 : month <= 9 ? 3 : 4;
  const academicYear = due.getFullYear();

  const assessment = await Assessment.create({
    name: assignment.title,
    schoolId: assignment.schoolId,
    classId,
    subjectId: assignment.subjectId,
    totalMarks: assignment.totalMarks,
    term,
    academicYear,
    type: 'assignment',
    weight: 1,
    date: due,
    paperId: null,
    assignmentId: assignment._id,
    isDeleted: false,
  });

  try {
    await Assignment.updateOne(
      { _id: assignment._id, schoolId: assignment.schoolId },
      {
        $addToSet: {
          assessmentLinks: { classId, assessmentId: assessment._id },
        },
        ...(assignment.assessmentId ? {} : { $set: { assessmentId: assessment._id } }),
      },
    );
  } catch (err: unknown) {
    try {
      await Assessment.deleteOne({ _id: assessment._id });
    } catch (delErr: unknown) {
      logger.error(
        { delErr, assessmentId: assessment._id },
        'Assessment rollback failed for assignment',
      );
    }
    throw err;
  }

  return assessment._id as mongoose.Types.ObjectId;
}

export async function publishAssignmentGrade(
  submission: {
    _id: mongoose.Types.ObjectId;
    studentId: mongoose.Types.ObjectId;
    schoolId: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    totalMark?: number;
  },
  assignment: IAssignment,
): Promise<void> {
  if (submission.totalMark === undefined) return;

  const assessmentId = await findOrCreateAssessmentForAssignment(assignment, submission.classId);
  const percentage =
    assignment.totalMarks > 0
      ? Math.round((submission.totalMark / assignment.totalMarks) * 100)
      : 0;

  await Mark.findOneAndUpdate(
    { assessmentId, studentId: submission.studentId, schoolId: submission.schoolId },
    {
      $set: {
        mark: submission.totalMark,
        total: assignment.totalMarks,
        percentage,
        isAbsent: false,
        isDeleted: false,
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
}
