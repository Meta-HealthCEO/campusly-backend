import {
  GeneratedPaper,
  IGeneratedPaper,
  GradingJob,
  IGradingJob,
  AIUsageLog,
  IPaperSection,
} from './model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { aiGradingQueue } from '../../jobs/queues.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

interface PaperFilters {
  subject?: string;
  grade?: number;
  status?: string;
}

interface GradingFilters {
  assignmentId?: string;
  studentId?: string;
  status?: string;
}

interface GeneratePaperParams {
  subject: string;
  grade: number;
  term: number;
  topic: string;
  difficulty: string;
  duration: number;
  totalMarks: number;
}

interface AIGeneratedPaper {
  sections: IPaperSection[];
  memorandum: string;
}

interface AIGeneratedQuestion {
  questionNumber: number;
  questionText: string;
  marks: number;
  modelAnswer: string;
  markingGuideline: string;
}

export class AIToolsService {
  static async generatePaper(
    teacherId: string,
    schoolId: string,
    params: GeneratePaperParams,
  ): Promise<IGeneratedPaper> {
    // Create the paper record in "generating" state
    const paper = await GeneratedPaper.create({
      schoolId,
      teacherId,
      ...params,
      sections: [],
      memorandum: '',
      status: 'generating',
    });

    try {
      const systemPrompt = `You are an expert South African CAPS-aligned exam paper generator.
Generate a well-structured exam paper for the following specifications.
Return JSON with this exact structure:
{
  "sections": [
    {
      "sectionLabel": "Section A",
      "questionType": "Multiple Choice",
      "questions": [
        {
          "questionNumber": 1,
          "questionText": "...",
          "marks": 2,
          "modelAnswer": "...",
          "markingGuideline": "..."
        }
      ]
    }
  ],
  "memorandum": "Full marking memorandum text..."
}`;

      const userPrompt = `Generate a ${params.difficulty} difficulty exam paper:
- Subject: ${params.subject}
- Grade: ${params.grade}
- Term: ${params.term}
- Topic: ${params.topic}
- Duration: ${params.duration} minutes
- Total Marks: ${params.totalMarks}

Include a mix of question types (multiple choice, short answer, long answer, structured questions) appropriate for this grade level. Ensure questions are CAPS-aligned and cover key learning outcomes for the topic.`;

      const result = await AIService.generateJSON<AIGeneratedPaper>(systemPrompt, userPrompt);

      paper.sections = result.sections;
      paper.memorandum = result.memorandum;
      paper.status = 'ready';
      await paper.save();

      // Log usage
      await AIUsageLog.create({
        schoolId,
        teacherId,
        type: 'paper_generation',
        tokensUsed: { input: 0, output: 0 }, // Tokens logged by AIService console
        aiModel: ANTHROPIC_MODEL,
      });

      return paper;
    } catch (error) {
      // Clean up on failure
      await GeneratedPaper.findByIdAndDelete(paper._id);
      throw error;
    }
  }

  static async regenerateQuestion(
    paperId: string,
    sectionIndex: number,
    questionIndex: number,
    teacherId: string,
  ): Promise<IGeneratedPaper> {
    const paper = await GeneratedPaper.findOne({ _id: paperId, isDeleted: false });

    if (!paper) throw new NotFoundError('Paper not found');
    if (!paper.sections[sectionIndex]) throw new BadRequestError('Invalid section index');
    if (!paper.sections[sectionIndex].questions[questionIndex]) {
      throw new BadRequestError('Invalid question index');
    }

    const section = paper.sections[sectionIndex];
    const oldQuestion = section.questions[questionIndex];

    const systemPrompt = `You are an expert South African CAPS-aligned exam question generator.
Generate a single replacement question that fits the same section and has the same marks allocation.
Return JSON with this exact structure:
{
  "questionNumber": ${oldQuestion.questionNumber},
  "questionText": "...",
  "marks": ${oldQuestion.marks},
  "modelAnswer": "...",
  "markingGuideline": "..."
}`;

    const userPrompt = `Generate a replacement ${section.questionType} question for:
- Subject: ${paper.subject}
- Grade: ${paper.grade}
- Topic: ${paper.topic}
- Section: ${section.sectionLabel} (${section.questionType})
- Marks: ${oldQuestion.marks}
- Difficulty: ${paper.difficulty}

The question must be different from: "${oldQuestion.questionText}"`;

    const newQuestion = await AIService.generateJSON<AIGeneratedQuestion>(systemPrompt, userPrompt);

    paper.sections[sectionIndex].questions[questionIndex] = newQuestion;
    paper.status = 'edited';
    await paper.save();

    await AIUsageLog.create({
      schoolId: paper.schoolId,
      teacherId,
      type: 'question_regeneration',
      tokensUsed: { input: 0, output: 0 },
      aiModel: ANTHROPIC_MODEL,
    });

    return paper;
  }

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
    const job = await GradingJob.create({
      schoolId,
      teacherId,
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      submissionText: data.submissionText,
      rubric: data.rubric,
      status: 'queued',
    });

    await aiGradingQueue.add('grade-submission', {
      jobId: String(job._id),
      teacherId,
      schoolId,
    });

    return job;
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
    const jobs: IGradingJob[] = [];

    for (const submission of data.submissions) {
      const job = await GradingJob.create({
        schoolId,
        teacherId,
        assignmentId: data.assignmentId,
        studentId: submission.studentId,
        submissionText: submission.submissionText,
        rubric: data.rubric,
        status: 'queued',
      });

      await aiGradingQueue.add('grade-submission', {
        jobId: String(job._id),
        teacherId,
        schoolId,
      });

      jobs.push(job);
    }

    return jobs;
  }

  static async reviewGrade(
    jobId: string,
    teacherOverride: { finalMark: number; teacherNotes: string },
  ): Promise<IGradingJob> {
    const job = await GradingJob.findOne({ _id: jobId, isDeleted: false });

    if (!job) throw new NotFoundError('Grading job not found');
    if (job.status !== 'completed') {
      throw new BadRequestError('Can only review completed grading jobs');
    }

    job.teacherOverride = teacherOverride;
    job.status = 'reviewed';
    await job.save();

    return job;
  }

  static async publishGrade(jobId: string): Promise<IGradingJob> {
    const job = await GradingJob.findOne({ _id: jobId, isDeleted: false });

    if (!job) throw new NotFoundError('Grading job not found');
    if (job.status !== 'completed' && job.status !== 'reviewed') {
      throw new BadRequestError('Can only publish completed or reviewed grading jobs');
    }

    job.status = 'published';
    await job.save();

    return job;
  }

  static async getUsageStats(
    schoolId: string,
    dateRange?: { startDate?: string; endDate?: string },
  ): Promise<{
    totalCalls: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    byType: Array<{ type: string; count: number; inputTokens: number; outputTokens: number }>;
  }> {
    const match: Record<string, unknown> = {
      schoolId: new (await import('mongoose')).Types.ObjectId(schoolId),
    };

    if (dateRange?.startDate || dateRange?.endDate) {
      const dateFilter: Record<string, Date> = {};
      if (dateRange.startDate) dateFilter.$gte = new Date(dateRange.startDate);
      if (dateRange.endDate) dateFilter.$lte = new Date(dateRange.endDate);
      match.createdAt = dateFilter;
    }

    const results = await AIUsageLog.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          inputTokens: { $sum: '$tokensUsed.input' },
          outputTokens: { $sum: '$tokensUsed.output' },
        },
      },
    ]);

    const byType = results.map((r) => ({
      type: r._id as string,
      count: r.count as number,
      inputTokens: r.inputTokens as number,
      outputTokens: r.outputTokens as number,
    }));

    return {
      totalCalls: byType.reduce((sum, t) => sum + t.count, 0),
      totalInputTokens: byType.reduce((sum, t) => sum + t.inputTokens, 0),
      totalOutputTokens: byType.reduce((sum, t) => sum + t.outputTokens, 0),
      byType,
    };
  }

  static async getPapers(
    schoolId: string,
    filters: PaperFilters,
    page?: number,
    limit?: number,
  ): Promise<{ papers: IGeneratedPaper[]; total: number }> {
    const { skip, limit: take } = paginationHelper(page, limit);

    const query: Record<string, unknown> = { schoolId, isDeleted: false };

    if (filters.subject) query.subject = filters.subject;
    if (filters.grade) query.grade = filters.grade;
    if (filters.status) query.status = filters.status;

    const [papers, total] = await Promise.all([
      GeneratedPaper.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .populate('teacherId', 'firstName lastName email'),
      GeneratedPaper.countDocuments(query),
    ]);

    return { papers, total };
  }

  static async getPaperById(id: string): Promise<IGeneratedPaper> {
    const paper = await GeneratedPaper.findOne({ _id: id, isDeleted: false }).populate(
      'teacherId',
      'firstName lastName email',
    );

    if (!paper) throw new NotFoundError('Paper not found');
    return paper;
  }

  static async updatePaper(
    id: string,
    updates: Record<string, unknown>,
  ): Promise<IGeneratedPaper> {
    const paper = await GeneratedPaper.findOne({ _id: id, isDeleted: false });

    if (!paper) throw new NotFoundError('Paper not found');

    Object.assign(paper, updates);
    if (updates.sections || updates.memorandum) {
      paper.status = 'edited';
    }
    await paper.save();

    return paper;
  }

  static async getGradingJobs(
    schoolId: string,
    filters: GradingFilters,
    page?: number,
    limit?: number,
  ): Promise<{ jobs: IGradingJob[]; total: number }> {
    const { skip, limit: take } = paginationHelper(page, limit);

    const query: Record<string, unknown> = { schoolId, isDeleted: false };

    if (filters.assignmentId) query.assignmentId = filters.assignmentId;
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.status) query.status = filters.status;

    const [jobs, total] = await Promise.all([
      GradingJob.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(take)
        .populate('teacherId', 'firstName lastName email')
        .populate('studentId', 'firstName lastName'),
      GradingJob.countDocuments(query),
    ]);

    return { jobs, total };
  }

  static async getGradingJobById(id: string): Promise<IGradingJob> {
    const job = await GradingJob.findOne({ _id: id, isDeleted: false })
      .populate('teacherId', 'firstName lastName email')
      .populate('studentId', 'firstName lastName');

    if (!job) throw new NotFoundError('Grading job not found');
    return job;
  }
}
