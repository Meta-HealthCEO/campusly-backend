import mongoose from 'mongoose';
import { AssessmentPaper, Question } from './model.js';
import { Assessment } from '../Academic/model.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { ComplianceService } from './service-compliance.js';
import {
  collectPaperQuestions,
  clonePaper as clonePaperHelper,
  checkCompliance as checkComplianceHelper,
} from './service-papers-helpers.js';
import type {
  CreatePaperInput,
  UpdatePaperInput,
  AddQuestionInput,
  PaperQueryInput,
} from './validation.js';

const POPULATE_LIST = [
  { path: 'subjectId', select: 'name' },
  { path: 'gradeId', select: 'name level' },
  { path: 'createdBy', select: 'firstName lastName email' },
];

const POPULATE_DETAIL = [
  ...POPULATE_LIST,
  { path: 'sections.questions.questionId' },
];

const REVIEW_ROLES = ['super_admin', 'school_admin', 'principal', 'hod'];
const ADMIN_ROLES = ['super_admin', 'school_admin', 'principal'];

export class PapersService {
  static async listPapers(
    schoolId: string,
    userId: string,
    userRole: string,
    filters: PaperQueryInput,
  ) {
    const soid = new mongoose.Types.ObjectId(schoolId);
    const uoid = new mongoose.Types.ObjectId(userId);
    const query: Record<string, unknown> = { schoolId: soid, isDeleted: false };
    if (!REVIEW_ROLES.includes(userRole)) {
      query.createdBy = uoid;
    }

    if (filters.subjectId) {
      query.subjectId = new mongoose.Types.ObjectId(filters.subjectId);
    }
    if (filters.gradeId) {
      query.gradeId = new mongoose.Types.ObjectId(filters.gradeId);
    }
    if (filters.status) query.status = filters.status;
    if (filters.paperType) query.paperType = filters.paperType;
    if (filters.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }

    const { skip, limit } = paginationHelper(filters.page, filters.limit);

    const [papers, total] = await Promise.all([
      AssessmentPaper.find(query)
        .populate(POPULATE_LIST)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AssessmentPaper.countDocuments(query),
    ]);

    return { papers, total, page: filters.page ?? 1, limit };
  }

  static async getPaper(id: string, schoolId: string, userId: string, userRole: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const query: Record<string, unknown> = {
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    };
    if (!REVIEW_ROLES.includes(userRole)) {
      query.createdBy = new mongoose.Types.ObjectId(userId);
    }

    const paper = await AssessmentPaper.findOne(query)
      .populate(POPULATE_DETAIL)
      .lean();

    if (!paper) throw new NotFoundError('Assessment paper not found');
    return paper;
  }

  static async createPaper(
    schoolId: string,
    userId: string,
    data: CreatePaperInput,
  ) {
    const paper = await AssessmentPaper.create({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      title: data.title,
      subjectId: new mongoose.Types.ObjectId(data.subjectId),
      gradeId: new mongoose.Types.ObjectId(data.gradeId),
      term: data.term,
      year: data.year,
      paperType: data.paperType,
      totalMarks: 0,
      duration: data.duration,
      sections: data.sections.map((s, i) => ({
        title: s.title,
        instructions: s.instructions,
        order: s.order ?? i,
        questions: [],
      })),
      instructions: data.instructions,
      capsCompliance: null,
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return paper.toObject();
  }

  static async updatePaper(
    id: string,
    schoolId: string,
    userId: string,
    data: UpdatePaperInput,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const paper = await AssessmentPaper.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!paper) throw new NotFoundError('Assessment paper not found');
    if (paper.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only the creator can edit this paper');
    }
    if (paper.status !== 'draft') {
      throw new ForbiddenError('Only draft papers can be edited');
    }

    const fields = ['title', 'term', 'year', 'paperType', 'duration', 'instructions', 'sections'] as const;
    const update: Record<string, unknown> = {};
    for (const key of fields) {
      if (data[key] !== undefined) update[key] = data[key];
    }

    const updated = await AssessmentPaper.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: update },
      { new: true },
    )
      .populate(POPULATE_DETAIL)
      .lean();

    return updated;
  }

  static async deletePaper(
    id: string,
    schoolId: string,
    userId: string,
    userRole: string,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const paper = await AssessmentPaper.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!paper) throw new NotFoundError('Assessment paper not found');

    const isAdmin = ADMIN_ROLES.includes(userRole);
    const isCreator = paper.createdBy.toString() === userId;
    if (!isAdmin && !isCreator) {
      throw new ForbiddenError('Only the creator or an admin can delete this paper');
    }

    await AssessmentPaper.findOneAndUpdate(
      { _id: oid, schoolId: soid, isDeleted: false },
      { $set: { isDeleted: true } },
    );

    return { deleted: true };
  }

  static async addQuestion(
    id: string,
    schoolId: string,
    userId: string,
    data: AddQuestionInput,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const paper = await AssessmentPaper.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    });

    if (!paper) throw new NotFoundError('Assessment paper not found');
    if (paper.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only the creator can modify this paper');
    }
    if (paper.status !== 'draft') {
      throw new ForbiddenError('Only draft papers can be modified');
    }
    if (data.sectionIndex >= paper.sections.length) {
      throw new BadRequestError('Invalid section index');
    }

    // Verify question exists and is accessible to this school
    const uid = new mongoose.Types.ObjectId(userId);
    const question = await Question.findOne({
      _id: new mongoose.Types.ObjectId(data.questionId),
      isDeleted: false,
      $or: [
        { schoolId: null, status: 'approved' },
        { schoolId: soid, status: 'approved' },
        { schoolId: soid, createdBy: uid },
      ],
    }).lean();

    if (!question) throw new NotFoundError('Question not found');

    const section = paper.sections[data.sectionIndex];
    const order = section.questions.length;

    section.questions.push({
      questionId: new mongoose.Types.ObjectId(data.questionId),
      questionNumber: data.questionNumber,
      marks: data.marks,
      order,
    });

    paper.totalMarks += data.marks;
    await Question.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(data.questionId) },
      { $inc: { usageCount: 1 } },
    );

    const allQuestions = await collectPaperQuestions(paper.sections, schoolId);
    paper.capsCompliance = await ComplianceService.calculateCompliance(paper, allQuestions);

    await paper.save();
    return paper.toObject();
  }

  static async removeQuestion(
    id: string,
    schoolId: string,
    userId: string,
    sectionIndex: number,
    questionIndex: number,
  ) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const paper = await AssessmentPaper.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    });

    if (!paper) throw new NotFoundError('Assessment paper not found');
    if (paper.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only the creator can modify this paper');
    }
    if (paper.status !== 'draft') {
      throw new ForbiddenError('Only draft papers can be modified');
    }
    if (sectionIndex >= paper.sections.length) {
      throw new BadRequestError('Invalid section index');
    }

    const section = paper.sections[sectionIndex];
    if (questionIndex >= section.questions.length) {
      throw new BadRequestError('Invalid question index');
    }

    const removed = section.questions.splice(questionIndex, 1)[0];
    paper.totalMarks -= removed.marks;
    await Question.findOneAndUpdate(
      { _id: removed.questionId },
      { $inc: { usageCount: -1 } },
    );

    const allQuestions = await collectPaperQuestions(paper.sections, schoolId);
    if (allQuestions.length > 0) {
      paper.capsCompliance = await ComplianceService.calculateCompliance(paper, allQuestions);
    } else {
      paper.capsCompliance = null;
    }

    await paper.save();
    return paper.toObject();
  }

  static async finalisePaper(id: string, schoolId: string, userId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const paper = await AssessmentPaper.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    });

    if (!paper) throw new NotFoundError('Assessment paper not found');
    if (paper.createdBy.toString() !== userId) {
      throw new ForbiddenError('Only the creator can finalise this paper');
    }
    if (paper.status !== 'draft') {
      throw new BadRequestError('Only draft papers can be finalised');
    }

    const allQuestions = await collectPaperQuestions(paper.sections, schoolId);
    if (allQuestions.length === 0) {
      throw new BadRequestError('Paper must have at least one question');
    }

    const compliance = await ComplianceService.calculateCompliance(paper, allQuestions);
    const calculatedTotal = allQuestions.reduce((sum, q) => sum + q.marks, 0);
    if (calculatedTotal !== paper.totalMarks) {
      throw new BadRequestError(
        `Total marks mismatch: paper says ${paper.totalMarks}, sections total ${calculatedTotal}`,
      );
    }

    if (!compliance.compliant) {
      throw new BadRequestError(
        `Paper is not CAPS compliant: ${compliance.violations.join('; ')}`,
      );
    }

    paper.capsCompliance = compliance;
    paper.status = 'finalised';
    await paper.save();

    // Auto-create a linked Assessment record (idempotent — skip if one already exists)
    const existing = await Assessment.findOne({ paperId: paper._id, isDeleted: false }).lean();
    if (!existing) {
      const PAPER_TYPE_TO_ASSESSMENT_TYPE: Record<string, 'test' | 'exam' | 'assignment'> = {
        class_test: 'test',
        assignment: 'assignment',
        mid_year: 'exam',
        trial: 'exam',
        final: 'exam',
        custom: 'test',
      };
      const assessmentType = PAPER_TYPE_TO_ASSESSMENT_TYPE[paper.paperType] ?? 'test';

      const now = new Date();
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      const d = String(now.getDate()).padStart(2, '0');
      const todayDate = new Date(`${y}-${m}-${d}`);

      await Assessment.create({
        name: paper.title,
        subjectId: paper.subjectId,
        classId: null,
        schoolId: paper.schoolId,
        type: assessmentType,
        totalMarks: paper.totalMarks,
        weight: 0,
        term: paper.term,
        academicYear: paper.year,
        date: todayDate,
        paperId: paper._id,
      });
    }

    return paper.toObject();
  }

  static clonePaper(id: string, schoolId: string, userId: string) {
    return clonePaperHelper(id, schoolId, userId);
  }

  static checkCompliance(id: string, schoolId: string) {
    return checkComplianceHelper(id, schoolId);
  }
}
