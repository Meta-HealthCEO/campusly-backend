import { Question, IQuestion } from '../model.assessment.js';
import { GeneratedPaper } from '../../AITools/model.js';
import { NotFoundError } from '../../../common/errors.js';
import { paginationHelper, escapeRegex } from '../../../common/utils.js';

interface QuestionFilters {
  subjectId?: string;
  gradeLevel?: number;
  topicId?: string;
  difficulty?: string;
  cognitiveLevel?: string;
  questionType?: string;
  source?: string;
  search?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class QuestionService {
  static async listQuestions(
    schoolId: string,
    filters: QuestionFilters,
    page?: number,
    limit?: number,
  ): Promise<PaginatedResult<IQuestion>> {
    const { skip, limit: pageLimit } = paginationHelper(page, limit);
    const currentPage = Math.max(1, page ?? 1);

    const query: Record<string, unknown> = { schoolId, isDeleted: false };
    if (filters.subjectId) query.subjectId = filters.subjectId;
    if (filters.gradeLevel !== undefined) query.gradeLevel = filters.gradeLevel;
    if (filters.topicId) query.topicId = filters.topicId;
    if (filters.difficulty) query.difficulty = filters.difficulty;
    if (filters.cognitiveLevel) query.cognitiveLevel = filters.cognitiveLevel;
    if (filters.questionType) query.questionType = filters.questionType;
    if (filters.source) query.source = filters.source;
    if (filters.search) {
      const pattern = new RegExp(escapeRegex(filters.search), 'i');
      query.$or = [{ questionText: pattern }, { tags: pattern }];
    }

    const [data, total] = await Promise.all([
      Question.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean()
        .exec(),
      Question.countDocuments(query),
    ]);

    return {
      data: data as IQuestion[],
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages: Math.ceil(total / pageLimit),
    };
  }

  static async createQuestion(
    data: Record<string, unknown>,
    teacherId: string,
  ): Promise<IQuestion> {
    const question = new Question({ ...data, teacherId });
    return question.save();
  }

  static async getQuestion(id: string): Promise<IQuestion> {
    const question = await Question.findOne({ _id: id, isDeleted: false })
      .populate('topicId', 'name term')
      .populate('subjectId', 'name code')
      .lean()
      .exec();
    if (!question) throw new NotFoundError('Question not found');
    return question as IQuestion;
  }

  static async updateQuestion(
    id: string,
    data: Record<string, unknown>,
  ): Promise<IQuestion> {
    const question = await Question.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true },
    ).lean().exec();
    if (!question) throw new NotFoundError('Question not found');
    return question as IQuestion;
  }

  static async deleteQuestion(id: string): Promise<void> {
    const result = await Question.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
    );
    if (!result) throw new NotFoundError('Question not found');
  }

  static async importFromPaper(
    paperId: string,
    teacherId: string,
    schoolId: string,
    frameworkId: string,
  ): Promise<IQuestion[]> {
    const paper = await GeneratedPaper.findOne({ _id: paperId, isDeleted: false }).lean().exec();
    if (!paper) throw new NotFoundError('Paper not found');

    const questionDocs: Record<string, unknown>[] = [];
    for (const section of paper.sections) {
      for (const q of section.questions) {
        questionDocs.push({
          schoolId,
          teacherId,
          frameworkId,
          subjectId: paper.subject ?? undefined,
          gradeLevel: paper.grade,
          topicId: null,
          questionText: q.questionText,
          questionType: 'structured',
          marks: q.marks,
          difficulty: paper.difficulty === 'mixed' ? 'medium' : paper.difficulty,
          cognitiveLevel: 'knowledge',
          modelAnswer: q.modelAnswer,
          markingNotes: q.markingGuideline,
          images: [],
          options: [],
          tags: [paper.subject, paper.topic].filter(Boolean),
          source: 'imported',
        });
      }
    }

    if (questionDocs.length === 0) return [];
    const result = await Question.insertMany(questionDocs);
    return result as unknown as IQuestion[];
  }
}
