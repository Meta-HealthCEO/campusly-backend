import mongoose from 'mongoose';
import { logger } from '../../common/logger.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { Question, AssessmentPaper } from './model.js';
import type {
  IAssessmentPaper,
  IPaperQuestion,
  IPaperSection,
  PaperType,
} from './model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import {
  generateAIQuestions,
  type GenerateQuestionType,
} from './service-questions-generation.js';

// ── Public types ───────────────────────────────────────────────────────────
export type SimplePaperType = 'test' | 'exam' | 'assessment';

export interface GeneratePaperSection {
  title: string;
  questionCount: number;
  questionType: GenerateQuestionType;
  instructions?: string;
}

export interface GeneratePaperInput {
  schoolId: string;
  teacherId: string;
  subjectId: string;
  gradeId: string;
  curriculumNodeId: string;
  paperType?: SimplePaperType;
  totalMarks?: number;
  durationMinutes?: number;
  sections?: GeneratePaperSection[];
  topicHint?: string;
  title?: string;
  term?: number;
  year?: number;
}

// ── Defaults ───────────────────────────────────────────────────────────────
const DEFAULT_SECTIONS: GeneratePaperSection[] = [
  { title: 'Section A', questionCount: 5, questionType: 'mcq' },
  { title: 'Section B', questionCount: 3, questionType: 'short_answer' },
  { title: 'Section C', questionCount: 2, questionType: 'structured' },
];

// Map the simple paperType used by the Lesson workspace to the canonical
// PaperType enum on AssessmentPaper.
const PAPER_TYPE_MAP: Record<SimplePaperType, PaperType> = {
  test: 'class_test',
  exam: 'final',
  assessment: 'assignment',
};

function currentTerm(now: Date = new Date()): number {
  // SA school calendar is approximately Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec.
  const month = now.getMonth(); // 0-11
  if (month <= 2) return 1;
  if (month <= 5) return 2;
  if (month <= 8) return 3;
  return 4;
}

// ── Public: AI-driven paper generator ─────────────────────────────────────
export async function generatePaperWithAI(
  input: GeneratePaperInput,
): Promise<IAssessmentPaper> {
  if (!input.schoolId || !input.teacherId || !input.curriculumNodeId) {
    throw new BadRequestError('schoolId, teacherId and curriculumNodeId are required');
  }

  const soid = new mongoose.Types.ObjectId(input.schoolId);
  const cnoid = new mongoose.Types.ObjectId(input.curriculumNodeId);

  // Load the topic for title/context. Allow national or this-school nodes.
  const node = await CurriculumNode.findOne({
    _id: cnoid,
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: soid }],
  })
    .select('title code')
    .lean();
  if (!node) throw new NotFoundError('Curriculum topic not found');

  const sections = input.sections && input.sections.length > 0
    ? input.sections
    : DEFAULT_SECTIONS;

  // ── Phase 1: generate questions for each section ─────────────────────────
  const generatedQuestionIdsPerSection: mongoose.Types.ObjectId[][] = [];
  const allGeneratedIds: mongoose.Types.ObjectId[] = [];
  try {
    for (const section of sections) {
      if (section.questionCount < 1) {
        generatedQuestionIdsPerSection.push([]);
        continue;
      }
      const ids = await generateAIQuestions({
        count: section.questionCount,
        questionTypes: [section.questionType],
        schoolId: input.schoolId,
        teacherId: input.teacherId,
        subjectId: input.subjectId,
        gradeId: input.gradeId,
        curriculumNodeId: input.curriculumNodeId,
        topicHint: input.topicHint,
      });
      generatedQuestionIdsPerSection.push(ids);
      allGeneratedIds.push(...ids);
    }
  } catch (err: unknown) {
    // Rollback every Question we managed to insert before the failure.
    if (allGeneratedIds.length) {
      try {
        await Question.updateMany(
          { _id: { $in: allGeneratedIds } },
          { $set: { isDeleted: true } },
        );
      } catch (delErr: unknown) {
        logger.error(
          { delErr, count: allGeneratedIds.length },
          '[paper-gen] question rollback failed',
        );
      }
    }
    throw err;
  }

  // ── Phase 2: hydrate questions to build paper sections ───────────────────
  const allQuestions = await Question.find({
    _id: { $in: allGeneratedIds },
    isDeleted: false,
  }).lean();
  const byId = new Map<string, (typeof allQuestions)[number]>();
  for (const q of allQuestions) byId.set(String(q._id), q);

  const paperSections: IPaperSection[] = sections.map((section, sIdx) => {
    const ids = generatedQuestionIdsPerSection[sIdx] ?? [];
    const questions: IPaperQuestion[] = ids.map((qid, qIdx) => {
      const q = byId.get(String(qid));
      if (!q) {
        throw new Error(
          `[paper-gen] generated question ${String(qid)} could not be hydrated`,
        );
      }
      return {
        questionId: q._id as mongoose.Types.ObjectId,
        questionText: q.stem,
        options: q.options ?? [],
        marks: q.marks,
        position: qIdx,
        modelAnswer: q.answer ?? null,
        markingGuideline: q.markingRubric ?? null,
        diagram: null,
      };
    });
    return {
      title: section.title,
      instructions: section.instructions ?? '',
      order: sIdx,
      questions,
    };
  });

  const totalMarks = paperSections.reduce(
    (sum, sec) => sum + sec.questions.reduce((acc, q) => acc + q.marks, 0),
    0,
  );

  if (totalMarks === 0) {
    // Cleanup before throwing: nothing usable was generated.
    if (allGeneratedIds.length) {
      try {
        await Question.updateMany(
          { _id: { $in: allGeneratedIds } },
          { $set: { isDeleted: true } },
        );
      } catch (delErr: unknown) {
        logger.error({ delErr }, '[paper-gen] zero-mark cleanup failed');
      }
    }
    throw new Error('AI paper generation produced zero questions');
  }

  // ── Phase 3: assemble the AssessmentPaper ────────────────────────────────
  const paperType: PaperType = PAPER_TYPE_MAP[input.paperType ?? 'test'];
  const now = new Date();
  const term = input.term ?? currentTerm(now);
  const year = input.year ?? now.getFullYear();
  const title = input.title?.trim()
    || `${node.title} - ${paperType.replace(/_/g, ' ')}`;

  let paper: IAssessmentPaper;
  try {
    paper = await AssessmentPaper.create({
      schoolId: soid,
      title,
      subjectId: new mongoose.Types.ObjectId(input.subjectId),
      gradeId: new mongoose.Types.ObjectId(input.gradeId),
      topicIds: [cnoid],
      term,
      year,
      paperType,
      totalMarks: input.totalMarks ?? totalMarks,
      duration: input.durationMinutes ?? 60,
      sections: paperSections,
      instructions: '',
      capsCompliance: null,
      status: 'draft',
      aiGenerated: true,
      difficulty: 'medium',
      createdBy: new mongoose.Types.ObjectId(input.teacherId),
    });
  } catch (err: unknown) {
    logger.error({ err }, '[paper-gen] AssessmentPaper.create failed');
    if (allGeneratedIds.length) {
      try {
        await Question.updateMany(
          { _id: { $in: allGeneratedIds } },
          { $set: { isDeleted: true } },
        );
      } catch (delErr: unknown) {
        logger.error({ delErr }, '[paper-gen] paper-create rollback failed');
      }
    }
    throw err;
  }

  // Bump usageCount on every generated question (mirrors PaperGenerationService).
  try {
    await Question.updateMany(
      { _id: { $in: allGeneratedIds } },
      { $inc: { usageCount: 1 } },
    );
  } catch (err: unknown) {
    // Non-fatal: log and continue.
    logger.warn({ err }, '[paper-gen] usageCount bump failed');
  }

  return paper;
}
