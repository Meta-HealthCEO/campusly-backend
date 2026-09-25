// src/services/__tests__/ai-batches.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIError } from '@anthropic-ai/sdk';

// Message Batches go through AIService like every other call: the configured
// diagnosis model, no sampling for current models, SDK errors turned into
// plain AI errors. The SDK is mocked; no network.
const h = vi.hoisted(() => ({
  create: vi.fn(),
  batchCreate: vi.fn(),
  batchRetrieve: vi.fn(),
  batchResults: vi.fn(),
  config: { anthropic: { apiKey: 'test-key', model: 'claude-sonnet-5', diagnosisModel: 'claude-sonnet-5' } },
}));

vi.mock('../../config/env.js', () => ({ config: h.config }));
vi.mock('../../common/logger.js', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('@anthropic-ai/sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@anthropic-ai/sdk')>()),
  default: class {
    messages = { create: h.create, batches: { create: h.batchCreate, retrieve: h.batchRetrieve, results: h.batchResults } };
  },
}));

async function service(diagnosisModel: string): Promise<typeof import('../ai.service.js').AIService> {
  h.config.anthropic.diagnosisModel = diagnosisModel;
  vi.resetModules();
  return (await import('../ai.service.js')).AIService;
}

beforeEach(() => {
  for (const fn of [h.create, h.batchCreate, h.batchRetrieve, h.batchResults]) fn.mockReset();
});

describe('AIService Message Batches', () => {
  it('builds a request on the diagnosis model with no sampling for a current model', async () => {
    const ai = await service('claude-sonnet-5');
    expect(ai.batchRequest('dx_1', 'sys', 'user', { maxTokens: 900 })).toEqual({
      custom_id: 'dx_1',
      params: { model: 'claude-sonnet-5', max_tokens: 900, system: 'sys', messages: [{ role: 'user', content: 'user' }] },
    });
  });

  it('sends temperature 0 only to a model that accepts it', async () => {
    const ai = await service('claude-haiku-4-5');
    expect(ai.batchRequest('dx_2', 'sys', 'user', { maxTokens: 900 }).params).toMatchObject({ model: 'claude-haiku-4-5', temperature: 0 });
  });

  it('creates, retrieves and reads a batch through the SDK', async () => {
    const ai = await service('claude-sonnet-5');
    h.batchCreate.mockResolvedValue({ id: 'msgbatch_1', processing_status: 'in_progress' });
    h.batchRetrieve.mockResolvedValue({ id: 'msgbatch_1', processing_status: 'ended' });
    h.batchResults.mockResolvedValue((async function* lines() {
      yield { custom_id: 'dx_2', result: { type: 'expired' } };
      yield { custom_id: 'dx_1', result: { type: 'succeeded', message: { content: [{ type: 'text', text: '{}' }] } } };
    })());
    const request = ai.batchRequest('dx_1', 'sys', 'user', { maxTokens: 900 });

    expect((await ai.createMessageBatch([request])).id).toBe('msgbatch_1');
    expect(h.batchCreate).toHaveBeenCalledWith({ requests: [request] });
    expect((await ai.retrieveMessageBatch('msgbatch_1')).processing_status).toBe('ended');
    expect((await ai.messageBatchResults('msgbatch_1')).map((r) => r.custom_id)).toEqual(['dx_2', 'dx_1']);
  });

  it('turns an SDK failure into a plain AI error', async () => {
    const ai = await service('claude-sonnet-5');
    h.batchCreate.mockRejectedValue(
      APIError.generate(529, { type: 'error', error: { type: 'overloaded_error', message: 'x' } }, undefined, new Headers()),
    );
    await expect(ai.createMessageBatch([])).rejects.toMatchObject({ statusCode: 503, code: 'AI_BUSY' });
  });

  it('a completion can run on another model', async () => {
    const ai = await service('claude-sonnet-5');
    h.create.mockResolvedValue({ usage: { input_tokens: 1, output_tokens: 1 }, content: [{ type: 'text', text: '{"a":1}' }] });
    const { data } = await ai.generateJSONWithUsage<{ a: number }>('sys', 'user', { model: 'claude-haiku-4-5', maxTokens: 500 });
    expect(data.a).toBe(1);
    expect(h.create.mock.calls[0][0]).toMatchObject({ model: 'claude-haiku-4-5', max_tokens: 500 });
  });
});
