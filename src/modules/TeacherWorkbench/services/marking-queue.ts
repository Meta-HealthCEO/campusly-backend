// src/modules/TeacherWorkbench/services/marking-queue.ts
// Pure builders for the teacher's marking queue. The DB layer
// (aggregation.service.ts) gathers rows; these functions decide what is
// waiting and where each item opens.

export type QueueMarkingStatus = 'processing' | 'completed' | 'needs_review' | 'failed' | 'published';
export type QueueSubmissionStatus = 'in_progress' | 'submitted' | 'graded' | 'published';

export interface PaperClassInput {
  paperId: string;
  title: string;
  subjectName: string;
  totalMarks: number;
  classId: string;
  className: string;
  mode: 'digital' | 'paper';
  dueAt: Date | null;
  students: Array<{
    studentId: string;
    submissionStatus: QueueSubmissionStatus | null;
    markingStatus: QueueMarkingStatus | null;
    /** A mark for this paper is already in the class's gradebook (typed in, or issued earlier). */
    hasGradebookMark: boolean;
  }>;
}

type QueueStudent = PaperClassInput['students'][number];

export interface MarkingQueueItem {
  id: string;
  type: 'homework' | 'paper';
  title: string;
  subjectName: string;
  className: string;
  dueDate: string;
  totalMarks: number;
  pendingCount: number;
  totalCount: number;
  priority: 'high' | 'medium' | 'low';
  href: string;
  classId?: string;
  paperId?: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function calcPriority(dueDate: Date | null | undefined, now: Date): 'high' | 'medium' | 'low' {
  if (!dueDate) return 'low';
  const days = (dueDate.getTime() - now.getTime()) / DAY_MS;
  if (days < 1) return 'high';
  if (days < 3) return 'medium';
  return 'low';
}

const SUBMITTED: ReadonlySet<QueueSubmissionStatus> = new Set(['submitted', 'graded', 'published']);

/**
 * A learner is done when their latest marking is issued, or when there's no
 * marking and a mark is already in the gradebook (typed in by hand). A marking
 * still waiting to be issued (e.g. a re-mark) keeps them in the queue.
 */
function isDone(s: QueueStudent): boolean {
  if (s.markingStatus === 'published') return true;
  return s.markingStatus === null && s.hasGradebookMark;
}

/** A handwritten paper is written once its due date passes; with no date, once marking has started. */
function isWritten(input: PaperClassInput, now: Date): boolean {
  if (input.dueAt !== null) return input.dueAt.getTime() <= now.getTime();
  return input.students.some((s) => s.markingStatus !== null || s.hasGradebookMark);
}

function waiting(input: PaperClassInput, now: Date): number {
  if (input.mode === 'digital') {
    return input.students.filter((s) => s.submissionStatus !== null && SUBMITTED.has(s.submissionStatus) && !isDone(s)).length;
  }
  if (!isWritten(input, now)) return 0;
  return input.students.filter((s) => !isDone(s)).length;
}

export function paperQueueItems(inputs: PaperClassInput[], now: Date): MarkingQueueItem[] {
  return inputs.flatMap((input) => {
    const pendingCount = waiting(input, now);
    if (pendingCount === 0) return [];
    return [{
      id: `paper:${input.paperId}:${input.classId}`,
      type: 'paper' as const,
      title: input.title,
      subjectName: input.subjectName,
      className: input.className,
      dueDate: input.dueAt ? input.dueAt.toISOString() : '',
      totalMarks: input.totalMarks,
      pendingCount,
      totalCount: input.students.length,
      priority: calcPriority(input.dueAt, now),
      href: `/teacher/papers/${input.paperId}?tab=marking&classId=${input.classId}`,
      classId: input.classId,
      paperId: input.paperId,
    }];
  });
}
