// src/test-utils/standalone-classroom.ts
//
// Test fixture: a standalone teacher's classroom made by the real sign-up,
// with two teaching groups and a way to add learners to them. Every school it
// makes (and anything any test hangs off it) is removed by cleanUpClassrooms().
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { StandaloneService } from '../modules/Auth/standalone.service.js';
import { User } from '../modules/Auth/model.js';
import { Class } from '../modules/Academic/model.js';
import { Student } from '../modules/Student/model.js';
import { signTestToken } from './auth.js';

type Oid = mongoose.Types.ObjectId;
const oid = (): Oid => new mongoose.Types.ObjectId();
const made: Oid[] = [];

export interface Group { id: Oid; code: string; name: string }
export interface Learner { studentId: Oid; userId: Oid; email: string; token: string }
export interface Classroom {
  schoolId: Oid;
  teacherId: Oid;
  teacherToken: string;
  maths: Group;
  science: Group;
  group: (name: string, capacity?: number) => Promise<Group>;
  learner: (first: string, classId: Oid, subjectClassIds?: Oid[]) => Promise<Learner>;
}

/** A 6-character classroom code, made the way the app makes them (grade.service.ts:101-103). */
export const classroomCode = (): string => crypto.randomBytes(3).toString('hex').toUpperCase();

/** Remember a school a test made some other way, so cleanUpClassrooms() removes it too. */
export function trackSchool(id: Oid): void {
  made.push(id);
}

export async function standaloneClassroom(first = 'Lindiwe'): Promise<Classroom> {
  const email = `lp+${oid().toString()}@test.local`;
  const { user, tokens } = await StandaloneService.signup({ firstName: first, lastName: 'Teacher', email, password: 'Password1' });
  await User.updateOne({ _id: user._id }, { $set: { emailVerifiedAt: new Date() } });
  const schoolId = user.schoolId as Oid;
  const teacherId = user._id as Oid;
  trackSchool(schoolId);

  const group = async (name: string, capacity = 40): Promise<Group> => {
    const g: Group = { id: oid(), code: classroomCode(), name };
    await Class.collection.insertOne({
      _id: g.id, schoolId, name, gradeId: oid(), teacherId, capacity, classroomCode: g.code,
      isHomeroom: false, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    return g;
  };

  const learner = async (firstName: string, classId: Oid, subjectClassIds: Oid[] = []): Promise<Learner> => {
    const userId = oid();
    const studentId = oid();
    const learnerEmail = `lp-${firstName.toLowerCase()}-${userId.toString()}@test.local`;
    await User.collection.insertOne({
      _id: userId, schoolId, firstName, lastName: 'Learner', email: learnerEmail, role: 'student',
      isActive: true, isDeleted: false, refreshTokens: [], createdAt: new Date(), updatedAt: new Date(),
    });
    await Student.collection.insertOne({
      _id: studentId, schoolId, userId, classId, gradeId: oid(), subjectClassIds, guardianIds: [],
      admissionNumber: `LP-${studentId.toString()}`, enrollmentStatus: 'active', isDeleted: false,
      createdAt: new Date(), updatedAt: new Date(),
    });
    const token = signTestToken({ id: userId, schoolId, role: 'student', email: learnerEmail, isStandaloneTeacher: false, isSchoolPrincipal: false });
    return { studentId, userId, email: learnerEmail, token };
  };

  return {
    schoolId, teacherId, teacherToken: tokens.accessToken,
    maths: await group('Grade 10 Mathematics'), science: await group('Grade 10 Physical Sciences'),
    group, learner,
  };
}

/** Removes every school the fixtures made and every school-scoped document in any collection. */
export async function cleanUpClassrooms(): Promise<void> {
  const ids = made.splice(0);
  const db = mongoose.connection.db;
  if (ids.length === 0 || !db) return;
  const collections = await db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({ schoolId: { $in: ids } })));
  await db.collection('schools').deleteMany({ _id: { $in: ids } });
}
