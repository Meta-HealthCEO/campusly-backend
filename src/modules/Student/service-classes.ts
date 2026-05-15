import mongoose, { type Types } from 'mongoose';
import { Student } from './model.js';
import { Class } from '../Academic/model.js';

export interface MyClassesResult {
  homeroom: PopulatedClass | null;
  subjectClasses: PopulatedClass[];
}

export interface PopulatedClass {
  id: string;
  name: string;
  classroomCode: string;
  isHomeroom: boolean;
  grade: { id: string; name: string };
  teacher: { id: string; firstName: string; lastName: string };
}

interface PopulatedClassDoc {
  _id: Types.ObjectId;
  name: string;
  classroomCode: string;
  isHomeroom: boolean;
  gradeId: { _id: Types.ObjectId; name: string };
  teacherId: { _id: Types.ObjectId; firstName: string; lastName: string };
}

function shape(doc: PopulatedClassDoc): PopulatedClass {
  return {
    id: String(doc._id),
    name: doc.name,
    classroomCode: doc.classroomCode,
    isHomeroom: doc.isHomeroom,
    grade: { id: String(doc.gradeId._id), name: doc.gradeId.name },
    teacher: {
      id: String(doc.teacherId._id),
      firstName: doc.teacherId.firstName,
      lastName: doc.teacherId.lastName,
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
    .select('classId')
    .lean();

  if (!student) {
    return { homeroom: null, subjectClasses: [] };
  }

  const homeroomDoc = student.classId
    ? await Class.findOne({
        _id: student.classId,
        schoolId,
        isDeleted: false,
      })
        .populate<{ teacherId: PopulatedClassDoc['teacherId'] }>('teacherId', 'firstName lastName')
        .populate<{ gradeId: PopulatedClassDoc['gradeId'] }>('gradeId', 'name')
        .lean<PopulatedClassDoc | null>()
    : null;

  return {
    homeroom: homeroomDoc ? shape(homeroomDoc) : null,
    // v1: always return an empty subjectClasses array. v2 will populate from
    // student.subjectClassIds once the join handler and consuming services
    // are updated. See spec section 3.
    subjectClasses: [],
  };
}
