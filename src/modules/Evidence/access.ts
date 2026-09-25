// src/modules/Evidence/access.ts
//
// Who may read what (plan ruling P6): each source's own read rule. Every
// refusal is a plain 404, so ids from another school reveal nothing.
import mongoose from 'mongoose';
import { NotFoundError } from '../../common/errors.js';
import { learnerClassIds } from '../../common/class-roster.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';
import { PaperMarking } from '../AITools/model-marking.js';
import { resolveStudentForUser } from '../AITools/service-student-ownership.js';
import { AssessmentPaper } from '../QuestionBank/model.js';
import { Homework, HomeworkSubmission } from '../Homework/model.js';
import { homeworkAccessFilter } from '../Homework/service-access.js';
import { Class } from '../Academic/model.js';
import { Student } from '../Student/model.js';
import type { Oid } from './types.js';

export const STAFF_ROLES = ['teacher', 'school_admin', 'super_admin'] as const;
export type Audience = 'teacher' | 'learner';
export interface RecordAccess { schoolId: Oid; recordId: Oid; audience: Audience; source: 'test' | 'homework' }

const ADMIN_ROLES = new Set(['school_admin', 'super_admin']);
const oid = (id: string | Oid): Oid => new mongoose.Types.ObjectId(String(id));
const notFound = (): NotFoundError => new NotFoundError('Not found');

function schoolOf(user: AuthenticatedUser): Oid {
  if (!user.schoolId) throw notFound();
  return oid(user.schoolId);
}

export async function meAsLearner(user: AuthenticatedUser): Promise<{ schoolId: Oid; studentId: Oid }> {
  const schoolId = schoolOf(user);
  const me = await resolveStudentForUser(user.id, String(schoolId)).catch(() => null);
  if (!me) throw notFound();
  return { schoolId, studentId: oid(me.studentId) };
}

const homeworkScope = (user: AuthenticatedUser, schoolId: Oid) => homeworkAccessFilter({ ...user, schoolId: String(schoolId) });

export async function recordAccess(user: AuthenticatedUser, source: 'test' | 'homework', recordId: string): Promise<RecordAccess> {
  const schoolId = schoolOf(user);
  const id = oid(recordId);
  const asLearner = user.role === 'student';
  const me = asLearner ? await meAsLearner(user) : null;
  if (source === 'test') {
    const m = await PaperMarking.findOne({ _id: id, schoolId, isDeleted: false }).select('studentId issuedToStudent').lean();
    if (!m) throw notFound();
    if (me && (!m.issuedToStudent || String(m.studentId) !== String(me.studentId))) throw notFound();
  } else {
    const sub = await HomeworkSubmission.findOne({ _id: id, schoolId, isDeleted: false }).select('studentId homeworkId').lean();
    if (!sub) throw notFound();
    if (me && String(sub.studentId) !== String(me.studentId)) throw notFound();
    if (!me && !(await Homework.exists({ _id: sub.homeworkId, ...homeworkScope(user, schoolId) }))) throw notFound();
  }
  return { schoolId, recordId: id, audience: me ? 'learner' : 'teacher', source };
}

export async function parentAccess(
  user: AuthenticatedUser, parent: 'paper' | 'homework', parentId: string, classId: string,
): Promise<{ schoolId: Oid; parentId: Oid; classId: Oid }> {
  const schoolId = schoolOf(user);
  const ok = parent === 'paper'
    ? await AssessmentPaper.exists({ _id: oid(parentId), schoolId, isDeleted: false })
    : await Homework.exists({ _id: oid(parentId), classId: oid(classId), ...homeworkScope(user, schoolId) });
  if (!ok) throw notFound();
  return { schoolId, parentId: oid(parentId), classId: oid(classId) };
}

const isAdmin = (user: AuthenticatedUser): boolean => ADMIN_ROLES.has(user.role) || user.isSchoolPrincipal === true;

export async function learnerAccess(user: AuthenticatedUser, studentId: string): Promise<{ schoolId: Oid; studentId: Oid }> {
  const schoolId = schoolOf(user);
  const student = await Student.findOne({ _id: oid(studentId), schoolId, isDeleted: false }).select('classId subjectClassIds').lean();
  if (!student) throw notFound();
  if (!isAdmin(user)) {
    const teaches = await Class.exists({ _id: { $in: learnerClassIds(student) }, schoolId, teacherId: oid(user.id), isDeleted: false });
    if (!teaches) throw notFound();
  }
  return { schoolId, studentId: student._id as Oid };
}

export async function classAccess(user: AuthenticatedUser, classId: string): Promise<{ schoolId: Oid; classId: Oid }> {
  const schoolId = schoolOf(user);
  const filter: Record<string, unknown> = { _id: oid(classId), schoolId, isDeleted: false };
  if (!isAdmin(user)) filter.teacherId = oid(user.id);
  if (!(await Class.exists(filter))) throw notFound();
  return { schoolId, classId: oid(classId) };
}
