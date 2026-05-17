import mongoose from 'mongoose';
import { BadRequestError, ForbiddenError } from '../../common/errors.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { Class, Subject, Timetable } from '../Academic/model.js';

export interface HomeworkActor extends AuthenticatedUser {
  schoolId: string;
}

export type HomeworkScope = string | HomeworkActor;

export function isHomeworkActor(scope: HomeworkScope): scope is HomeworkActor {
  return typeof scope !== 'string';
}

export function toObjectId(
  value: string | mongoose.Types.ObjectId,
  label: string,
): mongoose.Types.ObjectId {
  if (value instanceof mongoose.Types.ObjectId) return value;
  if (!mongoose.isValidObjectId(value)) {
    throw new BadRequestError(`Invalid ${label}`);
  }
  return new mongoose.Types.ObjectId(value);
}

export function schoolIdFromScope(scope: HomeworkScope): string {
  return isHomeworkActor(scope) ? scope.schoolId : scope;
}

export function schoolObjectId(scope: HomeworkScope): mongoose.Types.ObjectId {
  return toObjectId(schoolIdFromScope(scope), 'schoolId');
}

export function canManageAllHomework(actor: HomeworkActor): boolean {
  return actor.role === 'super_admin'
    || actor.role === 'school_admin'
    || actor.isSchoolPrincipal === true
    || actor.isHOD === true;
}

export function homeworkAccessFilter(scope: HomeworkScope): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    schoolId: schoolObjectId(scope),
    isDeleted: false,
  };

  if (isHomeworkActor(scope) && scope.role === 'teacher' && !canManageAllHomework(scope)) {
    filter.teacherId = toObjectId(scope.id, 'teacherId');
  }

  return filter;
}

export function teacherOwnerFilter(scope: HomeworkScope): Record<string, unknown> {
  if (!isHomeworkActor(scope) || scope.role !== 'teacher' || canManageAllHomework(scope)) {
    return {};
  }
  return { teacherId: toObjectId(scope.id, 'teacherId') };
}

export function createdByFilter(scope: HomeworkScope): Record<string, unknown> {
  if (!isHomeworkActor(scope) || scope.role !== 'teacher' || canManageAllHomework(scope)) {
    return {};
  }
  return { createdBy: toObjectId(scope.id, 'createdBy') };
}

export async function assertSubjectBelongsToSchool(
  scope: HomeworkScope,
  subjectId: string,
): Promise<void> {
  const subjectOid = toObjectId(subjectId, 'subjectId');
  const exists = await Subject.exists({
    _id: subjectOid,
    isDeleted: false,
    $or: [
      { schoolId: schoolObjectId(scope) },
      { schoolId: null },
    ],
  });
  if (exists) return;

  const { CurriculumNode } = await import('../CurriculumStructure/model.js');
  const curriculumSubject = await CurriculumNode.exists({
    _id: subjectOid,
    type: 'subject',
    isDeleted: false,
    $or: [
      { schoolId: null },
      { schoolId: schoolObjectId(scope) },
    ],
  });
  if (curriculumSubject) return;

  const timetableSubject = await Timetable.exists({
    subjectId: subjectOid,
    schoolId: schoolObjectId(scope),
    isDeleted: false,
  });
  if (timetableSubject) return;

  throw new BadRequestError('Subject does not belong to this school');
}

export async function assertCanUseClass(
  scope: HomeworkScope,
  classId: string,
  subjectId?: string,
): Promise<{ gradeId: mongoose.Types.ObjectId }> {
  const classOid = toObjectId(classId, 'classId');
  const schoolOid = schoolObjectId(scope);
  const cls = await Class.findOne({ _id: classOid, schoolId: schoolOid, isDeleted: false })
    .select('_id teacherId gradeId')
    .lean<{ _id: mongoose.Types.ObjectId; teacherId?: mongoose.Types.ObjectId; gradeId: mongoose.Types.ObjectId } | null>();

  if (!cls) throw new BadRequestError('Class does not belong to this school');

  if (!isHomeworkActor(scope) || scope.role !== 'teacher' || canManageAllHomework(scope)) {
    return { gradeId: cls.gradeId };
  }

  const teacherOid = toObjectId(scope.id, 'teacherId');
  if (cls.teacherId?.toString() === teacherOid.toString()) {
    return { gradeId: cls.gradeId };
  }

  const timetableQuery: Record<string, unknown> = {
    schoolId: schoolOid,
    teacherId: teacherOid,
    classId: classOid,
    isDeleted: false,
  };
  if (subjectId) timetableQuery.subjectId = toObjectId(subjectId, 'subjectId');

  const teachesClass = await Timetable.exists(timetableQuery);
  if (!teachesClass) {
    throw new ForbiddenError('You can only assign homework to classes you teach');
  }

  return { gradeId: cls.gradeId };
}

export function visibleSchoolOrOwnFilter(
  schoolId: string,
  teacherId: string,
  approvedStatus = 'approved',
): Record<string, unknown>[] {
  const schoolOid = toObjectId(schoolId, 'schoolId');
  const teacherOid = toObjectId(teacherId, 'teacherId');
  return [
    { schoolId: null, status: approvedStatus },
    { schoolId: schoolOid, status: approvedStatus },
    { schoolId: schoolOid, createdBy: teacherOid },
  ];
}
