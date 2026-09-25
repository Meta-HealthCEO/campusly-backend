// src/modules/AITools/service-marking-queries.ts
import mongoose from 'mongoose';
import { PaperMarking, type IPaperMarking } from './model-marking.js';
import { AssessmentPaper } from '../QuestionBank/model.js';
import { PaperSubmission } from '../QuestionBank/model-submissions.js';
import { Assessment } from '../Academic/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import {
  publishMarkToGradebook,
  findOrCreateAssessmentForPaper,
} from '../Academic/service-gradebook-publish.js';
import { Student } from '../Student/model.js';
import { NotificationService } from '../Notification/service.js';
import { Notification } from '../Notification/model.js';
import { safeEvidence } from '../Evidence/write-rows.js';
import { syncMarkingEvidence } from '../Evidence/writers/test.js';

export async function listMarkings(
  schoolId: string,
  filters: { paperId?: string; studentId?: string; status?: string },
  page = 1,
  limit = 20,
): Promise<{ markings: IPaperMarking[]; total: number }> {
  const query: Record<string, unknown> = {
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  };
  if (filters.paperId) query.paperId = new mongoose.Types.ObjectId(filters.paperId);
  if (filters.studentId) query.studentId = new mongoose.Types.ObjectId(filters.studentId);
  if (filters.status) query.status = filters.status;

  const [markings, total] = await Promise.all([
    PaperMarking.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    PaperMarking.countDocuments(query),
  ]);
  return { markings: markings as IPaperMarking[], total };
}

export async function getMarkingById(id: string, schoolId: string): Promise<IPaperMarking> {
  const marking = await PaperMarking.findOne({
    _id: new mongoose.Types.ObjectId(id),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  }).lean();
  if (!marking) throw new NotFoundError('Marking not found');
  return marking as IPaperMarking;
}

export async function updateMarking(
  id: string,
  schoolId: string,
  updates: {
    questions?: Array<{
      questionNumber: string;
      marksAwarded: number;
      maxMarks: number;
      feedback?: string;
    }>;
    status?: 'completed' | 'needs_review';
  },
): Promise<IPaperMarking> {
  const marking = await PaperMarking.findOne({
    _id: new mongoose.Types.ObjectId(id),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!marking) throw new NotFoundError('Marking not found');
  if (marking.status === 'published') {
    throw new BadRequestError('Cannot edit a published marking');
  }

  if (updates.questions) {
    marking.questions = marking.questions.map((existing) => {
      const override = updates.questions?.find((u) => u.questionNumber === existing.questionNumber);
      if (!override) return existing;
      return {
        ...existing,
        marksAwarded: override.marksAwarded,
        maxMarks: override.maxMarks,
        feedback: override.feedback ?? existing.feedback,
      };
    });
    marking.totalMarks = marking.questions.reduce((s, q) => s + (q.marksAwarded ?? 0), 0);
    marking.maxMarks = marking.questions.reduce((s, q) => s + (q.maxMarks ?? 0), 0);
    marking.percentage = marking.maxMarks > 0
      ? Math.round((marking.totalMarks / marking.maxMarks) * 1000) / 10
      : 0;
  }
  if (updates.status) {
    marking.status = updates.status;
  }
  await marking.save();
  await safeEvidence('marking.update', () => syncMarkingEvidence(marking._id, marking.schoolId));
  return marking.toObject() as IPaperMarking;
}

/** Where an issued mark landed, so the teacher can open that gradebook view. */
export interface GradebookLink {
  assessmentId: string;
  classId: string;
  subjectId: string;
  term: number;
  academicYear: number;
}

async function linkForAssessment(assessmentId: string, schoolId: string): Promise<GradebookLink | null> {
  const a = await Assessment.findOne({
    _id: new mongoose.Types.ObjectId(assessmentId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  }).select('classId subjectId term academicYear').lean();
  if (!a) return null;
  return { assessmentId, classId: String(a.classId), subjectId: String(a.subjectId), term: a.term, academicYear: a.academicYear };
}

export async function issueMarking(
  markingId: string,
  schoolId: string,
  teacherUserId: string,
  assessmentId: string | undefined,
  studentId?: string,
  comment?: string,
): Promise<IPaperMarking & { gradebook: GradebookLink | null }> {
  const marking = await PaperMarking.findOne({
    _id: new mongoose.Types.ObjectId(markingId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!marking) throw new NotFoundError('Marking not found');
  if (
    marking.status !== 'completed' &&
    marking.status !== 'needs_review' &&
    marking.status !== 'published'
  ) {
    throw new BadRequestError('Only completed, needs_review, or published markings can be issued');
  }

  const resolvedStudentId = studentId ?? marking.studentId?.toString();
  if (!resolvedStudentId) {
    throw new BadRequestError(
      'Student ID is required. The marking record has no linked student; provide studentId in the request body.',
    );
  }

  // Lazy auto-link: if no assessmentId was supplied, find or create one
  // from the paper's metadata. Only supported for assessment-bank papers
  // (paperType === 'assessment'); generated papers must pass an explicit
  // assessmentId because they aren't backed by an AssessmentPaper record.
  let resolvedAssessmentId = assessmentId;
  let gradebook: GradebookLink | null = null;
  if (!resolvedAssessmentId) {
    if (marking.paperType !== 'assessment') {
      throw new BadRequestError(
        'Cannot auto-link Assessment for generated papers. Pass assessmentId explicitly.',
      );
    }
    if (!marking.classId) {
      throw new BadRequestError(
        'Cannot auto-link Assessment: marking has no classId. Pass assessmentId explicitly.',
      );
    }
    const paper = await AssessmentPaper.findOne({
      _id: marking.paperId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!paper) throw new NotFoundError('Linked paper not found');
    const linked = await findOrCreateAssessmentForPaper({
      paperId: String(marking.paperId),
      schoolId: String(marking.schoolId),
      classId: String(marking.classId),
      subjectId: String(paper.subjectId),
    });
    resolvedAssessmentId = String(linked._id);
    gradebook = {
      assessmentId: resolvedAssessmentId,
      classId: linked.classId,
      subjectId: linked.subjectId,
      term: linked.term,
      academicYear: linked.academicYear,
    };
  } else {
    gradebook = await linkForAssessment(resolvedAssessmentId, schoolId);
  }

  const totalAwarded = marking.questions.reduce((s, q) => s + (q.marksAwarded ?? 0), 0);

  const mark = await publishMarkToGradebook({
    schoolId,
    assessmentId: resolvedAssessmentId,
    studentId: resolvedStudentId,
    mark: totalAwarded,
    comment: comment ?? `AI-marked paper for ${marking.studentName}`,
  });

  // Claim the first issue atomically, so two issues at once (a double tap,
  // "issue all" beside a single issue) tell the learner only once.
  const issuedAt = new Date();
  const claim = await PaperMarking.updateOne(
    { _id: marking._id, issuedToStudent: { $ne: true } },
    { $set: { issuedToStudent: true, issuedAt } },
  );
  const isFirstIssue = claim.modifiedCount === 1;
  marking.status = 'published';
  marking.issuedToStudent = true;
  marking.issuedBy = new mongoose.Types.ObjectId(teacherUserId);
  if (isFirstIssue) marking.issuedAt = issuedAt;
  if (mark?._id) marking.gradebookEntryId = mark._id as mongoose.Types.ObjectId;
  await marking.save();
  await safeEvidence('marking.issue', () => syncMarkingEvidence(marking._id, marking.schoolId, { studentId: resolvedStudentId }));

  // A digital script is done once its mark is issued.
  await PaperSubmission.updateOne(
    {
      paperId: marking.paperId,
      studentId: new mongoose.Types.ObjectId(resolvedStudentId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    },
    { $set: { status: 'published' } },
  );

  if (isFirstIssue) {
    // Fire-and-forget notification dispatch — failure should not roll back the
    // gradebook publish. The student can still see the marking via their tests
    // page; the notification is a nice-to-have nudge.
    void dispatchIssueNotification(marking, resolvedStudentId).catch((err: unknown) => {
      console.error('Failed to dispatch issue notification', err);
    });
  }

  return Object.assign(marking.toObject() as IPaperMarking, { gradebook });
}

async function dispatchIssueNotification(
  marking: IPaperMarking,
  studentId: string,
): Promise<void> {
  const student = await Student.findOne({
    _id: studentId,
    schoolId: marking.schoolId,
    isDeleted: false,
  })
    .select('userId')
    .lean();
  if (!student?.userId) return;
  const paper = await AssessmentPaper.findOne({
    _id: marking.paperId,
    schoolId: marking.schoolId,
    isDeleted: false,
  })
    .select('title')
    .lean();
  const title = paper?.title ?? marking.studentName;
  // Once per learner per result: a result taken back and issued again (the
  // demo reseed does this) doesn't send the same notice twice.
  const alreadyTold = await Notification.exists({
    recipientId: student.userId,
    schoolId: marking.schoolId,
    'data.entityType': 'marking_result_issued',
    'data.entityId': String(marking._id),
    isDeleted: false,
  });
  if (alreadyTold) return;
  await NotificationService.create({
    recipientId: String(student.userId),
    schoolId: String(marking.schoolId),
    type: 'in_app',
    title: `${title} result available`,
    message: 'Your marked paper is ready to review.',
    data: {
      url: `/student/tests/${String(marking.paperId)}`,
      // The web app follows data.link (ruling R3).
      link: `/student/tests/${String(marking.paperId)}`,
      entityType: 'marking_result_issued',
      entityId: String(marking._id),
    },
  });
}
