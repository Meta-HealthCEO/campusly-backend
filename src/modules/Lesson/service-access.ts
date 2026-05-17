import mongoose from 'mongoose';
import { BadRequestError, ForbiddenError } from '../../common/errors.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { Class, Timetable } from '../Academic/model.js';

export interface LessonActor extends AuthenticatedUser {
  schoolId: string;
}

export type LessonScope = string | LessonActor;

export function isLessonActor(scope: LessonScope): scope is LessonActor {
  return typeof scope !== 'string';
}

export function schoolIdFromScope(scope: LessonScope): string {
  return isLessonActor(scope) ? scope.schoolId : scope;
}

export function schoolObjectId(scope: LessonScope): mongoose.Types.ObjectId {
  return toObjectId(schoolIdFromScope(scope), 'schoolId');
}

export function canManageAllLessons(actor: LessonActor): boolean {
  return actor.role === 'super_admin'
    || actor.role === 'school_admin'
    || actor.isSchoolPrincipal === true
    || actor.isHOD === true;
}

export function lessonAccessFilter(scope: LessonScope): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    schoolId: schoolObjectId(scope),
    isDeleted: false,
  };

  if (isLessonActor(scope) && scope.role === 'teacher' && !canManageAllLessons(scope)) {
    filter.teacherId = toObjectId(scope.id, 'teacherId');
  }

  return filter;
}

export function ownerFilterForScope(
  scope: LessonScope,
  ownerField: 'teacherId' | 'createdBy',
): Record<string, unknown> {
  if (!isLessonActor(scope) || scope.role !== 'teacher' || canManageAllLessons(scope)) {
    return {};
  }
  return { [ownerField]: toObjectId(scope.id, ownerField) };
}

export function toObjectId(value: string | mongoose.Types.ObjectId, label: string): mongoose.Types.ObjectId {
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (!mongoose.isValidObjectId(value)) {
    throw new BadRequestError(`Invalid ${label}`);
  }
  return new mongoose.Types.ObjectId(value);
}

export async function assertCanUseClass(scope: LessonScope, classId: string): Promise<void> {
  const classOid = toObjectId(classId, 'classId');
  const schoolOid = schoolObjectId(scope);
  const cls = await Class.findOne({ _id: classOid, schoolId: schoolOid, isDeleted: false })
    .select('_id teacherId')
    .lean<{ _id: mongoose.Types.ObjectId; teacherId?: mongoose.Types.ObjectId } | null>();

  if (!cls) {
    throw new BadRequestError('Class does not belong to this school');
  }

  if (!isLessonActor(scope) || scope.role !== 'teacher' || canManageAllLessons(scope)) {
    return;
  }

  const ownsHomeroom = cls.teacherId?.toString() === scope.id;
  if (ownsHomeroom) return;

  const teachesClass = await Timetable.exists({
    schoolId: schoolOid,
    teacherId: toObjectId(scope.id, 'teacherId'),
    classId: classOid,
    isDeleted: false,
  });

  if (!teachesClass) {
    throw new ForbiddenError('You can only assign lessons to classes you teach');
  }
}

export async function assertCanUseClasses(scope: LessonScope, classIds: string[]): Promise<void> {
  const uniqueIds = Array.from(new Set(classIds));
  await Promise.all(uniqueIds.map((classId) => assertCanUseClass(scope, classId)));
}
