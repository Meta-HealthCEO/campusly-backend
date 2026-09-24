import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { ConferenceBookingService } from '../service-bookings.js';
import { ConferenceEvent, ConferenceTeacherAvailability, ConferenceBooking } from '../model.js';
import { classSchool } from '../../../test-utils/class-school.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
  // The test database may still hold the old slot index (unique whatever the status).
  await ConferenceBooking.syncIndexes();
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

/** A published parent evening with Thandi free for two 10-minute slots. */
async function parentEvening() {
  const f = await classSchool();
  const event = await ConferenceEvent.create({
    schoolId: f.schoolId, title: 'Term 3 parent evening', date: new Date(Date.now() + 7 * 86_400_000),
    startTime: '14:00', endTime: '16:00', status: 'published', createdBy: new mongoose.Types.ObjectId(),
  });
  await ConferenceTeacherAvailability.create({
    eventId: event._id, teacherId: f.thandi, schoolId: f.schoolId,
    windows: [{ startTime: '14:00', endTime: '14:20' }],
    generatedSlots: [
      { slotId: 's1', startTime: '14:00', endTime: '14:10', status: 'available' },
      { slotId: 's2', startTime: '14:10', endTime: '14:20', status: 'available' },
    ],
  });
  const book = (parentUser: mongoose.Types.ObjectId, studentId: mongoose.Types.ObjectId, slotId: string) =>
    ConferenceBookingService.createBooking(String(f.schoolId), String(parentUser), {
      eventId: String(event._id), teacherId: String(f.thandi), studentId: String(studentId), slotId,
    } as never, 'parent');
  return { f, event, book };
}

describe('booking a parent-evening slot', () => {
  it("refuses a child who isn't the parent's, and books nothing", async () => {
    const { f, event, book } = await parentEvening();
    await expect(book(f.janParent, f.lebo.id, 's1')).rejects.toThrow('You can only book for your own children.');
    expect(await ConferenceBooking.countDocuments({ eventId: event._id })).toBe(0);
    const availability = await ConferenceTeacherAvailability.findOne({ eventId: event._id }).lean();
    expect(availability?.generatedSlots[0].status).toBe('available');
  });

  it('lets a parent linked only as a guardian book for their child', async () => {
    const { f, book } = await parentEvening();
    await expect(book(f.qUser, f.sipho.id, 's1')).resolves.toBeTruthy();
  });

  it("names the learner on the teacher's schedule", async () => {
    const { f, event, book } = await parentEvening();
    const booking = await book(f.pUser, f.lebo.id, 's2') as unknown as { studentId: { userId: { firstName: string } } };
    expect(booking.studentId.userId.firstName).toBe('Lebo');
    const list = await ConferenceBookingService.listBookings(String(f.schoolId), { eventId: String(event._id) } as never, String(f.thandi), 'teacher');
    const first = (list as unknown as { bookings: Array<{ studentId: { userId: { firstName: string } } }> }).bookings[0];
    expect(first.studentId.userId.firstName).toBe('Lebo');
  });

  it('lets a cancelled slot be booked again', async () => {
    const { f, event, book } = await parentEvening();
    const first = await book(f.pUser, f.lebo.id, 's1') as unknown as { _id: unknown };
    await ConferenceBookingService.cancelBooking(String(first._id), String(f.schoolId), String(f.pUser), 'parent', {} as never);
    await expect(book(f.qUser, f.sipho.id, 's1')).resolves.toBeTruthy();
    const availability = await ConferenceTeacherAvailability.findOne({ eventId: event._id }).lean();
    expect(availability?.generatedSlots[0].status).toBe('booked');
    expect(await ConferenceBooking.countDocuments({ eventId: event._id, status: 'confirmed' })).toBe(1);
  });
});
