// src/modules/Evidence/ai-transport.ts
//
// Every Phase E model call goes through here and then AIService (plan
// rulings P2, P3, P16): Message Batches by default (half price), the plain
// Messages API in direct mode, canned replies in fixture mode (dev and tests).
import type Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod/v4';
import { config } from '../../config/env.js';
import { AppError } from '../../common/errors.js';
import { AIService } from '../../services/ai.service.js';
import { fixtureReply } from './ai-fixture.js';

export type PromptKind = 'diagnosis' | 'seed' | 'tagging' | 'tidy';
export type TransportMode = 'batch' | 'direct' | 'fixture';
/** What fixture mode needs to answer without reading the prompt. */
export interface FixtureHint { refs?: string[]; codes?: string[] }
export interface EvidencePrompt { customId: string; kind: PromptKind; system: string; user: string; maxTokens: number; hint: FixtureHint }
export interface EvidenceReply {
  customId: string; ok: boolean; text: string; usage: { input: number; output: number }; error: string | null; retryable: boolean;
}

const NO_USAGE = { input: 0, output: 0 };

export function transportMode(): TransportMode {
  const mode = config.evidence.mode;
  if (mode === 'fixture') {
    if (config.nodeEnv === 'production') throw new Error('EVIDENCE_DIAGNOSIS_MODE=fixture is for development and tests only');
    return 'fixture';
  }
  return mode === 'direct' ? 'direct' : 'batch';
}

export async function sendDirect(prompt: EvidencePrompt, mode: TransportMode = transportMode()): Promise<EvidenceReply> {
  if (mode === 'fixture') return fixtureReply(prompt);
  try {
    const { text, usage } = await AIService.generateCompletionWithUsage(prompt.system, prompt.user, {
      model: config.anthropic.diagnosisModel, maxTokens: prompt.maxTokens, temperature: 0,
    });
    return { customId: prompt.customId, ok: true, text, usage: { input: usage.input_tokens, output: usage.output_tokens }, error: null, retryable: false };
  } catch (err: unknown) {
    const code = err instanceof AppError ? String(err.code ?? 'AI_ERROR') : 'AI_ERROR';
    return { customId: prompt.customId, ok: false, text: '', usage: NO_USAGE, error: code, retryable: code !== 'AI_REQUEST_REJECTED' };
  }
}

export async function submitBatch(prompts: readonly EvidencePrompt[]): Promise<string> {
  const batch = await AIService.createMessageBatch(
    prompts.map((p: EvidencePrompt) => AIService.batchRequest(p.customId, p.system, p.user, { maxTokens: p.maxTokens })),
  );
  return batch.id;
}

function toReply(line: Anthropic.Messages.MessageBatchIndividualResponse): EvidenceReply {
  const r = line.result;
  if (r.type === 'succeeded') {
    const block = r.message.content.find((b) => b.type === 'text');
    return {
      customId: line.custom_id, ok: true, text: block?.type === 'text' ? block.text : '', error: null, retryable: false,
      usage: { input: r.message.usage?.input_tokens ?? 0, output: r.message.usage?.output_tokens ?? 0 },
    };
  }
  if (r.type === 'errored') {
    const type = r.error?.error?.type ?? 'errored';
    return { customId: line.custom_id, ok: false, text: '', usage: NO_USAGE, error: type, retryable: type !== 'invalid_request_error' };
  }
  return { customId: line.custom_id, ok: false, text: '', usage: NO_USAGE, error: r.type, retryable: true };
}

/** Until the batch has ended there is nothing to read; afterwards every line, in any order. */
export async function collectBatch(batchId: string): Promise<{ ended: boolean; replies: EvidenceReply[] }> {
  const batch = await AIService.retrieveMessageBatch(batchId);
  if (batch.processing_status !== 'ended') return { ended: false, replies: [] };
  return { ended: true, replies: (await AIService.messageBatchResults(batchId)).map(toReply) };
}

export function parseReply<T>(text: string, schema: z.ZodType<T>): T | null {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const parsed = schema.safeParse(JSON.parse(cleaned));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
