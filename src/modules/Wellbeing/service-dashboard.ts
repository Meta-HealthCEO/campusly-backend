import mongoose from 'mongoose';
import { WellbeingSurvey, SurveyResponse } from './model.js';

interface DashboardQuery {
  schoolId: string;
  period?: 'week' | 'month' | 'term';
  gradeFilter?: number;
}

export class MoodDashboardService {
  static async getDashboard(query: DashboardQuery) {
    const schoolOid = new mongoose.Types.ObjectId(query.schoolId);
    const now = new Date();

    // Determine date range based on period
    const periodDays = query.period === 'week' ? 7 : query.period === 'term' ? 90 : 30;
    const startDate = new Date(now.getTime() - periodDays * 86400000);
    const prevStart = new Date(startDate.getTime() - periodDays * 86400000);

    // Get surveys with scale questions (mood) in the time range
    const surveyFilter: Record<string, unknown> = {
      schoolId: schoolOid,
      isDeleted: false,
      startDate: { $gte: prevStart },
    };
    if (query.gradeFilter) {
      surveyFilter.targetGrades = query.gradeFilter;
    }

    const surveys = await WellbeingSurvey.find(surveyFilter).lean();
    const surveyIds = surveys.map((s) => s._id);

    if (surveyIds.length === 0) {
      return {
        currentAverageMood: 0, previousAverageMood: 0, changePercent: 0,
        safetyScore: 0, trendData: [], feelingDistribution: {}, gradeBreakdown: [],
      };
    }

    const responses = await SurveyResponse.find({
      surveyId: { $in: surveyIds },
      schoolId: schoolOid,
      isDeleted: false,
    }).lean();

    // Compute mood from scale questions (first scale question = mood)
    const currentMoodScores: number[] = [];
    const prevMoodScores: number[] = [];
    const feelingCounts: Record<string, number> = {};
    let safetyYes = 0;
    let safetyTotal = 0;

    const trendBuckets: Record<string, { total: number; count: number }> = {};

    for (const resp of responses) {
      const survey = surveys.find((s) => s._id.toString() === resp.surveyId.toString());
      if (!survey) continue;

      const surveyDate = survey.startDate;
      const isCurrentPeriod = surveyDate >= startDate;

      for (const ans of resp.answers) {
        const q = survey.questions[ans.questionIndex];
        if (!q) continue;

        if (q.type === 'scale') {
          const val = Number(ans.value);
          if (!isNaN(val)) {
            if (isCurrentPeriod) {
              currentMoodScores.push(val);
              const dateKey = surveyDate.toISOString().slice(0, 10);
              if (!trendBuckets[dateKey]) trendBuckets[dateKey] = { total: 0, count: 0 };
              trendBuckets[dateKey].total += val;
              trendBuckets[dateKey].count += 1;
            } else {
              prevMoodScores.push(val);
            }
          }
        } else if (q.type === 'multiple_choice' && isCurrentPeriod) {
          const key = String(ans.value);
          feelingCounts[key] = (feelingCounts[key] ?? 0) + 1;
        } else if (q.type === 'yes_no' && isCurrentPeriod) {
          // Assume "safety" question if it contains "safe"
          if (q.text.toLowerCase().includes('safe')) {
            safetyTotal++;
            if (ans.value === true || ans.value === 'yes') safetyYes++;
          }
        }
      }
    }

    const avg = (arr: number[]) =>
      arr.length ? Math.round((arr.reduce((s, n) => s + n, 0) / arr.length) * 10) / 10 : 0;

    const currentAvg = avg(currentMoodScores);
    const prevAvg = avg(prevMoodScores);
    const changePercent = prevAvg > 0
      ? Math.round(((currentAvg - prevAvg) / prevAvg) * 1000) / 10
      : 0;

    // Convert feeling counts to percentages
    const feelingTotal = Object.values(feelingCounts).reduce((s, n) => s + n, 0);
    const feelingDistribution: Record<string, number> = {};
    for (const [key, count] of Object.entries(feelingCounts)) {
      feelingDistribution[key] = feelingTotal > 0
        ? Math.round((count / feelingTotal) * 1000) / 10 : 0;
    }

    // Trend data
    const trendData = Object.entries(trendBuckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, bucket]) => ({
        date,
        averageMood: Math.round((bucket.total / bucket.count) * 10) / 10,
        responseCount: bucket.count,
      }));

    // Grade breakdown (simplified - use targetGrades from surveys)
    const gradeBreakdown = await this.getGradeBreakdown(schoolOid, surveyIds, startDate);

    return {
      currentAverageMood: currentAvg,
      previousAverageMood: prevAvg,
      changePercent,
      safetyScore: safetyTotal > 0 ? Math.round((safetyYes / safetyTotal) * 1000) / 10 : 0,
      trendData,
      feelingDistribution,
      gradeBreakdown,
    };
  }

  private static async getGradeBreakdown(
    schoolOid: mongoose.Types.ObjectId,
    surveyIds: mongoose.Types.ObjectId[],
    startDate: Date,
  ) {
    // Get distinct grades from surveys
    const surveys = await WellbeingSurvey.find({
      _id: { $in: surveyIds },
      startDate: { $gte: startDate },
    }).lean();

    const allGrades = [...new Set(surveys.flatMap((s) => s.targetGrades))].sort();
    // Simple breakdown: same average for now (would need student grade in response)
    return allGrades.map((grade) => ({
      grade,
      averageMood: 0,
      responseRate: 0,
    }));
  }
}
