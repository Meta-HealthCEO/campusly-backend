import { describe, it, expect } from 'vitest';
import mongoose from 'mongoose';
import { createAnnouncementSchema, updateAnnouncementSchema } from '../validation.js';

const oid = () => new mongoose.Types.ObjectId().toString();

describe('a grade or class announcement without a targetId reaches no one, so it is rejected', () => {
  it('rejects create for targetAudience grade with no targetId', () => {
    const result = createAnnouncementSchema.safeParse({
      title: 'Outing', content: 'Zoo trip.', schoolId: oid(), targetAudience: 'grade',
    });
    expect(result.success).toBe(false);
  });

  it('rejects create for targetAudience class with no targetId', () => {
    const result = createAnnouncementSchema.safeParse({
      title: 'Outing', content: 'Zoo trip.', schoolId: oid(), targetAudience: 'class',
    });
    expect(result.success).toBe(false);
  });

  it('accepts create for targetAudience grade with a targetId', () => {
    const result = createAnnouncementSchema.safeParse({
      title: 'Outing', content: 'Zoo trip.', schoolId: oid(), targetAudience: 'grade', targetId: oid(),
    });
    expect(result.success).toBe(true);
  });

  it('accepts create for targetAudience all with no targetId', () => {
    const result = createAnnouncementSchema.safeParse({
      title: 'Notice', content: 'Everyone.', schoolId: oid(), targetAudience: 'all',
    });
    expect(result.success).toBe(true);
  });

  it('rejects update that switches targetAudience to class with no targetId', () => {
    const result = updateAnnouncementSchema.safeParse({ targetAudience: 'class' });
    expect(result.success).toBe(false);
  });

  it('accepts update that switches targetAudience to grade with a targetId', () => {
    const result = updateAnnouncementSchema.safeParse({ targetAudience: 'grade', targetId: oid() });
    expect(result.success).toBe(true);
  });

  it('accepts an update that does not touch targetAudience at all', () => {
    const result = updateAnnouncementSchema.safeParse({ title: 'New title' });
    expect(result.success).toBe(true);
  });
});
