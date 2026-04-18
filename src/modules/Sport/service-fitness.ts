import {
  FitnessTestResult,
  BiometricMeasurement,
  type IFitnessTestResult,
  type IBiometricMeasurement,
} from './model-fitness.js';
import { NotFoundError } from '../../common/errors.js';
import type {
  CreateFitnessTestInput,
  UpdateFitnessTestInput,
  CreateBiometricInput,
  UpdateBiometricInput,
} from './validation-fitness.js';

interface ListTestFilters {
  schoolId: string;
  studentId?: string;
  teamId?: string;
  testType?: string;
  from?: string;
  to?: string;
}

interface ListBiometricFilters {
  schoolId: string;
  studentId?: string;
  from?: string;
  to?: string;
}

function dateRange(from?: string, to?: string): Record<string, Date> | undefined {
  if (!from && !to) return undefined;
  const range: Record<string, Date> = {};
  if (from) range.$gte = new Date(from);
  if (to) range.$lte = new Date(to);
  return range;
}

export class FitnessService {
  static async createTest(
    input: CreateFitnessTestInput,
    schoolId: string,
    testedBy: string,
  ): Promise<IFitnessTestResult> {
    return FitnessTestResult.create({
      ...input,
      schoolId,
      testedBy,
      date: new Date(input.date),
    });
  }

  static async listTests(filters: ListTestFilters): Promise<IFitnessTestResult[]> {
    const query: Record<string, unknown> = {
      schoolId: filters.schoolId,
      isDeleted: false,
    };
    if (filters.studentId) query.studentId = filters.studentId;
    if (filters.teamId) query.teamId = filters.teamId;
    if (filters.testType) query.testType = filters.testType;
    const range = dateRange(filters.from, filters.to);
    if (range) query.date = range;
    return FitnessTestResult.find(query)
      .sort({ date: -1 })
      .populate('studentId')
      .populate('teamId', 'name sport')
      .populate('testedBy', 'firstName lastName email')
      .lean();
  }

  static async updateTest(
    id: string,
    schoolId: string,
    input: UpdateFitnessTestInput,
  ): Promise<IFitnessTestResult> {
    const update: Record<string, unknown> = { ...input };
    if (input.date) update.date = new Date(input.date);
    const result = await FitnessTestResult.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate('studentId')
      .populate('teamId', 'name sport')
      .populate('testedBy', 'firstName lastName email');
    if (!result) throw new NotFoundError('Fitness test not found');
    return result;
  }

  static async deleteTest(id: string, schoolId: string): Promise<void> {
    const result = await FitnessTestResult.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!result) throw new NotFoundError('Fitness test not found');
  }

  static async playerProgression(
    studentId: string,
    schoolId: string,
  ): Promise<Record<string, IFitnessTestResult[]>> {
    const tests = await FitnessTestResult.find({
      studentId,
      schoolId,
      isDeleted: false,
    })
      .sort({ date: 1 })
      .lean();
    const grouped: Record<string, IFitnessTestResult[]> = {};
    for (const t of tests) {
      const key = t.testType;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    }
    return grouped;
  }

  static async createBiometric(
    input: CreateBiometricInput,
    schoolId: string,
    recordedBy: string,
  ): Promise<IBiometricMeasurement> {
    return BiometricMeasurement.create({
      ...input,
      schoolId,
      recordedBy,
      date: new Date(input.date),
    });
  }

  static async listBiometrics(
    filters: ListBiometricFilters,
  ): Promise<IBiometricMeasurement[]> {
    const query: Record<string, unknown> = {
      schoolId: filters.schoolId,
      isDeleted: false,
    };
    if (filters.studentId) query.studentId = filters.studentId;
    const range = dateRange(filters.from, filters.to);
    if (range) query.date = range;
    return BiometricMeasurement.find(query)
      .sort({ date: -1 })
      .populate('studentId')
      .populate('recordedBy', 'firstName lastName email')
      .lean();
  }

  static async updateBiometric(
    id: string,
    schoolId: string,
    input: UpdateBiometricInput,
  ): Promise<IBiometricMeasurement> {
    const update: Record<string, unknown> = { ...input };
    if (input.date) update.date = new Date(input.date);
    const result = await BiometricMeasurement.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate('studentId')
      .populate('recordedBy', 'firstName lastName email');
    if (!result) throw new NotFoundError('Biometric measurement not found');
    return result;
  }

  static async deleteBiometric(id: string, schoolId: string): Promise<void> {
    const result = await BiometricMeasurement.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!result) throw new NotFoundError('Biometric measurement not found');
  }
}
