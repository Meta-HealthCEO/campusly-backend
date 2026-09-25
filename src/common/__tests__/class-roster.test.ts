// src/common/__tests__/class-roster.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { Student } from '../../modules/Student/model.js';
import { classRosterFilter, groupRosterByClass, isInClass, learnerClassIds } from '../class-roster.js';
import { cleanUpClassrooms, standaloneClassroom } from '../../test-utils/standalone-classroom.js';

const oid = () => new mongoose.Types.ObjectId();

describe('learnerClassIds', () => {
  it('lists the own group first, then the other groups, without repeats', () => {
    const [a, b] = [oid(), oid()];
    expect(learnerClassIds({ classId: a, subjectClassIds: [b, a, b] }).map(String)).toEqual([String(a), String(b)]);
    expect(learnerClassIds({ classId: a }).map(String)).toEqual([String(a)]);
    expect(learnerClassIds({ classId: null, subjectClassIds: [] })).toEqual([]);
  });

  it('answers whether a learner is in a class', () => {
    const [a, b, c] = [oid(), oid(), oid()];
    expect(isInClass({ classId: a, subjectClassIds: [b] }, String(b))).toBe(true);
    expect(isInClass({ classId: a, subjectClassIds: [b] }, c)).toBe(false);
  });
});

describe('groupRosterByClass', () => {
  it('puts a learner in every requested group they are in', () => {
    const [a, b, c] = [oid(), oid(), oid()];
    const lebo = { name: 'Lebo', classId: a };
    const thabo = { name: 'Thabo', classId: a, subjectClassIds: [b, c] };
    const buckets = groupRosterByClass([lebo, thabo], [a, b]);
    expect(buckets.get(String(a))?.map((s) => s.name)).toEqual(['Lebo', 'Thabo']);
    expect(buckets.get(String(b))?.map((s) => s.name)).toEqual(['Thabo']);
    expect(buckets.has(String(c))).toBe(false);
  });
});

describe('classRosterFilter', () => {
  beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
  afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

  it("adds to $and and keeps an existing $or (a search) intact", () => {
    const a = oid();
    const filter = classRosterFilter(a, { schoolId: 's', $or: [{ admissionNumber: /x/ }], $and: [{ isDeleted: false }] });
    expect(filter.$or).toEqual([{ admissionNumber: /x/ }]);
    expect(filter.$and).toEqual([{ isDeleted: false }, { $or: [{ classId: { $in: [a] } }, { subjectClassIds: { $in: [a] } }] }]);
  });

  it('finds learners whose own group or other group is the class', async () => {
    const room = await standaloneClassroom();
    const lebo = await room.learner('Lebo', room.maths.id);
    const thabo = await room.learner('Thabo', room.science.id, [room.maths.id]);
    await room.learner('Zola', room.science.id);
    const found = await Student.find(classRosterFilter(room.maths.id, { schoolId: room.schoolId, isDeleted: false })).select('_id').lean();
    expect(found.map((s) => String(s._id)).sort()).toEqual([String(lebo.studentId), String(thabo.studentId)].sort());
  });
});
