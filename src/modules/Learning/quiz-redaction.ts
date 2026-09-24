/** Roles that write and mark quizzes, and so may see the right answers. */
const ANSWER_VIEWERS = new Set(['teacher', 'school_admin', 'super_admin']);

interface QuizQuestionLike {
  options?: Array<{ text: string; isCorrect?: boolean }>;
  correctAnswer?: string;
  explanation?: string;
  [key: string]: unknown;
}

function withoutAnswer(question: QuizQuestionLike): QuizQuestionLike {
  const { correctAnswer: _answer, explanation: _explanation, options, ...rest } = question;
  return { ...rest, options: (options ?? []).map((o) => ({ text: o.text })) };
}

/** A quiz as the viewer may see it: learners and parents never get the right answers. */
export function quizForViewer<T>(quiz: T, role: string | undefined): T {
  if (role && ANSWER_VIEWERS.has(role)) return quiz;
  const record = quiz as unknown as { questions?: QuizQuestionLike[] };
  if (!Array.isArray(record.questions)) return quiz;
  return { ...record, questions: record.questions.map(withoutAnswer) } as unknown as T;
}
