// src/services/ai-usage.ts
//
// Token usage of a Claude reply, logged and returned to callers, and the reply
// text. Moved unchanged from ai.service.ts (a pure move, to stay under 350
// lines); ai.service.ts re-exports ChatUsage.
import type Anthropic from '@anthropic-ai/sdk';
import { logger } from '../common/logger.js';

export type Usage = { input_tokens: number; output_tokens: number };
export type TextResult = { text: string; usage: Usage };
/** Token usage of one chat call, including prompt-cache reads and writes. */
export interface ChatUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}
export type ChatResult = { text: string; usage: ChatUsage };

export function usageOf(message: Anthropic.Message, label: string): Usage {
  const usage = {
    input_tokens: message.usage?.input_tokens ?? 0,
    output_tokens: message.usage?.output_tokens ?? 0,
  };
  logger.info(`[AIService] ${label} tokens — input: ${usage.input_tokens}, output: ${usage.output_tokens}`);
  return usage;
}

export function chatUsageOf(message: Anthropic.Message, label: string): ChatUsage {
  const u = message.usage;
  const usage: ChatUsage = {
    input_tokens: u?.input_tokens ?? 0,
    output_tokens: u?.output_tokens ?? 0,
    cache_read_input_tokens: u?.cache_read_input_tokens ?? 0,
    cache_creation_input_tokens: u?.cache_creation_input_tokens ?? 0,
  };
  logger.info(
    `[AIService] ${label} tokens — input: ${usage.input_tokens}, output: ${usage.output_tokens}, `
    + `cache read: ${usage.cache_read_input_tokens}, cache write: ${usage.cache_creation_input_tokens}`,
  );
  return usage;
}

export function firstText(message: Anthropic.Message): string {
  const textBlock = message.content.find((b) => b.type === 'text');
  return textBlock ? textBlock.text : '';
}
