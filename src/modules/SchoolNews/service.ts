import mongoose from 'mongoose';
import { NewsArticle } from './model.js';
import type { CreateArticleInput, UpdateArticleInput, GenerateArticleInput } from './validation.js';
import { NotFoundError } from '../../common/errors.js';
import { paginationHelper } from '../../common/utils.js';
import { AIService } from '../../services/ai.service.js';
import { AIUsageLog } from '../AITools/model.js';
import { SportFixture, SportTeam } from '../Sport/model.js';
import { Achievement } from '../Achiever/model.js';
import { Event } from '../Event/model.js';

interface ArticleFilters {
  category?: string;
  status?: string;
  search?: string;
}

interface GeneratedContent {
  title: string;
  content: string;
  excerpt: string;
}

// ─── Source Data Fetchers ──────────────────────────────────────────────────

async function fetchSportsData(schoolId: string, sourceId?: string) {
  const oid = new mongoose.Types.ObjectId(schoolId);

  if (sourceId) {
    const fixture = await SportFixture.findOne({
      _id: sourceId, schoolId: oid, isDeleted: false,
    }).lean();
    if (fixture) {
      const team = await SportTeam.findOne({
        _id: fixture.teamId, schoolId: oid, isDeleted: false,
      }).lean();
      return { fixtures: [fixture], teams: team ? [team] : [] };
    }
  }

  const recentFixtures = await SportFixture.find({
    schoolId: oid, isDeleted: false, result: { $exists: true, $ne: '' },
  }).sort({ date: -1 }).limit(5).lean();

  const teamIds = [...new Set(recentFixtures.map((f) => f.teamId.toString()))];
  const teams = await SportTeam.find({
    _id: { $in: teamIds }, schoolId: oid, isDeleted: false,
  }).lean();

  return { fixtures: recentFixtures, teams };
}

async function fetchAchievementData(schoolId: string, sourceId?: string) {
  const oid = new mongoose.Types.ObjectId(schoolId);

  if (sourceId) {
    const achievement = await Achievement.findOne({
      _id: sourceId, schoolId: oid, isDeleted: false,
    }).populate('studentId', 'firstName lastName').lean();
    return achievement ? [achievement] : [];
  }

  return Achievement.find({ schoolId: oid, isDeleted: false, isPublic: true })
    .sort({ awardedAt: -1 })
    .limit(10)
    .populate('studentId', 'firstName lastName')
    .lean();
}

async function fetchEventData(schoolId: string, sourceId?: string) {
  const oid = new mongoose.Types.ObjectId(schoolId);

  if (sourceId) {
    const event = await Event.findOne({
      _id: sourceId, schoolId: oid, isDeleted: false,
    }).lean();
    return event ? [event] : [];
  }

  return Event.find({ schoolId: oid, isDeleted: false })
    .sort({ date: -1 })
    .limit(5)
    .lean();
}

async function fetchTermHighlights(schoolId: string) {
  const oid = new mongoose.Types.ObjectId(schoolId);

  const [achievements, fixtures, events] = await Promise.all([
    Achievement.find({ schoolId: oid, isDeleted: false, isPublic: true })
      .sort({ awardedAt: -1 }).limit(10)
      .populate('studentId', 'firstName lastName').lean(),
    SportFixture.find({
      schoolId: oid, isDeleted: false, result: { $exists: true, $ne: '' },
    }).sort({ date: -1 }).limit(10).lean(),
    Event.find({ schoolId: oid, isDeleted: false })
      .sort({ date: -1 }).limit(5).lean(),
  ]);

  return { achievements, fixtures, events };
}

// ─── AI Prompt Building ────────────────────────────────────────────────────

function buildPrompt(
  sourceType: string,
  sourceData: Record<string, unknown>,
  customPrompt?: string,
): { system: string; user: string } {
  const system = [
    'You are a school news writer. Write engaging, professional articles for a school website.',
    'Tone: professional but warm, celebrating student achievement.',
    'Style: short paragraphs, engaging headline, specific names/scores/facts when available.',
    'Always return a JSON object with exactly: { "title": string, "content": string, "excerpt": string }',
    'The content should be 3-6 paragraphs. The excerpt should be 1-2 sentences (max 500 chars).',
  ].join('\n');

  let userPrompt = '';

  switch (sourceType) {
    case 'sports_result':
      userPrompt = `Write a sports news article based on these results:\n${JSON.stringify(sourceData, null, 2)}`;
      break;
    case 'achievement':
      userPrompt = `Write a news article celebrating these student achievements:\n${JSON.stringify(sourceData, null, 2)}`;
      break;
    case 'event_recap':
      userPrompt = `Write an event recap article based on this event data:\n${JSON.stringify(sourceData, null, 2)}`;
      break;
    case 'term_highlights':
      userPrompt = `Write a term highlights article summarising the best moments from this term:\n${JSON.stringify(sourceData, null, 2)}`;
      break;
    default:
      userPrompt = `Write a general school news article.\n${JSON.stringify(sourceData, null, 2)}`;
  }

  if (customPrompt) {
    userPrompt += `\n\nAdditional instructions from the author: ${customPrompt}`;
  }

  return { system, user: userPrompt };
}

// ─── Service Class ─────────────────────────────────────────────────────────

export class SchoolNewsService {
  static async createArticle(
    userId: string,
    userName: string,
    schoolId: string,
    input: CreateArticleInput,
  ) {
    const article = new NewsArticle({
      schoolId,
      authorId: userId,
      authorName: userName,
      title: input.title,
      content: input.content,
      category: input.category,
      excerpt: input.excerpt ?? '',
      tags: input.tags ?? [],
      coverImage: input.coverImage,
      featured: input.featured ?? false,
      sourceType: 'manual',
      status: 'draft',
    });
    return article.save();
  }

  static async generateArticle(
    userId: string,
    userName: string,
    schoolId: string,
    input: GenerateArticleInput,
  ) {
    let sourceData: Record<string, unknown> = {};

    switch (input.sourceType) {
      case 'sports_result':
        sourceData = await fetchSportsData(schoolId, input.sourceId) as unknown as Record<string, unknown>;
        break;
      case 'achievement':
        sourceData = { achievements: await fetchAchievementData(schoolId, input.sourceId) };
        break;
      case 'event_recap':
        sourceData = { events: await fetchEventData(schoolId, input.sourceId) };
        break;
      case 'term_highlights':
        sourceData = await fetchTermHighlights(schoolId) as unknown as Record<string, unknown>;
        break;
    }

    const { system, user } = buildPrompt(input.sourceType, sourceData, input.customPrompt);
    const { data: generated, usage } = await AIService.generateJSONWithUsage<GeneratedContent>(system, user);

    await AIUsageLog.create({
      schoolId,
      teacherId: userId,
      type: 'news_generation',
      tokensUsed: { input: usage.input_tokens, output: usage.output_tokens },
      aiModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    });

    const article = new NewsArticle({
      schoolId,
      authorId: userId,
      authorName: userName,
      title: generated.title,
      content: generated.content,
      excerpt: generated.excerpt,
      category: input.category,
      sourceType: 'ai_generated',
      sourceData,
      status: 'draft',
      tags: [],
      featured: false,
    });

    return article.save();
  }

  static async listArticles(
    schoolId: string,
    filters?: ArticleFilters,
    page?: number,
    limit?: number,
  ) {
    const { skip, limit: lim } = paginationHelper(page, limit);
    const query: Record<string, unknown> = { schoolId, isDeleted: false };

    if (filters?.category) query.category = filters.category;
    if (filters?.status) query.status = filters.status;
    if (filters?.search) {
      query.title = { $regex: filters.search, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      NewsArticle.find(query).sort({ createdAt: -1 }).skip(skip).limit(lim).lean(),
      NewsArticle.countDocuments(query),
    ]);

    return { data, total, page: page ?? 1, limit: lim, totalPages: Math.ceil(total / lim) };
  }

  static async getArticle(articleId: string, schoolId: string) {
    const article = await NewsArticle.findOneAndUpdate(
      { _id: articleId, schoolId, isDeleted: false },
      { $inc: { viewCount: 1 } },
      { new: true },
    ).lean();
    if (!article) throw new NotFoundError('Article not found');
    return article;
  }

  static async updateArticle(
    articleId: string,
    userId: string,
    schoolId: string,
    input: UpdateArticleInput,
  ) {
    const article = await NewsArticle.findOne({ _id: articleId, schoolId, isDeleted: false });
    if (!article) throw new NotFoundError('Article not found');

    const updated = await NewsArticle.findOneAndUpdate(
      { _id: articleId, schoolId, isDeleted: false },
      { $set: input },
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundError('Article not found');
    return updated;
  }

  static async publishArticle(articleId: string, _userId: string, schoolId: string) {
    const article = await NewsArticle.findOneAndUpdate(
      { _id: articleId, schoolId, isDeleted: false },
      { $set: { status: 'published', publishedAt: new Date() } },
      { new: true },
    );
    if (!article) throw new NotFoundError('Article not found');
    return article;
  }

  static async archiveArticle(articleId: string, _userId: string, schoolId: string) {
    const article = await NewsArticle.findOneAndUpdate(
      { _id: articleId, schoolId, isDeleted: false },
      { $set: { status: 'archived' } },
      { new: true },
    );
    if (!article) throw new NotFoundError('Article not found');
    return article;
  }

  static async deleteArticle(articleId: string, _userId: string, schoolId: string) {
    const article = await NewsArticle.findOneAndUpdate(
      { _id: articleId, schoolId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!article) throw new NotFoundError('Article not found');
    return article;
  }

  static async getFeaturedArticles(schoolId: string, limit = 5) {
    return NewsArticle.find({
      schoolId,
      isDeleted: false,
      status: 'published',
      featured: true,
    }).sort({ publishedAt: -1 }).limit(limit).lean();
  }

  static async getNewsFeed(
    schoolId: string,
    category?: string,
    page?: number,
    limit?: number,
  ) {
    const { skip, limit: lim } = paginationHelper(page, limit);
    const query: Record<string, unknown> = {
      schoolId,
      isDeleted: false,
      status: 'published',
    };
    if (category && category !== 'all') query.category = category;

    const [data, total] = await Promise.all([
      NewsArticle.find(query).sort({ publishedAt: -1 }).skip(skip).limit(lim).lean(),
      NewsArticle.countDocuments(query),
    ]);

    return { data, total, page: page ?? 1, limit: lim, totalPages: Math.ceil(total / lim) };
  }
}
