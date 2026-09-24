import { describe, expect, it, vi } from 'vitest';

// Stub the config module so this test is deterministic regardless of
// whether a real ANTHROPIC_API_KEY happens to be set in the environment
// it runs in — previously the test just returned early (no assertions at
// all) whenever a key was configured, so it silently tested nothing there.
vi.mock('../../config/env.js', () => ({
  config: { anthropic: { apiKey: '', model: 'claude-sonnet-5' } },
}));

import { AIService } from '../ai.service.js';

describe('AIService without an Anthropic key', () => {
  it('says plainly that AI is not set up, instead of the SDK error', async () => {
    await expect(AIService.generateCompletion('system', 'user')).rejects.toMatchObject({
      statusCode: 503,
      message: "AI isn't set up on this server yet. Ask your administrator to add the Anthropic API key.",
    });
  });
});
