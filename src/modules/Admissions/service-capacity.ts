import mongoose from 'mongoose';
import { AdmissionApplication, GradeCapacity } from './model.js';
import { logger } from '../../common/logger.js';
import type { UpdateCapacityInput } from './validation.js';

function gradeLabel(grade: number): string {
  return grade === 0 ? 'Grade R' : `Grade ${grade}`;
}

// ─── Capacity Service ─────────────────────────────────────────────────────────

export class AdmissionsCapacityService {
  static async getCapacity(schoolId: string) {
    const oid = new mongoose.Types.ObjectId(schoolId);
    const capacities = await GradeCapacity.find({
      schoolId: oid,
      isDeleted: false,
    }).lean();

    const results = await Promise.all(
      capacities.map(async (cap) => {
        const currentEnrolled = await AdmissionApplication.countDocuments({
          schoolId: oid,
          gradeApplyingFor: cap.grade,
          status: 'accepted',
          isDeleted: false,
        });
        return {
          _id: cap._id,
          grade: cap.grade,
          label: gradeLabel(cap.grade),
          maxCapacity: cap.maxCapacity,
          currentEnrolled,
        };
      }),
    );

    return results.sort((a, b) => a.grade - b.grade);
  }

  static async updateCapacity(schoolId: string, data: UpdateCapacityInput) {
    const oid = new mongoose.Types.ObjectId(schoolId);
    const results = [];

    for (const entry of data.grades) {
      const updated = await GradeCapacity.findOneAndUpdate(
        { schoolId: oid, grade: entry.grade },
        { $set: { maxCapacity: entry.maxCapacity, isDeleted: false } },
        { upsert: true, new: true },
      ).lean();
      results.push(updated);
    }

    logger.info(`Capacity updated for school ${schoolId}: ${data.grades.length} grades`);
    return results;
  }

  static async offerToWaitlist(schoolId: string, grade: number, userId: string) {
    const oid = new mongoose.Types.ObjectId(schoolId);

    const nextInLine = await AdmissionApplication.findOne({
      schoolId: oid,
      gradeApplyingFor: grade,
      status: 'waitlisted',
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .exec();

    if (!nextInLine) return null;

    nextInLine.status = 'accepted';
    nextInLine.statusHistory.push({
      status: 'accepted',
      date: new Date(),
      changedBy: new mongoose.Types.ObjectId(userId),
      notes: 'Offered from waitlist',
    });
    await nextInLine.save();

    logger.info(
      `Waitlist offer: ${nextInLine.applicationNumber} accepted for grade ${grade}`,
    );

    return nextInLine.toObject();
  }
}

// ─── Reports Service ──────────────────────────────────────────────────────────

export class AdmissionsReportsService {
  static async getSummary(schoolId: string, yearApplyingFor?: number) {
    const oid = new mongoose.Types.ObjectId(schoolId);
    const year = yearApplyingFor ?? new Date().getFullYear() + 1;

    const baseFilter = { schoolId: oid, yearApplyingFor: year, isDeleted: false };

    const totalApplications = await AdmissionApplication.countDocuments(baseFilter);

    const byStatusAgg = await AdmissionApplication.aggregate([
      { $match: { ...baseFilter, schoolId: oid } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const byStatus: Record<string, number> = {};
    for (const entry of byStatusAgg) {
      byStatus[entry._id as string] = entry.count as number;
    }

    const byGradeAgg = await AdmissionApplication.aggregate([
      { $match: { ...baseFilter, schoolId: oid } },
      {
        $group: {
          _id: '$gradeApplyingFor',
          total: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          pending: {
            $sum: {
              $cond: [
                { $in: ['$status', ['submitted', 'under_review', 'interview_scheduled', 'waitlisted']] },
                1, 0,
              ],
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const byGrade = byGradeAgg.map((g) => ({
      grade: g._id as number,
      label: gradeLabel(g._id as number),
      total: g.total as number,
      accepted: g.accepted as number,
      rejected: g.rejected as number,
      pending: g.pending as number,
    }));

    const accepted = byStatus['accepted'] ?? 0;
    const acceptanceRate = totalApplications > 0
      ? Math.round((accepted / totalApplications) * 1000) / 10
      : 0;

    const reviewed = (byStatus['under_review'] ?? 0) + (byStatus['interview_scheduled'] ?? 0)
      + accepted + (byStatus['waitlisted'] ?? 0) + (byStatus['rejected'] ?? 0);
    const interviewed = (byStatus['interview_scheduled'] ?? 0) + accepted
      + (byStatus['waitlisted'] ?? 0) + (byStatus['rejected'] ?? 0);

    const conversionFunnel = {
      applied: totalApplications,
      reviewed,
      interviewed,
      offered: accepted + (byStatus['waitlisted'] ?? 0),
      accepted,
    };

    return {
      totalApplications,
      byStatus,
      byGrade,
      acceptanceRate,
      conversionFunnel,
    };
  }
}

// ─── Parent Service ───────────────────────────────────────────────────────────

export class AdmissionsParentService {
  static async getMyApplications(email: string) {
    const apps = await AdmissionApplication.find({
      parentEmail: email.toLowerCase(),
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .select(
        'applicationNumber applicantFirstName applicantLastName gradeApplyingFor yearApplyingFor '
        + 'status interviewDate interviewVenue statusHistory createdAt',
      )
      .lean();

    return apps;
  }
}
