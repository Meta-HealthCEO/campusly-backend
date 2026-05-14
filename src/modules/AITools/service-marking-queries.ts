// src/modules/AITools/service-marking-queries.ts
import mongoose from 'mongoose';
import { PaperMarking, type IPaperMarking } from './model-marking.js';
import { AssessmentPaper } from '../QuestionBank/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import {
  publishMarkToGradebook,
  findOrCreateAssessmentForPaper,
} from '../Academic/service-gradebook-publish.js';
import { Student } from '../Student/model.js';
import { NotificationService } from '../Notification/service.js';

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
  return marking.toObject() as IPaperMarking;
}

export async function issueMarking(
  markingId: string,
  schoolId: string,
  teacherUserId: string,
  assessmentId: string | undefined,
  studentId?: string,
  comment?: string,
): Promise<IPaperMarking> {
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
  }

  const totalAwarded = marking.questions.reduce((s, q) => s + (q.marksAwarded ?? 0), 0);

  await publishMarkToGradebook({
    schoolId,
    assessmentId: resolvedAssessmentId,
    studentId: resolvedStudentId,
    mark: totalAwarded,
    comment: comment ?? `AI-marked paper for ${marking.studentName}`,
  });

  const wasIssuedBefore = marking.issuedToStudent === true;
  marking.status = 'published';
  marking.issuedToStudent = true;
  marking.issuedBy = new mongoose.Types.ObjectId(teacherUserId);
  if (!wasIssuedBefore) marking.issuedAt = new Date();
  await marking.save();

  if (!wasIssuedBefore) {
    // Fire-and-forget notification dispatch — failure should not roll back the
    // gradebook publish. The student can still see the marking via their tests
    // page; the notification is a nice-to-have nudge.
    void dispatchIssueNotification(marking, resolvedStudentId).catch((err: unknown) => {
      console.error('Failed to dispatch issue notification', err);
    });
  }

  return marking.toObject() as IPaperMarking;
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
  await NotificationService.create({
    recipientId: String(student.userId),
    schoolId: String(marking.schoolId),
    type: 'in_app',
    title: `${title} result available`,
    message: 'Your marked paper is ready to review.',
    data: { url: `/student/tests/${String(marking.paperId)}`, entityType: 'marking_result_issued' },
  });
}
