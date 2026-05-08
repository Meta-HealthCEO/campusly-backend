import mongoose from 'mongoose';
import { Question, AssessmentPaper } from './model.js';
import type { IQuestion, IAssessmentPaper, IPaperQuestion } from './model.js';
import { Grade } from '../Academic/model.js';
import { PaperMemo } from '../TeacherWorkbench/model.assessment.js';
import { ComplianceService } from './service-compliance.js';
import { BadRequestError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import {
  selectQuestions,
  generateMissingQuestions,
  organiseSections,
} from './service-paper-gen-helpers.js';
import type { CognitiveWeighting } from './service-paper-gen-helpers.js';
import type { GeneratePaperInput } from './validation.js';

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
    data: GeneratePaperInput,
  ) {
    // ── Rate limit: 20 AI generations per day per teacher ──
    await enforceRateLimit(userId);

    const soid = new mongoose.Types.ObjectId(schoolId);
    const suboid = new mongoose.Types.ObjectId(data.subjectId);
    const groid = new mongoose.Types.ObjectId(data.gradeId);
    const weighting = data.cognitiveWeighting ?? DEFAULT_WEIGHTING;

    // Topic IDs — Task 2 introduced `topicIds` as the canonical field. The
    // legacy `topicNodeIds` is still in the validation schema (optional) for
    // backward compatibility — callers may pass either. Normalise here.
    const topicIds = (data.topicIds ?? data.topicNodeIds ?? []) as string[];

    // ── Fetch approved questions matching criteria ──
    const baseFilter: Record<string, unknown> = {
      subjectId: suboid,
      gradeId: groid,
      isDeleted: false,
      status: 'approved',
      $or: [{ schoolId: null }, { schoolId: soid }],
    };

    if (topicIds.length > 0) {
      baseFilter.curriculumNodeId = {
        $in: topicIds.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const bankQuestions = await Question.find(baseFilter)
      .populate({ path: 'curriculumNodeId', select: 'title code type' })
      .lean() as IQuestion[];

    // ── Select questions that fit target marks + cognitive weighting ──
    const selected = selectQuestions(bankQuestions, data.totalMarks, weighting, data.difficulty);
    const selectedMarks = selected.reduce((sum, q) => sum + q.marks, 0);
    const deficit = data.totalMarks - selectedMarks;

    // ── Generate missing questions via AI if needed ──
    let allQuestions = [...selected];
    if (deficit > 0) {
      const generated = await generateMissingQuestions(
        schoolId, userId, data, weighting, deficit, selected,
      );
      allQuestions = [...selected, ...generated];
    }

    if (allQuestions.length === 0) {
      throw new BadRequestError('Could not find or generate any questions for these criteria');
    }

    // ── Organise into sections by question type ──
    const sections = organiseSections(allQuestions);

    // ── Build title ──
    const gradeDoc = await Grade.findById(groid).lean();
    const gradeLabel = gradeDoc?.name ?? data.gradeId;
    const paperTypeLabel = data.paperType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
    const title = `${gradeLabel} – ${paperTypeLabel} – Term ${data.term} ${data.year}`;

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
  sections: ReturnType<typeof organiseSections>,
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
          : [],
        commonMistakes: [],
        acceptableAlternatives: [],
      };
    }),
  }));
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
