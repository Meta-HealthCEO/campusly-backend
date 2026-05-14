// src/modules/QuestionBank/service-submissions-student.ts
//
// Student-facing operations on assigned papers: list available tests, fetch
// the paper to take (with answers stripped), start/save/submit a submission,
// and trigger the auto-grade hand-off into the existing markPaperFromText
// pipeline.

import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import type {
  IAssessmentPaper,
  IPaperQuestion,
  IPaperQuestionOption,
  PaperAssignmentMode,
} from './model-papers.js';
import { PaperSubmission, type IPaperSubmission, type ISubmissionAnswer } from './model-submissions.js';
import { Student } from '../Student/model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { markPaperFromText } from '../AITools/service-marking-text.js';
import { logger } from '../../common/logger.js';
import { PaperMarking } from '../AITools/model-marking.js';

function toOid(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);
}

function deriveSubmissionStatus(
  sub: IPaperSubmission | undefined,
  issuedMarkingIds: Set<string>,
): IPaperSubmission['status'] | 'not_started' {
  if (!sub) return 'not_started';
  // Don't show "graded" / "published" until the marking is actually issued
  // to the student. Marking-in-progress should look like "submitted".
  if ((sub.status === 'graded' || sub.status === 'published') && sub.markingId) {
    return issuedMarkingIds.has(String(sub.markingId)) ? sub.status : 'submitted';
  }
  return sub.status;
}

interface StudentContext {
  studentDocId: mongoose.Types.ObjectId;
  studentName: string;
  classId: mongoose.Types.ObjectId | null;
  schoolId: mongoose.Types.ObjectId;
}

interface StudentUserLike {
  firstName?: string;
  lastName?: string;
}

/**
 * Resolve the JWT `user.id` (a User doc id) to the student record + their
 * class. Throws if there's no Student row, the student is unassigned, or
 * the user.id doesn't belong to a student.
 */
export async function resolveStudentContext(
  userId: string,
  schoolId: string,
): Promise<StudentContext> {
  const student = await Student.findOne({
    userId: toOid(userId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  })
    .populate<{ userId: StudentUserLike }>('userId', 'firstName lastName')
    .lean();
  if (!student) throw new NotFoundError('Student record not found for this user');
  const firstName = student.userId?.firstName ?? '';
  const lastName = student.userId?.lastName ?? '';
  return {
    studentDocId: student._id as mongoose.Types.ObjectId,
    studentName: `${firstName} ${lastName}`.trim() || (student.admissionNumber ?? 'Student'),
    classId: student.classId ? toOid(String(student.classId)) : null,
    schoolId: toOid(schoolId),
  };
}

export interface AssignedPaperSummary {
  paperId: string;
  assignmentId: string;
  title: string;
  subjectName: string;
  gradeName: string;
  term: number;
  totalMarks: number;
  duration: number;
  mode: PaperAssignmentMode;
  releaseAt: string | null;
  dueAt: string | null;
  submissionStatus: IPaperSubmission['status'] | 'not_started';
  submissionId: string | null;
  submittedAt: string | null;
}

/**
 * List every digital-mode paper currently assigned to the student's class
 * (paper-mode assignments are excluded — those are printed copies). Joins
 * each assignment with the student's submission status so the UI can mark
 * "Available / In progress / Submitted / Graded".
 */
export async function listAssignedPapersForStudent(
  ctx: StudentContext,
): Promise<AssignedPaperSummary[]> {
  if (!ctx.classId) return [];

  type PopulatedRef = { _id: mongoose.Types.ObjectId; name?: string };
  const papers = await AssessmentPaper.find({
    schoolId: ctx.schoolId,
    'assignments.classId': ctx.classId,
    isDeleted: false,
    status: 'finalised',
  })
    .populate<{ subjectId: PopulatedRef; gradeId: PopulatedRef }>([
      { path: 'subjectId', select: 'name' },
      { path: 'gradeId', select: 'name' },
    ])
    .lean();

  const paperIds = papers.map((p) => p._id);
  const submissions = await PaperSubmission.find({
    schoolId: ctx.schoolId,
    studentId: ctx.studentDocId,
    paperId: { $in: paperIds },
    isDeleted: false,
  }).lean();
  const subByPaper = new Map<string, IPaperSubmission>(
    submissions.map((s) => [String(s.paperId), s as IPaperSubmission]),
  );

  const markingIds = submissions
    .map((s) => s.markingId)
    .filter((id): id is mongoose.Types.ObjectId => id != null);
  const issuedMarkings = markingIds.length
    ? await PaperMarking.find({ _id: { $in: markingIds }, issuedToStudent: true, isDeleted: false })
        .select('_id')
        .lean()
    : [];
  const issuedSet = new Set(issuedMarkings.map((m) => String(m._id)));

  const result: AssignedPaperSummary[] = [];
  for (const paper of papers) {
    const assignment = paper.assignments?.find(
      (a) => String(a.classId) === String(ctx.classId) && a.mode === 'digital',
    );
    if (!assignment) continue;
    const sub = subByPaper.get(String(paper._id));
    result.push({
      paperId: String(paper._id),
      assignmentId: String(assignment._id),
      title: paper.title,
      subjectName: paper.subjectId?.name ?? '',
      gradeName: paper.gradeId?.name ?? '',
      term: paper.term,
      totalMarks: paper.totalMarks,
      duration: paper.duration,
      mode: assignment.mode,
      releaseAt: assignment.releaseAt ? assignment.releaseAt.toISOString() : null,
      dueAt: assignment.dueAt ? assignment.dueAt.toISOString() : null,
      submissionStatus: deriveSubmissionStatus(sub, issuedSet),
      submissionId: sub ? String(sub._id) : null,
      submittedAt: sub?.submittedAt ? sub.submittedAt.toISOString() : null,
    });
  }
  return result;
}

interface StudentPaperOption { label: string; text: string }
interface StudentPaperQuestion {
  questionNumber: string;
  questionText: string;
  marks: number;
  type: string;
  options: StudentPaperOption[];
  diagramSvgUrl: string | null;
}
interface StudentPaperSection {
  title: string;
  instructions: string;
  questions: StudentPaperQuestion[];
}
export interface StudentPaperView {
  paperId: string;
  title: string;
  subjectName: string;
  gradeName: string;
  term: number;
  totalMarks: number;
  duration: number;
  paperVersion: number;
  sections: StudentPaperSection[];
}

/**
 * Build a student-safe view of the paper: strip modelAnswer, markingGuideline,
 * and option.isCorrect so the student can't peek at the memo via DevTools.
 */
export async function getStudentPaperView(
  paperId: string,
  ctx: StudentContext,
): Promise<StudentPaperView> {
  if (!ctx.classId) throw new BadRequestError('Student is not assigned to a class');

  type PopulatedRef = { _id: mongoose.Types.ObjectId; name?: string };
  const paper = await AssessmentPaper.findOne({
    _id: toOid(paperId),
    schoolId: ctx.schoolId,
    isDeleted: false,
    status: 'finalised',
  })
    .populate<{ subjectId: PopulatedRef; gradeId: PopulatedRef }>([
      { path: 'subjectId', select: 'name' },
      { path: 'gradeId', select: 'name' },
    ])
    .lean();

  if (!paper) throw new NotFoundError('Paper not found');
  const assignedToClass = paper.assignments?.some(
    (a) => String(a.classId) === String(ctx.classId) && a.mode === 'digital',
  );
  if (!assignedToClass) {
    throw new NotFoundError('Paper is not assigned to this class for digital take');
  }

  return {
    paperId: String(paper._id),
    title: paper.title,
    subjectName: paper.subjectId?.name ?? '',
    gradeName: paper.gradeId?.name ?? '',
    term: paper.term,
    totalMarks: paper.totalMarks,
    duration: paper.duration,
    paperVersion: paper.version,
    sections: paper.sections.map((section, sectionIdx) => ({
      title: section.title,
      instructions: section.instructions ?? '',
      questions: section.questions.map((q: IPaperQuestion) => ({
        questionNumber: `${sectionIdx + 1}.${q.position + 1}`,
        questionText: q.questionText ?? '',
        marks: q.marks,
        type: detectQuestionType(q),
        options: (q.options ?? []).map((o: IPaperQuestionOption) => ({
          label: o.label, text: o.text,
        })),
        diagramSvgUrl: q.diagram?.svgUrl ?? null,
      })),
    })),
  };
}

function detectQuestionType(q: IPaperQuestion): string {
  if (q.options && q.options.length > 0) return 'mcq';
  return 'open';
}

export type { IAssessmentPaper };

interface SubmissionResult {
  submissionId: string;
  status: IPaperSubmission['status'];
  answers: ISubmissionAnswer[];
  markingId: string | null;
}

export async function startSubmission(
  paperId: string,
  ctx: StudentContext,
): Promise<SubmissionResult> {
  if (!ctx.classId) throw new BadRequestError('Student is not assigned to a class');
  // Find-or-create — students can resume an in-progress submission.
  const existing = await PaperSubmission.findOne({
    paperId: toOid(paperId),
    studentId: ctx.studentDocId,
    isDeleted: false,
  });
  if (existing) {
    if (existing.status === 'in_progress') return toSubmissionResult(existing);
    throw new BadRequestError('You have already submitted this paper.');
  }

  const paper = await AssessmentPaper.findOne({
    _id: toOid(paperId),
    schoolId: ctx.schoolId,
    isDeleted: false,
    status: 'finalised',
  }).select('version assignments').lean();
  if (!paper) throw new NotFoundError('Paper not found');
  const assignment = paper.assignments?.find(
    (a) => String(a.classId) === String(ctx.classId) && a.mode === 'digital',
  );
  if (!assignment) throw new NotFoundError('Paper is not assigned to this class for digital take');

  const created = await PaperSubmission.create({
    paperId: toOid(paperId),
    assignmentId: assignment._id,
    schoolId: ctx.schoolId,
    classId: ctx.classId,
    studentId: ctx.studentDocId,
    studentName: ctx.studentName,
    paperVersion: paper.version,
    answers: [],
    status: 'in_progress',
  });
  return toSubmissionResult(created);
}

interface SaveAnswersInput {
  answers: Array<{ questionNumber: string; answer: string; selectedOption?: string | null }>;
}

export async function saveSubmissionAnswers(
  submissionId: string,
  ctx: StudentContext,
  input: SaveAnswersInput,
): Promise<SubmissionResult> {
  const sub = await loadOwnedInProgress(submissionId, ctx);
  sub.answers = input.answers.map((a) => ({
    questionNumber: a.questionNumber,
    answer: a.answer ?? '',
    selectedOption: a.selectedOption ?? null,
  }));
  sub.lastSavedAt = new Date();
  await sub.save();
  return toSubmissionResult(sub);
}

/**
 * Finalise the submission and kick off auto-grading. Marking is fire-and-
 * forget — we don't await the AI call because it can take 30+ seconds; the
 * student gets an immediate "submitted" response and the teacher sees a
 * marking row appear shortly after.
 */
export async function submitSubmission(
  submissionId: string,
  teacherIdForMarking: string,
  ctx: StudentContext,
): Promise<SubmissionResult> {
  const sub = await loadOwnedInProgress(submissionId, ctx);
  sub.status = 'submitted';
  sub.submittedAt = new Date();
  await sub.save();

  // Fire-and-forget AI marking. We pass the assigning teacher as the marker
  // (the paper's createdBy) so audit trails point at a real teacher.
  void runAutoGrade(sub, teacherIdForMarking).catch((err) => {
    logger.error({ err, submissionId }, '[submissions] auto-grade failed');
  });

  return toSubmissionResult(sub);
}

async function runAutoGrade(sub: IPaperSubmission, teacherId: string): Promise<void> {
  if (sub.answers.length === 0) return;
  const result = await markPaperFromText(teacherId, String(sub.schoolId), {
    paperId: String(sub.paperId),
    paperType: 'assessment',
    studentName: sub.studentName,
    studentId: String(sub.studentId),
    classId: String(sub.classId),
    answers: sub.answers.map((a) => ({
      questionNumber: a.questionNumber,
      // MCQ answers come through as selectedOption — render as the label
      // so the AI prompt matches the memo's option-letter format.
      answer: a.selectedOption ? `${a.selectedOption}` : a.answer,
    })),
  });
  await PaperSubmission.updateOne(
    { _id: sub._id },
    { $set: { markingId: toOid(result.id), status: 'graded' } },
  );
}

async function loadOwnedInProgress(
  submissionId: string,
  ctx: StudentContext,
): Promise<IPaperSubmission> {
  const sub = await PaperSubmission.findOne({
    _id: toOid(submissionId),
    schoolId: ctx.schoolId,
    studentId: ctx.studentDocId,
    isDeleted: false,
  });
  if (!sub) throw new NotFoundError('Submission not found');
  if (sub.status !== 'in_progress') {
    throw new BadRequestError(`This submission is already ${sub.status}.`);
  }
  return sub;
}

function toSubmissionResult(sub: IPaperSubmission): SubmissionResult {
  return {
    submissionId: String(sub._id),
    status: sub.status,
    answers: sub.answers,
    markingId: sub.markingId ? String(sub.markingId) : null,
  };
}
