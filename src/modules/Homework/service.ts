import { Homework, IHomework, HomeworkSubmission, IHomeworkSubmission } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { escapeRegex } from '../../common/utils.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  classId?: string;
  subjectId?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(
    Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1),
    PAGINATION_DEFAULTS.maxLimit,
  );
  const skip = (page - 1) * limit;
  const sortField = query.sort ?? '-createdAt';
  return { page, limit, skip, sortField };
}

export class HomeworkService {
  // ─── Homework CRUD ───────────────────────────────────────────────────────

  static async create(
    data: Partial<IHomework>,
    teacherId: string,
  ): Promise<IHomework> {
    const homework = new Homework({ ...data, teacherId });
    return homework.save();
  }

  static async list(schoolId: string, query: ListQuery): Promise<PaginatedResult<IHomework>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.classId) filter.classId = query.classId;
    if (query.subjectId) filter.subjectId = query.subjectId;

    if (query.search) {
      filter.$or = [
        { title: new RegExp(escapeRegex(query.search), 'i') },
        { description: new RegExp(escapeRegex(query.search), 'i') },
      ];
    }

    const [data, total] = await Promise.all([
      Homework.find(filter)
        .populate('subjectId', 'name code')
        .populate('classId', 'name')
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Homework.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getById(id: string, schoolId: string): Promise<IHomework> {
    const homework = await Homework.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .lean();

    if (!homework) {
      throw new NotFoundError('Homework not found');
    }

    return homework;
  }

  static async update(id: string, schoolId: string, data: Partial<IHomework>): Promise<IHomework> {
    const homework = await Homework.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email');

    if (!homework) {
      throw new NotFoundError('Homework not found');
    }

    return homework;
  }

  static async delete(id: string, schoolId: string): Promise<IHomework> {
    const homework = await Homework.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!homework) {
      throw new NotFoundError('Homework not found');
    }

    return homework;
  }

  // ─── Submission Operations ───────────────────────────────────────────────

  static async submitHomework(
    homeworkId: string,
    studentId: string,
    schoolId: string,
    files: string[],
  ): Promise<IHomeworkSubmission> {
    const homework = await Homework.findOne({ _id: homeworkId, schoolId, isDeleted: false });
    if (!homework) {
      throw new NotFoundError('Homework not found');
    }

    const submittedAt = new Date();
    const isLate = submittedAt > homework.dueDate;

    const submission = await HomeworkSubmission.findOneAndUpdate(
      { homeworkId, studentId, isDeleted: false },
      {
        $set: {
          homeworkId,
          studentId,
          schoolId,
          files,
          submittedAt,
          isLate,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    return submission;
  }

  static async gradeSubmission(
    submissionId: string,
    schoolId: string,
    mark: number,
    feedback: string | undefined,
    gradedBy: string,
  ): Promise<IHomeworkSubmission> {
    const submission = await HomeworkSubmission.findOneAndUpdate(
      { _id: submissionId, schoolId, isDeleted: false },
      {
        $set: {
          mark,
          feedback,
          gradedAt: new Date(),
          gradedBy,
        },
      },
      { new: true, runValidators: true },
    )
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName email' },
      })
      .populate('homeworkId');

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    return submission;
  }

  static async getSubmissions(homeworkId: string): Promise<IHomeworkSubmission[]> {
    return HomeworkSubmission.find({ homeworkId, isDeleted: false })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName email' },
      })
      .populate('gradedBy', 'firstName lastName email')
      .sort('-submittedAt')
      .lean()
      .exec();
  }

  /**
   * Get all homework assigned to a student's class, with submission status.
   * Used by the parent homework view.
   */
  static async getHomeworkForStudent(
    studentId: string,
    schoolId: string,
  ): Promise<Array<Record<string, unknown>>> {
    // First get the student to find their classId
    const { Student } = await import('../Student/model.js');
    const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false }).lean();
    if (!student) {
      throw new NotFoundError('Student not found');
    }

    // Fetch all homework for the student's class
    const homeworks = await Homework.find({
      classId: student.classId,
      schoolId,
      isDeleted: false,
    })
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName')
      .sort({ dueDate: -1 })
      .lean();

    // Fetch all submissions by this student
    const homeworkIds = homeworks.map((h) => h._id);
    const submissions = await HomeworkSubmission.find({
      homeworkId: { $in: homeworkIds },
      studentId,
      isDeleted: false,
    }).lean();

    const submissionMap = new Map(
      submissions.map((s) => [s.homeworkId.toString(), s]),
    );

    return homeworks.map((hw) => ({
      ...hw,
      submission: submissionMap.get(hw._id.toString()),
    }));
  }

  static async getStudentSubmissions(studentId: string): Promise<IHomeworkSubmission[]> {
    return HomeworkSubmission.find({ studentId, isDeleted: false })
      .populate({
        path: 'homeworkId',
        populate: [
          { path: 'subjectId', select: 'name code' },
          { path: 'classId', select: 'name' },
        ],
      })
      .populate('gradedBy', 'firstName lastName email')
      .sort('-submittedAt')
      .lean()
      .exec();
  }
}
