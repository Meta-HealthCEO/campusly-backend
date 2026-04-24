import {
  GeneratedPaper,
  IGeneratedPaper,
  IGradingJob,
  AIUsageLog,
  IPaperSection,
} from './model.js';
import { AIService } from '../../services/ai.service.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { getTemplatesForGrade, formatTemplatesForPrompt } from '../../lib/tikz-templates.js';
import { markPaperFromImages } from './service-marking.js';
import type { MarkPaperResult, MarkPapersPayload } from './service-marking.js';
import { renderSectionDiagrams, renderQuestionDiagram } from './service-paper-diagrams.js';
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
import {
  getUsageStats,
  getPapers,
  getPaperById,
  updatePaper,
} from './service-queries.js';
import { PaperGenerationResponseSchema, PaperQuestionSchema } from './validation-ai.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

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
  diagram: {
    tikz: string;
    data: Record<string, unknown>;
    alt: string;
    svgUrl: string | null;
    hash: string;
    renderStatus: 'pending' | 'rendered' | 'failed';
    renderError: string | null;
  } | null;
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
      const templates = getTemplatesForGrade(params.grade);
      const templateBlock = formatTemplatesForPrompt(templates);

      const diagramInstructions = templateBlock
        ? `\n\nDIAGRAM SUPPORT:
When a question involves geometry, graphs, data representation, shapes, number lines, or coordinate planes, include a "diagram" field on that question with this structure:
{ "tikz": "<TikZ code string>", "data": { "type": "<template_name>", ...parameters }, "alt": "<accessibility description>" }
Use the templates below as reference — adapt placeholder values to fit the question.
If a question is pure algebra, arithmetic, or text-based, omit the "diagram" field entirely (do not set it to null).

Available TikZ templates:
${templateBlock}`
        : '';

      const systemPrompt = `You are an expert South African CAPS-aligned exam paper generator. Your role is to produce assessments that match the rigour, cognitive distribution, and marks calibration that a teaching professional would expect.

COGNITIVE LEVEL WEIGHTING (CAPS Bloom distribution):
- Knowledge & remembering: 20%
- Routine procedure / application: 35%
- Complex procedure / analysis: 30%
- Problem-solving / synthesis & evaluation: 15%

Vary your question stems so this cognitive spread is approximated across the whole paper.

MARKS CALIBRATION:
- 1-2 marks: direct recall or single-step. Keep brief.
- 3-5 marks: 2-3 steps or one short explanation.
- 6-10 marks: multi-part, requires working shown, or one long-answer paragraph.
- 10+ marks: complex structured question with sub-parts OR an extended essay.

Match question depth to marks. Do not give a 10-mark question that only needs a one-word answer.

QUESTION TYPE MIX:
- Follow the sections the user specifies exactly (they choose MCQ / Short / Long / Structured / etc.)
- Within each section, order difficulty easier-to-harder.

PHRASING RULES:
- Use South African English and local context where sensible (names, places, currency in ZAR).
- Language must suit the grade level.
- No trick questions or ambiguous phrasing. A correct answer must be defensible against the memo.

MEMORANDUM:
- Every question gets a concrete model answer and a marking guideline (how partial credit is awarded).
- For structured / long-answer questions, break the guideline into mark allocation per sub-point.

DIAGRAM RULES:
${diagramInstructions}

Return JSON with this exact structure:
{
  "sections": [
    { "sectionLabel": "Section A", "questionType": "Multiple Choice", "questions": [ ... ] }
  ],
  "memorandum": "Full marking memorandum text..."
}
The "diagram" field on a question is optional — only include it when the question benefits from a visual. No markdown, no explanation text, JSON only.`;

      const userPrompt = `Generate a ${params.difficulty} difficulty exam paper:
- Subject: ${params.subject}
- Grade: ${params.grade}
- Term: ${params.term}
- Topic: ${params.topic}
- Duration: ${params.duration} minutes
- Total Marks: ${params.totalMarks}

Include a mix of question types (multiple choice, short answer, long answer, structured questions) appropriate for this grade level. Ensure questions are CAPS-aligned and cover key learning outcomes for the topic.`;

      const { data: result, usage } = await AIService.generateJSONWithUsage<AIGeneratedPaper>(systemPrompt, userPrompt);

      const validation = PaperGenerationResponseSchema.safeParse(result);
      if (!validation.success) {
        const issue = validation.error.issues[0];
        const where = issue?.path.join('.') || '(root)';
        throw new BadRequestError(
          `AI response did not match the expected structure at "${where}": ${issue?.message ?? 'unknown'}. Please try generating again.`,
        );
      }
      const validated = validation.data;

      // Render diagrams for questions that include TikZ code
      await renderSectionDiagrams(validated.sections as IPaperSection[]);

      paper.sections = validated.sections as IPaperSection[];
      paper.memorandum = validated.memorandum;
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
    } catch (err: unknown) {
      // Clean up on failure
      await GeneratedPaper.findByIdAndDelete(paper._id);
      throw err;
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

    const templates = getTemplatesForGrade(paper.grade);
    const templateBlock = formatTemplatesForPrompt(templates);

    const diagramInstructions = templateBlock
      ? `\nIf the question benefits from a visual, include a "diagram" field: { "tikz": "<TikZ code>", "data": { "type": "<template_name>", ... }, "alt": "<description>" }. Otherwise omit "diagram" entirely.\n\nAvailable TikZ templates:\n${templateBlock}`
      : '';

    const systemPrompt = `You are an expert South African CAPS-aligned exam question generator.
Generate a single replacement question that fits the same section and has the same marks allocation.
Return JSON with this exact structure:
{
  "questionNumber": ${oldQuestion.questionNumber},
  "questionText": "...",
  "marks": ${oldQuestion.marks},
  "modelAnswer": "...",
  "markingGuideline": "...",
  "diagram": { "tikz": "...", "data": { "type": "..." }, "alt": "..." }
}
The "diagram" field is optional — only include it when the question benefits from a visual.${diagramInstructions}`;

    const userPrompt = `Generate a replacement ${section.questionType} question for:
- Subject: ${paper.subject}
- Grade: ${paper.grade}
- Topic: ${paper.topic}
- Section: ${section.sectionLabel} (${section.questionType})
- Marks: ${oldQuestion.marks}
- Difficulty: ${paper.difficulty}

The question must be different from: "${oldQuestion.questionText}"`;

    const { data: newQuestion, usage } = await AIService.generateJSONWithUsage<AIGeneratedQuestion>(systemPrompt, userPrompt);

    const qValidation = PaperQuestionSchema.safeParse(newQuestion);
    if (!qValidation.success) {
      const issue = qValidation.error.issues[0];
      const where = issue?.path.join('.') || '(root)';
      throw new BadRequestError(
        `AI response did not match the expected question structure at "${where}": ${issue?.message ?? 'unknown'}. Please try regenerating again.`,
      );
    }
    // Cast to IPaperQuestion: Zod's DiagramSchema is optional (undefined on missing)
    // while IPaperQuestion.diagram is null on missing — structurally compatible at runtime.
    const validatedQuestion = qValidation.data as IPaperSection['questions'][number];

    // Render diagram if the regenerated question includes one
    if (validatedQuestion.diagram && validatedQuestion.diagram.tikz) {
      validatedQuestion.diagram = await renderQuestionDiagram(validatedQuestion.diagram);
    }

    paper.sections[sectionIndex].questions[questionIndex] = validatedQuestion;
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
    teacherOverride: { finalMark: number; teacherNotes: string },
  ): Promise<IGradingJob> {
    return reviewGrade(jobId, schoolId, teacherOverride);
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

  static async getPapers(
    schoolId: string,
    filters: { subject?: string; grade?: number; status?: string },
    page?: number,
    limit?: number,
  ): Promise<{ papers: IGeneratedPaper[]; total: number }> {
    return getPapers(schoolId, filters, page, limit);
  }

  static async getPaperById(id: string, schoolId: string): Promise<IGeneratedPaper> {
    return getPaperById(id, schoolId);
  }

  static async updatePaper(
    id: string,
    schoolId: string,
    updates: Record<string, unknown>,
  ): Promise<IGeneratedPaper> {
    return updatePaper(id, schoolId, updates);
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
