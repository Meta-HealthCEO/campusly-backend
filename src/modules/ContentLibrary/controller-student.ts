import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { paginationHelper } from '../../common/utils.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../common/errors.js';
import { ContentResource } from './model.js';
import { Student } from '../Student/model.js';
import { AttemptsService } from './service-attempts.js';
import { MasteryService } from './service-mastery.js';
import type { StudentResourceQueryInput, MasteryQueryInput, SubmitAttemptInput } from './validation-student.js';

async function verifyStudentOwnership(
  studentId: string,
  userId: string,
  schoolId: string,
): Promise<void> {
  const studentRecord = await Student.findOne({
    _id: new mongoose.Types.ObjectId(studentId),
    userId: new mongoose.Types.ObjectId(userId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
  }).lean();
  if (!studentRecord) {
    throw new ForbiddenError('You can only access your own student data');
  }
}

const POPULATE_LIST = [
  { path: 'curriculumNodeId', select: 'title code type' },
  { path: 'subjectId', select: 'name' },
  { path: 'gradeId', select: 'name level' },
];

export class StudentContentController {
  // ─── List approved resources (system + school) ────────────────────────────

  static async listApprovedResources(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const filters = req.query as unknown as StudentResourceQueryInput;
    const schoolOid = new mongoose.Types.ObjectId(user.schoolId!);

    const query: Record<string, unknown> = {
      isDeleted: false,
      status: 'approved',
      $or: [
        { schoolId: null },        // System-wide resources
        { schoolId: schoolOid },    // School-specific resources
      ],
    };

    if (filters.subjectId) {
      query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    }
    if (filters.gradeId) {
      query.gradeId = new mongoose.Types.ObjectId(filters.gradeId);
    }
    if (filters.term) query.term = filters.term;
    if (filters.type) query.type = filters.type;
    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [resources, total] = await Promise.all([
      ContentResource.find(query)
        .select('-blocks -aiPrompt -aiModel -reviewNotes')
        .populate(POPULATE_LIST)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContentResource.countDocuments(query),
    ]);

    res.json(apiResponse(true, { resources, total, page: filters.page ?? 1, limit }));
  }

  // ─── Get single approved resource with blocks ─────────────────────────────

  static async getResource(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const oid = new mongoose.Types.ObjectId(req.params.id as string);
    const schoolOid = new mongoose.Types.ObjectId(user.schoolId!);

    const resource = await ContentResource.findOne({
      _id: oid,
      isDeleted: false,
      status: 'approved',
      $or: [{ schoolId: null }, { schoolId: schoolOid }],
    })
      .populate(POPULATE_LIST)
      .lean();

    if (!resource) throw new NotFoundError('Content resource not found');

    res.json(apiResponse(true, resource));
  }

  // ─── Submit attempt on a block ────────────────────────────────────────────

  static async submitAttempt(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const resourceId = req.params.id as string;
    const data = req.body as SubmitAttemptInput;

    // Resolve student ID from query or from user lookup
    const studentId = req.query.studentId as string | undefined;
    if (!studentId) {
      throw new BadRequestError('studentId query parameter is required');
    }

    // Verify student belongs to the current user
    if (user.role === 'student') {
      await verifyStudentOwnership(studentId, user.id!, user.schoolId!);
    }

    const attempt = await AttemptsService.submitAttempt(
      studentId,
      user.schoolId!,
      resourceId,
      data,
    );

    res.status(201).json(apiResponse(true, attempt, 'Attempt recorded successfully'));
  }

  // ─── Get mastery for current student ──────────────────────────────────────

  static async getMyMastery(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const filters = req.query as unknown as MasteryQueryInput;

    const studentId = filters.studentId;
    if (!studentId) {
      throw new BadRequestError('studentId query parameter is required');
    }

    // Verify student belongs to the current user
    if (user.role === 'student') {
      await verifyStudentOwnership(studentId, user.id!, user.schoolId!);
    }

    const result = await MasteryService.getStudentMastery(
      studentId,
      user.schoolId!,
      {
        subjectId: filters.subjectId,
        gradeId: filters.gradeId,
        page: filters.page,
        limit: filters.limit,
      },
    );

    res.json(apiResponse(true, result));
  }

  // ─── Get class mastery (HOD/admin only) ───────────────────────────────────

  static async getClassMastery(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const classId = req.params.classId as string;

    const result = await MasteryService.getClassMastery(user.schoolId!, classId);

    res.json(apiResponse(true, result));
  }
}
