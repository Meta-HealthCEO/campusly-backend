import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { Announcement } from '../model.js';
import { signTestToken } from '../../../test-utils/auth.js';

const oid = () => new mongoose.Types.ObjectId();

describe('announcements stay in their school, and drafts stay with admins', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
  });
  afterAll(async () => {
    await mongoose.connection.close();
  });

  const draftIn = async (schoolId: mongoose.Types.ObjectId) => (await Announcement.collection.insertOne({
    schoolId, title: 'Draft: staff party', content: 'Not yet', authorId: oid(), targetAudience: 'all', priority: 'normal',
    isPublished: false, isDeleted: false, readBy: [], createdAt: new Date(), updatedAt: new Date(),
  })).insertedId;

  it("a school admin's announcement is filed in their own school, whatever the body says", async () => {
    const mine = oid();
    const other = oid();
    const token = signTestToken({ role: 'school_admin', schoolId: mine, id: oid() });
    const res = await request(app).post('/api/announcements').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Sports day', content: 'Friday', schoolId: String(other), targetAudience: 'all', priority: 'medium' });
    expect(res.status).toBe(201);
    const saved = await Announcement.findById(res.body.data._id ?? res.body.data.id).lean();
    expect(String(saved?.schoolId)).toBe(String(mine));
  });

  it('a parent or learner cannot list all announcements, drafts included', async () => {
    const schoolId = oid();
    await draftIn(schoolId);
    for (const role of ['parent', 'student']) {
      const token = signTestToken({ role, schoolId, id: oid() });
      const res = await request(app).get('/api/announcements').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    }
  });

  it("a parent can't open a draft, and can't mark another school's announcement read", async () => {
    const schoolId = oid();
    const draft = await draftIn(schoolId);
    const parent = signTestToken({ role: 'parent', schoolId, id: oid() });
    expect((await request(app).get(`/api/announcements/${draft}`).set('Authorization', `Bearer ${parent}`)).status).toBe(404);
    const elsewhere = signTestToken({ role: 'parent', schoolId: oid(), id: oid() });
    expect((await request(app).patch(`/api/announcements/${draft}/mark-read`).set('Authorization', `Bearer ${elsewhere}`)).status).toBe(404);
  });
});
