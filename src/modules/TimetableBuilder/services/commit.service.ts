import { TimetableGeneration } from '../model.js';
import type { ITimetableGeneration } from '../model.js';
import { Timetable } from '../../Academic/model.js';
import { TimetableConfig } from '../model.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';

export class CommitService {
  /**
   * Commit a completed generation to the live timetable.
   * - Soft-deletes existing timetable entries for affected classes
   * - Creates new Timetable entries from the generation result
   * - Marks generation as 'committed'
   */
  static async commitGeneration(
    generationId: string,
    schoolId: string,
  ): Promise<{ entriesCreated: number }> {
    const generation = await TimetableGeneration.findOne({
      _id: generationId,
      schoolId,
      isDeleted: false,
    }).lean() as ITimetableGeneration | null;

    if (!generation) throw new NotFoundError('Generation not found');
    if (generation.status !== 'completed') {
      throw new BadRequestError(`Cannot commit generation with status "${generation.status}". Must be "completed".`);
    }

    if (generation.result.length === 0) {
      throw new BadRequestError('Generation has no results to commit');
    }

    // Load config for period times
    const config = await TimetableConfig.findOne({ schoolId, isDeleted: false }).lean();
    const periodTimeMap = new Map(
      (config?.periodTimes ?? []).map((pt) => [pt.period, { startTime: pt.startTime, endTime: pt.endTime }]),
    );

    // Get affected class IDs
    const classIds = [...new Set(generation.result.map((r) => String(r.classId)))];

    // Soft-delete existing entries for these classes
    await Timetable.updateMany(
      { schoolId, classId: { $in: classIds }, isDeleted: false },
      { $set: { isDeleted: true } },
    );

    // Create new entries
    const entries = generation.result.map((slot) => {
      const times = periodTimeMap.get(slot.period);
      return {
        schoolId,
        classId: slot.classId,
        day: slot.day,
        period: slot.period,
        startTime: times?.startTime ?? '',
        endTime: times?.endTime ?? '',
        subjectId: slot.subjectId,
        teacherId: slot.teacherId,
        room: slot.room ?? undefined,
        isDeleted: false,
      };
    });

    await Timetable.insertMany(entries);

    // Mark generation as committed
    await TimetableGeneration.findOneAndUpdate(
      { _id: generationId, schoolId },
      { $set: { status: 'committed' } },
    );

    return { entriesCreated: entries.length };
  }
}
