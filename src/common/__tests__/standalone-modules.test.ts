import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { STANDALONE_DEFAULT_MODULES } from '../moduleConfig.js';
import { School } from '../../modules/School/model.js';
import { User } from '../../modules/Auth/model.js';
import { pullStandaloneModules } from '../../scripts/standalone-modules.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await mongoose.disconnect(); });

describe('STANDALONE_DEFAULT_MODULES', () => {
  it('holds exactly the modules the standalone teacher portal uses', () => {
    expect([...STANDALONE_DEFAULT_MODULES]).toEqual([
      'auth', 'academic', 'ai_tools', 'teacher_workbench', 'learning', 'homework', 'attendance', 'courses',
    ]);
  });
});

describe('migrate:standalone-modules', () => {
  const insertSchool = async (plan: 'standalone' | 'school') => (await School.collection.insertOne({
    name: `Modules ${plan}`, joinCode: `M${new mongoose.Types.ObjectId().toHexString().slice(-8)}`, plan, isDeleted: false, createdAt: new Date(),
    modulesEnabled: ['auth', 'academic', 'homework', 'incident_wellbeing', 'communication', 'courses'],
  })).insertedId;

  it("leaves a standalone coach's sport club alone (it uses messaging)", async () => {
    const club = await insertSchool('standalone');
    const coach = (await User.collection.insertOne({
      email: `coach${new mongoose.Types.ObjectId()}@t.local`, firstName: 'Coach', lastName: 'C', role: 'coach',
      schoolId: club, isStandaloneCoach: true, isDeleted: false, createdAt: new Date(),
    })).insertedId;
    await School.collection.updateOne({ _id: club }, { $set: { ownerUserId: coach } });
    try {
      expect(await pullStandaloneModules({ apply: true, schoolIds: [club] })).toEqual({ matched: 0, updated: 0 });
      expect((await School.collection.findOne({ _id: club }))?.modulesEnabled).toContain('communication');
    } finally {
      await School.collection.deleteOne({ _id: club });
      await User.collection.deleteOne({ _id: coach });
    }
  });

  it('pulls communication and incident wellbeing from standalone schools only', async () => {
    const standalone = await insertSchool('standalone');
    const school = await insertSchool('school');
    try {
      const dry = await pullStandaloneModules({ apply: false, schoolIds: [standalone, school] });
      expect(dry).toEqual({ matched: 1, updated: 0 });
      expect((await School.collection.findOne({ _id: standalone }))?.modulesEnabled).toContain('communication');

      const applied = await pullStandaloneModules({ apply: true, schoolIds: [standalone, school] });
      expect(applied).toEqual({ matched: 1, updated: 1 });
      expect((await School.collection.findOne({ _id: standalone }))?.modulesEnabled).toEqual(['auth', 'academic', 'homework', 'courses']);
      expect((await School.collection.findOne({ _id: school }))?.modulesEnabled).toEqual(['auth', 'academic', 'homework', 'incident_wellbeing', 'communication', 'courses']);

      expect(await pullStandaloneModules({ apply: true, schoolIds: [standalone, school] })).toEqual({ matched: 0, updated: 0 });
    } finally {
      await School.collection.deleteMany({ _id: { $in: [standalone, school] } });
    }
  });
});
