// Test fixture: a school with two classes, learners and parents linked from either side.
import mongoose from 'mongoose';
import { Class } from '../modules/Academic/model.js';
import { Student } from '../modules/Student/model.js';
import { Parent } from '../modules/Parent/model.js';
import { User } from '../modules/Auth/model.js';

const oid = () => new mongoose.Types.ObjectId();

/**
 * 1A (Thandi): Lebo (parent P lists her), Sipho (lists parent Q as guardian),
 * Zola (parent R and Zola list each other — linked both ways) and Noah (no
 * parent at all). 1B: Jan. A second, unrelated school holds its own class,
 * learner and parent, for testing that nothing leaks across schools.
 */
export async function classSchool() {
  const schoolId = oid();
  const [thandi, gradeId] = [oid(), oid()];
  const [classA, classB] = [oid(), oid()];
  await Class.collection.insertMany([
    { _id: classA, schoolId, name: '1A', classroomCode: `c-${oid()}`, gradeId, teacherId: thandi, isDeleted: false },
    { _id: classB, schoolId, name: '1B', classroomCode: `c-${oid()}`, gradeId: oid(), teacherId: oid(), isDeleted: false },
  ]);
  const user = async (role: string, first: string, school: mongoose.Types.ObjectId = schoolId) => {
    const id = oid();
    await User.collection.insertOne({ _id: id, schoolId: school, firstName: first, lastName: 'T', email: `${first}${id}@t.local`, role, isDeleted: false, isActive: true });
    return id;
  };
  const learner = async (
    first: string,
    classId: mongoose.Types.ObjectId,
    grade: mongoose.Types.ObjectId,
    guardianIds: mongoose.Types.ObjectId[] = [],
    school: mongoose.Types.ObjectId = schoolId,
  ) => {
    const userId = await user('student', first, school);
    const id = oid();
    await Student.collection.insertOne({ _id: id, schoolId: school, userId, classId, gradeId: grade, guardianIds, admissionNumber: `A-${id}`, isDeleted: false });
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
  await User.collection.insertOne({ _id: thandi, schoolId, firstName: 'Thandi', lastName: 'M', email: `th${oid()}@t.local`, role: 'teacher', isDeleted: false, isActive: true });

  // Noah: no parent linked at all.
  const noah = await learner('Noah', classA, gradeId);

  // Zola and parent R: linked from both sides (parent lists the child, child lists the parent).
  const rId = oid();
  const zola = await learner('Zola', classA, gradeId, [rId]);
  const rUser = await user('parent', 'R');
  await Parent.collection.insertOne({ _id: rId, schoolId, userId: rUser, childrenIds: [zola.id], isDeleted: false });

  // A second, unrelated school: its own class, learner and parent.
  const schoolId2 = oid();
  const [thandi2, gradeId2] = [oid(), oid()];
  const classC = oid();
  await Class.collection.insertOne({ _id: classC, schoolId: schoolId2, name: '1A', classroomCode: `c-${oid()}`, gradeId: gradeId2, teacherId: thandi2, isDeleted: false });
  const otherLearner = await learner('Zane', classC, gradeId2, [], schoolId2);
  const otherParentUser = await user('parent', 'Z', schoolId2);
  await Parent.collection.insertOne({ _id: oid(), schoolId: schoolId2, userId: otherParentUser, childrenIds: [otherLearner.id], isDeleted: false });

  return {
    schoolId, gradeId, classA, classB, thandi, lebo, sipho, jan, pUser, qUser, janParent,
    noah, zola, rUser, schoolId2, otherLearner, otherParentUser,
  };
}
