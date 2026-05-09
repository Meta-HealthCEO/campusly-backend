import mongoose from 'mongoose';
import { Homework, HomeworkSubmission } from './model.js';
import { NotFoundError } from '../../common/errors.js';

export async function getStudentDashboardCounts(
  studentId: string,
  schoolId: string,
): Promise<{ dueThisWeek: number; overdue: number; awaitingGrading: number }> {
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { Student } = await import('../Student/model.js');
  const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false }).lean();
  if (!student) throw new NotFoundError('Student not found');

  const homeworks = await Homework.find({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    classId: student.classId,
    isDeleted: false,
    status: 'assigned',
  }).select('_id dueDate').lean();
  const homeworkIds = homeworks.map((h) => h._id);

  const submissions = await HomeworkSubmission.find({
    studentId: new mongoose.Types.ObjectId(studentId),
    homeworkId: { $in: homeworkIds },
    isDeleted: false,
  }).select('homeworkId gradingStatus').lean();
  const submittedIds = new Set(submissions.map((s) => s.homeworkId.toString()));

  let dueThisWeek = 0;
  let overdue = 0;
  for (const hw of homeworks) {
    if (submittedIds.has(hw._id.toString())) continue;
    const due = new Date(hw.dueDate);
    if (due < now) overdue++;
    else if (due <= weekFromNow) dueThisWeek++;
  }
  const awaitingGrading = submissions.filter((s) => s.gradingStatus === 'pending').length;

  return { dueThisWeek, overdue, awaitingGrading };
}

export async function getParentDashboardCounts(
  parentId: string,
  schoolId: string,
): Promise<Array<{
  studentId: string;
  firstName: string;
  lastName: string;
  pending: number;
  overdue: number;
  awaitingGrading: number;
}>> {
  const { Parent } = await import('../Parent/model.js');
  const parent = await Parent.findOne({ _id: parentId, schoolId, isDeleted: false })
    .populate({
      path: 'childrenIds',
      populate: { path: 'userId', select: 'firstName lastName' },
    })
    .lean();
  if (!parent) throw new NotFoundError('Parent not found');

  const result: Array<{
    studentId: string;
    firstName: string;
    lastName: string;
    pending: number;
    overdue: number;
    awaitingGrading: number;
  }> = [];

  const children = parent.childrenIds as unknown as Array<{
    _id: mongoose.Types.ObjectId;
    userId?: { firstName: string; lastName: string };
  }>;

  for (const child of children) {
    const counts = await getStudentDashboardCounts(child._id.toString(), schoolId);
    result.push({
      studentId: child._id.toString(),
      firstName: child.userId?.firstName ?? '',
      lastName: child.userId?.lastName ?? '',
      pending: counts.dueThisWeek,
      overdue: counts.overdue,
      awaitingGrading: counts.awaitingGrading,
    });
  }
  return result;
}
