import { describe, expect, it } from 'vitest';
import { AIService } from '../ai.service.js';

describe('AIService without an Anthropic key', () => {
  it('says plainly that AI is not set up, instead of the SDK error', async () => {
    if (process.env.ANTHROPIC_API_KEY) return; // only meaningful where no key is configured
    await expect(AIService.generateCompletion('system', 'user')).rejects.toMatchObject({
      statusCode: 503,
      message: "AI isn't set up on this server yet. Ask your administrator to add the Anthropic API key.",
    });
  });
});
