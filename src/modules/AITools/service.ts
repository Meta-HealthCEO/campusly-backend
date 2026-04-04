import {
  GeneratedPaper,
  IGeneratedPaper,
  GradingJob,
  IGradingJob,
  AIUsageLog,
  IPaperSection,
} from './model.js';
import { AssessmentPaper, Question } from '../QuestionBank/model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { aiGradingQueue } from '../../jobs/queues.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6-20250514';

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

interface MarkPaperQuestionResult {
  questionNumber: number;
  studentAnswer: string;
  correctAnswer: string;
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
}

interface MarkPaperResult {
  studentName: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  questions: MarkPaperQuestionResult[];
}

interface MemoQuestion {
  questionNumber: number;
  questionText: string;
  marks: number;
  modelAnswer: string;
  markingGuideline: string;
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

      const { data: result, usage } = await AIService.generateJSONWithUsage<AIGeneratedPaper>(systemPrompt, userPrompt);

      paper.sections = result.sections;
      paper.memorandum = result.memorandum;
      paper.status = 'ready';
      await paper.save();

      // Log usage
      await AIUsageLog.create({
        schoolId,
        teacherId,
        type: 'paper_generation',
        tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
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
    schoolId: string,
  ): Promise<IGeneratedPaper> {
    const paper = await GeneratedPaper.findOne({ _id: paperId, schoolId, isDeleted: false });

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

    const { data: newQuestion, usage } = await AIService.generateJSONWithUsage<AIGeneratedQuestion>(systemPrompt, userPrompt);

    paper.sections[sectionIndex].questions[questionIndex] = newQuestion;
    paper.status = 'edited';
    await paper.save();

    await AIUsageLog.create({
      schoolId: paper.schoolId,
      teacherId,
      type: 'question_regeneration',
      tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
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
    schoolId: string,
    teacherOverride: { finalMark: number; teacherNotes: string },
  ): Promise<IGradingJob> {
    const job = await GradingJob.findOne({ _id: jobId, schoolId, isDeleted: false });

    if (!job) throw new NotFoundError('Grading job not found');
    if (job.status !== 'completed') {
      throw new BadRequestError('Can only review completed grading jobs');
    }

    job.teacherOverride = teacherOverride;
    job.status = 'reviewed';
    await job.save();

    return job;
  }

  static async publishGrade(jobId: string, schoolId: string): Promise<IGradingJob> {
    const job = await GradingJob.findOne({ _id: jobId, schoolId, isDeleted: false });

    if (!job) throw new NotFoundError('Grading job not found');
    if (job.status !== 'completed' && job.status !== 'reviewed') {
      throw new BadRequestError('Can only publish completed or reviewed grading jobs');
    }

    job.status = 'published';
    await job.save();

    return job;
  }

  static async markPaperFromImage(
    teacherId: string,
    schoolId: string,
    data: {
      paperId: string;
      studentName: string;
      image: string;
      imageType: 'image/jpeg' | 'image/png' | 'image/webp';
    },
  ): Promise<MarkPaperResult> {
    // Try GeneratedPaper first, then AssessmentPaper
    let memoQuestions: MemoQuestion[] = [];
    let paperTitle = '';
    let paperMaxMarks = 0;

    const generatedPaper = await GeneratedPaper.findOne({
      _id: data.paperId,
      schoolId,
      isDeleted: false,
    });

    if (generatedPaper) {
      paperTitle = `${generatedPaper.subject} - Grade ${generatedPaper.grade} - ${generatedPaper.topic}`;
      paperMaxMarks = generatedPaper.totalMarks;
      for (const section of generatedPaper.sections) {
        for (const q of section.questions) {
          memoQuestions.push({
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            marks: q.marks,
            modelAnswer: q.modelAnswer,
            markingGuideline: q.markingGuideline,
          });
        }
      }
    } else {
      // Try AssessmentPaper (question-bank paper with refs)
      const assessmentPaper = await AssessmentPaper.findOne({
        _id: data.paperId,
        schoolId,
        isDeleted: false,
      });

      if (!assessmentPaper) {
        throw new NotFoundError('Paper not found');
      }

      paperTitle = assessmentPaper.title;
      paperMaxMarks = assessmentPaper.totalMarks;

      // Collect all questionIds from sections
      const questionIds = assessmentPaper.sections.flatMap(
        (s) => s.questions.map((q) => q.questionId),
      );

      const questions = await Question.find({
        _id: { $in: questionIds },
        isDeleted: false,
      });

      const questionMap = new Map(
        questions.map((q) => [String(q._id), q]),
      );

      for (const section of assessmentPaper.sections) {
        for (const pq of section.questions) {
          const question = questionMap.get(String(pq.questionId));
          if (question) {
            memoQuestions.push({
              questionNumber: parseInt(pq.questionNumber, 10) || memoQuestions.length + 1,
              questionText: question.stem,
              marks: pq.marks,
              modelAnswer: question.answer,
              markingGuideline: question.markingRubric,
            });
          }
        }
      }
    }

    if (memoQuestions.length === 0) {
      throw new BadRequestError('Paper has no questions to mark against');
    }

    // Build the memo text for the prompt
    const memoText = memoQuestions
      .map(
        (q) =>
          `Question ${q.questionNumber} (${q.marks} marks):\n` +
          `  Question: ${q.questionText}\n` +
          `  Correct Answer: ${q.modelAnswer}\n` +
          `  Marking Guideline: ${q.markingGuideline}`,
      )
      .join('\n\n');

    const systemPrompt = `You are marking a South African school test paper. You will be shown a photograph of a student's handwritten answers. Compare each answer against the memo provided. Award marks according to the marking guideline. For partial answers, award partial marks where appropriate. Be fair but accurate.

Return ONLY valid JSON with this exact structure:
{
  "studentName": "${data.studentName}",
  "totalMarks": <number>,
  "maxMarks": ${paperMaxMarks},
  "percentage": <number>,
  "questions": [
    {
      "questionNumber": <number>,
      "studentAnswer": "<what you read from the handwriting>",
      "correctAnswer": "<from the memo>",
      "marksAwarded": <number>,
      "maxMarks": <number>,
      "feedback": "<brief explanation of marks awarded>"
    }
  ]
}

Important:
- Read the handwriting carefully. If you cannot read a word, indicate [illegible].
- Match each visible answer to the corresponding question number.
- If a question appears unanswered, award 0 marks and note "No answer provided".
- The percentage should be calculated as (totalMarks / maxMarks * 100), rounded to 1 decimal.
- Return ONLY JSON. No markdown fences, no explanation.`;

    const userPrompt = `Paper: ${paperTitle}\nTotal Marks: ${paperMaxMarks}\n\nMEMORANDUM:\n${memoText}\n\nPlease read the student's handwritten answers from the attached image and grade them against this memo.`;

    const { text, usage } = await AIService.generateVisionCompletion(
      systemPrompt,
      userPrompt,
      data.image,
      data.imageType,
      { maxTokens: 4096, temperature: 0.2 },
    );

    // Log usage
    await AIUsageLog.create({
      schoolId,
      teacherId,
      type: 'paper_marking',
      tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      aiModel: ANTHROPIC_MODEL,
    });

    // Parse JSON response
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const result = JSON.parse(cleaned) as MarkPaperResult;

    // Ensure studentName matches input
    result.studentName = data.studentName;

    return result;
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

  static async getPaperById(id: string, schoolId: string): Promise<IGeneratedPaper> {
    const paper = await GeneratedPaper.findOne({ _id: id, schoolId, isDeleted: false }).populate(
      'teacherId',
      'firstName lastName email',
    );

    if (!paper) throw new NotFoundError('Paper not found');
    return paper;
  }

  static async updatePaper(
    id: string,
    schoolId: string,
    updates: Record<string, unknown>,
  ): Promise<IGeneratedPaper> {
    const paper = await GeneratedPaper.findOne({ _id: id, schoolId, isDeleted: false });

    if (!paper) throw new NotFoundError('Paper not found');

    // Explicit field assignment to prevent mass-assignment injection
    const allowedFields = ['subject', 'grade', 'topic', 'difficulty', 'duration', 'totalMarks', 'sections', 'memorandum'] as const;
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        (paper as unknown as Record<string, unknown>)[field] = updates[field];
      }
    }
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

  static async getGradingJobById(id: string, schoolId: string): Promise<IGradingJob> {
    const job = await GradingJob.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('teacherId', 'firstName lastName email')
      .populate('studentId', 'firstName lastName');

    if (!job) throw new NotFoundError('Grading job not found');
    return job;
  }
}
