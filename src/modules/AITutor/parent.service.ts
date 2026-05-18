import mongoose from 'mongoose';
import { TutorConversation, ITutorConversation, ITutorMessage } from './model.js';
import { Mark } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { Parent } from '../Parent/model.js';
import { Attendance } from '../Attendance/model.js';
import { AIUsageLog } from '../AITools/model.js';
import { AIService } from '../../services/ai.service.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { buildParentSystemPrompt } from './prompts.js';
import { MasteryService } from './mastery.service.js';
import type { ParentChatInput } from './validation.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const MAX_CONTEXT_MESSAGES = 20;

function toAnthropicMessages(
  messages: ITutorMessage[],
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages.map((m) => ({
    role: m.role === 'student' ? 'user' : 'assistant',
    content: m.content,
  }));
}

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
      .populate('grade', 'level')
      .lean();
    if (!student) throw new NotFoundError('Student not found');

    const studentUser = student.userId as unknown as Record<string, unknown> | null;
    const childName = studentUser
      ? `${studentUser.firstName} ${studentUser.lastName}`
      : 'your child';

    const gradeRef = student.gradeId as unknown as Record<string, unknown> | null;
    const childGrade =
      typeof gradeRef?.level === 'number' ? (gradeRef.level as number) : 0;

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
        // studentId here is the OWNER of the conversation (the parent's User._id).
        // The actual child being discussed is recorded in aboutStudentId.
        studentId: userId,
        aboutStudentId: childObjectId,
        subjectId: new mongoose.Types.ObjectId('000000000000000000000000'),
        subjectName: 'General',
        grade: childGrade,
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

    const systemPrompt = buildParentSystemPrompt({
      grade: childGrade,
      subjectName: 'General',
      marksSummary,
      childName,
      attendance: `${attendanceCount} records, ${absentCount} absences`,
    });

    const threadedMessages = [
      ...toAnthropicMessages(conversation.messages.slice(-MAX_CONTEXT_MESSAGES)),
      { role: 'user' as const, content: input.message },
    ];

    const { text, usage } = await AIService.generateChatCompletionWithUsage(
      systemPrompt,
      threadedMessages,
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

  // ─── Child Insights (privacy-respecting) ─────────────────────────────────

  /**
   * Returns a privacy-preserving snapshot of how a child is doing academically:
   * subject-level mastery + the weakest topics. Deliberately excludes any
   * chat content — the parent should never see what the child has asked Aura.
   * Only parents linked to the child via Parent.childrenIds may call this.
   */
  static async getChildInsights(
    parentUserId: string,
    schoolId: string,
    studentId: string,
  ): Promise<{
    childName: string;
    grade: number;
    mastery: Awaited<ReturnType<typeof MasteryService.getMastery>>;
  }> {
    const parent = await Parent.findOne({
      userId: parentUserId,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!parent) throw new NotFoundError('Parent profile not found');

    const childObjectId = new mongoose.Types.ObjectId(studentId);
    const hasChild = parent.childrenIds.some(
      (cid) => cid.toString() === childObjectId.toString(),
    );
    if (!hasChild) throw new ForbiddenError('You are not linked to this student');

    const student = await Student.findOne({
      _id: studentId,
      schoolId,
      isDeleted: false,
    })
      .populate('userId', 'firstName lastName')
      .populate('gradeId', 'level')
      .lean();
    if (!student) throw new NotFoundError('Student not found');

    const studentUser = student.userId as unknown as Record<string, unknown> | null;
    const childName = studentUser
      ? `${studentUser.firstName} ${studentUser.lastName}`
      : 'Your child';
    const gradeRef = student.gradeId as unknown as Record<string, unknown> | null;
    const grade = typeof gradeRef?.level === 'number' ? (gradeRef.level as number) : 0;

    // Mastery service expects the child's user id (it joins on userId → student).
    const childUserId = String(studentUser?._id ?? student.userId);
    const mastery = await MasteryService.getMastery(childUserId, schoolId);

    return { childName, grade, mastery };
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
      aboutStudentId: c.aboutStudentId,
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
