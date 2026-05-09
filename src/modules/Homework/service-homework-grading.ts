import { BadRequestError } from '../../common/errors.js';
import type { IQuestion, QuestionType } from '../QuestionBank/model.js';
import type { IHomework } from './model.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const DETERMINISTIC_TYPES: ReadonlySet<QuestionType> = new Set<QuestionType>([
  'mcq',
  'true_false',
  'fill_blank',
]);

export interface GradingResult {
  awarded: number;
  rationale: string;
  gradingMethod: 'deterministic' | 'ai';
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[\s\p{P}]+/gu, ' ')
    .replace(/\s+/g, ' ');
}

// ─── Deterministic graders ──────────────────────────────────────────────────

export function gradeMcq(question: IQuestion, studentAnswer: string): GradingResult {
  const correct = question.options.find((o) => o.isCorrect);
  if (!correct) {
    return { awarded: 0, rationale: 'No correct option configured', gradingMethod: 'deterministic' };
  }
  const matched =
    normalize(studentAnswer) === normalize(correct.label) ||
    normalize(studentAnswer) === normalize(correct.text);
  return matched
    ? { awarded: question.marks, rationale: 'Correct option selected', gradingMethod: 'deterministic' }
    : { awarded: 0, rationale: `Selected "${studentAnswer}", expected "${correct.text}"`, gradingMethod: 'deterministic' };
}

export function gradeTrueFalse(question: IQuestion, studentAnswer: string): GradingResult {
  const expected = normalize(question.answer);
  const given = normalize(studentAnswer);
  const matched =
    expected === given ||
    (expected === 'true' && (given === 'yes' || given === 't')) ||
    (expected === 'false' && (given === 'no' || given === 'f'));
  return matched
    ? { awarded: question.marks, rationale: 'Correct', gradingMethod: 'deterministic' }
    : { awarded: 0, rationale: `Answered "${studentAnswer}", expected "${question.answer}"`, gradingMethod: 'deterministic' };
}

export function gradeFillBlank(question: IQuestion, studentAnswer: string): GradingResult {
  // answer field may contain multiple acceptable forms separated by | (pipe)
  const acceptable = question.answer.split('|').map((s) => normalize(s));
  const given = normalize(studentAnswer);
  const matched = acceptable.some((a) => a === given);
  return matched
    ? { awarded: question.marks, rationale: 'Correct', gradingMethod: 'deterministic' }
    : { awarded: 0, rationale: `Answered "${studentAnswer}", expected one of: ${question.answer}`, gradingMethod: 'deterministic' };
}

// ─── Late penalty ───────────────────────────────────────────────────────────

export interface LatePenaltyResult {
  finalMark: number;
  lateMarkAdjustment?: { rawMark: number; penaltyPercent: number; finalMark: number };
}

export function applyLatePenalty(
  rawMark: number,
  isLate: boolean,
  homework: IHomework,
): LatePenaltyResult {
  if (!isLate) return { finalMark: rawMark };
  switch (homework.latePolicy) {
    case 'accept':
      return { finalMark: rawMark };
    case 'block':
      throw new BadRequestError('Late submissions not accepted');
    case 'penalty': {
      const pct = homework.latePenaltyPercent ?? 0;
      const finalMark = Math.max(0, rawMark * (1 - pct / 100));
      return {
        finalMark,
        lateMarkAdjustment: { rawMark, penaltyPercent: pct, finalMark },
      };
    }
    default:
      return { finalMark: rawMark };
  }
}
