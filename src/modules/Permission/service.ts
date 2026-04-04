import { User } from '../Auth/model.js';
import { AuditLog } from '../Audit/model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper, escapeRegex } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type {
  ListPermissionsInput,
  UpdatePermissionsInput,
  PermissionAuditQueryInput,
} from './validation.js';

const PERMISSION_FLAGS = [
  'isSchoolPrincipal',
  'isHOD',
  'isBursar',
  'isReceptionist',
  'isCounselor',
] as const;

export class PermissionService {
  // ─── List By School ────────────────────────────────────────────────────────

  static async listBySchool(schoolId: string, query: ListPermissionsInput) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.role) {
      filter.role = query.role;
    }

    if (query.flag && PERMISSION_FLAGS.includes(query.flag as typeof PERMISSION_FLAGS[number])) {
      filter[query.flag] = true;
    }

    if (query.search) {
      const escaped = escapeRegex(query.search);
      filter.$or = [
        { firstName: { $regex: escaped, $options: 'i' } },
        { lastName: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName email role isSchoolPrincipal isHOD departmentId isBursar isReceptionist isCounselor')
        .populate('departmentId', 'name')
        .sort({ lastName: 1, firstName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return { users, total, page: query.page ?? 1, limit };
  }

  // ─── Get By User ──────────────────────────────────────────────────────────

  static async getByUser(userId: string, schoolId: string) {
    const user = await User.findOne({ _id: userId, schoolId, isDeleted: false })
      .select('firstName lastName email role isSchoolPrincipal isHOD departmentId isBursar isReceptionist isCounselor')
      .populate('departmentId', 'name')
      .lean();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  // ─── Update Permissions ────────────────────────────────────────────────────

  static async updatePermissions(
    userId: string,
    schoolId: string,
    data: UpdatePermissionsInput,
    performedBy: string,
  ) {
    const user = await User.findOne({ _id: userId, schoolId, isDeleted: false });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate: HOD must have departmentId
    if (data.isHOD === true && !data.departmentId && !user.departmentId) {
      throw new BadRequestError('departmentId is required when setting isHOD to true');
    }

    // Clear departmentId when unsetting HOD
    if (data.isHOD === false) {
      data.departmentId = null;
    }

    // Build changes array for audit log
    const changes: { field: string; oldValue: unknown; newValue: unknown }[] = [];

    for (const flag of PERMISSION_FLAGS) {
      if (data[flag] !== undefined && data[flag] !== user[flag]) {
        changes.push({ field: flag, oldValue: user[flag], newValue: data[flag] });
      }
    }

    if (data.departmentId !== undefined) {
      const oldDept = user.departmentId?.toString() ?? null;
      if (data.departmentId !== oldDept) {
        changes.push({ field: 'departmentId', oldValue: oldDept, newValue: data.departmentId });
      }
    }

    if (changes.length === 0) {
      return user;
    }

    // Apply updates
    const updateFields: Record<string, unknown> = {};
    for (const flag of PERMISSION_FLAGS) {
      if (data[flag] !== undefined) {
        updateFields[flag] = data[flag];
      }
    }
    if (data.departmentId !== undefined) {
      updateFields.departmentId = data.departmentId;
    }

    const updated = await User.findOneAndUpdate(
      { _id: userId, schoolId, isDeleted: false },
      { $set: updateFields },
      { new: true },
    )
      .select('firstName lastName email role isSchoolPrincipal isHOD departmentId isBursar isReceptionist isCounselor')
      .populate('departmentId', 'name')
      .lean();

    // Create audit log
    await AuditLog.create({
      userId: performedBy,
      schoolId,
      action: 'update',
      entity: 'UserPermission',
      entityId: userId,
      changes,
    }).catch((err: unknown) => {
      logger.error({ err, userId, schoolId }, 'Failed to create permission audit log');
    });

    return updated;
  }

  // ─── Audit Logs ────────────────────────────────────────────────────────────

  static async getAuditLogs(schoolId: string, query: PermissionAuditQueryInput) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = {
      schoolId,
      entity: 'UserPermission',
      isDeleted: false,
    };

    if (query.userId) {
      filter.entityId = query.userId;
    }

    if (query.startDate || query.endDate) {
      const createdAt: Record<string, Date> = {};
      if (query.startDate) {
        createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        createdAt.$lte = new Date(query.endDate);
      }
      filter.createdAt = createdAt;
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return { logs, total, page: query.page ?? 1, limit };
  }
}
