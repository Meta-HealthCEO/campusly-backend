import { describe, it, expect, vi } from 'vitest';

vi.mock('../queues.js', () => ({ redisConnection: {}, courseGenerationQueue: { add: vi.fn(async () => undefined) } }));
vi.mock('../../modules/Course/service-course-generation.js', () => ({ runCourseGeneration: vi.fn(async () => undefined) }));

import { courseGenerationQueue } from '../queues.js';
import { runCourseGeneration } from '../../modules/Course/service-course-generation.js';
import { enqueueCourseGeneration } from '../course-generation.job.js';

describe('enqueueCourseGeneration', () => {
  it('writes the unit in this process when no worker was started (Redis was down at boot)', async () => {
    await enqueueCourseGeneration({ courseId: 'c1', schoolId: 's1' });
    await vi.waitFor(() => expect(runCourseGeneration).toHaveBeenCalledWith('c1', 's1', undefined));
    expect(courseGenerationQueue.add).not.toHaveBeenCalled();
  });
});
