import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import { School } from '../../School/model.js';
import { User } from '../../Auth/model.js';
import { Department } from '../model.js';
import { AssessmentPaper } from '../../QuestionBank/model-papers.js';
import { PaperModeration } from '../../TeacherWorkbench/model.assessment.js';
import { signTestToken } from '../../../test-utils/auth.js';

let schoolId: mongoose.Types.ObjectId;
let deptId: mongoose.Types.ObjectId;
const hodId = new mongoose.Types.ObjectId();
const deptTeacherId = new mongoose.Types.ObjectId();
const otherTeacherId = new mongoose.Types.ObjectId();

async function pendingPaper(submittedBy: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId> {
  // A valid paper: approving finalises it with a full save (and its validation).
  const paper = await AssessmentPaper.create({
    schoolId, title: 'Term 3 test', subjectId: new mongoose.Types.ObjectId(), gradeId: new mongoose.Types.ObjectId(),
    topicIds: [new mongoose.Types.ObjectId()], term: 3, year: 2026, paperType: 'class_test', duration: 30, createdBy: submittedBy,
  });
  const insertedId = paper._id as mongoose.Types.ObjectId;
  await PaperModeration.create({ paperId: insertedId, schoolId, submittedBy, submittedAt: new Date(), status: 'pending' });
  return insertedId;
}

const hodToken = () => signTestToken({ role: 'teacher', id: hodId, schoolId, isHOD: true, departmentId: deptId, isStandaloneTeacher: false, isSchoolPrincipal: false });
const review = (paperId: mongoose.Types.ObjectId, body: Record<string, unknown>, token = hodToken()) =>
  request(app).post(`/api/departments/${deptId}/moderation/${paperId}/review`).set('Authorization', `Bearer ${token}`).send(body);

describe('POST /api/departments/:id/moderation/:paperId/review', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
    }
    const stamp = `${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const school = await School.create({
      name: `hod_review_${stamp}`, type: 'combined',
      address: { street: 'x', city: 'x', province: 'x', postalCode: '0000', country: 'ZA' },
      contactInfo: { email: `hod+${stamp}@test.local`, phone: '0' },
      settings: { academicYear: 2026, terms: 4, gradingSystem: 'percentage' },
      principal: 'P', joinCode: `H${Math.random().toString(36).slice(2, 7).toUpperCase()}`, isActive: true, modulesEnabled: ['academic'],
    });
    schoolId = school._id as mongoose.Types.ObjectId;
    deptId = (await Department.create({ schoolId, name: 'Foundation Phase', hodUserId: hodId }))._id as mongoose.Types.ObjectId;
    await User.collection.insertMany([
      { _id: deptTeacherId, schoolId, departmentId: deptId, role: 'teacher', email: `dt+${stamp}@t.local`, firstName: 'D', lastName: 'T', isActive: true, isDeleted: false },
      { _id: otherTeacherId, schoolId, departmentId: new mongoose.Types.ObjectId(), role: 'teacher', email: `ot+${stamp}@t.local`, firstName: 'O', lastName: 'T', isActive: true, isDeleted: false },
    ]);
  });

  afterAll(async () => {
    await Promise.all([
      PaperModeration.deleteMany({ schoolId }), AssessmentPaper.collection.deleteMany({ schoolId }),
      User.collection.deleteMany({ schoolId }), Department.deleteMany({ schoolId }), School.deleteMany({ _id: schoolId }),
    ]);
    await mongoose.connection.close();
  });

  it("lets an HOD approve a paper from their department's teacher", async () => {
    const paperId = await pendingPaper(deptTeacherId);
    const res = await review(paperId, { status: 'approved' });
    expect(res.status).toBe(200);
    expect((await PaperModeration.findOne({ paperId }).lean())?.status).toBe('approved');
  });

  it('lets an HOD request changes with a note', async () => {
    const paperId = await pendingPaper(deptTeacherId);
    const res = await review(paperId, { status: 'changes_requested', comments: 'Question 4 is above grade level.' });
    expect(res.status).toBe(200);
    expect((await PaperModeration.findOne({ paperId }).lean())?.comments).toBe('Question 4 is above grade level.');
  });

  it('refuses a change request without a real note', async () => {
    const paperId = await pendingPaper(deptTeacherId);
    expect((await review(paperId, { status: 'changes_requested', comments: '  ' })).status).toBe(400);
  });

  it("refuses a paper from another department's teacher", async () => {
    const paperId = await pendingPaper(otherTeacherId);
    expect((await review(paperId, { status: 'approved' })).status).toBe(403);
  });

  it('refuses a teacher who is not the HOD of this department', async () => {
    const paperId = await pendingPaper(deptTeacherId);
    const token = signTestToken({ role: 'teacher', id: deptTeacherId, schoolId, isHOD: false, departmentId: deptId, isStandaloneTeacher: false });
    expect((await review(paperId, { status: 'approved' }, token)).status).toBe(403);
  });
});
