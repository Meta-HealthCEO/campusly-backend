import type { Request } from 'express';
import { Response } from 'express';
import mongoose from 'mongoose';
import { getUser } from '../../types/authenticated-request.js';
import {
  HomeworkService,
  getStudentDashboardCounts,
  getParentDashboardCounts,
} from './service.js';
import { generateComprehensionQuestions } from './service-homework-comprehension.js';
import { apiResponse } from '../../common/utils.js';
import { BadRequestError } from '../../common/errors.js';
import { toObjectId, type HomeworkActor } from './service-access.js';

interface StudentAccessRecord {
  _id: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId | string;
}

interface ParentAccessRecord {
  _id: mongoose.Types.ObjectId;
  childrenIds: mongoose.Types.ObjectId[];
}

function readObjectId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (typeof value === 'object') {
    const record = value as { _id?: unknown; id?: unknown };
    const id = record._id ?? record.id;
    return id ? String(id) : '';
  }
  return String(value);
}

async function findStudentForUser(
  userId: string,
  schoolId: string,
): Promise<StudentAccessRecord | null> {
  const { Student } = await import('../Student/model.js');
  return Student.findOne({ userId, schoolId, isDeleted: false })
    .select('_id classId')
    .lean<StudentAccessRecord>()
    .exec();
}

function getHomeworkActor(req: Request): HomeworkActor {
  const user = getUser(req);
  if (!user.schoolId) throw new BadRequestError('User must be assigned to a school');
  return { ...user, schoolId: user.schoolId };
}

async function findParentForUser(
  userId: string,
  schoolId: string,
): Promise<ParentAccessRecord | null> {
  const { Parent } = await import('../Parent/model.js');
  return Parent.findOne({ userId, schoolId, isDeleted: false })
    .select('_id childrenIds')
    .lean<ParentAccessRecord>()
    .exec();
}

function parentChildIds(parent: ParentAccessRecord | null): string[] {
  return (parent?.childrenIds ?? []).map((id) => id.toString());
}

export class HomeworkController {
  static async create(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const homework = await HomeworkService.create({ ...req.body, schoolId: actor.schoolId }, actor);
    res.status(201).json(apiResponse(true, homework, 'Homework created successfully'));
  }

  static async list(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const schoolId = actor.schoolId;
    const query = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      sort: req.query.sort as string | undefined,
      search: req.query.search as string | undefined,
      classId: req.query.classId as string | undefined,
      subjectId: req.query.subjectId as string | undefined,
      teacherId: req.query.teacherId as string | undefined,
    };

    if (req.user?.role === 'student') {
      const student = await findStudentForUser(req.user.id, schoolId);
      if (!student) {
        res.status(404).json(apiResponse(false, undefined, undefined, 'Student profile not found'));
        return;
      }
      query.classId = readObjectId(student.classId);
    }

    const result = await HomeworkService.list(actor, query);
    res.json(apiResponse(true, result, 'Homework list retrieved successfully'));
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const schoolId = actor.schoolId;

    if (req.user?.role === 'student') {
      const student = await findStudentForUser(req.user.id, schoolId);
      if (!student) {
        res.status(404).json(apiResponse(false, undefined, undefined, 'Student profile not found'));
        return;
      }
      const homework = await HomeworkService.getStudentById(
        req.params.id as string,
        readObjectId(student._id),
        schoolId,
      );
      res.json(apiResponse(true, homework, 'Homework retrieved successfully'));
      return;
    }

    const homework = await HomeworkService.getById(req.params.id as string, actor);

    if (req.user?.role === 'parent') {
      const parent = await findParentForUser(req.user.id, schoolId);
      const allowedChildIds = parentChildIds(parent);
      if (allowedChildIds.length === 0) {
        res.status(403).json(apiResponse(false, undefined, undefined, 'Parent profile not found'));
        return;
      }

      const requestedStudentId = typeof req.query.studentId === 'string'
        ? req.query.studentId
        : undefined;
      if (requestedStudentId && !allowedChildIds.includes(requestedStudentId)) {
        res.status(403).json(apiResponse(false, undefined, undefined, "You can only access your own children's data"));
        return;
      }

      const candidateIds = requestedStudentId ? [requestedStudentId] : allowedChildIds;
      const homeworkClassId = readObjectId((homework as { classId?: unknown }).classId);
      const { Student } = await import('../Student/model.js');
      const matchingChild = await Student.exists({
        _id: { $in: candidateIds.map((id) => toObjectId(id, 'studentId')) },
        schoolId,
        classId: toObjectId(homeworkClassId, 'classId'),
        isDeleted: false,
      });
      if (!matchingChild) {
        res.status(404).json(apiResponse(false, undefined, undefined, 'Homework not found'));
        return;
      }
    }

    res.json(apiResponse(true, homework, 'Homework retrieved successfully'));
  }

  static async update(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const homework = await HomeworkService.update(req.params.id as string, actor, req.body);
    res.json(apiResponse(true, homework, 'Homework updated successfully'));
  }

  static async delete(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    await HomeworkService.delete(req.params.id as string, actor);
    res.json(apiResponse(true, undefined, 'Homework deleted successfully'));
  }

  static async submit(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { Student } = await import('../Student/model.js');
    const student = await Student.findOne({ userId: req.user!.id, schoolId, isDeleted: false }).lean();
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }
    const submission = await HomeworkService.submitHomework(
      req.params.id as string,
      student._id.toString(),
      schoolId,
      req.body, // already Zod-validated
    );
    res.json({ data: submission });
  }

  static async grade(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const submissionId = req.params.submissionId as string;
    const { mark, feedback } = req.body;
    const gradedBy = getUser(req).id;

    const submission = await HomeworkService.gradeSubmission(
      submissionId,
      actor,
      mark,
      feedback,
      gradedBy,
    );
    res.json(apiResponse(true, submission, 'Submission graded successfully'));
  }

  static async getSubmissions(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const submissions = await HomeworkService.getSubmissions(req.params.id as string, actor);
    res.json(apiResponse(true, submissions, 'Submissions retrieved successfully'));
  }

  static async getHomeworkForParent(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const studentId = req.params.studentId as string;
    const result = await HomeworkService.getHomeworkForStudent(studentId, actor);
    res.json(apiResponse(true, result, 'Parent homework retrieved successfully'));
  }

  static async getStudentSubmissions(req: Request, res: Response): Promise<void> {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'User must be assigned to a school' });
      return;
    }
    if (req.user?.role === 'student') {
      const student = await findStudentForUser(req.user.id, schoolId);
      if (!student || readObjectId(student._id) !== req.params.studentId) {
        res.status(403).json(apiResponse(false, undefined, undefined, 'You can only view your own submissions'));
        return;
      }
    }
    const submissions = await HomeworkService.getStudentSubmissions(
      req.params.studentId as string,
      schoolId,
    );
    res.json(apiResponse(true, submissions, 'Student submissions retrieved successfully'));
  }

  static async getSubmissionById(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const schoolId = actor.schoolId;
    const submission = await HomeworkService.getSubmissionById(req.params.id as string, actor);
    if (req.user?.role === 'student') {
      const student = await findStudentForUser(req.user.id, schoolId);
      const submissionStudentId = readObjectId((submission as { studentId?: unknown }).studentId);
      if (!student || submissionStudentId !== readObjectId(student._id)) {
        res.status(403).json(apiResponse(false, undefined, undefined, 'You can only view your own submission'));
        return;
      }
    }
    if (req.user?.role === 'parent') {
      const parent = await findParentForUser(req.user.id, schoolId);
      const submissionStudentId = readObjectId((submission as { studentId?: unknown }).studentId);
      if (!parentChildIds(parent).includes(submissionStudentId)) {
        res.status(403).json(apiResponse(false, undefined, undefined, "You can only view your own child's submission"));
        return;
      }
    }
    res.json({ data: submission });
  }

  static async regradeSubmission(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const result = await HomeworkService.regrade(req.params.id as string, actor);
    res.json({ data: result });
  }

  static async generateComprehension(req: Request, res: Response): Promise<void> {
    const actor = getHomeworkActor(req);
    const schoolId = actor.schoolId;
    const teacherId = actor.id;
    const { contentResourceId, count } = req.body as { contentResourceId: string; count: number };
    const { subjectId, gradeId, curriculumNodeId } = req.query as Record<string, string>;
    if (!subjectId || !gradeId) {
      res.status(400).json({ error: 'subjectId and gradeId required as query params' });
      return;
    }
    let resolvedNodeId = curriculumNodeId;
    if (!resolvedNodeId) {
      const { CurriculumNode } = await import('../CurriculumStructure/model.js');
      const node = await CurriculumNode.findOne({
        schoolId: new mongoose.Types.ObjectId(schoolId),
        isDeleted: false,
      }).sort({ createdAt: 1 }).lean();
      if (!node) {
        res.status(400).json({ error: 'No curriculum node available for this school. Create one first.' });
        return;
      }
      resolvedNodeId = String(node._id);
    }
    const ids = await generateComprehensionQuestions(
      contentResourceId,
      schoolId,
      teacherId,
      subjectId,
      gradeId,
      resolvedNodeId,
      count,
    );
    res.json({ data: { questionIds: ids } });
  }

  static async studentDashboard(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { Student } = await import('../Student/model.js');
    const student = await Student.findOne({ userId: req.user!.id, schoolId, isDeleted: false }).lean();
    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }
    const counts = await getStudentDashboardCounts(student._id.toString(), schoolId);
    res.json({ data: counts });
  }

  static async parentDashboard(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const { Parent } = await import('../Parent/model.js');
    const parent = await Parent.findOne({ userId: req.user!.id, schoolId, isDeleted: false }).lean();
    if (!parent) {
      res.status(404).json({ error: 'Parent profile not found' });
      return;
    }
    const data = await getParentDashboardCounts(parent._id.toString(), schoolId);
    res.json({ data });
  }
}
