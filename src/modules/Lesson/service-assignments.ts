import { Lesson } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import type { ILesson } from './types.js';
import type {
  AssignClassInput,
  UpdateAssignmentInput,
} from './validation.js';
import {
  assertCanUseClass,
  lessonAccessFilter,
  toObjectId,
  type LessonScope,
} from './service-access.js';

/**
 * Per-class scheduling for a lesson pack. Each entry in lesson.assignedClasses
 * represents "this pack is delivered to this class on this date" — independent
 * of the pack's curriculum-scoped content.
 */
export const LessonAssignmentService = {
  /**
   * Add (or replace the scheduledDate of an existing) assignment of this lesson
   * pack to a class. Idempotent on (lessonId, classId).
   */
  async assignClass(
    lessonId: string,
    scope: LessonScope,
    input: AssignClassInput,
  ): Promise<ILesson> {
    await assertCanUseClass(scope, input.classId);

    const lessonOid = toObjectId(lessonId, 'lessonId');
    const classOid = toObjectId(input.classId, 'classId');
    const scheduledDate = new Date(input.scheduledDate);

    // First try to update an existing assignment for this class. If matched,
    // we're done; otherwise push a new entry.
    const updated = await Lesson.findOneAndUpdate(
      {
        _id: lessonOid,
        ...lessonAccessFilter(scope),
        'assignedClasses.classId': classOid,
      },
      { $set: { 'assignedClasses.$.scheduledDate': scheduledDate } },
      { new: true },
    ).lean<ILesson>();
    if (updated) return updated;

    const pushed = await Lesson.findOneAndUpdate(
      {
        _id: lessonOid,
        ...lessonAccessFilter(scope),
      },
      {
        $push: {
          assignedClasses: {
            classId: classOid,
            scheduledDate,
            status: 'planned',
          },
        },
      },
      { new: true },
    ).lean<ILesson>();
    if (!pushed) throw new NotFoundError('Lesson not found');
    return pushed;
  },

  /** Remove an assignment of a class from this lesson pack. */
  async unassignClass(
    lessonId: string,
    scope: LessonScope,
    classId: string,
  ): Promise<ILesson> {
    const updated = await Lesson.findOneAndUpdate(
      {
        _id: toObjectId(lessonId, 'lessonId'),
        ...lessonAccessFilter(scope),
      },
      {
        $pull: {
          assignedClasses: { classId: toObjectId(classId, 'classId') },
        },
      },
      { new: true },
    ).lean<ILesson>();
    if (!updated) throw new NotFoundError('Lesson not found');
    return updated;
  },

  /**
   * Patch a single class's assignment (scheduledDate and/or status). Flipping
   * status to 'taught' stamps taughtAt; flipping back to 'planned' clears it.
   */
  async updateAssignment(
    lessonId: string,
    scope: LessonScope,
    classId: string,
    patch: UpdateAssignmentInput,
  ): Promise<ILesson> {
    const setOps: Record<string, unknown> = {};
    if (patch.scheduledDate !== undefined) {
      setOps['assignedClasses.$[a].scheduledDate'] = new Date(patch.scheduledDate);
    }
    if (patch.status !== undefined) {
      setOps['assignedClasses.$[a].status'] = patch.status;
      setOps['assignedClasses.$[a].taughtAt'] =
        patch.status === 'taught' ? new Date() : null;
    }

    const classOid = toObjectId(classId, 'classId');
    const updated = await Lesson.findOneAndUpdate(
      {
        _id: toObjectId(lessonId, 'lessonId'),
        ...lessonAccessFilter(scope),
        'assignedClasses.classId': classOid,
      },
      { $set: setOps },
      {
        new: true,
        arrayFilters: [{ 'a.classId': classOid }],
      },
    ).lean<ILesson>();
    if (!updated) throw new NotFoundError('Assignment not found');
    return updated;
  },
};
