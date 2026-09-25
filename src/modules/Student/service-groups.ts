// src/modules/Student/service-groups.ts
//
// "Remove from this group" (spec §3, rulings R8/R9): a group the learner
// joined is dropped from subjectClassIds; leaving their own group promotes
// their next group; a learner in no other group is deleted as before.
import mongoose from 'mongoose';
import { Student } from './model.js';
import { Class } from '../Academic/model.js';
import { NotFoundError } from '../../common/errors.js';
import { isInClass, learnerClassIds } from '../../common/class-roster.js';
import { StudentService } from './service.js';

export async function removeFromGroup(studentId: string, schoolId: string, classId: string): Promise<{ removed: 'group' | 'learner' }> {
  const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false }).select('classId subjectClassIds').lean();
  if (!student) throw new NotFoundError('Student not found');
  if (!isInClass(student, classId)) throw new NotFoundError('This learner is not in that group');

  const others = learnerClassIds(student).filter((id) => String(id) !== String(classId));
  if (others.length === 0) {
    await StudentService.delete(studentId, schoolId);
    return { removed: 'learner' };
  }
  const leaving = new mongoose.Types.ObjectId(classId);
  if (String(student.classId) !== classId) {
    await Student.updateOne({ _id: student._id, schoolId }, { $pull: { subjectClassIds: leaving } });
    return { removed: 'group' };
  }
  const next = others[0];
  const nextClass = await Class.findOne({ _id: next, schoolId, isDeleted: false }).select('gradeId').lean();
  await Student.updateOne(
    { _id: student._id, schoolId },
    { $set: { classId: next, ...(nextClass ? { gradeId: nextClass.gradeId } : {}) }, $pull: { subjectClassIds: next } },
  );
  return { removed: 'group' };
}
