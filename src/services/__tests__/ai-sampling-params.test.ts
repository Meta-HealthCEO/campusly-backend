import { beforeEach, describe, expect, it, vi } from 'vitest';

// Every AI send path must leave temperature / top_p / top_k off the request
// for current Claude models (they answer with a 400), and keep sending the
// caller's temperature to older models that accept it. The Anthropic SDK is
// mocked so the request body each path builds can be inspected; no network,
// no Mongo.
const h = vi.hoisted(() => ({
  create: vi.fn(),
  stream: vi.fn(),
  config: { anthropic: { apiKey: 'test-key', model: 'claude-sonnet-5' } },
}));

vi.mock('../../config/env.js', () => ({ config: h.config }));
vi.mock('@anthropic-ai/sdk', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@anthropic-ai/sdk')>()),
  default: class {
    messages = { create: h.create, stream: h.stream };
  },
}));

type Service = typeof import('../ai.service.js').AIService;

async function loadServiceFor(model: string): Promise<Service> {
  h.config.anthropic.model = model;
  vi.resetModules();
  const mod = await import('../ai.service.js');
  return mod.AIService;
}

const RESPONSE = {
  usage: { input_tokens: 1, output_tokens: 1 },
  content: [{ type: 'text', text: '{}' }],
};

const SAMPLING_KEYS = ['temperature', 'top_p', 'top_k'];

interface SendPath {
  name: string;
  api: 'create' | 'stream';
  /** The temperature this path asks for (the caller's, or the path's own). */
  temperature: number;
  send: (svc: Service) => Promise<unknown>;
}

const chat = [{ role: 'user' as const, content: 'hi' }];

const SEND_PATHS: SendPath[] = [
  { name: 'generateCompletion', api: 'create', temperature: 0.5,
    send: (s) => s.generateCompletion('sys', 'user', { temperature: 0.5 }) },
  { name: 'generateCompletionWithUsage', api: 'create', temperature: 0.5,
    send: (s) => s.generateCompletionWithUsage('sys', 'user', { temperature: 0.5 }) },
  { name: 'generateJSON', api: 'create', temperature: 0.3,
    send: (s) => s.generateJSON('sys', 'user') },
  { name: 'generateChatCompletionWithUsage', api: 'create', temperature: 0.5,
    send: (s) => s.generateChatCompletionWithUsage('sys', chat, { temperature: 0.5 }) },
  { name: 'streamChatCompletion', api: 'stream', temperature: 0.5,
    send: (s) => s.streamChatCompletion('sys', chat, () => undefined, { temperature: 0.5 }) },
  { name: 'generateVisionCompletion', api: 'create', temperature: 0.5,
    send: (s) => s.generateVisionCompletion('sys', 'look', 'aGk=', 'image/png', { temperature: 0.5 }) },
  { name: 'generateVisionCompletionWithImages', api: 'create', temperature: 0.5,
    send: (s) => s.generateVisionCompletionWithImages(
      'sys', 'look', [{ base64: 'aGk=', mediaType: 'image/jpeg' }], { temperature: 0.5 }) },
  { name: 'generateDocumentCompletion (pdf)', api: 'create', temperature: 0.5,
    send: (s) => s.generateDocumentCompletion('sys', 'read', 'aGk=', 'application/pdf', { temperature: 0.5 }) },
];

function sentBody(api: 'create' | 'stream'): Record<string, unknown> {
  const mock = api === 'create' ? h.create : h.stream;
  expect(mock).toHaveBeenCalledTimes(1);
  return mock.mock.calls[0][0] as Record<string, unknown>;
}

beforeEach(() => {
  h.create.mockReset().mockResolvedValue(RESPONSE);
  h.stream.mockReset().mockImplementation(() => ({
    on: vi.fn(),
    finalMessage: vi.fn().mockResolvedValue(RESPONSE),
  }));
});

describe.each(['claude-sonnet-5', 'claude-opus-5', 'claude-fable-5-1', 'claude-opus-4-8'])(
  'AIService on %s (sampling removed)',
  (model) => {
    it.each(SEND_PATHS)('$name sends no temperature / top_p / top_k', async (path) => {
      const svc = await loadServiceFor(model);
      await path.send(svc);
      const body = sentBody(path.api);
      expect(body.model).toBe(model);
      for (const key of SAMPLING_KEYS) expect(Object.keys(body)).not.toContain(key);
    });
  },
);

describe.each(['claude-haiku-4-5', 'claude-sonnet-4-6'])(
  'AIService on %s (sampling accepted)',
  (model) => {
    it.each(SEND_PATHS)('$name still sends the requested temperature', async (path) => {
      const svc = await loadServiceFor(model);
      await path.send(svc);
      const body = sentBody(path.api);
      expect(body.model).toBe(model);
      expect(body.temperature).toBe(path.temperature);
    });

    it('keeps the default temperature when the caller passes none', async () => {
      const svc = await loadServiceFor(model);
      await svc.generateCompletion('sys', 'user');
      expect(sentBody('create').temperature).toBe(0.7);
    });
  },
);
