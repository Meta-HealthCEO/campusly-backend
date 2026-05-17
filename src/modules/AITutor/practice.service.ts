import { PracticeAttempt, IPracticeAttempt, IPracticeQuestion } from './model.js';
import { AIUsageLog } from '../AITools/model.js';
import { AIService } from '../../services/ai.service.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type { GeneratePracticeInput, SubmitPracticeInput } from './validation.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

interface AIGeneratedQuestion {
  questionText: string;
  questionType: 'mcq' | 'short_answer' | 'true_false';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
}

interface GradedShortAnswer {
  isCorrect: boolean;
  marksAwarded: number;
  feedback: string;
}

/**
 * Normalize a user-typed answer for exact-match grading (MCQ, true/false).
 * Lower-cases, trims, collapses whitespace.
 */
function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Ask Claude to grade a short-answer question, returning partial credit and
 * feedback. Falls back to strict string match if the model misbehaves.
 */
async function gradeShortAnswer(question: {
  questionText: string;
  correctAnswer: string;
  studentAnswer: string;
  marks: number;
}): Promise<GradedShortAnswer> {
  const systemPrompt = [
    'You are grading a single short-answer practice question for a school student.',
    'You will be given: the question, the correct answer (rubric), the student\'s answer, and the marks available.',
    'Decide how many marks to award.',
    'Be lenient on phrasing/spelling and strict on the underlying concept.',
    'Award partial credit when the student is partly right.',
    'Respond ONLY with JSON: { "marksAwarded": number, "isCorrect": boolean, "feedback": string }',
    '`marksAwarded` must be between 0 and the total marks available (inclusive).',
    '`isCorrect` is true ONLY when marksAwarded equals the total marks available.',
    '`feedback` is one short sentence the student can read.',
  ].join('\n');

  const userPrompt = JSON.stringify({
    question: question.questionText,
    correctAnswer: question.correctAnswer,
    studentAnswer: question.studentAnswer,
    marksAvailable: question.marks,
  });

  try {
    const { data } = await AIService.generateJSONWithUsage<{
      marksAwarded: number;
      isCorrect: boolean;
      feedback: string;
    }>(systemPrompt, userPrompt);

    const clamped = Math.max(
      0,
      Math.min(question.marks, Math.round(Number(data.marksAwarded) || 0)),
    );
    return {
      marksAwarded: clamped,
      isCorrect: data.isCorrect === true && clamped === question.marks,
      feedback: typeof data.feedback === 'string' ? data.feedback : '',
    };
  } catch (err: unknown) {
    logger.warn(
      { err: err instanceof Error ? err.message : String(err) },
      '[PracticeService] LLM grading failed, falling back to strict match',
    );
    const strict = normalize(question.studentAnswer) === normalize(question.correctAnswer);
    return {
      isCorrect: strict,
      marksAwarded: strict ? question.marks : 0,
      feedback: strict ? 'Correct.' : 'Not quite — check the model answer.',
    };
  }
}

export class PracticeService {
  // ─── Generate Practice ───────────────────────────────────────────────────

  static async generatePractice(
    userId: string,
    schoolId: string,
    input: GeneratePracticeInput,
  ): Promise<IPracticeAttempt> {
    const systemPrompt = [
      `You are a CAPS-aligned question generator for Grade ${input.grade} ${input.subjectName}.`,
      `Generate exactly ${input.questionCount} practice questions on the topic "${input.topic}".`,
      `Difficulty: ${input.difficulty}.`,
      `Allowed question types: ${input.questionTypes.join(', ')}.`,
      'For MCQ questions, provide exactly 4 options.',
      'For true_false questions, the correctAnswer must be "True" or "False".',
      'Each question should have a clear explanation of the correct answer.',
      'Return a JSON array of question objects.',
    ].join('\n');

    const userPrompt = [
      `Generate ${input.questionCount} ${input.difficulty} practice questions`,
      `for Grade ${input.grade} ${input.subjectName} on "${input.topic}".`,
      'JSON format: [{ questionText, questionType, options?, correctAnswer, explanation, marks }]',
    ].join(' ');

    const { data: questions, usage } = await AIService.generateJSONWithUsage<AIGeneratedQuestion[]>(
      systemPrompt,
      userPrompt,
    );

    const validQuestions: IPracticeQuestion[] = questions.map((q: AIGeneratedQuestion) => ({
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      marks: q.marks ?? 1,
    }));

    const totalMarks = validQuestions.reduce((sum, q) => sum + q.marks, 0);

    const attempt = await PracticeAttempt.create({
      schoolId,
      studentId: userId,
      subjectId: input.subjectId,
      topic: input.topic,
      grade: input.grade,
      questions: validQuestions,
      totalMarks,
    });

    await AIUsageLog.create({
      schoolId,
      teacherId: userId,
      type: 'tutor_practice',
      tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      aiModel: ANTHROPIC_MODEL,
    });

    return attempt;
  }

  // ─── Submit Practice ─────────────────────────────────────────────────────

  static async submitPractice(
    userId: string,
    schoolId: string,
    input: SubmitPracticeInput,
  ): Promise<IPracticeAttempt> {
    const attempt = await PracticeAttempt.findOne({
      _id: input.attemptId,
      schoolId,
      studentId: userId,
      isDeleted: false,
    });

    if (!attempt) throw new NotFoundError('Practice attempt not found');
    if (attempt.completedAt) throw new BadRequestError('Practice already completed');

    // Grade each answer. MCQ and true/false use exact match; short answers
    // are graded by Claude with partial credit + feedback.
    const gradingPromises: Promise<void>[] = [];

    for (const answer of input.answers) {
      if (answer.questionIndex < 0 || answer.questionIndex >= attempt.questions.length) {
        continue;
      }
      const question = attempt.questions[answer.questionIndex];
      question.studentAnswer = answer.answer;

      if (question.questionType === 'short_answer') {
        gradingPromises.push(
          gradeShortAnswer({
            questionText: question.questionText,
            correctAnswer: question.correctAnswer,
            studentAnswer: answer.answer,
            marks: question.marks,
          }).then((graded) => {
            question.isCorrect = graded.isCorrect;
            question.marksAwarded = graded.marksAwarded;
            question.feedback = graded.feedback;
          }),
        );
      } else {
        const isCorrect = normalize(answer.answer) === normalize(question.correctAnswer);
        question.isCorrect = isCorrect;
        question.marksAwarded = isCorrect ? question.marks : 0;
      }
    }

    await Promise.all(gradingPromises);

    attempt.score = attempt.questions.reduce(
      (sum, q) => sum + (q.marksAwarded ?? (q.isCorrect ? q.marks : 0)),
      0,
    );
    attempt.completedAt = new Date();

    await attempt.save();
    return attempt;
  }
}
