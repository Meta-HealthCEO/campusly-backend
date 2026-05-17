import mongoose from 'mongoose';
import { Homework, IHomework, HomeworkSubmission, IHomeworkSubmission, IHomeworkSubmissionBase } from './model.js';
import { Lesson } from '../Lesson/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';
import { escapeRegex } from '../../common/utils.js';
import { generateComprehensionQuestions } from './service-homework-comprehension.js';
import { gradeSubmissionAsync } from './service-homework-grading-runner.js';
import { Question } from '../QuestionBank/model.js';
import { Quiz } from '../Learning/model.js';
import { ContentResource } from '../ContentLibrary/model.js';
import { Subject } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { resolveAcademicFilterIds } from '../Academic/services/global-academic-lookup.js';
import { logger } from '../../common/logger.js';
import { submitHomework as _submitHomework } from './service-homework-submit.js';
import type { CreateHomeworkInput, SubmitHomeworkInput } from './validation.js';
import {
  assertCanUseClass,
  assertSubjectBelongsToSchool,
  canManageAllHomework,
  homeworkAccessFilter,
  isHomeworkActor,
  schoolIdFromScope,
  schoolObjectId,
  teacherOwnerFilter,
  toObjectId,
  type HomeworkActor,
  type HomeworkScope,
} from './service-access.js';

export type IHomeworkWithSourceLesson = IHomework & {
  sourceLesson: { id: string; title: string } | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function readId(value: unknown): string {
  if (!value) return '';
  if (value instanceof mongoose.Types.ObjectId) return value.toString();
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    return readId(record._id ?? record.id);
  }
  return String(value);
}

async function attachSubjectRefs(records: Array<Record<string, unknown>>): Promise<void> {
  const ids = Array.from(new Set(records.map((record) => readId(record.subjectId)).filter(Boolean)));
  if (ids.length === 0) return;

  const objectIds = ids.map((id) => toObjectId(id, 'subjectId'));
  const subjects = await Subject.find({ _id: { $in: objectIds }, isDeleted: false })
    .select('_id name code')
    .lean<Array<{ _id: mongoose.Types.ObjectId; name: string; code?: string }>>();

  const subjectMap = new Map<string, Record<string, unknown>>();
  for (const subject of subjects) {
    const id = subject._id.toString();
    subjectMap.set(id, {
      _id: id,
      id,
      name: subject.name,
      code: subject.code ?? '',
    });
  }

  const missingIds = ids.filter((id) => !subjectMap.has(id));
  if (missingIds.length > 0) {
    const nodes = await CurriculumNode.find({
      _id: { $in: missingIds.map((id) => toObjectId(id, 'subjectId')) },
      type: 'subject',
      isDeleted: false,
    })
      .select('_id title code')
      .lean<Array<{ _id: mongoose.Types.ObjectId; title: string; code?: string }>>();

    for (const node of nodes) {
      const id = node._id.toString();
      subjectMap.set(id, {
        _id: id,
        id,
        name: node.title,
        code: node.code ?? '',
      });
    }
  }

  for (const record of records) {
    const id = readId(record.subjectId);
    const resolved = subjectMap.get(id);
    if (resolved) record.subjectId = resolved;
  }
}

function sanitizeQuestion(raw: unknown): Record<string, unknown> {
  const q = asRecord(raw);
  const id = readId(q._id ?? q.id);
  const options = Array.isArray(q.options)
    ? q.options.map((opt) => {
        const option = asRecord(opt);
        return {
          label: typeof option.label === 'string' ? option.label : '',
          text: typeof option.text === 'string' ? option.text : '',
        };
      })
    : [];

  return {
    _id: id,
    id,
    type: q.type,
    stem: q.stem,
    media: Array.isArray(q.media) ? q.media : [],
    diagram: q.diagram ?? null,
    options,
    marks: q.marks,
  };
}

function sanitizeQuiz(raw: unknown): Record<string, unknown> | null {
  const quiz = asRecord(raw);
  const id = readId(quiz._id ?? quiz.id);
  if (!id) return null;

  const questions = Array.isArray(quiz.questions)
    ? quiz.questions.map((rawQuestion) => {
        const question = asRecord(rawQuestion);
        const options = Array.isArray(question.options)
          ? question.options.map((opt) => {
              const option = asRecord(opt);
              return { text: typeof option.text === 'string' ? option.text : '' };
            })
          : [];
        return {
          questionText: question.questionText,
          questionType: question.questionType,
          options,
          points: question.points,
        };
      })
    : [];

  return {
    _id: id,
    id,
    title: quiz.title,
    totalPoints: quiz.totalPoints,
    shuffleQuestions: quiz.shuffleQuestions,
    questions,
  };
}

// IHomeworkSubmission is re-exported for consumers of this module
export type { IHomeworkSubmission };

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  classId?: string;
  subjectId?: string;
  teacherId?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type CreateHomeworkData = CreateHomeworkInput & { schoolId: string };
type ResolvedCreatePayload = {
  type: 'quiz' | 'reading' | 'exercise';
  title: string;
  subjectId: string;
  classId: string;
  schoolId: string;
  dueDate: string;
  totalMarks: number;
  attachments?: string[];
  latePolicy: 'block' | 'penalty' | 'accept';
  latePenaltyPercent?: number;
  gradebookAutoPublish: boolean;
  quizId?: string;
  contentResourceId?: string;
  pageRange?: string;
  exerciseQuestionIds?: mongoose.Types.ObjectId[];
  comprehensionQuestionIds?: mongoose.Types.ObjectId[];
};

function uniqueObjectIds(ids: string[], label: string): mongoose.Types.ObjectId[] {
  const seen = new Set<string>();
  const out: mongoose.Types.ObjectId[] = [];
  for (const id of ids) {
    const oid = toObjectId(id, label);
    const key = oid.toString();
    if (seen.has(key)) throw new BadRequestError(`${label} must not contain duplicate ids`);
    seen.add(key);
    out.push(oid);
  }
  return out;
}

async function loadAssignableQuestions(args: {
  ids: string[];
  label: string;
  schoolId: string;
  teacherId: string;
  subjectId: string;
  gradeId: mongoose.Types.ObjectId;
}) {
  const oids = uniqueObjectIds(args.ids, args.label);
  const { subjectIds, gradeIds } = await resolveAcademicFilterIds({
    subjectId: args.subjectId,
    gradeId: args.gradeId.toString(),
  });
  const questions = await Question.find({
    _id: { $in: oids },
    isDeleted: false,
    subjectId: { $in: subjectIds ?? [toObjectId(args.subjectId, 'subjectId')] },
    gradeId: { $in: gradeIds ?? [args.gradeId] },
    $or: [
      { schoolId: null, status: 'approved' },
      { schoolId: toObjectId(args.schoolId, 'schoolId'), status: 'approved' },
    ],
  }).lean<Array<{ _id: mongoose.Types.ObjectId; marks: number }>>();

  if (questions.length !== oids.length) {
    throw new BadRequestError(`${args.label} contains unavailable questions`);
  }

  const byId = new Map(questions.map((q) => [q._id.toString(), q]));
  return oids.map((id) => {
    const question = byId.get(id.toString());
    if (!question) throw new BadRequestError(`${args.label} contains unavailable questions`);
    return question;
  });
}

async function validateReadingResource(args: {
  contentResourceId: string;
  schoolId: string;
  teacherId: string;
  subjectId: string;
  gradeId: mongoose.Types.ObjectId;
}): Promise<void> {
  const { subjectIds, gradeIds } = await resolveAcademicFilterIds({
    subjectId: args.subjectId,
    gradeId: args.gradeId.toString(),
  });
  const resource = await ContentResource.findOne({
    _id: toObjectId(args.contentResourceId, 'contentResourceId'),
    isDeleted: false,
    subjectId: { $in: subjectIds ?? [toObjectId(args.subjectId, 'subjectId')] },
    gradeId: { $in: gradeIds ?? [args.gradeId] },
    $or: [
      { schoolId: null, status: 'approved' },
      { schoolId: toObjectId(args.schoolId, 'schoolId'), status: 'approved' },
    ],
  }).select('_id').lean();
  if (!resource) throw new BadRequestError('Content resource is not available for this homework');
}

async function resolveCreatePayload(
  data: CreateHomeworkData,
  teacherId: string,
  scope: HomeworkScope,
): Promise<ResolvedCreatePayload> {
  await assertSubjectBelongsToSchool(scope, data.subjectId);
  const { gradeId } = await assertCanUseClass(scope, data.classId, data.subjectId);
  const schoolId = schoolIdFromScope(scope);

  if (data.type === 'quiz') {
    const quiz = await Quiz.findOne({
      _id: toObjectId(data.quizId, 'quizId'),
      schoolId: schoolObjectId(scope),
      classId: toObjectId(data.classId, 'classId'),
      subjectId: toObjectId(data.subjectId, 'subjectId'),
      isDeleted: false,
      ...teacherOwnerFilter(scope),
    }).select('_id status totalPoints').lean<{ _id: mongoose.Types.ObjectId; status: string; totalPoints: number } | null>();
    if (!quiz) throw new BadRequestError('Quiz is not available for this homework');
    if (quiz.status !== 'published') throw new BadRequestError('Only published quizzes can be assigned as homework');
    return { ...data, totalMarks: quiz.totalPoints };
  }

  if (data.type === 'exercise') {
    const questions = await loadAssignableQuestions({
      ids: data.exerciseQuestionIds,
      label: 'exerciseQuestionIds',
      schoolId,
      teacherId,
      subjectId: data.subjectId,
      gradeId,
    });
    return {
      ...data,
      exerciseQuestionIds: questions.map((q) => q._id),
      totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    };
  }

  await validateReadingResource({
    contentResourceId: data.contentResourceId,
    schoolId,
    teacherId,
    subjectId: data.subjectId,
    gradeId,
  });

  let comprehensionIds: mongoose.Types.ObjectId[];
  if (data.comprehensionQuestionIds?.length) {
    const questions = await loadAssignableQuestions({
      ids: data.comprehensionQuestionIds,
      label: 'comprehensionQuestionIds',
      schoolId,
      teacherId,
      subjectId: data.subjectId,
      gradeId,
    });
    comprehensionIds = questions.map((q) => q._id);
    return {
      ...data,
      comprehensionQuestionIds: comprehensionIds,
      totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
    };
  }

  const { CurriculumNode } = await import('../CurriculumStructure/model.js');
  const node = await CurriculumNode.findOne({ schoolId: schoolObjectId(scope), isDeleted: false }).sort({ createdAt: 1 }).lean();
  if (!node) {
    throw new BadRequestError(
      'No curriculum node available for this school. Create one first or pass comprehensionQuestionIds explicitly.',
    );
  }

  comprehensionIds = await generateComprehensionQuestions(
    data.contentResourceId,
    schoolId,
    teacherId,
    data.subjectId,
    gradeId.toString(),
    node._id.toString(),
    4,
  );
  const generatedQuestions = await Question.find({
    _id: { $in: comprehensionIds },
    isDeleted: false,
  }).select('_id marks').lean<Array<{ _id: mongoose.Types.ObjectId; marks: number }>>();

  if (generatedQuestions.length !== comprehensionIds.length) {
    throw new BadRequestError('Generated comprehension questions could not be verified');
  }

  return {
    ...data,
    comprehensionQuestionIds: comprehensionIds,
    totalMarks: generatedQuestions.reduce((sum, q) => sum + q.marks, 0),
  };
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

export class HomeworkService {
  // ─── Homework CRUD ───────────────────────────────────────────────────────

  static async create(
    data: CreateHomeworkInput,
    actorOrTeacherId: HomeworkActor | string,
  ): Promise<IHomework> {
    const teacherId = typeof actorOrTeacherId === 'string' ? actorOrTeacherId : actorOrTeacherId.id;
    const schoolId = typeof actorOrTeacherId === 'string'
      ? data.schoolId
      : actorOrTeacherId.schoolId;
    if (!schoolId) throw new BadRequestError('School ID is required');
    const scope: HomeworkScope = typeof actorOrTeacherId === 'string' ? schoolId : actorOrTeacherId;
    const resolved = await resolveCreatePayload(
      { ...data, schoolId } as CreateHomeworkData,
      teacherId,
      scope,
    );
    const suppliedComprehensionIds =
      data.type === 'reading' && data.comprehensionQuestionIds?.length;
    const generatedComprehensionIds =
      resolved.type === 'reading' && !suppliedComprehensionIds
        ? resolved.comprehensionQuestionIds
        : undefined;

    try {
      const homework = await Homework.create({
        ...resolved,
        schoolId: schoolObjectId(scope),
        subjectId: toObjectId(resolved.subjectId, 'subjectId'),
        classId: toObjectId(resolved.classId, 'classId'),
        teacherId: toObjectId(teacherId, 'teacherId'),
        version: 1,
      });
      return homework.toObject() as unknown as IHomework;
    } catch (err: unknown) {
      if (generatedComprehensionIds?.length) {
        try {
          await Question.deleteMany({ _id: { $in: generatedComprehensionIds } });
        } catch (delErr: unknown) {
          logger.error({ delErr }, 'Comprehension Q rollback failed during homework create');
        }
      }
      throw err;
    }
  }

  static async list(scope: HomeworkScope, query: ListQuery): Promise<PaginatedResult<IHomework>> {
    const { page, limit, skip, sortField } = getPagination(query);
    const filter: Record<string, unknown> = homeworkAccessFilter(scope);
    if (query.classId) filter.classId = toObjectId(query.classId, 'classId');
    if (query.subjectId) filter.subjectId = toObjectId(query.subjectId, 'subjectId');
    if (
      query.teacherId
      && (!isHomeworkActor(scope) || scope.role !== 'teacher' || canManageAllHomework(scope))
    ) {
      filter.teacherId = toObjectId(query.teacherId, 'teacherId');
    }
    if (query.search) filter.$or = [{ title: new RegExp(escapeRegex(query.search), 'i') }];

    const [data, total] = await Promise.all([
      Homework.find(filter)
        .populate('classId', 'name')
        .populate('teacherId', 'firstName lastName email')
        .populate('contentResourceId', 'title type status blocks')
        .populate('quizId', 'title totalPoints')
        .populate('exerciseQuestionIds', 'stem type marks')
        .populate('comprehensionQuestionIds', 'stem type marks')
        .sort(sortField).skip(skip).limit(limit).lean().exec(),
      Homework.countDocuments(filter),
    ]);
    await attachSubjectRefs(data as unknown as Array<Record<string, unknown>>);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getById(id: string, scope: HomeworkScope): Promise<IHomeworkWithSourceLesson> {
    const schoolOid = schoolObjectId(scope);
    const homework = await Homework.findOne({
      _id: toObjectId(id, 'homeworkId'),
      ...homeworkAccessFilter(scope),
    })
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .populate('contentResourceId', 'title type status blocks')
      .populate('quizId', 'title totalPoints questions')
      .populate('exerciseQuestionIds', 'stem type marks options answer markingRubric')
      .populate('comprehensionQuestionIds', 'stem type marks options answer markingRubric')
      .lean();
    if (!homework) throw new NotFoundError('Homework not found');
    await attachSubjectRefs([homework as unknown as Record<string, unknown>]);

    // Reverse-lookup parent lesson via Lesson.materials[].homeworkId (no FK on Homework).
    const sourceLessonDoc = await Lesson.findOne({
      schoolId: schoolOid,
      isDeleted: false,
      'materials.homeworkId': homework._id,
    })
      .select('_id title')
      .lean() as { _id: mongoose.Types.ObjectId; title: string } | null;

    const sourceLesson = sourceLessonDoc
      ? { id: sourceLessonDoc._id.toString(), title: sourceLessonDoc.title }
      : null;

    return { ...homework, sourceLesson } as unknown as IHomeworkWithSourceLesson;
  }

  static async getStudentById(
    id: string,
    studentId: string,
    schoolId: string,
  ): Promise<Record<string, unknown>> {
    const schoolOid = toObjectId(schoolId, 'schoolId');
    const studentOid = toObjectId(studentId, 'studentId');
    const { Student } = await import('../Student/model.js');
    const student = await Student.findOne({
      _id: studentOid,
      schoolId: schoolOid,
      isDeleted: false,
    }).select('_id classId enrollmentStatus').lean<{
      _id: mongoose.Types.ObjectId;
      classId: mongoose.Types.ObjectId;
      enrollmentStatus?: string;
    } | null>();
    if (!student) throw new NotFoundError('Student not found');
    if (student.enrollmentStatus && student.enrollmentStatus !== 'active') {
      throw new NotFoundError('Homework not found');
    }

    const homework = await Homework.findOne({
      _id: toObjectId(id, 'homeworkId'),
      schoolId: schoolOid,
      classId: student.classId,
      isDeleted: false,
    })
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .populate('contentResourceId', 'title type status blocks')
      .populate('quizId', 'title totalPoints questions shuffleQuestions')
      .populate('exerciseQuestionIds', 'stem type marks options media diagram')
      .populate('comprehensionQuestionIds', 'stem type marks options media diagram')
      .lean();
    if (!homework) throw new NotFoundError('Homework not found');
    await attachSubjectRefs([homework as unknown as Record<string, unknown>]);

    const sourceLessonDoc = await Lesson.findOne({
      schoolId: schoolOid,
      isDeleted: false,
      'materials.homeworkId': homework._id,
    })
      .select('_id title')
      .lean() as { _id: mongoose.Types.ObjectId; title: string } | null;

    const sourceLesson = sourceLessonDoc
      ? { id: sourceLessonDoc._id.toString(), title: sourceLessonDoc.title }
      : null;

    const raw = homework as unknown as Record<string, unknown>;
    const exerciseQuestions = Array.isArray(raw.exerciseQuestionIds)
      ? raw.exerciseQuestionIds.map(sanitizeQuestion)
      : [];
    const comprehensionQuestions = Array.isArray(raw.comprehensionQuestionIds)
      ? raw.comprehensionQuestionIds.map(sanitizeQuestion)
      : [];
    const quiz = sanitizeQuiz(raw.quizId);

    return {
      ...raw,
      quizId: quiz?._id ?? (raw.quizId instanceof mongoose.Types.ObjectId ? raw.quizId.toString() : raw.quizId),
      quiz,
      exerciseQuestionIds: exerciseQuestions.map((q) => q._id),
      exerciseQuestions,
      comprehensionQuestionIds: comprehensionQuestions.map((q) => q._id),
      comprehensionQuestions,
      sourceLesson,
    };
  }

  static async update(id: string, scope: HomeworkScope, data: Partial<IHomework>): Promise<IHomework> {
    const shouldIncrementVersion = ['totalMarks', 'pageRange'].some((field) =>
      Object.prototype.hasOwnProperty.call(data, field),
    );
    const update: Record<string, unknown> = { $set: data };
    if (shouldIncrementVersion) update.$inc = { version: 1 };
    const homework = await Homework.findOneAndUpdate(
      { _id: toObjectId(id, 'homeworkId'), ...homeworkAccessFilter(scope) },
      update,
      { new: true, runValidators: true },
    )
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .populate('contentResourceId', 'title type status blocks')
      .populate('quizId', 'title totalPoints')
      .populate('exerciseQuestionIds', 'stem type marks')
      .populate('comprehensionQuestionIds', 'stem type marks');
    if (!homework) throw new NotFoundError('Homework not found');
    return homework;
  }

  static async delete(id: string, scope: HomeworkScope): Promise<IHomework> {
    const homework = await Homework.findOneAndUpdate(
      { _id: toObjectId(id, 'homeworkId'), ...homeworkAccessFilter(scope) },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!homework) throw new NotFoundError('Homework not found');
    return homework;
  }

  // ─── Submission Operations ───────────────────────────────────────────────

  static async submitHomework(
    homeworkId: string,
    studentId: string,
    schoolId: string,
    payload: SubmitHomeworkInput,
  ): Promise<IHomeworkSubmissionBase> {
    return _submitHomework(homeworkId, studentId, schoolId, payload);
  }

  static async gradeSubmission(
    submissionId: string,
    scope: HomeworkScope,
    mark: number,
    feedback: string | undefined,
    gradedBy: string,
  ): Promise<IHomeworkSubmissionBase> {
    if (mark < 0) throw new BadRequestError('Mark must be non-negative');
    const schoolOid = schoolObjectId(scope);

    const existing = await HomeworkSubmission.findOne({
      _id: toObjectId(submissionId, 'submissionId'),
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();
    if (!existing) throw new NotFoundError('Submission not found');

    const parentHomework = await Homework.findOne({
      _id: existing.homeworkId,
      ...homeworkAccessFilter(scope),
    }).lean();
    if (!parentHomework) throw new NotFoundError('Parent homework not found');
    if (mark > parentHomework.totalMarks) {
      throw new BadRequestError(`Mark (${mark}) cannot exceed homework total (${parentHomework.totalMarks})`);
    }

    const submission = await HomeworkSubmission.findOneAndUpdate(
      { _id: toObjectId(submissionId, 'submissionId'), schoolId: schoolOid, isDeleted: false },
      { $set: { mark, feedback, gradedAt: new Date(), gradedBy, gradingStatus: 'graded' } },
      { new: true, runValidators: true },
    )
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } })
      .populate('homeworkId');
    if (!submission) throw new NotFoundError('Submission not found');
    return submission;
  }

  static async regrade(submissionId: string, scope: HomeworkScope): Promise<IHomeworkSubmissionBase> {
    const schoolOid = schoolObjectId(scope);
    const sub = await HomeworkSubmission.findOne({
      _id: toObjectId(submissionId, 'submissionId'),
      schoolId: schoolOid,
      isDeleted: false,
    });
    if (!sub) throw new NotFoundError('Submission not found');

    const parentHomework = await Homework.findOne({
      _id: sub.homeworkId,
      ...homeworkAccessFilter(scope),
    }).select('_id').lean();
    if (!parentHomework) throw new NotFoundError('Parent homework not found');

    const subAny = sub as unknown as {
      answers?: Array<{ gradingMethod: string }>;
      comprehensionAnswers?: Array<{ gradingMethod: string }>;
    };
    const answersField: 'answers' | 'comprehensionAnswers' =
      sub.type === 'reading' ? 'comprehensionAnswers' : 'answers';
    const arr = subAny[answersField];
    if (arr) {
      for (const a of arr) a.gradingMethod = 'pending';
      sub.markModified(answersField);
    }
    sub.gradingStatus = 'pending';
    sub.errorMessage = undefined;
    sub.gradingGeneration += 1;
    await sub.save();

    void gradeSubmissionAsync(submissionId);

    const fresh = await HomeworkSubmission.findOne({
      _id: toObjectId(submissionId, 'submissionId'),
      schoolId: schoolOid,
      isDeleted: false,
    });
    if (!fresh) throw new NotFoundError('Submission disappeared');
    return fresh;
  }

  static async getSubmissionById(submissionId: string, scope: HomeworkScope): Promise<IHomeworkSubmissionBase> {
    const schoolOid = schoolObjectId(scope);
    const sub = await HomeworkSubmission.findOne({
      _id: toObjectId(submissionId, 'submissionId'),
      schoolId: schoolOid,
      isDeleted: false,
    })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } })
      .lean();
    if (!sub) throw new NotFoundError('Submission not found');
    const parentHomework = await Homework.findOne({
      _id: sub.homeworkId,
      ...homeworkAccessFilter(scope),
    }).select('_id').lean();
    if (!parentHomework) throw new NotFoundError('Submission not found');
    return sub as unknown as IHomeworkSubmissionBase;
  }

  static async getSubmissions(homeworkId: string, scope: HomeworkScope): Promise<IHomeworkSubmissionBase[]> {
    const schoolOid = schoolObjectId(scope);
    const homeworkOid = toObjectId(homeworkId, 'homeworkId');
    const homework = await Homework.findOne({
      _id: homeworkOid,
      ...homeworkAccessFilter(scope),
    }).lean();
    if (!homework) throw new NotFoundError('Homework not found');

    return HomeworkSubmission.find({
      homeworkId: homeworkOid,
      schoolId: schoolOid,
      isDeleted: false,
    })
      .populate({ path: 'studentId', populate: { path: 'userId', select: 'firstName lastName email' } })
      .populate('gradedBy', 'firstName lastName email')
      .sort('-submittedAt').lean().exec();
  }

  static async getHomeworkForStudent(studentId: string, scope: HomeworkScope): Promise<Array<Record<string, unknown>>> {
    const { Student } = await import('../Student/model.js');
    const schoolOid = schoolObjectId(scope);
    const student = await Student.findOne({
      _id: toObjectId(studentId, 'studentId'),
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();
    if (!student) throw new NotFoundError('Student not found');

    const homeworks = await Homework.find({ classId: student.classId, schoolId: schoolOid, isDeleted: false })
      .populate('classId', 'name').populate('teacherId', 'firstName lastName')
      .populate('contentResourceId', 'title type status blocks').populate('quizId', 'title totalPoints')
      .populate('exerciseQuestionIds', 'stem type marks').populate('comprehensionQuestionIds', 'stem type marks')
      .sort({ dueDate: -1 }).lean();
    await attachSubjectRefs(homeworks as unknown as Array<Record<string, unknown>>);

    const homeworkIds = homeworks.map((h) => h._id);
    const submissions = await HomeworkSubmission.find({
      homeworkId: { $in: homeworkIds },
      studentId: toObjectId(studentId, 'studentId'),
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();
    const submissionMap = new Map(submissions.map((s) => [s.homeworkId.toString(), s]));
    return homeworks.map((hw) => ({ ...hw, submission: submissionMap.get(hw._id.toString()) }));
  }

  static async getStudentSubmissions(studentId: string, scope: HomeworkScope): Promise<IHomeworkSubmissionBase[]> {
    const schoolOid = schoolObjectId(scope);
    return HomeworkSubmission.find({
      studentId: toObjectId(studentId, 'studentId'),
      schoolId: schoolOid,
      isDeleted: false,
    })
      .populate({ path: 'homeworkId', populate: [{ path: 'subjectId', select: 'name code' }, { path: 'classId', select: 'name' }] })
      .populate('gradedBy', 'firstName lastName email')
      .sort('-submittedAt').lean().exec();
  }
}

// ─── Dashboard helpers (extracted to keep this file under 350 lines) ─────────
export { getStudentDashboardCounts, getParentDashboardCounts } from './service-homework-dashboards.js';
