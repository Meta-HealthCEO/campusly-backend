import { AIUsageLog } from './model.js';

// Paper-CRUD query helpers (getPapers / getPaperById / updatePaper) have
// moved to QuestionBank/service-papers*.ts and operate on AssessmentPaper.
// Only the AI usage stats helper remains owned by AITools.

export async function getUsageStats(
  schoolId: string,
  dateRange?: { startDate?: string; endDate?: string },
): Promise<{
  totalCalls: number;
  /** Uncached input (the API's input_tokens). */
  totalInputTokens: number;
  totalOutputTokens: number;
  /** Prompt-cache reads and writes (tutor chat), not included in totalInputTokens. */
  totalCacheReadTokens: number;
  totalCacheWriteTokens: number;
  /** Everything: input, output, cache reads and cache writes. */
  totalTokens: number;
  byType: Array<{
    type: string; count: number; inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number;
  }>;
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
        cacheReadTokens: { $sum: { $ifNull: ['$tokensUsed.cacheRead', 0] } },
        cacheWriteTokens: { $sum: { $ifNull: ['$tokensUsed.cacheWrite', 0] } },
      },
    },
  ]);

  const byType = results.map((r) => ({
    type: r._id as string,
    count: r.count as number,
    inputTokens: r.inputTokens as number,
    outputTokens: r.outputTokens as number,
    cacheReadTokens: r.cacheReadTokens as number,
    cacheWriteTokens: r.cacheWriteTokens as number,
  }));

  const total = (key: 'count' | 'inputTokens' | 'outputTokens' | 'cacheReadTokens' | 'cacheWriteTokens'): number =>
    byType.reduce((sum, t) => sum + t[key], 0);
  const [input, output, cacheRead, cacheWrite] = [total('inputTokens'), total('outputTokens'), total('cacheReadTokens'), total('cacheWriteTokens')];
  return {
    totalCalls: total('count'),
    totalInputTokens: input,
    totalOutputTokens: output,
    totalCacheReadTokens: cacheRead,
    totalCacheWriteTokens: cacheWrite,
    totalTokens: input + output + cacheRead + cacheWrite,
    byType,
  };
}
