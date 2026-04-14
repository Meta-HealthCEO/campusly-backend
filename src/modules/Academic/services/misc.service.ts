import {
  Timetable, ITimetable,
  PastPaper, IPastPaper,
  SubjectWeighting, ISubjectWeighting,
  RemedialTracking, IRemedialTracking,
} from '../model.js';
import { Student } from '../../Student/model.js';
import { NotFoundError } from '../../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../../common/constants.js';
import type { PopulatedUser, PopulatedGrade } from '../../../types/populated.js';
import { getPopulated } from '../../../types/populated.js';
import { TimetableClashService } from './timetable-clash.service.js';

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

export class MiscAcademicService {
  // ─── Timetable CRUD ─────────────────────────────────────────────────────

  static async createTimetable(data: Partial<ITimetable>): Promise<ITimetable> {
    // Validate no clashes before saving
    if (data.schoolId && data.teacherId && data.classId && data.day && data.period !== undefined) {
      await TimetableClashService.validateNoClash(
        String(data.schoolId),
        String(data.teacherId),
        String(data.classId),
        data.day,
        data.period,
      );
    }
    const entry = new Timetable(data);
    return entry.save();
  }

  static async listTimetable(
    filters: { schoolId: string; classId?: string },
    query: ListQuery,
  ): Promise<PaginatedResult<ITimetable>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId: filters.schoolId, isDeleted: false };
    if (filters.classId) filter.classId = filters.classId;

    const [data, total] = await Promise.all([
      Timetable.find(filter)
        .populate('classId', 'name gradeId')
        .populate('subjectId', 'name code')
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Timetable.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getTimetableById(id: string, schoolId: string): Promise<ITimetable> {
    const entry = await Timetable.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('classId', 'name gradeId')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName email')
      .lean();
    if (!entry) throw new NotFoundError('Timetable entry not found');
    return entry;
  }

  static async getByClass(classId: string): Promise<ITimetable[]> {
    return Timetable.find({ classId, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName email')
      .sort({ day: 1, period: 1 })
      .lean()
      .exec();
  }

  static async getByTeacher(teacherId: string, schoolId: string): Promise<ITimetable[]> {
    return Timetable.find({ teacherId, schoolId, isDeleted: false })
      .populate('classId', 'name gradeId')
      .populate('subjectId', 'name code')
      .sort({ day: 1, period: 1 })
      .lean()
      .exec();
  }

  static async updateTimetable(id: string, schoolId: string, data: Partial<ITimetable>): Promise<ITimetable> {
    // If day/period/teacher/class are changing, validate no clashes
    if (data.teacherId || data.classId || data.day || data.period !== undefined) {
      const existing = await Timetable.findOne({ _id: id, schoolId, isDeleted: false }).lean();
      if (existing) {
        await TimetableClashService.validateNoClash(
          schoolId,
          String(data.teacherId ?? existing.teacherId),
          String(data.classId ?? existing.classId),
          (data.day ?? existing.day) as string,
          data.period ?? existing.period,
          id,
        );
      }
    }
    const entry = await Timetable.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('classId', 'name gradeId')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName email');
    if (!entry) throw new NotFoundError('Timetable entry not found');
    return entry;
  }

  static async deleteTimetable(id: string, schoolId: string): Promise<ITimetable> {
    const entry = await Timetable.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!entry) throw new NotFoundError('Timetable entry not found');
    return entry;
  }

  // ─── Past Paper CRUD ──────────────────────────────────────────────────────

  static async createPastPaper(data: Partial<IPastPaper>, uploadedBy: string): Promise<IPastPaper> {
    const paper = new PastPaper({ ...data, uploadedBy });
    return paper.save();
  }

  static async listPastPapers(
    schoolId: string,
    filters: { subjectId?: string; gradeId?: string; year?: number },
    query: ListQuery,
  ): Promise<PaginatedResult<IPastPaper>> {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.subjectId) filter.subjectId = filters.subjectId;
    if (filters.gradeId) filter.gradeId = filters.gradeId;
    if (filters.year) filter.year = filters.year;

    const [data, total] = await Promise.all([
      PastPaper.find(filter)
        .populate('subjectId', 'name code')
        .populate('gradeId', 'name')
        .populate('uploadedBy', 'firstName lastName email')
        .sort('-year -term')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      PastPaper.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async deletePastPaper(id: string, schoolId: string): Promise<IPastPaper> {
    const paper = await PastPaper.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!paper) throw new NotFoundError('Past paper not found');
    return paper;
  }

  // ─── Subject Weighting CRUD ───────────────────────────────────────────────

  static async createSubjectWeighting(data: Partial<ISubjectWeighting>): Promise<ISubjectWeighting> {
    const weighting = new SubjectWeighting(data);
    return weighting.save();
  }

  static async listSubjectWeightings(
    schoolId: string,
    filters: { subjectId?: string; gradeId?: string; term?: number },
  ): Promise<ISubjectWeighting[]> {
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.subjectId) filter.subjectId = filters.subjectId;
    if (filters.gradeId) filter.gradeId = filters.gradeId;
    if (filters.term) filter.term = filters.term;

    return SubjectWeighting.find(filter)
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name')
      .lean()
      .exec();
  }

  static async updateSubjectWeighting(id: string, schoolId: string, data: Partial<ISubjectWeighting>): Promise<ISubjectWeighting> {
    const weighting = await SubjectWeighting.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('subjectId', 'name code').populate('gradeId', 'name');
    if (!weighting) throw new NotFoundError('Subject weighting not found');
    return weighting;
  }

  static async deleteSubjectWeighting(id: string, schoolId: string): Promise<ISubjectWeighting> {
    const weighting = await SubjectWeighting.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!weighting) throw new NotFoundError('Subject weighting not found');
    return weighting;
  }

  // ─── Remedial Tracking CRUD ───────────────────────────────────────────────

  static async createRemedial(data: Partial<IRemedialTracking>): Promise<IRemedialTracking> {
    const remedial = new RemedialTracking(data);
    return remedial.save();
  }

  static async listRemedials(
    schoolId: string,
    filters: { studentId?: string; subjectId?: string; status?: string },
    query: ListQuery,
  ): Promise<PaginatedResult<IRemedialTracking>> {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.studentId) filter.studentId = filters.studentId;
    if (filters.subjectId) filter.subjectId = filters.subjectId;
    if (filters.status) filter.status = filters.status;

    const [data, total] = await Promise.all([
      RemedialTracking.find(filter)
        .populate('studentId', 'admissionNumber userId gradeId classId')
        .populate('subjectId', 'name code')
        .sort('-identifiedDate')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      RemedialTracking.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getRemedialById(id: string, schoolId: string): Promise<IRemedialTracking> {
    const remedial = await RemedialTracking.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .populate('subjectId', 'name code')
      .lean();
    if (!remedial) throw new NotFoundError('Remedial record not found');
    return remedial;
  }

  static async updateRemedial(id: string, schoolId: string, data: Partial<IRemedialTracking>): Promise<IRemedialTracking> {
    const remedial = await RemedialTracking.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('studentId', 'admissionNumber userId gradeId classId').populate('subjectId', 'name code');
    if (!remedial) throw new NotFoundError('Remedial record not found');
    return remedial;
  }

  static async deleteRemedial(id: string, schoolId: string): Promise<IRemedialTracking> {
    const remedial = await RemedialTracking.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!remedial) throw new NotFoundError('Remedial record not found');
    return remedial;
  }

  // ─── LURITS Export ────────────────────────────────────────────────────────

  static async getLuritsExport(schoolId: string): Promise<Array<{
    admissionNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    grade: string;
    luritsNumber: string;
    saIdNumber: string;
    homeLanguage: string;
  }>> {
    const students = await Student.find({
      schoolId,
      isDeleted: false,
      enrollmentStatus: 'active',
    })
      .populate('userId', 'firstName lastName email')
      .populate('gradeId', 'name')
      .lean();

    return students.map((student) => {
      const user = getPopulated<PopulatedUser | undefined>(student.userId);
      const grade = getPopulated<PopulatedGrade | undefined>(student.gradeId);

      return {
        admissionNumber: student.admissionNumber || '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : '',
        gender: student.gender || '',
        grade: grade?.name || '',
        luritsNumber: student.luritsNumber || '',
        saIdNumber: student.saIdNumber || '',
        homeLanguage: student.homeLanguage || '',
      };
    });
  }
}
