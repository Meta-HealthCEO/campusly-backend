import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import { renderPremiumLessonHtml } from '../service-export-premium.js';
import type { ILesson, LessonPhase } from '../types.js';

describe('renderPremiumLessonHtml', () => {
  it('renders a premium student pack without teacher-only answers', async () => {
    const ctx = makeCtx('student');
    const html = await renderPremiumLessonHtml(ctx);

    expect(html).toContain('Student Pack');
    expect(html).toContain('Learning goals');
    expect(html).toContain('Ethics Scenario Discussion');
    expect(html).toContain('Checkpoint');
    expect(html).not.toContain('Teacher answer');
  });

  it('renders teacher-only answers in teacher packs', async () => {
    const ctx = makeCtx('teacher');
    const html = await renderPremiumLessonHtml(ctx);

    expect(html).toContain('Teacher Pack');
    expect(html).toContain('Teacher answer');
    expect(html).toContain('Backdating cost records');
  });
});

function makeCtx(mode: 'teacher' | 'student') {
  const materialId = new Types.ObjectId();
  const phase: LessonPhase = 'introduction';
  const lesson = {
    _id: new Types.ObjectId(),
    schoolId: new Types.ObjectId(),
    teacherId: new Types.ObjectId(),
    subjectId: { name: 'Accounting' },
    gradeId: { name: 'Grade 12' },
    curriculumNodeId: { title: 'Ethics and Internal Control' },
    termNumber: 2,
    title: 'Ethics and Internal Control',
    durationMinutes: 45,
    objectives: ['Explain ethical choices in manufacturing controls'],
    phases: [
      { phase, materialIds: [materialId] },
      { phase: 'direct_instruction', materialIds: [] },
      { phase: 'practice', materialIds: [] },
      { phase: 'assessment', materialIds: [] },
      { phase: 'homework', materialIds: [] },
    ],
    materials: [{
      _id: materialId,
      kind: 'activity',
      title: 'Ethics Scenario Discussion',
      contentResourceId: {
        blocks: [{
          blockId: 'block-1',
          type: 'quiz',
          order: 1,
          content: JSON.stringify({
            question: 'Which action is the clearest ethical breach?',
            options: [
              'Use a cheaper local supplier',
              'Backdating cost records',
            ],
            correctIndex: 1,
            explanation: 'Backdating records compromises reliable reporting.',
          }),
          curriculumNodeId: null,
          cognitiveLevel: null,
          points: 1,
          hints: [],
          explanation: '',
          metadata: {},
        }],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      generatedAt: new Date(),
    }],
    publishedAt: null,
    reflectionNotes: '',
    aiGenerated: true,
    isDeleted: false,
    assignedClasses: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as ILesson;

  return {
    mode,
    schoolId: String(lesson.schoolId),
    schoolName: "Shaun's Classroom",
    lesson,
  };
}
