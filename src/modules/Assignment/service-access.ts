import mongoose from 'mongoose';
import { BadRequestError, ForbiddenError } from '../../common/errors.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { Class, Grade, Subject, Timetable } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';

export interface AssignmentActor extends AuthenticatedUser {
  schoolId: string;
}

export type AssignmentScope = string | AssignmentActor;

export function isAssignmentActor(scope: AssignmentScope): scope is AssignmentActor {
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

export function schoolIdFromScope(scope: AssignmentScope): string {
  return isAssignmentActor(scope) ? scope.schoolId : scope;
}

export function schoolObjectId(scope: AssignmentScope): mongoose.Types.ObjectId {
  return toObjectId(schoolIdFromScope(scope), 'schoolId');
}

export function canManageAllAssignments(actor: AssignmentActor): boolean {
  return actor.role === 'super_admin'
    || actor.role === 'school_admin'
    || actor.isSchoolPrincipal === true
    || actor.isHOD === true;
}

export function assignmentAccessFilter(scope: AssignmentScope): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    schoolId: schoolObjectId(scope),
    isDeleted: false,
  };

  if (isAssignmentActor(scope) && scope.role === 'teacher' && !canManageAllAssignments(scope)) {
    filter.teacherId = toObjectId(scope.id, 'teacherId');
  }

  return filter;
}

export function ensureUniqueObjectIds(ids: string[], label: string): mongoose.Types.ObjectId[] {
  const seen = new Set<string>();
  return ids.map((id) => {
    const oid = toObjectId(id, label);
    const key = oid.toString();
    if (seen.has(key)) throw new BadRequestError(`${label} must not contain duplicate ids`);
    seen.add(key);
    return oid;
  });
}

export async function assertCanUseClass(
  scope: AssignmentScope,
  classId: string,
  subjectId?: string | mongoose.Types.ObjectId,
  gradeId?: string | mongoose.Types.ObjectId,
): Promise<void> {
  const classOid = toObjectId(classId, 'classId');
  const schoolOid = schoolObjectId(scope);
  const cls = await Class.findOne({
    _id: classOid,
    schoolId: schoolOid,
    isDeleted: false,
  })
    .select('_id teacherId gradeId')
    .lean<{
      _id: mongoose.Types.ObjectId;
      teacherId?: mongoose.Types.ObjectId;
      gradeId: mongoose.Types.ObjectId;
    } | null>();

  if (!cls) throw new BadRequestError('Class does not belong to this school');

  if (gradeId && cls.gradeId.toString() !== toObjectId(gradeId, 'gradeId').toString()) {
    throw new BadRequestError('Class grade does not match this assignment');
  }

  if (!isAssignmentActor(scope) || scope.role !== 'teacher' || canManageAllAssignments(scope)) {
    return;
  }

  const teacherOid = toObjectId(scope.id, 'teacherId');
  if (cls.teacherId?.toString() === teacherOid.toString()) return;

  const timetableQuery: Record<string, unknown> = {
    schoolId: schoolOid,
    teacherId: teacherOid,
    classId: classOid,
    isDeleted: false,
  };
  if (subjectId) timetableQuery.subjectId = toObjectId(subjectId, 'subjectId');

  const teachesClass = await Timetable.exists(timetableQuery);
  if (!teachesClass) {
    throw new ForbiddenError('You can only push assignments to classes you teach');
  }
}

export async function assertAssignmentAcademicContext(
  scope: AssignmentScope,
  input: {
    subjectId: string;
    gradeId: string;
    topicIds: string[];
  },
): Promise<void> {
  const schoolOid = schoolObjectId(scope);
  const subjectOid = toObjectId(input.subjectId, 'subjectId');
  const gradeOid = toObjectId(input.gradeId, 'gradeId');
  const topicOids = ensureUniqueObjectIds(input.topicIds, 'topicIds');

  const [subject, grade, topics] = await Promise.all([
    Subject.findOne({ _id: subjectOid, schoolId: schoolOid, isDeleted: false })
      .select('_id gradeIds curriculumNodeId')
      .lean<{
        _id: mongoose.Types.ObjectId;
        gradeIds?: mongoose.Types.ObjectId[];
        curriculumNodeId?: mongoose.Types.ObjectId | null;
      } | null>(),
    Grade.findOne({ _id: gradeOid, schoolId: schoolOid, isDeleted: false })
      .select('_id curriculumNodeId')
      .lean<{
        _id: mongoose.Types.ObjectId;
        curriculumNodeId?: mongoose.Types.ObjectId | null;
      } | null>(),
    CurriculumNode.find({
      _id: { $in: topicOids },
      isDeleted: false,
      type: { $in: ['topic', 'subtopic', 'outcome'] },
      $or: [{ schoolId: null }, { schoolId: schoolOid }],
    })
      .select('_id subjectId gradeId termNumber type')
      .lean<Array<{
        _id: mongoose.Types.ObjectId;
        subjectId?: mongoose.Types.ObjectId | null;
        gradeId?: mongoose.Types.ObjectId | null;
        termNumber?: number | null;
        type: string;
      }>>(),
  ]);

  if (!subject) throw new BadRequestError('Subject does not belong to this school');
  if (!grade) throw new BadRequestError('Grade does not belong to this school');

  const linkedGradeIds = (subject.gradeIds ?? []).map((id) => id.toString());
  if (linkedGradeIds.length > 0 && !linkedGradeIds.includes(gradeOid.toString())) {
    throw new BadRequestError('Subject is not linked to the selected grade');
  }

  if (topics.length !== topicOids.length) {
    throw new BadRequestError('One or more topics are unavailable for this school');
  }

  const subjectNodeId = subject.curriculumNodeId?.toString();
  const gradeNodeId = grade.curriculumNodeId?.toString();
  const seenTerms = new Set<number>();
  for (const topic of topics) {
    if (subjectNodeId && topic.subjectId?.toString() !== subjectNodeId) {
      throw new BadRequestError('Topic does not match the selected subject');
    }
    if (gradeNodeId && topic.gradeId?.toString() !== gradeNodeId) {
      throw new BadRequestError('Topic does not match the selected grade');
    }
    if (typeof topic.termNumber === 'number') seenTerms.add(topic.termNumber);
  }

  if (seenTerms.size > 1) {
    throw new BadRequestError('Topics must come from the same term');
  }
}
