import {
  InjuryRecord,
  RecoveryLog,
  type IInjuryRecord,
  type IRecoveryLog,
} from './model-injury.js';
import { NotFoundError } from '../../common/errors.js';
import type {
  CreateInjuryInput,
  UpdateInjuryInput,
  CreateRecoveryLogInput,
} from './validation-injury.js';

interface ListInjuriesFilters {
  schoolId: string;
  studentId?: string;
  teamId?: string;
  status?: string;
}

export class InjuryService {
  static async createInjury(
    input: CreateInjuryInput,
    schoolId: string,
    reportedBy: string,
  ): Promise<IInjuryRecord> {
    const injury = await InjuryRecord.create({
      ...input,
      schoolId,
      reportedBy,
      injuryDate: new Date(input.injuryDate),
      expectedReturnDate: input.expectedReturnDate
        ? new Date(input.expectedReturnDate)
        : undefined,
    });
    return injury;
  }

  static async listInjuries(filters: ListInjuriesFilters): Promise<IInjuryRecord[]> {
    const query: Record<string, unknown> = {
      schoolId: filters.schoolId,
      isDeleted: false,
    };
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.teamId) query.teamId = filters.teamId;
    if (filters.status) query.status = filters.status;
    return InjuryRecord.find(query)
      .sort({ injuryDate: -1 })
      .populate('studentId')
      .populate('teamId', 'name sport')
      .populate('reportedBy', 'firstName lastName email')
      .populate('clearedBy', 'firstName lastName email')
      .lean();
  }

  static async getInjury(
    id: string,
    schoolId: string,
  ): Promise<IInjuryRecord> {
    const injury = await InjuryRecord.findOne({
      _id: id,
      schoolId,
      isDeleted: false,
    })
      .populate('studentId')
      .populate('teamId', 'name sport')
      .populate('reportedBy', 'firstName lastName email')
      .populate('clearedBy', 'firstName lastName email');
    if (!injury) throw new NotFoundError('Injury record not found');
    return injury;
  }

  static async updateInjury(
    id: string,
    schoolId: string,
    input: UpdateInjuryInput,
    userId: string,
  ): Promise<IInjuryRecord> {
    const update: Record<string, unknown> = { ...input };
    if (input.injuryDate) update.injuryDate = new Date(input.injuryDate);
    if (input.expectedReturnDate) update.expectedReturnDate = new Date(input.expectedReturnDate);
    if (input.actualReturnDate) update.actualReturnDate = new Date(input.actualReturnDate);

    // If clearance level changes to something other than 'none', record who cleared it
    if (input.clearanceLevel && input.clearanceLevel !== 'none') {
      update.clearedBy = userId;
    }

    const injury = await InjuryRecord.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate('studentId')
      .populate('teamId', 'name sport')
      .populate('reportedBy', 'firstName lastName email')
      .populate('clearedBy', 'firstName lastName email');
    if (!injury) throw new NotFoundError('Injury record not found');
    return injury;
  }

  static async deleteInjury(id: string, schoolId: string): Promise<void> {
    const result = await InjuryRecord.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!result) throw new NotFoundError('Injury record not found');
    await RecoveryLog.updateMany(
      { injuryId: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
  }

  static async addRecoveryLog(
    injuryId: string,
    schoolId: string,
    loggedBy: string,
    input: CreateRecoveryLogInput,
  ): Promise<IRecoveryLog> {
    const injury = await InjuryRecord.findOne({
      _id: injuryId,
      schoolId,
      isDeleted: false,
    });
    if (!injury) throw new NotFoundError('Injury record not found');

    const log = await RecoveryLog.create({
      ...input,
      schoolId,
      injuryId,
      loggedBy,
      date: new Date(input.date),
    });
    return log;
  }

  static async listRecoveryLogs(
    injuryId: string,
    schoolId: string,
  ): Promise<IRecoveryLog[]> {
    const injury = await InjuryRecord.findOne({
      _id: injuryId,
      schoolId,
      isDeleted: false,
    });
    if (!injury) throw new NotFoundError('Injury record not found');

    return RecoveryLog.find({ injuryId, schoolId, isDeleted: false })
      .sort({ date: -1 })
      .populate('loggedBy', 'firstName lastName email')
      .lean();
  }

  static async getPlayerInjuries(
    studentId: string,
    schoolId: string,
  ): Promise<IInjuryRecord[]> {
    return InjuryRecord.find({ studentId, schoolId, isDeleted: false })
      .sort({ injuryDate: -1 })
      .populate('teamId', 'name sport')
      .populate('reportedBy', 'firstName lastName email')
      .populate('clearedBy', 'firstName lastName email')
      .lean();
  }
}
