import { GeneratedPaper, IGeneratedPaper, AIUsageLog } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';

interface PaperFilters {
  subject?: string;
  grade?: number;
  status?: string;
}

export async function getUsageStats(
  schoolId: string,
  dateRange?: { startDate?: string; endDate?: string },
): Promise<{
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  byType: Array<{ type: string; count: number; inputTokens: number; outputTokens: number }>;
}> {
  const match: Record<string, unknown> = {
    schoolId: new (await import('mongoose')).Types.ObjectId(schoolId),
  };

  if (dateRange?.startDate || dateRange?.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (dateRange.startDate) dateFilter.$gte = new Date(dateRange.startDate);
    if (dateRange.endDate) dateFilter.$lte = new Date(dateRange.endDate);
    match.createdAt = dateFilter;
  }

  const results = await AIUsageLog.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        inputTokens: { $sum: '$tokensUsed.input' },
        outputTokens: { $sum: '$tokensUsed.output' },
      },
    },
  ]);

  const byType = results.map((r) => ({
    type: r._id as string,
    count: r.count as number,
    inputTokens: r.inputTokens as number,
    outputTokens: r.outputTokens as number,
  }));

  return {
    totalCalls: byType.reduce((sum, t) => sum + t.count, 0),
    totalInputTokens: byType.reduce((sum, t) => sum + t.inputTokens, 0),
    totalOutputTokens: byType.reduce((sum, t) => sum + t.outputTokens, 0),
    byType,
  };
}

export async function getPapers(
  schoolId: string,
  filters: PaperFilters,
  page?: number,
  limit?: number,
): Promise<{ papers: IGeneratedPaper[]; total: number }> {
  const { skip, limit: take } = paginationHelper(page, limit);

  const query: Record<string, unknown> = { schoolId, isDeleted: false };

  if (filters.subject) query.subject = filters.subject;
  if (filters.grade) query.grade = filters.grade;
  if (filters.status) query.status = filters.status;

  const [papers, total] = await Promise.all([
    GeneratedPaper.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take)
      .populate('teacherId', 'firstName lastName email'),
    GeneratedPaper.countDocuments(query),
  ]);

  return { papers, total };
}

export async function getPaperById(
  id: string,
  schoolId: string,
): Promise<IGeneratedPaper> {
  const paper = await GeneratedPaper.findOne({ _id: id, schoolId, isDeleted: false }).populate(
    'teacherId',
    'firstName lastName email',
  );

  if (!paper) throw new NotFoundError('Paper not found');
  return paper;
}

export async function updatePaper(
  id: string,
  schoolId: string,
  updates: Record<string, unknown>,
): Promise<IGeneratedPaper> {
  const paper = await GeneratedPaper.findOne({ _id: id, schoolId, isDeleted: false });

  if (!paper) throw new NotFoundError('Paper not found');

  const allowedFields = ['subject', 'grade', 'topic', 'difficulty', 'duration', 'totalMarks', 'sections', 'memorandum'] as const;
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      (paper as unknown as Record<string, unknown>)[field] = updates[field];
    }
  }
  if (updates.sections || updates.memorandum) {
    paper.status = 'edited';
  }
  await paper.save();

  return paper;
}
