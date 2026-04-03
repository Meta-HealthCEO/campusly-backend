import mongoose from 'mongoose';
import { Question } from './model.js';
import type { IQuestionOption } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import type { GenerateQuestionsInput } from './validation.js';

const DAILY_LIMIT = 20;

export class GenerationService {
  static async generateQuestions(
    schoolId: string,
    userId: string,
    data: GenerateQuestionsInput,
  ) {
    // ── Rate limit: 20 per day per teacher ──
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await Question.countDocuments({
      createdBy: new mongoose.Types.ObjectId(userId),
      source: 'ai_generated',
      createdAt: { $gte: startOfDay },
      isDeleted: false,
    });

    if (todayCount >= DAILY_LIMIT) {
      throw new BadRequestError(
        `Daily AI generation limit reached (${DAILY_LIMIT}/day). Try again tomorrow.`,
      );
    }

    // ── Fetch curriculum node for context ──
    const node = await CurriculumNode.findOne({
      _id: new mongoose.Types.ObjectId(data.curriculumNodeId),
      isDeleted: false,
    }).lean();

    if (!node) throw new NotFoundError('Curriculum node not found');

    // ── Build prompt ──
    const systemPrompt = [
      'You are an expert assessment question creator for South African schools.',
      'You create questions aligned with the CAPS curriculum.',
      'Respond ONLY with a valid JSON array of question objects.',
      'Each object must have: stem (string), options (array of {label, text, isCorrect} for MCQ, empty array otherwise),',
      'answer (string with model answer), markingRubric (string), marks (number).',
      'For MCQ: provide 4 options with labels A-D, exactly one isCorrect: true.',
      'For true_false: provide 2 options with labels "True" and "False".',
      'For other types: leave options as empty array and provide detailed answer and markingRubric.',
    ].join(' ');

    const userPrompt = [
      `Create ${data.count} ${data.type.replace(/_/g, ' ')} question(s) for:`,
      `Topic: ${node.title}${node.description ? ` — ${node.description}` : ''}`,
      `Cognitive level: CAPS ${data.cognitiveLevel.caps}, Blooms ${data.cognitiveLevel.blooms}`,
      `Difficulty: ${data.difficulty}/5`,
      `Each question should be worth appropriate marks for its type and difficulty.`,
    ]
      .filter(Boolean)
      .join('\n');

    // ── Call AI ──
    const aiResponse = await AIService.generateCompletion(systemPrompt, userPrompt, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    // ── Parse response into Question documents ──
    const parsed = parseAIQuestions(aiResponse, data);

    // ── Save all as drafts ──
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);
    const cnoid = new mongoose.Types.ObjectId(data.curriculumNodeId);
    const suboid = new mongoose.Types.ObjectId(data.subjectId);
    const groid = new mongoose.Types.ObjectId(data.gradeId);

    const docs = parsed.map((q) => ({
      curriculumNodeId: cnoid,
      schoolId: soid,
      subjectId: suboid,
      gradeId: groid,
      type: data.type,
      stem: q.stem,
      media: [],
      options: q.options,
      answer: q.answer,
      markingRubric: q.markingRubric,
      marks: q.marks,
      cognitiveLevel: data.cognitiveLevel,
      difficulty: data.difficulty,
      tags: [],
      source: 'ai_generated' as const,
      status: 'draft' as const,
      createdBy: uoid,
    }));

    const questions = await Question.insertMany(docs);
    return questions.map((q) => q.toObject());
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

interface ParsedQuestion {
  stem: string;
  options: IQuestionOption[];
  answer: string;
  markingRubric: string;
  marks: number;
}

function parseAIQuestions(
  response: string,
  data: GenerateQuestionsInput,
): ParsedQuestion[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');

    const parsed: unknown[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) throw new Error('Parsed value is not an array');

    return parsed.map((item: unknown) => {
      const q = item as Record<string, unknown>;

      const options: IQuestionOption[] = Array.isArray(q.options)
        ? (q.options as unknown[]).map((opt: unknown) => {
            const o = opt as Record<string, unknown>;
            return {
              label: typeof o.label === 'string' ? o.label : '',
              text: typeof o.text === 'string' ? o.text : '',
              isCorrect: typeof o.isCorrect === 'boolean' ? o.isCorrect : false,
            };
          })
        : [];

      return {
        stem: typeof q.stem === 'string' ? q.stem : 'Generated question',
        options,
        answer: typeof q.answer === 'string' ? q.answer : '',
        markingRubric: typeof q.markingRubric === 'string' ? q.markingRubric : '',
        marks: typeof q.marks === 'number' && q.marks >= 1 ? q.marks : data.difficulty,
      };
    });
  } catch {
    // Fallback: return a single question wrapping the raw response
    return [
      {
        stem: response.slice(0, 500),
        options: [],
        answer: response,
        markingRubric: '',
        marks: data.difficulty,
      },
    ];
  }
}
