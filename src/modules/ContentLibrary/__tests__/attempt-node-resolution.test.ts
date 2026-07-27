import { describe, it, expect } from 'vitest';
import { resolveAttemptNodeId } from '../service-attempts.js';

describe('resolveAttemptNodeId', () => {
  it('prefers the explicitly submitted node id', () => {
    expect(resolveAttemptNodeId('payload-node', 'block-node', 'resource-node')).toBe(
      'payload-node',
    );
  });

  it('falls back to the block node when the payload omits one', () => {
    expect(resolveAttemptNodeId(undefined, 'block-node', 'resource-node')).toBe('block-node');
  });

  it('falls back to the resource node when block has none', () => {
    expect(resolveAttemptNodeId(undefined, null, 'resource-node')).toBe('resource-node');
  });

  it('returns null when nothing is aligned to the curriculum', () => {
    expect(resolveAttemptNodeId(undefined, null, null)).toBeNull();
  });

  it('treats empty strings as absent', () => {
    expect(resolveAttemptNodeId('', '', 'resource-node')).toBe('resource-node');
  });
});
