import mongoose from 'mongoose';
import { Discipline, type IDiscipline } from './model.js';
import { Student } from '../Student/model.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { GradeService } from '../Academic/services/grade.service.js';
import type { AuthenticatedUser } from '../../types/authenticated-request.js';

interface WelfareUser extends AuthenticatedUser {
  isCounselor?: boolean;
  isSchoolPrincipal?: boolean;
}

const DISCIPLINE_STUDENT_POPULATE = {
  path: 'studentId',
  select: 'admissionNumber userId gradeId classId',
  populate: [
    { path: 'userId', select: 'firstName lastName email' },
    { path: 'gradeId', select: 'name level' },
    { path: 'classId', select: 'name' },
  ],
};

function hasSchoolWideAccess(user: WelfareUser): boolean {
  return (
    user.role === 'super_admin' ||
    user.role === 'school_admin' ||
    (user.role === 'teacher' && !!user.isCounselor) ||
    (user.role === 'teacher' && !!user.isSchoolPrincipal)
  );
}

async function getStudentOrThrow(studentId: unknown, schoolId: string) {
  if (!studentId) throw new BadRequestError('Student is required');
  const studentOid = new mongoose.Types.ObjectId(String(studentId));
  const student = await Student.findOne({
    _id: studentOid,
    schoolId,
    isDeleted: false,
  })
    .select('_id classId')
    .lean();
  if (!student) throw new BadRequestError('Student does not belong to this school');
  return student;
}

async function assertCanAccessStudent(
  user: WelfareUser,
  studentId: unknown,
  schoolId: string,
): Promise<void> {
  const student = await getStudentOrThrow(studentId, schoolId);
  if (hasSchoolWideAccess(user)) return;

  if (user.role === 'teacher') {
    const canAccess = await GradeService.teacherCanAccessClass(
      user.id,
      String(student.classId),
      schoolId,
    );
    if (canAccess) return;
  }

  throw new ForbiddenError('You can only manage discipline records for learners in your classes');
}

async function getTeacherStudentIds(user: WelfareUser, schoolId: string): Promise<string[]> {
  const load = await GradeService.getTeacherTeachingLoad(user.id, schoolId);
  const ids = new Set<string>();
  const collect = (student: { _id?: unknown; id?: unknown }) => {
    const id = student.id ?? student._id;
    if (id) ids.add(String(id));
  };

  load.homeroom?.students.forEach(collect);
  load.subjectClasses.forEach((entry) => entry.students.forEach(collect));
  return Array.from(ids);
}

export class DisciplineService {
  static async createDiscipline(data: Partial<IDiscipline>, user: WelfareUser) {
    const schoolId = user.schoolId!;
    await assertCanAccessStudent(user, data.studentId, schoolId);

    const discipline = new Discipline({
      ...data,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      reportedBy: new mongoose.Types.ObjectId(user.id),
    });
    return discipline.save();
  }

  static async listDiscipline(
    user: WelfareUser,
    filters: { studentId?: string; status?: string; type?: string },
    page = 1,
    limit = 20,
  ) {
    const schoolId = user.schoolId!;
    const sanitizedPage = Math.max(1, page);
    const sanitizedLimit = Math.min(Math.max(1, limit), PAGINATION_DEFAULTS.maxLimit);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.studentId) filter.studentId = filters.studentId;
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;

    if (user.role === 'teacher' && !hasSchoolWideAccess(user)) {
      const accessibleStudentIds = await getTeacherStudentIds(user, schoolId);
      if (filters.studentId && !accessibleStudentIds.includes(filters.studentId)) {
        throw new ForbiddenError('You can only view discipline records for learners in your classes');
      }
      if (!filters.studentId) {
        filter.studentId = { $in: accessibleStudentIds.map((id) => new mongoose.Types.ObjectId(id)) };
      }
    }

    const [data, total] = await Promise.all([
      Discipline.find(filter)
        .populate(DISCIPLINE_STUDENT_POPULATE)
        .populate('reportedBy', 'firstName lastName email')
        .sort('-createdAt')
        .skip(skip)
        .limit(sanitizedLimit)
        .lean(),
      Discipline.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: sanitizedPage,
      limit: sanitizedLimit,
      totalPages: Math.ceil(total / sanitizedLimit),
    };
  }

  static async getDisciplineById(id: string, user: WelfareUser) {
    const schoolId = user.schoolId!;
    const record = await Discipline.findOne({ _id: id, schoolId, isDeleted: false }).lean();
    if (!record) throw new NotFoundError('Discipline record not found');
    await assertCanAccessStudent(user, record.studentId, schoolId);

    return Discipline.findOne({ _id: id, schoolId, isDeleted: false })
      .populate(DISCIPLINE_STUDENT_POPULATE)
      .populate('reportedBy', 'firstName lastName email')
      .lean();
  }

  static async updateDiscipline(id: string, user: WelfareUser, data: Partial<IDiscipline>) {
    const schoolId = user.schoolId!;
    const existing = await Discipline.findOne({ _id: id, schoolId, isDeleted: false }).lean();
    if (!existing) throw new NotFoundError('Discipline record not found');
    await assertCanAccessStudent(user, existing.studentId, schoolId);

    const patch = { ...data } as Record<string, unknown>;
    delete patch.schoolId;
    delete patch.reportedBy;
    delete patch.studentId;

    const record = await Discipline.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: patch },
      { new: true, runValidators: true },
    )
      .populate(DISCIPLINE_STUDENT_POPULATE)
      .populate('reportedBy', 'firstName lastName email');
    if (!record) throw new NotFoundError('Discipline record not found');
    return record;
  }

  static async deleteDiscipline(id: string, user: WelfareUser) {
    const schoolId = user.schoolId!;
    const record = await Discipline.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!record) throw new NotFoundError('Discipline record not found');
    return record;
  }
}
