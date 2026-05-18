import mongoose, { type Types } from 'mongoose';
import { Student } from './model.js';
import { Class, Grade, Subject, Timetable } from '../Academic/model.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';

export interface MyClassesResult {
  homeroom: PopulatedClass | null;
  subjectClasses: PopulatedClass[];
}

export interface PopulatedClass {
  id: string;
  name: string;
  classroomCode: string;
  isHomeroom: boolean;
  grade: { id: string; name: string; level?: number };
  subject?: { id: string; name: string; code?: string } | null;
  teacher: { id: string; firstName: string; lastName: string };
}

interface PopulatedClassDoc {
  _id: Types.ObjectId;
  name: string;
  classroomCode: string;
  isHomeroom: boolean;
  gradeId: Types.ObjectId;
  teacherId?: { _id: Types.ObjectId; firstName?: string; lastName?: string };
}

interface GradeInfo {
  id: string;
  name: string;
  level?: number;
}

interface SubjectInfo {
  id: string;
  name: string;
  code?: string;
}

function parseGradeLevel(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const match = /\b(?:grade|gr)\s*(\d{1,2})\b/i.exec(value) ?? /\b(\d{1,2})\b/.exec(value);
  if (!match) return undefined;
  const parsed = Number.parseInt(match[1] ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 12 ? parsed : undefined;
}

async function resolveGradeMap(ids: Types.ObjectId[]): Promise<Map<string, GradeInfo>> {
  const uniqueIds = [...new Set(ids.map(String))];
  if (uniqueIds.length === 0) return new Map();

  const [grades, nodes] = await Promise.all([
    Grade.find({ _id: { $in: uniqueIds }, isDeleted: false })
      .select('_id name orderIndex')
      .lean<Array<{ _id: Types.ObjectId; name: string; orderIndex?: number }>>(),
    CurriculumNode.find({ _id: { $in: uniqueIds }, type: 'grade', isDeleted: false })
      .select('_id title')
      .lean<Array<{ _id: Types.ObjectId; title: string }>>(),
  ]);

  const map = new Map<string, GradeInfo>();
  for (const grade of grades) {
    map.set(String(grade._id), {
      id: String(grade._id),
      name: grade.name,
      level: grade.orderIndex,
    });
  }
  for (const node of nodes) {
    const id = String(node._id);
    if (map.has(id)) continue;
    map.set(id, {
      id,
      name: node.title,
      level: parseGradeLevel(node.title),
    });
  }

  return map;
}

async function resolveSubjectMap(
  schoolId: string,
  ids: Types.ObjectId[],
): Promise<Map<string, SubjectInfo>> {
  const uniqueIds = [...new Set(ids.map(String))];
  if (uniqueIds.length === 0) return new Map();

  const [subjects, nodes] = await Promise.all([
    Subject.find({ _id: { $in: uniqueIds }, schoolId, isDeleted: false })
      .select('_id name code')
      .lean<Array<{ _id: Types.ObjectId; name: string; code?: string }>>(),
    CurriculumNode.find({ _id: { $in: uniqueIds }, type: 'subject', isDeleted: false })
      .select('_id title code')
      .lean<Array<{ _id: Types.ObjectId; title: string; code?: string }>>(),
  ]);

  const map = new Map<string, SubjectInfo>();
  for (const subject of subjects) {
    map.set(String(subject._id), {
      id: String(subject._id),
      name: subject.name,
      code: subject.code,
    });
  }
  for (const node of nodes) {
    const id = String(node._id);
    if (map.has(id)) continue;
    map.set(id, {
      id,
      name: node.title,
      code: node.code,
    });
  }

  return map;
}

async function resolveSubjectsByClass(
  schoolId: string,
  classIds: Types.ObjectId[],
): Promise<Map<string, SubjectInfo>> {
  const uniqueClassIds = [...new Set(classIds.map(String))];
  if (uniqueClassIds.length === 0) return new Map();

  const rows = await Timetable.find({
    schoolId: new mongoose.Types.ObjectId(schoolId),
    classId: { $in: uniqueClassIds },
    isDeleted: false,
  })
    .select('classId subjectId createdAt')
    .sort({ createdAt: 1 })
    .lean<Array<{ classId: Types.ObjectId; subjectId?: Types.ObjectId }>>();

  const subjectIds = rows
    .map((row) => row.subjectId)
    .filter((id): id is Types.ObjectId => Boolean(id));
  const subjectMap = await resolveSubjectMap(schoolId, subjectIds);

  const byClass = new Map<string, SubjectInfo>();
  for (const row of rows) {
    if (!row.subjectId) continue;
    const classId = String(row.classId);
    if (byClass.has(classId)) continue;
    const subject = subjectMap.get(String(row.subjectId));
    if (subject) byClass.set(classId, subject);
  }
  return byClass;
}

function fallbackGrade(gradeId: Types.ObjectId): GradeInfo {
  return { id: String(gradeId), name: 'Grade not set' };
}

function shape(
  doc: PopulatedClassDoc,
  grades: Map<string, GradeInfo>,
  subjectsByClass: Map<string, SubjectInfo>,
): PopulatedClass {
  const subject = subjectsByClass.get(String(doc._id)) ?? null;
  return {
    id: String(doc._id),
    name: doc.name,
    classroomCode: doc.classroomCode,
    isHomeroom: doc.isHomeroom,
    grade: grades.get(String(doc.gradeId)) ?? fallbackGrade(doc.gradeId),
    subject,
    teacher: {
      id: doc.teacherId?._id ? String(doc.teacherId._id) : '',
      firstName: doc.teacherId?.firstName ?? '',
      lastName: doc.teacherId?.lastName ?? '',
    },
  };
}

export async function getMyStudentClasses(
  userId: string,
  schoolId: string,
): Promise<MyClassesResult> {
  const student = await Student.findOne({
    userId: new mongoose.Types.ObjectId(userId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  })
    .select('classId subjectClassIds')
    .lean<{ classId?: Types.ObjectId; subjectClassIds?: Types.ObjectId[] } | null>();

  if (!student) {
    return { homeroom: null, subjectClasses: [] };
  }

  const classIds = [
    student.classId,
    ...(student.subjectClassIds ?? []),
  ].filter((id): id is Types.ObjectId => Boolean(id));

  const uniqueClassIds = [...new Map(classIds.map((id) => [String(id), id])).values()];
  if (uniqueClassIds.length === 0) return { homeroom: null, subjectClasses: [] };

  const docs = await Class.find({
    _id: { $in: uniqueClassIds },
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  })
    .populate<{ teacherId: PopulatedClassDoc['teacherId'] }>('teacherId', 'firstName lastName')
    .lean<PopulatedClassDoc[]>();

  const gradeIds = docs.map((doc) => doc.gradeId).filter((id): id is Types.ObjectId => Boolean(id));
  const [grades, subjectsByClass] = await Promise.all([
    resolveGradeMap(gradeIds),
    resolveSubjectsByClass(schoolId, uniqueClassIds),
  ]);

  const byId = new Map(docs.map((doc) => [String(doc._id), doc]));
  const homeroomDoc = student.classId ? byId.get(String(student.classId)) ?? null : null;
  const homeroomId = homeroomDoc ? String(homeroomDoc._id) : null;

  return {
    homeroom: homeroomDoc ? shape(homeroomDoc, grades, subjectsByClass) : null,
    subjectClasses: (student.subjectClassIds ?? [])
      .map((id) => byId.get(String(id)))
      .filter((doc): doc is PopulatedClassDoc => {
        if (!doc) return false;
        return String(doc._id) !== homeroomId;
      })
      .map((doc) => shape(doc, grades, subjectsByClass)),
  };
}
