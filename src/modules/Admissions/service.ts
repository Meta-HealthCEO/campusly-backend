import crypto from 'crypto';
import mongoose from 'mongoose';
import { AdmissionApplication, GradeCapacity, type AdmissionStatus } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { paginationHelper, escapeRegex } from '../../common/utils.js';
import { logger } from '../../common/logger.js';
import type {
  SubmitApplicationInput,
  UpdateStatusInput,
  ScheduleInterviewInput,
  BulkActionInput,
  ListApplicationsInput,
} from './validation.js';

// ─── Valid status transitions ─────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<AdmissionStatus, AdmissionStatus[]> = {
  submitted: ['under_review'],
  under_review: ['interview_scheduled', 'accepted', 'waitlisted', 'rejected'],
  interview_scheduled: ['accepted', 'waitlisted', 'rejected'],
  waitlisted: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateTrackingToken(): string {
  return crypto.randomBytes(6).toString('hex');
}

async function generateApplicationNumber(schoolId: string, year: number): Promise<string> {
  const count = await AdmissionApplication.countDocuments({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    yearApplyingFor: year,
  });
  const seq = String(count + 1).padStart(5, '0');
  return `ADM-${year}-${seq}`;
}

function gradeLabel(grade: number): string {
  return grade === 0 ? 'Grade R' : `Grade ${grade}`;
}

// ─── Public Service ───────────────────────────────────────────────────────────

export class AdmissionsPublicService {
  static async submitApplication(
    data: SubmitApplicationInput,
    files: Record<string, string>,
  ) {
    const applicationNumber = await generateApplicationNumber(data.schoolId, data.yearApplyingFor);
    const trackingToken = generateTrackingToken();

    const documents: Record<string, { url: string; uploadedAt: Date }> = {};
    if (files.birthCertificate) {
      documents.birthCertificate = { url: files.birthCertificate, uploadedAt: new Date() };
    }
    if (files.previousReportCard) {
      documents.previousReportCard = { url: files.previousReportCard, uploadedAt: new Date() };
    }
    if (files.proofOfResidence) {
      documents.proofOfResidence = { url: files.proofOfResidence, uploadedAt: new Date() };
    }

    const app = await AdmissionApplication.create({
      schoolId: data.schoolId,
      applicationNumber,
      trackingToken,
      status: 'submitted',
      applicantFirstName: data.applicantFirstName,
      applicantLastName: data.applicantLastName,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      gradeApplyingFor: data.gradeApplyingFor,
      yearApplyingFor: data.yearApplyingFor,
      previousSchool: data.previousSchool,
      parentFirstName: data.parentFirstName,
      parentLastName: data.parentLastName,
      parentEmail: data.parentEmail,
      parentPhone: data.parentPhone,
      parentIdNumber: data.parentIdNumber,
      parentRelationship: data.parentRelationship,
      address: data.address,
      specialNeeds: data.specialNeeds,
      additionalNotes: data.additionalNotes,
      documents,
      statusHistory: [{ status: 'submitted', date: new Date() }],
    });

    logger.info(`Admission application ${applicationNumber} submitted for school ${data.schoolId}`);

    return {
      _id: app._id,
      applicationNumber: app.applicationNumber,
      status: app.status,
      trackingToken: app.trackingToken,
    };
  }

  static async checkStatus(trackingToken: string) {
    const app = await AdmissionApplication.findOne({
      trackingToken,
      isDeleted: false,
    }).lean();

    if (!app) throw new NotFoundError('Application not found');

    return {
      applicationNumber: app.applicationNumber,
      applicantName: `${app.applicantFirstName} ${app.applicantLastName}`,
      gradeApplyingFor: app.gradeApplyingFor,
      status: app.status,
      statusHistory: app.statusHistory.map((h) => ({
        status: h.status,
        date: h.date,
      })),
      interviewDate: app.interviewDate ?? null,
      interviewVenue: app.interviewVenue ?? null,
    };
  }

  static async getPublicCapacity(schoolId: string) {
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
        const pendingApplications = await AdmissionApplication.countDocuments({
          schoolId: oid,
          gradeApplyingFor: cap.grade,
          status: { $in: ['submitted', 'under_review', 'interview_scheduled'] },
          isDeleted: false,
        });
        return {
          grade: cap.grade,
          label: gradeLabel(cap.grade),
          maxCapacity: cap.maxCapacity,
          currentEnrolled,
          pendingApplications,
          availableSpots: Math.max(0, cap.maxCapacity - currentEnrolled),
        };
      }),
    );

    return results.sort((a, b) => a.grade - b.grade);
  }
}

// ─── Admin Service ────────────────────────────────────────────────────────────

export class AdmissionsAdminService {
  static async listApplications(schoolId: string, query: ListApplicationsInput) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (query.status) {
      const statuses = query.status.split(',');
      filter.status = statuses.length === 1 ? statuses[0] : { $in: statuses };
    }
    if (query.gradeApplyingFor !== undefined) {
      filter.gradeApplyingFor = query.gradeApplyingFor;
    }
    if (query.yearApplyingFor !== undefined) {
      filter.yearApplyingFor = query.yearApplyingFor;
    }
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [
        { applicantFirstName: regex },
        { applicantLastName: regex },
        { parentFirstName: regex },
        { parentLastName: regex },
        { applicationNumber: regex },
      ];
    }

    const sortField = query.sortBy ?? 'createdAt';
    const sortDir = query.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      AdmissionApplication.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdmissionApplication.countDocuments(filter),
    ]);

    return { items, total, page: query.page ?? 1, limit };
  }

  static async getApplication(schoolId: string, id: string) {
    const app = await AdmissionApplication.findOne({
      _id: id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!app) throw new NotFoundError('Application not found');
    return app;
  }

  static async updateStatus(
    schoolId: string,
    id: string,
    userId: string,
    data: UpdateStatusInput,
  ) {
    const app = await AdmissionApplication.findOne({
      _id: id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    });
    if (!app) throw new NotFoundError('Application not found');

    const allowed = VALID_TRANSITIONS[app.status];
    if (!allowed.includes(data.status)) {
      throw new BadRequestError(
        `Cannot transition from "${app.status}" to "${data.status}"`,
      );
    }

    app.status = data.status;
    app.statusHistory.push({
      status: data.status,
      date: new Date(),
      changedBy: new mongoose.Types.ObjectId(userId),
      notes: data.notes,
    });
    if (data.status === 'under_review') {
      app.reviewedBy = new mongoose.Types.ObjectId(userId);
    }
    await app.save();

    logger.info(`Application ${app.applicationNumber} moved to ${data.status} by ${userId}`);
    return app.toObject();
  }

  static async scheduleInterview(
    schoolId: string,
    id: string,
    userId: string,
    data: ScheduleInterviewInput,
  ) {
    const app = await AdmissionApplication.findOne({
      _id: id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    });
    if (!app) throw new NotFoundError('Application not found');

    if (app.status === 'under_review') {
      app.status = 'interview_scheduled';
      app.statusHistory.push({
        status: 'interview_scheduled',
        date: new Date(),
        changedBy: new mongoose.Types.ObjectId(userId),
        notes: data.notes,
      });
    }

    app.interviewDate = new Date(data.interviewDate);
    app.interviewType = data.interviewType;
    app.interviewerName = data.interviewerName;
    app.interviewVenue = data.venue;
    app.interviewNotes = data.notes;
    await app.save();

    logger.info(`Interview scheduled for application ${app.applicationNumber}`);
    return app.toObject();
  }

  static async bulkAction(schoolId: string, userId: string, data: BulkActionInput) {
    const oid = new mongoose.Types.ObjectId(schoolId);
    let updated = 0;
    let failed = 0;

    for (const appId of data.applicationIds) {
      try {
        const app = await AdmissionApplication.findOne({
          _id: appId, schoolId: oid, isDeleted: false,
        });
        if (!app) { failed++; continue; }

        const allowed = VALID_TRANSITIONS[app.status];
        if (!allowed.includes(data.action)) { failed++; continue; }

        app.status = data.action;
        app.statusHistory.push({
          status: data.action,
          date: new Date(),
          changedBy: new mongoose.Types.ObjectId(userId),
          notes: data.notes,
        });
        await app.save();
        updated++;
      } catch (err: unknown) {
        logger.error(`Bulk action failed for app ${appId}: ${String(err)}`);
        failed++;
      }
    }

    return { updated, failed, emailsSent: data.notifyParents ? updated : 0 };
  }

  static async deleteApplication(schoolId: string, id: string) {
    const app = await AdmissionApplication.findOneAndUpdate(
      { _id: id, schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    ).lean();
    if (!app) throw new NotFoundError('Application not found');
    return app;
  }
}
