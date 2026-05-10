import mongoose from 'mongoose';
import { Lesson } from './model.js';
import type { ILesson } from './types.js';
import type {
  AssignClassInput,
  UpdateAssignmentInput,
} from './validation.js';

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
    schoolId: string,
    input: AssignClassInput,
  ): Promise<ILesson> {
    const lessonOid = new mongoose.Types.ObjectId(lessonId);
    const classOid = new mongoose.Types.ObjectId(input.classId);
    const scheduledDate = new Date(input.scheduledDate);

    // First try to update an existing assignment for this class. If matched,
    // we're done; otherwise push a new entry.
    const updated = await Lesson.findOneAndUpdate(
      {
        _id: lessonOid,
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
        'assignedClasses.classId': classOid,
      },
      { $set: { 'assignedClasses.$.scheduledDate': scheduledDate } },
      { new: true },
    ).lean<ILesson>();
    if (updated) return updated;

    const pushed = await Lesson.findOneAndUpdate(
      {
        _id: lessonOid,
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
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
    if (!pushed) throw new Error('Lesson not found');
    return pushed;
  },

  /** Remove an assignment of a class from this lesson pack. */
  async unassignClass(
    lessonId: string,
    schoolId: string,
    classId: string,
  ): Promise<ILesson> {
    const updated = await Lesson.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(lessonId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      },
      {
        $pull: {
          assignedClasses: { classId: new mongoose.Types.ObjectId(classId) },
        },
      },
      { new: true },
    ).lean<ILesson>();
    if (!updated) throw new Error('Lesson not found');
    return updated;
  },

  /**
   * Patch a single class's assignment (scheduledDate and/or status). Flipping
   * status to 'taught' stamps taughtAt; flipping back to 'planned' clears it.
   */
  async updateAssignment(
    lessonId: string,
    schoolId: string,
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

    const classOid = new mongoose.Types.ObjectId(classId);
    const updated = await Lesson.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(lessonId),
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
        'assignedClasses.classId': classOid,
      },
      { $set: setOps },
      {
        new: true,
        arrayFilters: [{ 'a.classId': classOid }],
      },
    ).lean<ILesson>();
    if (!updated) throw new Error('Assignment not found');
    return updated;
  },
};
