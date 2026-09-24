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
    // The exercise marker reads true/false answers as "true" or "false"; other wordings stay multiple choice.
    const truth = q.questionType === 'true_false' ? truthOf(right[0].text) : null;
    if (truth !== null) return { ...base, type: 'true_false', options: [], answer: truth };
    return { ...base, type: 'mcq', options, answer: right[0].text };
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

/**
 * One line of the migration report:
 * 'Fractions → CAPS topic "Common fractions": 8 questions (1 left out), 2 homeworks; 1 lesson still uses the old quiz'.
 * Lessons keep the old quiz until lesson practice questions show for learners.
 */
export function migrationLine(
  quiz: { title: string },
  n: { questions: number; skipped: number; homeworks: number; templates: number; lessons: number },
  topicTitle: string,
): string {
  const parts = [`${count(n.questions, 'question')}${n.skipped > 0 ? ` (${n.skipped} left out)` : ''}`];
  if (n.homeworks > 0) parts.push(count(n.homeworks, 'homework'));
  if (n.templates > 0) parts.push(count(n.templates, 'homework template'));
  const lessons = n.lessons > 0 ? `; ${count(n.lessons, 'lesson')} still ${n.lessons === 1 ? 'uses' : 'use'} the old quiz` : '';
  return `${quiz.title} → CAPS topic "${topicTitle}": ${parts.join(', ')}${lessons}`;
}

const TRUE_WORDS = new Set(['true', 'waar', 'yes', 'ja', 't']);
const FALSE_WORDS = new Set(['false', 'onwaar', 'no', 'nee', 'f']);

function truthOf(text: string): 'true' | 'false' | null {
  const t = text.trim().toLowerCase();
  if (TRUE_WORDS.has(t)) return 'true';
  if (FALSE_WORDS.has(t)) return 'false';
  return null;
}

const NOT_A_TOPIC = new Set(['test', 'quiz', 'term', 'revision', 'grade', 'class', 'week', 'practice', 'homework', 'the', 'and']);

function topicWords(text: string): Set<string> {
  return new Set(text.toLowerCase().split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !NOT_A_TOPIC.has(w))
    .map((w) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w)));
}

/** The CAPS topic a quiz is about: most words in common with its title, then the earliest in the year. */
export function pickTopic(quizTitle: string, topics: Array<{ id: string; title: string; termNumber: number | null; order: number }>): string | null {
  if (topics.length === 0) return null;
  const words = topicWords(quizTitle);
  const scored = topics.map((t) => ({ t, score: [...topicWords(t.title)].filter((w) => words.has(w)).length }));
  scored.sort((a, b) => b.score - a.score || (a.t.termNumber ?? 99) - (b.t.termNumber ?? 99) || a.t.order - b.t.order);
  return scored[0].t.id;
}
