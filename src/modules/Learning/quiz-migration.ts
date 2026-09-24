// src/modules/Learning/quiz-migration.ts
//
// Moving an old Learning quiz into the question bank, the one quiz system:
// its questions become question-bank questions, which homework exercises,
// lesson practice and course quick checks all use. Pure: the script in
// src/scripts/migrate-learning-quizzes.ts does the reading and writing.

import type mongoose from 'mongoose';

type Id = mongoose.Types.ObjectId;
const LABELS = 'ABCDEFGH';
export const MIGRATED_TAG = 'from_learning_quiz';

/** What teachers are told now that nothing new is made with the old Learning quiz. */
export const QUIZZES_RETIRED = 'Quizzes are now made from the question bank. Set homework as an exercise, or add a quick check to a course.';
export const QUIZ_HOMEWORK_RETIRED = 'Quiz homework is now an exercise: pick questions from the question bank.';
export const QUIZ_MATERIAL_RETIRED = 'Add practice questions from the question bank instead of a quiz.';

interface LearningQuizQuestion {
  questionText: string;
  questionType: string;
  options?: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer?: string;
  points: number;
}

export interface QuestionContext {
  schoolId: Id;
  subjectId: Id;
  gradeId: Id;
  curriculumNodeId: Id;
  createdBy: Id;
}

export interface QuestionDoc {
  schoolId: Id;
  subjectId: Id;
  gradeId: Id;
  curriculumNodeId: Id;
  createdBy: Id;
  type: 'mcq' | 'true_false' | 'short_answer';
  stem: string;
  options: Array<{ label: string; text: string; isCorrect: boolean }>;
  answer: string;
  marks: number;
  cognitiveLevel: { caps: string; blooms: string };
  difficulty: number;
  tags: string[];
  source: 'teacher';
  status: 'approved';
  usageCount: number;
  isDeleted: boolean;
}

export interface Skipped { index: number; reason: string }

function toDoc(q: LearningQuizQuestion, ctx: QuestionContext): QuestionDoc | string {
  const base = {
    ...ctx,
    stem: q.questionText.trim(),
    marks: Math.max(1, Math.round(q.points || 1)),
    cognitiveLevel: { caps: 'knowledge', blooms: 'remember' },
    difficulty: 2,
    tags: [MIGRATED_TAG],
    source: 'teacher' as const,
    status: 'approved' as const,
    usageCount: 0,
    isDeleted: false,
  };
  if (q.questionType === 'short_answer') {
    return { ...base, type: 'short_answer', options: [], answer: (q.correctAnswer ?? '').trim() };
  }
  if (q.questionType === 'mcq' || q.questionType === 'true_false') {
    const options = (q.options ?? []).slice(0, LABELS.length).map((o, i) => ({ label: LABELS[i], text: o.text, isCorrect: o.isCorrect === true }));
    const right = options.filter((o) => o.isCorrect);
    if (right.length !== 1) return 'This question has no right answer marked.';
    return { ...base, type: q.questionType, options, answer: right[0].text };
  }
  if (q.questionType === 'matching') return "Matching questions can't move to the question bank yet.";
  return `Questions of type "${q.questionType}" can't move to the question bank.`;
}

/** The quiz's questions as question-bank questions, and those that can't move (with why). */
export function questionsFromQuiz(quiz: { questions: LearningQuizQuestion[] }, ctx: QuestionContext): { docs: QuestionDoc[]; skipped: Skipped[] } {
  const docs: QuestionDoc[] = [];
  const skipped: Skipped[] = [];
  quiz.questions.forEach((q, index) => {
    const doc = toDoc(q, ctx);
    if (typeof doc === 'string') skipped.push({ index, reason: doc });
    else docs.push(doc);
  });
  return { docs, skipped };
}

const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** One line of the migration report: "Fractions: 8 questions (1 left out), 2 homeworks, 1 lesson". */
export function migrationLine(
  quiz: { title: string },
  n: { questions: number; skipped: number; homeworks: number; templates: number; lessons: number },
): string {
  const parts = [`${count(n.questions, 'question')}${n.skipped > 0 ? ` (${n.skipped} left out)` : ''}`];
  if (n.homeworks > 0) parts.push(count(n.homeworks, 'homework'));
  if (n.templates > 0) parts.push(count(n.templates, 'homework template'));
  if (n.lessons > 0) parts.push(count(n.lessons, 'lesson'));
  return `${quiz.title}: ${parts.join(', ')}`;
}
