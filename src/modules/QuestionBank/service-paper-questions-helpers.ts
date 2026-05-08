import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import type {
  IAssessmentPaper,
  IPaperQuestion,
  IPaperSection,
} from './model.js';
import type { IMemoAnswer } from '../TeacherWorkbench/model.assessment.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';

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
