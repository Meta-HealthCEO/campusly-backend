import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { seedParentEvening } from '../seed-parent-evening.js';
import { ConferenceBooking, ConferenceTeacherAvailability } from '../../../modules/Conference/model.js';
import { classSchool } from '../../../test-utils/class-school.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe('re-running the demo parent-evening seed', () => {
  it('keeps a real booking made since the last run, instead of resetting every slot', async () => {
    const f = await classSchool();
    const scope = { schoolId: f.schoolId, teacherId: f.thandi, classIds: [f.classA] };

    const firstRun = await seedParentEvening(scope);
    expect(firstRun).not.toBeNull();

    // A real parent books a different slot through the app after the seed ran.
    const availability = await ConferenceTeacherAvailability.findOne({ schoolId: f.schoolId, teacherId: f.thandi }).lean();
    const freeSlot = availability!.generatedSlots.find((s) => s.status === 'available');
    expect(freeSlot).toBeTruthy();
    await ConferenceBooking.create({
      eventId: availability!.eventId, teacherId: f.thandi, parentId: f.qUser, studentId: f.sipho.id,
      schoolId: f.schoolId, slotId: freeSlot!.slotId, slotStartTime: freeSlot!.startTime, slotEndTime: freeSlot!.endTime,
      status: 'confirmed',
    });
    await ConferenceTeacherAvailability.updateOne(
      { schoolId: f.schoolId, teacherId: f.thandi, 'generatedSlots.slotId': freeSlot!.slotId },
      { $set: { 'generatedSlots.$.status': 'booked' } },
    );

    // Re-running the seed must not free that real booking's slot.
    await seedParentEvening(scope);

    const after = await ConferenceTeacherAvailability.findOne({ schoolId: f.schoolId, teacherId: f.thandi }).lean();
    const stillBooked = after!.generatedSlots.find((s) => s.slotId === freeSlot!.slotId);
    expect(stillBooked?.status).toBe('booked');
  });
});
