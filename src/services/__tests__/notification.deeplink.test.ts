import { describe, expect, it } from 'vitest';
import { buildPushExtra } from '../notification.service.js';

describe('buildPushExtra — deepLink propagation', () => {
  it('returns undefined when notification.data is absent', () => {
    expect(buildPushExtra(undefined)).toBeUndefined();
  });

  it('includes payload serialisation for backwards compat when data has no deepLink fields', () => {
    const result = buildPushExtra({ foo: 'bar' });
    expect(result).toBeDefined();
    expect(result!.payload).toBe(JSON.stringify({ foo: 'bar' }));
  });

  it('forwards data.deepLink, category, and notificationId into the push payload', () => {
    const data = {
      category: 'homework',
      deepLink: 'campusly://homework/abc123',
      notificationId: 'n1',
    };

    const result = buildPushExtra(data);

    expect(result).toBeDefined();
    expect(result!.deepLink).toBe('campusly://homework/abc123');
    expect(result!.category).toBe('homework');
    expect(result!.notificationId).toBe('n1');
    // backwards-compat payload field must still be present
    expect(result!.payload).toBe(JSON.stringify(data));
  });

  it('omits deepLink/category/notificationId keys when not present in data', () => {
    const result = buildPushExtra({ other: 'value' });
    expect(result).toBeDefined();
    expect('deepLink' in result!).toBe(false);
    expect('category' in result!).toBe(false);
    expect('notificationId' in result!).toBe(false);
  });
});
