import { IGradingJob } from './model.js';
import { markPaperFromImages } from './service-marking.js';
import type { MarkPaperResult, MarkPapersPayload } from './service-marking.js';
import {
  gradeSubmission,
  bulkGrade,
  reviewGrade,
  publishGrade,
  retryGrade,
  getGradingJobs,
  getGradingJobById,
  listRubricTemplates,
  createRubricTemplate,
  deleteRubricTemplate,
} from './service-grading.js';
import type { IRubricTemplate } from './model-rubric-templates.js';
import { getUsageStats } from './service-queries.js';

// Paper generation, regeneration, and CRUD have moved to QuestionBank
// (canonical home: /api/question-bank/papers, see service-papers*.ts).
// The corresponding /api/ai-tools/papers routes are 308-redirected; this
// service file now only carries the AI-grading and OCR-marking concerns
// that remain owned by AITools. The legacy `GeneratedPaper` model is kept
// only so the one-shot migration script in scripts/migrate-generated-papers.ts
// can still import it; nothing in the running app touches it.

export class AIToolsService {
  static async gradeSubmission(
    teacherId: string,
    schoolId: string,
    data: {
      assignmentId: string;
      studentId: string;
      submissionText: string;
      rubric: Array<{ criterion: string; maxScore: number; description: string }>;
    },
  ): Promise<IGradingJob> {
    return gradeSubmission(teacherId, schoolId, data);
  }

  static async bulkGrade(
    teacherId: string,
    schoolId: string,
    data: {
      assignmentId: string;
      submissions: Array<{ studentId: string; submissionText: string }>;
      rubric: Array<{ criterion: string; maxScore: number; description: string }>;
    },
  ): Promise<IGradingJob[]> {
    return bulkGrade(teacherId, schoolId, data);
  }

  static async reviewGrade(
    jobId: string,
    schoolId: string,
    data: {
      finalMark?: number;
      teacherNotes: string;
      criteriaScores?: Array<{ criterion: string; score: number; maxScore: number; feedback?: string }>;
    },
  ): Promise<IGradingJob> {
    return reviewGrade(jobId, schoolId, data);
  }

  static async publishGrade(
    jobId: string,
    schoolId: string,
    assessmentId: string,
    comment?: string,
  ): Promise<IGradingJob> {
    return publishGrade(jobId, schoolId, assessmentId, comment);
  }

  static async retryGrade(jobId: string, schoolId: string): Promise<IGradingJob> {
    return retryGrade(jobId, schoolId);
  }

  static async markPaperFromImages(
    teacherId: string,
    schoolId: string,
    payload: MarkPapersPayload,
  ): Promise<MarkPaperResult> {
    return markPaperFromImages(teacherId, schoolId, payload);
  }

  static async getUsageStats(
    schoolId: string,
    dateRange?: { startDate?: string; endDate?: string },
  ) {
    return getUsageStats(schoolId, dateRange);
  }

  static async getGradingJobs(
    schoolId: string,
    filters: { assignmentId?: string; studentId?: string; status?: string },
    page?: number,
    limit?: number,
  ): Promise<{ jobs: IGradingJob[]; total: number }> {
    return getGradingJobs(schoolId, filters, page, limit);
  }

  static async getGradingJobById(id: string, schoolId: string): Promise<IGradingJob> {
    return getGradingJobById(id, schoolId);
  }

  static async listRubricTemplates(
    schoolId: string,
    teacherId: string,
  ): Promise<IRubricTemplate[]> {
    return listRubricTemplates(schoolId, teacherId);
  }

  static async createRubricTemplate(
    schoolId: string,
    teacherId: string,
    data: {
      name: string;
      description?: string;
      criteria: Array<{ criterion: string; maxScore: number; description: string }>;
      isShared?: boolean;
    },
  ): Promise<IRubricTemplate> {
    return createRubricTemplate(schoolId, teacherId, data);
  }

  static async deleteRubricTemplate(
    id: string,
    schoolId: string,
    teacherId: string,
  ): Promise<void> {
    return deleteRubricTemplate(id, schoolId, teacherId);
  }
}
