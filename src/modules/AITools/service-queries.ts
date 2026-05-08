import { AIUsageLog } from './model.js';

// Paper-CRUD query helpers (getPapers / getPaperById / updatePaper) have
// moved to QuestionBank/service-papers*.ts and operate on AssessmentPaper.
// Only the AI usage stats helper remains owned by AITools.

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
