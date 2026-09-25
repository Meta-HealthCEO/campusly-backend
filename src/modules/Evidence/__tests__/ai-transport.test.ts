// src/modules/Evidence/__tests__/ai-transport.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

const h = vi.hoisted(() => ({
  config: { nodeEnv: 'test', anthropic: { diagnosisModel: 'claude-sonnet-5' }, evidence: { mode: 'batch', enabled: true } },
  completion: vi.fn(), batchRequest: vi.fn(), createBatch: vi.fn(), retrieveBatch: vi.fn(), batchResults: vi.fn(),
}));
vi.mock('../../../config/env.js', () => ({ config: h.config }));
vi.mock('../../../services/ai.service.js', () => ({
  AIService: {
    generateCompletionWithUsage: h.completion, batchRequest: h.batchRequest, createMessageBatch: h.createBatch,
    retrieveMessageBatch: h.retrieveBatch, messageBatchResults: h.batchResults,
  },
}));

import { AppError } from '../../../common/errors.js';
import { collectBatch, parseReply, sendDirect, submitBatch, transportMode, type EvidencePrompt } from '../ai-transport.js';
import { FIXTURE_EXPLANATION, fixtureReply } from '../ai-fixture.js';

const prompt = (over: Partial<EvidencePrompt> = {}): EvidencePrompt => ({
  customId: 'dx_1', kind: 'diagnosis', system: 'sys', user: 'user', maxTokens: 800, hint: { refs: ['a1', 'a2'], codes: ['T.sign-error'] }, ...over,
});

beforeEach(() => {
  for (const fn of [h.completion, h.batchRequest, h.createBatch, h.retrieveBatch, h.batchResults]) fn.mockReset();
  h.config.nodeEnv = 'test';
  h.config.evidence.mode = 'batch';
});

describe('transportMode', () => {
  it('defaults to batch and refuses fixture replies in production', () => {
    expect(transportMode()).toBe('batch');
    h.config.evidence.mode = 'fixture';
    expect(transportMode()).toBe('fixture');
    h.config.nodeEnv = 'production';
    expect(() => transportMode()).toThrow('EVIDENCE_DIAGNOSIS_MODE=fixture is for development and tests only');
  });
});

describe('sendDirect', () => {
  it('asks AIService on the diagnosis model', async () => {
    h.completion.mockResolvedValue({ text: '{"items":[]}', usage: { input_tokens: 900, output_tokens: 80 } });
    const reply = await sendDirect(prompt(), 'direct');
    expect(h.completion).toHaveBeenCalledWith('sys', 'user', { model: 'claude-sonnet-5', maxTokens: 800, temperature: 0 });
    expect(reply).toMatchObject({ ok: true, usage: { input: 900, output: 80 } });
  });

  it('a busy AI is a retryable failure; a rejected request is not', async () => {
    h.completion.mockRejectedValueOnce(new AppError('busy', 503, true, { code: 'AI_BUSY' }));
    expect(await sendDirect(prompt(), 'direct')).toMatchObject({ ok: false, error: 'AI_BUSY', retryable: true });
    h.completion.mockRejectedValueOnce(new AppError('no', 502, true, { code: 'AI_REQUEST_REJECTED' }));
    expect(await sendDirect(prompt(), 'direct')).toMatchObject({ ok: false, retryable: false });
  });

  it('fixture mode answers without calling the AI', async () => {
    const reply = await sendDirect(prompt(), 'fixture');
    expect(h.completion).not.toHaveBeenCalled();
    expect(JSON.parse(reply.text).items).toEqual([
      { ref: 'a1', code: 'T.sign-error', explanation: FIXTURE_EXPLANATION, confidence: 0.8, checkMark: false },
      { ref: 'a2', code: 'T.sign-error', explanation: FIXTURE_EXPLANATION, confidence: 0.8, checkMark: false },
    ]);
    expect(reply.usage).toEqual({ input: 0, output: 0 });
  });

  it.each(['seed', 'tagging', 'tidy'] as const)('fixture mode has a valid %s reply', (kind) => {
    expect(() => JSON.parse(fixtureReply(prompt({ kind })).text)).not.toThrow();
  });
});

describe('batches', () => {
  it('submits one request per prompt and returns the batch id', async () => {
    h.batchRequest.mockImplementation((id: string) => ({ custom_id: id }));
    h.createBatch.mockResolvedValue({ id: 'msgbatch_9' });
    expect(await submitBatch([prompt(), prompt({ customId: 'dx_2' })])).toBe('msgbatch_9');
    expect(h.createBatch).toHaveBeenCalledWith([{ custom_id: 'dx_1' }, { custom_id: 'dx_2' }]);
  });

  it('waits while the batch runs, then maps every line by custom_id', async () => {
    h.retrieveBatch.mockResolvedValueOnce({ processing_status: 'in_progress' });
    expect(await collectBatch('msgbatch_9')).toEqual({ ended: false, replies: [] });
    h.retrieveBatch.mockResolvedValueOnce({ processing_status: 'ended' });
    h.batchResults.mockResolvedValue([
      { custom_id: 'dx_3', result: { type: 'expired' } },
      { custom_id: 'dx_1', result: { type: 'succeeded', message: { content: [{ type: 'text', text: '{}' }], usage: { input_tokens: 5, output_tokens: 2 } } } },
      { custom_id: 'dx_2', result: { type: 'errored', error: { type: 'error', error: { type: 'invalid_request_error', message: 'bad' } } } },
    ]);
    const { replies } = await collectBatch('msgbatch_9');
    const byId = new Map(replies.map((r) => [r.customId, r]));
    expect(byId.get('dx_1')).toMatchObject({ ok: true, text: '{}', usage: { input: 5, output: 2 } });
    expect(byId.get('dx_2')).toMatchObject({ ok: false, error: 'invalid_request_error', retryable: false });
    expect(byId.get('dx_3')).toMatchObject({ ok: false, error: 'expired', retryable: true });
  });
});

describe('parseReply', () => {
  const schema = z.object({ a: z.number() });
  it('strips a code fence and validates', () => {
    expect(parseReply('```json\n{"a":1}\n```', schema)).toEqual({ a: 1 });
    expect(parseReply('{"a":"x"}', schema)).toBeNull();
    expect(parseReply('not json', schema)).toBeNull();
  });
});
