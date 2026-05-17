import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import type { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Class, Grade, Subject, Timetable } from '../model.js';
import { AcademicService } from '../service.js';
import { ClassController } from '../controllers/class.controller.js';
import { StudentController } from '../../Student/controller.js';
import { Student } from '../../Student/model.js';
import { User } from '../../Auth/model.js';

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campusly-test');
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
});

beforeEach(async () => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

function classroomCode(): string {
  return new mongoose.Types.ObjectId().toString().slice(-8).toUpperCase();
}

async function createTeacher(schoolId: mongoose.Types.ObjectId, suffix: string) {
  const unique = `${schoolId.toString()}-${suffix}`;
  return User.create({
    email: `teacher-${unique}@example.com`,
    password: 'Password123!',
    firstName: 'Teacher',
    lastName: suffix,
    role: 'teacher',
    schoolId,
    isActive: true,
    isStandaloneTeacher: true,
  });
}

async function createGrade(schoolId: mongoose.Types.ObjectId, suffix: string) {
  return Grade.create({
    schoolId,
    name: `Grade ${suffix}`,
    orderIndex: Number.parseInt(suffix.replace(/\D/g, ''), 10) || 1,
  });
}

function mockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
}

function teacherReq(input: {
  teacherId: string;
  schoolId: string;
  params?: Record<string, string>;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
}): Request {
  return {
    user: {
      id: input.teacherId,
      role: 'teacher',
      schoolId: input.schoolId,
      email: 'teacher@example.com',
      isStandaloneTeacher: true,
    },
    params: input.params ?? {},
    body: input.body ?? {},
    query: input.query ?? {},
  } as unknown as Request;
}

describe('teaching group hardening', () => {
  it('blocks teachers from reading or revealing join codes for inaccessible groups', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const owner = await createTeacher(schoolId, 'owner');
    const outsider = await createTeacher(schoolId, 'outsider');
    const cls = await Class.create({
      name: 'Accounting A',
      schoolId,
      gradeId: new mongoose.Types.ObjectId(),
      teacherId: owner._id,
      capacity: 30,
      classroomCode: classroomCode(),
    });

    const req = teacherReq({
      teacherId: String(outsider._id),
      schoolId: String(schoolId),
      params: { id: String(cls._id) },
    });

    await expect(ClassController.getClass(req, mockRes())).rejects.toMatchObject({
      statusCode: 403,
    });
    await expect(ClassController.getClassJoinCode(req, mockRes())).rejects.toMatchObject({
      statusCode: 403,
    });
    await expect(ClassController.regenerateClassJoinCode(req, mockRes())).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('scopes teacher learner lists to owned and timetabled teaching groups', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacher = new mongoose.Types.ObjectId();
    const otherTeacher = new mongoose.Types.ObjectId();
    const gradeId = new mongoose.Types.ObjectId();
    const subjectId = new mongoose.Types.ObjectId();
    const owned = await Class.create({
      name: 'Owned',
      schoolId,
      gradeId,
      teacherId: teacher,
      capacity: 30,
      classroomCode: classroomCode(),
    });
    const taught = await Class.create({
      name: 'Taught',
      schoolId,
      gradeId,
      teacherId: otherTeacher,
      capacity: 30,
      classroomCode: classroomCode(),
    });
    const inaccessible = await Class.create({
      name: 'Other',
      schoolId,
      gradeId,
      teacherId: otherTeacher,
      capacity: 30,
      classroomCode: classroomCode(),
    });
    await Timetable.create({
      schoolId,
      teacherId: teacher,
      classId: taught._id,
      subjectId,
      day: 'monday',
      period: 1,
      startTime: '08:00',
      endTime: '08:30',
    });
    await Student.create([
      { schoolId, gradeId, classId: owned._id, admissionNumber: 'OWN-1' },
      { schoolId, gradeId, classId: taught._id, admissionNumber: 'TAUGHT-1' },
      { schoolId, gradeId, classId: inaccessible._id, admissionNumber: 'OTHER-1' },
    ]);

    const res = mockRes();
    await StudentController.list(teacherReq({
      teacherId: String(teacher),
      schoolId: String(schoolId),
    }), res);

    const payload = res.json.mock.calls[0][0] as {
      data: { students: Array<{ admissionNumber: string }> };
    };
    expect(payload.data.students.map((s) => s.admissionNumber).sort()).toEqual([
      'OWN-1',
      'TAUGHT-1',
    ]);
  });

  it('clears a teaching group subject when the teacher selects no subject', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacher = await createTeacher(schoolId, 'clear');
    const grade = await createGrade(schoolId, '10');
    const cls = await Class.create({
      name: 'Revision Group',
      schoolId,
      gradeId: grade._id,
      teacherId: teacher._id,
      capacity: 20,
      classroomCode: classroomCode(),
    });
    const timetable = await Timetable.create({
      schoolId,
      teacherId: teacher._id,
      classId: cls._id,
      subjectId: new mongoose.Types.ObjectId(),
      day: 'monday',
      period: 1,
      startTime: '08:00',
      endTime: '08:30',
    });

    await ClassController.updateClass(teacherReq({
      teacherId: String(teacher._id),
      schoolId: String(schoolId),
      params: { id: String(cls._id) },
      body: {
        name: 'Revision Group',
        gradeId: String(grade._id),
        capacity: 20,
        subjectId: null,
      },
    }), mockRes());

    const stored = await Timetable.findById(timetable._id).lean();
    expect(stored?.isDeleted).toBe(true);
  });

  it('rejects invalid subject-grade updates before mutating the group', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacher = await createTeacher(schoolId, 'validate');
    const classGrade = await createGrade(schoolId, '11');
    const subjectGrade = await createGrade(schoolId, '12');
    const cls = await Class.create({
      name: 'Original Name',
      schoolId,
      gradeId: classGrade._id,
      teacherId: teacher._id,
      capacity: 20,
      classroomCode: classroomCode(),
    });
    const subject = await Subject.create({
      name: 'Physical Sciences',
      code: 'PHYSCI',
      schoolId,
      gradeIds: [subjectGrade._id],
    });
    const updateSpy = vi.spyOn(AcademicService, 'updateClass');

    await expect(ClassController.updateClass(teacherReq({
      teacherId: String(teacher._id),
      schoolId: String(schoolId),
      params: { id: String(cls._id) },
      body: {
        name: 'Should Not Persist',
        gradeId: String(classGrade._id),
        capacity: 20,
        subjectId: String(subject._id),
      },
    }), mockRes())).rejects.toMatchObject({ statusCode: 400 });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('rejects teaching group grade updates outside the teacher school before mutating', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const otherSchoolId = new mongoose.Types.ObjectId();
    const teacher = await createTeacher(schoolId, 'grade-scope');
    const grade = await createGrade(schoolId, '8');
    const otherGrade = await createGrade(otherSchoolId, '9');
    const cls = await Class.create({
      name: 'Scoped Group',
      schoolId,
      gradeId: grade._id,
      teacherId: teacher._id,
      capacity: 20,
      classroomCode: classroomCode(),
    });
    const updateSpy = vi.spyOn(AcademicService, 'updateClass');

    await expect(ClassController.updateClass(teacherReq({
      teacherId: String(teacher._id),
      schoolId: String(schoolId),
      params: { id: String(cls._id) },
      body: {
        name: 'Scoped Group',
        gradeId: String(otherGrade._id),
        capacity: 20,
      },
    }), mockRes())).rejects.toMatchObject({ statusCode: 400 });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('rejects grade changes that would leave the current subject incompatible', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const teacher = await createTeacher(schoolId, 'current-subject');
    const grade = await createGrade(schoolId, '6');
    const otherGrade = await createGrade(schoolId, '7');
    const subject = await Subject.create({
      name: 'Mathematics',
      code: 'MATH',
      schoolId,
      gradeIds: [grade._id],
    });
    const cls = await Class.create({
      name: 'Math Group',
      schoolId,
      gradeId: grade._id,
      teacherId: teacher._id,
      capacity: 20,
      classroomCode: classroomCode(),
    });
    await Timetable.create({
      schoolId,
      teacherId: teacher._id,
      classId: cls._id,
      subjectId: subject._id,
      day: 'monday',
      period: 1,
      startTime: '08:00',
      endTime: '08:30',
    });
    const updateSpy = vi.spyOn(AcademicService, 'updateClass');

    await expect(ClassController.updateClass(teacherReq({
      teacherId: String(teacher._id),
      schoolId: String(schoolId),
      params: { id: String(cls._id) },
      body: {
        name: 'Math Group',
        gradeId: String(otherGrade._id),
        capacity: 20,
      },
    }), mockRes())).rejects.toMatchObject({ statusCode: 400 });

    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('derives learner school and grade from the selected teaching group', async () => {
    const schoolId = new mongoose.Types.ObjectId();
    const otherSchoolId = new mongoose.Types.ObjectId();
    const teacher = await createTeacher(schoolId, 'learner-derive');
    const grade = await createGrade(schoolId, '5');
    const otherGrade = await createGrade(otherSchoolId, '5');
    const cls = await Class.create({
      name: 'Learner Group',
      schoolId,
      gradeId: grade._id,
      teacherId: teacher._id,
      capacity: 20,
      classroomCode: classroomCode(),
    });

    const res = mockRes();
    await StudentController.create(teacherReq({
      teacherId: String(teacher._id),
      schoolId: String(schoolId),
      body: {
        schoolId: String(otherSchoolId),
        gradeId: String(otherGrade._id),
        classId: String(cls._id),
        admissionNumber: `TG-${new mongoose.Types.ObjectId().toString().slice(-6)}`,
      },
    }), res);

    const payload = res.json.mock.calls[0][0] as {
      data: { student: { _id: mongoose.Types.ObjectId } };
    };
    const stored = await Student.findById(payload.data.student._id).lean();
    expect(String(stored?.schoolId)).toBe(String(schoolId));
    expect(String(stored?.gradeId)).toBe(String(grade._id));
    expect(String(stored?.classId)).toBe(String(cls._id));
  });
});
