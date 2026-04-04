import crypto from 'crypto';
import mongoose from 'mongoose';
import { ContentResource } from './model.js';
import type { IContentBlock } from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import type { GenerateContentInput } from './validation.js';

const DAILY_LIMIT = 20;

export class GenerationService {
  static async generateContent(
    schoolId: string,
    userId: string,
    data: GenerateContentInput,
  ) {
    // ── Rate limit: 20 per day per teacher ──
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await ContentResource.countDocuments({
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
    const blockTypesStr = data.blockTypes.join(', ');
    const systemPrompt = [
      'You are an expert educational content creator for South African schools.',
      'You create content aligned with the CAPS curriculum.',
      'Respond ONLY with a valid JSON array of content blocks.',
      'Each block must have: blockId (string UUID), type (one of the requested types),',
      'order (integer starting at 0), content (string with the actual content),',
      'points (number, 0 for non-question blocks),',
      'hints (array of strings, empty for non-question blocks),',
      'explanation (string, empty for non-question blocks).',
      'For multiple_choice blocks, use JSON in the content field with question, options array, and correctIndex.',
      'For matching blocks, use JSON in the content field with pairs array of {left, right}.',
    ].join(' ');

    const userPrompt = [
      `Create a ${data.type.replace('_', ' ')} resource for:`,
      `Topic: ${node.title}${node.description ? ` — ${node.description}` : ''}`,
      `Term: ${data.term}`,
      `Difficulty: ${data.difficulty}/5`,
      `Required block types: ${blockTypesStr}`,
      data.instructions ? `Additional instructions: ${data.instructions}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // ── Call AI ──
    const aiResponse = await AIService.generateCompletion(systemPrompt, userPrompt, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    // ── Parse response to blocks ──
    const blocks = parseAIResponseToBlocks(aiResponse, data.blockTypes);

    // ── Save as draft ──
    const resource = await ContentResource.create({
      curriculumNodeId: new mongoose.Types.ObjectId(data.curriculumNodeId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      type: data.type,
      format: 'static',
      title: `${node.title} — ${data.type.replace('_', ' ')}`,
      blocks,
      source: 'ai_generated',
      gradeId: new mongoose.Types.ObjectId(data.gradeId),
      subjectId: new mongoose.Types.ObjectId(data.subjectId),
      term: data.term,
      tags: [],
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
      aiModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6-20250514',
      aiPrompt: userPrompt,
      difficulty: data.difficulty,
      estimatedMinutes: 0,
      prerequisites: [],
    });

    return resource.toObject();
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseAIResponseToBlocks(
  response: string,
  requestedTypes: string[],
): IContentBlock[] {
  try {
    // Try to extract JSON array from the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');

    const parsed: unknown[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) throw new Error('Parsed value is not an array');

    return parsed.map((block: unknown, index: number) => {
      const b = block as Record<string, unknown>;
      return {
        blockId: typeof b.blockId === 'string' ? b.blockId : crypto.randomUUID(),
        type: (typeof b.type === 'string' && requestedTypes.includes(b.type)
          ? b.type
          : requestedTypes[0]) as IContentBlock['type'],
        order: typeof b.order === 'number' ? b.order : index,
        content: typeof b.content === 'string'
          ? b.content
          : JSON.stringify(b.content ?? ''),
        curriculumNodeId: null,
        cognitiveLevel: null,
        points: typeof b.points === 'number' ? b.points : 0,
        hints: Array.isArray(b.hints)
          ? (b.hints as unknown[]).filter((h): h is string => typeof h === 'string')
          : [],
        explanation: typeof b.explanation === 'string' ? b.explanation : '',
        metadata: {},
      };
    });
  } catch {
    // Fallback: wrap entire response as a single text block
    return [
      {
        blockId: crypto.randomUUID(),
        type: 'text',
        order: 0,
        content: response,
        curriculumNodeId: null,
        cognitiveLevel: null,
        points: 0,
        hints: [],
        explanation: '',
        metadata: {},
      },
    ];
  }
}
