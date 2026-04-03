import mongoose from 'mongoose';
import { PastoralReferral, CounselorSession } from './model.js';

export class CaseloadService {
  static async getCaseload(counselorId: string, schoolId: string) {
    const counselorOid = new mongoose.Types.ObjectId(counselorId);
    const schoolOid = new mongoose.Types.ObjectId(schoolId);
    const now = new Date();

    const [
      activeReferrals,
      pendingReferrals,
      totalSessions,
      overdueFollowUps,
      thisMonthSessions,
    ] = await Promise.all([
      // Active cases: referrals assigned to this counselor that are in progress
      PastoralReferral.countDocuments({
        assignedCounselorId: counselorOid,
        schoolId: schoolOid,
        status: { $in: ['acknowledged', 'in_progress'] },
        isDeleted: false,
      }),

      // Pending: unassigned referrals in this school
      PastoralReferral.countDocuments({
        schoolId: schoolOid,
        assignedCounselorId: { $exists: false },
        status: 'referred',
        isDeleted: false,
      }),

      // All sessions by this counselor
      CounselorSession.countDocuments({
        counselorId: counselorOid,
        schoolId: schoolOid,
        isDeleted: false,
      }),

      // Overdue follow-ups: sessions with followUpDate in the past, not yet resolved
      CounselorSession.countDocuments({
        counselorId: counselorOid,
        schoolId: schoolOid,
        followUpDate: { $lt: now },
        isDeleted: false,
      }),

      // Sessions this calendar month
      CounselorSession.countDocuments({
        counselorId: counselorOid,
        schoolId: schoolOid,
        sessionDate: {
          $gte: new Date(now.getFullYear(), now.getMonth(), 1),
          $lte: now,
        },
        isDeleted: false,
      }),
    ]);

    // Fetch the actual active referrals with student info
    const activeCases = await PastoralReferral.find({
      assignedCounselorId: counselorOid,
      schoolId: schoolOid,
      status: { $in: ['acknowledged', 'in_progress'] },
      isDeleted: false,
    })
      .sort({ urgency: -1, createdAt: 1 })
      .populate('studentId', 'firstName lastName grade')
      .select('studentId reason urgency status createdAt')
      .lean();

    // Upcoming follow-ups in the next 7 days
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingFollowUps = await CounselorSession.find({
      counselorId: counselorOid,
      schoolId: schoolOid,
      followUpDate: { $gte: now, $lte: sevenDaysFromNow },
      isDeleted: false,
    })
      .sort({ followUpDate: 1 })
      .populate('studentId', 'firstName lastName')
      .select('studentId followUpDate sessionType')
      .lean();

    return {
      summary: {
        activeCases: activeReferrals,
        pendingReferrals,
        overdueFollowUps,
        totalSessions,
        sessionsThisMonth: thisMonthSessions,
      },
      activeCases,
      upcomingFollowUps,
    };
  }
}
