import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { PapersService } from '../service-papers.js';
import { getPaperMemo } from '../service-papers-pdf-finalise.js';
import { PaperMemo } from '../../TeacherWorkbench/model.assessment.js';
import { AssessmentPaper } from '../model.js';
import { Department } from '../../Department/model.js';
import { User } from '../../Auth/model.js';
// Side-effect imports to register models referenced by populate().
import '../../Academic/model.js';

const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI ?? 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

async function fixture() {
  const schoolId = oid();
  const hodId = oid();
  const deptTeacherId = oid();
  const otherTeacherId = oid();
  const stamp = oid().toString().slice(-6);
  const dept = await Department.create({ schoolId, name: `Foundation ${stamp}`, hodUserId: hodId });
  await User.collection.insertMany([
    { _id: deptTeacherId, schoolId, departmentId: dept._id, role: 'teacher', email: `d${stamp}@t.local`, firstName: 'D', lastName: 'T', isActive: true, isDeleted: false },
    { _id: otherTeacherId, schoolId, departmentId: oid(), role: 'teacher', email: `o${stamp}@t.local`, firstName: 'O', lastName: 'T', isActive: true, isDeleted: false },
  ]);
  const paper = (createdBy: mongoose.Types.ObjectId) => AssessmentPaper.create({
    schoolId, title: `Term 3 test ${stamp}`, subjectId: oid(), gradeId: oid(), topicIds: [oid()], term: 3, year: 2026,
    paperType: 'class_test', duration: 30, totalMarks: 10, createdBy,
  });
  return {
    schoolId: String(schoolId), hodId: String(hodId), deptId: String(dept._id),
    deptPaper: String((await paper(deptTeacherId))._id), otherPaper: String((await paper(otherTeacherId))._id), deptTeacherId: String(deptTeacherId),
  };
}

describe('PapersService.getPaper for HODs', () => {
  it("lets an HOD open a paper written by a teacher in their department", async () => {
    const f = await fixture();
    const paper = await PapersService.getPaper(f.deptPaper, f.schoolId, f.hodId, 'teacher', { hodDepartmentId: f.deptId });
    expect(String(paper._id)).toBe(f.deptPaper);
  });

  it("refuses an HOD a paper from outside their department", async () => {
    const f = await fixture();
    await expect(PapersService.getPaper(f.otherPaper, f.schoolId, f.hodId, 'teacher', { hodDepartmentId: f.deptId }))
      .rejects.toThrow('You can only open papers from your department');
  });

  it('still hides other teachers\' papers from a plain teacher', async () => {
    const f = await fixture();
    await expect(PapersService.getPaper(f.deptPaper, f.schoolId, String(oid()), 'teacher')).rejects.toThrow('Assessment paper not found');
  });

  it("lets an HOD read the memo of a department paper, which moderation needs", async () => {
    const f = await fixture();
    await PaperMemo.create({ paperId: f.deptPaper, schoolId: f.schoolId, teacherId: f.deptTeacherId, sections: [], totalMarks: 10 });
    const memo = await getPaperMemo(f.deptPaper, f.schoolId, f.hodId, 'teacher', f.deptId);
    expect(memo).not.toBeNull();
    await expect(getPaperMemo(f.otherPaper, f.schoolId, f.hodId, 'teacher', f.deptId)).rejects.toThrow('You can only open papers from your department');
  });
});
