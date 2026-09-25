import { Student, IStudent } from './model.js';
import { Parent } from '../Parent/model.js';
import { User, type IUser } from '../Auth/model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { escapeRegex } from '../../common/utils.js';
import { classRosterFilter } from '../../common/class-roster.js';
import { enrolOnJoin } from '../Course/enrolment.js';
import { EmailService } from '../../services/email.service.js';
import { regenerateCredentials } from './service-regenerate.js';
import crypto from 'crypto';
import mongoose, { type Types } from 'mongoose';

export type StudentDeliveryMethod = 'email' | 'slip';

type ObjectIdInput = string | Types.ObjectId;
type StudentIdFields = {
  schoolId?: ObjectIdInput;
  gradeId?: ObjectIdInput;
  classId?: ObjectIdInput;
  userId?: ObjectIdInput;
  guardianIds?: ObjectIdInput[];
};
type CreateStudentData = Omit<Partial<IStudent>, keyof StudentIdFields> & StudentIdFields & {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  deliveryMethod?: StudentDeliveryMethod;
};

type UpdateStudentData = Partial<IStudent> & {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
};

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

export interface StudentPortalCredentials {
  loginEmail: string;
  tempPassword: string;
  emailSent: boolean;
  emailError?: string;
}

export interface CreateStudentResult {
  student: IStudent;
  credentials?: StudentPortalCredentials;
}

/**
 * Generates a sequential admission number scoped per school. Format: S00001.
 * Walks past collisions (e.g. when school already has S00042 imported manually,
 * the next auto-assignment skips to S00043).
 */
async function nextAdmissionNumber(schoolId: string | { toString(): string }): Promise<string> {
  const sid = String(schoolId);
  const count = await Student.countDocuments({ schoolId: sid, isDeleted: false });
  let next = count + 1;
  // Defensive collision walk - handles deleted-rows-not-counted case + manual entries
  for (let i = 0; i < 1000; i += 1) {
    const candidate = `S${String(next).padStart(5, '0')}`;
    const exists = await Student.exists({ schoolId: sid, admissionNumber: candidate });
    if (!exists) return candidate;
    next += 1;
  }
  // Fallback to a UUID-derived suffix if we somehow can't find a free slot
  return `S-${crypto.randomUUID().slice(0, 8)}`;
}

function sanitiseForSyntheticEmail(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

const SYNTHETIC_STUDENT_EMAIL_DOMAIN = 'students.campusly.local';

function buildSyntheticLoginLocalPart(firstName: string, lastName: string, admissionNumber: string): string {
  const first = sanitiseForSyntheticEmail(firstName);
  const last = sanitiseForSyntheticEmail(lastName);
  const base = [first, last].filter(Boolean).join('.');
  return base ? `${base}.${admissionNumber.toLowerCase()}` : admissionNumber.toLowerCase();
}

function syntheticLoginCandidate(baseLocalPart: string, attempt: number): string {
  if (attempt === 0) return baseLocalPart;

  const admissionWithPrefix = /^s(\d+)$/i.exec(baseLocalPart);
  if (admissionWithPrefix) {
    const digits = admissionWithPrefix[1];
    const next = Number.parseInt(digits, 10) + attempt;
    return `s${String(next).padStart(digits.length, '0')}`;
  }

  const admissionOnly = /^(\d+)$/.exec(baseLocalPart);
  if (admissionOnly) {
    const digits = admissionOnly[1];
    const next = Number.parseInt(digits, 10) + attempt;
    return String(next).padStart(digits.length, '0');
  }

  return `${baseLocalPart}.${attempt + 1}`;
}

async function buildUniqueSyntheticLoginEmail(
  firstName: string,
  lastName: string,
  admissionNumber: string,
): Promise<string> {
  const baseLocalPart = buildSyntheticLoginLocalPart(firstName, lastName, admissionNumber);

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const localPart = syntheticLoginCandidate(baseLocalPart, attempt);
    const email = `${localPart}@${SYNTHETIC_STUDENT_EMAIL_DOMAIN}`;
    const existingUser = await User.exists({ email });
    if (!existingUser) return email;
  }

  const fallback = `${baseLocalPart}.${crypto.randomUUID().slice(0, 8)}`;
  return `${fallback}@${SYNTHETIC_STUDENT_EMAIL_DOMAIN}`;
}

function generateTempPassword(): string {
  return `Campus-${crypto.randomBytes(3).toString('hex')}`;
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 11000;
}

/** Refuses guardian ids that aren't (undeleted) parents in this school, before anything is written. */
async function assertGuardiansInSchool(schoolId: ObjectIdInput | undefined, guardianIds: ObjectIdInput[] | undefined): Promise<void> {
  if (!guardianIds || guardianIds.length === 0) return;
  const ids = [...new Set(guardianIds.map(String))];
  const found = schoolId && ids.every((id) => mongoose.Types.ObjectId.isValid(id))
    ? await Parent.countDocuments({ _id: { $in: ids }, schoolId, isDeleted: false })
    : 0;
  if (found !== ids.length) throw new BadRequestError('Pick guardians who are parents at this school');
}

/** Keeps Parent.childrenIds in step with a learner's guardianIds after it changes. */
async function syncGuardianLinks(
  schoolId: ObjectIdInput,
  studentId: ObjectIdInput,
  previousGuardianIds: ObjectIdInput[],
  nextGuardianIds: ObjectIdInput[],
): Promise<void> {
  const previous = new Set(previousGuardianIds.map(String));
  const next = new Set(nextGuardianIds.map(String));
  const added = [...next].filter((id) => !previous.has(id));
  const removed = [...previous].filter((id) => !next.has(id));

  await Promise.all([
    added.length > 0
      ? Parent.updateMany({ _id: { $in: added }, schoolId, isDeleted: false }, { $addToSet: { childrenIds: studentId } })
      : null,
    removed.length > 0
      ? Parent.updateMany({ _id: { $in: removed }, schoolId, isDeleted: false }, { $pull: { childrenIds: studentId } })
      : null,
  ]);
}

export class StudentService {
  static regenerateCredentials = regenerateCredentials;

  static async create(data: CreateStudentData): Promise<CreateStudentResult> {
    const { firstName, lastName, email, phone, deliveryMethod, ...studentData } = data;
    let credentials: StudentPortalCredentials | undefined;
    await assertGuardiansInSchool(studentData.schoolId, studentData.guardianIds);

    // Auto-generate an admission number if the caller didn't supply one.
    // Standalone tutoring teachers don't run admission numbering systems and
    // shouldn't have to invent one to add a learner.
    if (!studentData.admissionNumber?.trim() && studentData.schoolId) {
      studentData.admissionNumber = await nextAdmissionNumber(studentData.schoolId);
    }

    if (!studentData.userId && firstName && lastName && studentData.schoolId) {
      const admission = studentData.admissionNumber ?? crypto.randomUUID();
      // Branch on deliveryMethod. 'email' requires a real email + sends via
      // Resend; 'slip' builds a synthetic @students.campusly.local login and
      // skips email send.
      let loginEmail: string;
      let isSyntheticEmail = false;
      const selectedDeliveryMethod: StudentDeliveryMethod =
        deliveryMethod ?? (email?.trim() ? 'email' : 'slip');
      if (selectedDeliveryMethod === 'email') {
        if (!email || !email.trim()) {
          throw new BadRequestError('email is required when deliveryMethod is "email"');
        }
        loginEmail = email.trim().toLowerCase();
      } else {
        loginEmail = await buildUniqueSyntheticLoginEmail(firstName, lastName, admission);
        isSyntheticEmail = true;
      }

      const tempPassword = generateTempPassword();
      let user: IUser | null = null;
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          user = await User.create({
            email: loginEmail,
            password: tempPassword,
            firstName,
            lastName,
            phone,
            role: 'student',
            schoolId: studentData.schoolId,
            isActive: true,
            mustChangePassword: true,
          });
          break;
        } catch (err: unknown) {
          if (!isSyntheticEmail || !isDuplicateKeyError(err)) {
            throw err;
          }
          loginEmail = await buildUniqueSyntheticLoginEmail(firstName, lastName, admission);
        }
      }
      if (!user) {
        throw new BadRequestError('Unable to create a unique student login email');
      }
      studentData.userId = user._id as IStudent['userId'];

      let emailSent = false;
      let emailError: string | undefined;
      if (!isSyntheticEmail) {
        try {
          const result = await EmailService.sendStudentPortalCredentials(loginEmail, {
            studentName: `${firstName} ${lastName}`.trim(),
            loginEmail,
            tempPassword,
          });
          emailSent = result.success;
          if (!result.success) {
            emailError = 'Email provider reported failure';
          }
        } catch (err: unknown) {
          emailSent = false;
          emailError = err instanceof Error ? err.message : 'Unknown email error';
        }
      }

      credentials = {
        loginEmail,
        tempPassword,
        emailSent,
        ...(emailError ? { emailError } : {}),
      };
    }

    const student = new Student(studentData);
    const saved = await student.save();
    await enrolOnJoin(saved._id as Types.ObjectId, saved.classId, saved.schoolId);

    if (studentData.guardianIds && studentData.guardianIds.length > 0) {
      await syncGuardianLinks(saved.schoolId, saved._id as IStudent['_id'], [], studentData.guardianIds);
    }

    return {
      student: saved,
      credentials,
    };
  }

  static async list(
    schoolId: string,
    query: ListQuery,
    filters?: { classIds?: Array<string | Types.ObjectId> },
  ): Promise<{
    students: IStudent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
    const limit = Math.min(
      Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
      PAGINATION_DEFAULTS.maxLimit,
    );
    const skip = (page - 1) * limit;
    const sortField = query.sort ?? '-createdAt';

    const filter: Record<string, unknown> = {
      schoolId,
      isDeleted: false,
    };

    let roster: Record<string, unknown> = filter;
    if (filters?.classIds) {
      if (filters.classIds.length === 0) {
        return { students: [], total: 0, page, limit, totalPages: 0 };
      }
      // A group's roster includes learners who joined it as a second group (spec §3).
      roster = classRosterFilter(filters.classIds, filter);
    }

    if (query.search) {
      const searchRegex = new RegExp(escapeRegex(query.search), 'i');
      roster = { ...roster, $or: [{ admissionNumber: searchRegex }] };
    }

    let baseQuery = Student.find(roster)
      .populate('userId', 'firstName lastName email')
      .populate('gradeId')
      .populate('classId')
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .lean();

    const [students, total] = await Promise.all([
      baseQuery.exec(),
      Student.countDocuments(roster),
    ]);

    return {
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lightweight school-wide search for the teacher's "Assign Existing" flow.
   * Returns the minimum identifying fields plus current class name so a
   * teacher can pick a student who isn't yet in any of their classes without
   * exposing medical/contact data.
   */
  static async searchSchoolRoster(
    schoolId: string,
    q: string,
    limit = 20,
  ): Promise<Array<{
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    classId: string | null;
    className: string | null;
  }>> {
    const trimmed = (q ?? '').trim();
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (trimmed) {
      filter.admissionNumber = new RegExp(escapeRegex(trimmed), 'i');
    }
    const rows = await Student.find(filter)
      .select('admissionNumber userId classId')
      .populate('userId', 'firstName lastName')
      .populate('classId', 'name')
      .limit(Math.min(Math.max(limit, 1), 50))
      .lean();

    type PopulatedRow = {
      _id: Types.ObjectId;
      admissionNumber?: string;
      userId?: { firstName?: string; lastName?: string } | null;
      classId?: { _id?: Types.ObjectId; name?: string } | null;
    };

    let results = (rows as unknown as PopulatedRow[]).map((r) => ({
      id: String(r._id),
      firstName: r.userId?.firstName ?? '',
      lastName: r.userId?.lastName ?? '',
      admissionNumber: r.admissionNumber ?? '',
      classId: r.classId?._id ? String(r.classId._id) : null,
      className: r.classId?.name ?? null,
    }));

    // Name search post-populate (Mongo can't regex across a populated field).
    if (trimmed) {
      const re = new RegExp(escapeRegex(trimmed), 'i');
      results = results.filter((r) =>
        re.test(r.firstName) || re.test(r.lastName) || re.test(r.admissionNumber),
      );
    }
    return results;
  }

  static async getById(id: string, schoolId: string): Promise<IStudent> {
    const student = await Student.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('userId', 'firstName lastName email phone profileImage')
      .populate('gradeId')
      .populate('classId')
      .populate({
        path: 'guardianIds',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .lean();

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    return student;
  }

  static async update(id: string, schoolId: string, data: UpdateStudentData): Promise<IStudent> {
    const { firstName, lastName, email, phone, ...studentData } = data;

    // Guardians are being changed: remember who they were before, to diff against after.
    const previous = studentData.guardianIds
      ? await Student.findOne({ _id: id, schoolId, isDeleted: false }).select('guardianIds').lean()
      : null;
    // Only newly named guardians are checked, so a guardian who has since left
    // doesn't block every other edit to the learner.
    const kept = new Set((previous?.guardianIds ?? []).map(String));
    await assertGuardiansInSchool(schoolId, studentData.guardianIds?.filter((g) => !kept.has(String(g))));

    // Update the student document (excluding User-record fields). When the group
    // changes, load the old one; moving into a group the learner had joined as a
    // second group removes it from subjectClassIds (never listed twice).
    const before = studentData.classId
      ? await Student.findOne({ _id: id, schoolId, isDeleted: false }).select('classId').lean()
      : null;
    const newClassId = studentData.classId ? new mongoose.Types.ObjectId(String(studentData.classId)) : null;
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      newClassId ? { $set: studentData, $pull: { subjectClassIds: newClassId } } : { $set: studentData },
      { new: true, runValidators: true },
    );
    if (!student) {
      throw new NotFoundError('Student not found');
    }
    if (newClassId && String(before?.classId) !== String(newClassId)) {
      await enrolOnJoin(student._id as Types.ObjectId, newClassId, schoolId);
    }

    if (studentData.guardianIds) {
      await syncGuardianLinks(schoolId, student._id as IStudent['_id'], previous?.guardianIds ?? [], studentData.guardianIds);
    }

    // Write name/email/phone through to the linked User record
    if (student.userId && (firstName || lastName || email || phone !== undefined)) {
      const userUpdate: Record<string, unknown> = {};
      if (firstName) userUpdate.firstName = firstName;
      if (lastName) userUpdate.lastName = lastName;
      if (email) userUpdate.email = email.toLowerCase();
      if (phone !== undefined) userUpdate.phone = phone;
      if (Object.keys(userUpdate).length > 0) {
        await User.findOneAndUpdate(
          { _id: student.userId, isDeleted: false },
          { $set: userUpdate },
        );
      }
    }

    // Return fully populated student
    const populated = await Student.findById(student._id)
      .populate('userId', 'firstName lastName email phone')
      .populate('gradeId')
      .populate('classId');

    return populated as IStudent;
  }

  static async delete(id: string, schoolId: string): Promise<IStudent> {
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    if (student.userId) {
      await User.findOneAndUpdate(
        { _id: student.userId, schoolId, role: 'student', isDeleted: false },
        { $set: { isActive: false, refreshTokens: [] } },
      );
    }

    return student;
  }

  static async getByUserId(userId: string, schoolId?: string): Promise<IStudent> {
    const filter: Record<string, unknown> = { userId, isDeleted: false };
    if (schoolId) filter.schoolId = schoolId;

    const student = await Student.findOne(filter)
      .populate('userId', 'firstName lastName email phone profileImage')
      .populate('gradeId')
      .populate('classId')
      .populate({
        path: 'guardianIds',
        populate: { path: 'userId', select: 'firstName lastName email phone' },
      })
      .lean();

    if (!student) {
      throw new NotFoundError('Student not found');
    }

    return student;
  }
}
