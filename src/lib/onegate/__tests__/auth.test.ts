// campusly-backend/src/lib/onegate/__tests__/auth.test.ts
import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { buildAuthHeaders } from '../auth.js';

describe('buildAuthHeaders', () => {
  it('produces sha256(salt_orgId_timestamp) as Auth-Token', () => {
    const headers = buildAuthHeaders({ salt: 'mysalt', orgId: '21234', nowSeconds: 1700000000 });
    const expected = crypto.createHash('sha256').update('mysalt_21234_1700000000').digest('hex');
    expect(headers['Auth-Token']).toBe(expected);
    expect(headers['Org-Id']).toBe('21234');
    expect(headers['Timestamp']).toBe('1700000000');
  });

  it('uses current time when nowSeconds omitted', () => {
    const headers = buildAuthHeaders({ salt: 's', orgId: '1' });
    const ts = parseInt(headers['Timestamp'], 10);
    expect(Math.abs(ts - Math.floor(Date.now() / 1000))).toBeLessThan(2);
  });
});
