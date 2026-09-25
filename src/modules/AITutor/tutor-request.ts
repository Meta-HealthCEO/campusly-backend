// src/modules/AITutor/tutor-request.ts
//
// The tutor request laid out for prompt caching (ruling R19). Caching is a
// prefix match, so the order is: fixed instructions (breakpoint) → session
// line → stored conversation (breakpoint on its last block) → one new user
// turn holding this turn's context and the learner's words. Nothing that
// changes per turn sits before a breakpoint.
import type Anthropic from '@anthropic-ai/sdk';
import type { TutorMode } from './model.js';
import { tutorInstructions, tutorSessionLine, tutorTurnContext, type TutorPromptContext } from './prompts.js';

export const MAX_CONTEXT_MESSAGES = 20;
const CACHED = { type: 'ephemeral' } as const;

export interface TutorRequest {
  system: Anthropic.TextBlockParam[];
  messages: Anthropic.MessageParam[];
}

interface StoredMessage { role: 'student' | 'assistant'; content: string }

export function buildTutorRequest(
  mode: TutorMode,
  ctx: TutorPromptContext,
  history: readonly StoredMessage[],
  message: string,
): TutorRequest {
  const kept = history.slice(-MAX_CONTEXT_MESSAGES);
  // Every stored message is one text block, the same shape turn after turn, so
  // the previous request's prefix repeats exactly; only the last carries the breakpoint.
  const past = kept.map((m: StoredMessage, i: number): Anthropic.MessageParam => ({
    role: m.role === 'student' ? 'user' : 'assistant',
    content: [i === kept.length - 1
      ? { type: 'text', text: m.content, cache_control: CACHED }
      : { type: 'text', text: m.content }],
  }));
  return {
    system: [
      { type: 'text', text: tutorInstructions(mode), cache_control: CACHED },
      { type: 'text', text: tutorSessionLine(ctx) },
    ],
    messages: [
      ...past,
      { role: 'user', content: [{ type: 'text', text: tutorTurnContext(ctx) }, { type: 'text', text: message }] },
    ],
  };
}
