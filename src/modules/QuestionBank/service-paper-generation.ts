import mongoose from 'mongoose';
import { Question, AssessmentPaper } from './model.js';
import type { IQuestion, IAssessmentPaper, IPaperQuestion, IPaperSection } from './model.js';
import { Grade } from '../Academic/model.js';
import { resolveAcademicFilterIds } from '../Academic/services/global-academic-lookup.js';
import { PaperMemo } from '../TeacherWorkbench/model.assessment.js';
import { ComplianceService } from './service-compliance.js';
import { BadRequestError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import {
  selectQuestions,
  generateMissingQuestions,
  organiseSections,
  toPaperQuestion,
} from './service-paper-gen-helpers.js';
import type { CognitiveWeighting } from './service-paper-gen-helpers.js';
import type { GeneratePaperInput } from './validation.js';
import {
  assertCanCreateForSubjectGrade,
  normaliseSubjectGradeIds,
  verifyPaperRefs,
} from './service-papers.js';

// Single-question regeneration lives in service-paper-regen.ts to keep this
// file under the 350-line cap. Re-exported here so callers using the
// canonical paper-service path see it without needing a second import.
export { regenerateSingleQuestion } from './service-paper-regen.js';
export type {
  RegenerateInput,
  RegenerateResult,
} from './service-paper-regen.js';

const DAILY_LIMIT = 20;

const DEFAULT_WEIGHTING: CognitiveWeighting = {
  knowledge: 20,
  routine: 35,
  complex: 30,
  problemSolving: 15,
};

export class PaperGenerationService {
  static async generatePaper(
    schoolId: string,
    userId: string,
    userRole: string,
    data: GeneratePaperInput,
    isStandaloneTeacher = false,
  ) {
    // ── Rate limit: 20 AI generations per day per teacher ──
    await enforceRateLimit(userId);

    // Standalone teachers send CurriculumNode subject/grade IDs (their
    // `/academic/subjects` endpoint returns curriculum nodes, not school-side
    // Subject docs). Bridge those to school-side records lazily so the rest
    // of the pipeline (verifyPaperRefs, gradebook publishing, etc.) sees
    // proper Subject/Grade IDs.
    const normalised = await normaliseSubjectGradeIds(
      schoolId, data.subjectId, data.gradeId,
    );
    data.subjectId = normalised.subjectId;
    data.gradeId = normalised.gradeId;

    const soid = new mongoose.Types.ObjectId(schoolId);
    const suboid = new mongoose.Types.ObjectId(data.subjectId);
    const groid = new mongoose.Types.ObjectId(data.gradeId);
    const weighting = data.cognitiveWeighting ?? DEFAULT_WEIGHTING;

    // Topic IDs — Task 2 introduced `topicIds` as the canonical field. The
    // legacy `topicNodeIds` is still in the validation schema (optional) for
    // backward compatibility — callers may pass either. Normalise here.
    const topicIds = (data.topicIds ?? data.topicNodeIds ?? []) as string[];
    await verifyPaperRefs(schoolId, data.subjectId, data.gradeId, topicIds);
    await assertCanCreateForSubjectGrade(
      schoolId,
      userId,
      userRole,
      data.subjectId,
      data.gradeId,
      isStandaloneTeacher,
    );

    // ── Fetch approved questions matching criteria ──
    // Bank seeding is OPT-IN. The teacher's curated Question Bank only
    // contributes when `data.useExistingBank === true`. Otherwise the entire
    // paper is freshly authored by Claude (grounded in textbook + lessons)
    // and saved back as `status: 'draft'` questions for later curation.
    let bankQuestions: IQuestion[] = [];
    if (data.useExistingBank === true) {
      const { subjectIds, gradeIds } = await resolveAcademicFilterIds({
        subjectId: data.subjectId,
        gradeId: data.gradeId,
      });

      const baseFilter: Record<string, unknown> = {
        subjectId: { $in: subjectIds ?? [suboid] },
        gradeId: { $in: gradeIds ?? [groid] },
        isDeleted: false,
        status: 'approved',
        $or: [{ schoolId: null }, { schoolId: soid }],
      };

      if (topicIds.length > 0) {
        baseFilter.curriculumNodeId = {
          $in: topicIds.map((id) => new mongoose.Types.ObjectId(id)),
        };
      }

      bankQuestions = await Question.find(baseFilter)
        .populate({ path: 'curriculumNodeId', select: 'title code type' })
        .lean() as IQuestion[];
    }

    // ── Select questions that fit target marks + cognitive weighting + type mix ──
    const selected = selectQuestions(
      bankQuestions, data.totalMarks, weighting, data.difficulty, data.questionTypeMix,
    );
    const selectedMarks = selected.reduce((sum, q) => sum + q.marks, 0);
    const deficit = data.totalMarks - selectedMarks;

    // ── Generate missing questions via AI if needed ──
    let allQuestions = [...selected];
    if (deficit > 0) {
      const generated = await generateMissingQuestions(
        schoolId, userId, data, weighting, deficit, selected, data.questionTypeMix,
      );
      allQuestions = [...selected, ...generated];
    }

    if (allQuestions.length === 0) {
      throw new BadRequestError('Could not find or generate any questions for these criteria');
    }

    // ── Organise into sections by question type ──
    const sections = data.sectionConfig?.length
      ? organiseSectionsFromConfig(allQuestions, data)
      : organiseSections(allQuestions);

    // ── Build title ──
    const gradeDoc = await Grade.findById(groid).lean();
    const gradeLabel = gradeDoc?.name ?? data.gradeId;
    const paperTypeLabel = data.paperType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const title = data.title?.trim()
      || `${gradeLabel} - ${paperTypeLabel} - Term ${data.term} ${data.year}`;

    const actualTotal = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    const topicObjectIds = topicIds.map((id) => new mongoose.Types.ObjectId(id));

    // ── Phase 1: create paper ──
    let paper: IAssessmentPaper;
    try {
      paper = await AssessmentPaper.create({
        schoolId: soid,
        title,
        subjectId: suboid,
        gradeId: groid,
        topicIds: topicObjectIds,
        term: data.term,
        year: data.year,
        paperType: data.paperType,
        totalMarks: actualTotal,
        duration: data.duration,
        difficulty: data.difficulty,
        aiGenerated: true,
        sections,
        instructions: data.instructions ?? '',
        capsCompliance: null,
        status: 'draft',
        createdBy: new mongoose.Types.ObjectId(userId),
      });
    } catch (err: unknown) {
      logger.error({ err, userId, title }, 'Failed to create paper from AI');
      throw err;
    }

    // ── Phase 2: create memo (rollback paper on failure) ──
    let memoId: mongoose.Types.ObjectId;
    try {
      const memoDoc = await PaperMemo.create({
        paperId: paper._id,
        schoolId: soid,
        teacherId: new mongoose.Types.ObjectId(userId),
        sections: buildMemoSections(sections, allQuestions),
        totalMarks: actualTotal,
        status: 'draft',
      });
      memoId = memoDoc._id as mongoose.Types.ObjectId;
    } catch (memoErr: unknown) {
      try {
        await AssessmentPaper.updateOne(
          { _id: paper._id },
          { $set: { isDeleted: true } },
        );
      } catch (rollbackErr: unknown) {
        logger.error(
          { rollbackErr, originalErr: memoErr, paperId: String(paper._id) },
          'Failed to rollback paper after memo create failure — orphan record may exist',
        );
      }
      throw memoErr;
    }

    // ── Increment usage counts ──
    const questionIds = allQuestions.map((q) => q._id);
    await Question.updateMany(
      { _id: { $in: questionIds } },
      { $inc: { usageCount: 1 } },
    );

    // ── Run compliance check ──
    const compliance = await ComplianceService.calculateCompliance(
      paper,
      allQuestions as IQuestion[],
    );
    paper.capsCompliance = compliance;
    await paper.save();

    // ── Phase 3: kick off async TikZ rendering (fire-and-forget) ──
    // Bank-ref questions don't carry inline diagrams in the new IPaperQuestion
    // shape — this is a no-op today but future-proofs the path for inline
    // AI-authored questions (Task 12).
    void renderPaperDiagrams(paper._id as mongoose.Types.ObjectId).catch(
      (rerr: unknown) => {
        logger.error(
          { err: rerr, paperId: String(paper._id) },
          'TikZ rendering failed (non-fatal)',
        );
      },
    );

    return { ...paper.toObject(), memoId: String(memoId) };
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function enforceRateLimit(userId: string): Promise<void> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await AssessmentPaper.countDocuments({
    createdBy: new mongoose.Types.ObjectId(userId),
    createdAt: { $gte: startOfDay },
    isDeleted: false,
  });

  if (todayCount >= DAILY_LIMIT) {
    throw new BadRequestError(
      `Daily paper generation limit reached (${DAILY_LIMIT}/day). Try again tomorrow.`,
    );
  }
}

/**
 * Build the PaperMemo sections from organised paper sections + the source
 * bank questions. Each memo answer mirrors a paper question by index, pulling
 * `expectedAnswer` from the question's `answer` field and `markingNotes`
 * from `markingRubric`. Used immediately after AssessmentPaper creation.
 */
function buildMemoSections(
  sections: IPaperSection[],
  allQuestions: IQuestion[],
): Array<{
  sectionTitle: string;
  answers: Array<{
    questionNumber: string;
    expectedAnswer: string;
    markAllocation: Array<{ criterion: string; marks: number }>;
    commonMistakes: string[];
    acceptableAlternatives: string[];
  }>;
}> {
  const byId = new Map<string, IQuestion>();
  for (const q of allQuestions) {
    byId.set(String(q._id), q);
  }

  return sections.map((section, sIdx) => ({
    sectionTitle: section.title,
    answers: section.questions.map((pq: IPaperQuestion, qIdx: number) => {
      const q = pq.questionId ? byId.get(String(pq.questionId)) : undefined;
      return {
        questionNumber: `${sIdx + 1}.${qIdx + 1}`,
        expectedAnswer: q?.answer ?? pq.modelAnswer ?? '',
        markAllocation: q?.markingRubric
          ? [{ criterion: q.markingRubric, marks: pq.marks }]
          : [{ criterion: pq.markingGuideline ?? 'Full marks', marks: pq.marks }],
        commonMistakes: [],
        acceptableAlternatives: [],
      };
    }),
  }));
}

function organiseSectionsFromConfig(
  questions: IQuestion[],
  data: GeneratePaperInput,
): IPaperSection[] {
  const remaining = [...questions];
  const sections = data.sectionConfig.map((config, sectionIndex) => {
    const allocated: IQuestion[] = [];
    let allocatedMarks = 0;
    const isLastSection = sectionIndex === data.sectionConfig.length - 1;

    while (remaining.length > 0 && allocated.length < config.questionCount) {
      const fittingIndex = remaining.findIndex(
        (question) => allocatedMarks + question.marks <= config.sectionMarks,
      );
      const nextIndex = fittingIndex >= 0 ? fittingIndex : (isLastSection ? 0 : -1);
      if (nextIndex < 0) break;

      const [question] = remaining.splice(nextIndex, 1);
      if (!question) break;
      allocated.push(question);
      allocatedMarks += question.marks;

      if (allocatedMarks >= config.sectionMarks && !isLastSection) break;
    }

    const sectionQuestions: IPaperQuestion[] = allocated.map(
      (question, index) => toPaperQuestion(question, index),
    );

    return {
      title: config.title,
      instructions: config.instructions ?? '',
      order: sectionIndex,
      questions: sectionQuestions,
    };
  });

  const lastSection = sections[sections.length - 1];
  if (lastSection && remaining.length > 0) {
    const startPosition = lastSection.questions.length;
    lastSection.questions.push(
      ...remaining.map((question, index) => toPaperQuestion(question, startPosition + index)),
    );
  }

  return sections.some((section) => section.questions.length > 0)
    ? sections
    : organiseSections(questions);
}

/**
 * Walk every paper question with a pending TikZ diagram, render it, and
 * persist the resulting svgUrl + status. Failures degrade individual
 * questions to renderStatus='failed' rather than crashing the whole paper.
 * Today this is a no-op for bank-ref papers (no inline diagrams), but
 * remains in place for Task 12's inline-AI-question flow.
 */
async function renderPaperDiagrams(
  paperId: mongoose.Types.ObjectId,
): Promise<void> {
  const { renderDiagram } = await import('./service-diagram.js');
  const paper = await AssessmentPaper.findById(paperId);
  if (!paper) return;
  let dirty = false;
  for (let s = 0; s < paper.sections.length; s++) {
    const section = paper.sections[s];
    if (!section) continue;
    for (let q = 0; q < section.questions.length; q++) {
      const question = section.questions[q];
      if (!question) continue;
      const diagram = question.diagram;
      if (diagram?.tikz && diagram.renderStatus === 'pending') {
        try {
          const result = await renderDiagram({
            tikz: diagram.tikz,
            data: {},
            alt: diagram.caption ?? '',
          });
          if (result.renderStatus === 'rendered') {
            diagram.svgUrl = result.svgUrl;
            diagram.renderStatus = 'rendered';
          } else {
            diagram.renderStatus = 'failed';
          }
          dirty = true;
        } catch {
          diagram.renderStatus = 'failed';
          dirty = true;
        }
      }
    }
  }
  if (dirty) await paper.save();
}
