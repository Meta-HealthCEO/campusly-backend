import mongoose from 'mongoose';
import { PAGINATION_DEFAULTS } from './constants.js';

export interface ApiResponseBody<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export function apiResponse<T = unknown>(
  success: boolean,
  data?: T,
  message?: string,
  error?: string
): ApiResponseBody<T> {
  const response: ApiResponseBody<T> = { success };
  if (data !== undefined) response.data = data;
  if (message !== undefined) response.message = message;
  if (error !== undefined) response.error = error;
  return response;
}

export function paginationHelper(
  page?: number,
  limit?: number
): { skip: number; limit: number } {
  const sanitizedPage = Math.max(1, Math.floor(page ?? PAGINATION_DEFAULTS.page));
  const sanitizedLimit = Math.min(
    PAGINATION_DEFAULTS.maxLimit,
    Math.max(1, Math.floor(limit ?? PAGINATION_DEFAULTS.limit))
  );
  return {
    skip: (sanitizedPage - 1) * sanitizedLimit,
    limit: sanitizedLimit,
  };
}

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

/**
 * Cascade soft-delete all records associated with a school.
 * Iterates over all mongoose models that have a `schoolId` field
 * and sets `isDeleted: true` on matching documents.
 */
export async function cascadeSoftDeleteSchool(schoolId: string): Promise<number> {
  const collections = [
    'Student',
    'Parent',
    'Invoice',
    'Payment',
    'FeeType',
    'FeeSchedule',
    'DebitOrder',
    'CreditNote',
    'FeeExemption',
    'PaymentArrangement',
    'CollectionAction',
    'AccountLedger',
    'Wallet',
    'WalletTransaction',
    'Wristband',
    'Homework',
    'HomeworkSubmission',
    'Attendance',
    'Discipline',
    'Merit',
    'LessonPlan',
    'SubstituteTeacher',
    'Grade',
    'Class',
    'Subject',
    'Timetable',
    'Assessment',
    'Mark',
    'Exam',
    'ExamTimetable',
    'PastPaper',
    'SubjectWeighting',
    'RemedialTracking',
    'Announcement',
    'Notification',
    'NotificationPreference',
    'Event',
    'Transport',
    'TuckShopItem',
    'TuckShopOrder',
    'LostItem',
    'LibraryItem',
    'LibraryLoan',
    'Consent',
    'ConsentResponse',
    'Fundraiser',
    'FundraiserContribution',
    'SportTeam',
    'SportFixture',
    'AfterCareRegistration',
    'AfterCareAttendance',
    'UniformItem',
    'UniformOrder',
    'AuditLog',
  ];

  let totalUpdated = 0;

  for (const name of collections) {
    const model = mongoose.models[name];
    if (!model) continue;

    // Only update collections that actually have a schoolId field
    const schemaPaths = model.schema.paths;
    if (!schemaPaths['schoolId']) continue;

    const result = await model.updateMany(
      { schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    totalUpdated += result.modifiedCount;
  }

  return totalUpdated;
}
