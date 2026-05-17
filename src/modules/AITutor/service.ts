import { TutorConversation, ITutorConversation, ITutorMessage } from './model.js';
import { Mark } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { Homework, HomeworkSubmission } from '../Homework/model.js';
import { AIUsageLog } from '../AITools/model.js';
import { AIService } from '../../services/ai.service.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { buildSystemPrompt, TutorPromptContext } from './prompts.js';
import type { SendMessageInput, BuddyContextInput } from './validation.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const MAX_CONTEXT_MESSAGES = 20;

interface WeakArea {
  subject: string;
  subjectId: string;
  averageMark: number;
  assessmentCount: number;
  recommendation: string;
}

/** Map our internal student/assistant roles → Anthropic user/assistant roles. */
function toAnthropicMessages(
  messages: ITutorMessage[],
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.map((m) => ({
    role: m.role === 'student' ? 'user' : 'assistant',
    content: m.content,
  }));
}

const SURFACE_LABELS: Record<string, string> = {
  homework: 'HOMEWORK',
  lesson: 'LESSON',
  lesson_material: 'LESSON MATERIAL',
  test_review: 'TEST REVIEW (this assessment has been marked)',
  assignment_review: 'ASSIGNMENT REVIEW (this assessment has been marked)',
  free: '',
};

/**
 * Authoritative server-side check: is the surface this Buddy chat is anchored
 * to still an "active" assessment that we must not leak answers for? For
 * homework we look up the actual submission state. For test/assignment review
 * surfaces, the student has already submitted and been marked — those are
 * never active. Other surfaces fall back to the client-provided flag.
 */
async function resolveAssessmentActive(
  _userId: string,
  schoolId: string,
  ctx: BuddyContextInput | undefined,
  studentRecordId: string | null,
): Promise<boolean> {
  if (!ctx) return false;
  if (ctx.surface === 'test_review' || ctx.surface === 'assignment_review') return false;
  if (ctx.surface !== 'homework' || !ctx.surfaceId) {
    return ctx.isAssessmentActive === true;
  }
  if (!studentRecordId) return ctx.isAssessmentActive === true;

  const homework = await Homework.findOne({
    _id: ctx.surfaceId,
    schoolId,
    isDeleted: false,
  })
    .select('status')
    .lean();
  if (!homework) return ctx.isAssessmentActive === true;

  const alreadySubmitted = await HomeworkSubmission.exists({
    homeworkId: homework._id,
    studentId: studentRecordId,
    isDeleted: false,
  });

  return !alreadySubmitted && homework.status === 'assigned';
}

/**
 * Convert the structured BuddyContext into a few lines of natural language for
 * the system prompt. We deliberately trim long fields — the surface context is
 * background, not the primary message.
 */
function formatSurfaceContext(ctx: BuddyContextInput): string | undefined {
  if (!ctx || ctx.surface === 'free') return undefined;

  const label = SURFACE_LABELS[ctx.surface] ?? '';
  const lines: string[] = [];
  if (label) lines.push(`The student is currently on a ${label} page.`);
  if (ctx.title) lines.push(`Title: "${ctx.title.slice(0, 200)}"`);
  if (ctx.questionText) lines.push(`Current question: "${ctx.questionText.slice(0, 800)}"`);
  if (ctx.studentDraft) lines.push(`Student's current draft answer: "${ctx.studentDraft.slice(0, 800)}"`);
  if (ctx.correctAnswer) lines.push(`Correct/expected answer (already revealed to student): "${ctx.correctAnswer.slice(0, 800)}"`);
  if (ctx.teacherFeedback) lines.push(`Teacher feedback on this question: "${ctx.teacherFeedback.slice(0, 500)}"`);
  return lines.length > 0 ? lines.join('\n') : undefined;
}

export class AITutorService {
  // ─── Send Message (Student Chat) ─────────────────────────────────────────

  /**
   * Non-streaming send. Used by clients that haven't migrated to SSE yet.
   * Internally calls the same helpers as the streaming path so behaviour stays
   * in sync.
   */
  static async sendMessage(
    userId: string,
    schoolId: string,
    input: SendMessageInput,
  ): Promise<ITutorConversation> {
    const { conversation, systemPrompt, threadedMessages } =
      await this.prepareSend(userId, schoolId, input);

    // If the student attached an image, route through the vision path. We
    // don't carry the image into future turns; the model sees it once and the
    // text caption is what gets persisted in conversation history.
    if (input.image) {
      const { text, usage } = await AIService.generateVisionCompletionWithImages(
        systemPrompt,
        input.message,
        [{ base64: input.image.base64, mediaType: input.image.mediaType }],
      );
      return this.finalizeSend(
        conversation,
        schoolId,
        userId,
        `${input.message}\n[Photo attached]`,
        text,
        usage,
      );
    }

    const { text, usage } = await AIService.generateChatCompletionWithUsage(
      systemPrompt,
      threadedMessages,
    );

    return this.finalizeSend(conversation, schoolId, userId, input.message, text, usage);
  }

  /**
   * Streaming send. The caller supplies an `onDelta` callback that receives
   * each text chunk as Claude generates it. The conversation is persisted
   * once the stream completes.
   */
  static async streamMessage(
    userId: string,
    schoolId: string,
    input: SendMessageInput,
    onDelta: (chunk: string) => void,
    options?: { signal?: AbortSignal; onConversationReady?: (conv: ITutorConversation) => void },
  ): Promise<ITutorConversation> {
    const { conversation, systemPrompt, threadedMessages } =
      await this.prepareSend(userId, schoolId, input);

    // Surface the conversation id to the caller before streaming starts so the
    // SSE handler can send it as the first event.
    options?.onConversationReady?.(conversation);

    const { text, usage } = await AIService.streamChatCompletion(
      systemPrompt,
      threadedMessages,
      onDelta,
      { signal: options?.signal },
    );

    return this.finalizeSend(conversation, schoolId, userId, input.message, text, usage);
  }

  // ─── Internal helpers shared by streaming and non-streaming sends ────────

  private static async prepareSend(
    userId: string,
    schoolId: string,
    input: SendMessageInput,
  ): Promise<{
    conversation: ITutorConversation;
    systemPrompt: string;
    threadedMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  }> {
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
        surface: input.context?.surface ?? 'free',
        surfaceId: input.context?.surfaceId,
        title: input.message.slice(0, 60),
      });
    }

    const studentRecordId = await this.resolveStudentRecordId(userId, schoolId);

    const recentMarks = studentRecordId
      ? await Mark.find({
          studentId: studentRecordId,
          schoolId,
          isDeleted: false,
        })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('assessmentId', 'name type totalMarks')
          .lean()
      : [];

    const marksSummary = recentMarks.length > 0
      ? recentMarks
          .map((m) => {
            const assessment = m.assessmentId as unknown as Record<string, unknown> | null;
            const name = assessment?.name ?? 'Assessment';
            return `${name}: ${m.mark}/${m.total} (${m.percentage}%)`;
          })
          .join('; ')
      : 'No recent marks available';

    // Server-side safety: don't trust the client's `isAssessmentActive` flag.
    // For homework surfaces we look up the actual submission state. Any other
    // surface defaults to the client-provided flag.
    const serverIsActive = await resolveAssessmentActive(
      userId,
      schoolId,
      input.context,
      studentRecordId,
    );

    const ctx: TutorPromptContext = {
      grade: input.grade,
      subjectName: input.subjectName,
      marksSummary,
      surfaceContext: input.context ? formatSurfaceContext(input.context) : undefined,
      isAssessmentActive: serverIsActive,
    };

    const systemPrompt = buildSystemPrompt(input.mode, ctx);

    const threadedMessages = [
      ...toAnthropicMessages(conversation.messages.slice(-MAX_CONTEXT_MESSAGES)),
      { role: 'user' as const, content: input.message },
    ];

    return { conversation, systemPrompt, threadedMessages };
  }

  private static async finalizeSend(
    conversation: ITutorConversation,
    schoolId: string,
    userId: string,
    studentMessage: string,
    assistantText: string,
    usage: { input_tokens: number; output_tokens: number },
  ): Promise<ITutorConversation> {
    conversation.messages.push(
      {
        role: 'student',
        content: studentMessage,
        timestamp: new Date(),
        tokensUsed: { input: 0, output: 0 },
      },
      {
        role: 'assistant',
        content: assistantText,
        timestamp: new Date(),
        tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      },
    );

    conversation.totalTokens.input += usage.input_tokens;
    conversation.totalTokens.output += usage.output_tokens;

    await conversation.save();

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
      subjectId: c.subjectId,
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
    const studentRecordId = await this.resolveStudentRecordId(userId, schoolId);
    if (!studentRecordId) return [];

    const marks = await Mark.find({
      studentId: studentRecordId,
      schoolId,
      isDeleted: false,
    })
      .populate({
        path: 'assessmentId',
        select: 'name subjectId',
        populate: { path: 'subjectId', select: 'name code' },
      })
      .lean();

    if (marks.length === 0) return [];

    const bySubject = new Map<string, { total: number; count: number; subjectName: string }>();

    for (const m of marks) {
      const assessment = m.assessmentId as unknown as Record<string, unknown> | null;
      if (!assessment?.subjectId) continue;
      const subject = assessment.subjectId as Record<string, unknown>;
      const subjectId = String(subject._id ?? assessment.subjectId);
      const existing = bySubject.get(subjectId) ?? { total: 0, count: 0, subjectName: '' };
      existing.total += m.percentage;
      existing.count += 1;
      existing.subjectName = String(subject.name ?? subject.code ?? existing.subjectName);
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

  private static async resolveStudentRecordId(
    userId: string,
    schoolId: string,
  ): Promise<string | null> {
    const student = await Student.findOne({
      userId,
      schoolId,
      isDeleted: false,
    }).select('_id').lean();

    return student?._id.toString() ?? null;
  }
}
