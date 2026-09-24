import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { BehaviourService, type BehaviourActor } from '../service.js';
import { BehaviourEntry } from '../model.js';
import { Class } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
import { User } from '../../Auth/model.js';
import { PastoralReferral } from '../../Pastoral/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** Thandi teaches 1A (Lebo); Pieter teaches 1B (Jan). */
async function school() {
  const schoolId = oid();
  const [thandi, pieter] = [oid(), oid()];
  const [classA, classB] = [oid(), oid()];
  await Class.collection.insertMany([
    { _id: classA, schoolId, name: '1A', classroomCode: `c-${oid()}`, gradeId: oid(), teacherId: thandi, isDeleted: false },
    { _id: classB, schoolId, name: '1B', classroomCode: `c-${oid()}`, gradeId: oid(), teacherId: pieter, isDeleted: false },
  ]);
  const learner = async (first: string, classId: mongoose.Types.ObjectId) => {
    const userId = oid();
    const id = oid();
    await User.collection.insertOne({ _id: userId, schoolId, firstName: first, lastName: 'Learner', email: `${first}${oid()}@t.local`, role: 'student', isDeleted: false });
    await Student.collection.insertOne({ _id: id, schoolId, userId, classId, admissionNumber: `A-${id}`, isDeleted: false });
    return id;
  };
  const lebo = await learner('Lebo', classA);
  const jan = await learner('Jan', classB);
  await User.collection.insertOne({ _id: thandi, schoolId, firstName: 'Thandi', lastName: 'Molefe', email: `t${oid()}@t.local`, role: 'teacher', isDeleted: false });
  const actor = (id: mongoose.Types.ObjectId, role = 'teacher'): BehaviourActor => ({ id: String(id), role, schoolId: String(schoolId) });
  return { schoolId, classA, lebo, jan, thandi: actor(thandi), pieter: actor(pieter), admin: actor(oid(), 'school_admin') };
}

describe('BehaviourService.log', () => {
  it("logs a merit for a learner I teach, in the learner's class", async () => {
    const f = await school();
    const entry = await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'merit', category: 'kindness', points: 2, source: 'register' });
    expect(entry).toMatchObject({ kind: 'merit', category: 'kindness', points: 2, source: 'register' });
    expect(String(entry.classId)).toBe(String(f.classA));
    expect(String(entry.loggedBy)).toBe(f.thandi.id);
  });

  it("refuses a learner I don't teach, and saves nothing", async () => {
    const f = await school();
    await expect(BehaviourService.log(f.thandi, { studentId: String(f.jan), kind: 'merit', category: 'effort' }))
      .rejects.toThrow('You can only log behaviour for learners you teach.');
    expect(await BehaviourEntry.countDocuments({ studentId: f.jan })).toBe(0);
  });

  it('logs once when the same log is sent twice (a double tap)', async () => {
    const f = await school();
    const input = { studentId: String(f.lebo), kind: 'demerit', category: 'late', note: 'Late after break.', requestKey: 'tap-1' };
    const a = await BehaviourService.log(f.thandi, input);
    const b = await BehaviourService.log(f.thandi, input);
    expect(String(a._id)).toBe(String(b._id));
    expect(await BehaviourEntry.countDocuments({ studentId: f.lebo, isDeleted: false })).toBe(1);
  });
});

describe('BehaviourService.forLearner and forClass', () => {
  it("shows a learner's behaviour and my referrals in one timeline, with the summary", async () => {
    const f = await school();
    await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'merit', category: 'kindness', points: 2 });
    await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'demerit', category: 'late', note: 'Late.' });
    await PastoralReferral.collection.insertOne({
      schoolId: f.schoolId, studentId: f.lebo, referredBy: new mongoose.Types.ObjectId(f.thandi.id), reason: 'emotional', urgency: 'low',
      description: 'Seems withdrawn this week.', status: 'referred', isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    const view = await BehaviourService.forLearner(f.thandi, String(f.lebo));
    expect(view.summary).toEqual({ merits: 1, demerits: 1, incidents: 0, net: 1 });
    expect(view.items.map((i) => i.kind).sort()).toEqual(['demerit', 'merit', 'referral']);
    expect(view.items.find((i) => i.kind === 'merit')?.by).toBe('Thandi Molefe');
    await expect(BehaviourService.forLearner(f.pieter, String(f.lebo))).rejects.toThrow('You can only see behaviour for learners you teach.');
  });

  it("lists my class's recent behaviour with each learner's name", async () => {
    const f = await school();
    await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'merit', category: 'effort' });
    const list = await BehaviourService.forClass(f.thandi, String(f.classA));
    expect(list.entries.map((e) => [e.studentName, e.kind])).toEqual([['Lebo Learner', 'merit']]);
    await expect(BehaviourService.forClass(f.pieter, String(f.classA))).rejects.toThrow('You can only see behaviour for classes you teach.');
  });
});

describe('BehaviourService.undo', () => {
  it('lets the teacher who logged it undo it within a day, and an admin any time', async () => {
    const f = await school();
    const mine = await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'merit', category: 'effort' });
    await expect(BehaviourService.undo(f.pieter, String(mine._id))).rejects.toThrow('You can undo only what you logged, within a day.');
    await BehaviourService.undo(f.thandi, String(mine._id));
    expect((await BehaviourEntry.findById(mine._id).lean())?.isDeleted).toBe(true);

    const old = await BehaviourService.log(f.thandi, { studentId: String(f.lebo), kind: 'merit', category: 'effort' });
    // createdAt is immutable through Mongoose; write it directly to age the entry.
    await BehaviourEntry.collection.updateOne({ _id: old._id }, { $set: { createdAt: new Date(Date.now() - 2 * 86_400_000) } });
    await expect(BehaviourService.undo(f.thandi, String(old._id))).rejects.toThrow('You can undo only what you logged, within a day.');
    await BehaviourService.undo(f.admin, String(old._id));
    expect((await BehaviourEntry.findById(old._id).lean())?.isDeleted).toBe(true);
  });
});
