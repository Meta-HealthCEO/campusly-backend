// src/modules/Student/__tests__/leave-group.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { Student } from '../model.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom } from '../../../test-utils/standalone-classroom.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

const remove = (room: Classroom, studentId: mongoose.Types.ObjectId, classId?: mongoose.Types.ObjectId) =>
  request(app).delete(`/api/students/${String(studentId)}${classId ? `?classId=${String(classId)}` : ''}`)
    .set('Authorization', `Bearer ${room.teacherToken}`);

describe('remove from this group', () => {
  it('takes a learner out of a group they joined, and nothing else', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id, [room.science.id]);
    const res = await remove(room, thabo.studentId, room.science.id);
    expect(res.status).toBe(200);
    expect(res.body.data.removed).toBe('group');
    const after = await Student.findById(thabo.studentId).lean();
    expect(after?.isDeleted).toBe(false);
    expect(String(after?.classId)).toBe(String(room.maths.id));
    expect(after?.subjectClassIds).toEqual([]);
  });

  it('promotes the other group when a learner leaves their own group (Review Focus 1)', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id, [room.science.id]);
    expect((await remove(room, thabo.studentId, room.maths.id)).body.data.removed).toBe('group');
    const after = await Student.findById(thabo.studentId).lean();
    expect(after?.isDeleted).toBe(false);
    expect(String(after?.classId)).toBe(String(room.science.id));
    expect(after?.subjectClassIds).toEqual([]);
  });

  it('deletes a learner who is in no other group, as before — and without a group, as before', async () => {
    const room = await standaloneClassroom();
    const lebo = await room.learner('Lebo', room.maths.id);
    expect((await remove(room, lebo.studentId, room.maths.id)).body.data.removed).toBe('learner');
    expect((await Student.findById(lebo.studentId).lean())?.isDeleted).toBe(true);
    const zola = await room.learner('Zola', room.maths.id, [room.science.id]);
    expect((await remove(room, zola.studentId)).status).toBe(200);
    expect((await Student.findById(zola.studentId).lean())?.isDeleted).toBe(true);
  });

  it("refuses a group the learner isn't in", async () => {
    const room = await standaloneClassroom();
    const lebo = await room.learner('Lebo', room.maths.id);
    expect((await remove(room, lebo.studentId, room.science.id)).status).toBe(404);
  });
});
