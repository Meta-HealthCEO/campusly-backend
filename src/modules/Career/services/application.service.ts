import {
  Application,
  type IApplication,
  Programme,
  University,
  Bursary,
  type ApplicationStatus,
} from '../model.js';
import { NotFoundError, ConflictError } from '../../../common/errors.js';
import { paginationHelper } from '../../../common/utils.js';
import { Student } from '../../Student/model.js';

// ─── Types ────────────────────────────────────────────────────────────────

interface CreateInput {
  programmeId: string;
  notes?: string;
}

interface ListQuery {
  status?: ApplicationStatus;
  page?: number;
  limit?: number;
}

interface UpdateInput {
  status?: ApplicationStatus;
  applicationReference?: string;
  notes?: string;
}

interface DocumentInput {
  name: string;
  type: 'id_copy' | 'transcript' | 'proof_of_payment' | 'motivation_letter' | 'other';
  url: string;
}

interface DeadlineItem {
  type: 'application' | 'bursary';
  name: string;
  deadline: Date;
  daysRemaining: number;
  urgent: boolean;
  referenceId: string;
}

// ─── Service ──────────────────────────────────────────────────────────────

export class ApplicationService {
  /**
   * Create a new application (draft).
   */
  static async create(
    studentId: string,
    schoolId: string,
    data: CreateInput,
  ): Promise<IApplication> {
    const programme = await Programme.findOne({
      _id: data.programmeId,
      isDeleted: false,
    }).lean();
    if (!programme) throw new NotFoundError('Programme not found');

    const existing = await Application.findOne({
      studentId,
      programmeId: data.programmeId,
      isDeleted: false,
    }).lean();
    if (existing) {
      throw new ConflictError('Application already exists for this programme');
    }

    return Application.create({
      studentId,
      schoolId,
      programmeId: data.programmeId,
      universityId: programme.universityId,
      status: 'draft',
      notes: data.notes,
    });
  }

  /**
   * List applications for a student with pagination.
   */
  static async listByStudent(studentId: string, query: ListQuery) {
    const { skip, limit } = paginationHelper(query.page, query.limit);
    const filter: Record<string, unknown> = { studentId, isDeleted: false };
    if (query.status) filter.status = query.status;

    const [data, total] = await Promise.all([
      Application.find(filter)
        .populate('programmeId', 'name faculty qualificationType')
        .populate('universityId', 'name shortName logo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filter),
    ]);

    const page = query.page ?? 1;
    return { items: data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /**
   * Update an application. Sets submittedAt when status changes to submitted.
   */
  static async update(
    id: string,
    data: UpdateInput,
  ): Promise<IApplication> {
    const updatePayload: Record<string, unknown> = { ...data };
    if (data.status === 'submitted') {
      updatePayload.submittedAt = new Date();
    }

    const application = await Application.findOneAndUpdate(
      { _id: id, isDeleted: false },
      updatePayload,
      { new: true },
    );
    if (!application) throw new NotFoundError('Application not found');
    return application;
  }

  /**
   * Add a document to an application.
   */
  static async addDocument(
    id: string,
    doc: DocumentInput,
  ): Promise<IApplication> {
    const application = await Application.findOneAndUpdate(
      { _id: id, isDeleted: false },
      {
        $push: {
          documents: { ...doc, uploadedAt: new Date() },
        },
      },
      { new: true },
    );
    if (!application) throw new NotFoundError('Application not found');
    return application;
  }

  /**
   * Get prefill data for an application (student info + programme).
   */
  static async getPrefill(id: string) {
    const application = await Application.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate('programmeId')
      .populate('universityId', 'name shortName')
      .lean();

    if (!application) throw new NotFoundError('Application not found');

    const student = await Student.findOne({
      _id: application.studentId,
      isDeleted: false,
    })
      .populate('userId', 'firstName lastName email')
      .populate('gradeId', 'name')
      .populate('schoolId', 'name')
      .lean();

    return {
      application,
      student: student
        ? {
            id: String(student._id),
            userId: student.userId,
            school: student.schoolId,
            grade: student.gradeId,
            admissionNumber: student.admissionNumber,
            dateOfBirth: student.dateOfBirth,
          }
        : null,
    };
  }

  /**
   * Get upcoming deadlines for a student across applications and bursaries.
   */
  static async getDeadlines(studentId: string): Promise<DeadlineItem[]> {
    const now = new Date();
    const deadlines: DeadlineItem[] = [];

    // Application deadlines from programmes
    const applications = await Application.find({
      studentId,
      isDeleted: false,
      status: { $in: ['draft', 'submitted'] },
    })
      .populate('programmeId', 'name applicationDeadline')
      .lean();

    for (const app of applications) {
      const prog = app.programmeId as unknown as {
        name: string;
        applicationDeadline?: Date;
      };
      if (prog?.applicationDeadline && prog.applicationDeadline > now) {
        const days = Math.ceil(
          (prog.applicationDeadline.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        deadlines.push({
          type: 'application',
          name: prog.name,
          deadline: prog.applicationDeadline,
          daysRemaining: days,
          urgent: days < 14,
          referenceId: String(app._id),
        });
      }
    }

    // Bursary deadlines
    const bursaries = await Bursary.find({
      isActive: true,
      isDeleted: false,
      applicationCloseDate: { $gt: now },
    }).lean();

    for (const b of bursaries) {
      if (b.applicationCloseDate) {
        const days = Math.ceil(
          (b.applicationCloseDate.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        );
        deadlines.push({
          type: 'bursary',
          name: b.name,
          deadline: b.applicationCloseDate,
          daysRemaining: days,
          urgent: days < 14,
          referenceId: String(b._id),
        });
      }
    }

    // Sort by deadline ascending
    deadlines.sort(
      (a: DeadlineItem, b: DeadlineItem) =>
        a.deadline.getTime() - b.deadline.getTime(),
    );

    return deadlines;
  }
}
