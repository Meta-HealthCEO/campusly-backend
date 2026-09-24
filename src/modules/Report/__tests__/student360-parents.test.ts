import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Student360Service } from '../services/student360.service.js';
import { Student } from '../../Student/model.js';
import { Parent } from '../../Parent/model.js';
import { User } from '../../Auth/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function learner(parents: Array<{ first: string; last: string; relationship: string; link: 'guardian' | 'child' | 'both'; account?: 'deleted' | 'missing' }>) {
  const schoolId = oid();
  const studentId = oid();
  const learnerUser = oid();
  await User.collection.insertOne({ _id: learnerUser, schoolId, firstName: 'Lebo', lastName: 'Mthembu', email: `l${oid()}@t.local`, role: 'student', isDeleted: false });
  const guardianIds: mongoose.Types.ObjectId[] = [];
  const out: Array<{ userId: mongoose.Types.ObjectId }> = [];
  for (const p of parents) {
    const userId = oid();
    const parentId = oid();
    if (p.account !== 'missing') {
      await User.collection.insertOne({ _id: userId, schoolId, firstName: p.first, lastName: p.last, email: `p${oid()}@t.local`, role: 'parent', isDeleted: p.account === 'deleted' });
    }
    await Parent.collection.insertOne({
      _id: parentId, userId, schoolId, relationship: p.relationship, isDeleted: false,
      childrenIds: p.link === 'guardian' ? [] : [studentId],
    });
    if (p.link !== 'child') guardianIds.push(parentId);
    out.push({ userId });
  }
  await Student.collection.insertOne({ _id: studentId, schoolId, userId: learnerUser, admissionNumber: `A-${studentId}`, guardianIds, isDeleted: false });
  return { schoolId: String(schoolId), studentId: String(studentId), parents: out };
}

describe('Student360Service: the learner\'s parents', () => {
  it('lists each parent once, by name and relationship, linked either way', async () => {
    const f = await learner([
      { first: 'Zanele', last: 'Mthembu', relationship: 'mother', link: 'both' },
      { first: 'Sipho', last: 'Mthembu', relationship: 'father', link: 'child' },
    ]);
    const view = await Student360Service.getStudent360(f.schoolId, f.studentId);
    expect(view?.parents).toEqual([
      { userId: String(f.parents[0].userId), name: 'Zanele Mthembu', relationship: 'mother' },
      { userId: String(f.parents[1].userId), name: 'Sipho Mthembu', relationship: 'father' },
    ]);
  });

  it('is an empty list when no parent is linked', async () => {
    const f = await learner([]);
    expect((await Student360Service.getStudent360(f.schoolId, f.studentId))?.parents).toEqual([]);
  });
});

describe("Student360Service: parents who can't be messaged", () => {
  it('leaves out a parent whose account was removed or is missing', async () => {
    const f = await learner([
      { first: 'Gone', last: 'Parent', relationship: 'father', link: 'guardian', account: 'deleted' },
      { first: 'Ghost', last: 'Parent', relationship: 'other', link: 'child', account: 'missing' },
      { first: 'Zanele', last: 'Mthembu', relationship: 'mother', link: 'guardian' },
    ]);
    const view = await Student360Service.getStudent360(f.schoolId, f.studentId);
    expect(view?.parents?.map((p) => p.name)).toEqual(['Zanele Mthembu']);
  });
});
