import { HomeworkTemplate, IHomeworkTemplate } from './model-template.js';
import { Homework } from './model.js';
import { NotFoundError } from '../../common/errors.js';

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

  /** Clone a template into a new homework assignment. */
  static async createFromTemplate(
    teacherId: string,
    schoolId: string,
    templateId: string,
    overrides: CloneOverrides,
  ): Promise<unknown> {
    const template = await HomeworkTemplate.findOne({
      _id: templateId,
      teacherId,
      schoolId,
      isDeleted: false,
    }).lean();

    if (!template) throw new NotFoundError('Template not found');

    // DEFERRED (tech debt): Templates don't yet have their own discriminator,
    // so we default to 'reading' with no contentResourceId. This produces a
    // structurally-invalid Homework (reading without a resource) that bypasses
    // the Zod API layer. Future work: extend HomeworkTemplate with a type
    // discriminator so cloned homeworks inherit the correct type + refs.
    // Template-level description/rubric are intentionally NOT copied — those
    // fields no longer exist on the Homework model.
    const homework = new Homework({
      title: overrides.title ?? template.title,
      type: 'reading' as const,
      subjectId: template.subjectId,
      classId: overrides.classId,
      schoolId,
      teacherId,
      dueDate: new Date(overrides.dueDate),
      totalMarks: template.totalMarks,
      attachments: template.attachments.map((a) => a.url),
      status: 'assigned',
    });

    const saved = await homework.save();

    // Populate for response
    return Homework.findById(saved._id)
      .populate('subjectId', 'name code')
      .populate('classId', 'name')
      .populate('teacherId', 'firstName lastName email')
      .lean();
  }

  /** Convert an existing homework into a template. */
  static async saveAsTemplate(
    teacherId: string,
    schoolId: string,
    homeworkId: string,
  ): Promise<IHomeworkTemplate> {
    const homework = await Homework.findOne({
      _id: homeworkId,
      schoolId,
      isDeleted: false,
    }).lean();

    if (!homework) throw new NotFoundError('Homework not found');

    // Homework no longer has description/rubric fields (typed discriminator
    // refactor). Template description/rubric can be authored by the teacher
    // separately via the templates UI.
    const template = new HomeworkTemplate({
      schoolId,
      teacherId,
      title: homework.title,
      subjectId: homework.subjectId,
      totalMarks: homework.totalMarks,
      attachments: homework.attachments.map((url: string) => ({
        url,
        name: url.split('/').pop() ?? 'attachment',
      })),
    });

    return template.save();
  }
}
