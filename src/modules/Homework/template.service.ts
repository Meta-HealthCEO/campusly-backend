import { HomeworkTemplate, IHomeworkTemplate } from './model-template.js';
import { Homework } from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { HomeworkService } from './service.js';
import {
  canManageAllHomework,
  homeworkAccessFilter,
  toObjectId,
  type HomeworkActor,
} from './service-access.js';

interface CreateTemplateData {
  title: string;
  description?: string;
  subjectId: string;
  totalMarks: number;
  rubric?: string;
  attachments?: Array<{ url: string; name: string }>;
}

interface CloneOverrides {
  classId: string;
  dueDate: string;
  title?: string;
}

function templateAccessFilter(actor: HomeworkActor): Record<string, unknown> {
  const filter: Record<string, unknown> = {
    schoolId: toObjectId(actor.schoolId, 'schoolId'),
    isDeleted: false,
  };
  if (actor.role === 'teacher' && !canManageAllHomework(actor)) {
    filter.teacherId = toObjectId(actor.id, 'teacherId');
  }
  return filter;
}

export class HomeworkTemplateService {
  /** Create a new homework template. */
  static async createTemplate(
    teacherId: string,
    schoolId: string,
    data: CreateTemplateData,
  ): Promise<IHomeworkTemplate> {
    const template = new HomeworkTemplate({
      ...data,
      teacherId,
      schoolId,
    });
    return template.save();
  }

  /** List templates for a teacher, optionally filtered by subject. */
  static async listTemplates(
    teacherId: string,
    schoolId: string,
    subjectId?: string,
  ): Promise<IHomeworkTemplate[]> {
    const filter: Record<string, unknown> = {
      teacherId,
      schoolId,
      isDeleted: false,
    };
    if (subjectId) filter.subjectId = subjectId;

    return HomeworkTemplate.find(filter)
      .populate('subjectId', 'name code')
      .sort('-createdAt')
      .lean()
      .exec();
  }

  /** Soft-delete a template. */
  static async deleteTemplate(
    templateId: string,
    teacherId: string,
    schoolId: string,
  ): Promise<IHomeworkTemplate> {
    const template = await HomeworkTemplate.findOneAndUpdate(
      { _id: templateId, teacherId, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!template) throw new NotFoundError('Template not found');
    return template;
  }

  /** Clone a typed template into a new homework assignment. */
  static async createFromTemplate(
    actor: HomeworkActor,
    templateId: string,
    overrides: CloneOverrides,
  ): Promise<unknown> {
    const template = await HomeworkTemplate.findOne({
      _id: toObjectId(templateId, 'templateId'),
      ...templateAccessFilter(actor),
    }).lean();

    if (!template) throw new NotFoundError('Template not found');
    if (!template.type) {
      throw new BadRequestError(
        'This legacy template has no homework content. Save a typed homework as a template before cloning.',
      );
    }

    const base = {
      title: overrides.title ?? template.title,
      subjectId: template.subjectId.toString(),
      classId: overrides.classId,
      schoolId: actor.schoolId,
      dueDate: overrides.dueDate,
      totalMarks: template.totalMarks,
      attachments: template.attachments.map((a) => a.url),
      latePolicy: template.latePolicy ?? 'block',
      ...(template.latePolicy === 'penalty' && typeof template.latePenaltyPercent === 'number'
        ? { latePenaltyPercent: template.latePenaltyPercent }
        : {}),
      gradebookAutoPublish: template.gradebookAutoPublish ?? true,
    };

    const payload =
      template.type === 'quiz'
        ? {
            ...base,
            type: 'quiz' as const,
            quizId: template.quizId?.toString() ?? '',
          }
        : template.type === 'reading'
          ? {
              ...base,
              type: 'reading' as const,
              contentResourceId: template.contentResourceId?.toString() ?? '',
              ...(template.pageRange ? { pageRange: template.pageRange } : {}),
              ...(template.comprehensionQuestionIds?.length
                ? { comprehensionQuestionIds: template.comprehensionQuestionIds.map((id) => id.toString()) }
                : {}),
            }
          : {
              ...base,
              type: 'exercise' as const,
              exerciseQuestionIds: (template.exerciseQuestionIds ?? []).map((id) => id.toString()),
            };

    const missingRef =
      (payload.type === 'quiz' && !payload.quizId)
      || (payload.type === 'reading' && !payload.contentResourceId)
      || (payload.type === 'exercise' && payload.exerciseQuestionIds.length === 0);
    if (missingRef) {
      throw new BadRequestError('Template is missing the content needed to create homework');
    }

    const homework = await HomeworkService.create(payload, actor);
    return HomeworkService.getById(homework._id.toString(), actor);
  }

  /** Convert an existing homework into a typed template. */
  static async saveAsTemplate(
    actor: HomeworkActor,
    homeworkId: string,
  ): Promise<IHomeworkTemplate> {
    const homework = await Homework.findOne({
      _id: toObjectId(homeworkId, 'homeworkId'),
      ...homeworkAccessFilter(actor),
    }).lean();

    if (!homework) throw new NotFoundError('Homework not found');

    const template = new HomeworkTemplate({
      schoolId: toObjectId(actor.schoolId, 'schoolId'),
      teacherId: toObjectId(actor.id, 'teacherId'),
      title: homework.title,
      type: homework.type,
      quizId: homework.quizId ?? null,
      contentResourceId: homework.contentResourceId ?? null,
      pageRange: homework.pageRange ?? null,
      exerciseQuestionIds: homework.exerciseQuestionIds ?? [],
      comprehensionQuestionIds: homework.comprehensionQuestionIds ?? [],
      subjectId: homework.subjectId,
      totalMarks: homework.totalMarks,
      latePolicy: homework.latePolicy,
      latePenaltyPercent: homework.latePenaltyPercent,
      gradebookAutoPublish: homework.gradebookAutoPublish,
      attachments: homework.attachments.map((url: string) => ({
        url,
        name: url.split('/').pop() ?? 'attachment',
      })),
    });

    return template.save();
  }
}
