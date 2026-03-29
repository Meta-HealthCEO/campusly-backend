import { AuditLog, AuditAction } from './model.js';
import { paginationHelper } from '../../common/utils.js';
import type { AuditQueryInput } from './validation.js';

export class AuditService {
  // ─── Log Action ─────────────────────────────────────────────────────────────

  static async logAction(data: {
    userId: string;
    schoolId?: string;
    action: AuditAction;
    entity: string;
    entityId?: string;
    changes?: { field: string; oldValue: unknown; newValue: unknown }[];
    ipAddress?: string;
    userAgent?: string;
  }) {
    return AuditLog.create(data);
  }

  // ─── List Audit Logs ────────────────────────────────────────────────────────

  static async listAuditLogs(query: AuditQueryInput) {
    const { skip, limit } = paginationHelper(query.page, query.limit);

    const filter: Record<string, unknown> = { isDeleted: false };

    if (query.userId) {
      filter.userId = query.userId;
    }
    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }
    if (query.entity) {
      filter.entity = query.entity;
    }
    if (query.action) {
      filter.action = query.action;
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

  // ─── Export Audit Logs ──────────────────────────────────────────────────────

  static async exportAuditLogs(query: AuditQueryInput) {
    const filter: Record<string, unknown> = { isDeleted: false };

    if (query.userId) {
      filter.userId = query.userId;
    }
    if (query.schoolId) {
      filter.schoolId = query.schoolId;
    }
    if (query.entity) {
      filter.entity = query.entity;
    }
    if (query.action) {
      filter.action = query.action;
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

    return AuditLog.find(filter)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .lean();
  }
}
