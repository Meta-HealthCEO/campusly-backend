// src/modules/QuestionBank/service-paper-question-regen.ts
//
// Regenerating one paper question with AI. Moved unchanged from
// service-paper-questions.ts (a pure move, to stay under 350 lines);
// service-paper-questions.ts re-exports it.
import mongoose from 'mongoose';
import type { IAssessmentPaper, IPaperQuestion } from './model.js';
import { assertCanEditPaper } from './service-papers-auth.js';
import { regenerateSingleQuestion } from './service-paper-generation.js';
import {
  loadPaperOrThrow,
  assertSectionInBounds,
  assertQuestionInBounds,
  bumpVersion,
  mirrorAnswerToMemo,
  recomputePaperTotalMarks,
  scheduleRegenDiagramRender,
} from './service-paper-questions-helpers.js';

// ─── regeneratePaperQuestion ─────────────────────────────────────────────────

/**
 * Replace a question with a freshly AI-generated one targeting the same
 * marks. Always severs the bank-ref (result is inline) — Task 6 owns the
 * underlying generation. Diagrams are queued for async TikZ render
 * fire-and-forget, matching the pattern in `service-paper-generation.ts`.
 */
export async function regeneratePaperQuestion(
  paperId: string,
  schoolId: string,
  sectionIdx: number,
  position: number,
  actorId: string,
  actorRole: string,
): Promise<IAssessmentPaper> {
  const paper = await loadPaperOrThrow(paperId, schoolId);
  assertCanEditPaper(paper, actorId, actorRole, 'edit-question');
  const section = assertSectionInBounds(paper, sectionIdx);
  const oldQuestion = assertQuestionInBounds(section, position);

  const replacement = await regenerateSingleQuestion({
    paper,
    sectionIdx,
    position,
    targetMarks: oldQuestion.marks,
  });

  // Sever bank-ref, write inline result. Position is preserved.
  const updated: IPaperQuestion = {
    questionId: null,
    questionText: replacement.questionText,
    options: replacement.options ?? [],
    marks: replacement.marks,
    position,
    modelAnswer: replacement.modelAnswer ?? null,
    markingGuideline: replacement.markingGuideline ?? null,
    diagram: replacement.diagram
      ? {
          tikz: replacement.diagram.tikz,
          caption: replacement.diagram.caption ?? null,
          svgUrl: null,
          renderStatus: 'pending',
        }
      : null,
  };
  section.questions[position] = updated;
  // Replacement may have different marks than the original — always
  // recompute. Even if marks happen to match, recompute is cheap and
  // keeps the invariant unconditional.
  recomputePaperTotalMarks(paper);
  bumpVersion(paper);
  await paper.save();

  // Mirror to memo by questionNumber + sync totalMarks (always — regen may
  // have shifted marks even when the per-question total looks identical).
  await mirrorAnswerToMemo(
    paper._id as mongoose.Types.ObjectId,
    sectionIdx,
    position,
    updated,
    paper.totalMarks,
    'regeneratePaperQuestion',
  );

  // Fire-and-forget TikZ render — same pattern as service-paper-generation.
  if (updated.diagram?.tikz) {
    scheduleRegenDiagramRender(
      paper._id as mongoose.Types.ObjectId,
      sectionIdx,
      position,
      { tikz: updated.diagram.tikz, caption: updated.diagram.caption },
    );
  }

  return paper;
}
