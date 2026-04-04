import mongoose, { type AnyBulkWriteOperation } from 'mongoose';
import { Assessment, IAssessment, Mark, IMark, Subject } from '../model.js';
import { Student } from '../../Student/model.js';
import { NotFoundError, BadRequestError } from '../../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../../common/constants.js';
import { escapeRegex } from '../../../common/utils.js';
import type { PopulatedUser, PopulatedGrade, PopulatedAssessment } from '../../../types/populated.js';
import { getPopulated } from '../../../types/populated.js';

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

/** Minimum ratio of subjects a student must pass to be promoted. TODO: Move to school settings */
const PROMOTION_THRESHOLD = 0.5;

export class AssessmentService {
  // ─── Assessment CRUD ─────────────────────────────────────────────────────

  static async createAssessment(data: Partial<IAssessment>): Promise<IAssessment> {
    const assessment = new Assessment(data);
    return assessment.save();
  }

  static async listAssessments(
    filters: { schoolId: string; classId?: string; subjectId?: string; term?: number; academicYear?: number },
    query: ListQuery,
  ): Promise<PaginatedResult<IAssessment>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId: filters.schoolId, isDeleted: false };
    if (filters.classId) filter.classId = filters.classId;
    if (filters.subjectId) filter.subjectId = filters.subjectId;
    if (filters.term) filter.term = filters.term;
    if (filters.academicYear) filter.academicYear = filters.academicYear;

    if (query.search) {
      filter.name = new RegExp(escapeRegex(query.search), 'i');
    }

    const [data, total] = await Promise.all([
      Assessment.find(filter)
        .populate('subjectId', 'name code')
        .populate('classId', 'name gradeId')
        .populate('paperId', 'title')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Assessment.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getAssessmentById(id: string, schoolId: string): Promise<IAssessment> {
    const assessment = await Assessment.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('subjectId', 'name code')
      .populate('classId', 'name gradeId')
      .populate('paperId', 'title')
      .lean();
    if (!assessment) throw new NotFoundError('Assessment not found');
    return assessment;
  }

  static async updateAssessment(id: string, schoolId: string, data: Partial<IAssessment>): Promise<IAssessment> {
    const assessment = await Assessment.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('subjectId', 'name code')
      .populate('classId', 'name gradeId');
    if (!assessment) throw new NotFoundError('Assessment not found');
    return assessment;
  }

  static async deleteAssessment(id: string, schoolId: string): Promise<IAssessment> {
    const assessment = await Assessment.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
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
    const assessment = await Assessment.findById(assessmentId).lean();
    if (!assessment) throw new NotFoundError('Assessment not found');

    if (assessment.classId) {
      const classStudents = await Student.find({ classId: assessment.classId, schoolId, isDeleted: false }).select('_id').lean();
      const validStudentIds = new Set(classStudents.map((s) => s._id.toString()));

      for (const mark of marks) {
        if (!validStudentIds.has(mark.studentId.toString())) {
          throw new BadRequestError(`Student ${mark.studentId} is not in this class`);
        }
      }
    }

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

    await Mark.bulkWrite(operations as unknown as AnyBulkWriteOperation<IMark>[]);

    return Mark.find({
      assessmentId,
      studentId: { $in: marks.map((m) => m.studentId) },
      isDeleted: false,
    })
      .populate('studentId', 'admissionNumber userId gradeId classId')
      .lean()
      .exec();
  }

  static async getStudentMarks(
    studentId: string,
    schoolId: string,
    term?: number,
    academicYear?: number,
  ): Promise<IMark[]> {
    const markFilter: Record<string, unknown> = {
      studentId,
      schoolId,
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
      .lean()
      .exec();

    return marks.filter((m) => m.assessmentId !== null);
  }

  static async getAssessmentMarks(assessmentId: string, schoolId: string): Promise<IMark[]> {
    return Mark.find({ assessmentId, schoolId, isDeleted: false })
      .populate({
        path: 'studentId',
        populate: { path: 'userId', select: 'firstName lastName email' },
      })
      .lean()
      .exec();
  }

  // ─── Promotion Calculation ─────────────────────────────────────────────

  /**
   * Calculate promotion for a single student.
   * Accepts optional pre-fetched data to avoid redundant DB queries when called in batch.
   */
  static async calculatePromotion(
    studentId: string,
    year: number,
    prefetched?: {
      gradeId: mongoose.Types.ObjectId;
      schoolId: mongoose.Types.ObjectId;
      subjects: Array<{ _id: mongoose.Types.ObjectId; name: string; code: string }>;
      marks: IMark[];
    },
  ) {
    let gradeId: mongoose.Types.ObjectId;
    let schoolId: mongoose.Types.ObjectId;
    let subjects: Array<{ _id: mongoose.Types.ObjectId; name: string; code: string }>;
    let validMarks: IMark[];

    if (prefetched) {
      gradeId = prefetched.gradeId;
      schoolId = prefetched.schoolId;
      subjects = prefetched.subjects;
      validMarks = prefetched.marks;
    } else {
      const student = await Student.findOne({ _id: studentId, isDeleted: false }).populate('gradeId');
      if (!student) throw new NotFoundError('Student not found');

      gradeId = getPopulated<PopulatedGrade>(student.gradeId)._id ?? student.gradeId;
      schoolId = student.schoolId;

      subjects = await Subject.find({
        gradeIds: gradeId,
        schoolId,
        isDeleted: false,
      }).lean();

      const allMarks = await Mark.find({
        studentId: new mongoose.Types.ObjectId(studentId),
        isDeleted: false,
      }).populate({
        path: 'assessmentId',
        match: {
          academicYear: year,
          isDeleted: false,
        },
        select: 'subjectId academicYear',
      }).lean();

      validMarks = allMarks.filter((m) => m.assessmentId !== null);
    }

    const marksBySubject = new Map<string, typeof validMarks>();
    for (const m of validMarks) {
      const key = (getPopulated<PopulatedAssessment>(m.assessmentId).subjectId ?? '').toString();
      if (!marksBySubject.has(key)) marksBySubject.set(key, []);
      marksBySubject.get(key)!.push(m);
    }

    const results = [];

    for (const subject of subjects) {
      const subjectMarks = marksBySubject.get(subject._id.toString()) ?? [];
      const avgPercentage = subjectMarks.length > 0
        ? subjectMarks.reduce((sum, m) => sum + m.percentage, 0) / subjectMarks.length
        : 0;

      results.push({
        subjectId: subject._id,
        subjectName: subject.name,
        subjectCode: subject.code,
        averagePercentage: Math.round(avgPercentage * 100) / 100,
        assessmentCount: subjectMarks.length,
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
      promoted: passedSubjects >= Math.ceil(totalSubjects * PROMOTION_THRESHOLD),
      subjects: results,
    };
  }

  static async promotionReport(gradeId: string, year: number) {
    const students = await Student.find({
      gradeId,
      enrollmentStatus: 'active',
      isDeleted: false,
    }).populate('userId', 'firstName lastName').lean();

    // Fetch all data in bulk BEFORE the loop to avoid N+1 queries
    const studentIds = students.map((s) => s._id);
    const gradeObjectId = new mongoose.Types.ObjectId(gradeId);

    // Determine schoolId from first student (all students share the same school)
    const schoolId = students.length > 0 ? students[0].schoolId : null;

    const [allMarks, allSubjects] = await Promise.all([
      Mark.find({
        studentId: { $in: studentIds },
        isDeleted: false,
      }).populate({
        path: 'assessmentId',
        match: { academicYear: year, isDeleted: false },
        select: 'subjectId academicYear',
      }).lean(),
      schoolId
        ? Subject.find({ gradeIds: gradeObjectId, schoolId, isDeleted: false }).lean()
        : Promise.resolve([]),
    ]);

    // Group marks by student in memory
    const marksByStudent = new Map<string, IMark[]>();
    for (const mark of allMarks) {
      if (mark.assessmentId === null) continue; // populate didn't match
      const sid = mark.studentId.toString();
      if (!marksByStudent.has(sid)) marksByStudent.set(sid, []);
      marksByStudent.get(sid)!.push(mark);
    }

    // Calculate promotions without additional DB queries
    const results = [];
    for (const student of students) {
      const studentMarks = marksByStudent.get(student._id.toString()) ?? [];
      const promotion = await AssessmentService.calculatePromotion(
        student._id.toString(),
        year,
        {
          gradeId: gradeObjectId,
          schoolId: student.schoolId,
          subjects: allSubjects,
          marks: studentMarks,
        },
      );
      const user = getPopulated<PopulatedUser | undefined>(student.userId);
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
