// src/modules/Academic/services/join-class.service.ts
//
// Joining a group with its classroom code (spec §3).
// - A standalone teacher's learner keeps their own group and ADDS the new
//   one (Student.subjectClassIds); a code from another teacher's classroom is
//   refused with a clear message; a group they're already in is a friendly 200.
// - A school learner keeps today's behaviour: the new class replaces the old.
// Either way they are enrolled in the units already released to the group.
import { Types, type HydratedDocument } from 'mongoose';
import { Class, type IClass } from '../model.js';
import { Student, type IStudent } from '../../Student/model.js';
import { BadRequestError, ConflictError, NotFoundError } from '../../../common/errors.js';
import { classRosterFilter, isInClass } from '../../../common/class-roster.js';
import { isStandaloneTeacherSchool } from '../../Auth/standalone-learner.js';
import { enrolOnJoin } from '../../Course/enrolment.js';

export const OTHER_TEACHER_CODE = "This code is for another teacher's class. Each teacher's class needs its own account for now.";
export const ALREADY_IN_GROUP = "You're already in this group";

type LeanClass = IClass & { _id: Types.ObjectId };

export interface JoinClassResult {
  class: LeanClass;
  previousClassId: string | null;
  joined: 'moved' | 'added' | 'already';
  message: string;
}

/** Capacity counts everyone in the group, through either field. */
async function assertRoom(cls: LeanClass): Promise<void> {
  if (!cls.capacity) return;
  const members = await Student.countDocuments(classRosterFilter(cls._id, { schoolId: cls.schoolId, isDeleted: false }));
  if (members >= cls.capacity) throw new ConflictError('This class is full');
}

async function addSecondGroup(student: HydratedDocument<IStudent>, cls: LeanClass): Promise<JoinClassResult> {
  if (isInClass(student, cls._id)) return { class: cls, previousClassId: null, joined: 'already', message: ALREADY_IN_GROUP };
  await assertRoom(cls);
  await Student.updateOne({ _id: student._id, schoolId: cls.schoolId }, { $addToSet: { subjectClassIds: cls._id } });
  await enrolOnJoin(student._id as Types.ObjectId, cls._id, cls.schoolId);
  return { class: cls, previousClassId: null, joined: 'added', message: `You joined ${cls.name}.` };
}

async function moveToClass(student: HydratedDocument<IStudent>, cls: LeanClass): Promise<JoinClassResult> {
  const previousClassId = student.classId ? String(student.classId) : null;
  if (previousClassId === String(cls._id)) throw new ConflictError('You are already in this class');
  await assertRoom(cls);
  student.classId = cls._id;
  student.gradeId = cls.gradeId as Types.ObjectId;
  await student.save();
  await enrolOnJoin(student._id as Types.ObjectId, cls._id, cls.schoolId);
  return { class: cls, previousClassId, joined: 'moved', message: 'Joined class successfully' };
}

export async function joinClassByCode(userId: string, schoolId: string, code: string): Promise<JoinClassResult> {
  // Codes are shown as "A B 1 2 C D"; accept any spacing and case.
  const normalised = code.replace(/\s+/g, '').toUpperCase();
  if (!normalised) throw new BadRequestError('Classroom code is required');

  // Codes are unique across schools (Class.classroomCode index), so this is the one group.
  const cls = await Class.findOne({ classroomCode: normalised, isDeleted: false }).lean<LeanClass>();
  const standalone = await isStandaloneTeacherSchool(schoolId);
  const inMySchool = !!cls && String(cls.schoolId) === String(schoolId);
  if (!cls || (!inMySchool && !standalone)) throw new NotFoundError('No class matches that code in your school');
  if (!inMySchool) throw new ConflictError(OTHER_TEACHER_CODE);

  const student = await Student.findOne({ userId, schoolId, isDeleted: false });
  if (!student) throw new NotFoundError('Student profile not found');
  return standalone ? addSecondGroup(student, cls) : moveToClass(student, cls);
}
