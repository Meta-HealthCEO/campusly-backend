import { PracticeAttempt, IPracticeAttempt, IPracticeQuestion } from './model.js';
import { AIUsageLog } from '../AITools/model.js';
import { AIService } from '../../services/ai.service.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { resolveTutorContext } from './student-context.js';
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
 * Lower-cases, trims, removes option letters, and collapses whitespace.
 */
function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^[a-d][.)]\s*/i, '')
    .replace(/\s+/g, ' ');
}

function sanitizeQuestion(raw: AIGeneratedQuestion): IPracticeQuestion {
  const questionText = String(raw.questionText ?? '').trim();
  const explanation = String(raw.explanation ?? '').trim() || 'Review the relevant concept and try the question again.';
  const marks = Math.max(1, Math.min(10, Math.round(Number(raw.marks) || 1)));
  const allowedTypes = new Set(['mcq', 'short_answer', 'true_false']);
  let questionType: IPracticeQuestion['questionType'] = allowedTypes.has(raw.questionType)
    ? raw.questionType
    : 'short_answer';

  let options = Array.isArray(raw.options)
    ? raw.options.map((option) => String(option).trim()).filter(Boolean)
    : undefined;
  let correctAnswer = String(raw.correctAnswer ?? '').trim();

  if (questionType === 'mcq') {
    if (!options || options.length < 2) {
      questionType = 'short_answer';
      options = undefined;
    } else {
      options = Array.from(new Set(options)).slice(0, 4);
      const letterIndex = /^[a-d]$/i.test(correctAnswer)
        ? correctAnswer.toUpperCase().charCodeAt(0) - 65
        : -1;
      if (letterIndex >= 0 && options[letterIndex]) {
        correctAnswer = options[letterIndex];
      } else {
        const matchingOption = options.find((option) => normalize(option) === normalize(correctAnswer));
        correctAnswer = matchingOption ?? options[0];
      }
    }
  }

  if (questionType === 'true_false') {
    correctAnswer = /^true$/i.test(correctAnswer) ? 'True' : 'False';
    options = undefined;
  }

  return {
    questionText: questionText || 'Answer the question.',
    questionType,
    options,
    correctAnswer: correctAnswer || 'See explanation',
    explanation,
    marks,
  };
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
      feedback: strict ? 'Correct.' : 'Not quite - check the model answer.',
    };
  }
}

export class PracticeService {
  // Generate Practice

  static async generatePractice(
    userId: string,
    schoolId: string,
    input: GeneratePracticeInput,
  ): Promise<IPracticeAttempt> {
    const context = await resolveTutorContext(userId, schoolId, input);
    const systemPrompt = [
      `You are a CAPS-aligned question generator for Grade ${context.grade} ${context.subjectName}.`,
      `Generate exactly ${input.questionCount} practice questions on the topic "${input.topic}".`,
      `Difficulty: ${input.difficulty}.`,
      `Allowed question types: ${input.questionTypes.join(', ')}.`,
      'For MCQ questions, provide exactly 4 options.',
      'For MCQ questions, correctAnswer MUST exactly match one of the option strings. Do not return only "A", "B", "C", or "D".',
      'For true_false questions, the correctAnswer must be "True" or "False".',
      'Each question should have a clear explanation of the correct answer.',
      'Questions must be school-safe and age-appropriate.',
      'Do not use markdown tables in question text.',
      'Return a JSON array of question objects.',
    ].join('\n');

    const userPrompt = [
      `Generate ${input.questionCount} ${input.difficulty} practice questions`,
      `for Grade ${context.grade} ${context.subjectName} on "${input.topic}".`,
      'JSON format: [{ questionText, questionType, options?, correctAnswer, explanation, marks }]',
    ].join(' ');

    const { data: questions, usage } = await AIService.generateJSONWithUsage<AIGeneratedQuestion[]>(
      systemPrompt,
      userPrompt,
    );

    const sourceQuestions = Array.isArray(questions) ? questions : [];
    const validQuestions: IPracticeQuestion[] = sourceQuestions
      .map((q: AIGeneratedQuestion) => sanitizeQuestion(q))
      .filter((q) => q.questionText.trim().length > 0)
      .slice(0, input.questionCount);

    if (validQuestions.length === 0) {
      throw new BadRequestError('AI did not generate usable practice questions. Please try a more specific topic.');
    }

    const totalMarks = validQuestions.reduce((sum, q) => sum + q.marks, 0);

    const attempt = await PracticeAttempt.create({
      schoolId,
      studentId: userId,
      subjectId: context.subjectId,
      topic: input.topic,
      grade: context.grade,
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

  // Submit Practice

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
    // are graded by Claude with partial credit and feedback.
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
