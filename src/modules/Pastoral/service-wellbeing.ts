import mongoose from 'mongoose';
import { PastoralReferral, CounselorSession } from './model.js';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

function computeRiskLevel(
  openReferrals: number,
  criticalOrHighUrgency: number,
  recentSessions: number,
): RiskLevel {
  if (criticalOrHighUrgency > 0) return 'critical';
  if (openReferrals >= 3) return 'high';
  if (openReferrals >= 1 || recentSessions >= 3) return 'medium';
  return 'low';
}

export class WellbeingService {
  static async getWellbeingProfile(studentId: string, schoolId: string) {
    const studentOid = new mongoose.Types.ObjectId(studentId);
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    const [referrals, sessionCountResult] = await Promise.all([
      PastoralReferral.find({
        studentId: studentOid,
        schoolId: schoolOid,
        isDeleted: false,
      })
        .select('reason urgency status createdAt resolvedAt outcome')
        .sort({ createdAt: -1 })
        .lean(),
      // Return counts only, not session content, for privacy
      CounselorSession.countDocuments({
        studentId: studentOid,
        schoolId: schoolOid,
        isDeleted: false,
      }),
    ]);

    const openReferrals = referrals.filter(
      (r) => !['resolved', 'closed'].includes(r.status),
    );
    const criticalOrHigh = openReferrals.filter(
      (r) => r.urgency === 'critical' || r.urgency === 'high',
    ).length;

    // Recent sessions (last 30 days) for risk scoring
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessionCount = await CounselorSession.countDocuments({
      studentId: studentOid,
      schoolId: schoolOid,
      isDeleted: false,
      sessionDate: { $gte: thirtyDaysAgo },
    });

    const riskLevel = computeRiskLevel(
      openReferrals.length,
      criticalOrHigh,
      recentSessionCount,
    );

    return {
      studentId,
      riskLevel,
      referrals: {
        total: referrals.length,
        open: openReferrals.length,
        resolved: referrals.filter((r) => r.status === 'resolved').length,
        history: referrals,
      },
      sessions: {
        total: sessionCountResult,
        recentCount: recentSessionCount,
        // NOTE: Session content not returned here for privacy.
        // Use GET /sessions?studentId= with counselor auth to retrieve session details.
      },
      // TODO: integrate attendance data from Attendance module when available
      attendance: null,
      // TODO: integrate academic marks from Academic module when available
      academic: null,
      // TODO: integrate behaviour/incident data from Incident module when available
      behaviour: null,
    };
  }
}
