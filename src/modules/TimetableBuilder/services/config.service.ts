import { TimetableConfig, TeacherAvailability } from '../model.js';
import type { ITimetableConfig, ITeacherAvailability } from '../model.js';
import type { ConfigInput, AvailabilityInput } from '../validation.js';

export class ConfigService {
  /** Get config for a school, creating a default if none exists. */
  static async getConfig(schoolId: string): Promise<ITimetableConfig> {
    let config = await TimetableConfig.findOne({ schoolId, isDeleted: false }).lean();
    if (!config) {
      config = await TimetableConfig.findOneAndUpdate(
        { schoolId },
        {
          $setOnInsert: {
            schoolId,
            periodsPerDay: { monday: 7, tuesday: 7, wednesday: 7, thursday: 7, friday: 7 },
            periodTimes: [],
            breakSlots: [],
            isDeleted: false,
          },
        },
        { upsert: true, new: true },
      ).lean();
    }
    return config as ITimetableConfig;
  }

  /** Upsert config for a school. */
  static async updateConfig(schoolId: string, data: ConfigInput): Promise<ITimetableConfig> {
    const config = await TimetableConfig.findOneAndUpdate(
      { schoolId, isDeleted: false },
      { $set: { ...data, schoolId } },
      { upsert: true, new: true, runValidators: true },
    ).lean();
    return config as ITimetableConfig;
  }

  /** Get teacher availability — all teachers or a specific one. */
  static async getAvailability(
    schoolId: string,
    teacherId?: string,
  ): Promise<ITeacherAvailability[]> {
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (teacherId) filter.teacherId = teacherId;

    return TeacherAvailability.find(filter)
      .populate('teacherId', 'firstName lastName email')
      .lean()
      .exec() as Promise<ITeacherAvailability[]>;
  }

  /** Upsert availability for a specific teacher. */
  static async updateAvailability(
    schoolId: string,
    teacherId: string,
    data: Pick<AvailabilityInput, 'unavailable'>,
  ): Promise<ITeacherAvailability> {
    const result = await TeacherAvailability.findOneAndUpdate(
      { schoolId, teacherId, isDeleted: false },
      { $set: { unavailable: data.unavailable, schoolId, teacherId } },
      { upsert: true, new: true, runValidators: true },
    )
      .populate('teacherId', 'firstName lastName email')
      .lean();
    return result as ITeacherAvailability;
  }
}
