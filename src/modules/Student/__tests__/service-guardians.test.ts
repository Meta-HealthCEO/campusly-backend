import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { StudentService } from '../service.js';
import { Student } from '../model.js';
import { Parent } from '../../Parent/model.js';
import { Class } from '../../Academic/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function schoolFixture() {
  const schoolId = oid();
  const gradeId = oid();
  const classId = oid();
  await Class.collection.insertOne({ _id: classId, schoolId, name: '1A', classroomCode: `c-${oid()}`, gradeId, teacherId: oid(), isDeleted: false });
  const parentOne = oid();
  const parentTwo = oid();
  await Parent.collection.insertMany([
    { _id: parentOne, schoolId, userId: oid(), childrenIds: [], relationship: 'mother', isDeleted: false },
    { _id: parentTwo, schoolId, userId: oid(), childrenIds: [], relationship: 'father', isDeleted: false },
  ]);
  return { schoolId, gradeId, classId, parentOne, parentTwo };
}

describe('StudentService backfills Parent.childrenIds from guardianIds', () => {
  it('adds the new learner to each named guardian on create', async () => {
    const f = await schoolFixture();
    const { student } = await StudentService.create({
      schoolId: f.schoolId,
      gradeId: f.gradeId,
      classId: f.classId,
      admissionNumber: `A-${oid()}`,
      guardianIds: [f.parentOne, f.parentTwo],
    });

    const [p1, p2] = await Promise.all([
      Parent.findById(f.parentOne).lean(),
      Parent.findById(f.parentTwo).lean(),
    ]);
    expect(p1?.childrenIds.map(String)).toEqual([String(student._id)]);
    expect(p2?.childrenIds.map(String)).toEqual([String(student._id)]);
  });

  it('adds to the newly-linked guardian and removes from the unlinked one on update', async () => {
    const f = await schoolFixture();
    const { student } = await StudentService.create({
      schoolId: f.schoolId,
      gradeId: f.gradeId,
      classId: f.classId,
      admissionNumber: `A-${oid()}`,
      guardianIds: [f.parentOne],
    });
    expect((await Parent.findById(f.parentOne).lean())?.childrenIds.map(String)).toEqual([String(student._id)]);

    await StudentService.update(String(student._id), String(f.schoolId), { guardianIds: [f.parentTwo] } as never);

    const [p1, p2] = await Promise.all([
      Parent.findById(f.parentOne).lean(),
      Parent.findById(f.parentTwo).lean(),
    ]);
    expect(p1?.childrenIds.map(String)).toEqual([]);
    expect(p2?.childrenIds.map(String)).toEqual([String(student._id)]);
  });

  it('removes the learner from a guardian entirely when guardianIds is cleared', async () => {
    const f = await schoolFixture();
    const { student } = await StudentService.create({
      schoolId: f.schoolId,
      gradeId: f.gradeId,
      classId: f.classId,
      admissionNumber: `A-${oid()}`,
      guardianIds: [f.parentOne],
    });

    await StudentService.update(String(student._id), String(f.schoolId), { guardianIds: [] } as never);

    expect((await Parent.findById(f.parentOne).lean())?.childrenIds.map(String)).toEqual([]);
  });
});

describe('StudentService only links guardians from the same school', () => {
  it("refuses another school's parent on create and on update, and leaves that parent alone", async () => {
    const f = await schoolFixture();
    const other = await schoolFixture();
    await expect(StudentService.create({
      schoolId: f.schoolId, gradeId: f.gradeId, classId: f.classId, admissionNumber: `A-${oid()}`,
      guardianIds: [f.parentOne, other.parentOne],
    })).rejects.toMatchObject({ statusCode: 400 });
    expect((await Parent.findById(f.parentOne).lean())?.childrenIds).toEqual([]);

    const { student } = await StudentService.create({
      schoolId: f.schoolId, gradeId: f.gradeId, classId: f.classId, admissionNumber: `A-${oid()}`, guardianIds: [f.parentOne],
    });
    await expect(StudentService.update(String(student._id), String(f.schoolId), { guardianIds: [other.parentTwo] } as never))
      .rejects.toMatchObject({ statusCode: 400 });
    expect((await Parent.findById(other.parentTwo).lean())?.childrenIds).toEqual([]);
    expect((await Student.findById(student._id).lean())?.guardianIds.map(String)).toEqual([String(f.parentOne)]);
  });

  it('refuses a deleted parent', async () => {
    const f = await schoolFixture();
    await Parent.collection.updateOne({ _id: f.parentTwo }, { $set: { isDeleted: true } });
    await expect(StudentService.create({
      schoolId: f.schoolId, gradeId: f.gradeId, classId: f.classId, admissionNumber: `A-${oid()}`, guardianIds: [f.parentTwo],
    })).rejects.toMatchObject({ statusCode: 400 });
    expect((await Parent.findById(f.parentTwo).lean())?.childrenIds).toEqual([]);
  });
});
