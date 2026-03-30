import Anthropic from '@anthropic-ai/sdk';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';
const MAX_CONCURRENT = 5;
const TIMEOUT_MS = 60_000;

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
    if (status === 429 || status === 500) {
      console.warn(`[AIService] Retrying after status ${status}...`);
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
      console.log(
        `[AIService] Tokens used — input: ${inputTokens}, output: ${outputTokens}`,
      );

      const textBlock = message.content.find((b) => b.type === 'text');
      return textBlock ? textBlock.text : '';
    } finally {
      releaseSemaphore();
    }
  }

  static async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
  ): Promise<T> {
    const raw = await AIService.generateCompletion(
      systemPrompt +
        '\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no explanation.',
      userPrompt,
      { temperature: 0.3 },
    );

    // Strip any accidental markdown fences
    const cleaned = raw
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return JSON.parse(cleaned) as T;
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
