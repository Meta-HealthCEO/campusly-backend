import { LeaveBalance } from './model.js';
import { User } from '../Auth/model.js';
import { NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import { LeaveService } from './service.js';
import type { LeaveBalanceInitInput } from './validation.js';

export class LeaveBalanceService {
  // ─── Get Balances ─────────────────────────────────────────────────────────

  static async getBalances(schoolId: string, query: { staffId?: string; year?: number }) {
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.staffId) filter.staffId = query.staffId;
    if (query.year) filter.year = query.year;

    const balances = await LeaveBalance.find(filter)
      .populate('staffId', 'firstName lastName email')
      .sort({ year: -1 })
      .lean();

    return balances;
  }

  // ─── Initialize Balances ──────────────────────────────────────────────────

  static async initializeBalances(schoolId: string, data: LeaveBalanceInitInput) {
    const policy = await LeaveService.getPolicy(schoolId);
    if (!policy) throw new NotFoundError('Leave policy not found');

    const activeTypes = policy.leaveTypes.filter((lt) => lt.isActive);
    const balanceEntries = activeTypes.map((lt) => ({
      leaveType: lt.type,
      entitlement: lt.defaultEntitlement,
      used: 0,
      pending: 0,
    }));

    if (data.staffId) {
      // Initialize for a single staff member
      const result = await LeaveBalance.findOneAndUpdate(
        { schoolId, staffId: data.staffId, year: data.year },
        { $setOnInsert: { balances: balanceEntries, isDeleted: false } },
        { upsert: true, new: true },
      ).lean();
      return [result];
    }

    // Initialize for all staff
    const staff = await User.find({
      schoolId,
      isDeleted: false,
      role: { $in: ['teacher', 'school_admin'] },
    }).select('_id').lean();

    const ops = staff.map((s) => ({
      updateOne: {
        filter: { schoolId, staffId: s._id, year: data.year },
        update: { $setOnInsert: { balances: balanceEntries, isDeleted: false } },
        upsert: true,
      },
    }));

    if (ops.length > 0) {
      await LeaveBalance.bulkWrite(ops);
    }

    const results = await LeaveBalance.find({
      schoolId,
      year: data.year,
      isDeleted: false,
    }).lean();

    logger.info({ schoolId, year: data.year, count: results.length }, 'Balances initialized');
    return results;
  }
}
