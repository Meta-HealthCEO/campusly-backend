import { logger } from '../common/logger.js';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env.js';
import { AppError } from '../common/errors.js';
import { samplingParams } from './ai-model-capabilities.js';
import { aiAppError, toAIError } from './ai-errors.js';
import { acquireSemaphore, releaseSemaphore } from './ai-semaphore.js';
import { chatUsageOf, firstText, usageOf, type ChatResult, type TextResult, type Usage } from './ai-usage.js';

// The concurrency limit (and its bounded wait queue) and the token-usage helpers live
// in ai-semaphore.ts and ai-usage.ts, split out to stay under 350 lines.
export { AI_MAX_QUEUED } from './ai-semaphore.js';
export type { ChatUsage } from './ai-usage.js';

const ANTHROPIC_API_KEY = config.anthropic.apiKey;
const ANTHROPIC_MODEL = config.anthropic.model;
const TIMEOUT_MS = 180_000; // 3 minutes for content generation, across all retries

/**
 * The only retry layer. The SDK retries 408, 409, 429, 5xx (529 overloaded
 * included) and connection failures with backoff and honours retry-after, so
 * one call makes at most AI_MAX_RETRIES + 1 HTTP attempts.
 */
export const AI_MAX_RETRIES = 2;

/** A system prompt: plain text, or text blocks that may carry cache breakpoints. */
type SystemPrompt = string | Anthropic.TextBlockParam[];

type Options = { maxTokens?: number; temperature?: number; model?: string };

function assertKey(): void {
  // Without a key the SDK fails with an authentication riddle; say what's actually wrong.
  if (!ANTHROPIC_API_KEY) {
    throw new AppError(
      "AI isn't set up on this server yet. Ask your administrator to add the Anthropic API key.",
      503,
      true,
      { code: 'AI_NOT_CONFIGURED' },
    );
  }
}

function getClient(): Anthropic {
  assertKey();
  return new Anthropic({ apiKey: ANTHROPIC_API_KEY, maxRetries: AI_MAX_RETRIES });
}

/**
 * Send one non-streaming request: one concurrency slot, an overall deadline
 * across the SDK's retries, and any API failure turned into a logged AppError.
 */
async function sendMessage(
  path: string,
  body: Anthropic.MessageCreateParamsNonStreaming,
  timeoutMs = TIMEOUT_MS,
): Promise<Anthropic.Message> {
  await acquireSemaphore();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await getClient().messages.create(body, { signal: controller.signal });
  } catch (err: unknown) {
    throw toAIError(err, { path, model: body.model, timedOut: controller.signal.aborted });
  } finally {
    clearTimeout(timer);
    releaseSemaphore();
  }
}

const DIAGNOSIS_MODEL = config.anthropic.diagnosisModel;

/** One Message Batches call with the key check and plain AI errors; the SDK's own retries apply. */
async function batchCall<T>(path: string, run: (client: Anthropic) => Promise<T>): Promise<T> {
  try {
    return await run(getClient());
  } catch (err: unknown) {
    throw toAIError(err, { path, model: DIAGNOSIS_MODEL });
  }
}

export class AIService {
  /** Throws the plain "AI isn't set up" error when there is no key, before any work starts. */
  static assertConfigured(): void {
    assertKey();
  }

  /**
   * Audio input isn't accepted by the Messages API, so transcription can't run.
   * Throws AI_AUDIO_UNSUPPORTED (501); callers check before fetching any audio.
   * Typed void, not never, so the transcription pipeline after the check stays live code.
   */
  static assertAudioSupported(): void {
    throw aiAppError('AUDIO_UNSUPPORTED');
  }

  static async generateCompletion(systemPrompt: string, userPrompt: string, options?: Options): Promise<string> {
    const { text } = await AIService.generateCompletionWithUsage(systemPrompt, userPrompt, options);
    return text;
  }

  static async generateCompletionWithUsage(
    systemPrompt: string,
    userPrompt: string,
    options?: Options,
  ): Promise<TextResult> {
    const model = options?.model ?? ANTHROPIC_MODEL;
    const message = await sendMessage('generateCompletion', {
      model,
      max_tokens: options?.maxTokens ?? 4096,
      ...samplingParams(model, options?.temperature ?? 0.7),
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    return { text: firstText(message), usage: usageOf(message, 'Completion') };
  }

  static async generateChatCompletionWithUsage(
    systemPrompt: SystemPrompt,
    messages: Anthropic.MessageParam[],
    options?: Options,
  ): Promise<ChatResult> {
    const message = await sendMessage('generateChatCompletion', {
      model: ANTHROPIC_MODEL,
      max_tokens: options?.maxTokens ?? 2048,
      ...samplingParams(ANTHROPIC_MODEL, options?.temperature ?? 0.7),
      system: systemPrompt,
      messages,
    });
    return { text: firstText(message), usage: chatUsageOf(message, 'Chat') };
  }

  /**
   * Stream a threaded chat completion. Calls `onDelta` for each text chunk as
   * tokens arrive. Resolves with the final text + token usage once the stream
   * completes. API failures reject with a logged AppError; a cancellation via
   * `options.signal` rejects with the SDK's abort error. The semaphore is always released.
   */
  static async streamChatCompletion(
    systemPrompt: SystemPrompt,
    messages: Anthropic.MessageParam[],
    onDelta: (chunk: string) => void,
    options?: Options & { signal?: AbortSignal },
  ): Promise<ChatResult> {
    await acquireSemaphore();
    try {
      const stream = getClient().messages.stream(
        {
          model: ANTHROPIC_MODEL,
          max_tokens: options?.maxTokens ?? 2048,
          ...samplingParams(ANTHROPIC_MODEL, options?.temperature ?? 0.7),
          system: systemPrompt,
          messages,
        },
        options?.signal ? { signal: options.signal } : undefined,
      );

      let fullText = '';
      stream.on('text', (delta: string) => {
        fullText += delta;
        try {
          onDelta(delta);
        } catch {
          // swallow downstream write errors so the stream still finalizes cleanly
        }
      });

      const finalMessage = await stream.finalMessage();
      return { text: fullText, usage: chatUsageOf(finalMessage, 'Stream') };
    } catch (err: unknown) {
      throw toAIError(err, { path: 'streamChatCompletion', model: ANTHROPIC_MODEL });
    } finally {
      releaseSemaphore();
    }
  }

  static async generateJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    const { data } = await AIService.generateJSONWithUsage<T>(systemPrompt, userPrompt);
    return data;
  }

  static async generateJSONWithUsage<T>(
    systemPrompt: string,
    userPrompt: string,
    options?: Options,
  ): Promise<{ data: T; usage: Usage }> {
    const { text, usage } = await AIService.generateCompletionWithUsage(
      systemPrompt +
        '\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no explanation.',
      userPrompt,
      { temperature: 0.3, ...options },
    );

    // Strip any accidental markdown fences
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return { data: JSON.parse(cleaned) as T, usage };
  }

  /** Single-image convenience wrapper — delegates to generateVisionCompletionWithImages. */
  static async generateVisionCompletion(
    systemPrompt: string,
    userText: string,
    imageBase64: string,
    imageMediaType: 'image/jpeg' | 'image/png' | 'image/webp',
    options?: Options,
  ): Promise<TextResult> {
    return this.generateVisionCompletionWithImages(
      systemPrompt,
      userText,
      [{ base64: imageBase64, mediaType: imageMediaType }],
      options,
    );
  }

  static async generateVisionCompletionWithImages(
    systemPrompt: string,
    userText: string,
    images: Array<{ base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }>,
    options?: Options,
  ): Promise<TextResult> {
    const content: Anthropic.MessageParam['content'] = [
      ...images.map(
        (img): Anthropic.ImageBlockParam => ({
          type: 'image',
          source: { type: 'base64', media_type: img.mediaType, data: img.base64 },
        }),
      ),
      { type: 'text', text: userText },
    ];

    const message = await sendMessage(
      'generateVisionCompletion',
      {
        model: ANTHROPIC_MODEL,
        max_tokens: options?.maxTokens ?? 4096,
        ...samplingParams(ANTHROPIC_MODEL, options?.temperature ?? 0.3),
        system: systemPrompt,
        messages: [{ role: 'user', content }],
      },
      TIMEOUT_MS * 2,
    );
    return { text: firstText(message), usage: usageOf(message, 'Vision (multi-image)') };
  }

  /**
   * Not available: the Messages API accepts no audio input, so this fails fast
   * with AI_AUDIO_UNSUPPORTED (501) and never calls the API. The signature is
   * kept so callers compile unchanged.
   */
  static async generateAudioCompletion(
    _systemPrompt: string,
    _userText: string,
    _audioBase64: string,
    _audioMediaType: 'audio/mp4' | 'audio/mpeg' | 'audio/wav' | 'audio/webm' = 'audio/mp4',
    _options?: Options,
  ): Promise<TextResult> {
    throw aiAppError('AUDIO_UNSUPPORTED');
  }

  static async generateDocumentCompletion(
    systemPrompt: string,
    userText: string,
    documentBase64: string,
    mediaType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp',
    options?: Options,
  ): Promise<TextResult> {
    // For images, delegate to the vision method
    if (mediaType !== 'application/pdf') {
      return this.generateVisionCompletion(systemPrompt, userText, documentBase64, mediaType, options);
    }

    const message = await sendMessage(
      'generateDocumentCompletion',
      {
        model: ANTHROPIC_MODEL,
        max_tokens: options?.maxTokens ?? 8192,
        ...samplingParams(ANTHROPIC_MODEL, options?.temperature ?? 0.3),
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: { type: 'base64', media_type: 'application/pdf', data: documentBase64 },
              } as Anthropic.DocumentBlockParam,
              { type: 'text', text: userText },
            ],
          },
        ],
      },
      TIMEOUT_MS * 2,
    );
    return { text: firstText(message), usage: usageOf(message, 'Document') };
  }

  static getTokenUsage(message: Anthropic.Message): { input: number; output: number } {
    return {
      input: message.usage?.input_tokens ?? 0,
      output: message.usage?.output_tokens ?? 0,
    };
  }

  /** One Message Batches request on the diagnosis model (or `options.model`), no sampling for current models. */
  static batchRequest(
    customId: string, systemPrompt: string, userPrompt: string, options: { maxTokens: number; model?: string },
  ): Anthropic.Messages.BatchCreateParams.Request {
    const model = options.model ?? DIAGNOSIS_MODEL;
    return {
      custom_id: customId,
      params: {
        model, max_tokens: options.maxTokens, ...samplingParams(model, 0),
        system: systemPrompt, messages: [{ role: 'user', content: userPrompt }],
      },
    };
  }

  static createMessageBatch(requests: Anthropic.Messages.BatchCreateParams.Request[]): Promise<Anthropic.Messages.MessageBatch> {
    return batchCall('createMessageBatch', (c) => c.messages.batches.create({ requests }));
  }

  static retrieveMessageBatch(batchId: string): Promise<Anthropic.Messages.MessageBatch> {
    return batchCall('retrieveMessageBatch', (c) => c.messages.batches.retrieve(batchId));
  }

  /** Every result line of an ended batch. Lines arrive in any order: match them by `custom_id`. */
  static messageBatchResults(batchId: string): Promise<Anthropic.Messages.MessageBatchIndividualResponse[]> {
    return batchCall('messageBatchResults', async (c) => {
      const lines: Anthropic.Messages.MessageBatchIndividualResponse[] = [];
      for await (const line of await c.messages.batches.results(batchId)) lines.push(line);
      return lines;
    });
  }
}
