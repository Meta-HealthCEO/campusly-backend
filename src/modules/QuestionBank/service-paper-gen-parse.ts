// src/modules/QuestionBank/service-paper-gen-parse.ts
//
// Reading the AI's generated questions. Moved unchanged from
// service-paper-gen-helpers.ts (a pure move, to stay under 350 lines).
import type { CapsLevel, QuestionType } from './model.js';

export interface ParsedGenQuestion {
  stem: string;
  type: QuestionType;
  options: Array<{ label: string; text: string; isCorrect: boolean }>;
  answer: string;
  markingRubric: string;
  marks: number;
  capsLevel: CapsLevel;
}

// ─── Parse Helpers ─────────────────────────────────────────────────────────

export function parseGeneratedQuestions(response: string): ParsedGenQuestion[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    const parsed: unknown[] = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: unknown) => {
      const q = item as Record<string, unknown>;
      const options = Array.isArray(q.options)
        ? (q.options as unknown[]).map((opt: unknown) => {
            const o = opt as Record<string, unknown>;
            return {
              label: typeof o.label === 'string' ? o.label : '',
              text: typeof o.text === 'string' ? o.text : '',
              isCorrect: typeof o.isCorrect === 'boolean' ? o.isCorrect : false,
            };
          })
        : [];

      const validTypes: QuestionType[] = ['mcq', 'structured', 'short_answer', 'essay', 'calculation'];
      const rawType = typeof q.type === 'string' ? q.type : 'structured';
      const type: QuestionType = validTypes.includes(rawType as QuestionType)
        ? (rawType as QuestionType) : 'structured';

      const validCaps: CapsLevel[] = ['knowledge', 'routine', 'complex', 'problem_solving'];
      const rawCaps = typeof q.capsLevel === 'string' ? q.capsLevel : 'routine';
      const capsLevel: CapsLevel = validCaps.includes(rawCaps as CapsLevel)
        ? (rawCaps as CapsLevel) : 'routine';

      return {
        stem: typeof q.stem === 'string' ? q.stem : 'Generated question',
        type, options,
        answer: typeof q.answer === 'string' ? q.answer : '',
        markingRubric: typeof q.markingRubric === 'string' ? q.markingRubric : '',
        marks: typeof q.marks === 'number' && q.marks >= 1 ? q.marks : 2,
        capsLevel,
      };
    });
  } catch {
    return [];
  }
}
