import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { BehaviourService, type BehaviourActor } from '../service.js';
import { BehaviourEntry } from '../model.js';
import { Class } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
import { User } from '../../Auth/model.js';
import { PastoralReferral } from '../../Pastoral/model.js';
import { DisciplineService } from '../../Attendance/service-discipline.js';
import { MeritService } from '../../Attendance/service-merit.js';
import { WellbeingService } from '../../Pastoral/service-wellbeing.js';
import { DigestService } from '../../Digest/service.js';
import { AcademicReportService } from '../../Report/services/academic.service.js';
import { AggregationService } from '../../TeacherWorkbench/services/aggregation.service.js';
import type { AuthenticatedUser } from '../../../types/authenticated-request.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** Thandi teaches 1A (Lebo and Sipho); Pieter teaches 1B. */
async function school() {
  const schoolId = oid();
  const [thandi, pieter] = [oid(), oid()];
  const classA = oid();
  await Class.collection.insertOne({ _id: classA, schoolId, name: '1A', classroomCode: `c-${oid()}`, gradeId: oid(), teacherId: thandi, isDeleted: false });
  const learner = async (first: string) => {
    const userId = oid();
    const id = oid();
    await User.collection.insertOne({ _id: userId, schoolId, firstName: first, lastName: 'Learner', email: `${first}${oid()}@t.local`, role: 'student', isDeleted: false });
    await Student.collection.insertOne({ _id: id, schoolId, userId, classId: classA, admissionNumber: `A-${id}`, isDeleted: false });
    return id;
  };
  const lebo = await learner('Lebo');
  const sipho = await learner('Sipho');
  const actor = (id: mongoose.Types.ObjectId, role = 'teacher', extra: Partial<BehaviourActor> = {}): BehaviourActor => ({ id: String(id), role, schoolId: String(schoolId), ...extra });
  const admin = actor(oid(), 'school_admin');
  const adminUser = { id: admin.id, role: 'school_admin', schoolId: String(schoolId), email: 'a@t.local' } as AuthenticatedUser;
  return { schoolId, classA, lebo, sipho, thandi: actor(thandi), pieter: actor(pieter), hod: actor(oid(), 'teacher', { isHOD: true }), admin, adminUser };
}

const referral = (schoolId: mongoose.Types.ObjectId, studentId: mongoose.Types.ObjectId, by: string) => PastoralReferral.collection.insertOne({
  schoolId, studentId, referredBy: new mongoose.Types.ObjectId(by), reason: 'self_harm', urgency: 'high',
  description: 'Private.', status: 'referred', isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
});

describe('referrals on the timeline follow Pastoral\'s rule', () => {
  it("an HOD sees behaviour for any learner but only the referrals they made", async () => {
    const f = await school();
    await referral(f.schoolId, f.lebo, f.thandi.id);
    const view = await BehaviourService.forLearner(f.hod, String(f.lebo));
    expect(view.items.filter((i) => i.kind === 'referral')).toHaveLength(0);
  });

  it('a principal sees every referral', async () => {
    const f = await school();
    await referral(f.schoolId, f.lebo, f.thandi.id);
    const principal: BehaviourActor = { ...f.hod, isHOD: false, isSchoolPrincipal: true };
    const view = await BehaviourService.forLearner(principal, String(f.lebo));
    expect(view.items.filter((i) => i.kind === 'referral')).toHaveLength(1);
  });
});

describe('old Discipline and Merit records keep the log in step', () => {
  it('an admin discipline record is logged, edited and removed with it', async () => {
    const f = await school();
    const rec = await DisciplineService.createDiscipline(
      { studentId: f.lebo, type: 'bullying', severity: 'serious', description: 'Pushed a friend.' } as never, f.adminUser,
    );
    let entry = await BehaviourEntry.findOne({ legacyId: rec._id }).lean();
    expect(entry).toMatchObject({ kind: 'incident', category: 'bullying', note: 'Pushed a friend.', isDeleted: false });
    await DisciplineService.updateDiscipline(String(rec._id), f.adminUser, { description: 'Pushed a friend at break.' } as never);
    entry = await BehaviourEntry.findOne({ legacyId: rec._id }).lean();
    expect(entry?.note).toBe('Pushed a friend at break.');
    await DisciplineService.deleteDiscipline(String(rec._id), f.adminUser);
    entry = await BehaviourEntry.findOne({ legacyId: rec._id }).lean();
    expect(entry?.isDeleted).toBe(true);
  });

  it('an old-style merit is logged too', async () => {
    const f = await school();
    const m = await MeritService.createMerit({ studentId: f.lebo, schoolId: f.schoolId, type: 'merit', category: 'academic', points: 3, reason: 'Great test.' } as never, f.admin.id);
    expect(await BehaviourEntry.findOne({ legacyId: m._id }).lean()).toMatchObject({ kind: 'merit', category: 'academic', points: 3 });
  });
});

describe('everything that shows behaviour reads the one log', () => {
  it('the counsellor, the parent digest, the report and the workbench see what a teacher logged', async () => {
    const f = await school();
    await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'incident', category: 'bullying', severity: 'medium', note: 'Pushed Sipho.' });
    await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'merit', category: 'kindness', points: 2 });
    await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'demerit', category: 'late', points: 1, note: 'Late.' });

    const wellbeing = await WellbeingService.getWellbeingProfile(f.adminUser as never, String(f.lebo));
    expect(wellbeing.behaviour.recentIncidents.map((i: { description: string }) => i.description)).toContain('Pushed Sipho.');
    expect(wellbeing.behaviour.merits).toBe(2);

    const digest = await DigestService.generateEveningDigest(String(f.schoolId), String(f.lebo));
    expect(digest.incidents).toHaveLength(3);

    const report = await AcademicReportService.getStudentFullReport(String(f.lebo), String(f.schoolId));
    expect(report.behaviour).toMatchObject({ meritPoints: 2, meritCount: 1, demeritPoints: 1, demeritCount: 1, netPoints: 1 });

    const s360 = await AggregationService.getStudent360(String(f.lebo), String(f.schoolId));
    expect(s360.behaviour.netMeritScore).toBe(1);
    expect(s360.behaviour.recentIncidents).toHaveLength(1);
  });
});

describe('undo and retries', () => {
  it("a teacher can't undo a record moved in from the old system", async () => {
    const f = await school();
    const moved = await BehaviourEntry.create({
      schoolId: f.schoolId, studentId: f.lebo, classId: f.classA, kind: 'merit', category: 'effort', points: 1,
      loggedBy: new mongoose.Types.ObjectId(f.thandi.id), legacyId: oid(), occurredAt: new Date('2024-03-01'),
    });
    const feed = await BehaviourService.forClass(f.thandi, String(f.classA));
    expect(feed.entries[0].canUndo).toBe(false);
    await expect(BehaviourService.undo(f.thandi, String(moved._id))).rejects.toThrow();
    await BehaviourService.undo(f.admin, String(moved._id));
  });

  it('a retry that changed the learner is refused, not silently answered with the first entry', async () => {
    const f = await school();
    await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'merit', category: 'effort', requestKey: 'k-1' });
    await expect(BehaviourService.log(f.thandi, { studentId: String(f.sipho), kind: 'merit', category: 'effort', requestKey: 'k-1' }))
      .rejects.toThrow(/changed/);
  });
});

describe('the whole school log, for admins', () => {
  it('shows every learner newest first, filtered by kind; a teacher is refused', async () => {
    const f = await school();
    await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'merit', category: 'kindness' });
    await BehaviourService.log(f.thandi, { studentId: String(f.sipho), kind: 'incident', category: 'safety', severity: 'low', note: 'Fence.' });
    const all = await BehaviourService.forSchool(f.admin, {});
    expect(all.entries.map((e) => e.studentName)).toEqual(['Sipho Learner', 'Lebo Learner']);
    const incidents = await BehaviourService.forSchool(f.admin, { kind: 'incident' });
    expect(incidents.entries).toHaveLength(1);
    await expect(BehaviourService.forSchool(f.thandi, {})).rejects.toThrow();
  });
});
