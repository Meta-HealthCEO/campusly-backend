import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnrecoverableError, type Job } from 'bullmq';

// Audio transcription is not available (the Messages API takes no audio
// input). The lesson-notes job must record that on the note the teacher sees,
// without downloading the recording, and must not be retried by the queue.
const h = vi.hoisted(() => ({
  note: {
    status: 'processing',
    errorMessage: undefined as string | undefined,
    _id: 'note1',
    save: vi.fn(async () => undefined),
  },
  httpsGet: vi.fn(),
}));

vi.mock('../queues.js', () => ({ redisConnection: {}, lessonNotesQueue: { add: vi.fn() } }));
vi.mock('../../common/logger.js', () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock('../../config/env.js', () => ({
  config: { anthropic: { apiKey: 'test-key', model: 'claude-sonnet-5' } },
}));
vi.mock('https', () => ({ default: { get: h.httpsGet } }));
vi.mock('http', () => ({ default: { get: h.httpsGet } }));
vi.mock('../../modules/Classroom/model.js', () => ({
  VirtualSession: { updateOne: vi.fn(async () => undefined), findById: vi.fn() },
}));
vi.mock('../../modules/Classroom/model-chat.js', () => ({ SessionChatMessage: { find: vi.fn() } }));
vi.mock('../../modules/Classroom/model-lesson-note.js', () => ({
  LessonNote: { create: vi.fn(async () => h.note) },
}));

import { processLessonNotes, type LessonNotesJobData } from '../lesson-notes.job.js';

const job = {
  id: 'job1',
  data: {
    sessionId: 'sess1',
    schoolId: 'school1',
    teacherId: 't1',
    classId: 'c1',
    subjectId: 'sub1',
    recordingUrl: 'https://recordings.example/lesson.mp4',
  },
} as unknown as Job<LessonNotesJobData>;

beforeEach(() => {
  h.note.status = 'processing';
  h.note.errorMessage = undefined;
  h.note.save.mockClear();
  h.httpsGet.mockReset();
});

describe('lesson-notes job when audio transcription is unavailable', () => {
  it('marks the note failed with the plain message and does not retry', async () => {
    const run = processLessonNotes(job);
    await expect(run).rejects.toBeInstanceOf(UnrecoverableError);
    await expect(run).rejects.toThrow("Audio transcription isn't available yet.");
    expect(h.note.status).toBe('failed');
    expect(h.note.errorMessage).toBe("Audio transcription isn't available yet.");
    expect(h.note.save).toHaveBeenCalled();
  });

  it('does not download the recording first', async () => {
    await processLessonNotes(job).catch(() => undefined);
    expect(h.httpsGet).not.toHaveBeenCalled();
  });
});
