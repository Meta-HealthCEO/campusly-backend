import mongoose from 'mongoose';
import { AssessmentPaper, Question } from './model.js';
import type { IQuestion, IPaperSection } from './model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { ComplianceService } from './service-compliance.js';

// Accept the canonical IPaperSection shape (Task 1). `questionId` may be
// null (inline question), so filter those out before querying the bank.
export type SectionLike = Pick<IPaperSection, 'questions'>;

export async function collectPaperQuestions(
  sections: SectionLike[],
  schoolId: string,
): Promise<IQuestion[]> {
  const questionIds = sections.flatMap((s) =>
    s.questions
      .map((q) => q.questionId)
      .filter((id): id is mongoose.Types.ObjectId => id !== null && id !== undefined),
  );

  if (questionIds.length === 0) return [];

  const soid = new mongoose.Types.ObjectId(schoolId);

  const questions = await Question.find({
    _id: { $in: questionIds },
    isDeleted: false,
    $or: [{ schoolId: null }, { schoolId: soid }],
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
        questionText: q.questionText,
        marks: q.marks,
        position: q.position,
        modelAnswer: q.modelAnswer,
        markingGuideline: q.markingGuideline,
        diagram: q.diagram,
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

  const allQuestions = await collectPaperQuestions(paper.sections, schoolId);
  if (allQuestions.length === 0) {
    throw new BadRequestError('Paper has no questions to check');
  }

  return ComplianceService.calculateCompliance(paper, allQuestions);
}
