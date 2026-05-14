import { AIService } from '../../services/ai.service.js';
import { logger } from '../../common/logger.js';

export interface GradeAttemptInput {
  /** The raw block content as stored — JSON string for quiz / fill_blank etc. */
  blockContent: string;
  /** The block type (quiz, fill_blank, short_answer …) */
  blockType: string;
  /** The learner's response. */
  response: string;
}

export interface GradeAttemptResult {
  correct: boolean;
  score: number;
  maxScore: number;
  feedback: string;
}

const SYSTEM_PROMPT = `You are a fair, encouraging grader of short student answers. The teacher
shows you the question (as JSON), the response, and asks you to grade it.

Grade by intent and substance, not by exact wording. Accept paraphrases,
synonyms, and minor errors. Reject answers that miss the core idea or
contain a factual error.

Return ONLY a JSON object on a single line:
{"correct": true|false, "score": 0-1, "feedback": "one short sentence"}

- score: 1.0 = fully correct, 0.5 = partial, 0 = wrong.
- feedback: one sentence the learner can act on. No greetings, no preamble.
- correct = true iff score >= 0.7.`;

function buildUserPrompt(input: GradeAttemptInput): string {
  return [
    `Question block type: ${input.blockType}`,
    'Question block (JSON):',
    input.blockContent,
    '',
    'Learner response:',
    input.response,
    '',
    'Grade it.',
  ].join('\n');
}

/**
 * Heuristic fallback used when the AI returns something un-parsable or the
 * call fails. Never claim correctness we can't verify — flag as null-ish
 * via `correct=false, score=0` and surface the failure in feedback.
 */
function fallbackResult(reason: string): GradeAttemptResult {
  return {
    correct: false,
    score: 0,
    maxScore: 1,
    feedback: `Could not auto-grade (${reason}). Compare against the explanation manually.`,
  };
}

export async function gradeAttempt(input: GradeAttemptInput): Promise<GradeAttemptResult> {
  let raw: string;
  try {
    raw = await AIService.generateCompletion(SYSTEM_PROMPT, buildUserPrompt(input), {
      maxTokens: 200,
      temperature: 0.1,
    });
  } catch (err: unknown) {
    logger.warn({ err }, '[grade-attempt] AI call failed');
    return fallbackResult('AI grader unavailable');
  }

  // Pull the first JSON object out of the response. The model occasionally
  // wraps it in prose despite the instruction.
  const match = raw.match(/\{[\s\S]*?\}/);
  if (!match) return fallbackResult('AI response had no JSON');

  let parsed: { correct?: unknown; score?: unknown; feedback?: unknown };
  try {
    parsed = JSON.parse(match[0]) as typeof parsed;
  } catch {
    return fallbackResult('AI response was not valid JSON');
  }

  const score = typeof parsed.score === 'number'
    ? Math.max(0, Math.min(1, parsed.score))
    : 0;
  const correct = parsed.correct === true || score >= 0.7;
  const feedback = typeof parsed.feedback === 'string' && parsed.feedback.trim()
    ? parsed.feedback.trim()
    : (correct ? 'Correct.' : 'Not quite — review the explanation.');

  return { correct, score, maxScore: 1, feedback };
}
