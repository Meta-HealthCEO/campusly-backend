// src/scripts/teacher-demo/seed-parent-evening.ts
//
// A parent evening next week: the demo teacher is free 14:00–16:00 in
// 10-minute slots, and the first learner with a linked parent is booked at
// 14:10. Idempotent: the event is found by its title.

import mongoose from 'mongoose';
import { ConferenceBooking, ConferenceEvent, ConferenceTeacherAvailability } from '../../modules/Conference/model.js';
import { Student } from '../../modules/Student/model.js';
import { Parent } from '../../modules/Parent/model.js';

type Id = mongoose.Types.ObjectId;

const TITLE = 'Term 3 parent evening';
const SLOT_MINUTES = 10;

const hhmm = (minutes: number): string => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

/** Ten-minute slots from 14:00 to 16:00, with stable ids so re-running changes nothing. */
function slots(): Array<{ slotId: string; startTime: string; endTime: string; status: 'available' }> {
  const out: Array<{ slotId: string; startTime: string; endTime: string; status: 'available' }> = [];
  for (let m = 14 * 60; m < 16 * 60; m += SLOT_MINUTES) {
    out.push({ slotId: `demo-${hhmm(m)}`, startTime: hhmm(m), endTime: hhmm(m + SLOT_MINUTES), status: 'available' });
  }
  return out;
}

/** Returns the booked learner's slot time, or null when no learner has a linked parent. */
export async function seedParentEvening(scope: { schoolId: Id; teacherId: Id; classIds: Id[] }): Promise<string | null> {
  const date = new Date(Date.now() + 7 * 86_400_000);
  date.setHours(0, 0, 0, 0);
  const event = await ConferenceEvent.findOneAndUpdate(
    { schoolId: scope.schoolId, title: TITLE },
    {
      $set: { date, startTime: '14:00', endTime: '16:00', slotDurationMinutes: SLOT_MINUTES, status: 'published', isDeleted: false },
      $setOnInsert: { createdBy: scope.teacherId },
    },
    { upsert: true, new: true },
  );

  const learners = await Student.find({ schoolId: scope.schoolId, classId: { $in: scope.classIds }, isDeleted: false }).select('_id guardianIds').lean();
  let pair: { studentId: Id; parentUserId: Id } | null = null;
  for (const l of learners) {
    const parent = await Parent.findOne({
      schoolId: scope.schoolId, isDeleted: false, $or: [{ childrenIds: l._id }, { _id: { $in: l.guardianIds ?? [] } }],
    }).select('userId').lean();
    if (parent?.userId) {
      pair = { studentId: l._id as Id, parentUserId: parent.userId as Id };
      break;
    }
  }

  const all = slots();
  const booked = pair ? all[1] : null;

  // Re-running the seed must not reset slots that already have a live booking
  // (the demo one, or a real one made through the app since the last run).
  const liveSlotIds = new Set(
    (await ConferenceBooking.find({
      eventId: event._id, teacherId: scope.teacherId, schoolId: scope.schoolId, status: 'confirmed', isDeleted: false,
    }).select('slotId').lean()).map((b) => b.slotId),
  );
  if (booked) liveSlotIds.add(booked.slotId);

  await ConferenceTeacherAvailability.findOneAndUpdate(
    { eventId: event._id, teacherId: scope.teacherId },
    {
      $set: {
        schoolId: scope.schoolId, windows: [{ startTime: '14:00', endTime: '16:00' }], isDeleted: false,
        generatedSlots: all.map((s) => (liveSlotIds.has(s.slotId) ? { ...s, status: 'booked' } : s)),
      },
    },
    { upsert: true },
  );
  if (!pair || !booked) return null;

  await ConferenceBooking.findOneAndUpdate(
    { eventId: event._id, teacherId: scope.teacherId, slotId: booked.slotId },
    {
      $set: {
        parentId: pair.parentUserId, studentId: pair.studentId, schoolId: scope.schoolId,
        slotStartTime: booked.startTime, slotEndTime: booked.endTime, status: 'confirmed', isDeleted: false,
      },
    },
    { upsert: true },
  );
  return booked.startTime;
}
