import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import type {
  IAssessmentPaper,
  IPaperQuestion,
  IPaperSection,
} from './model.js';
import { PaperMemo } from '../TeacherWorkbench/model.assessment.js';
import type { IMemoAnswer } from '../TeacherWorkbench/model.assessment.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { renderDiagram } from './service-diagram.js';

/**
 * Bumped before every paper.save() in service-paper-questions so Module 3's
 * stale-marking banner can detect AI results that ran on an older revision
 * (compares marking.paperVersion).
 */
export function bumpVersion(paper: { version: number }): void {
  paper.version = (paper.version ?? 1) + 1;
}

/**
 * Enforce the bank-ref XOR inline contract — exactly one of `questionId` /
 * `questionText` must be present. The validation layer already runs this, but
 * we re-assert at the service boundary so callers that bypass route validation
 * (e.g. tests, scripts) cannot create an ambiguous question.
 */
export function assertExactlyOneSource(input: {
  questionId?: string;
  questionText?: string;
}): void {
  const hasId = Boolean(input.questionId);
  const hasText = Boolean(input.questionText);
  if (hasId === hasText) {
    throw new BadRequestError(
      'Exactly one of questionId or questionText must be set',
    );
  }
}

/**
 * Resolve a non-deleted paper scoped to the caller's school. Throws
 * NotFoundError if the paper does not exist, has been soft-deleted, or
 * belongs to a different school. School scoping is enforced even for
 * single-entity lookups — without it any teacher who knows a paper id
 * could read another school's paper.
 */
export async function loadPaperOrThrow(
  paperId: string,
  schoolId: string,
): Promise<IAssessmentPaper> {
  const paper = await AssessmentPaper.findOne({
    _id: new mongoose.Types.ObjectId(paperId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!paper) throw new NotFoundError('Paper not found');
  return paper;
}

export function assertSectionInBounds(
  paper: IAssessmentPaper,
  idx: number,
): IPaperSection {
  if (idx < 0 || idx >= paper.sections.length) {
    throw new BadRequestError(`sectionIdx ${idx} is out of bounds`);
  }
  const section = paper.sections[idx];
  if (!section) throw new BadRequestError(`sectionIdx ${idx} is out of bounds`);
  return section;
}

export function assertQuestionInBounds(
  section: IPaperSection,
  position: number,
): IPaperQuestion {
  if (position < 0 || position >= section.questions.length) {
    throw new BadRequestError(`position ${position} is out of bounds`);
  }
  const q = section.questions[position];
  if (!q) throw new BadRequestError(`position ${position} is out of bounds`);
  return q;
}

/**
 * Compute the canonical questionNumber label used by `IPaperMemo` answers.
 * Format: `${sectionIdx + 1}.${position + 1}` — matches the convention
 * established in `service-paper-generation.ts#buildMemoSections`.
 */
export function questionNumberFor(sectionIdx: number, position: number): string {
  return `${sectionIdx + 1}.${position + 1}`;
}

/**
 * Recompute `paper.totalMarks` as the sum of every question's marks across
 * every section. Must be called before `paper.save()` on any mutation that
 * adds/removes a question or changes a question's marks — otherwise
 * `totalMarks` drifts from `sum(question.marks)` and downstream PDF /
 * marking / reports surface stale figures.
 */
export function recomputePaperTotalMarks(paper: IAssessmentPaper): void {
  paper.totalMarks = paper.sections.reduce(
    (sum, sec) => sum + sec.questions.reduce((t, q) => t + (q.marks ?? 0), 0),
    0,
  );
}

/**
 * Build an `IMemoAnswer`-shaped object from a paper question. Used both
 * when appending to a memo and when rebuilding a memo section's answers
 * after delete/re-index.
 */
export function buildMemoAnswer(
  sectionIdx: number,
  position: number,
  q: Pick<IPaperQuestion, 'marks' | 'modelAnswer' | 'markingGuideline'>,
): IMemoAnswer {
  return {
    questionNumber: questionNumberFor(sectionIdx, position),
    expectedAnswer: q.modelAnswer ?? '',
    markAllocation: [
      { criterion: q.markingGuideline ?? 'Full marks', marks: q.marks },
    ],
    commonMistakes: [],
    acceptableAlternatives: [],
  };
}

/**
 * Mirror a single paper-question's mark-relevant fields to its matching
 * `IMemoAnswer`. Used by `updatePaperQuestion` and `regeneratePaperQuestion`
 * — both writes need the same `$set` shape (expectedAnswer + markAllocation,
 * arrayFiltered by questionNumber). Pass `totalMarks` when paper-level
 * marks shifted so the memo's `totalMarks` stays in sync. Mirror failures
 * are logged and swallowed — never crash the question mutation on memo skew.
 */
export async function mirrorAnswerToMemo(
  paperId: mongoose.Types.ObjectId,
  sectionIdx: number,
  position: number,
  q: Pick<IPaperQuestion, 'marks' | 'modelAnswer' | 'markingGuideline'>,
  totalMarks?: number,
  context: string = 'mirrorAnswerToMemo',
): Promise<void> {
  const qn = questionNumberFor(sectionIdx, position);
  const memoSet: Record<string, unknown> = {
    [`sections.${sectionIdx}.answers.$[ans].expectedAnswer`]: q.modelAnswer ?? '',
    [`sections.${sectionIdx}.answers.$[ans].markAllocation`]: [
      { criterion: q.markingGuideline ?? 'Full marks', marks: q.marks },
    ],
  };
  if (totalMarks !== undefined) memoSet.totalMarks = totalMarks;
  try {
    await PaperMemo.updateOne(
      { paperId, isDeleted: false },
      { $set: memoSet },
      { arrayFilters: [{ 'ans.questionNumber': qn }] },
    );
  } catch (err: unknown) {
    logger.error(
      { err, paperId: String(paperId), sectionIdx, position },
      `Failed to mirror ${context} to memo`,
    );
  }
}

/**
 * Fire-and-forget TikZ render for a regenerated paper question. Mirrors
 * the pattern in `service-paper-generation.ts#renderPaperDiagrams` — on
 * success persists `svgUrl` + `renderStatus='rendered'` for the targeted
 * question; failures only log and never propagate.
 */
export function scheduleRegenDiagramRender(
  paperId: mongoose.Types.ObjectId,
  sectionIdx: number,
  position: number,
  diagram: { tikz: string; caption: string | null },
): void {
  const paperIdStr = String(paperId);
  void renderDiagram({
    tikz: diagram.tikz,
    data: {},
    alt: diagram.caption ?? '',
  })
    .then(async (result) => {
      if (result.renderStatus !== 'rendered') return;
      try {
        await AssessmentPaper.updateOne(
          { _id: paperId },
          {
            $set: {
              [`sections.${sectionIdx}.questions.${position}.diagram.svgUrl`]:
                result.svgUrl,
              [`sections.${sectionIdx}.questions.${position}.diagram.renderStatus`]:
                'rendered',
            },
          },
        );
      } catch (persistErr: unknown) {
        logger.error(
          { err: persistErr, paperId: paperIdStr },
          'Failed to persist regen diagram render result',
        );
      }
    })
    .catch((rerr: unknown) => {
      logger.error(
        { err: rerr, paperId: paperIdStr },
        'TikZ rendering failed for regenerated question (non-fatal)',
      );
    });
}
