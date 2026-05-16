import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getUser } from '../../../types/authenticated-request.js';
import { User } from '../model.js';
import { School } from '../../School/model.js';
import { Parent } from '../../Parent/model.js';
import { Student } from '../../Student/model.js';

interface ChildSummary {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  classId: string | null;
  gradeId: string | null;
}

interface TeacherIdentity {
  id: string;
  departmentId: string | null;
  grades: string[];
  subjectsByGrade: Array<{ gradeId: string; subjectIds: string[] }>;
}

export async function getMobileContext(req: Request, res: Response): Promise<void> {
  // Errors propagate to the global errorHandler via Express 5's native async-handler support.
  const { id, schoolId: rawSchoolId } = getUser(req);

  if (!rawSchoolId) {
    res.status(403).json({ message: 'No school associated with this account' });
    return;
  }

  const schoolObjectId = new mongoose.Types.ObjectId(rawSchoolId);
  const userObjectId = new mongoose.Types.ObjectId(id);

  const [user, school, parentDoc, studentDoc, teacherDoc] = await Promise.all([
    User.findOne({ _id: userObjectId, schoolId: schoolObjectId, isDeleted: false })
      .select('email firstName lastName role profileImage phone')
      .lean(),
    School.findOne({ _id: schoolObjectId, isDeleted: false })
      .select('name logo settings')
      .lean(),
    Parent.findOne({ userId: userObjectId, schoolId: schoolObjectId, isDeleted: false })
      .select('childrenIds')
      .lean(),
    Student.findOne({ userId: userObjectId, schoolId: schoolObjectId, isDeleted: false })
      .select('classId gradeId')
      .lean(),
    User.findOne({ _id: userObjectId, schoolId: schoolObjectId, role: 'teacher', isDeleted: false })
      .select('teachingScope departmentId')
      .lean(),
  ]);

  if (!user || !school) {
    res.status(404).json({ message: 'User or school not found' });
    return;
  }

  // Resolve parent children: filter to only students belonging to this school,
  // then join with User records to get names. This is the multi-tenancy gate.
  let resolvedChildren: ChildSummary[] = [];
  if (parentDoc && parentDoc.childrenIds.length > 0) {
    const students = await Student.find({
      _id: { $in: parentDoc.childrenIds },
      schoolId: schoolObjectId,
      isDeleted: false,
    })
      .select('userId classId gradeId')
      .lean();

    if (students.length > 0) {
      const userIds = students
        .filter((s) => s.userId != null)
        .map((s) => s.userId as mongoose.Types.ObjectId);

      const childUsers = await User.find({
        _id: { $in: userIds },
        schoolId: schoolObjectId,
        isDeleted: false,
      })
        .select('firstName lastName profileImage')
        .lean();

      const userMap = new Map(
        childUsers.map((u) => [String(u._id), u]),
      );

      resolvedChildren = students.map((s) => {
        const cu = s.userId ? userMap.get(String(s.userId)) : undefined;
        return {
          id: String(s._id),
          firstName: cu?.firstName ?? '',
          lastName: cu?.lastName ?? '',
          profileImage: cu?.profileImage ?? null,
          classId: s.classId ? String(s.classId) : null,
          gradeId: s.gradeId ? String(s.gradeId) : null,
        };
      });
    }
  }

  res.json({
    user: {
      id: String(user._id),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      profileImage: user.profileImage ?? null,
      phone: user.phone ?? null,
    },
    school: {
      id: String(school._id),
      name: school.name,
      logo: school.logo ?? null,
      settings: {
        gradingSystem: school.settings?.gradingSystem ?? 'percentage',
        academicYear: school.settings?.academicYear ?? null,
        terms: school.settings?.terms ?? null,
        // TODO: replace with per-school currency setting when multi-currency support is added.
        // For v1 all customers are in South Africa so ZAR is the only valid value.
        currency: 'ZAR',
        // TODO: wire to school.subscription or a config when multi-gateway support lands; hardcoded for mobile MVP.
        paymentProviders: ['onegate'],
      },
    },
    parent: parentDoc
      ? {
          id: String(parentDoc._id),
          children: resolvedChildren,
        }
      : null,
    student: studentDoc
      ? {
          id: String(studentDoc._id),
          classId: studentDoc.classId ? String(studentDoc.classId) : null,
          gradeId: studentDoc.gradeId ? String(studentDoc.gradeId) : null,
        }
      : null,
    teacher: teacherDoc
      ? ((): TeacherIdentity => ({
          id: String(teacherDoc._id),
          departmentId: teacherDoc.departmentId ? String(teacherDoc.departmentId) : null,
          grades: (teacherDoc.teachingScope?.grades ?? []).map((g) => String(g)),
          subjectsByGrade: (teacherDoc.teachingScope?.subjectsByGrade ?? []).map((entry) => ({
            gradeId: String(entry.gradeId),
            subjectIds: entry.subjectIds.map((s) => String(s)),
          })),
        }))()
      : null,
  });
}
