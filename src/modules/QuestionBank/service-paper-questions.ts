import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import type { IAssessmentPaper, IPaperQuestion } from './model.js';
import { PaperMemo } from '../TeacherWorkbench/model.assessment.js';
import type { IMemoAnswer } from '../TeacherWorkbench/model.assessment.js';
import { logger } from '../../common/logger.js';
import { assertCanEditPaper } from './service-papers-auth.js';
import { regenerateSingleQuestion } from './service-paper-generation.js';
import { renderDiagram } from './service-diagram.js';
import {
  assertExactlyOneSource,
  loadPaperOrThrow,
  assertSectionInBounds,
  assertQuestionInBounds,
  questionNumberFor,
  buildMemoAnswer,
} from './service-paper-questions-helpers.js';
import type {
  AddQuestionToPaperInput,
  UpdatePaperQuestionInput,
  UpdateMemoInput,
} from './validation.js';

// ─── addQuestionToPaper ──────────────────────────────────────────────────────

/**
 * Append a question to the section at `sectionIdx`. Position is assigned
 * server-side as `section.questions.length` — any client-supplied `position`
 * is ignored (the input schema accepts it for shape symmetry with section
 * payloads, but it is not authoritative at the per-question endpoint).
 */
export async function addQuestionToPaper(
  paperId: string,
  schoolId: string,
  sectionIdx: number,
  input: AddQuestionToPaperInput,
  actorId: string,
  actorRole: string,
): Promise<IAssessmentPaper> {
  assertExactlyOneSource(input);
  const paper = await loadPaperOrThrow(paperId, schoolId);
  assertCanEditPaper(paper, actorId, actorRole, 'add-question');
  const section = assertSectionInBounds(paper, sectionIdx);

  const position = section.questions.length;
  const newQuestion: IPaperQuestion = {
    questionId: input.questionId
      ? new mongoose.Types.ObjectId(input.questionId)
      : null,
    questionText: input.questionText ?? null,
    marks: input.marks,
    position,
    modelAnswer: input.modelAnswer ?? null,
    markingGuideline: input.markingGuideline ?? null,
    diagram: input.diagram
      ? {
          tikz: input.diagram.tikz,
          caption: input.diagram.caption ?? null,
          svgUrl: null,
          renderStatus: 'pending',
        }
      : null,
  };
  section.questions.push(newQuestion);
  await paper.save();

  // Mirror to memo — append answer at matching section. Soft-skip mirror
  // failures (e.g. legacy paper without a memo) rather than crashing the
  // question add; logger.error captures the divergence for ops.
  try {
    await PaperMemo.updateOne(
      { paperId: paper._id },
      {
        $push: {
          [`sections.${sectionIdx}.answers`]: buildMemoAnswer(
            sectionIdx,
            position,
            newQuestion,
          ),
        },
      },
    );
  } catch (err: unknown) {
    logger.error(
      { err, paperId: String(paper._id), sectionIdx, position },
      'Failed to mirror addQuestionToPaper to memo',
    );
  }

  return paper;
}

// ─── updatePaperQuestion ─────────────────────────────────────────────────────

/**
 * Patch fields on an existing question. `position` and `questionId` shape
 * are intentionally NOT mutable here — moving questions is a different
 * concern (out of scope for Task 5) and changing the bank-ref vs inline
 * shape would require re-running the XOR refinement.
 */
export async function updatePaperQuestion(
  paperId: string,
  schoolId: string,
  sectionIdx: number,
  position: number,
  patch: UpdatePaperQuestionInput,
  actorId: string,
  actorRole: string,
): Promise<IAssessmentPaper> {
  const paper = await loadPaperOrThrow(paperId, schoolId);
  assertCanEditPaper(paper, actorId, actorRole, 'edit-question');
  const section = assertSectionInBounds(paper, sectionIdx);
  const question = assertQuestionInBounds(section, position);

  if (patch.questionText !== undefined) question.questionText = patch.questionText;
  if (patch.marks !== undefined) question.marks = patch.marks;
  if (patch.modelAnswer !== undefined) question.modelAnswer = patch.modelAnswer;
  if (patch.markingGuideline !== undefined) {
    question.markingGuideline = patch.markingGuideline;
  }
  if (patch.diagram !== undefined) {
    question.diagram = {
      tikz: patch.diagram.tikz,
      caption: patch.diagram.caption ?? null,
      svgUrl: null,
      renderStatus: 'pending',
    };
  }
  await paper.save();

  // Mirror to memo only if a memo-relevant field changed.
  const memoFieldsTouched =
    patch.marks !== undefined ||
    patch.modelAnswer !== undefined ||
    patch.markingGuideline !== undefined;
  if (memoFieldsTouched) {
    const qn = questionNumberFor(sectionIdx, position);
    try {
      await PaperMemo.updateOne(
        { paperId: paper._id },
        {
          $set: {
            [`sections.${sectionIdx}.answers.$[ans].expectedAnswer`]:
              question.modelAnswer ?? '',
            [`sections.${sectionIdx}.answers.$[ans].markAllocation`]: [
              {
                criterion: question.markingGuideline ?? 'Full marks',
                marks: question.marks,
              },
            ],
          },
        },
        { arrayFilters: [{ 'ans.questionNumber': qn }] },
      );
    } catch (err: unknown) {
      logger.error(
        { err, paperId: String(paper._id), sectionIdx, position },
        'Failed to mirror updatePaperQuestion to memo',
      );
    }
  }

  return paper;
}

// ─── deletePaperQuestion ─────────────────────────────────────────────────────

/**
 * Remove a question and re-index the section so positions remain
 * contiguous (0..n-1). To keep the memo aligned, we rebuild the section's
 * `answers[]` from the post-delete paper state — a `$pull` by questionNumber
 * would leave stale labels (e.g. "1.3" when the question is now at index 2).
 */
export async function deletePaperQuestion(
  paperId: string,
  schoolId: string,
  sectionIdx: number,
  position: number,
  actorId: string,
  actorRole: string,
): Promise<void> {
  const paper = await loadPaperOrThrow(paperId, schoolId);
  assertCanEditPaper(paper, actorId, actorRole, 'remove-question');
  const section = assertSectionInBounds(paper, sectionIdx);
  assertQuestionInBounds(section, position);

  section.questions = section.questions.filter((_, idx) => idx !== position);
  section.questions.forEach((q, idx) => {
    q.position = idx;
  });
  await paper.save();

  // Rebuild the memo section's answers from the post-delete paper state.
  // Cheaper-but-correct alternative: $pull by questionNumber THEN renumber
  // every remaining entry — same number of writes, more code, more places
  // for skew bugs. Rebuild wins.
  const rebuiltAnswers: IMemoAnswer[] = section.questions.map((q, idx) =>
    buildMemoAnswer(sectionIdx, idx, q),
  );
  try {
    await PaperMemo.updateOne(
      { paperId: paper._id },
      { $set: { [`sections.${sectionIdx}.answers`]: rebuiltAnswers } },
    );
  } catch (err: unknown) {
    logger.error(
      { err, paperId: String(paper._id), sectionIdx, position },
      'Failed to mirror deletePaperQuestion to memo',
    );
  }
}

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
  await paper.save();

  // Mirror to memo by questionNumber.
  const qn = questionNumberFor(sectionIdx, position);
  try {
    await PaperMemo.updateOne(
      { paperId: paper._id },
      {
        $set: {
          [`sections.${sectionIdx}.answers.$[ans].expectedAnswer`]:
            updated.modelAnswer ?? '',
          [`sections.${sectionIdx}.answers.$[ans].markAllocation`]: [
            {
              criterion: updated.markingGuideline ?? 'Full marks',
              marks: updated.marks,
            },
          ],
        },
      },
      { arrayFilters: [{ 'ans.questionNumber': qn }] },
    );
  } catch (err: unknown) {
    logger.error(
      { err, paperId: String(paper._id), sectionIdx, position },
      'Failed to mirror regeneratePaperQuestion to memo',
    );
  }

  // Fire-and-forget TikZ render — same pattern as service-paper-generation.
  if (updated.diagram?.tikz) {
    const tikz = updated.diagram.tikz;
    const caption = updated.diagram.caption ?? '';
    const paperIdStr = String(paper._id);
    void renderDiagram({ tikz, data: {}, alt: caption })
      .then(async (result) => {
        if (result.renderStatus !== 'rendered') return;
        try {
          await AssessmentPaper.updateOne(
            { _id: paper._id },
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

  return paper;
}

// ─── updatePaperMemo ─────────────────────────────────────────────────────────

/**
 * Wholesale-replace the memo's `sections` array. Validation has already
 * verified the shape matches `IPaperMemo` — we trust it and overwrite.
 * Per-answer surgical edits are NOT in scope here; callers wanting that
 * should use `updatePaperQuestion` which mirrors automatically.
 */
export async function updatePaperMemo(
  paperId: string,
  schoolId: string,
  patch: UpdateMemoInput,
  actorId: string,
  actorRole: string,
): Promise<void> {
  const paper = await loadPaperOrThrow(paperId, schoolId);
  assertCanEditPaper(paper, actorId, actorRole, 'edit-memo');
  await PaperMemo.updateOne(
    { paperId: paper._id },
    { $set: { sections: patch.sections } },
  );
}
