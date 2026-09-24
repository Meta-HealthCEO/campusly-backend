// src/scripts/teacher-demo/seed-behaviour.ts
//
// A few behaviour entries for the demo teacher's learners, so the Behaviour
// page, the class feed and the learner profile's timeline have something to
// show. Idempotent: each entry has a fixed requestKey.

import mongoose from 'mongoose';
import { BehaviourEntry } from '../../modules/Behaviour/model.js';
import { Student } from '../../modules/Student/model.js';
import { User } from '../../modules/Auth/model.js';

type Id = mongoose.Types.ObjectId;

interface DemoEntry {
  key: string;
  learner: string; // first name
  kind: 'merit' | 'demerit' | 'incident';
  category: string;
  points: number;
  severity: 'low' | 'medium' | 'high' | null;
  note: string;
  daysAgo: number;
  source: 'log' | 'register' | 'roster' | 'profile';
}

const ENTRIES: DemoEntry[] = [
  { key: 'demo-behaviour-1', learner: 'Lebo', kind: 'merit', category: 'kindness', points: 2, severity: null, note: 'Helped a friend who fell at break.', daysAgo: 2, source: 'log' },
  { key: 'demo-behaviour-2', learner: 'Lebo', kind: 'merit', category: 'effort', points: 1, severity: null, note: 'Finished all her counting practice.', daysAgo: 0, source: 'register' },
  { key: 'demo-behaviour-3', learner: 'Jan', kind: 'demerit', category: 'late', points: -1, severity: 'low', note: 'Late after break.', daysAgo: 1, source: 'register' },
  { key: 'demo-behaviour-4', learner: 'Jan', kind: 'demerit', category: 'homework', points: -1, severity: 'low', note: 'No homework for the second time this week.', daysAgo: 3, source: 'roster' },
  { key: 'demo-behaviour-5', learner: 'Thabo', kind: 'incident', category: 'safety', points: 0, severity: 'medium', note: 'Climbed on the fence at break.', daysAgo: 1, source: 'log' },
  { key: 'demo-behaviour-6', learner: 'Anika', kind: 'merit', category: 'leadership', points: 2, severity: null, note: 'Led the class in from break, calmly.', daysAgo: 4, source: 'log' },
];

/** Adds the demo entries for learners in the teacher's classes; returns how many exist. */
export async function seedBehaviour(scope: { schoolId: Id; teacherId: Id; classIds: Id[] }): Promise<number> {
  const learners = await Student.find({ schoolId: scope.schoolId, classId: { $in: scope.classIds }, isDeleted: false }).select('_id userId classId').lean();
  const users = await User.find({ _id: { $in: learners.flatMap((l) => (l.userId ? [l.userId] : [])) } }).select('firstName').lean();
  const firstName = new Map(users.map((u) => [String(u._id), u.firstName]));
  const byName = new Map(learners.map((l) => [firstName.get(String(l.userId)) ?? '', l]));

  let count = 0;
  for (const e of ENTRIES) {
    const learner = byName.get(e.learner);
    if (!learner) continue;
    const occurredAt = new Date(Date.now() - e.daysAgo * 86_400_000);
    occurredAt.setHours(10, 30, 0, 0);
    await BehaviourEntry.findOneAndUpdate(
      { schoolId: scope.schoolId, loggedBy: scope.teacherId, requestKey: e.key },
      {
        $setOnInsert: {
          studentId: learner._id, classId: learner.classId ?? null, kind: e.kind, category: e.category, points: e.points,
          severity: e.severity, note: e.note, occurredAt, source: e.source, legacyId: null, isDeleted: false,
        },
      },
      { upsert: true },
    );
    count += 1;
  }
  return count;
}
