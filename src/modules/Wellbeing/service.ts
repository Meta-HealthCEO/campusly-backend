import mongoose from 'mongoose';
import { WellbeingSurvey, SurveyResponse } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';
import type {
  CreateSurveyInput, UpdateSurveyInput, SubmitResponseInput,
} from './validation.js';

type StudentSurveyProfile = {
  _id: mongoose.Types.ObjectId;
  gradeId?: mongoose.Types.ObjectId | {
    _id?: mongoose.Types.ObjectId;
    name?: string;
    orderIndex?: number;
  };
};

function gradeTargetsFromStudent(student: StudentSurveyProfile): number[] {
  const grade = student.gradeId;
  if (!grade || grade instanceof mongoose.Types.ObjectId) return [];

  const targets = new Set<number>();
  if (typeof grade.orderIndex === 'number') targets.add(grade.orderIndex);

  const gradeNameMatch = typeof grade.name === 'string'
    ? grade.name.match(/\d+/)
    : null;
  if (gradeNameMatch?.[0]) targets.add(Number(gradeNameMatch[0]));

  return [...targets].filter((target) => Number.isFinite(target));
}

export class WellbeingService {
  // ─── Survey CRUD ───────────────────────────────────────────────────────

  static async listSurveys(schoolId: string) {
    const surveys = await WellbeingSurvey.find({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Attach response counts
    const surveyIds = surveys.map((s) => s._id);
    const counts = await SurveyResponse.aggregate([
      { $match: { surveyId: { $in: surveyIds }, isDeleted: false } },
      { $group: { _id: '$surveyId', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      counts.map((c: { _id: mongoose.Types.ObjectId; count: number }) =>
        [c._id.toString(), c.count]),
    );

    return surveys.map((s) => ({
      ...s,
      responseCount: countMap.get(s._id.toString()) ?? 0,
    }));
  }

  static async getSurvey(id: string, schoolId: string) {
    const survey = await WellbeingSurvey.findOne({
      _id: id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    })
      .populate('createdBy', 'firstName lastName')
      .lean();
    if (!survey) throw new NotFoundError('Survey not found');
    return survey;
  }

  static async createSurvey(schoolId: string, userId: string, data: CreateSurveyInput) {
    const survey = await WellbeingSurvey.create({
      ...data,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      createdBy: new mongoose.Types.ObjectId(userId),
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });
    logger.info({ surveyId: survey._id }, 'Wellbeing survey created');
    return survey.toObject();
  }

  static async updateSurvey(id: string, schoolId: string, data: UpdateSurveyInput) {
    const survey = await WellbeingSurvey.findOne({
      _id: id,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    });
    if (!survey) throw new NotFoundError('Survey not found');

    // Don't allow editing questions if responses exist
    if (data.questions) {
      const responseCount = await SurveyResponse.countDocuments({
        surveyId: survey._id, isDeleted: false,
      });
      if (responseCount > 0) {
        throw new BadRequestError('Cannot modify questions after responses have been submitted');
      }
    }

    const updateData: Record<string, unknown> = { ...data };
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);

    const updated = await WellbeingSurvey.findByIdAndUpdate(id, updateData, { new: true }).lean();
    return updated;
  }

  static async deleteSurvey(id: string, schoolId: string) {
    const survey = await WellbeingSurvey.findOneAndUpdate(
      { _id: id, schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false },
      { isDeleted: true },
      { new: true },
    ).lean();
    if (!survey) throw new NotFoundError('Survey not found');
    return survey;
  }

  // ─── Response Submission ───────────────────────────────────────────────

  static async getActiveSurveyForStudent(userId: string, schoolId: string) {
    const schoolObjectId = new mongoose.Types.ObjectId(schoolId);
    const { Student } = await import('../Student/model.js');
    const student = await Student.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      schoolId: schoolObjectId,
      enrollmentStatus: 'active',
      isDeleted: false,
    })
      .select('_id gradeId')
      .populate('gradeId', 'name orderIndex')
      .lean<StudentSurveyProfile | null>();

    if (!student) return null;

    const now = new Date();
    const filter: Record<string, unknown> = {
      schoolId: schoolObjectId,
      isDeleted: false,
      status: 'active',
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    const targetGrades = gradeTargetsFromStudent(student);
    if (targetGrades.length > 0) {
      filter.targetGrades = { $in: targetGrades };
    }

    const respondedSurveyIds = await SurveyResponse.distinct('surveyId', {
      schoolId: schoolObjectId,
      studentId: student._id,
      isDeleted: false,
    });
    if (respondedSurveyIds.length > 0) {
      filter._id = { $nin: respondedSurveyIds };
    }

    return WellbeingSurvey.findOne(filter)
      .sort({ startDate: -1, createdAt: -1 })
      .lean();
  }

  static async submitResponse(
    surveyId: string, schoolId: string,
    studentId: string | null, data: SubmitResponseInput,
  ) {
    const survey = await WellbeingSurvey.findOne({
      _id: surveyId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
      status: 'active',
    }).lean();
    if (!survey) throw new NotFoundError('Survey not found or not active');
    if (!survey.isAnonymous && !studentId) {
      throw new BadRequestError('Student profile is required for this survey');
    }

    // Check date range
    const now = new Date();
    if (now < survey.startDate || now > survey.endDate) {
      throw new BadRequestError('Survey is not currently accepting responses');
    }

    // Check duplicate if not anonymous
    if (studentId) {
      const existing = await SurveyResponse.findOne({
        surveyId: new mongoose.Types.ObjectId(surveyId),
        studentId: new mongoose.Types.ObjectId(studentId),
        isDeleted: false,
      }).lean();
      if (existing) throw new BadRequestError('You have already submitted a response');
    }

    const response = await SurveyResponse.create({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      surveyId: new mongoose.Types.ObjectId(surveyId),
      studentId: survey.isAnonymous ? null
        : (studentId ? new mongoose.Types.ObjectId(studentId) : null),
      answers: data.answers,
    });

    return response.toObject();
  }

  // ─── Aggregate Results ─────────────────────────────────────────────────

  static async getSurveyResults(surveyId: string, schoolId: string) {
    const survey = await WellbeingSurvey.findOne({
      _id: surveyId,
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();
    if (!survey) throw new NotFoundError('Survey not found');

    const responses = await SurveyResponse.find({
      surveyId: new mongoose.Types.ObjectId(surveyId),
      schoolId: new mongoose.Types.ObjectId(schoolId),
      isDeleted: false,
    }).lean();

    const responseCount = responses.length;
    const questions = survey.questions.map((q, idx) => {
      const answers = responses
        .map((r) => r.answers.find((a) => a.questionIndex === idx))
        .filter(Boolean);

      const result: Record<string, unknown> = {
        questionIndex: idx,
        text: q.text,
        type: q.type,
      };

      if (q.type === 'scale') {
        const nums = answers.map((a) => Number(a!.value)).filter((n) => !isNaN(n));
        result.averageScore = nums.length
          ? Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10
          : 0;
        const dist: Record<string, number> = {};
        nums.forEach((n) => { dist[String(n)] = (dist[String(n)] ?? 0) + 1; });
        result.distribution = dist;
      } else if (q.type === 'multiple_choice' || q.type === 'yes_no') {
        const dist: Record<string, number> = {};
        answers.forEach((a) => {
          const key = String(a!.value);
          dist[key] = (dist[key] ?? 0) + 1;
        });
        result.distribution = dist;
      } else if (q.type === 'text') {
        result.responseCount = answers.length;
        // Don't return text responses for anonymous surveys
        result.responses = survey.isAnonymous ? null : answers.map((a) => a!.value);
      }

      return result;
    });

    return { surveyId, title: survey.title, responseCount, questions };
  }
}
