import { logger } from '../common/logger.js';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const MAX_CONCURRENT = 5;
const TIMEOUT_MS = 180_000; // 3 minutes for content generation

let activeCalls = 0;
const waitQueue: Array<() => void> = [];

function acquireSemaphore(): Promise<void> {
  if (activeCalls < MAX_CONCURRENT) {
    activeCalls++;
    return Promise.resolve();
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

function getClient(): Anthropic {
  return new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

async function callWithRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      const status = (err as { status?: number })?.status;
      const retryable = status === 429 || (status !== undefined && status >= 500 && status < 600);
      if (!retryable || attempt === maxAttempts) throw err;
      const backoffMs = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s
      logger.warn(`[AIService] Retrying after status ${status} (attempt ${attempt}/${maxAttempts}, backoff ${backoffMs}ms)...`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
  throw lastError;
}

export class AIService {
  static async generateCompletion(
    systemPrompt: string,
    userPrompt: string,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<string> {
    const { text } = await AIService.generateCompletionWithUsage(systemPrompt, userPrompt, options);
    return text;
  }

  static async generateCompletionWithUsage(
    systemPrompt: string,
    userPrompt: string,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
    await acquireSemaphore();
    try {
      const client = getClient();

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const message = await callWithRetry(() =>
        client.messages.create(
          {
            model: ANTHROPIC_MODEL,
            max_tokens: options?.maxTokens ?? 4096,
            temperature: options?.temperature ?? 0.7,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
          },
          { signal: controller.signal },
        ),
      );

      clearTimeout(timeout);

      const inputTokens = message.usage?.input_tokens ?? 0;
      const outputTokens = message.usage?.output_tokens ?? 0;
      logger.info(
        `[AIService] Tokens used — input: ${inputTokens}, output: ${outputTokens}`,
      );

      const textBlock = message.content.find((b) => b.type === 'text');
      return {
        text: textBlock ? textBlock.text : '',
        usage: { input_tokens: inputTokens, output_tokens: outputTokens },
      };
    } finally {
      releaseSemaphore();
    }
  }

  static async generateChatCompletionWithUsage(
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
    await acquireSemaphore();
    try {
      const client = getClient();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const message = await callWithRetry(() =>
        client.messages.create(
          {
            model: ANTHROPIC_MODEL,
            max_tokens: options?.maxTokens ?? 2048,
            temperature: options?.temperature ?? 0.7,
            system: systemPrompt,
            messages,
          },
          { signal: controller.signal },
        ),
      );

      clearTimeout(timeout);

      const inputTokens = message.usage?.input_tokens ?? 0;
      const outputTokens = message.usage?.output_tokens ?? 0;
      logger.info(
        `[AIService] Chat tokens — input: ${inputTokens}, output: ${outputTokens}`,
      );

      const textBlock = message.content.find((b) => b.type === 'text');
      return {
        text: textBlock ? textBlock.text : '',
        usage: { input_tokens: inputTokens, output_tokens: outputTokens },
      };
    } finally {
      releaseSemaphore();
    }
  }

  /**
   * Stream a threaded chat completion. Calls `onDelta` for each text chunk as
   * tokens arrive. Resolves with the final text + token usage once the stream
   * completes. Errors propagate to the caller; the semaphore is always released.
   */
  static async streamChatCompletion(
    systemPrompt: string,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    onDelta: (chunk: string) => void,
    options?: { maxTokens?: number; temperature?: number; signal?: AbortSignal },
  ): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
    await acquireSemaphore();
    try {
      const client = getClient();

      const stream = client.messages.stream(
        {
          model: ANTHROPIC_MODEL,
          max_tokens: options?.maxTokens ?? 2048,
          temperature: options?.temperature ?? 0.7,
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
      const inputTokens = finalMessage.usage?.input_tokens ?? 0;
      const outputTokens = finalMessage.usage?.output_tokens ?? 0;
      logger.info(
        `[AIService] Stream tokens — input: ${inputTokens}, output: ${outputTokens}`,
      );

      return {
        text: fullText,
        usage: { input_tokens: inputTokens, output_tokens: outputTokens },
      };
    } finally {
      releaseSemaphore();
    }
  }

  static async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<T> {
    const { data } = await AIService.generateJSONWithUsage<T>(systemPrompt, userPrompt);
    return data;
  }

  static async generateJSONWithUsage<T>(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<{ data: T; usage: { input_tokens: number; output_tokens: number } }> {
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
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
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
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
    await acquireSemaphore();
    try {
      const client = getClient();

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS * 2);

      const content: Anthropic.MessageParam['content'] = [
        ...images.map(
          (img): Anthropic.ImageBlockParam => ({
            type: 'image',
            source: {
              type: 'base64',
              media_type: img.mediaType,
              data: img.base64,
            },
          }),
        ),
        { type: 'text', text: userText },
      ];

      const message = await callWithRetry(() =>
        client.messages.create(
          {
            model: ANTHROPIC_MODEL,
            max_tokens: options?.maxTokens ?? 4096,
            temperature: options?.temperature ?? 0.3,
            system: systemPrompt,
            messages: [{ role: 'user', content }],
          },
          { signal: controller.signal },
        ),
      );

      clearTimeout(timeout);

      const inputTokens = message.usage?.input_tokens ?? 0;
      const outputTokens = message.usage?.output_tokens ?? 0;
      logger.info(
        `[AIService] Vision (multi-image) tokens — input: ${inputTokens}, output: ${outputTokens}`,
      );

      const textBlock = message.content.find((b) => b.type === 'text');
      return {
        text: textBlock ? textBlock.text : '',
        usage: { input_tokens: inputTokens, output_tokens: outputTokens },
      };
    } finally {
      releaseSemaphore();
    }
  }

  static async generateAudioCompletion(
    systemPrompt: string,
    userText: string,
    audioBase64: string,
    audioMediaType: 'audio/mp4' | 'audio/mpeg' | 'audio/wav' | 'audio/webm' = 'audio/mp4',
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
    await acquireSemaphore();
    try {
      const client = getClient();

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 600_000); // 10 min for audio

      const message = await callWithRetry(() =>
        client.messages.create(
          {
            model: ANTHROPIC_MODEL,
            max_tokens: options?.maxTokens ?? 8192,
            temperature: options?.temperature ?? 0.2,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'input_audio',
                    source: { type: 'base64', media_type: audioMediaType, data: audioBase64 },
                  },
                  { type: 'text', text: userText },
                ] as unknown as Parameters<typeof client.messages.create>[0]['messages'][0]['content'],
              },
            ],
          },
          { signal: controller.signal },
        ),
      );

      clearTimeout(timeout);

      const inputTokens = message.usage?.input_tokens ?? 0;
      const outputTokens = message.usage?.output_tokens ?? 0;
      logger.info(
        `[AIService] Audio tokens — input: ${inputTokens}, output: ${outputTokens}`,
      );

      const text = message.content
        .filter((b) => b.type === 'text')
        .map((b) => (b as Anthropic.TextBlock).text)
        .join('');

      return {
        text,
        usage: { input_tokens: inputTokens, output_tokens: outputTokens },
      };
    } finally {
      releaseSemaphore();
    }
  }

  static async generateDocumentCompletion(
    systemPrompt: string,
    userText: string,
    documentBase64: string,
    mediaType: 'application/pdf' | 'image/jpeg' | 'image/png' | 'image/webp',
    options?: { maxTokens?: number; temperature?: number },
  ): Promise<{ text: string; usage: { input_tokens: number; output_tokens: number } }> {
    // For images, delegate to the vision method
    if (mediaType !== 'application/pdf') {
      return this.generateVisionCompletion(
        systemPrompt, userText, documentBase64,
        mediaType as 'image/jpeg' | 'image/png' | 'image/webp',
        options,
      );
    }

    await acquireSemaphore();
    try {
      const client = getClient();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS * 2);

      const message = await callWithRetry(() =>
        client.messages.create(
          {
            model: ANTHROPIC_MODEL,
            max_tokens: options?.maxTokens ?? 8192,
            temperature: options?.temperature ?? 0.3,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'document',
                    source: {
                      type: 'base64',
                      media_type: 'application/pdf',
                      data: documentBase64,
                    },
                  } as Anthropic.DocumentBlockParam,
                  {
                    type: 'text',
                    text: userText,
                  },
                ],
              },
            ],
          },
          { signal: controller.signal },
        ),
      );

      clearTimeout(timeout);

      const inputTokens = message.usage?.input_tokens ?? 0;
      const outputTokens = message.usage?.output_tokens ?? 0;
      logger.info(`[AIService] Document tokens — input: ${inputTokens}, output: ${outputTokens}`);

      const textBlock = message.content.find((b) => b.type === 'text');
      return {
        text: textBlock ? textBlock.text : '',
        usage: { input_tokens: inputTokens, output_tokens: outputTokens },
      };
    } finally {
      releaseSemaphore();
    }
  }

  static getTokenUsage(message: Anthropic.Message): {
    input: number;
    output: number;
  } {
    return {
      input: message.usage?.input_tokens ?? 0,
      output: message.usage?.output_tokens ?? 0,
    };
  }
}
