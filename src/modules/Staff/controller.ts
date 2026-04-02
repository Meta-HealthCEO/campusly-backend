import crypto from 'crypto';
import { Request, Response } from 'express';
import { User } from '../Auth/model.js';
import { apiResponse, paginationHelper, escapeRegex } from '../../common/utils.js';
import { getPopulated } from '../../types/populated.js';

/** Extra fields stored on teacher User docs but not in the IUser interface */
interface StaffExtras {
  employeeNumber?: string;
  department?: string;
  subjects?: string[];
  qualifications?: string[];
}

export class StaffController {
  static async list(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search as string | undefined;

    const filter: Record<string, unknown> = {
      role: 'teacher',
      schoolId,
      isDeleted: { $ne: true },
    };

    if (search) {
      const regex = new RegExp(escapeRegex(search), 'i');
      filter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
    }

    const { skip, limit: sanitizedLimit } = paginationHelper(page, limit);

    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(sanitizedLimit).lean(),
      User.countDocuments(filter),
    ]);

    const staff = users.map((u) => {
      const extras = getPopulated<StaffExtras>(u);
      return {
        id: u._id,
        userId: u._id,
        user: {
          id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone ?? '',
          role: u.role,
          isActive: u.isActive,
          schoolId: u.schoolId,
        },
        employeeNumber: extras.employeeNumber ?? '',
        department: extras.department ?? '',
        subjects: extras.subjects ?? [],
        qualifications: extras.qualifications ?? [],
        hireDate: u.createdAt,
        classIds: [],
      };
    });

    res.json(
      apiResponse(
        true,
        { staff, total, page: page ?? 1, limit: sanitizedLimit },
        'Staff retrieved successfully',
      ),
    );
  }

  static async create(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }

    const { firstName, lastName, email, phone, department, subjects } = req.body as {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
      department?: string;
      subjects?: string | string[];
    };

    if (!firstName || !lastName || !email) {
      res
        .status(400)
        .json(apiResponse(false, undefined, undefined, 'firstName, lastName and email are required'));
      return;
    }

    const existing = await User.findOne({
      email: email.toLowerCase().trim(),
      isDeleted: { $ne: true },
    });
    if (existing) {
      res
        .status(409)
        .json(apiResponse(false, undefined, undefined, 'A user with this email already exists'));
      return;
    }

    const normalizedSubjects: string[] =
      typeof subjects === 'string'
        ? subjects
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(subjects)
        ? subjects
        : [];

    const userData: Record<string, unknown> = {
      firstName,
      lastName,
      email: email.toLowerCase().trim(),
      role: 'teacher',
      schoolId,
      password: crypto.randomBytes(16).toString('base64url'),
      department,
      subjects: normalizedSubjects,
    };
    if (phone) userData.phone = phone;

    const user = new User(userData as Parameters<typeof User.prototype.set>[0]);
    await user.save();

    const tempPassword = userData.password as string;
    const userObj = user.toObject() as unknown as Record<string, unknown>;
    delete userObj.password;
    delete userObj.refreshTokens;

    res.status(201).json(apiResponse(true, { ...userObj, tempPassword }, 'Staff member created successfully'));
  }
}
