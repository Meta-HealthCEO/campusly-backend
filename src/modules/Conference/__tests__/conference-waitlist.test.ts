import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { ConferenceWaitlistService } from '../service-waitlist.js';
import { ConferenceEvent, ConferenceTeacherAvailability } from '../model.js';
import { classSchool } from '../../../test-utils/class-school.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** A published, fully-booked parent evening so waitlisting is the only option. */
async function fullEvening() {
  const f = await classSchool();
  const event = await ConferenceEvent.create({
    schoolId: f.schoolId, title: 'Term 3 parent evening', date: new Date(Date.now() + 7 * 86_400_000),
    startTime: '14:00', endTime: '14:10', status: 'published', createdBy: new mongoose.Types.ObjectId(),
  });
  await ConferenceTeacherAvailability.create({
    eventId: event._id, teacherId: f.thandi, schoolId: f.schoolId,
    windows: [{ startTime: '14:00', endTime: '14:10' }],
    generatedSlots: [{ slotId: 's1', startTime: '14:00', endTime: '14:10', status: 'booked' }],
  });
  return { f, event };
}

describe('joining a parent-evening waitlist', () => {
  it("refuses a child who isn't the parent's, and joins nobody", async () => {
    const { f, event } = await fullEvening();
    await expect(ConferenceWaitlistService.joinWaitlist(String(f.schoolId), String(f.janParent), {
      eventId: String(event._id), teacherId: String(f.thandi), studentId: String(f.lebo.id),
    } as never, 'parent')).rejects.toThrow('You can only join the waitlist for your own children.');
  });

  it('lets a parent linked only as a guardian join the waitlist, and names the learner', async () => {
    const { f, event } = await fullEvening();
    const entry = await ConferenceWaitlistService.joinWaitlist(String(f.schoolId), String(f.qUser), {
      eventId: String(event._id), teacherId: String(f.thandi), studentId: String(f.sipho.id),
    } as never, 'parent');
    expect(entry.position).toBe(1);

    const list = await ConferenceWaitlistService.listWaitlist(
      String(f.schoolId), { eventId: String(event._id) } as never, String(f.qUser), 'parent',
    ) as unknown as Array<{ studentId: { userId: { firstName: string } } }>;
    expect(list[0].studentId.userId.firstName).toBe('Sipho');
  });

  it('lets an admin join the waitlist on a child not linked to them', async () => {
    const { f, event } = await fullEvening();
    await expect(ConferenceWaitlistService.joinWaitlist(String(f.schoolId), String(new mongoose.Types.ObjectId()), {
      eventId: String(event._id), teacherId: String(f.thandi), studentId: String(f.lebo.id),
    } as never, 'school_admin')).resolves.toBeTruthy();
  });
});
