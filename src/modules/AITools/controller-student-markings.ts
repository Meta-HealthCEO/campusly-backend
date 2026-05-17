import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PaperMarking } from './model-marking.js';
import { AssessmentPaper } from '../QuestionBank/model-papers.js';
import { Subject } from '../Academic/model.js';
import { resolveStudentForUser } from './service-student-ownership.js';
import { apiResponse } from '../../common/utils.js';
import { getUser } from '../../types/authenticated-request.js';

interface StudentMarkingSummary {
  id: string;
  paperId: string;
  paperTitle: string;
  subjectId: string;
  subjectName: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  issuedAt: Date;
}

export async function listStudentMarkings(req: Request, res: Response): Promise<void> {
  const userSchoolId = req.user?.schoolId;
  if (!userSchoolId) {
    res.status(400).json({ success: false, error: 'User must be assigned to a school' });
    return;
  }
  const { studentId, schoolId } = await resolveStudentForUser(getUser(req).id, userSchoolId);
  const paperIdFilter = req.query.paperId as string | undefined;

  const filter: Record<string, unknown> = {
    studentId: new mongoose.Types.ObjectId(studentId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    issuedToStudent: true,
    isDeleted: false,
  };
  if (paperIdFilter && mongoose.Types.ObjectId.isValid(paperIdFilter)) {
    filter.paperId = new mongoose.Types.ObjectId(paperIdFilter);
  }

  const markings = await PaperMarking.find(filter)
    .sort({ issuedAt: -1 })
    .select('_id paperId totalMarks maxMarks percentage issuedAt')
    .lean();

  if (markings.length === 0) {
    res.json(apiResponse(true, [], 'Markings retrieved'));
    return;
  }

  const paperIds = [...new Set(markings.map((m) => String(m.paperId)))];
  const papers = await AssessmentPaper.find({
    _id: { $in: paperIds },
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  })
    .select('_id title subjectId')
    .lean();

  const subjectIds = [...new Set(papers.map((p) => String(p.subjectId)))];
  const subjects = await Subject.find({ _id: { $in: subjectIds }, isDeleted: false })
    .select('_id name')
    .lean();
  const subjectName = new Map(subjects.map((s) => [String(s._id), s.name]));
  const paperLookup = new Map(papers.map((p) => [String(p._id), p]));

  const summaries: StudentMarkingSummary[] = markings.map((m) => {
    const paper = paperLookup.get(String(m.paperId));
    return {
      id: String(m._id),
      paperId: String(m.paperId),
      paperTitle: paper?.title ?? 'Paper',
      subjectId: paper ? String(paper.subjectId) : '',
      subjectName: paper ? subjectName.get(String(paper.subjectId)) ?? '' : '',
      totalMarks: m.totalMarks,
      maxMarks: m.maxMarks,
      percentage: m.percentage,
      issuedAt: m.issuedAt as Date,
    };
  });

  res.json(apiResponse(true, summaries, 'Markings retrieved'));
}

export async function getStudentMarking(req: Request, res: Response): Promise<void> {
  const userSchoolId = req.user?.schoolId;
  if (!userSchoolId) {
    res.status(400).json({ success: false, error: 'User must be assigned to a school' });
    return;
  }
  const { studentId, schoolId } = await resolveStudentForUser(getUser(req).id, userSchoolId);
  const id = req.params.id as string;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).json({ success: false, error: 'Marking not found' });
    return;
  }
  const marking = await PaperMarking.findOne({
    _id: new mongoose.Types.ObjectId(id),
    studentId: new mongoose.Types.ObjectId(studentId),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    issuedToStudent: true,
    isDeleted: false,
  }).lean();
  if (!marking) {
    res.status(404).json({ success: false, error: 'Marking not found' });
    return;
  }

  const paper = await AssessmentPaper.findOne({
    _id: marking.paperId,
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  })
    .select('title subjectId')
    .lean();
  const subject = paper
    ? await Subject.findOne({ _id: paper.subjectId, isDeleted: false }).select('name').lean()
    : null;

  // Strip teacher-only metadata from the response.
  const { aiRawResult, errorMessage, ...safe } = marking;
  void aiRawResult;
  void errorMessage;

  res.json(
    apiResponse(true, {
      ...safe,
      paperTitle: paper?.title ?? 'Paper',
      subjectId: paper ? String(paper.subjectId) : '',
      subjectName: subject?.name ?? '',
    }, 'Marking retrieved'),
  );
}
