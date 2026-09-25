// src/modules/Notification/__tests__/learner-notices.test.ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { Notification } from '../model.js';
import { NotificationService } from '../service.js';
import { Student } from '../../Student/model.js';
import { School } from '../../School/model.js';
import { dueLabel, notifyClassLearners, notifyLearnerOnce, type LearnerNotice } from '../learner-notices.js';
import { cleanUpClassrooms, standaloneClassroom, trackSchool } from '../../../test-utils/standalone-classroom.js';

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

const notice: LearnerNotice = { title: 'New homework: Waves', message: 'Due 3 October.', entityType: 'homework', entityId: 'hw1', link: '/student/homework/hw1' };
const noticesFor = (userId: mongoose.Types.ObjectId) => Notification.find({ recipientId: userId, isDeleted: false }).lean();

describe('notifyClassLearners', () => {
  it("tells the group's own learners and those who joined it, with a link that opens", async () => {
    const room = await standaloneClassroom();
    const zola = await room.learner('Zola', room.science.id);
    const thabo = await room.learner('Thabo', room.maths.id, [room.science.id]);
    const lebo = await room.learner('Lebo', room.maths.id);
    await notifyClassLearners(room.schoolId, [room.science.id], notice);
    expect(await noticesFor(zola.userId)).toHaveLength(1);
    expect(await noticesFor(thabo.userId)).toHaveLength(1);
    expect(await noticesFor(lebo.userId)).toHaveLength(0);
    expect(((await noticesFor(thabo.userId))[0]?.data as { link?: string }).link).toBe('/student/homework/hw1');
  });
});

describe('notifyLearnerOnce', () => {
  it('tells a learner once per piece of work', async () => {
    const room = await standaloneClassroom();
    const thabo = await room.learner('Thabo', room.maths.id);
    await notifyLearnerOnce(room.schoolId, thabo.studentId, { ...notice, entityType: 'homework_marked', entityId: 'sub1:1' });
    await notifyLearnerOnce(room.schoolId, thabo.studentId, { ...notice, entityType: 'homework_marked', entityId: 'sub1:1' });
    expect(await noticesFor(thabo.userId)).toHaveLength(1);
  });
});

describe('school learners (no behaviour change, Global Constraints)', () => {
  it("hear nothing new: the learner notices are for standalone teachers' classrooms", async () => {
    const schoolId = new mongoose.Types.ObjectId();
    trackSchool(schoolId);
    await School.collection.insertOne({ _id: schoolId, name: 'lp_school', plan: 'school', isActive: true, isDeleted: false });
    const [classId, userId, studentId] = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
    await Student.collection.insertOne({ _id: studentId, schoolId, userId, classId, subjectClassIds: [], admissionNumber: `S-${studentId}`, isDeleted: false });
    await notifyClassLearners(schoolId, [classId], notice);
    await notifyLearnerOnce(schoolId, studentId, { ...notice, entityType: 'homework_marked', entityId: 'sub9:1' });
    expect(await noticesFor(userId)).toHaveLength(0);
  });
});

describe('NotificationService.bulkCreate to a class', () => {
  it('reaches the whole group and never a learner in another school', async () => {
    const room = await standaloneClassroom();
    await room.learner('Zola', room.science.id);
    await room.learner('Thabo', room.maths.id, [room.science.id]);
    const otherSchool = new mongoose.Types.ObjectId();
    trackSchool(otherSchool);
    await Student.collection.insertOne({ schoolId: otherSchool, userId: new mongoose.Types.ObjectId(), classId: room.science.id, admissionNumber: 'X-1', isDeleted: false });
    const { count } = await NotificationService.bulkCreate({
      schoolId: String(room.schoolId), targetType: 'class', targetId: String(room.science.id), type: 'in_app', title: 'Trip', message: 'Bring a hat.',
    });
    expect(count).toBe(2);
  });
});

describe('dueLabel', () => {
  it('names the SAST day', () => {
    expect(dueLabel(new Date('2026-09-30T23:30:00Z'))).toBe('1 October');
  });
});
