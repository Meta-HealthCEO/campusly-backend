import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { migrateBehaviour } from '../service-migration.js';
import { BehaviourEntry } from '../model.js';
import { Discipline, Merit } from '../../Attendance/model.js';
import { Student } from '../../Student/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function school() {
  const schoolId = oid();
  const classId = oid();
  const teacher = oid();
  const [lebo, gone] = [oid(), oid()];
  await Student.collection.insertMany([
    { _id: lebo, schoolId, userId: oid(), classId, admissionNumber: `A-${lebo}`, isDeleted: false },
    { _id: gone, schoolId, userId: oid(), classId, admissionNumber: `A-${gone}`, isDeleted: true },
  ]);
  const when = new Date('2026-08-01T08:00:00Z');
  await Merit.collection.insertMany([
    { schoolId, studentId: lebo, awardedBy: teacher, type: 'merit', points: 2, category: 'behaviour', reason: 'Helped tidy.', isDeleted: false, createdAt: when },
    { schoolId, studentId: gone, awardedBy: teacher, type: 'merit', points: 1, category: 'sport', reason: 'Won.', isDeleted: false, createdAt: when },
  ]);
  await Discipline.collection.insertOne({
    schoolId, studentId: lebo, reportedBy: teacher, type: 'bullying', severity: 'moderate', description: 'Teased a learner.', status: 'resolved', isDeleted: false, createdAt: when,
  });
  return { schoolId: String(schoolId), classId, lebo };
}

describe('migrateBehaviour', () => {
  it('a dry run reports what would move and changes nothing', async () => {
    const f = await school();
    const report = await migrateBehaviour({ apply: false, schoolId: f.schoolId });
    expect(report).toMatchObject({ applied: false, merits: 1, discipline: 1, skippedLeftLearners: 1, alreadyMoved: 0 });
    expect(await BehaviourEntry.countDocuments({ schoolId: f.schoolId })).toBe(0);
  });

  it("moves each record once into the learner's behaviour log, with its date, teacher and class", async () => {
    const f = await school();
    const report = await migrateBehaviour({ apply: true, schoolId: f.schoolId });
    expect(report).toMatchObject({ applied: true, merits: 1, discipline: 1, skippedLeftLearners: 1 });
    const entries = await BehaviourEntry.find({ schoolId: f.schoolId }).sort({ kind: 1 }).lean();
    expect(entries.map((e) => [e.kind, e.category, e.points, e.note])).toEqual([
      ['incident', 'bullying', 0, 'Teased a learner.'],
      ['merit', 'effort', 2, 'Helped tidy.'],
    ]);
    expect(entries.every((e) => String(e.classId) === String(f.classId) && e.legacyId && e.occurredAt.toISOString() === '2026-08-01T08:00:00.000Z')).toBe(true);

    const again = await migrateBehaviour({ apply: true, schoolId: f.schoolId });
    expect(again).toMatchObject({ merits: 0, discipline: 0, alreadyMoved: 2 });
    expect(await BehaviourEntry.countDocuments({ schoolId: f.schoolId })).toBe(2);
  });
});
