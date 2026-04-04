import mongoose from 'mongoose';
import { AIPerformanceReport, TalentFlag } from './model-ai-sports.js';
import type { IAIPerformanceReport, ITalentFlag, AIReportType, TalentFlagStatus, IInsight } from './model-ai-sports.js';
import { StatsService } from './service-stats.js';
import { MatchStats } from './model-stats.js';
import { SportFixture, SportTeam } from './model.js';
import { SPORT_CONFIGS } from './sport-configs.js';
import { AIService } from '../../services/ai.service.js';
import { AIUsageLog } from '../AITools/model.js';
import { NotFoundError, BadRequestError } from '../../common/errors.js';

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';
const CACHE_DAYS = 7;

interface AIReportJSON {
  content: string;
  insights: IInsight[];
}

interface TalentEvaluation {
  studentId: string;
  level: 'school' | 'district' | 'provincial' | 'national';
  reasoning: string;
}

const JSON_FORMAT = ' Return JSON with "content" (natural language report) and "insights" (array of { category: "strength"|"weakness"|"trend"|"risk"|"recommendation"|"talent_flag", title: string, description: string, priority: "low"|"medium"|"high" }).';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCacheThreshold(): Date {
  const d = new Date();
  d.setDate(d.getDate() - CACHE_DAYS);
  return d;
}

async function findCachedReport(
  schoolId: string,
  studentId: string,
  sportCode: string,
  reportType: AIReportType,
): Promise<IAIPerformanceReport | null> {
  return AIPerformanceReport.findOne({
    schoolId,
    studentId,
    sportCode,
    reportType,
    isDeleted: false,
    createdAt: { $gte: getCacheThreshold() },
  }).sort({ createdAt: -1 });
}

async function logUsage(schoolId: string, userId: string, usage: { input_tokens: number; output_tokens: number }): Promise<void> {
  await AIUsageLog.create({
    schoolId,
    teacherId: userId,
    type: 'sports_analysis',
    tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
    aiModel: ANTHROPIC_MODEL,
  });
}

function buildPlayerDataPrompt(
  career: { appearances: number; aggregated: Record<string, number> },
  card: { overallRating: number; tier: string; position: string; formTrend: string; attributes: Map<string, number>; keyStats: Map<string, number> },
  personalBests: { event: string; value: number; unit: string }[],
  sportConfig: { name: string; positions: string[]; ratingAttributes: string[] },
): string {
  const pbs = personalBests.map((pb) => `${pb.event}: ${pb.value} ${pb.unit}`).join(', ') || 'None';
  return `Sport: ${sportConfig.name}\nPosition: ${card.position || 'Unknown'}\nOverall Rating: ${card.overallRating}/99 (${card.tier} tier)\nForm Trend: ${card.formTrend}\nAppearances: ${career.appearances}\nAttributes: ${JSON.stringify(Object.fromEntries(card.attributes))}\nCareer Stats: ${JSON.stringify(career.aggregated)}\nKey Stats: ${JSON.stringify(Object.fromEntries(card.keyStats))}\nPersonal Bests: ${pbs}\nRating Attributes: ${sportConfig.ratingAttributes.join(', ')}`;
}

// ─── AI Sports Service ───────────────────────────────────────────────────────

export class AISportsService {
  static async generatePlayerAnalysis(
    schoolId: string,
    studentId: string,
    sportCode: string,
    userId: string,
  ): Promise<IAIPerformanceReport> {
    const cached = await findCachedReport(schoolId, studentId, sportCode, 'player_analysis');
    if (cached) return cached;

    const { career, card, pbs, config } = await this.gatherPlayerData(schoolId, studentId, sportCode);
    const systemPrompt = `You are a sports performance analyst for school-level athletes. Analyse this player's stats and provide: strengths, weaknesses, trends, and development recommendations.${JSON_FORMAT}`;
    const userPrompt = buildPlayerDataPrompt(career, card, pbs, config);

    return this.generateAndSave(schoolId, studentId, sportCode, 'player_analysis', systemPrompt, userPrompt, userId);
  }

  static async generateDevelopmentPlan(
    schoolId: string,
    studentId: string,
    sportCode: string,
    userId: string,
  ): Promise<IAIPerformanceReport> {
    const cached = await findCachedReport(schoolId, studentId, sportCode, 'development_plan');
    if (cached) return cached;

    const { career, card, pbs, config } = await this.gatherPlayerData(schoolId, studentId, sportCode);
    const systemPrompt = `You are a sports development coach. Create a personalised development plan for this player. Include specific training focus areas prioritised by impact, recommended drills, and measurable goals for the next 3 months.${JSON_FORMAT}`;
    const userPrompt = buildPlayerDataPrompt(career, card, pbs, config);

    return this.generateAndSave(schoolId, studentId, sportCode, 'development_plan', systemPrompt, userPrompt, userId);
  }

  static async generateScoutingReport(
    schoolId: string,
    studentId: string,
    sportCode: string,
    userId: string,
  ): Promise<IAIPerformanceReport> {
    const cached = await findCachedReport(schoolId, studentId, sportCode, 'scouting_report');
    if (cached) return cached;

    const { career, card, pbs, config } = await this.gatherPlayerData(schoolId, studentId, sportCode);
    const systemPrompt = `You are a professional sports scout. Generate a scouting report suitable for provincial/academy review. Include physical attributes, technical skills, mental attributes, potential ceiling, and comparable players at professional level.${JSON_FORMAT}`;
    const userPrompt = buildPlayerDataPrompt(career, card, pbs, config);

    return this.generateAndSave(schoolId, studentId, sportCode, 'scouting_report', systemPrompt, userPrompt, userId);
  }

  static async generateParentReport(
    schoolId: string,
    studentId: string,
    sportCode: string,
    userId: string,
  ): Promise<IAIPerformanceReport> {
    const cached = await findCachedReport(schoolId, studentId, sportCode, 'parent_report');
    if (cached) return cached;

    const { career, card, pbs, config } = await this.gatherPlayerData(schoolId, studentId, sportCode);
    const systemPrompt = `You are a school sports coordinator writing to parents. Write a parent-friendly progress report. Use plain language. Include what's going well, areas for improvement, and what parents can do to support development.${JSON_FORMAT}`;
    const userPrompt = buildPlayerDataPrompt(career, card, pbs, config);

    return this.generateAndSave(schoolId, studentId, sportCode, 'parent_report', systemPrompt, userPrompt, userId);
  }

  static async generateMatchReport(
    schoolId: string,
    fixtureId: string,
    userId: string,
  ): Promise<IAIPerformanceReport> {
    const fixture = await SportFixture.findOne({ _id: fixtureId, schoolId, isDeleted: false });
    if (!fixture) throw new NotFoundError('Fixture not found');

    const stats = await MatchStats.findOne({ fixtureId, schoolId, isDeleted: false })
      .populate('playerStats.studentId', 'firstName lastName');
    if (!stats) throw new NotFoundError('Match stats not found for this fixture');

    const team = await SportTeam.findOne({ _id: stats.teamId, schoolId, isDeleted: false });
    const config = SPORT_CONFIGS[stats.sportCode];

    const cached = await findCachedReport(schoolId, String(fixture._id), stats.sportCode, 'match_report');
    if (cached) return cached;

    const playerLines = stats.playerStats.map((ps) => {
      const name = (ps.studentId as unknown as { firstName: string; lastName: string })?.firstName ?? 'Unknown';
      return `${name}: rating=${ps.rating ?? 'N/A'}, stats=${JSON.stringify(ps.stats)}`;
    }).join('\n');

    const systemPrompt = `You are a sports journalist. Generate a post-match analysis report. Include key moments, standout players, tactical observations, and areas to work on.${JSON_FORMAT}`;
    const userPrompt = `Sport: ${config?.name ?? stats.sportCode}
Team: ${team?.name ?? 'Unknown'}
Opponent: ${fixture.opponent}
Date: ${fixture.date.toISOString().slice(0, 10)}
Venue: ${fixture.venue}
Result: ${fixture.result ?? 'Not recorded'}
Team Stats: ${JSON.stringify(stats.teamStats ?? {})}
Player Performances:\n${playerLines}`;

    const { data, usage } = await AIService.generateJSONWithUsage<AIReportJSON>(systemPrompt, userPrompt);
    await logUsage(schoolId, userId, usage);

    const report = await AIPerformanceReport.create({
      schoolId,
      studentId: new mongoose.Types.ObjectId('000000000000000000000000'), // match-level, no single student
      sportCode: stats.sportCode,
      reportType: 'match_report',
      content: data.content,
      insights: data.insights ?? [],
    });

    return report;
  }

  static async generateTeamAnalysis(
    schoolId: string,
    teamId: string,
    sportCode: string,
    userId: string,
  ): Promise<IAIPerformanceReport> {
    const team = await SportTeam.findOne({ _id: teamId, schoolId, isDeleted: false });
    if (!team) throw new NotFoundError('Team not found');

    const matches = await MatchStats.find({ schoolId, teamId, sportCode, isDeleted: false })
      .populate('fixtureId', 'opponent date venue result')
      .sort({ createdAt: -1 })
      .limit(20);

    const matchSummaries = matches.map((m) => {
      const fix = m.fixtureId as unknown as { opponent: string; date: Date; result?: string };
      return `vs ${fix?.opponent ?? '?'} (${fix?.result ?? 'N/A'}) — team stats: ${JSON.stringify(m.teamStats ?? {})}`;
    }).join('\n');

    const systemPrompt = `You are a sports analyst. Analyse this team's season performance. Include win/loss trends, scoring patterns, defensive vulnerabilities, and recommendations.${JSON_FORMAT}`;
    const userPrompt = `Sport: ${SPORT_CONFIGS[sportCode]?.name ?? sportCode}\nTeam: ${team.name}\nMatches (${matches.length}):\n${matchSummaries}`;

    const { data, usage } = await AIService.generateJSONWithUsage<AIReportJSON>(systemPrompt, userPrompt);
    await logUsage(schoolId, userId, usage);

    const report = await AIPerformanceReport.create({
      schoolId,
      studentId: new mongoose.Types.ObjectId('000000000000000000000000'),
      sportCode,
      reportType: 'team_analysis',
      content: data.content,
      insights: data.insights ?? [],
    });

    return report;
  }

  static async identifyTalent(
    schoolId: string,
    sportCode: string,
    userId: string,
  ): Promise<ITalentFlag[]> {
    const config = SPORT_CONFIGS[sportCode];
    if (!config) throw new BadRequestError(`Unknown sport code: ${sportCode}`);

    const { cards } = await StatsService.getPlayerCards(schoolId, sportCode, 1, 100);
    const topPlayers = cards.filter((c) => c.overallRating >= 70);
    if (topPlayers.length === 0) return [];

    const existingFlags = await TalentFlag.find({ schoolId, sportCode, isDeleted: false, status: 'flagged' });
    const flaggedIds = new Set(existingFlags.map((f) => f.studentId.toString()));
    const unflagged = topPlayers.filter((c) => !flaggedIds.has(c.studentId.toString()));
    if (unflagged.length === 0) return existingFlags;

    const playerSummaries = unflagged.map((c) => {
      const attrs = Object.fromEntries(c.attributes);
      return `ID: ${c.studentId}, Rating: ${c.overallRating}, Tier: ${c.tier}, Position: ${c.position}, Form: ${c.formTrend}, Appearances: ${c.appearances}, Attributes: ${JSON.stringify(attrs)}`;
    }).join('\n');

    const systemPrompt = `You are a talent scout. Based on these player statistics, identify players who show district, provincial, or national potential. Consider: consistency, improvement trajectory, and athletic metrics. Return a JSON array of { studentId: string, level: "school"|"district"|"provincial"|"national", reasoning: string }. Only include players with genuine potential above school level.`;
    const userPrompt = `Sport: ${config.name}\nPlayers:\n${playerSummaries}`;

    const { data, usage } = await AIService.generateJSONWithUsage<TalentEvaluation[]>(systemPrompt, userPrompt);
    await logUsage(schoolId, userId, usage);

    const newFlags: ITalentFlag[] = [];
    for (const evaluation of data) {
      if (evaluation.level === 'school') continue;
      const player = unflagged.find((c) => c.studentId.toString() === evaluation.studentId);
      if (!player) continue;

      const flag = await TalentFlag.create({
        schoolId,
        studentId: player.studentId,
        sportCode,
        level: evaluation.level,
        reasoning: evaluation.reasoning,
        supportingStats: { overallRating: player.overallRating, tier: player.tier, appearances: player.appearances },
      });
      newFlags.push(flag);
    }

    return [...existingFlags, ...newFlags];
  }

  static async listTalentFlags(
    schoolId: string,
    sportCode?: string,
    status?: TalentFlagStatus,
  ): Promise<ITalentFlag[]> {
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (sportCode) filter.sportCode = sportCode;
    if (status) filter.status = status;
    return TalentFlag.find(filter)
      .populate('studentId', 'firstName lastName')
      .populate('reviewedBy', 'firstName lastName')
      .sort({ flaggedAt: -1 });
  }

  static async reviewTalentFlag(
    flagId: string,
    schoolId: string,
    userId: string,
    status: 'confirmed' | 'dismissed',
  ): Promise<ITalentFlag> {
    const flag = await TalentFlag.findOneAndUpdate(
      { _id: flagId, schoolId, isDeleted: false },
      { $set: { status, reviewedBy: userId } },
      { new: true },
    );
    if (!flag) throw new NotFoundError('Talent flag not found');
    return flag;
  }

  static async getReport(reportId: string, schoolId: string): Promise<IAIPerformanceReport> {
    const report = await AIPerformanceReport.findOne({ _id: reportId, schoolId, isDeleted: false });
    if (!report) throw new NotFoundError('Report not found');
    return report;
  }

  static async listReports(schoolId: string, studentId?: string, sportCode?: string, reportType?: AIReportType): Promise<IAIPerformanceReport[]> {
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (studentId) filter.studentId = studentId;
    if (sportCode) filter.sportCode = sportCode;
    if (reportType) filter.reportType = reportType;
    return AIPerformanceReport.find(filter).sort({ createdAt: -1 }).limit(50);
  }

  // ─── Private Helpers ─────────────────────────────────────────────────────

  private static async gatherPlayerData(schoolId: string, studentId: string, sportCode: string) {
    const config = SPORT_CONFIGS[sportCode];
    if (!config) throw new BadRequestError(`Unknown sport code: ${sportCode}`);

    const [career, card, pbs] = await Promise.all([
      StatsService.getPlayerCareerStats(schoolId, studentId, sportCode),
      StatsService.getPlayerCard(schoolId, studentId, sportCode),
      StatsService.getPersonalBests(schoolId, studentId, sportCode),
    ]);

    return { career, card, pbs, config };
  }

  private static async generateAndSave(
    schoolId: string, studentId: string, sportCode: string, reportType: AIReportType,
    systemPrompt: string, userPrompt: string, userId: string,
  ): Promise<IAIPerformanceReport> {
    const { data, usage } = await AIService.generateJSONWithUsage<AIReportJSON>(systemPrompt, userPrompt);
    await logUsage(schoolId, userId, usage);

    return AIPerformanceReport.create({
      schoolId,
      studentId,
      sportCode,
      reportType,
      content: data.content,
      insights: data.insights ?? [],
    });
  }
}
