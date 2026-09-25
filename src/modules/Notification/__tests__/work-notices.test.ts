// src/modules/Notification/__tests__/work-notices.test.ts
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';

vi.mock('../../../jobs/course-generation.job.js', () => ({ enqueueCourseGeneration: vi.fn(async () => undefined) }));

import { Notification } from '../model.js';
import { Class, Subject } from '../../Academic/model.js';
import { Homework } from '../../Homework/model.js';
import { HomeworkService } from '../../Homework/service.js';
import { submitHomework } from '../../Homework/service-homework-submit.js';
import { Question } from '../../QuestionBank/model.js';
import { AssessmentPaper } from '../../QuestionBank/model-papers.js';
import { addAssignment } from '../../QuestionBank/service-paper-assignments.js';
import { Assignment } from '../../Assignment/model.js';
import { addClassAssignment, markSubmission, submitAssignment } from '../../Assignment/service.js';
import { ClassUnitService } from '../../Course/service-class-unit.js';
import { UserRole } from '../../../common/enums.js';
import { cleanUpClassrooms, standaloneClassroom, type Classroom, type Learner } from '../../../test-utils/standalone-classroom.js';
import { writtenUnit } from '../../../test-utils/class-unit.js';

type Oid = mongoose.Types.ObjectId;
const oid = () => new mongoose.Types.ObjectId();

beforeAll(async () => { if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGODB_TEST_URI!); });
afterAll(async () => { await cleanUpClassrooms(); await mongoose.disconnect(); });

/** Zola's own group is Science; Thabo joined Science; Lebo is only in Maths. */
async function setUp(): Promise<{ room: Classroom; zola: Learner; thabo: Learner; lebo: Learner; actor: { id: string; schoolId: string; email: string; role: UserRole } }> {
  const room = await standaloneClassroom();
  return {
    room,
    zola: await room.learner('Zola', room.science.id),
    thabo: await room.learner('Thabo', room.maths.id, [room.science.id]),
    lebo: await room.learner('Lebo', room.maths.id),
    actor: { id: String(room.teacherId), schoolId: String(room.schoolId), email: 't@test.local', role: UserRole.TEACHER },
  };
}

const told = (userId: Oid, entityType: string) => Notification.countDocuments({ recipientId: userId, 'data.entityType': entityType });

describe('new work', () => {
  it('homework: the whole group hears, with a link to it', async () => {
    const { room, zola, thabo, lebo, actor } = await setUp();
    const subject = await Subject.create({ schoolId: room.schoolId, name: 'Physical Sciences', code: `PS${Date.now() % 10000}` });
    // A question must be for the group's grade to be set as homework (Homework/service.ts loadAssignableQuestions).
    const cls = await Class.findById(room.science.id).lean();
    const question = await Question.create({
      schoolId: room.schoolId, subjectId: subject._id, gradeId: cls!.gradeId, curriculumNodeId: oid(), type: 'true_false', stem: 'Light is a wave.',
      media: [], diagram: null, options: [], answer: 'true', markingRubric: 'One mark.', marks: 1,
      cognitiveLevel: { caps: 'knowledge', blooms: 'remember' }, difficulty: 1, tags: [], source: 'teacher', status: 'approved', createdBy: room.teacherId,
    });
    const hw = await HomeworkService.create({
      type: 'exercise', title: 'Waves', subjectId: String(subject._id), classId: String(room.science.id),
      dueDate: new Date(Date.now() + 3 * 86_400_000).toISOString(), totalMarks: 1, exerciseQuestionIds: [String(question._id)],
      latePolicy: 'accept', gradebookAutoPublish: false,
    } as never, actor);
    expect(await told(zola.userId, 'homework')).toBe(1);
    expect(await told(thabo.userId, 'homework')).toBe(1);
    expect(await told(lebo.userId, 'homework')).toBe(0);
    const n = await Notification.findOne({ recipientId: thabo.userId, 'data.entityType': 'homework' }).lean();
    expect((n?.data as { link?: string }).link).toBe(`/student/homework/${String(hw._id)}`);
  });

  it('a lesson (unit): groups hear when it is released to them, and not again on a repeat release', async () => {
    const { room, zola, thabo } = await setUp();
    const unit = await writtenUnit(room);
    await ClassUnitService.release(unit.courseId, String(room.schoolId), unit.actor, [String(room.science.id)]);
    await ClassUnitService.release(unit.courseId, String(room.schoolId), unit.actor, [String(room.science.id)]);
    expect(await told(zola.userId, 'class_unit')).toBe(1);
    expect(await told(thabo.userId, 'class_unit')).toBe(1);
  });

  it('a project: heard when it opens now, not when it opens later', async () => {
    const { room, thabo, actor } = await setUp();
    const cls = await Class.findById(room.science.id).lean();
    const project = async (title: string): Promise<Oid> => {
      const _id = oid();
      await Assignment.collection.insertOne({
        _id, schoolId: room.schoolId, teacherId: room.teacherId, title, brief: 'Build it.', subjectId: oid(), gradeId: cls!.gradeId,
        totalMarks: 10, status: 'published', submissionFormat: 'text', latePolicy: 'accept', version: 1, isDeleted: false,
        rubric: [{ _id: oid(), name: 'Works', maxMarks: 10 }], assignedClasses: [], createdAt: new Date(), updatedAt: new Date(),
      });
      return _id;
    };
    await addClassAssignment(String(await project('Periscope')), actor as never, actor.id, { classId: String(room.science.id) });
    await addClassAssignment(String(await project('Later')), actor as never, actor.id, {
      classId: String(room.science.id), releaseAt: new Date(Date.now() + 86_400_000).toISOString(),
    });
    expect(await told(thabo.userId, 'project')).toBe(1);
  });

  it('a test: heard for an online test open now; not for a paper test or one that opens later (ruling R2)', async () => {
    const { room, thabo } = await setUp();
    const paper = async (): Promise<string> => String((await AssessmentPaper.create({
      schoolId: room.schoolId, title: 'Waves quiz', subjectId: oid(), gradeId: oid(), topicIds: [oid()], term: 3, year: 2026,
      paperType: 'class_test', totalMarks: 10, duration: 30, instructions: '', capsCompliance: null, status: 'finalised',
      aiGenerated: false, difficulty: 'medium', version: 1, createdBy: room.teacherId, isDeleted: false, assignments: [],
      sections: [{ title: 'A', instructions: '', order: 0, questions: [{ questionId: null, questionText: 'Define a wave.', options: [], marks: 10, position: 0, modelAnswer: 'x', markingGuideline: 'x', diagram: null }] }],
    }))._id);
    const at = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString();
    await addAssignment(await paper(), String(room.schoolId), String(room.teacherId), { classId: String(room.science.id), mode: 'digital', releaseAt: null, dueAt: at(5) });
    await addAssignment(await paper(), String(room.schoolId), String(room.teacherId), { classId: String(room.science.id), mode: 'paper', releaseAt: null, dueAt: at(5) });
    await addAssignment(await paper(), String(room.schoolId), String(room.teacherId), { classId: String(room.science.id), mode: 'digital', releaseAt: at(1), dueAt: at(5) });
    expect(await told(thabo.userId, 'test')).toBe(1);
  });
});

describe('marked work', () => {
  it('homework marked by the teacher: heard once per attempt', async () => {
    const { room, thabo, actor } = await setUp();
    const hwId = oid();
    await Homework.collection.insertOne({
      _id: hwId, schoolId: room.schoolId, classId: room.science.id, subjectId: oid(), teacherId: room.teacherId, title: 'Read: optics', type: 'reading',
      status: 'assigned', dueDate: new Date(Date.now() + 86_400_000), totalMarks: 5, latePolicy: 'accept', comprehensionQuestionIds: [],
      exerciseQuestionIds: [], gradebookAutoPublish: false, version: 1, isDeleted: false, createdAt: new Date(), updatedAt: new Date(),
    });
    const sub = await submitHomework(String(hwId), String(thabo.studentId), String(room.schoolId), { type: 'reading', markedReadAt: new Date().toISOString(), comprehensionAnswers: [] });
    await HomeworkService.gradeSubmission(String(sub._id), actor as never, 4, 'Good', actor.id);
    await HomeworkService.gradeSubmission(String(sub._id), actor as never, 5, 'Better', actor.id);
    expect(await told(thabo.userId, 'homework_marked')).toBe(1);
  });

  it('project marked by the teacher: heard', async () => {
    const { room, thabo, actor } = await setUp();
    const cls = await Class.findById(room.science.id).lean();
    const [projectId, criterionId] = [oid(), oid()];
    await Assignment.collection.insertOne({
      _id: projectId, schoolId: room.schoolId, teacherId: room.teacherId, title: 'Periscope', brief: 'Build it.', subjectId: oid(), gradeId: cls!.gradeId,
      totalMarks: 10, status: 'published', submissionFormat: 'text', latePolicy: 'accept', version: 1, isDeleted: false,
      rubric: [{ _id: criterionId, name: 'Works', maxMarks: 10 }], createdAt: new Date(), updatedAt: new Date(),
      assignedClasses: [{ _id: oid(), classId: room.science.id, releaseAt: null, dueAt: null, assignedBy: room.teacherId, assignedAt: new Date() }],
    });
    const sub = await submitAssignment(String(projectId), String(thabo.studentId), String(room.schoolId), { files: [], textAnswer: 'It works.' });
    await markSubmission(String(sub._id), actor as never, actor.id, { rubricMarks: [{ criterionId: String(criterionId), awarded: 8 }], teacherFeedback: 'Nice', publish: false } as never);
    expect(await told(thabo.userId, 'project_marked')).toBe(1);
  });
});
