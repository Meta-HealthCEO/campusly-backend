import type { Types } from 'mongoose';

/** Populated User reference (from .populate('userId')) */
export interface PopulatedUser {
  _id: Types.ObjectId;
  firstName?: string;
  lastName?: string;
  email?: string;
}

/** Populated Grade reference */
export interface PopulatedGrade {
  _id: Types.ObjectId;
  name?: string;
  level?: number;
}

/** Populated Subject reference */
export interface PopulatedSubject {
  _id: Types.ObjectId;
  name?: string;
  code?: string;
}

/** Populated Assessment reference (subjectId field) */
export interface PopulatedAssessment {
  _id: Types.ObjectId;
  subjectId: Types.ObjectId | PopulatedSubject;
  totalMarks?: number;
  academicYear?: number;
}

/** Populated Class reference */
export interface PopulatedClass {
  _id: Types.ObjectId;
  name?: string;
  gradeId?: Types.ObjectId | PopulatedGrade;
}

/** Populated Quiz reference (minimal, for quiz attempt lookups) */
export interface PopulatedQuiz {
  _id: Types.ObjectId;
  subjectId?: Types.ObjectId | string;
  classId?: Types.ObjectId | string;
}

/**
 * Helper that safely extracts a populated field.
 * After `.populate()`, the field holds the populated document rather than an ObjectId.
 * This avoids scattered `as unknown as T` casts throughout the codebase.
 */
export function getPopulated<T>(field: unknown): T {
  return field as T;
}
