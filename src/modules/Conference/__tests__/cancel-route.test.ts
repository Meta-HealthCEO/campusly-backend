import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { School } from '../../School/model.js';
import { ConferenceBooking, ConferenceEvent, ConferenceTeacherAvailability } from '../model.js';
import { ConferenceBookingService } from '../service-bookings.js';
import { signTestToken } from '../../../test-utils/auth.js';
import { classSchool } from '../../../test-utils/class-school.js';

let fx: Awaited<ReturnType<typeof classSchool>>;

describe('PATCH /api/conferences/bookings/:id/cancel', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    await ConferenceBooking.syncIndexes();
    fx = await classSchool();
    await School.collection.insertOne({
      _id: fx.schoolId, name: `conf_cancel_${fx.schoolId}`, isActive: true, isDeleted: false, modulesEnabled: ['conference_booking'],
    });
  });

  afterAll(async () => {
    await School.deleteMany({ _id: fx.schoolId });
    await mongoose.connection.close();
  });

  it('cancels when the app sends no body (as the parent page does), and the slot can be booked again', async () => {
    const event = await ConferenceEvent.create({
      schoolId: fx.schoolId, title: 'Evening', date: new Date(Date.now() + 7 * 86_400_000),
      startTime: '14:00', endTime: '15:00', status: 'published', createdBy: new mongoose.Types.ObjectId(),
    });
    await ConferenceTeacherAvailability.create({
      eventId: event._id, teacherId: fx.thandi, schoolId: fx.schoolId, windows: [{ startTime: '14:00', endTime: '14:10' }],
      generatedSlots: [{ slotId: 's1', startTime: '14:00', endTime: '14:10', status: 'available' }],
    });
    const booking = await ConferenceBookingService.createBooking(String(fx.schoolId), String(fx.pUser), {
      eventId: String(event._id), teacherId: String(fx.thandi), studentId: String(fx.lebo.id), slotId: 's1',
    } as never, 'parent') as unknown as { _id: unknown };
    const token = signTestToken({ role: 'parent', schoolId: fx.schoolId, id: fx.pUser, isSchoolPrincipal: false, isStandaloneTeacher: false });

    const res = await request(app).patch(`/api/conferences/bookings/${String(booking._id)}/cancel`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    const slot = (await ConferenceTeacherAvailability.findOne({ eventId: event._id }).lean())?.generatedSlots[0];
    expect(slot?.status).toBe('available');
  });
});
