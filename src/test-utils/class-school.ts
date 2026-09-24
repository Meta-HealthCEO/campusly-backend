// Test fixture: a school with two classes, learners and parents linked from either side.
import mongoose from 'mongoose';
import { Class } from '../modules/Academic/model.js';
import { Student } from '../modules/Student/model.js';
import { Parent } from '../modules/Parent/model.js';
import { User } from '../modules/Auth/model.js';

const oid = () => new mongoose.Types.ObjectId();

/** 1A (Thandi): Lebo (parent P lists her) and Sipho (lists parent Q as guardian). 1B: Jan. */
export async function classSchool() {
  const schoolId = oid();
  const [thandi, gradeId] = [oid(), oid()];
  const [classA, classB] = [oid(), oid()];
  await Class.collection.insertMany([
    { _id: classA, schoolId, name: '1A', classroomCode: `c-${oid()}`, gradeId, teacherId: thandi, isDeleted: false },
    { _id: classB, schoolId, name: '1B', classroomCode: `c-${oid()}`, gradeId: oid(), teacherId: oid(), isDeleted: false },
  ]);
  const user = async (role: string, first: string) => {
    const id = oid();
    await User.collection.insertOne({ _id: id, schoolId, firstName: first, lastName: 'T', email: `${first}${id}@t.local`, role, isDeleted: false });
    return id;
  };
  const learner = async (first: string, classId: mongoose.Types.ObjectId, grade: mongoose.Types.ObjectId, guardianIds: mongoose.Types.ObjectId[] = []) => {
    const userId = await user('student', first);
    const id = oid();
    await Student.collection.insertOne({ _id: id, schoolId, userId, classId, gradeId: grade, guardianIds, admissionNumber: `A-${id}`, isDeleted: false });
    return { id, userId };
  };
  const lebo = await learner('Lebo', classA, gradeId);
  const qUser = await user('parent', 'Q');
  const qId = oid();
  await Parent.collection.insertOne({ _id: qId, schoolId, userId: qUser, childrenIds: [], isDeleted: false });
  const sipho = await learner('Sipho', classA, gradeId, [qId]);
  const jan = await learner('Jan', classB, oid());
  const pUser = await user('parent', 'P');
  await Parent.collection.insertOne({ _id: oid(), schoolId, userId: pUser, childrenIds: [lebo.id], isDeleted: false });
  const janParent = await user('parent', 'J');
  await Parent.collection.insertOne({ _id: oid(), schoolId, userId: janParent, childrenIds: [jan.id], isDeleted: false });
  await User.collection.insertOne({ _id: thandi, schoolId, firstName: 'Thandi', lastName: 'M', email: `th${oid()}@t.local`, role: 'teacher', isDeleted: false });
  return { schoolId, gradeId, classA, classB, thandi, lebo, sipho, jan, pUser, qUser, janParent };
}
