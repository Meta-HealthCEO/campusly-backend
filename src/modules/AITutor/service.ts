import { TutorConversation, ITutorConversation } from './model.js';
import { Mark } from '../Academic/model.js';
import { AIUsageLog } from '../AITools/model.js';
import { AIService } from '../../services/ai.service.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { SendMessageInput } from './validation.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const MAX_CONTEXT_MESSAGES = 20;

interface WeakArea {
  subject: string;
  subjectId: string;
  averageMark: number;
  assessmentCount: number;
  recommendation: string;
}

export class AITutorService {
  // ─── Send Message (Student Chat) ─────────────────────────────────────────

  static async sendMessage(
    userId: string,
    schoolId: string,
    input: SendMessageInput,
  ): Promise<ITutorConversation> {
    let conversation: ITutorConversation | null = null;

    if (input.conversationId) {
      conversation = await TutorConversation.findOne({
        _id: input.conversationId,
        schoolId,
        studentId: userId,
        isDeleted: false,
      });
      if (!conversation) throw new NotFoundError('Conversation not found');
    } else {
      conversation = await TutorConversation.create({
        schoolId,
        studentId: userId,
        subjectId: input.subjectId,
        subjectName: input.subjectName,
        grade: input.grade,
        mode: input.mode,
        title: input.message.slice(0, 60),
      });
    }

    // Fetch recent marks for context
    const recentMarks = await Mark.find({
      studentId: userId,
      schoolId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('assessmentId', 'name type totalMarks')
      .lean();

    const marksSummary = recentMarks.length > 0
      ? recentMarks.map((m) => {
          const assessment = m.assessmentId as unknown as Record<string, unknown> | null;
          const name = assessment?.name ?? 'Assessment';
          return `${name}: ${m.mark}/${m.total} (${m.percentage}%)`;
        }).join('; ')
      : 'No recent marks available';

    const systemPrompt = [
      `You are a CAPS-aligned tutor for Grade ${input.grade} ${input.subjectName}.`,
      'Use the Socratic method — guide the student to discover answers, do not give direct answers.',
      'Be age-appropriate, encouraging, and patient.',
      'Never reveal answers to active assessments.',
      `Student's recent academic performance: ${marksSummary}`,
      `Conversation mode: ${conversation.mode}`,
    ].join('\n');

    // Build context from last N messages
    const contextMessages = conversation.messages
      .slice(-MAX_CONTEXT_MESSAGES)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const userPrompt = contextMessages
      ? `${contextMessages}\nstudent: ${input.message}`
      : input.message;

    const { text, usage } = await AIService.generateCompletionWithUsage(
      systemPrompt,
      userPrompt,
    );

    // Push both messages
    conversation.messages.push(
      {
        role: 'student',
        content: input.message,
        timestamp: new Date(),
        tokensUsed: { input: 0, output: 0 },
      },
      {
        role: 'assistant',
        content: text,
        timestamp: new Date(),
        tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      },
    );

    conversation.totalTokens.input += usage.input_tokens;
    conversation.totalTokens.output += usage.output_tokens;

    await conversation.save();

    // Log usage
    await AIUsageLog.create({
      schoolId,
      teacherId: userId,
      type: 'tutor_chat',
      tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      aiModel: ANTHROPIC_MODEL,
    });

    return conversation;
  }

  // ─── List Conversations ──────────────────────────────────────────────────

  static async listConversations(
    userId: string,
    schoolId: string,
    page?: number,
    limit?: number,
  ): Promise<{ conversations: Record<string, unknown>[]; total: number }> {
    const { skip, limit: lim } = paginationHelper(page, limit);

    const filter = { schoolId, studentId: userId, isDeleted: false };
    const [conversations, total] = await Promise.all([
      TutorConversation.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(lim)
        .lean(),
      TutorConversation.countDocuments(filter),
    ]);

    const projected = conversations.map((c) => ({
      id: c._id,
      subjectName: c.subjectName,
      mode: c.mode,
      title: c.title,
      messageCount: c.messages.length,
      lastMessageAt: c.messages.length > 0
        ? c.messages[c.messages.length - 1].timestamp
        : c.createdAt,
      createdAt: c.createdAt,
    }));

    return { conversations: projected, total };
  }

  // ─── Get Conversation ────────────────────────────────────────────────────

  static async getConversation(
    conversationId: string,
    userId: string,
    schoolId: string,
  ): Promise<ITutorConversation> {
    const conversation = await TutorConversation.findOne({
      _id: conversationId,
      schoolId,
      studentId: userId,
      isDeleted: false,
    });
    if (!conversation) throw new NotFoundError('Conversation not found');
    return conversation;
  }

  // ─── Get Weak Areas ──────────────────────────────────────────────────────

  static async getWeakAreas(
    userId: string,
    schoolId: string,
  ): Promise<WeakArea[]> {
    const marks = await Mark.find({
      studentId: userId,
      schoolId,
      isDeleted: false,
    })
      .populate('assessmentId', 'name subjectId')
      .lean();

    if (marks.length === 0) return [];

    // Group by subject
    const bySubject = new Map<string, { total: number; count: number; subjectName: string }>();

    for (const m of marks) {
      const assessment = m.assessmentId as unknown as Record<string, unknown> | null;
      if (!assessment?.subjectId) continue;
      const subjectId = String(assessment.subjectId);
      const existing = bySubject.get(subjectId) ?? { total: 0, count: 0, subjectName: '' };
      existing.total += m.percentage;
      existing.count += 1;
      bySubject.set(subjectId, existing);
    }

    const weakAreas: WeakArea[] = [];
    for (const [subjectId, data] of bySubject) {
      const avg = data.count > 0 ? data.total / data.count : 0;
      if (avg < 60) {
        let recommendation = 'Focus on revision and practice exercises.';
        if (avg < 40) recommendation = 'Urgent attention needed. Consider extra tutoring sessions.';
        else if (avg < 50) recommendation = 'Significant improvement needed. Review fundamentals.';

        weakAreas.push({
          subject: data.subjectName || 'Unknown',
          subjectId,
          averageMark: Math.round(avg * 10) / 10,
          assessmentCount: data.count,
          recommendation,
        });
      }
    }

    return weakAreas.sort((a, b) => a.averageMark - b.averageMark);
  }
}
