import mongoose from 'mongoose';
import { Attendance, Discipline, Merit } from '../Attendance/model.js';
import { Incident } from '../Incident/model.js';
import { Student } from '../Student/model.js';
import { PastoralReferral, CounselorSession } from './model.js';
import {
  assertCanAccessStudent,
  formatStudent,
  formatUser,
  getNextDate,
  idToString,
  type PastoralUser,
} from './helpers.js';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

function computeRiskLevel(
  activeReferrals: number,
  criticalOrHighUrgency: number,
  recentSessions: number,
  recentAbsences: number,
  recentBehaviourEvents: number,
): RiskLevel {
  if (criticalOrHighUrgency > 0) return 'critical';
  if (activeReferrals >= 3 || recentAbsences >= 5 || recentBehaviourEvents >= 4) return 'high';
  if (activeReferrals >= 1 || recentSessions >= 3 || recentAbsences >= 2 || recentBehaviourEvents >= 1) return 'medium';
  return 'low';
}

export class WellbeingService {
  static async getWellbeingProfile(user: PastoralUser, studentId: string) {
    const schoolId = user.schoolId!;
    const studentOid = new mongoose.Types.ObjectId(studentId);
    const schoolOid = new mongoose.Types.ObjectId(schoolId);

    await assertCanAccessStudent(user, studentId, schoolId);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      student,
      referrals,
      sessions,
      attendanceTotal,
      absentTotal,
      recentAbsences,
      disciplineRecords,
      meritBalance,
      incidents,
    ] = await Promise.all([
      Student.findOne({ _id: studentOid, schoolId: schoolOid, isDeleted: false })
        .populate('userId', 'firstName lastName email')
        .populate('gradeId', 'name level')
        .populate('classId', 'name')
        .lean(),
      PastoralReferral.find({
        studentId: studentOid,
        schoolId: schoolOid,
        isDeleted: false,
      })
        .populate('referredBy', 'firstName lastName')
        .select('reason urgency status createdAt resolvedAt outcome referredBy')
        .sort({ createdAt: -1 })
        .lean(),
      CounselorSession.find({
        studentId: studentOid,
        schoolId: schoolOid,
        isDeleted: false,
      })
        .select('sessionDate sessionType followUpDate')
        .sort({ sessionDate: -1 })
        .lean(),
      Attendance.countDocuments({
        studentId: studentOid,
        schoolId: schoolOid,
        isDeleted: false,
      }),
      Attendance.countDocuments({
        studentId: studentOid,
        schoolId: schoolOid,
        status: 'absent',
        isDeleted: false,
      }),
      Attendance.countDocuments({
        studentId: studentOid,
        schoolId: schoolOid,
        status: 'absent',
        date: { $gte: thirtyDaysAgo },
        isDeleted: false,
      }),
      Discipline.find({
        studentId: studentOid,
        schoolId: schoolOid,
        isDeleted: false,
      })
        .select('type severity description createdAt')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Merit.aggregate<{ _id: string; points: number }>([
        {
          $match: {
            studentId: studentOid,
            schoolId: schoolOid,
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: '$type',
            points: { $sum: '$points' },
          },
        },
      ]),
      Incident.find({
        schoolId: schoolOid,
        'involvedParties.studentId': studentOid,
        isDeleted: false,
      })
        .select('type severity title description incidentDate')
        .sort({ incidentDate: -1 })
        .limit(10)
        .lean(),
    ]);

    const openReferrals = referrals.filter(
      (referral) => !['resolved', 'closed'].includes(referral.status),
    );
    const criticalOrHigh = openReferrals.filter(
      (referral) => referral.urgency === 'critical' || referral.urgency === 'high',
    ).length;

    const recentSessionCount = sessions.filter(
      (session) => session.sessionDate >= thirtyDaysAgo,
    ).length;

    const sessionTypes = sessions.reduce<Record<string, number>>((acc, session) => {
      acc[session.sessionType] = (acc[session.sessionType] ?? 0) + 1;
      return acc;
    }, {});

    const meritPoints = meritBalance.find((item) => item._id === 'merit')?.points ?? 0;
    const demeritPoints = meritBalance.find((item) => item._id === 'demerit')?.points ?? 0;

    const disciplineIncidents = disciplineRecords.map((record) => ({
      type: String(record.type),
      description: String(record.description ?? ''),
      date: record.createdAt,
    }));
    const wellbeingIncidents = incidents.map((incident) => ({
      type: String(incident.type),
      description: String(incident.title ?? incident.description ?? ''),
      date: incident.incidentDate,
    }));
    const recentBehaviour = [...disciplineIncidents, ...wellbeingIncidents]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    const riskFactors: string[] = [];
    if (criticalOrHigh > 0) riskFactors.push('High urgency referral');
    if (openReferrals.length >= 3) riskFactors.push('Multiple active referrals');
    if (recentAbsences >= 5) riskFactors.push('Repeated recent absences');
    if (recentBehaviour.length >= 4) riskFactors.push('Repeated behaviour incidents');

    const riskLevel = computeRiskLevel(
      openReferrals.length,
      criticalOrHigh,
      recentSessionCount,
      recentAbsences,
      recentBehaviour.length,
    );

    return {
      student: formatStudent(student),
      referrals: {
        total: referrals.length,
        active: openReferrals.length,
        resolved: referrals.filter((referral) => referral.status === 'resolved').length,
        recent: referrals.slice(0, 5).map((referral) => ({
          id: idToString(referral._id),
          reason: referral.reason,
          urgency: referral.urgency,
          status: referral.status,
          referredBy: formatUser(referral.referredBy),
          createdAt: referral.createdAt,
        })),
      },
      sessions: {
        total: sessions.length,
        lastSessionDate: sessions[0]?.sessionDate ?? null,
        nextFollowUp: getNextDate(sessions.map((session) => session.followUpDate)),
        sessionTypes,
      },
      attendance: {
        overallRate: attendanceTotal > 0
          ? ((attendanceTotal - absentTotal) / attendanceTotal) * 100
          : 0,
        recentAbsences,
        pattern: recentAbsences >= 3 ? 'Multiple absences in the last 30 days' : null,
        trend: attendanceTotal > 0 ? null : 'No attendance records',
      },
      academic: {
        overallAverage: 0,
        trend: 'Not connected',
        failingSubjects: [],
        lastTermAverage: 0,
      },
      behaviour: {
        merits: meritPoints,
        demerits: demeritPoints + disciplineRecords.length,
        recentIncidents: recentBehaviour,
      },
      riskLevel,
      riskFactors,
    };
  }
}
