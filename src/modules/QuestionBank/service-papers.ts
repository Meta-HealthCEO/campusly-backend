import mongoose from 'mongoose';
import { AssessmentPaper, Question } from './model.js';
import type { IQuestion } from './model.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { ComplianceService } from './service-compliance.js';
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

    // Visibility: teacher sees own; HOD/admin see all school papers
    const reviewRoles = ['super_admin', 'school_admin', 'principal', 'hod'];
    if (!reviewRoles.includes(userRole)) {
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
        .select('-sections')
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

    // Teachers can only see own papers
    const reviewRoles = ['super_admin', 'school_admin', 'principal', 'hod'];
    if (!reviewRoles.includes(userRole)) {
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

    const update: Record<string, unknown> = {};
    if (data.title !== undefined) update.title = data.title;
    if (data.term !== undefined) update.term = data.term;
    if (data.year !== undefined) update.year = data.year;
    if (data.paperType !== undefined) update.paperType = data.paperType;
    if (data.duration !== undefined) update.duration = data.duration;
    if (data.instructions !== undefined) update.instructions = data.instructions;
    if (data.sections !== undefined) update.sections = data.sections;

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

    const isAdmin = ['super_admin', 'school_admin', 'principal'].includes(userRole);
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

  // ─── Question Management ─────────────────────────────────────────────────

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

    // Verify question exists
    const question = await Question.findOne({
      _id: new mongoose.Types.ObjectId(data.questionId),
      isDeleted: false,
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

    // Increment usage count
    await Question.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(data.questionId) },
      { $inc: { usageCount: 1 } },
    );

    // Recalculate compliance
    const allQuestions = await collectPaperQuestions(paper.sections);
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

    // Decrement usage count
    await Question.findOneAndUpdate(
      { _id: removed.questionId },
      { $inc: { usageCount: -1 } },
    );

    // Recalculate compliance
    const allQuestions = await collectPaperQuestions(paper.sections);
    if (allQuestions.length > 0) {
      paper.capsCompliance = await ComplianceService.calculateCompliance(paper, allQuestions);
    } else {
      paper.capsCompliance = null;
    }

    await paper.save();
    return paper.toObject();
  }

  // ─── Finalise ────────────────────────────────────────────────────────────

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

    // Must have at least one question
    const allQuestions = await collectPaperQuestions(paper.sections);
    if (allQuestions.length === 0) {
      throw new BadRequestError('Paper must have at least one question');
    }

    // Recalculate compliance
    const compliance = await ComplianceService.calculateCompliance(paper, allQuestions);

    // Verify total marks match
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

    return paper.toObject();
  }

  // ─── Clone ───────────────────────────────────────────────────────────────

  static async clonePaper(id: string, schoolId: string, userId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const source = await AssessmentPaper.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    }).lean();

    if (!source) throw new NotFoundError('Assessment paper not found');

    const clone = await AssessmentPaper.create({
      schoolId: soid,
      title: `${source.title} (Copy)`,
      subjectId: source.subjectId,
      gradeId: source.gradeId,
      term: source.term,
      year: source.year,
      paperType: source.paperType,
      totalMarks: source.totalMarks,
      duration: source.duration,
      sections: source.sections.map((s) => ({
        title: s.title,
        instructions: s.instructions,
        order: s.order,
        questions: s.questions.map((q) => ({
          questionId: q.questionId,
          questionNumber: q.questionNumber,
          marks: q.marks,
          order: q.order,
        })),
      })),
      instructions: source.instructions,
      capsCompliance: null,
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    return clone.toObject();
  }

  // ─── Compliance Check (standalone) ───────────────────────────────────────

  static async checkCompliance(id: string, schoolId: string, userId: string) {
    const oid = new mongoose.Types.ObjectId(id);
    const soid = new mongoose.Types.ObjectId(schoolId);

    const paper = await AssessmentPaper.findOne({
      _id: oid,
      schoolId: soid,
      isDeleted: false,
    });

    if (!paper) throw new NotFoundError('Assessment paper not found');

    const allQuestions = await collectPaperQuestions(paper.sections);
    if (allQuestions.length === 0) {
      throw new BadRequestError('Paper has no questions to check');
    }

    const compliance = await ComplianceService.calculateCompliance(paper, allQuestions);
    paper.capsCompliance = compliance;
    await paper.save();

    return compliance;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

interface SectionLike {
  questions: Array<{ questionId: mongoose.Types.ObjectId }>;
}

async function collectPaperQuestions(sections: SectionLike[]): Promise<IQuestion[]> {
  const questionIds = sections.flatMap((s) =>
    s.questions.map((q) => q.questionId),
  );

  if (questionIds.length === 0) return [];

  const questions = await Question.find({
    _id: { $in: questionIds },
    isDeleted: false,
  })
    .populate({ path: 'curriculumNodeId', select: 'title code type' })
    .lean();

  return questions as IQuestion[];
}
