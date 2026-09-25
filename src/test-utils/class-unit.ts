// src/test-utils/class-unit.ts
//
// Test fixture: a class unit in a standalone classroom whose outline is
// approved and whose one notes item is written, ready to release (the shape
// of Course/__tests__/class-unit-release.test.ts writtenUnit()).
import mongoose from 'mongoose';
import { Course, CourseLesson, CourseModule } from '../modules/Course/model.js';
import { ContentResource } from '../modules/ContentLibrary/model.js';
import type { CourseActor } from '../modules/Course/service.js';
import type { Classroom } from './standalone-classroom.js';

const oid = () => new mongoose.Types.ObjectId();

export async function writtenUnit(room: Classroom, title = 'Forces · Grade 10 · Term 3'): Promise<{ courseId: string; actor: CourseActor }> {
  const resource = await ContentResource.collection.insertOne({
    schoolId: room.schoolId, title: "Newton's first law", type: 'study_notes', format: 'static', status: 'draft', isDeleted: false,
    blocks: [{ blockId: 'b1', type: 'text', order: 0, content: 'An object stays at rest unless a force acts on it.' }],
  });
  const course = await Course.create({
    schoolId: room.schoolId, title, slug: `unit-${oid().toString()}`, createdBy: room.teacherId, kind: 'class_unit', outlineStatus: 'approved',
    scope: { gradeId: oid(), subjectId: oid(), termNumber: 3, topicNodeIds: [oid()], classIds: [] },
    generation: { status: 'done', total: 1, done: 1, failed: 0 },
  });
  const mod = await CourseModule.create({ schoolId: room.schoolId, courseId: course._id, title: 'Forces', orderIndex: 0, curriculumNodeId: oid() });
  await CourseLesson.create({
    schoolId: room.schoolId, courseId: course._id, moduleId: mod._id, orderIndex: 0, title: "Newton's first law",
    type: 'content', itemKind: 'notes', genStatus: 'ready', contentResourceId: resource.insertedId,
  });
  const actor: CourseActor = { userId: String(room.teacherId), role: 'teacher' as CourseActor['role'], isHOD: false, isSchoolPrincipal: false };
  return { courseId: String(course._id), actor };
}
