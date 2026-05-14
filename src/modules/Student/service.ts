import { Student, IStudent } from './model.js';
import { User } from '../Auth/model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { escapeRegex } from '../../common/utils.js';
import { EmailService } from '../../services/email.service.js';
import crypto from 'crypto';

type CreateStudentData = Partial<IStudent> & {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
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

function fallbackStudentEmail(
  admissionNumber: string | { toString(): string },
  schoolId: string | { toString(): string },
): string {
  const admission = String(admissionNumber)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || crypto.randomUUID().slice(0, 8);
  const school = String(schoolId)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(-8);

  return `${admission}.${school}@students.campusly.local`;
}

function generateTempPassword(): string {
  return `Campus-${crypto.randomBytes(3).toString('hex')}`;
}

function shouldEmailCredentials(email: string | undefined, fallbackEmail: string): email is string {
  return typeof email === 'string' &&
    email.trim().length > 0 &&
    email.toLowerCase() !== fallbackEmail.toLowerCase();
}

export class StudentService {
  static async create(data: CreateStudentData): Promise<CreateStudentResult> {
    const { firstName, lastName, email, phone, ...studentData } = data;
    let credentials: StudentPortalCredentials | undefined;

    // Auto-generate an admission number if the caller didn't supply one.
    // Standalone tutoring teachers don't run admission numbering systems and
    // shouldn't have to invent one to add a learner.
    if (!studentData.admissionNumber?.trim() && studentData.schoolId) {
      studentData.admissionNumber = await nextAdmissionNumber(studentData.schoolId);
    }

    if (!studentData.userId && firstName && lastName && studentData.schoolId) {
      const admission = studentData.admissionNumber ?? crypto.randomUUID();
      const fallbackEmail = fallbackStudentEmail(admission, studentData.schoolId);
      const tempPassword = generateTempPassword();
      const loginEmail = (email ?? fallbackEmail).toLowerCase();
      const user = await User.create({
        email: loginEmail,
        password: tempPassword,
        firstName,
        lastName,
        phone,
        role: 'student',
        schoolId: studentData.schoolId,
        isActive: true,
      });
      studentData.userId = user._id as IStudent['userId'];

      let emailSent = false;
      // Phase 2: WhatsApp delivery (per-school WhatsApp credentials,
      // phone capture, template approval). Removed from Phase 1.
      if (shouldEmailCredentials(email, fallbackEmail)) {
        try {
          const result = await EmailService.sendStudentPortalCredentials(loginEmail, {
            studentName: `${firstName} ${lastName}`.trim(),
            loginEmail,
            tempPassword,
          });
          emailSent = result.success;
        } catch {
          emailSent = false;
        }
      }

      credentials = {
        loginEmail,
        tempPassword,
        emailSent,
      };
    }

    const student = new Student(studentData);
    return {
      student: await student.save(),
      credentials,
    };
  }

  static async list(
    schoolId: string,
    query: ListQuery,
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

    if (query.search) {
      const searchRegex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ admissionNumber: searchRegex }];
    }

    let baseQuery = Student.find(filter)
      .populate('userId', 'firstName lastName email')
      .populate('gradeId')
      .populate('classId')
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .lean();

    const [students, total] = await Promise.all([
      baseQuery.exec(),
      Student.countDocuments(filter),
    ]);

    return {
      students,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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

    // Update the student document (excluding User-record fields)
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: studentData },
      { new: true, runValidators: true },
    );

    if (!student) {
      throw new NotFoundError('Student not found');
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

  static async updateMedicalProfile(
    id: string,
    schoolId: string,
    data: IStudent['medicalProfile'],
  ): Promise<IStudent> {
    const student = await Student.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { medicalProfile: data } },
      { new: true, runValidators: true },
    );

    if (!student) {
      throw new NotFoundError('Student not found');
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
