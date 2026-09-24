import mongoose from 'mongoose';
import { Department } from './model.js';
import { PaperModeration } from '../TeacherWorkbench/model.assessment.js';
import { ForbiddenError, NotFoundError } from '../../common/errors.js';
import { ModerationService } from '../TeacherWorkbench/services/moderation.service.js';
import { paginationHelper } from '../../common/utils.js';
import { DepartmentService } from './service.js';

export class ModerationQueueService {
  /** An HOD reviews a paper, but only one submitted by a teacher in their own department. */
  static async reviewDepartmentPaper(
    departmentId: string,
    schoolId: string,
    paperId: string,
    reviewerId: string,
    status: 'approved' | 'changes_requested',
    comments: string,
  ) {
    const dept = await Department.findOne({ _id: departmentId, schoolId, isDeleted: false }).lean().exec();
    if (!dept) throw new NotFoundError('Department not found');
    const moderation = await PaperModeration.findOne({ paperId, schoolId, isDeleted: false }).lean().exec();
    if (!moderation) throw new NotFoundError('Moderation record not found');
    const teacherIds = await DepartmentService.getDepartmentTeacherIds(departmentId, schoolId);
    if (!teacherIds.includes(String(moderation.submittedBy))) {
      throw new ForbiddenError("This paper isn't from a teacher in your department");
    }
    return ModerationService.reviewPaper(paperId, reviewerId, status, comments, schoolId);
  }

  static async getModerationQueue(
    departmentId: string,
    schoolId: string,
    filters: { status?: string; page?: number; limit?: number },
  ) {
    const dept = await Department.findOne({
      _id: departmentId, schoolId, isDeleted: false,
    }).lean().exec();
    if (!dept) throw new NotFoundError('Department not found');

    const status = filters.status ?? 'pending';
    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    // Filter moderation by teachers in this department
    const teacherIds = await DepartmentService.getDepartmentTeacherIds(departmentId, schoolId);
    const teacherOids = teacherIds.map((id) => new mongoose.Types.ObjectId(id));

    const query = {
      schoolId,
      submittedBy: { $in: teacherOids },
      status,
      isDeleted: false,
    };

    const [items, total] = await Promise.all([
      PaperModeration.find(query)
        .populate({
          path: 'paperId',
          select: 'subject totalMarks grade topic',
        })
        .populate('submittedBy', 'firstName lastName email')
        .sort({ submittedAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      PaperModeration.countDocuments(query),
    ]);

    return {
      items: (items as unknown as Record<string, unknown>[]).map((item) => {
        const paper = item.paperId as Record<string, unknown> | null;
        const teacher = item.submittedBy as Record<string, unknown> | null;
        return {
          _id: item._id,
          paperId: paper?._id ?? item.paperId,
          paperTitle: paper
            ? `${paper.subject} Grade ${paper.grade} — ${paper.topic}`
            : 'Unknown',
          subjectName: (paper?.subject as string) ?? 'Unknown',
          teacherName: teacher
            ? `${teacher.firstName} ${teacher.lastName}`
            : 'Unknown',
          submittedAt: item.submittedAt,
          status: item.status,
          totalMarks: (paper?.totalMarks as number) ?? 0,
        };
      }),
      total,
      page: filters.page ?? 1,
      limit,
    };
  }
}
