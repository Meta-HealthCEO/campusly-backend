import mongoose, { type PopulateOptions, type Types } from 'mongoose';
import { ForbiddenError, NotFoundError } from '../../common/errors.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { GradeService } from '../Academic/services/grade.service.js';
import { Student } from '../Student/model.js';

export interface PastoralUser extends AuthenticatedUser {
  isCounselor?: boolean;
  isSchoolPrincipal?: boolean;
}

type LooseRecord = Record<string, unknown>;

export const STUDENT_POPULATE: PopulateOptions = {
  path: 'studentId',
  select: 'admissionNumber userId gradeId classId',
  populate: [
    { path: 'userId', select: 'firstName lastName email' },
    { path: 'gradeId', select: 'name level' },
    { path: 'classId', select: 'name' },
  ],
};

export const REFERRAL_POPULATE: PopulateOptions[] = [
  STUDENT_POPULATE,
  { path: 'referredBy', select: 'firstName lastName email' },
  { path: 'assignedCounselorId', select: 'firstName lastName email' },
];

export const SESSION_POPULATE: PopulateOptions[] = [
  STUDENT_POPULATE,
  { path: 'counselorId', select: 'firstName lastName email' },
];

export function asRecord(value: unknown): LooseRecord {
  return typeof value === 'object' && value !== null ? value as LooseRecord : {};
}

export function idToString(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  const record = asRecord(value);
  const id = record._id ?? record.id;
  if (id instanceof mongoose.Types.ObjectId) return id.toString();
  return typeof id === 'string' ? id : String(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function dateOrUndefined(value: unknown): Date | undefined {
  return value instanceof Date ? value : undefined;
}

export function formatUser(value: unknown): { id: string; firstName: string; lastName: string } {
  const user = asRecord(value);
  return {
    id: idToString(value),
    firstName: optionalString(user.firstName) ?? '',
    lastName: optionalString(user.lastName) ?? '',
  };
}

export function formatStudent(value: unknown): {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  class?: string;
} {
  const student = asRecord(value);
  const user = asRecord(student.userId);
  const grade = asRecord(student.gradeId);
  const classDoc = asRecord(student.classId);
  const admissionNumber = optionalString(student.admissionNumber);

  return {
    id: idToString(value),
    firstName: optionalString(user.firstName) ?? optionalString(student.firstName) ?? admissionNumber ?? 'Unknown',
    lastName: optionalString(user.lastName) ?? optionalString(student.lastName) ?? '',
    grade: optionalString(grade.name) ?? optionalString(student.grade) ?? '',
    class: optionalString(classDoc.name) ?? optionalString(student.class),
  };
}

export function formatReferral(value: unknown) {
  const referral = asRecord(value);
  return {
    id: idToString(value),
    schoolId: idToString(referral.schoolId),
    studentId: formatStudent(referral.studentId),
    referredBy: formatUser(referral.referredBy),
    assignedCounselorId: referral.assignedCounselorId ? idToString(referral.assignedCounselorId) : null,
    reason: referral.reason,
    urgency: referral.urgency,
    status: referral.status,
    description: referral.description,
    referrerNotes: referral.referrerNotes,
    counselorNotes: referral.counselorNotes,
    outcome: referral.outcome,
    resolutionNotes: referral.resolutionNotes,
    resolvedAt: referral.resolvedAt,
    isDeleted: referral.isDeleted ?? false,
    createdAt: referral.createdAt,
    updatedAt: referral.updatedAt,
  };
}

export function formatSession(value: unknown) {
  const session = asRecord(value);
  return {
    id: idToString(value),
    schoolId: idToString(session.schoolId),
    studentId: formatStudent(session.studentId),
    counselorId: formatUser(session.counselorId),
    referralId: session.referralId ? idToString(session.referralId) : undefined,
    sessionDate: session.sessionDate,
    sessionType: session.sessionType,
    duration: session.duration,
    summary: session.summary,
    followUpActions: session.followUpActions,
    followUpDate: session.followUpDate,
    confidentialityLevel: session.confidentialityLevel,
    notifyParent: session.parentNotified,
    parentNotified: session.parentNotified,
    parentNotificationMessage: session.parentNotificationMessage ?? null,
    isDeleted: session.isDeleted ?? false,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export function isSchoolWidePastoralUser(user: PastoralUser): boolean {
  return (
    user.role === 'super_admin' ||
    user.role === 'school_admin' ||
    (user.role === 'teacher' && !!user.isCounselor) ||
    (user.role === 'teacher' && !!user.isSchoolPrincipal)
  );
}

export async function assertStudentInSchool(studentId: string, schoolId: string) {
  const student = await Student.findOne({
    _id: studentId,
    schoolId,
    isDeleted: false,
  })
    .select('_id classId')
    .lean();

  if (!student) throw new NotFoundError('Student not found');
  return student;
}

export async function assertCanAccessStudent(
  user: PastoralUser,
  studentId: string,
  schoolId = user.schoolId!,
): Promise<void> {
  const student = await assertStudentInSchool(studentId, schoolId);

  if (isSchoolWidePastoralUser(user)) return;

  if (user.role === 'teacher') {
    const canAccess = await GradeService.teacherCanAccessClass(
      user.id,
      idToString(student.classId),
      schoolId,
    );
    if (canAccess) return;
  }

  throw new ForbiddenError('You can only access learners in your classes');
}

export function canManageReferral(user: PastoralUser, referral: { assignedCounselorId?: Types.ObjectId | null }): boolean {
  if (user.role === 'super_admin') return true;
  if (user.role === 'school_admin' && user.isSchoolPrincipal) return true;
  if (user.role === 'teacher' && user.isCounselor) {
    const assignedId = idToString(referral.assignedCounselorId);
    return !assignedId || assignedId === user.id;
  }
  return false;
}

export function assertCanManageReferral(
  user: PastoralUser,
  referral: { assignedCounselorId?: Types.ObjectId | null },
): void {
  if (!canManageReferral(user, referral)) {
    throw new ForbiddenError('You can only manage unassigned referrals or referrals assigned to you');
  }
}

export function getSessionWeekStart(now = new Date()): Date {
  const start = new Date(now);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function getNextDate(dates: unknown[]): Date | null {
  const now = new Date();
  const upcoming = dates
    .map(dateOrUndefined)
    .filter((date): date is Date => !!date && date >= now)
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0] ?? null;
}
