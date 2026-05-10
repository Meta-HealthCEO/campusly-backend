import { Lesson } from './model.js';
import type { ILesson, ILessonMaterial, LessonMaterialKind, LessonPhase } from './types.js';
import type { AddMaterialInput } from './validation.js';
import { regenerateMaterial } from './service-materials.js';

export interface GenerateAllResult {
  total: number;
  succeeded: number;
  failed: Array<{ materialId: string; title: string; error: string }>;
}

/**
 * A scaffold-emitted placeholder is a material that has no `generatedAt` AND
 * no underlying entity reference. The scaffolder writes only `kind`, `title`
 * and `teacherNotes` (the AI's hint), so each placeholder needs a real
 * generation pass before it has content to render.
 */
function isPlaceholder(material: ILessonMaterial): boolean {
  if (material.generatedAt) return false;
  const m = material as ILessonMaterial & {
    contentResourceId?: unknown;
    homeworkId?: unknown;
    paperId?: unknown;
    quizId?: unknown;
    questionIds?: unknown[];
    comprehensionQuestionIds?: unknown[];
  };
  if (m.contentResourceId) return false;
  if (m.homeworkId) return false;
  if (m.paperId) return false;
  if (m.quizId) return false;
  if (Array.isArray(m.questionIds) && m.questionIds.length > 0) return false;
  if (
    Array.isArray(m.comprehensionQuestionIds)
    && m.comprehensionQuestionIds.length > 0
  ) {
    return false;
  }
  return true;
}

function findPhaseForMaterial(
  lesson: ILesson,
  materialId: string,
): LessonPhase | null {
  for (const phase of lesson.phases) {
    if (phase.materialIds.some((id) => id.toString() === materialId)) {
      return phase.phase;
    }
  }
  return null;
}

const CONTENT_TYPE_BY_KIND: Record<
  'notes' | 'worksheet' | 'activity' | 'worked_example',
  'study_notes' | 'worksheet' | 'activity' | 'worked_example'
> = {
  notes: 'study_notes',
  worksheet: 'worksheet',
  activity: 'activity',
  worked_example: 'worked_example',
};

/**
 * Build a sensible default `addMaterial` payload for a placeholder. Returns
 * `null` for kinds that REQUIRE teacher input we can't safely infer (reading
 * needs a textbook, quiz needs an existing quiz id, homework/paper need a
 * concrete create payload + assigned class).
 */
function buildPayloadForPlaceholder(
  material: ILessonMaterial,
  phase: LessonPhase,
  termNumber: number,
):
  | { ok: true; payload: AddMaterialInput }
  | { ok: false; reason: string } {
  const title = material.title;
  const teacherNotes = material.teacherNotes;
  const instructions = teacherNotes ?? title;

  const kind: LessonMaterialKind = material.kind;

  if (
    kind === 'notes'
    || kind === 'worksheet'
    || kind === 'activity'
    || kind === 'worked_example'
  ) {
    // contentPayload is `.loose()` in the schema and accepts numeric
    // difficulty at runtime (the GenerationService schema enforces 1-5).
    // Cast through unknown because the inferred type narrows difficulty to
    // `string | undefined`.
    const payload = {
      phase,
      kind,
      title,
      teacherNotes,
      contentPayload: {
        type: CONTENT_TYPE_BY_KIND[kind],
        term: termNumber,
        blockTypes: ['text', 'quiz', 'fill_blank'],
        difficulty: 3,
        instructions,
      },
    } as unknown as AddMaterialInput;
    return { ok: true, payload };
  }

  if (kind === 'practice_questions') {
    const payload = {
      phase,
      kind,
      title,
      teacherNotes,
      questionPayload: {
        count: 5,
        questionTypes: ['mcq', 'short_answer'],
        cognitiveLevel: 'application',
        difficulty: 'medium',
        topicHint: instructions,
      },
    } as unknown as AddMaterialInput;
    return { ok: true, payload };
  }

  if (kind === 'reading') {
    return {
      ok: false,
      reason: 'Reading materials require a textbook — generate manually',
    };
  }
  if (kind === 'quiz') {
    return {
      ok: false,
      reason: 'Quiz materials require an existing quiz — generate manually',
    };
  }
  if (kind === 'homework') {
    return {
      ok: false,
      reason:
        'Homework requires an assigned class and create payload — generate manually',
    };
  }
  if (kind === 'paper') {
    return {
      ok: false,
      reason:
        'Paper requires sections and totals — generate manually',
    };
  }

  return { ok: false, reason: `Unsupported kind: ${kind as string}` };
}

/**
 * One-shot completion of every placeholder material on a lesson. Runs the
 * generations sequentially because the underlying AI calls share a rate
 * limit pool — Promise.all would burn the budget on the first 3-5 and fail
 * the rest. A single placeholder's failure does NOT abort the batch; the
 * error is captured per-material and returned in `failed[]`.
 *
 * Successful generations replace the placeholder in-place via
 * `regenerateMaterial` (delete-old + addMaterial-new), so the lesson's phase
 * ordering stays intact and `materialIds` slots stay filled.
 */
export async function generateAllPlaceholders(
  lessonId: string,
  schoolId: string,
  teacherId: string,
): Promise<GenerateAllResult> {
  const lesson = await Lesson.findOne({
    _id: lessonId,
    schoolId,
    isDeleted: false,
  });
  if (!lesson) throw new Error('Lesson not found');

  const placeholders = lesson.materials.filter(isPlaceholder);
  // Snapshot the IDs/titles up front. `regenerateMaterial` mutates the
  // lesson document (delete + add new subdoc with a fresh _id), so the
  // material list shifts under us mid-loop. Capturing first keeps each
  // iteration referring to the originally-targeted placeholder.
  const targets = placeholders.map((m) => ({
    id: m._id.toString(),
    title: m.title,
    kind: m.kind,
  }));

  const termNumber = lesson.termNumber ?? 1;

  const failed: GenerateAllResult['failed'] = [];
  let succeeded = 0;

  for (const target of targets) {
    try {
      // Re-resolve the phase from a fresh lesson read each iteration —
      // earlier successes have already changed phase.materialIds.
      const fresh = await Lesson.findOne({
        _id: lessonId,
        schoolId,
        isDeleted: false,
      });
      if (!fresh) {
        failed.push({
          materialId: target.id,
          title: target.title,
          error: 'Lesson disappeared mid-batch',
        });
        continue;
      }
      const stillExists = fresh.materials.find(
        (m) => m._id.toString() === target.id,
      );
      if (!stillExists) {
        failed.push({
          materialId: target.id,
          title: target.title,
          error: 'Placeholder no longer exists',
        });
        continue;
      }
      const phase = findPhaseForMaterial(fresh, target.id);
      if (!phase) {
        failed.push({
          materialId: target.id,
          title: target.title,
          error: 'Placeholder is not assigned to any phase',
        });
        continue;
      }

      const built = buildPayloadForPlaceholder(stillExists, phase, termNumber);
      if (!built.ok) {
        failed.push({
          materialId: target.id,
          title: target.title,
          error: built.reason,
        });
        continue;
      }

      await regenerateMaterial(
        lessonId,
        target.id,
        schoolId,
        teacherId,
        built.payload,
      );
      succeeded += 1;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Generation failed';
      failed.push({
        materialId: target.id,
        title: target.title,
        error: message,
      });
    }
  }

  return {
    total: targets.length,
    succeeded,
    failed,
  };
}
