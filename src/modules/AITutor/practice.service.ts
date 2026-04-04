import { PracticeAttempt, IPracticeAttempt, IPracticeQuestion } from './model.js';
import { AIUsageLog } from '../AITools/model.js';
import { AIService } from '../../services/ai.service.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
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

    for (const answer of input.answers) {
      if (answer.questionIndex < 0 || answer.questionIndex >= attempt.questions.length) {
        continue;
      }
      const question = attempt.questions[answer.questionIndex];
      question.studentAnswer = answer.answer;
      question.isCorrect =
        answer.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    }

    attempt.score = attempt.questions.reduce(
      (sum, q) => sum + (q.isCorrect ? q.marks : 0),
      0,
    );
    attempt.completedAt = new Date();

    await attempt.save();
    return attempt;
  }
}
