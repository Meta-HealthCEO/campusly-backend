// campusly-backend/src/lib/onegate/auth.ts
import crypto from 'crypto';

export interface AuthHeaderInput {
  salt: string;
  orgId: string;
  nowSeconds?: number;
}

export function buildAuthHeaders(input: AuthHeaderInput): Record<string, string> {
  const ts = (input.nowSeconds ?? Math.floor(Date.now() / 1000)).toString();
  const token = crypto.createHash('sha256').update(`${input.salt}_${input.orgId}_${ts}`).digest('hex');
  return {
    'Auth-Token': token,
    'Org-Id': input.orgId,
    'Timestamp': ts,
  };
}
