import mongoose from 'mongoose';
import { AssessmentPaper, Question } from './model.js';
import type { IAssessmentPaper, IPaperQuestion, IQuestion } from './model.js';
import { PaperMemo } from '../TeacherWorkbench/model.assessment.js';
import { resolveAcademicFilterIds } from '../Academic/services/global-academic-lookup.js';
import type { IMemoAnswer } from '../TeacherWorkbench/model.assessment.js';
import { logger } from '../../common/logger.js';
import { BadRequestError } from '../../common/errors.js';
import { assertCanEditPaper } from './service-papers-auth.js';
import { regenerateSingleQuestion } from './service-paper-generation.js';
import {
  assertExactlyOneSource,
  loadPaperOrThrow,
  assertSectionInBounds,
  assertQuestionInBounds,
  buildMemoAnswer,
  bumpVersion,
  mirrorAnswerToMemo,
  recomputePaperTotalMarks,
  scheduleRegenDiagramRender,
} from './service-paper-questions-helpers.js';
import type {
  AddQuestionToPaperInput,
  UpdatePaperQuestionInput,
  UpdateMemoInput,
} from './validation.js';

async function loadBankQuestionForPaper(
  paper: IAssessmentPaper,
  questionId: string | undefined,
): Promise<IQuestion | null> {
  if (!questionId) return null;
  const { subjectIds, gradeIds } = await resolveAcademicFilterIds({
    subjectId: String(paper.subjectId),
    gradeId: String(paper.gradeId),
  });

  const question = await Question.findOne({
    _id: new mongoose.Types.ObjectId(questionId),
    subjectId: { $in: subjectIds ?? [paper.subjectId] },
    gradeId: { $in: gradeIds ?? [paper.gradeId] },
    isDeleted: false,
    status: 'approved',
    $or: [{ schoolId: null }, { schoolId: paper.schoolId }],
  }).lean() as IQuestion | null;

  if (!question) {
    throw new BadRequestError('Question is not available for this paper');
  }

  const paperTopicIds = new Set((paper.topicIds ?? []).map((id) => String(id)));
  if (paperTopicIds.size > 0 && !paperTopicIds.has(String(question.curriculumNodeId))) {
    throw new BadRequestError('Question topic does not match this paper');
  }

  return question;
}

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
  const bankQuestion = await loadBankQuestionForPaper(paper, input.questionId);

  const position = section.questions.length;
  const newQuestion: IPaperQuestion = {
    questionId: input.questionId
      ? new mongoose.Types.ObjectId(input.questionId)
      : null,
    questionText: input.questionText ?? bankQuestion?.stem ?? null,
    options: input.options ?? bankQuestion?.options ?? [],
    marks: input.marks,
    position,
    modelAnswer: input.modelAnswer ?? bankQuestion?.answer ?? null,
    markingGuideline: input.markingGuideline ?? bankQuestion?.markingRubric ?? null,
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
  recomputePaperTotalMarks(paper);
  bumpVersion(paper);
  await paper.save();

  // Mirror to memo — append answer at matching section AND keep memo's
  // own totalMarks in sync with the paper. Soft-skip mirror failures
  // (e.g. legacy paper without a memo) rather than crashing the question
  // add; logger.error captures the divergence for ops.
  try {
    await PaperMemo.updateOne(
      { paperId: paper._id, isDeleted: false },
      {
        $push: {
          [`sections.${sectionIdx}.answers`]: buildMemoAnswer(
            sectionIdx,
            position,
            newQuestion,
          ),
        },
        $set: { totalMarks: paper.totalMarks },
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
  if (patch.options !== undefined) question.options = patch.options;
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
  // Only recompute when marks actually changed — text/diagram edits don't
  // affect the paper total, so skip the work.
  if (patch.marks !== undefined) {
    recomputePaperTotalMarks(paper);
  }
  bumpVersion(paper);
  await paper.save();

  // Mirror to memo only if a memo-relevant field changed. Pass totalMarks
  // through only when marks shifted, so unchanged-mark edits don't redundantly
  // overwrite the memo's totalMarks field.
  const memoFieldsTouched =
    patch.marks !== undefined ||
    patch.modelAnswer !== undefined ||
    patch.markingGuideline !== undefined;
  if (memoFieldsTouched) {
    await mirrorAnswerToMemo(
      paper._id as mongoose.Types.ObjectId,
      sectionIdx,
      position,
      question,
      patch.marks !== undefined ? paper.totalMarks : undefined,
      'updatePaperQuestion',
    );
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
  recomputePaperTotalMarks(paper);
  bumpVersion(paper);
  await paper.save();

  // Rebuild the memo section's answers from the post-delete paper state.
  // Cheaper-but-correct alternative: $pull by questionNumber THEN renumber
  // every remaining entry — same number of writes, more code, more places
  // for skew bugs. Rebuild wins. Mirror totalMarks alongside.
  const rebuiltAnswers: IMemoAnswer[] = section.questions.map((q, idx) =>
    buildMemoAnswer(sectionIdx, idx, q),
  );
  try {
    await PaperMemo.updateOne(
      { paperId: paper._id, isDeleted: false },
      {
        $set: {
          [`sections.${sectionIdx}.answers`]: rebuiltAnswers,
          totalMarks: paper.totalMarks,
        },
      },
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
    { paperId: paper._id, schoolId: paper.schoolId, isDeleted: false },
    { $set: { sections: patch.sections, totalMarks: paper.totalMarks } },
  );
  // Memo edits invalidate marking; $inc keeps version monotonic.
  await AssessmentPaper.updateOne(
    { _id: paper._id, schoolId, isDeleted: false },
    { $inc: { version: 1 } },
  );
}
