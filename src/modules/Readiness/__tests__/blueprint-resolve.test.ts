// src/modules/Readiness/__tests__/blueprint-resolve.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { Student } from '../../Student/model.js';
import { ExamBlueprint } from '../model-blueprint.js';
import { familyOfCode, familySubjectIds, gradeNumberFor, learnerTarget, publishedBlueprint, subjectFamily } from '../blueprint-resolve.js';
import { sastDay, sastWeekStart, sastYear, daysUntilDay } from '../engine/sast.js';
import { cleanUpClassrooms } from '../../../test-utils/standalone-classroom.js';
import {
  cleanUpReadiness, grade12Learner, makeCurriculum, publishFixture, readinessRoom, type ReadinessRoom, type ReadinessWorld,
} from '../../../test-utils/readiness-fixture.js';

let w: ReadinessWorld;
let room: ReadinessRoom;
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!);
  await ExamBlueprint.syncIndexes();
  w = await makeCurriculum();
  room = await readinessRoom(w);
  await publishFixture(w, { examYear: 2026 });
});
afterAll(async () => {
  await cleanUpReadiness(w);
  await cleanUpClassrooms();
  await mongoose.disconnect();
});

describe('SAST calendar', () => {
  it('sastWeekStart and sastDay use Johannesburg time: 22:30 UTC on a Sunday is already Monday', () => {
    expect(sastWeekStart(new Date('2026-09-27T22:30:00Z'))).toBe('2026-09-28');
    expect(sastWeekStart(new Date('2026-09-27T21:59:00Z'))).toBe('2026-09-21');
    expect(sastDay(new Date('2026-12-31T22:30:00Z'))).toBe('2027-01-01');
    expect(sastYear(new Date('2026-12-31T22:30:00Z'))).toBe(2027);
    expect(daysUntilDay('2026-10-27', new Date('2026-09-27T22:30:00Z'))).toBe(29);
  });
});

describe('resolution', () => {
  it('reads a family from a subject node code', () => {
    expect(familyOfCode('CAPS-MATHEMATICS-GR12')).toBe('CAPS-MATHEMATICS');
    expect(familyOfCode('CAPS-MATHEMATICS-GR12-T1-FUNC')).toBeNull();
  });

  it('finds the grade by the node link, else by the name', async () => {
    expect(await gradeNumberFor(room.schoolId, room.grade12)).toBe(12);
    expect(await gradeNumberFor(room.schoolId, room.grade10)).toBe(10);
    expect(await gradeNumberFor(room.schoolId, new mongoose.Types.ObjectId())).toBeNull();
  });

  it("finds a Subject's family by its node, and a teaching group's CurriculumNode subject too", async () => {
    expect(await subjectFamily(room.schoolId, room.maths12)).toEqual({ subjectKey: w.subjectKey, title: 'Mathematics' });
    expect(await subjectFamily(room.schoolId, w.subjectNodes.gr12)).toEqual({ subjectKey: w.subjectKey, title: 'Mathematics' });
    expect(await subjectFamily(room.schoolId, room.mathsLit)).toEqual({ subjectKey: null, title: 'Mathematical Literacy' });
  });

  it('reads every Mathematics Subject of the school, never Mathematical Literacy', async () => {
    const ids = (await familySubjectIds(room.schoolId, { subjectKey: w.subjectKey, subjectTitle: 'Mathematics' })).map(String).sort();
    expect(ids).toEqual([room.maths12, room.maths11, room.mathsLoose].map(String).sort());
  });

  it('finds the published blueprint by subject key or slug', async () => {
    expect(await publishedBlueprint({ subjectKey: w.subjectKey, grade: 12, examYear: 2026 })).toMatchObject({ status: 'published' });
    expect(await publishedBlueprint({ slug: `m${w.prefix.toLowerCase()}`, grade: 12, examYear: 2026 })).toMatchObject({ status: 'published' });
    expect(await publishedBlueprint({ subjectKey: w.subjectKey, grade: 12, examYear: 2027 })).toBeNull();
  });

  it('gives a Grade 12 learner the blueprint for this SAST year, and a Grade 10 learner none', async () => {
    const thabo = await grade12Learner(room, 'Thabo');
    const t = await learnerTarget(room.schoolId, thabo.studentId, w.subjectKey, new Date('2026-09-26T10:00:00Z'));
    expect(t).toMatchObject({ grade: 12 });
    expect(t?.subjectIds).toHaveLength(3);
    await Student.collection.updateOne({ _id: thabo.studentId }, { $set: { gradeId: room.grade10 } });
    expect(await learnerTarget(room.schoolId, thabo.studentId, w.subjectKey, new Date('2026-09-26T10:00:00Z'))).toBeNull();
  });
});
