import mongoose from 'mongoose';
import type { HydratedDocument } from 'mongoose';
import { Lesson } from './model.js';
// Side-effect imports: ensure referenced models are registered with Mongoose
// so .populate() works without a MissingSchemaError.
import '../Academic/model.js'; // Subject
import '../ContentLibrary/model.js'; // ContentResource
import '../Learning/model.js'; // Quiz
import '../Homework/model.js'; // Homework
import '../QuestionBank/model-papers.js'; // AssessmentPaper
import type { IStudent } from '../Student/model.js';
import type {
  StudentContentBlock,
  StudentLessonSummary,
  StudentLessonDetail,
  StudentLessonMaterial,
} from './types-student.js';
import type { StudentLessonListQuery } from './validation-student.js';

interface PopulatedSubject {
  _id: mongoose.Types.ObjectId;
  name?: string;
  title?: string;
}

function isPopulatedSubject(
  subject: PopulatedSubject | mongoose.Types.ObjectId | null,
): subject is PopulatedSubject {
  return subject !== null && typeof subject === 'object' && !(subject instanceof mongoose.Types.ObjectId);
}

function lessonToSummary(
  doc: Record<string, unknown>,
  studentClassId: mongoose.Types.ObjectId,
): StudentLessonSummary {
  const assigned = (
    doc.assignedClasses as Array<{
      classId: mongoose.Types.ObjectId;
      scheduledDate: Date;
      status: 'planned' | 'taught';
    }>
  ).find((a) => a.classId.toString() === studentClassId.toString());
  const materials = (doc.materials as Array<{ kind: string }>) ?? [];
  const subject = doc.subjectId as PopulatedSubject | mongoose.Types.ObjectId | null;
  const subjectName = isPopulatedSubject(subject) ? subject.name ?? subject.title ?? '' : '';
  const subjectId = isPopulatedSubject(subject)
    ? subject._id.toString()
    : subject !== null
      ? subject.toString()
      : '';
  return {
    id: (doc._id as mongoose.Types.ObjectId).toString(),
    title: doc.title as string,
    subjectId,
    subjectName,
    scheduledDate: assigned?.scheduledDate.toISOString() ?? new Date().toISOString(),
    status: assigned?.status ?? 'planned',
    materialCount: materials.length,
    hasHomework: materials.some((m) => m.kind === 'homework'),
    hasQuiz: materials.some((m) => m.kind === 'quiz' || m.kind === 'practice_questions'),
  };
}

export async function listLessonsForStudent(
  student: HydratedDocument<IStudent>,
  query: StudentLessonListQuery,
): Promise<StudentLessonSummary[]> {
  const filter: Record<string, unknown> = {
    schoolId: student.schoolId,
    isDeleted: false,
    publishedAt: { $ne: null },
    'assignedClasses.classId': student.classId,
  };
  if (query.subjectId) {
    filter.subjectId = new mongoose.Types.ObjectId(query.subjectId);
  }
  if (query.search) {
    filter.title = { $regex: query.search, $options: 'i' };
  }

  const docs = await Lesson.find(filter)
    .populate('subjectId', 'name title')
    .lean()
    .exec();

  const summaries = docs.map((d) => lessonToSummary(d as unknown as Record<string, unknown>, student.classId));

  if (query.status && query.status !== 'all') {
    return summaries.filter((s) => s.status === query.status);
  }

  // Sort: taught first (most recent), then planned (chronological).
  return summaries.sort((a, b) => {
    if (a.status === b.status) {
      return a.status === 'taught'
        ? new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
        : new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
    }
    return a.status === 'taught' ? -1 : 1;
  });
}

function materialToDto(
  mat: Record<string, unknown>,
  phase: string,
): StudentLessonMaterial {
  const base: StudentLessonMaterial = {
    id: (mat._id as mongoose.Types.ObjectId).toString(),
    kind: mat.kind as StudentLessonMaterial['kind'],
    title: mat.title as string,
    phase,
  };

  const resource = mat.contentResourceId as Record<string, unknown> | mongoose.Types.ObjectId | undefined;
  if (resource && typeof resource === 'object' && !(resource instanceof mongoose.Types.ObjectId)) {
    const rawBlocks = Array.isArray(resource.blocks) ? resource.blocks : [];
    base.contentResource = {
      id: (resource._id as mongoose.Types.ObjectId).toString(),
      type: (resource.type as string) ?? 'unknown',
      title: (resource.title as string) ?? base.title,
      url: resource.url as string | undefined,
      blocks: rawBlocks.map((block) => contentBlockToDto(block as Record<string, unknown>)),
    };
  }

  const quiz = mat.quizId as Record<string, unknown> | mongoose.Types.ObjectId | undefined;
  if (quiz && typeof quiz === 'object' && !(quiz instanceof mongoose.Types.ObjectId)) {
    const questions = (quiz.questions as unknown[]) ?? [];
    base.quiz = {
      id: (quiz._id as mongoose.Types.ObjectId).toString(),
      title: (quiz.title as string) ?? base.title,
      questionCount: questions.length,
    };
  }

  const homework = mat.homeworkId as Record<string, unknown> | mongoose.Types.ObjectId | undefined;
  if (homework && typeof homework === 'object' && !(homework instanceof mongoose.Types.ObjectId)) {
    base.homework = {
      id: (homework._id as mongoose.Types.ObjectId).toString(),
      title: (homework.title as string) ?? base.title,
      dueAt: (homework.dueDate as Date | undefined)?.toISOString(),
      status: homework.status as string | undefined,
    };
  }

  const paper = mat.paperId as Record<string, unknown> | mongoose.Types.ObjectId | undefined;
  if (paper && typeof paper === 'object' && !(paper instanceof mongoose.Types.ObjectId)) {
    base.paper = {
      paperId: (paper._id as mongoose.Types.ObjectId).toString(),
      title: (paper.title as string) ?? base.title,
      releaseAt: (paper.releaseAt as Date | undefined)?.toISOString(),
      dueAt: (paper.dueAt as Date | undefined)?.toISOString(),
    };
  }

  const textbook = mat.textbookRef as Record<string, unknown> | undefined;
  if (textbook) {
    base.textbookRef = {
      source: textbook.source as 'internal' | 'external',
      title: textbook.title as string | undefined,
      pageStart: textbook.pageStart as number | undefined,
      pageEnd: textbook.pageEnd as number | undefined,
      internalId: (textbook.textbookId as mongoose.Types.ObjectId | undefined)?.toString(),
    };
  }

  return base;
}

function contentBlockToDto(block: Record<string, unknown>): StudentContentBlock {
  const curriculumNodeId = block.curriculumNodeId;
  return {
    blockId: String(block.blockId ?? ''),
    type: String(block.type ?? 'text'),
    order: typeof block.order === 'number' ? block.order : 0,
    content: typeof block.content === 'string' ? block.content : '',
    curriculumNodeId: curriculumNodeId ? String(curriculumNodeId) : null,
    cognitiveLevel: (block.cognitiveLevel as StudentContentBlock['cognitiveLevel']) ?? null,
    points: typeof block.points === 'number' ? block.points : 0,
    hints: Array.isArray(block.hints) ? block.hints.map(String) : [],
    explanation: typeof block.explanation === 'string' ? block.explanation : '',
    metadata:
      block.metadata && typeof block.metadata === 'object'
        ? (block.metadata as Record<string, unknown>)
        : {},
  };
}

/**
 * Visibility check for student-side access (used by the student PDF export
 * route). Returns true if the lesson is published and assigned to the
 * student's class within their school.
 */
export async function isLessonVisibleToStudent(
  student: HydratedDocument<IStudent>,
  lessonId: string,
): Promise<boolean> {
  const found = await Lesson.exists({
    _id: lessonId,
    schoolId: student.schoolId,
    isDeleted: false,
    publishedAt: { $ne: null },
    'assignedClasses.classId': student.classId,
  });
  return found !== null;
}

export async function getLessonForStudent(
  student: HydratedDocument<IStudent>,
  lessonId: string,
): Promise<StudentLessonDetail | null> {
  const doc = await Lesson.findOne({
    _id: lessonId,
    schoolId: student.schoolId,
    isDeleted: false,
    publishedAt: { $ne: null },
    'assignedClasses.classId': student.classId,
  })
    .populate('subjectId', 'name title')
    .populate({
      path: 'materials.contentResourceId',
      match: { schoolId: student.schoolId, isDeleted: false },
    })
    .populate({
      path: 'materials.quizId',
      select: 'title questions',
      match: { schoolId: student.schoolId, isDeleted: false },
    })
    .populate({
      path: 'materials.homeworkId',
      select: 'title dueDate status',
      match: { schoolId: student.schoolId, isDeleted: false },
    })
    .populate({
      path: 'materials.paperId',
      select: 'title releaseAt dueAt',
      match: { schoolId: student.schoolId, isDeleted: false },
    })
    .lean()
    .exec();

  if (!doc) return null;

  const docRecord = doc as unknown as Record<string, unknown>;
  const summary = lessonToSummary(docRecord, student.classId);
  const materials = (docRecord.materials as Array<Record<string, unknown>>) ?? [];
  const phaseLookup = new Map<string, string>();
  const materialLookup = new Map<string, Record<string, unknown>>();
  for (const material of materials) {
    materialLookup.set((material._id as mongoose.Types.ObjectId).toString(), material);
  }

  const orderedMaterials: Array<Record<string, unknown>> = [];
  const orderedMaterialIds = new Set<string>();
  const phases = (docRecord.phases as Array<{ phase: string; materialIds: mongoose.Types.ObjectId[] }>) ?? [];
  for (const p of phases) {
    for (const mid of p.materialIds) {
      const id = mid.toString();
      phaseLookup.set(id, p.phase);
      const material = materialLookup.get(id);
      if (material) {
        orderedMaterials.push(material);
        orderedMaterialIds.add(id);
      }
    }
  }
  for (const material of materials) {
    const id = (material._id as mongoose.Types.ObjectId).toString();
    if (!orderedMaterialIds.has(id)) {
      orderedMaterials.push(material);
    }
  }

  return {
    ...summary,
    objectives: (docRecord.objectives as string[]) ?? [],
    durationMinutes: docRecord.durationMinutes as number,
    materials: orderedMaterials.map((m) => materialToDto(m, phaseLookup.get((m._id as mongoose.Types.ObjectId).toString()) ?? '')),
  };
}
