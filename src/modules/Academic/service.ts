import mongoose from 'mongoose';
import {
  Grade,
  IGrade,
  Class,
  IClass,
  Subject,
  ISubject,
  Timetable,
  ITimetable,
  Assessment,
  IAssessment,
  Mark,
  IMark,
  Exam,
  IExam,
  ExamTimetable,
  IExamTimetable,
  PastPaper,
  IPastPaper,
  SubjectWeighting,
  ISubjectWeighting,
  RemedialTracking,
  IRemedialTracking,
} from './model.js';
import { Student } from '../Student/model.js';
import { NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

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

export class AcademicService {
  // ─── Grade CRUD ──────────────────────────────────────────────────────────

  static async createGrade(data: Partial<IGrade>): Promise<IGrade> {
    const grade = new Grade(data);
    return grade.save();
  }

  static async listGrades(
    schoolId: string,
    query: ListQuery,
  ): Promise<PaginatedResult<IGrade>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.search) {
      filter.name = new RegExp(query.search, 'i');
    }

    const [data, total] = await Promise.all([
      Grade.find(filter).sort(sortField).skip(skip).limit(limit).lean().exec(),
      Grade.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getGradeById(id: string): Promise<IGrade> {
    const grade = await Grade.findOne({ _id: id, isDeleted: false });
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  static async updateGrade(id: string, data: Partial<IGrade>): Promise<IGrade> {
    const grade = await Grade.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  static async deleteGrade(id: string): Promise<IGrade> {
    const grade = await Grade.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  // ─── Class CRUD ──────────────────────────────────────────────────────────

  static async createClass(data: Partial<IClass>): Promise<IClass> {
    const cls = new Class(data);
    return cls.save();
  }

  static async listClasses(
    filters: { schoolId?: string; gradeId?: string },
    query: ListQuery,
  ): Promise<PaginatedResult<IClass>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (filters.schoolId) filter.schoolId = filters.schoolId;
    if (filters.gradeId) filter.gradeId = filters.gradeId;

    if (query.search) {
      filter.name = new RegExp(query.search, 'i');
    }

    const [data, total] = await Promise.all([
      Class.find(filter)
        .populate('gradeId')
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Class.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getClassById(id: string): Promise<IClass> {
    const cls = await Class.findOne({ _id: id, isDeleted: false })
      .populate('gradeId')
      .populate('teacherId', 'firstName lastName email');
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  static async updateClass(id: string, data: Partial<IClass>): Promise<IClass> {
    const cls = await Class.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('gradeId')
      .populate('teacherId', 'firstName lastName email');
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  static async deleteClass(id: string): Promise<IClass> {
    const cls = await Class.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  // ─── Subject CRUD ────────────────────────────────────────────────────────

  static async createSubject(data: Partial<ISubject>): Promise<ISubject> {
    const subject = new Subject(data);
    return subject.save();
  }

  static async listSubjects(
    schoolId: string,
    query: ListQuery,
  ): Promise<PaginatedResult<ISubject>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.search) {
      filter.$or = [
        { name: new RegExp(query.search, 'i') },
        { code: new RegExp(query.search, 'i') },
      ];
    }

    const [data, total] = await Promise.all([
      Subject.find(filter)
        .populate('gradeIds')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Subject.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getSubjectById(id: string): Promise<ISubject> {
    const subject = await Subject.findOne({ _id: id, isDeleted: false })
      .populate('gradeIds');
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }

  static async updateSubject(id: string, data: Partial<ISubject>): Promise<ISubject> {
    const subject = await Subject.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('gradeIds');
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }

  static async deleteSubject(id: string): Promise<ISubject> {
    const subject = await Subject.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!subject) throw new NotFoundError('Subject not found');
    return subject;
  }

  // ─── Timetable CRUD ─────────────────────────────────────────────────────

  static async createTimetable(data: Partial<ITimetable>): Promise<ITimetable> {
    const entry = new Timetable(data);
    return entry.save();
  }

  static async listTimetable(
    filters: { schoolId?: string; classId?: string },
    query: ListQuery,
  ): Promise<PaginatedResult<ITimetable>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (filters.schoolId) filter.schoolId = filters.schoolId;
    if (filters.classId) filter.classId = filters.classId;

    const [data, total] = await Promise.all([
      Timetable.find(filter)
        .populate('classId')
        .populate('subjectId')
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

  static async getTimetableById(id: string): Promise<ITimetable> {
    const entry = await Timetable.findOne({ _id: id, isDeleted: false })
      .populate('classId')
      .populate('subjectId')
      .populate('teacherId', 'firstName lastName email');
    if (!entry) throw new NotFoundError('Timetable entry not found');
    return entry;
  }

  static async getByClass(classId: string): Promise<ITimetable[]> {
    return Timetable.find({ classId, isDeleted: false })
      .populate('subjectId')
      .populate('teacherId', 'firstName lastName email')
      .sort({ day: 1, period: 1 })
      .exec();
  }

  static async getByTeacher(teacherId: string): Promise<ITimetable[]> {
    return Timetable.find({ teacherId, isDeleted: false })
      .populate('classId')
      .populate('subjectId')
      .sort({ day: 1, period: 1 })
      .exec();
  }

  static async updateTimetable(id: string, data: Partial<ITimetable>): Promise<ITimetable> {
    const entry = await Timetable.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('classId')
      .populate('subjectId')
      .populate('teacherId', 'firstName lastName email');
    if (!entry) throw new NotFoundError('Timetable entry not found');
    return entry;
  }

  static async deleteTimetable(id: string): Promise<ITimetable> {
    const entry = await Timetable.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!entry) throw new NotFoundError('Timetable entry not found');
    return entry;
  }

  // ─── Assessment CRUD ─────────────────────────────────────────────────────

  static async createAssessment(data: Partial<IAssessment>): Promise<IAssessment> {
    const assessment = new Assessment(data);
    return assessment.save();
  }

  static async listAssessments(
    filters: { schoolId?: string; classId?: string; subjectId?: string; term?: number; academicYear?: number },
    query: ListQuery,
  ): Promise<PaginatedResult<IAssessment>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { isDeleted: false };
    if (filters.schoolId) filter.schoolId = filters.schoolId;
    if (filters.classId) filter.classId = filters.classId;
    if (filters.subjectId) filter.subjectId = filters.subjectId;
    if (filters.term) filter.term = filters.term;
    if (filters.academicYear) filter.academicYear = filters.academicYear;

    if (query.search) {
      filter.name = new RegExp(query.search, 'i');
    }

    const [data, total] = await Promise.all([
      Assessment.find(filter)
        .populate('subjectId')
        .populate('classId')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Assessment.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getAssessmentById(id: string): Promise<IAssessment> {
    const assessment = await Assessment.findOne({ _id: id, isDeleted: false })
      .populate('subjectId')
      .populate('classId');
    if (!assessment) throw new NotFoundError('Assessment not found');
    return assessment;
  }

  static async updateAssessment(id: string, data: Partial<IAssessment>): Promise<IAssessment> {
    const assessment = await Assessment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('subjectId')
      .populate('classId');
    if (!assessment) throw new NotFoundError('Assessment not found');
    return assessment;
  }

  static async deleteAssessment(id: string): Promise<IAssessment> {
    const assessment = await Assessment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!assessment) throw new NotFoundError('Assessment not found');
    return assessment;
  }

  // ─── Mark Operations ─────────────────────────────────────────────────────

  static async captureMark(data: {
    assessmentId: string;
    studentId: string;
    schoolId: string;
    mark: number;
    total: number;
    comment?: string;
  }): Promise<IMark> {
    const percentage = Math.round((data.mark / data.total) * 10000) / 100;

    const mark = await Mark.findOneAndUpdate(
      {
        assessmentId: data.assessmentId,
        studentId: data.studentId,
        isDeleted: false,
      },
      {
        $set: {
          ...data,
          percentage,
        },
      },
      { new: true, upsert: true, runValidators: true },
    );

    return mark;
  }

  static async bulkCaptureMarks(
    assessmentId: string,
    schoolId: string,
    marks: Array<{ studentId: string; mark: number; total: number; comment?: string }>,
  ): Promise<IMark[]> {
    const operations = marks.map((entry) => {
      const percentage = Math.round((entry.mark / entry.total) * 10000) / 100;
      return {
        updateOne: {
          filter: {
            assessmentId,
            studentId: entry.studentId,
            isDeleted: false,
          },
          update: {
            $set: {
              assessmentId,
              studentId: entry.studentId,
              schoolId,
              mark: entry.mark,
              total: entry.total,
              percentage,
              comment: entry.comment,
            },
          },
          upsert: true,
        },
      };
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await Mark.bulkWrite(operations as any);

    return Mark.find({
      assessmentId,
      studentId: { $in: marks.map((m) => m.studentId) },
      isDeleted: false,
    })
      .populate('studentId')
      .exec();
  }

  static async getStudentMarks(
    studentId: string,
    term?: number,
    academicYear?: number,
  ): Promise<IMark[]> {
    const markFilter: Record<string, unknown> = {
      studentId,
      isDeleted: false,
    };

    const marks = await Mark.find(markFilter)
      .populate({
        path: 'assessmentId',
        match: {
          isDeleted: false,
          ...(term !== undefined && { term }),
          ...(academicYear !== undefined && { academicYear }),
        },
        populate: [
          { path: 'subjectId', select: 'name code' },
          { path: 'classId', select: 'name' },
        ],
      })
      .exec();

    // Filter out marks where populated assessment is null (didn't match the filter)
    return marks.filter((m) => m.assessmentId !== null);
  }

  static async getAssessmentMarks(assessmentId: string): Promise<IMark[]> {
    return Mark.find({ assessmentId, isDeleted: false })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName email' },
      })
      .exec();
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
      .populate('gradeId', 'name');

    return students.map((student) => {
      const user = student.userId as any;
      const grade = student.gradeId as any;

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

  // ─── Exam CRUD ────────────────────────────────────────────────────────────

  static async createExam(data: Partial<IExam>): Promise<IExam> {
    const exam = new Exam(data);
    return exam.save();
  }

  static async listExams(schoolId: string, query: ListQuery): Promise<PaginatedResult<IExam>> {
    const { page, limit, skip, sortField } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.search) filter.name = new RegExp(query.search, 'i');

    const [data, total] = await Promise.all([
      Exam.find(filter).sort(sortField).skip(skip).limit(limit).lean().exec(),
      Exam.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getExamById(id: string): Promise<IExam> {
    const exam = await Exam.findOne({ _id: id, isDeleted: false });
    if (!exam) throw new NotFoundError('Exam not found');
    return exam;
  }

  static async updateExam(id: string, data: Partial<IExam>): Promise<IExam> {
    const exam = await Exam.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!exam) throw new NotFoundError('Exam not found');
    return exam;
  }

  static async deleteExam(id: string): Promise<IExam> {
    const exam = await Exam.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!exam) throw new NotFoundError('Exam not found');
    return exam;
  }

  // ─── Exam Timetable CRUD ─────────��──────────────────────────────���─────────

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
        .sort('date startTime')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ExamTimetable.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getExamTimetableById(id: string): Promise<IExamTimetable> {
    const entry = await ExamTimetable.findOne({ _id: id, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('gradeId', 'name')
      .populate('invigilator', 'firstName lastName email');
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

  // ─── Past Paper CRUD ──���────────────────────────────���──────────────────────

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

  static async deletePastPaper(id: string): Promise<IPastPaper> {
    const paper = await PastPaper.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!paper) throw new NotFoundError('Past paper not found');
    return paper;
  }

  // ─── Subject Weighting CRUD ────────────────��───────────────────────��──────

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

  static async updateSubjectWeighting(id: string, data: Partial<ISubjectWeighting>): Promise<ISubjectWeighting> {
    const weighting = await SubjectWeighting.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('subjectId', 'name code').populate('gradeId', 'name');
    if (!weighting) throw new NotFoundError('Subject weighting not found');
    return weighting;
  }

  static async deleteSubjectWeighting(id: string): Promise<ISubjectWeighting> {
    const weighting = await SubjectWeighting.findOneAndUpdate(
      { _id: id, isDeleted: false },
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
        .populate('studentId')
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

  static async getRemedialById(id: string): Promise<IRemedialTracking> {
    const remedial = await RemedialTracking.findOne({ _id: id, isDeleted: false })
      .populate('studentId')
      .populate('subjectId', 'name code');
    if (!remedial) throw new NotFoundError('Remedial record not found');
    return remedial;
  }

  static async updateRemedial(id: string, data: Partial<IRemedialTracking>): Promise<IRemedialTracking> {
    const remedial = await RemedialTracking.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    ).populate('studentId').populate('subjectId', 'name code');
    if (!remedial) throw new NotFoundError('Remedial record not found');
    return remedial;
  }

  static async deleteRemedial(id: string): Promise<IRemedialTracking> {
    const remedial = await RemedialTracking.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!remedial) throw new NotFoundError('Remedial record not found');
    return remedial;
  }

  // ─── Promotion Calculation ──────────────────────────��─────────────────────

  static async calculatePromotion(studentId: string, year: number) {
    const student = await Student.findOne({ _id: studentId, isDeleted: false }).populate('gradeId');
    if (!student) throw new NotFoundError('Student not found');

    const gradeId = (student.gradeId as any)._id ?? student.gradeId;
    const schoolId = student.schoolId;

    // Get all subjects for the student's grade
    const subjects = await Subject.find({
      gradeIds: gradeId,
      schoolId,
      isDeleted: false,
    }).lean();

    const results = [];

    for (const subject of subjects) {
      // Get all marks for this student in this subject for the year
      const marks = await Mark.find({
        studentId: new mongoose.Types.ObjectId(studentId),
        isDeleted: false,
      }).populate({
        path: 'assessmentId',
        match: {
          subjectId: subject._id,
          academicYear: year,
          isDeleted: false,
        },
      }).lean();

      const filteredMarks = marks.filter((m) => m.assessmentId !== null);
      const avgPercentage = filteredMarks.length > 0
        ? filteredMarks.reduce((sum, m) => sum + m.percentage, 0) / filteredMarks.length
        : 0;

      results.push({
        subjectId: subject._id,
        subjectName: subject.name,
        subjectCode: subject.code,
        averagePercentage: Math.round(avgPercentage * 100) / 100,
        assessmentCount: filteredMarks.length,
        passed: avgPercentage >= 50,
      });
    }

    const totalSubjects = results.length;
    const passedSubjects = results.filter((r) => r.passed).length;
    const overallAverage = totalSubjects > 0
      ? Math.round((results.reduce((sum, r) => sum + r.averagePercentage, 0) / totalSubjects) * 100) / 100
      : 0;

    return {
      studentId,
      year,
      gradeId,
      totalSubjects,
      passedSubjects,
      failedSubjects: totalSubjects - passedSubjects,
      overallAverage,
      promoted: passedSubjects >= Math.ceil(totalSubjects * 0.5),
      subjects: results,
    };
  }

  static async promotionReport(gradeId: string, year: number) {
    const students = await Student.find({
      gradeId,
      enrollmentStatus: 'active',
      isDeleted: false,
    }).populate('userId', 'firstName lastName').lean();

    const results = [];
    for (const student of students) {
      const promotion = await AcademicService.calculatePromotion(student._id.toString(), year);
      const user = student.userId as any;
      const { studentId: _sid, ...promotionData } = promotion;
      results.push({
        studentId: student._id,
        admissionNumber: student.admissionNumber,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        ...promotionData,
      });
    }

    const totalStudents = results.length;
    const promoted = results.filter((r) => r.promoted).length;

    return {
      gradeId,
      year,
      totalStudents,
      promoted,
      notPromoted: totalStudents - promoted,
      promotionRate: totalStudents > 0 ? Math.round((promoted / totalStudents) * 10000) / 100 : 0,
      students: results,
    };
  }
}
