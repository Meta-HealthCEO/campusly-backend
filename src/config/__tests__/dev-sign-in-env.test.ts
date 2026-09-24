// config.devSignIn is on only for NODE_ENV=development plus DEV_SIGN_IN=true.
import { afterEach, describe, expect, it, vi } from 'vitest';

const KEYS = ['NODE_ENV', 'DEV_SIGN_IN', 'DEV_SIGN_IN_EMAILS'] as const;
const saved = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));

async function loadWith(env: Partial<Record<(typeof KEYS)[number], string>>) {
  for (const key of KEYS) process.env[key] = env[key] ?? '';
  vi.resetModules();
  const { config } = await import('../env.js');
  return config.devSignIn;
}

describe('config.devSignIn', () => {
  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    vi.resetModules();
  });

  it('is on in development with DEV_SIGN_IN=true', async () => {
    expect((await loadWith({ NODE_ENV: 'development', DEV_SIGN_IN: 'true' })).enabled).toBe(true);
  });

  it('is off in development without DEV_SIGN_IN=true', async () => {
    expect((await loadWith({ NODE_ENV: 'development', DEV_SIGN_IN: 'false' })).enabled).toBe(false);
    expect((await loadWith({ NODE_ENV: 'development', DEV_SIGN_IN: 'yes' })).enabled).toBe(false);
  });

  it('is off outside development even with DEV_SIGN_IN=true', async () => {
    expect((await loadWith({ NODE_ENV: 'production', DEV_SIGN_IN: 'true' })).enabled).toBe(false);
    expect((await loadWith({ NODE_ENV: 'test', DEV_SIGN_IN: 'true' })).enabled).toBe(false);
    expect((await loadWith({ NODE_ENV: '', DEV_SIGN_IN: 'true' })).enabled).toBe(false);
  });

  it('reads DEV_SIGN_IN_EMAILS as a trimmed, lower-case list', async () => {
    const devSignIn = await loadWith({
      NODE_ENV: 'development',
      DEV_SIGN_IN: 'true',
      DEV_SIGN_IN_EMAILS: ' Me@Example.test , ,other@example.test',
    });
    expect(devSignIn.emails).toEqual(['me@example.test', 'other@example.test']);
  });
});
