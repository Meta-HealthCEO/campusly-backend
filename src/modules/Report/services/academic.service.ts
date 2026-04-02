import mongoose from 'mongoose';
import { Student } from '../../Student/model.js';
import { Invoice } from '../../Fee/model.js';
import { Attendance, Merit } from '../../Attendance/model.js';
import { Mark, Assessment } from '../../Academic/model.js';
import { Homework, HomeworkSubmission } from '../../Homework/model.js';
import { Wallet } from '../../Wallet/model.js';
import type { PopulatedSubject } from '../../../types/populated.js';
import { getPopulated } from '../../../types/populated.js';

export class AcademicReportService {
  static async getAttendanceReport(
    schoolId: string,
    startDate?: string,
    endDate?: string,
    gradeId?: string,
    classId?: string,
  ) {
    const match: Record<string, unknown> = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    };

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      match.date = dateFilter;
    }

    if (classId) {
      match.classId = new mongoose.Types.ObjectId(classId);
    }

    const results = await Attendance.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]);

    return results;
  }

  static async getAcademicPerformanceReport(
    schoolId: string,
    term?: number,
    academicYear?: number,
  ) {
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);
    const results = await Mark.aggregate([
      {
        $match: { schoolId: schoolObjId, isDeleted: false },
      },
      {
        $lookup: {
          from: 'assessments',
          localField: 'assessmentId',
          foreignField: '_id',
          as: 'assessment',
        },
      },
      { $unwind: '$assessment' },
      {
        $match: {
          'assessment.schoolId': schoolObjId,
          'assessment.isDeleted': false,
          ...(term ? { 'assessment.term': term } : {}),
          ...(academicYear ? { 'assessment.academicYear': academicYear } : {}),
        },
      },
      {
        $group: {
          _id: '$assessment.subjectId',
          averagePercentage: { $avg: '$percentage' },
          totalMarks: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'subjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subject',
        },
      },
      { $unwind: '$subject' },
      {
        $project: {
          _id: 0,
          subjectId: '$_id',
          subjectName: '$subject.name',
          subjectCode: '$subject.code',
          averagePercentage: { $round: ['$averagePercentage', 2] },
          totalMarks: 1,
        },
      },
      {
        $sort: { subjectName: 1 },
      },
    ]);

    return results;
  }

  static async getStudentReportCard(studentId: string, term: number, academicYear: number, schoolId?: string) {
    const markFilter: Record<string, unknown> = {
      studentId: new mongoose.Types.ObjectId(studentId),
      isDeleted: false,
    };
    const marks = await Mark.find(markFilter)
      .populate({
        path: 'assessmentId',
        match: { term, academicYear, isDeleted: false },
        populate: { path: 'subjectId', select: 'name code' },
      })
      .lean();

    const filteredMarks = marks.filter((m) => m.assessmentId !== null);

    return {
      studentId,
      term,
      academicYear,
      marks: filteredMarks,
    };
  }

  static async getStudentFullReport(studentId: string, schoolId?: string) {
    const studentObjId = new mongoose.Types.ObjectId(studentId);
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const studentFilter: Record<string, unknown> = { _id: studentObjId, isDeleted: false };
    if (schoolId) studentFilter.schoolId = new mongoose.Types.ObjectId(schoolId);

    const [student, marks, attendanceStats, behaviourStats, walletInfo, homeworkStats] = await Promise.all([
      Student.findOne(studentFilter)
        .populate('userId', 'firstName lastName email')
        .populate('gradeId', 'name')
        .populate('classId', 'name')
        .lean(),

      Mark.find({ studentId: studentObjId, isDeleted: false })
        .populate({ path: 'assessmentId', match: { isDeleted: false }, populate: { path: 'subjectId', select: 'name code' } })
        .lean(),

      Attendance.aggregate([
        { $match: { studentId: studentObjId, date: { $gte: startOfYear }, isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Merit.aggregate([
        { $match: { studentId: studentObjId, isDeleted: false } },
        { $group: { _id: '$type', totalPoints: { $sum: '$points' }, count: { $sum: 1 } } },
      ]),

      Wallet.findOne({ studentId: studentObjId, isDeleted: false }).select('balance').lean(),

      HomeworkSubmission.aggregate([
        { $match: { studentId: studentObjId, isDeleted: false } },
        { $group: { _id: null, total: { $sum: 1 }, graded: { $sum: { $cond: [{ $ne: ['$mark', null] }, 1, 0] } } } },
      ]),
    ]);

    const filteredMarks = marks.filter((m) => m.assessmentId !== null);
    const attendanceMap = Object.fromEntries(attendanceStats.map((a) => [a._id, a.count]));
    const totalAttendance = attendanceStats.reduce((sum, a) => sum + a.count, 0);
    const presentCount = (attendanceMap['present'] ?? 0) + (attendanceMap['late'] ?? 0);

    const meritData = behaviourStats.find((b) => b._id === 'merit');
    const demeritData = behaviourStats.find((b) => b._id === 'demerit');
    const hwStats = homeworkStats.length > 0 ? homeworkStats[0] : { total: 0, graded: 0 };

    return {
      student,
      grades: filteredMarks,
      attendance: {
        present: attendanceMap['present'] ?? 0,
        absent: attendanceMap['absent'] ?? 0,
        late: attendanceMap['late'] ?? 0,
        excused: attendanceMap['excused'] ?? 0,
        total: totalAttendance,
        attendanceRate: totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 10000) / 100 : 0,
      },
      behaviour: {
        meritPoints: meritData?.totalPoints ?? 0,
        meritCount: meritData?.count ?? 0,
        demeritPoints: demeritData?.totalPoints ?? 0,
        demeritCount: demeritData?.count ?? 0,
        netPoints: (meritData?.totalPoints ?? 0) - (demeritData?.totalPoints ?? 0),
      },
      wallet: { balance: walletInfo?.balance ?? 0 },
      homework: {
        totalSubmissions: hwStats.total,
        graded: hwStats.graded,
      },
    };
  }

  static async getClassPerformance(classId: string, schoolId?: string) {
    const classObjId = new mongoose.Types.ObjectId(classId);

    const studentFilter: Record<string, unknown> = { classId: classObjId, enrollmentStatus: 'active', isDeleted: false };
    if (schoolId) studentFilter.schoolId = new mongoose.Types.ObjectId(schoolId);

    const students = await Student.find(studentFilter)
      .populate('userId', 'firstName lastName')
      .lean();

    const assessmentFilter: Record<string, unknown> = { classId: classObjId, isDeleted: false };
    if (schoolId) assessmentFilter.schoolId = new mongoose.Types.ObjectId(schoolId);

    const assessments = await Assessment.find(assessmentFilter)
      .populate('subjectId', 'name code')
      .lean();

    const marks = await Mark.find({
      assessmentId: { $in: assessments.map((a) => a._id) },
      isDeleted: false,
    }).lean();

    const subjectAverages: Record<string, { name: string; total: number; count: number }> = {};
    for (const mark of marks) {
      const assessment = assessments.find((a) => a._id.toString() === mark.assessmentId.toString());
      if (!assessment) continue;
      const subjectId = assessment.subjectId._id?.toString() ?? assessment.subjectId.toString();
      if (!subjectAverages[subjectId]) {
        subjectAverages[subjectId] = { name: getPopulated<PopulatedSubject>(assessment.subjectId).name ?? '', total: 0, count: 0 };
      }
      subjectAverages[subjectId].total += mark.percentage;
      subjectAverages[subjectId].count += 1;
    }

    const subjects = Object.entries(subjectAverages).map(([id, data]) => ({
      subjectId: id,
      subjectName: data.name,
      averagePercentage: Math.round((data.total / data.count) * 100) / 100,
      totalMarks: data.count,
    }));

    return {
      classId,
      totalStudents: students.length,
      totalAssessments: assessments.length,
      subjects,
    };
  }

  static async getSubjectPerformance(schoolId: string, term?: number, academicYear?: number, page = 1, limit = 50) {
    const schoolObjId = new mongoose.Types.ObjectId(schoolId);
    const skip = (page - 1) * limit;

    const matchStage: Record<string, unknown> = {
      'assessment.schoolId': schoolObjId,
      'assessment.isDeleted': false,
    };
    if (term) matchStage['assessment.term'] = term;
    if (academicYear) matchStage['assessment.academicYear'] = academicYear;

    const pipeline = [
      { $match: { isDeleted: false } },
      { $lookup: { from: 'assessments', localField: 'assessmentId', foreignField: '_id', as: 'assessment' } },
      { $unwind: '$assessment' },
      { $match: matchStage },
      { $lookup: { from: 'subjects', localField: 'assessment.subjectId', foreignField: '_id', as: 'subject' } },
      { $unwind: '$subject' },
      { $lookup: { from: 'classes', localField: 'assessment.classId', foreignField: '_id', as: 'class' } },
      { $unwind: '$class' },
      { $lookup: { from: 'grades', localField: 'class.gradeId', foreignField: '_id', as: 'grade' } },
      { $unwind: '$grade' },
      {
        $group: {
          _id: { subjectId: '$subject._id', gradeName: '$grade.name' },
          subjectName: { $first: '$subject.name' },
          subjectCode: { $first: '$subject.code' },
          averagePercentage: { $avg: '$percentage' },
          totalMarks: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          subjectId: '$_id.subjectId',
          gradeName: '$_id.gradeName',
          subjectName: 1,
          subjectCode: 1,
          averagePercentage: { $round: ['$averagePercentage', 2] },
          totalMarks: 1,
        },
      },
      { $sort: { subjectName: 1 as const, gradeName: 1 as const } },
    ];

    const [results, countResult] = await Promise.all([
      Mark.aggregate([...pipeline, { $skip: skip }, { $limit: limit }]),
      Mark.aggregate([...pipeline, { $count: 'total' }]),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
      data: results,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
