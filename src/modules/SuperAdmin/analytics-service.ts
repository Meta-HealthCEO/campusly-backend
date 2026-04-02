import mongoose from 'mongoose';
import { Tenant, SupportTicket } from './model.js';

// ─── Tier Pricing (fallback when subscription.price is not set) ──────────────

const TIER_PRICES: Record<string, number> = {
  starter: 500,
  growth: 1000,
  enterprise: 2000,
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface PlatformAnalytics {
  mrr: number;
  arr: number;
  growthRate: number;
  churnCount: number;
  activeSchools: number;
  totalSchools: number;
  activeUsers: number;
}

interface HealthComponent {
  label: string;
  value: number;
  weight: number;
}

interface TenantHealthScore {
  score: number;
  components: HealthComponent[];
  risk: 'healthy' | 'at_risk' | 'critical';
}

interface TenantHealthOverviewRow {
  tenantId: string;
  schoolId: string;
  schoolName: string;
  status: string;
  score: number;
  risk: 'healthy' | 'at_risk' | 'critical';
  tier: string;
}

// ─── Analytics Service ───────────────────────────────────────────────────────

export class SuperAdminAnalyticsService {
  static async getPlatformAnalytics(): Promise<PlatformAnalytics> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [activeTenants, allTenants, lastMonthTenants, churnedTenants, activeUsers] =
      await Promise.all([
        Tenant.find({ status: 'active', isDeleted: false }).lean(),
        Tenant.countDocuments({ isDeleted: false, status: { $ne: 'cancelled' } }),
        Tenant.countDocuments({
          isDeleted: false,
          createdAt: { $lt: firstOfThisMonth },
          status: { $ne: 'cancelled' },
        }),
        Tenant.countDocuments({
          isDeleted: false,
          status: { $in: ['suspended', 'cancelled'] },
          updatedAt: { $gte: thirtyDaysAgo },
        }),
        // Count users who logged in within the last 7 days
        mongoose.model('User').countDocuments({
          isDeleted: false,
          isActive: true,
          lastLoginAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]);

    // Calculate MRR from active tenants
    let mrr = 0;
    for (const t of activeTenants) {
      if (t.subscription?.price) {
        if (t.subscription.billingCycle === 'annual') {
          mrr += t.subscription.price / 12;
        } else {
          mrr += t.subscription.price;
        }
      } else {
        const tier = t.subscription?.tier ?? 'starter';
        mrr += TIER_PRICES[tier] ?? TIER_PRICES['starter'];
      }
    }

    const thisMonthCount = allTenants;
    const growthRate =
      lastMonthTenants > 0
        ? Math.round(((thisMonthCount - lastMonthTenants) / lastMonthTenants) * 100)
        : 0;

    return {
      mrr: Math.round(mrr),
      arr: Math.round(mrr * 12),
      growthRate,
      churnCount: churnedTenants,
      activeSchools: activeTenants.length,
      totalSchools: allTenants,
      activeUsers,
    };
  }

  static async getTenantHealthScore(schoolId: string): Promise<TenantHealthScore> {
    const tenant = await Tenant.findOne({ schoolId, isDeleted: false }).lean();
    if (!tenant) {
      return { score: 0, components: [], risk: 'critical' };
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const schoolObjId = new mongoose.Types.ObjectId(schoolId);

    // 1. Login frequency (30%) — users who logged in last 30 days / total users
    const [totalUsers, recentLogins] = await Promise.all([
      mongoose.model('User').countDocuments({
        schoolId: schoolObjId,
        isDeleted: false,
        isActive: true,
      }),
      mongoose.model('User').countDocuments({
        schoolId: schoolObjId,
        isDeleted: false,
        isActive: true,
        lastLoginAt: { $gte: thirtyDaysAgo },
      }),
    ]);
    const loginScore = totalUsers > 0 ? Math.min(100, (recentLogins / totalUsers) * 100) : 0;

    // 2. Module usage (25%) — modules enabled ratio (out of 10 possible)
    const modulesEnabled = tenant.modulesEnabled?.length ?? 0;
    const moduleScore = Math.min(100, (modulesEnabled / 10) * 100);

    // 3. Student count (15%) — current vs max capacity
    const studentRatio =
      tenant.limits.maxStudents > 0
        ? (tenant.usage.currentStudents / tenant.limits.maxStudents) * 100
        : 0;
    const studentScore = Math.min(100, studentRatio);

    // 4. Fee collection rate (15%) — placeholder (use 70% baseline if no fee data)
    const feeScore = 70;

    // 5. Support tickets (15%) — fewer open tickets = healthier
    const openTickets = await SupportTicket.countDocuments({
      schoolId: schoolObjId,
      isDeleted: false,
      status: { $in: ['open', 'in_progress'] },
    });
    const ticketScore = Math.max(0, 100 - openTickets * 20);

    const components: HealthComponent[] = [
      { label: 'Login Frequency', value: Math.round(loginScore), weight: 30 },
      { label: 'Module Usage', value: Math.round(moduleScore), weight: 25 },
      { label: 'Student Enrollment', value: Math.round(studentScore), weight: 15 },
      { label: 'Fee Collection', value: Math.round(feeScore), weight: 15 },
      { label: 'Support Health', value: Math.round(ticketScore), weight: 15 },
    ];

    const score = Math.round(
      components.reduce((sum, c) => sum + (c.value * c.weight) / 100, 0),
    );

    let risk: TenantHealthScore['risk'] = 'healthy';
    if (score < 40) risk = 'critical';
    else if (score < 65) risk = 'at_risk';

    return { score, components, risk };
  }

  static async getTenantHealthOverview(): Promise<TenantHealthOverviewRow[]> {
    const tenants = await Tenant.find({ isDeleted: false, status: { $ne: 'cancelled' } })
      .populate('schoolId', 'name')
      .lean();

    const results: TenantHealthOverviewRow[] = [];

    for (const t of tenants) {
      const school = t.schoolId as unknown as { _id: mongoose.Types.ObjectId; name: string };
      const health = await this.getTenantHealthScore(school._id.toString());
      results.push({
        tenantId: (t._id as mongoose.Types.ObjectId).toString(),
        schoolId: school._id.toString(),
        schoolName: school.name ?? 'Unknown',
        status: t.status,
        score: health.score,
        risk: health.risk,
        tier: t.subscription?.tier ?? 'starter',
      });
    }

    // Sort by score ascending (worst first)
    results.sort((a, b) => a.score - b.score);
    return results;
  }
}
