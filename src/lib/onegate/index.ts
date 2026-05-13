import { OneGateClient } from './client.js';

export * from './client.js';
export * from './types.js';
export * from './errors.js';
export * from './auth.js';

let instance: OneGateClient | null = null;

export function getOneGateClient(): OneGateClient {
  if (instance) return instance;
  const baseUrl = process.env.ONEGATE_BASE_URL;
  const orgId = process.env.ONEGATE_ORG_ID;
  const salt = process.env.ONEGATE_SALT;
  if (!baseUrl || !orgId || !salt) {
    throw new Error('OneGate is not configured: set ONEGATE_BASE_URL, ONEGATE_ORG_ID, ONEGATE_SALT');
  }
  instance = new OneGateClient({ baseUrl, orgId, salt });
  return instance;
}

export function resetOneGateClient(): void { instance = null; }
