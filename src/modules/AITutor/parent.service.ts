import mongoose from 'mongoose';
import { TutorConversation, ITutorConversation } from './model.js';
import { Mark } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';
import { Attendance } from '../Attendance/model.js';
import { AIUsageLog } from '../AITools/model.js';
import { AIService } from '../../services/ai.service.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import type { ParentChatInput } from './validation.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6-20250514';
const MAX_CONTEXT_MESSAGES = 20;

export class ParentService {
  // ─── Parent Chat ─────────────────────────────────────────────────────────

  static async parentChat(
    userId: string,
    schoolId: string,
    input: ParentChatInput,
  ): Promise<ITutorConversation> {
    // Verify parent-student relationship
    const parent = await Parent.findOne({
      userId,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!parent) throw new NotFoundError('Parent profile not found');

    const childObjectId = new mongoose.Types.ObjectId(input.studentId);
    const hasChild = parent.childrenIds.some(
      (cid) => cid.toString() === childObjectId.toString(),
    );
    if (!hasChild) throw new BadRequestError('Student is not linked to this parent');

    // Fetch child data
    const student = await Student.findOne({
      _id: input.studentId,
      schoolId,
      isDeleted: false,
    })
      .populate('userId', 'firstName lastName')
      .lean();
    if (!student) throw new NotFoundError('Student not found');

    const studentUser = student.userId as unknown as Record<string, unknown> | null;
    const childName = studentUser
      ? `${studentUser.firstName} ${studentUser.lastName}`
      : 'your child';

    // Fetch recent marks
    const recentMarks = await Mark.find({
      studentId: input.studentId,
      schoolId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('assessmentId', 'name type totalMarks')
      .lean();

    // Fetch attendance stats
    const [attendanceCount, absentCount] = await Promise.all([
      Attendance.countDocuments({
        studentId: input.studentId,
        schoolId,
        isDeleted: false,
      }),
      Attendance.countDocuments({
        studentId: input.studentId,
        schoolId,
        status: 'absent',
        isDeleted: false,
      }),
    ]);

    let conversation: ITutorConversation | null = null;

    if (input.conversationId) {
      conversation = await TutorConversation.findOne({
        _id: input.conversationId,
        schoolId,
        studentId: userId,
        mode: 'parent',
        isDeleted: false,
      });
      if (!conversation) throw new NotFoundError('Conversation not found');
    } else {
      conversation = await TutorConversation.create({
        schoolId,
        studentId: userId,
        subjectId: new mongoose.Types.ObjectId('000000000000000000000000'),
        subjectName: 'General',
        grade: 0,
        mode: 'parent',
        title: input.message.slice(0, 60),
      });
    }

    const marksSummary = recentMarks.length > 0
      ? recentMarks.map((m) => {
          const assessment = m.assessmentId as unknown as Record<string, unknown> | null;
          return `${assessment?.name ?? 'Assessment'}: ${m.mark}/${m.total} (${m.percentage}%)`;
        }).join('; ')
      : 'No recent marks';

    const systemPrompt = [
      `You are a helpful school advisor speaking with a parent about their child, ${childName}.`,
      'Be professional, clear, and supportive.',
      'Provide actionable advice when relevant.',
      `Child's recent marks: ${marksSummary}`,
      `Attendance: ${attendanceCount} records, ${absentCount} absences.`,
    ].join('\n');

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

    await AIUsageLog.create({
      schoolId,
      teacherId: userId,
      type: 'tutor_chat',
      tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      aiModel: ANTHROPIC_MODEL,
    });

    return conversation;
  }

  // ─── List Parent Conversations ───────────────────────────────────────────

  static async listParentConversations(
    userId: string,
    schoolId: string,
    page?: number,
    limit?: number,
  ): Promise<{ conversations: Record<string, unknown>[]; total: number }> {
    const { skip, limit: lim } = paginationHelper(page, limit);

    const filter = { schoolId, studentId: userId, mode: 'parent', isDeleted: false };
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
      title: c.title,
      messageCount: c.messages.length,
      lastMessageAt: c.messages.length > 0
        ? c.messages[c.messages.length - 1].timestamp
        : c.createdAt,
      createdAt: c.createdAt,
    }));

    return { conversations: projected, total };
  }
}
