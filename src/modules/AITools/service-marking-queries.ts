// src/modules/AITools/service-marking-queries.ts
import mongoose from 'mongoose';
import { PaperMarking, type IPaperMarking } from './model-marking.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';

export async function listMarkings(
  schoolId: string,
  filters: { paperId?: string; studentId?: string; status?: string },
  page = 1,
  limit = 20,
): Promise<{ markings: IPaperMarking[]; total: number }> {
  const query: Record<string, unknown> = {
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  };
  if (filters.paperId) query.paperId = new mongoose.Types.ObjectId(filters.paperId);
  if (filters.studentId) query.studentId = new mongoose.Types.ObjectId(filters.studentId);
  if (filters.status) query.status = filters.status;

  const [markings, total] = await Promise.all([
    PaperMarking.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    PaperMarking.countDocuments(query),
  ]);
  return { markings: markings as IPaperMarking[], total };
}

export async function getMarkingById(id: string, schoolId: string): Promise<IPaperMarking> {
  const marking = await PaperMarking.findOne({
    _id: new mongoose.Types.ObjectId(id),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  }).lean();
  if (!marking) throw new NotFoundError('Marking not found');
  return marking as IPaperMarking;
}

export async function updateMarking(
  id: string,
  schoolId: string,
  updates: {
    questions?: Array<{
      questionNumber: string;
      marksAwarded: number;
      maxMarks: number;
      feedback?: string;
    }>;
    status?: 'completed' | 'needs_review';
  },
): Promise<IPaperMarking> {
  const marking = await PaperMarking.findOne({
    _id: new mongoose.Types.ObjectId(id),
    schoolId: new mongoose.Types.ObjectId(schoolId),
    isDeleted: false,
  });
  if (!marking) throw new NotFoundError('Marking not found');
  if (marking.status === 'published') {
    throw new BadRequestError('Cannot edit a published marking');
  }

  if (updates.questions) {
    marking.questions = marking.questions.map((existing) => {
      const override = updates.questions?.find((u) => u.questionNumber === existing.questionNumber);
      if (!override) return existing;
      return {
        ...existing,
        marksAwarded: override.marksAwarded,
        maxMarks: override.maxMarks,
        feedback: override.feedback ?? existing.feedback,
      };
    });
    marking.totalMarks = marking.questions.reduce((s, q) => s + (q.marksAwarded ?? 0), 0);
    marking.maxMarks = marking.questions.reduce((s, q) => s + (q.maxMarks ?? 0), 0);
    marking.percentage = marking.maxMarks > 0
      ? Math.round((marking.totalMarks / marking.maxMarks) * 1000) / 10
      : 0;
  }
  if (updates.status) {
    marking.status = updates.status;
  }
  await marking.save();
  return marking.toObject() as IPaperMarking;
}
