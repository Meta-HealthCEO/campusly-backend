import mongoose from 'mongoose';
import { Mark } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { Attendance } from '../Attendance/model.js';
import { Merit } from '../Attendance/model.js';
import { AIUsageLog } from '../AITools/model.js';
import { AIService } from '../../services/ai.service.js';
import { NotFoundError } from '../../common/errors.js';
import { ReportComment } from './model-report-comments.js';
import type { IReportComment } from './model-report-comments.js';
import type { GenerateReportCommentsInput } from './validation.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

interface ReportCommentResult {
  id: string;
  studentId: string;
  studentName: string;
  comment: string;
  wasEdited: boolean;
}

const toneGuidance: Record<'encouraging' | 'balanced' | 'formal', string> = {
  encouraging: 'Be warm and growth-oriented. Lead with strengths, frame areas for improvement as opportunities.',
  balanced: 'Be even-handed. Acknowledge what is going well AND what needs work, in roughly equal measure.',
  formal: 'Be professional and objective. Focus on observable performance, minimal emotional framing.',
};

export class ReportService {
  static async generateReportComments(
    teacherId: string,
    schoolId: string,
    input: GenerateReportCommentsInput,
  ): Promise<ReportCommentResult[]> {
    const results: ReportCommentResult[] = [];

    for (const studentId of input.studentIds) {
      // Fetch student details
      const student = await Student.findOne({
        _id: studentId,
        schoolId,
        isDeleted: false,
      })
        .populate('userId', 'firstName lastName')
        .lean();

      if (!student) continue;

      const studentUser = student.userId as unknown as Record<string, unknown> | null;
      const studentName = studentUser
        ? `${studentUser.firstName} ${studentUser.lastName}`
        : 'Student';

      // Fetch marks for the subject/term
      const marks = await Mark.find({
        studentId,
        schoolId,
        isDeleted: false,
      })
        .populate('assessmentId', 'name type term subjectId totalMarks')
        .lean();

      const termMarks = marks.filter((m) => {
        const assessment = m.assessmentId as unknown as Record<string, unknown> | null;
        return (
          assessment &&
          String(assessment.subjectId) === input.subjectId &&
          assessment.term === input.term
        );
      });

      const marksSummary = termMarks.length > 0
        ? termMarks.map((m) => {
            const assessment = m.assessmentId as unknown as Record<string, unknown> | null;
            return `${assessment?.name ?? 'Assessment'}: ${m.mark}/${m.total} (${m.percentage}%)`;
          }).join('; ')
        : 'No marks recorded for this term';

      const avgPercentage = termMarks.length > 0
        ? Math.round(termMarks.reduce((s, m) => s + m.percentage, 0) / termMarks.length)
        : 0;

      // Attendance stats
      const attendanceCount = await Attendance.countDocuments({
        studentId,
        schoolId,
        isDeleted: false,
      });
      const absentCount = await Attendance.countDocuments({
        studentId,
        schoolId,
        status: 'absent',
        isDeleted: false,
      });

      // Merit count
      const meritCount = await Merit.countDocuments({
        studentId,
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      });

      const systemPrompt = [
        `You are a professional report card comment writer for a South African CAPS school.`,
        `Tone: ${input.tone}. ${toneGuidance[input.tone]}`,
        'Write a single paragraph (2-4 sentences) for a student report card.',
        'Mention specific strengths and areas for improvement based on the data.',
        'Be constructive and professional. Do not include numerical marks.',
      ].join('\n');

      const userPrompt = [
        `Write a Term ${input.term} report comment for ${studentName}.`,
        `Average: ${avgPercentage}%. Marks: ${marksSummary}.`,
        `Attendance: ${attendanceCount} sessions, ${absentCount} absences.`,
        `Merits earned: ${meritCount}.`,
      ].join(' ');

      const { text, usage } = await AIService.generateCompletionWithUsage(
        systemPrompt,
        userPrompt,
      );

      const currentYear = new Date().getFullYear();
      const upserted = await ReportComment.findOneAndUpdate(
        {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          studentId: new mongoose.Types.ObjectId(studentId),
          subjectId: new mongoose.Types.ObjectId(input.subjectId),
          term: input.term,
          academicYear: currentYear,
          isDeleted: false,
        },
        {
          $set: {
            teacherId: new mongoose.Types.ObjectId(teacherId),
            ...(input.classId ? { classId: new mongoose.Types.ObjectId(input.classId) } : {}),
            tone: input.tone,
            aiGenerated: text,
            finalText: text,
            wasEdited: false,
            lastEditedAt: undefined,
            lastEditedBy: undefined,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      results.push({
        id: upserted._id.toString(),
        studentId,
        studentName,
        comment: text,
        wasEdited: false,
      });

      await AIUsageLog.create({
        schoolId,
        teacherId,
        type: 'report_comments',
        tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
        aiModel: ANTHROPIC_MODEL,
      });
    }

    return results;
  }
}

// ─── Standalone service functions for persistence CRUD ───────────────────────

export async function listReportComments(
  schoolId: string,
  filters: {
    classId?: string;
    subjectId?: string;
    term?: number;
    studentId?: string;
    academicYear?: number;
  },
): Promise<IReportComment[]> {
  const query: Record<string, unknown> = {
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  };
  if (filters.classId) query.classId = new mongoose.Types.ObjectId(filters.classId);
  if (filters.subjectId) query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
  if (filters.term) query.term = filters.term;
  if (filters.studentId) query.studentId = new mongoose.Types.ObjectId(filters.studentId);
  if (filters.academicYear) query.academicYear = filters.academicYear;
  return ReportComment.find(query).sort({ createdAt: -1 }).lean() as unknown as Promise<IReportComment[]>;
}

export async function updateReportComment(
  id: string,
  schoolId: string,
  teacherId: string,
  finalText: string,
): Promise<IReportComment> {
  const comment = await ReportComment.findOne({
    _id: new mongoose.Types.ObjectId(id),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!comment) throw new NotFoundError('Report comment not found');
  comment.finalText = finalText;
  comment.wasEdited = true;
  comment.lastEditedAt = new Date();
  comment.lastEditedBy = new mongoose.Types.ObjectId(teacherId);
  await comment.save();
  return comment.toObject() as IReportComment;
}

export async function regenerateReportComment(
  id: string,
  schoolId: string,
  teacherId: string,
): Promise<IReportComment> {
  const existing = await ReportComment.findOne({
    _id: new mongoose.Types.ObjectId(id),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!existing) throw new NotFoundError('Report comment not found');

  await ReportService.generateReportComments(teacherId, schoolId, {
    studentIds: [existing.studentId.toString()],
    classId: existing.classId?.toString(),
    subjectId: existing.subjectId.toString(),
    term: existing.term,
    tone: existing.tone,
  });

  const fresh = await ReportComment.findById(existing._id);
  if (!fresh) throw new NotFoundError('Report comment not found after regenerate');
  return fresh.toObject() as IReportComment;
}

export async function deleteReportComment(
  id: string,
  schoolId: string,
): Promise<void> {
  const comment = await ReportComment.findOne({
    _id: new mongoose.Types.ObjectId(id),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!comment) throw new NotFoundError('Report comment not found');
  comment.isDeleted = true;
  await comment.save();
}
