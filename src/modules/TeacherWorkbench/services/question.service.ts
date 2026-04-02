import { Question, IQuestion } from '../model.assessment.js';
import type { QuestionType, Difficulty, CognitiveLevel } from '../model.js';
import { GeneratedPaper } from '../../AITools/model.js';
import { NotFoundError } from '../../../common/errors.js';
import { paginationHelper, escapeRegex } from '../../../common/utils.js';

// ─── Section metadata helpers ─────────────────────────────────────────────────

const MCQ_PATTERNS = /multiple.choice|mcq/i;
const ESSAY_PATTERNS = /essay|long.answer/i;
const TRUE_FALSE_PATTERNS = /true.false|true\/false/i;
const MATCHING_PATTERNS = /matching|match/i;
const FILL_BLANK_PATTERNS = /fill.in|fill.blank|cloze/i;
const SHORT_ANSWER_PATTERNS = /short.answer|brief/i;

function resolveSectionQuestionType(sectionType: string): QuestionType {
  if (MCQ_PATTERNS.test(sectionType)) return 'mcq';
  if (ESSAY_PATTERNS.test(sectionType)) return 'essay';
  if (TRUE_FALSE_PATTERNS.test(sectionType)) return 'true_false';
  if (MATCHING_PATTERNS.test(sectionType)) return 'matching';
  if (FILL_BLANK_PATTERNS.test(sectionType)) return 'fill_in_blank';
  if (SHORT_ANSWER_PATTERNS.test(sectionType)) return 'short_answer';
  return 'structured';
}

function resolveQuestionDifficulty(paperDifficulty: string, sectionType: string): Difficulty {
  const lower = sectionType.toLowerCase();
  if (lower.includes('easy')) return 'easy';
  if (lower.includes('hard') || lower.includes('challenge')) return 'hard';
  if (paperDifficulty === 'easy') return 'easy';
  if (paperDifficulty === 'hard') return 'hard';
  return 'medium';
}

function resolveCognitiveLevel(sectionType: string): CognitiveLevel {
  const lower = sectionType.toLowerCase();
  if (lower.includes('essay') || lower.includes('evaluation')) return 'evaluation';
  if (lower.includes('analysis') || lower.includes('analys')) return 'analysis';
  if (lower.includes('application') || lower.includes('apply')) return 'application';
  if (lower.includes('comprehension') || lower.includes('understand')) return 'comprehension';
  if (lower.includes('synthesis') || lower.includes('create')) return 'synthesis';
  return 'knowledge';
}

// ─── Filters / result types ───────────────────────────────────────────────────

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

  static async getQuestion(id: string, schoolId: string): Promise<IQuestion> {
    const question = await Question.findOne({ _id: id, schoolId, isDeleted: false })
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
    schoolId: string,
  ): Promise<IQuestion> {
    const question = await Question.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true },
    ).lean().exec();
    if (!question) throw new NotFoundError('Question not found');
    return question as IQuestion;
  }

  static async deleteQuestion(id: string, schoolId: string): Promise<void> {
    const result = await Question.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
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
      const questionType = resolveSectionQuestionType(section.questionType);
      const difficulty = resolveQuestionDifficulty(paper.difficulty, section.questionType);
      const cognitiveLevel = resolveCognitiveLevel(section.questionType);

      for (const q of section.questions) {
        questionDocs.push({
          schoolId,
          teacherId,
          frameworkId,
          subjectId: paper.subject ?? undefined,
          gradeLevel: paper.grade,
          topicId: null,
          questionText: q.questionText,
          questionType,
          marks: q.marks,
          difficulty,
          cognitiveLevel,
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
