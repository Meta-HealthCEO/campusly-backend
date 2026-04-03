import mongoose from 'mongoose';
import { AssessmentPaper, Question } from './model.js';
import type { IQuestion } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { ComplianceService } from './service-compliance.js';

interface SectionLike {
  questions: Array<{ questionId: mongoose.Types.ObjectId }>;
}

export async function collectPaperQuestions(
  sections: SectionLike[],
): Promise<IQuestion[]> {
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

export async function clonePaper(id: string, schoolId: string, userId: string) {
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

export async function checkCompliance(id: string, schoolId: string) {
  const oid = new mongoose.Types.ObjectId(id);
  const soid = new mongoose.Types.ObjectId(schoolId);

  const paper = await AssessmentPaper.findOne({
    _id: oid,
    schoolId: soid,
    isDeleted: false,
  }).lean();

  if (!paper) throw new NotFoundError('Assessment paper not found');

  const allQuestions = await collectPaperQuestions(paper.sections);
  if (allQuestions.length === 0) {
    throw new BadRequestError('Paper has no questions to check');
  }

  return ComplianceService.calculateCompliance(paper, allQuestions);
}
