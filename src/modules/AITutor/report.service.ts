import mongoose from 'mongoose';
import { Mark } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import { Attendance } from '../Attendance/model.js';
import { Merit } from '../Attendance/model.js';
import { AIUsageLog } from '../AITools/model.js';
import { AIService } from '../../services/ai.service.js';
import type { GenerateReportCommentsInput } from './validation.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

interface ReportComment {
  studentId: string;
  studentName: string;
  comment: string;
}

export class ReportService {
  static async generateReportComments(
    teacherId: string,
    schoolId: string,
    input: GenerateReportCommentsInput,
  ): Promise<ReportComment[]> {
    const results: ReportComment[] = [];

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
        `Tone: ${input.tone}.`,
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

      results.push({ studentId, studentName, comment: text });

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
