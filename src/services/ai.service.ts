import { logger } from '../common/logger.js';
import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
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

async function callWithRetry(
  fn: () => Promise<Anthropic.Message>,
): Promise<Anthropic.Message> {
  try {
    return await fn();
  } catch (error: unknown) {
    const status =
      error instanceof Anthropic.APIError ? error.status : undefined;
    const retryableStatuses = [429, 500, 502, 503, 504];
    if (status && retryableStatuses.includes(status)) {
      logger.warn(`[AIService] Retrying after status ${status}...`);
      return await fn();
    }
    throw error;
  }
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
