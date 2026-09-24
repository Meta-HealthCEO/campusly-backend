import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { Student360Service } from '../services/student360.service.js';
import { Student } from '../../Student/model.js';
import { User } from '../../Auth/model.js';
import { BehaviourEntry } from '../../Behaviour/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe("Student360Service: the learner's behaviour comes from the one behaviour log", () => {
  it('summarises it, lists the latest, and keeps demerits and incidents where the parent view reads them', async () => {
    const schoolId = oid();
    const studentId = oid();
    const userId = oid();
    const teacher = oid();
    await User.collection.insertOne({ _id: userId, schoolId, firstName: 'Lebo', lastName: 'Mthembu', email: `l${oid()}@t.local`, role: 'student', isDeleted: false });
    await Student.collection.insertOne({ _id: studentId, schoolId, userId, admissionNumber: `A-${studentId}`, isDeleted: false });
    const at = (d: string) => new Date(`2026-09-${d}T09:00:00Z`);
    await BehaviourEntry.collection.insertMany([
      { schoolId, studentId, kind: 'merit', category: 'kindness', points: 2, severity: null, note: 'Helped a friend.', occurredAt: at('20'), loggedBy: teacher, source: 'log', isDeleted: false },
      { schoolId, studentId, kind: 'demerit', category: 'late', points: -1, severity: 'low', note: 'Late after break.', occurredAt: at('21'), loggedBy: teacher, source: 'register', isDeleted: false },
      { schoolId, studentId, kind: 'incident', category: 'fighting', points: 0, severity: 'medium', note: 'Pushed a learner.', occurredAt: at('22'), loggedBy: teacher, source: 'log', isDeleted: false },
      { schoolId, studentId, kind: 'merit', category: 'effort', points: 5, severity: null, note: '', occurredAt: at('23'), loggedBy: teacher, source: 'log', isDeleted: true },
    ]);

    const view = await Student360Service.getStudent360(String(schoolId), String(studentId));
    expect(view?.behaviour.summary).toEqual({ merits: 1, demerits: 1, incidents: 1, net: 1 });
    expect(view?.behaviour.recent.map((r) => [r.kind, r.label])).toEqual([
      ['incident', 'Incident · Fighting'], ['demerit', 'Demerit −1 · Late'], ['merit', 'Merit +2 · Kindness'],
    ]);
    expect(view?.behaviour.recentIncidents).toEqual([
      { type: 'fighting', description: 'Pushed a learner.', date: at('22').toISOString(), severity: 'medium' },
      { type: 'late', description: 'Late after break.', date: at('21').toISOString(), severity: 'low' },
    ]);
    expect(view?.achievements).toMatchObject({ totalMerits: 2, totalDemerits: 1 });
  });
});
