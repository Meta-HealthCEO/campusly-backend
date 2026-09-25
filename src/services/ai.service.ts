import { logger } from '../common/logger.js';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config/env.js';
import { AppError } from '../common/errors.js';
import { samplingParams } from './ai-model-capabilities.js';
import { aiAppError, toAIError } from './ai-errors.js';

const ANTHROPIC_API_KEY = config.anthropic.apiKey;
const ANTHROPIC_MODEL = config.anthropic.model;
const MAX_CONCURRENT = 5;
const TIMEOUT_MS = 180_000; // 3 minutes for content generation, across all retries

/**
 * The only retry layer. The SDK retries 408, 409, 429, 5xx (529 overloaded
 * included) and connection failures with backoff and honours retry-after, so
 * one call makes at most AI_MAX_RETRIES + 1 HTTP attempts.
 */
export const AI_MAX_RETRIES = 2;

type Usage = { input_tokens: number; output_tokens: number };
type TextResult = { text: string; usage: Usage };
/** A system prompt: plain text, or text blocks that may carry cache breakpoints. */
type SystemPrompt = string | Anthropic.TextBlockParam[];

/** Token usage of one chat call, including prompt-cache reads and writes. */
export interface ChatUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}
type ChatResult = { text: string; usage: ChatUsage };
type Options = { maxTokens?: number; temperature?: number };

let activeCalls = 0;
const waitQueue: Array<() => void> = [];

/**
 * At most this many calls wait for a free slot. Beyond it a new call is
 * refused at once with the plain "AI is busy" error (503 AI_BUSY) instead of
 * queueing without bound (release review I1).
 */
export const AI_MAX_QUEUED = 200;

function acquireSemaphore(): Promise<void> {
  if (activeCalls < MAX_CONCURRENT) {
    activeCalls++;
    return Promise.resolve();
  }
  if (waitQueue.length >= AI_MAX_QUEUED) {
    logger.warn({ waiting: waitQueue.length }, '[AIService] wait queue full; refusing a call as busy');
    return Promise.reject(aiAppError('BUSY'));
  }
  return new Promise<void>((resolve) => {
    waitQueue.push(() => {
      activeCalls++;
      resolve();
    });
  });
}

function releaseSemaphore(): void {
  activeCalls--;
  const next = waitQueue.shift();
  if (next) next();
}

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

function usageOf(message: Anthropic.Message, label: string): Usage {
  const usage = {
    input_tokens: message.usage?.input_tokens ?? 0,
    output_tokens: message.usage?.output_tokens ?? 0,
  };
  logger.info(`[AIService] ${label} tokens — input: ${usage.input_tokens}, output: ${usage.output_tokens}`);
  return usage;
}

function chatUsageOf(message: Anthropic.Message, label: string): ChatUsage {
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

function firstText(message: Anthropic.Message): string {
  const textBlock = message.content.find((b) => b.type === 'text');
  return textBlock ? textBlock.text : '';
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
    const message = await sendMessage('generateCompletion', {
      model: ANTHROPIC_MODEL,
      max_tokens: options?.maxTokens ?? 4096,
      ...samplingParams(ANTHROPIC_MODEL, options?.temperature ?? 0.7),
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
  ): Promise<{ data: T; usage: Usage }> {
    const { text, usage } = await AIService.generateCompletionWithUsage(
      systemPrompt +
        '\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no explanation.',
      userPrompt,
      { temperature: 0.3 },
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
}
