import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { verifyParentOwnsStudent } from '../helpers.js';
import { Parent } from '../../Parent/model.js';
import { Student } from '../../Student/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

describe("a parent linked to a learner, from either side, can be messaged about them", () => {
  it("accepts a parent the learner lists as a guardian, even if the parent's record doesn't list the learner", async () => {
    const schoolId = oid();
    const [studentId, parentId, userId] = [oid(), oid(), oid()];
    await Parent.collection.insertOne({ _id: parentId, userId, schoolId, relationship: 'mother', childrenIds: [], isDeleted: false });
    await Student.collection.insertOne({ _id: studentId, schoolId, userId: oid(), admissionNumber: `A-${studentId}`, guardianIds: [parentId], isDeleted: false });
    await expect(verifyParentOwnsStudent(String(userId), String(studentId), String(schoolId))).resolves.toBeUndefined();
  });

  it('still refuses a parent linked neither way', async () => {
    const schoolId = oid();
    const [studentId, userId] = [oid(), oid()];
    await Parent.collection.insertOne({ _id: oid(), userId, schoolId, relationship: 'mother', childrenIds: [], isDeleted: false });
    await Student.collection.insertOne({ _id: studentId, schoolId, userId: oid(), admissionNumber: `A-${studentId}`, guardianIds: [], isDeleted: false });
    await expect(verifyParentOwnsStudent(String(userId), String(studentId), String(schoolId))).rejects.toThrow();
  });
});
