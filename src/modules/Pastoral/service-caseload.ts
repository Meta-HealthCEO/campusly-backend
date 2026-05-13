import mongoose from 'mongoose';
import { PastoralReferral, CounselorSession } from './model.js';
import {
  formatStudent,
  getSessionWeekStart,
  REFERRAL_POPULATE,
  STUDENT_POPULATE,
} from './helpers.js';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

function riskFromUrgency(urgency: unknown): RiskLevel {
  if (urgency === 'critical') return 'critical';
  if (urgency === 'high') return 'high';
  if (urgency === 'medium') return 'medium';
  return 'low';
}

export class CaseloadService {
  static async getCaseload(counselorId: string, schoolId: string) {
    const counselorOid = new mongoose.Types.ObjectId(counselorId);
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const now = new Date();
    const weekStart = getSessionWeekStart(now);

    const [
      activeCasesCount,
      pendingReferrals,
      overdueFollowUps,
      sessionsThisWeek,
      sessionsThisMonth,
      activeReferrals,
      overdueSessions,
    ] = await Promise.all([
      PastoralReferral.countDocuments({
        assignedCounselorId: counselorOid,
        schoolId: schoolOid,
        status: { $in: ['acknowledged', 'in_progress'] },
        isDeleted: false,
      }),
      PastoralReferral.countDocuments({
        schoolId: schoolOid,
        $or: [{ assignedCounselorId: { $exists: false } }, { assignedCounselorId: null }],
        status: 'referred',
        isDeleted: false,
      }),
      CounselorSession.countDocuments({
        counselorId: counselorOid,
        schoolId: schoolOid,
        followUpDate: { $lt: now },
        isDeleted: false,
      }),
      CounselorSession.countDocuments({
        counselorId: counselorOid,
        schoolId: schoolOid,
        sessionDate: { $gte: weekStart, $lte: now },
        isDeleted: false,
      }),
      CounselorSession.countDocuments({
        counselorId: counselorOid,
        schoolId: schoolOid,
        sessionDate: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: now,
        },
        isDeleted: false,
      }),
      PastoralReferral.find({
        assignedCounselorId: counselorOid,
        schoolId: schoolOid,
        status: { $in: ['acknowledged', 'in_progress'] },
        isDeleted: false,
      })
        .sort({ urgency: -1, createdAt: 1 })
        .populate(REFERRAL_POPULATE)
        .lean(),
      CounselorSession.find({
        counselorId: counselorOid,
        schoolId: schoolOid,
        followUpDate: { $lt: now },
        isDeleted: false,
      })
        .sort({ followUpDate: 1 })
        .populate(STUDENT_POPULATE)
        .select('studentId followUpDate')
        .lean(),
    ]);

    const cases = await Promise.all(activeReferrals.map(async (referral) => {
      const studentId = referral.studentId;
      const rawStudentId = new mongoose.Types.ObjectId(
        String(typeof studentId === 'object' && studentId && '_id' in studentId ? studentId._id : studentId),
      );
      const sessions = await CounselorSession.find({
        counselorId: counselorOid,
        schoolId: schoolOid,
        studentId: rawStudentId,
        isDeleted: false,
      })
        .select('sessionDate followUpDate')
        .sort({ sessionDate: -1 })
        .lean();

      const followUps = sessions
        .map((session) => session.followUpDate)
        .filter((date): date is Date => !!date)
        .sort((a, b) => a.getTime() - b.getTime());
      const nextFollowUp = followUps.find((date) => date >= now) ?? followUps[0] ?? null;

      return {
        studentId: formatStudent(referral.studentId),
        referralId: String(referral._id),
        reason: referral.reason,
        status: referral.status,
        sessionCount: sessions.length,
        lastSessionDate: sessions[0]?.sessionDate ?? null,
        nextFollowUp,
        isOverdue: !!nextFollowUp && nextFollowUp < now,
        riskLevel: riskFromUrgency(referral.urgency),
      };
    }));

    const overdueList = overdueSessions.map((session) => {
      const followUpDate = session.followUpDate ?? now;
      const daysPastDue = Math.max(
        0,
        Math.ceil((now.getTime() - followUpDate.getTime()) / 86_400_000),
      );
      return {
        studentId: formatStudent(session.studentId),
        nextFollowUp: followUpDate,
        daysPastDue,
      };
    });

    return {
      activeCases: activeCasesCount,
      pendingReferrals,
      overdueFollowUps,
      sessionsThisWeek,
      sessionsThisMonth,
      cases,
      overdueList,
    };
  }
}
