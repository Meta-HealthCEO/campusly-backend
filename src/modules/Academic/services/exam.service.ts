import { Exam, IExam, ExamTimetable, IExamTimetable } from '../model.js';
import { NotFoundError } from '../../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../../common/constants.js';
import { escapeRegex } from '../../../common/utils.js';

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
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

export class ExamService {
  // ─── Exam CRUD ────────────────────────────────────────────────────────────

  static async createExam(data: Partial<IExam>): Promise<IExam> {
    const exam = new Exam(data);
    return exam.save();
  }

  static async listExams(schoolId: string, query: ListQuery): Promise<PaginatedResult<IExam>> {
    const { page, limit, skip, sortField } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.search) filter.name = new RegExp(escapeRegex(query.search), 'i');

    const [data, total] = await Promise.all([
      Exam.find(filter).sort(sortField).skip(skip).limit(limit).lean().exec(),
      Exam.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getExamById(id: string, schoolId: string): Promise<IExam> {
    const exam = await Exam.findOne({ _id: id, schoolId, isDeleted: false }).lean();
    if (!exam) throw new NotFoundError('Exam not found');
    return exam;
  }

  static async updateExam(id: string, schoolId: string, data: Partial<IExam>): Promise<IExam> {
    const exam = await Exam.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!exam) throw new NotFoundError('Exam not found');
    return exam;
  }

  static async deleteExam(id: string, schoolId: string): Promise<IExam> {
    const exam = await Exam.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!exam) throw new NotFoundError('Exam not found');
    return exam;
  }

  // ─── Exam Timetable CRUD ─────────────────────────────────────────────────

  static async createExamTimetable(data: Partial<IExamTimetable>): Promise<IExamTimetable> {
    const entry = new ExamTimetable(data);
    return entry.save();
  }

  static async listExamTimetable(examId: string, query: ListQuery): Promise<PaginatedResult<IExamTimetable>> {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { examId, isDeleted: false };

    const [data, total] = await Promise.all([
      ExamTimetable.find(filter)
        .populate('subjectId', 'name code')
        .populate('gradeId', 'name')
        .populate('invigilator', 'firstName lastName email')
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ExamTimetable.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getExamTimetableById(id: string, schoolId: string): Promise<IExamTimetable> {
    const entry = await ExamTimetable.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name')
      .populate('invigilator', 'firstName lastName email')
      .lean();
    if (!entry) throw new NotFoundError('Exam timetable entry not found');
    return entry;
  }

  static async updateExamTimetable(id: string, data: Partial<IExamTimetable>): Promise<IExamTimetable> {
    const entry = await ExamTimetable.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('subjectId', 'name code').populate('gradeId', 'name').populate('invigilator', 'firstName lastName email');
    if (!entry) throw new NotFoundError('Exam timetable entry not found');
    return entry;
  }

  static async deleteExamTimetable(id: string): Promise<IExamTimetable> {
    const entry = await ExamTimetable.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!entry) throw new NotFoundError('Exam timetable entry not found');
    return entry;
  }
}
