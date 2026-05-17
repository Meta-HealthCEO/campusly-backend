import crypto from 'crypto';
import type { Types } from 'mongoose';
import { Grade, IGrade, Class, IClass, Subject, Timetable } from '../model.js';
import { Student } from '../../Student/model.js';
import { User } from '../../Auth/model.js';
import { CurriculumNode } from '../../CurriculumStructure/model.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../../common/constants.js';
import { escapeRegex } from '../../../common/utils.js';

/**
 * Resolves class.gradeId in place. Classes for standalone teachers point at a
 * CurriculumNode (type='grade'); classes for school-affiliated teachers point
 * at a Grade. We look up both and overwrite the gradeId field with a populated
 * { _id, name, level } object so the frontend can render uniformly.
 */
async function resolveClassGradeFields(classes: Array<Record<string, unknown>>): Promise<void> {
  const ids = classes
    .map((c) => c.gradeId)
    .filter((g): g is Types.ObjectId | string => Boolean(g));
  if (ids.length === 0) return;

  const [grades, nodes] = await Promise.all([
    Grade.find({ _id: { $in: ids }, isDeleted: false }).select('_id name orderIndex').lean(),
    CurriculumNode.find({ _id: { $in: ids }, type: 'grade', isDeleted: false })
      .select('_id title').lean(),
  ]);

  const map = new Map<string, { _id: Types.ObjectId; name: string; level: number }>();
  for (const g of grades) {
    map.set(String(g._id), {
      _id: g._id as Types.ObjectId,
      name: g.name,
      level: g.orderIndex ?? 0,
    });
  }
  for (const n of nodes) {
    const key = String(n._id);
    if (map.has(key)) continue;
    const match = n.title.match(/Grade\s+(\d+|R)/i);
    const level = match ? (match[1].toUpperCase() === 'R' ? 0 : Number(match[1])) : 0;
    map.set(key, { _id: n._id as Types.ObjectId, name: n.title, level });
  }

  for (const cls of classes) {
    const id = cls.gradeId;
    if (!id) continue;
    const resolved = map.get(String(id));
    if (resolved) cls.gradeId = resolved;
  }
}

/**
 * Resolves timetableRow.subjectId in place. Standalone teachers' teaching groups
 * point at a CurriculumNode (type='subject'); school-affiliated rows point at a
 * Subject. Look up both, overwrite with a populated { _id, name, code } object.
 */
async function resolveTimetableSubjectFields(rows: Array<Record<string, unknown>>): Promise<void> {
  // Skip rows that are already populated (subjectId is an object with name).
  const ids: Array<Types.ObjectId | string> = [];
  for (const row of rows) {
    const s = row.subjectId;
    if (!s) continue;
    if (typeof s === 'object' && (s as Record<string, unknown>).name) continue;
    ids.push(s as Types.ObjectId | string);
  }
  if (ids.length === 0) return;

  const [subjects, nodes] = await Promise.all([
    Subject.find({ _id: { $in: ids }, isDeleted: false }).select('_id name code').lean(),
    CurriculumNode.find({ _id: { $in: ids }, type: 'subject', isDeleted: false })
      .select('_id title code').lean(),
  ]);

  const map = new Map<string, { _id: Types.ObjectId; name: string; code: string }>();
  for (const s of subjects) {
    map.set(String(s._id), {
      _id: s._id as Types.ObjectId,
      name: s.name,
      code: s.code ?? '',
    });
  }
  for (const n of nodes) {
    const key = String(n._id);
    if (map.has(key)) continue;
    map.set(key, {
      _id: n._id as Types.ObjectId,
      name: n.title,
      code: n.code ?? '',
    });
  }

  for (const row of rows) {
    const id = row.subjectId;
    if (!id || (typeof id === 'object' && (id as Record<string, unknown>).name)) continue;
    const resolved = map.get(String(id));
    if (resolved) row.subjectId = resolved;
  }
}

function generateClassroomCode(): string {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

interface ListQuery {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export class GradeService {
  // ─── Grade CRUD ──────────────────────────────────────────────────────────

  static async createGrade(data: Partial<IGrade>): Promise<IGrade> {
    const grade = new Grade(data);
    return grade.save();
  }

  static async listGrades(
    schoolId: string,
    query: ListQuery,
  ): Promise<PaginatedResult<IGrade>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId, isDeleted: false };

    if (query.search) {
      filter.name = new RegExp(escapeRegex(query.search), 'i');
    }

    const [data, total] = await Promise.all([
      Grade.find(filter).sort(sortField).skip(skip).limit(limit).lean().exec(),
      Grade.countDocuments(filter),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getGradeById(id: string, schoolId: string): Promise<IGrade> {
    const grade = await Grade.findOne({ _id: id, schoolId, isDeleted: false }).lean();
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  static async updateGrade(id: string, schoolId: string, data: Partial<IGrade>): Promise<IGrade> {
    const grade = await Grade.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  static async deleteGrade(id: string, schoolId: string): Promise<IGrade> {
    const grade = await Grade.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!grade) throw new NotFoundError('Grade not found');
    return grade;
  }

  // ─── Class CRUD ──────────────────────────────────────────────────────────

  static async createClass(data: Partial<IClass>): Promise<IClass> {
    // Verify gradeId belongs to the same school (or is a valid CurriculumNode grade
    // for standalone teachers who reference the CAPS tree instead of the Grade collection).
    if (data.gradeId && data.schoolId) {
      const grade = await Grade.findOne({
        _id: data.gradeId,
        schoolId: data.schoolId,
        isDeleted: false,
      });
      if (!grade) {
        // Standalone teachers reference grades from the CurriculumNode tree.
        const { CurriculumNode } = await import('../../CurriculumStructure/model.js');
        const node = await CurriculumNode.findOne({
          _id: data.gradeId,
          type: 'grade',
          isDeleted: false,
        });
        if (!node) {
          throw new BadRequestError('Grade not found in this school');
        }
      }
    }

    // Check for duplicate class name within the same grade
    const existing = await Class.findOne({
      name: data.name,
      gradeId: data.gradeId,
      schoolId: data.schoolId,
      isDeleted: false,
    });
    if (existing) {
      throw new ConflictError('A class with this name already exists in this grade');
    }

    // Generate a unique 6-char uppercase alphanumeric classroom code
    let code = generateClassroomCode();
    let attempts = 0;
    while (await Class.exists({ classroomCode: code }) && attempts < 10) {
      code = generateClassroomCode();
      attempts++;
    }
    const cls = new Class({ ...data, classroomCode: code });
    return cls.save();
  }

  static async getClassByCode(classroomCode: string): Promise<IClass | null> {
    return Class.findOne({ classroomCode: classroomCode.toUpperCase(), isDeleted: false }).lean();
  }

  /**
   * Join a class via its classroom code.
   *
   * The Student model only stores a single `classId`, so joining a new class
   * REPLACES the student's current homeroom assignment. The frontend should
   * surface this consequence to the student before they submit.
   */
  static async joinClassByCode(
    userId: string,
    schoolId: string,
    classroomCode: string,
  ): Promise<{ class: IClass; previousClassId: string | null }> {
    const normalised = classroomCode.trim().toUpperCase();
    if (!normalised) throw new BadRequestError('Classroom code is required');

    const cls = await Class.findOne({
      classroomCode: normalised,
      schoolId,
      isDeleted: false,
    }).lean();
    if (!cls) throw new NotFoundError('No class matches that code in your school');

    const student = await Student.findOne({ userId, schoolId, isDeleted: false });
    if (!student) throw new NotFoundError('Student profile not found');

    const previousClassId = student.classId ? String(student.classId) : null;
    if (previousClassId === String(cls._id)) {
      throw new ConflictError('You are already in this class');
    }

    if (cls.capacity) {
      const enrolled = await Student.countDocuments({
        classId: cls._id,
        schoolId,
        isDeleted: false,
      });
      if (enrolled >= cls.capacity) {
        throw new ConflictError('This class is full');
      }
    }

    student.classId = cls._id as Types.ObjectId;
    student.gradeId = cls.gradeId as Types.ObjectId;
    await student.save();

    return { class: cls, previousClassId };
  }

  static async regenerateClassroomCode(id: string, schoolId: string): Promise<IClass> {
    let code = generateClassroomCode();
    let attempts = 0;
    while (await Class.exists({ classroomCode: code }) && attempts < 10) {
      code = generateClassroomCode();
      attempts++;
    }
    const cls = await Class.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { classroomCode: code } },
      { new: true },
    );
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  static async listClasses(
    filters: { schoolId: string; gradeId?: string; teacherId?: string; includeSubjectClasses?: boolean },
    query: ListQuery,
  ): Promise<PaginatedResult<IClass>> {
    const { page, limit, skip, sortField } = getPagination(query);

    const filter: Record<string, unknown> = { schoolId: filters.schoolId, isDeleted: false };
    if (filters.gradeId) filter.gradeId = filters.gradeId;

    if (filters.teacherId) {
      const includeSubject = filters.includeSubjectClasses !== false;
      if (includeSubject) {
        const timetableClassIds = await Timetable.distinct('classId', {
          schoolId: filters.schoolId,
          teacherId: filters.teacherId,
          isDeleted: false,
        }) as Types.ObjectId[];
        filter.$or = [
          { teacherId: filters.teacherId },
          { _id: { $in: timetableClassIds } },
        ];
      } else {
        filter.teacherId = filters.teacherId;
      }
    }

    if (query.search) {
      filter.name = new RegExp(escapeRegex(query.search), 'i');
    }

    const [data, total] = await Promise.all([
      Class.find(filter)
        .populate('teacherId', 'firstName lastName email')
        .sort(sortField)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Class.countDocuments(filter),
    ]);
    await resolveClassGradeFields(data as unknown as Array<Record<string, unknown>>);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getClassById(id: string, schoolId: string): Promise<IClass> {
    const cls = await Class.findOne({ _id: id, schoolId, isDeleted: false })
      .populate('teacherId', 'firstName lastName email')
      .lean();
    if (!cls) throw new NotFoundError('Class not found');
    await resolveClassGradeFields([cls as unknown as Record<string, unknown>]);
    return cls;
  }

  static async updateClass(id: string, schoolId: string, data: Partial<IClass>): Promise<IClass> {
    // If a class is being marked as homeroom, clear the flag on every other
    // class for the same teacher in the same school. (One homeroom max.)
    if (data.isHomeroom === true) {
      const target = await Class.findOne({ _id: id, schoolId, isDeleted: false }).select('teacherId').lean();
      if (target?.teacherId) {
        await Class.updateMany(
          { schoolId, teacherId: target.teacherId, _id: { $ne: id }, isDeleted: false, isHomeroom: true },
          { $set: { isHomeroom: false } },
        );
      }
    }

    const cls = await Class.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    )
      .populate('teacherId', 'firstName lastName email')
      .lean();
    if (!cls) throw new NotFoundError('Class not found');
    await resolveClassGradeFields([cls as unknown as Record<string, unknown>]);
    return cls as IClass;
  }

  static async deleteClass(id: string, schoolId: string): Promise<IClass> {
    const cls = await Class.findOneAndUpdate(
      { _id: id, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!cls) throw new NotFoundError('Class not found');
    return cls;
  }

  /**
   * Standalone teaching groups have a single subject linked through Timetable.
   * Replaces any existing teacher-owned timetable row for this class with one
   * pointing at the new subject. School-managed multi-subject classes are not
   * intended to call this — they have richer timetable management elsewhere.
   */
  static async syncTeachingGroupSubject(input: {
    schoolId: string;
    teacherId: string;
    classId: string;
    subjectId: string;
    gradeId?: string;
  }): Promise<void> {
    const { schoolId, teacherId, classId, subjectId } = input;
    await GradeService.validateTeachingGroupSubject(input);

    const existing = await Timetable.findOne({
      schoolId, teacherId, classId, isDeleted: false,
    });

    if (existing) {
      if (String(existing.subjectId) === subjectId) return;
      existing.subjectId = subjectId as unknown as Types.ObjectId;
      await existing.save();
      return;
    }

    const day = 'monday';
    let period = 1;
    for (; period <= 20; period += 1) {
      const occupied = await Timetable.exists({
        schoolId,
        classId,
        day,
        period,
        isDeleted: false,
      });
      if (!occupied) break;
    }
    if (period > 20) {
      throw new BadRequestError('No available timetable slot to link this teaching group subject');
    }

    await Timetable.create({
      schoolId,
      teacherId,
      classId,
      subjectId,
      day,
      period,
      startTime: '08:00',
      endTime: '08:30',
    });
  }

  static async validateTeachingGroupGrade(input: {
    schoolId: string;
    teacherId: string;
    gradeId: string;
  }): Promise<void> {
    const { schoolId, teacherId, gradeId } = input;
    const [gradeDoc, teacherDoc] = await Promise.all([
      Grade.findOne({ _id: gradeId, schoolId, isDeleted: false }).select('_id').lean(),
      User.findOne({
        _id: teacherId,
        schoolId,
        role: 'teacher',
        isDeleted: false,
        isActive: true,
      }).select('_id').lean(),
    ]);

    if (!gradeDoc) throw new BadRequestError('Teaching group grade not found in your school');
    if (!teacherDoc) throw new BadRequestError('Teacher not found in your school');
  }

  static async validateTeachingGroupSubjectChoice(input: {
    schoolId: string;
    teacherId: string;
    subjectId: string;
    gradeId: string;
  }): Promise<void> {
    const { schoolId, teacherId, subjectId, gradeId } = input;

    const [gradeDoc, subjectDoc, teacherDoc] = await Promise.all([
      Grade.findOne({ _id: gradeId, schoolId, isDeleted: false }).select('_id').lean(),
      Subject.findOne({ _id: subjectId, schoolId, isDeleted: false }).select('gradeIds').lean(),
      User.findOne({
        _id: teacherId,
        schoolId,
        role: 'teacher',
        isDeleted: false,
        isActive: true,
      }).select('_id').lean(),
    ]);

    if (!gradeDoc) throw new BadRequestError('Teaching group grade not found in your school');
    if (!subjectDoc) throw new BadRequestError('Subject not found in your school');
    if (!teacherDoc) throw new BadRequestError('Teacher not found in your school');

    const subjectGradeIds = (subjectDoc.gradeIds ?? []).map((id) => String(id));
    if (subjectGradeIds.length > 0 && !subjectGradeIds.includes(gradeId)) {
      throw new BadRequestError('Subject is not linked to the selected teaching group grade');
    }
  }

  static async validateTeachingGroupSubject(input: {
    schoolId: string;
    teacherId: string;
    classId: string;
    subjectId: string;
    gradeId?: string;
  }): Promise<void> {
    const { schoolId, teacherId, classId, subjectId } = input;

    const classDoc = await Class.findOne({ _id: classId, schoolId, isDeleted: false })
      .select('gradeId')
      .lean();

    if (!classDoc) throw new BadRequestError('Teaching group not found in your school');

    const classGradeId = String(input.gradeId ?? classDoc.gradeId);
    await GradeService.validateTeachingGroupSubjectChoice({
      schoolId,
      teacherId,
      subjectId,
      gradeId: classGradeId,
    });
  }

  static async validateTeachingGroupCurrentSubjectForGrade(input: {
    schoolId: string;
    teacherId: string;
    classId: string;
    gradeId: string;
  }): Promise<void> {
    const current = await Timetable.findOne({
      schoolId: input.schoolId,
      teacherId: input.teacherId,
      classId: input.classId,
      isDeleted: false,
    }).select('subjectId').lean();

    if (current?.subjectId) {
      await GradeService.validateTeachingGroupSubjectChoice({
        schoolId: input.schoolId,
        teacherId: input.teacherId,
        subjectId: String(current.subjectId),
        gradeId: input.gradeId,
      });
    }
  }

  static async clearTeachingGroupSubject(input: {
    schoolId: string;
    teacherId: string;
    classId: string;
  }): Promise<void> {
    const { schoolId, teacherId, classId } = input;
    const classDoc = await Class.findOne({
      _id: classId,
      schoolId,
      isDeleted: false,
    }).select('_id').lean();
    if (!classDoc) throw new BadRequestError('Teaching group not found in your school');

    await Timetable.updateMany(
      { schoolId, teacherId, classId, isDeleted: false },
      { $set: { isDeleted: true } },
    );
  }

  // ─── Teacher Scoping Helpers ────────────────────────────────────────────

  static async getTeacherTeachingLoad(
    teacherId: string,
    schoolId: string,
    options: { isStandaloneTeacher?: boolean } = {},
  ) {
    // Standalone teachers don't have a "homeroom" — every class is a teaching
    // group. Fetch all of their classes; flatten into subjectClasses with
    // homeroom=null. School-affiliated teachers retain the original single-
    // homeroom behaviour.
    if (options.isStandaloneTeacher) {
      const classes = await Class.find({ schoolId, teacherId, isDeleted: false })
        .sort({ createdAt: -1 })
        .lean();
      await resolveClassGradeFields(classes as unknown as Array<Record<string, unknown>>);

      // Don't .populate('subjectId') here — the schema's ref is 'Subject' but
      // standalone teachers' rows point at CurriculumNode IDs. Mongoose populate
      // would resolve those to null. resolveTimetableSubjectFields below queries
      // both Subject and CurriculumNode collections.
      const timetableRows = await Timetable.find({ schoolId, teacherId, isDeleted: false }).lean();
      await resolveTimetableSubjectFields(timetableRows as unknown as Array<Record<string, unknown>>);

      const subjectByClass = new Map<string, unknown>();
      for (const row of timetableRows) {
        const cid = String(row.classId);
        if (row.subjectId && !subjectByClass.has(cid)) {
          subjectByClass.set(cid, row.subjectId);
        }
      }

      const classIds = classes.map((c) => String(c._id));
      const students = classIds.length > 0
        ? await Student.find({ schoolId, classId: { $in: classIds }, isDeleted: false })
            .populate('userId', 'firstName lastName email profileImage').lean()
        : [];
      const studentsByClass = new Map<string, typeof students>();
      for (const s of students) {
        const cid = String(s.classId);
        if (!studentsByClass.has(cid)) studentsByClass.set(cid, []);
        studentsByClass.get(cid)!.push(s);
      }

      // Pick the class explicitly flagged isHomeroom (if any) for the homeroom
      // slot; everything else goes into subjectClasses.
      const homeroomClass = classes.find((c) => c.isHomeroom === true) ?? null;
      const homeroomIdStr = homeroomClass ? String(homeroomClass._id) : null;

      return {
        homeroom: homeroomClass
          ? {
              class: homeroomClass,
              subject: subjectByClass.get(String(homeroomClass._id)) ?? null,
              students: studentsByClass.get(String(homeroomClass._id)) ?? [],
            }
          : null,
        subjectClasses: classes
          .filter((cls) => String(cls._id) !== homeroomIdStr)
          .map((cls) => ({
            class: cls,
            subject: subjectByClass.get(String(cls._id)) ?? null,
            students: studentsByClass.get(String(cls._id)) ?? [],
          })),
      };
    }

    // 1. Find homeroom class (school-affiliated teachers)
    const homeroom = await Class.findOne({ schoolId, teacherId, isDeleted: false }).lean();
    if (homeroom) {
      await resolveClassGradeFields([homeroom as unknown as Record<string, unknown>]);
    }

    // 2. Find timetable rows for this teacher
    const timetableRows = await Timetable.find({ schoolId, teacherId, isDeleted: false })
      .populate({ path: 'classId', match: { isDeleted: false } })
      .populate('subjectId', 'name code')
      .lean();

    // Resolve gradeId on each populated classDoc (same Grade↔CurriculumNode duality)
    const classDocs: Array<Record<string, unknown>> = [];
    for (const row of timetableRows) {
      if (row.classId && typeof row.classId === 'object' && !('_bsontype' in row.classId)) {
        classDocs.push(row.classId as unknown as Record<string, unknown>);
      }
    }
    if (classDocs.length > 0) await resolveClassGradeFields(classDocs);

    // Resolve subjectId — Timetable.subjectId may also point to a CurriculumNode
    // for standalone teachers' teaching groups.
    await resolveTimetableSubjectFields(timetableRows as unknown as Array<Record<string, unknown>>);

    // 3. De-duplicate by classId::subjectId
    const seen = new Set<string>();
    const uniqueEntries: Array<{ classId: Types.ObjectId; subjectId: Types.ObjectId; classDoc: unknown; subjectDoc: unknown }> = [];
    for (const row of timetableRows) {
      // Skip entries where classId was filtered out by populate match (deleted class)
      if (!row.classId || typeof row.classId !== 'object') continue;
      const key = `${String(row.classId && typeof row.classId === 'object' && '_id' in row.classId ? (row.classId as { _id: Types.ObjectId })._id : row.classId)}::${String(row.subjectId && typeof row.subjectId === 'object' && '_id' in row.subjectId ? (row.subjectId as { _id: Types.ObjectId })._id : row.subjectId)}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueEntries.push({
          classId: row.classId && typeof row.classId === 'object' && '_id' in row.classId
            ? (row.classId as { _id: Types.ObjectId })._id
            : row.classId as Types.ObjectId,
          subjectId: row.subjectId && typeof row.subjectId === 'object' && '_id' in row.subjectId
            ? (row.subjectId as { _id: Types.ObjectId })._id
            : row.subjectId as Types.ObjectId,
          classDoc: row.classId,
          subjectDoc: row.subjectId,
        });
      }
    }

    // 4. Collect all distinct classIds (homeroom + subject classes)
    const allClassIds: Types.ObjectId[] = [];
    if (homeroom) allClassIds.push(homeroom._id as Types.ObjectId);
    for (const entry of uniqueEntries) {
      allClassIds.push(entry.classId);
    }
    const uniqueClassIds = [...new Set(allClassIds.map((id) => String(id)))];

    // 5. Fetch all students in one query
    const students = await Student.find({
      schoolId,
      classId: { $in: uniqueClassIds },
      isDeleted: false,
    })
      .populate('userId', 'firstName lastName email profileImage')
      .lean();

    // 6. Group students by classId
    const studentsByClass = new Map<string, typeof students>();
    for (const student of students) {
      const cid = String(student.classId);
      if (!studentsByClass.has(cid)) studentsByClass.set(cid, []);
      studentsByClass.get(cid)!.push(student);
    }

    // 7. Assemble response — but DON'T duplicate the homeroom class as a
    // subjectClass entry if a Timetable row points back at it. For standalone
    // teachers a teaching group is both "homeroom" AND has one subject; the
    // frontend treats it as a single row. The homeroom entry absorbs the
    // subject from its matching Timetable row (if any) and the subject-classes
    // list excludes that overlap.
    const homeroomIdStr = homeroom ? String(homeroom._id) : null;
    const homeroomSubject = homeroomIdStr
      ? uniqueEntries.find((e) => String(e.classId) === homeroomIdStr)?.subjectDoc ?? null
      : null;

    return {
      homeroom: homeroom
        ? {
            class: homeroom,
            subject: homeroomSubject,
            students: studentsByClass.get(String(homeroom._id)) ?? [],
          }
        : null,
      subjectClasses: uniqueEntries
        .filter((entry) => String(entry.classId) !== homeroomIdStr)
        .map((entry) => ({
          class: entry.classDoc,
          subject: entry.subjectDoc,
          students: studentsByClass.get(String(entry.classId)) ?? [],
        })),
    };
  }

  /** Count existing timetable entries for a teacher on a given day. */
  static async countTimetableEntries(
    schoolId: string,
    teacherId: string,
    day: string,
  ): Promise<number> {
    return Timetable.countDocuments({ schoolId, teacherId, day, isDeleted: false });
  }

  /** Count students enrolled in a class. */
  static async countClassStudents(
    classId: string,
    schoolId: string,
  ): Promise<number> {
    return Student.countDocuments({ classId, schoolId, isDeleted: false });
  }

  static async getTeacherAccessibleClassIds(
    teacherId: string,
    schoolId: string,
  ): Promise<Types.ObjectId[]> {
    const [ownedClasses, timetableClassIds] = await Promise.all([
      Class.find({ schoolId, teacherId, isDeleted: false }).select('_id').lean(),
      Timetable.distinct('classId', { schoolId, teacherId, isDeleted: false }) as Promise<Types.ObjectId[]>,
    ]);

    const byId = new Map<string, Types.ObjectId>();
    for (const cls of ownedClasses) {
      byId.set(String(cls._id), cls._id as Types.ObjectId);
    }
    for (const classId of timetableClassIds) {
      byId.set(String(classId), classId);
    }

    return Array.from(byId.values());
  }

  static async teacherCanAccessClass(
    teacherId: string,
    classId: string,
    schoolId: string,
  ): Promise<boolean> {
    const [isHomeroom, hasTimetable] = await Promise.all([
      Class.exists({ _id: classId, schoolId, teacherId, isDeleted: false }),
      Timetable.exists({ schoolId, teacherId, classId, isDeleted: false }),
    ]);
    return !!(isHomeroom || hasTimetable);
  }
}
