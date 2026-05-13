// src/modules/QuestionBank/service-paper-marking-workspace.ts
//
// Single read query that powers the teacher's per-paper marking workspace
// (the "Marking" tab on the paper-detail page). Joins each assigned class's
// roster with that student's PaperSubmission (digital take) and PaperMarking
// (OCR or text marking) so the UI can render one row per student showing:
// "submitted online?", "marked yet?", and the right CTA per state.

import mongoose from 'mongoose';
import { AssessmentPaper } from './model.js';
import { Student } from '../Student/model.js';
import { Class } from '../Academic/model.js';
import { PaperSubmission, type IPaperSubmission } from './model-submissions.js';
import { PaperMarking, type IPaperMarking } from '../AITools/model-marking.js';
import { NotFoundError } from '../../common/errors.js';

function toOid(id: string | mongoose.Types.ObjectId): mongoose.Types.ObjectId {
  return id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);
}

type SubmissionStatus = IPaperSubmission['status'];
type MarkingStatus = IPaperMarking['status'];

export interface RosterStudent {
  studentId: string;
  studentName: string;
  admissionNumber: string;
  submission: {
    submissionId: string;
    status: SubmissionStatus;
    submittedAt: string | null;
  } | null;
  marking: {
    markingId: string;
    status: MarkingStatus;
    totalMarks: number;
    maxMarks: number;
    percentage: number;
    paperMismatch: boolean;
  } | null;
}

export interface RosterClass {
  classId: string;
  className: string;
  mode: 'digital' | 'paper';
  studentCount: number;
  students: RosterStudent[];
}

export interface PaperMarkingRoster {
  paperId: string;
  paperType: 'assessment';
  classes: RosterClass[];
}

interface PopulatedUser { firstName?: string; lastName?: string }
interface PopulatedStudent {
  _id: mongoose.Types.ObjectId;
  admissionNumber?: string;
  userId: PopulatedUser | null;
}

/**
 * Build the roster + marking-state view for a paper. Pulls the paper,
 * resolves every class assignment, fetches each class's students, and joins
 * in any existing submission + marking rows. One query per collection — no
 * per-student round trips.
 */
export async function getPaperMarkingRoster(
  paperId: string,
  schoolId: string,
): Promise<PaperMarkingRoster> {
  const paper = await AssessmentPaper.findOne({
    _id: toOid(paperId),
    schoolId: toOid(schoolId),
    isDeleted: false,
  }).select('assignments').lean();
  if (!paper) throw new NotFoundError('Paper not found');

  const assignments = paper.assignments ?? [];
  if (assignments.length === 0) {
    return { paperId, paperType: 'assessment', classes: [] };
  }

  const classIds = assignments.map((a) => a.classId);
  const [classes, students, submissions, markings] = await Promise.all([
    Class.find({ _id: { $in: classIds }, schoolId: toOid(schoolId), isDeleted: false })
      .select('_id name').lean(),
    Student.find({
      classId: { $in: classIds },
      schoolId: toOid(schoolId),
      isDeleted: false,
    })
      .select('admissionNumber userId classId')
      .populate<{ userId: PopulatedUser | null }>('userId', 'firstName lastName')
      .lean<PopulatedStudent[]>(),
    PaperSubmission.find({
      paperId: toOid(paperId),
      schoolId: toOid(schoolId),
      isDeleted: false,
    }).lean(),
    PaperMarking.find({
      paperId: toOid(paperId),
      schoolId: toOid(schoolId),
      isDeleted: false,
    }).select('_id studentId status totalMarks maxMarks percentage paperMismatch createdAt').lean(),
  ]);

  const classNameById = new Map<string, string>(
    classes.map((c) => [String(c._id), c.name]),
  );
  const studentsByClass = new Map<string, PopulatedStudent[]>();
  for (const s of students) {
    const key = String((s as PopulatedStudent & { classId?: mongoose.Types.ObjectId }).classId ?? '');
    const arr = studentsByClass.get(key) ?? [];
    arr.push(s);
    studentsByClass.set(key, arr);
  }
  const submissionByStudent = new Map<string, IPaperSubmission>(
    submissions.map((s) => [String(s.studentId), s as IPaperSubmission]),
  );
  // For markings we keep only the LATEST per student — re-marks supersede.
  const markingByStudent = new Map<string, IPaperMarking>();
  for (const m of markings) {
    if (!m.studentId) continue;
    const key = String(m.studentId);
    const existing = markingByStudent.get(key);
    if (!existing || (m.createdAt && existing.createdAt && m.createdAt > existing.createdAt)) {
      markingByStudent.set(key, m as IPaperMarking);
    }
  }

  const rosterClasses: RosterClass[] = assignments.map((assignment) => {
    const classIdStr = String(assignment.classId);
    const classStudents = studentsByClass.get(classIdStr) ?? [];
    const rosterStudents: RosterStudent[] = classStudents.map((s) => {
      const studentIdStr = String(s._id);
      const sub = submissionByStudent.get(studentIdStr);
      const mark = markingByStudent.get(studentIdStr);
      const firstName = s.userId?.firstName ?? '';
      const lastName = s.userId?.lastName ?? '';
      const fullName = `${firstName} ${lastName}`.trim() || s.admissionNumber || 'Student';
      return {
        studentId: studentIdStr,
        studentName: fullName,
        admissionNumber: s.admissionNumber ?? '',
        submission: sub ? {
          submissionId: String(sub._id),
          status: sub.status,
          submittedAt: sub.submittedAt ? sub.submittedAt.toISOString() : null,
        } : null,
        marking: mark ? {
          markingId: String(mark._id),
          status: mark.status,
          totalMarks: mark.totalMarks,
          maxMarks: mark.maxMarks,
          percentage: mark.percentage,
          paperMismatch: mark.paperMismatch,
        } : null,
      };
    });
    return {
      classId: classIdStr,
      className: classNameById.get(classIdStr) ?? 'Unknown class',
      mode: assignment.mode,
      studentCount: rosterStudents.length,
      students: rosterStudents.sort((a, b) => a.studentName.localeCompare(b.studentName)),
    };
  });

  return { paperId, paperType: 'assessment', classes: rosterClasses };
}
