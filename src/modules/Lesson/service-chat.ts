import mongoose from 'mongoose';
import { LessonService } from './service.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { AIService } from '../../services/ai.service.js';
import {
  resolveTextbookContextForTopic,
  renderTextbookSourceSection,
} from '../Textbook/service-textbook-context.js';
import { logger } from '../../common/logger.js';
import type { ILesson, ILessonMaterial } from './types.js';

// ── Public types ─────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatInput {
  message: string;
  history: ChatMessage[];
}

export interface ChatOutput {
  reply: string;
}

// ── Constants ────────────────────────────────────────────────────────────
const MAX_HISTORY_TURNS = 10; // last 10 messages, regardless of role
const MAX_MATERIAL_SUMMARY_CHARS = 200;
const MAX_MATERIALS_IN_PROMPT = 12; // hard cap so prompt stays bounded
const TEXTBOOK_BUDGET_CHARS = 4000;
const COMPLETION_MAX_TOKENS = 1024;
const COMPLETION_TEMPERATURE = 0.6;

// ── Public API ───────────────────────────────────────────────────────────
export async function chatAboutLesson(
  lessonId: string,
  schoolId: string,
  input: ChatInput,
): Promise<ChatOutput> {
  const lesson = await LessonService.getById(lessonId, schoolId);

  const topicTitle = readPopulatedTitle(lesson.curriculumNodeId);
  const topicDescription = await loadTopicDescription(lesson.curriculumNodeId);
  const grade = readPopulatedTitle(lesson.gradeId) || readNestedNodeTitle(lesson.curriculumNodeId, 'gradeId');
  const subject = readPopulatedTitle(lesson.subjectId) || readNestedNodeTitle(lesson.curriculumNodeId, 'subjectId');

  // Optional textbook grounding — best effort. A failed lookup must not
  // break the chat (matches the scaffold service behavior).
  let textbookSection = '';
  try {
    const ctx = await resolveTextbookContextForTopic(
      readObjectIdString(lesson.curriculumNodeId),
      new mongoose.Types.ObjectId(schoolId),
      { maxChars: TEXTBOOK_BUDGET_CHARS },
    );
    textbookSection = renderTextbookSourceSection(ctx);
  } catch (err: unknown) {
    logger.warn({ err }, '[lesson-chat] textbook-context resolver failed');
  }

  const systemPrompt = buildSystemPrompt({
    title: lesson.title,
    grade,
    subject,
    topicTitle,
    topicDescription,
    objectives: lesson.objectives,
    materialSummaries: summarizeMaterials(lesson.materials),
    textbookSection,
  });

  const cappedHistory = input.history.slice(-MAX_HISTORY_TURNS);
  const userPrompt = renderConversationPrompt(cappedHistory, input.message);

  const reply = await AIService.generateCompletion(systemPrompt, userPrompt, {
    maxTokens: COMPLETION_MAX_TOKENS,
    temperature: COMPLETION_TEMPERATURE,
  });

  return { reply: reply.trim() };
}

// ── Prompt assembly ──────────────────────────────────────────────────────
interface SystemPromptInput {
  title: string;
  grade: string;
  subject: string;
  topicTitle: string;
  topicDescription: string;
  objectives: string[];
  materialSummaries: string[];
  textbookSection: string;
}

function buildSystemPrompt(p: SystemPromptInput): string {
  const lines = [
    'You are an AI teaching assistant helping a teacher plan and discuss a single lesson.',
    'Be concise, practical, and pedagogically sound. When the teacher asks for ideas, ground them in the lesson context below.',
    'When asked for content (questions, examples, activities), match the grade level and subject conventions.',
    'If the teacher asks something outside the lesson scope, answer briefly but redirect toward the lesson.',
    '',
    '--- LESSON CONTEXT ---',
    `Title: ${p.title}`,
    p.grade ? `Grade: ${p.grade}` : '',
    p.subject ? `Subject: ${p.subject}` : '',
    p.topicTitle ? `Topic: ${p.topicTitle}` : '',
    p.topicDescription ? `Topic notes: ${p.topicDescription}` : '',
  ].filter(Boolean);

  if (p.objectives.length > 0) {
    lines.push('Objectives:');
    p.objectives.forEach((o, i) => lines.push(`  ${i + 1}. ${o}`));
  }

  if (p.materialSummaries.length > 0) {
    lines.push('', 'Generated materials in this lesson:');
    p.materialSummaries.forEach((s) => lines.push(`  - ${s}`));
  }
  lines.push('--- END LESSON CONTEXT ---');

  if (p.textbookSection.trim().length > 0) {
    lines.push('', p.textbookSection);
  }

  return lines.join('\n');
}

function renderConversationPrompt(
  history: ChatMessage[],
  newUserMessage: string,
): string {
  if (history.length === 0) return newUserMessage;
  const turns = history.map((m) => `${m.role}: ${m.content}`).join('\n\n');
  return `${turns}\n\nuser: ${newUserMessage}`;
}

// ── Material summarization ───────────────────────────────────────────────
function summarizeMaterials(materials: ILessonMaterial[]): string[] {
  const summaries: string[] = [];
  for (const m of materials.slice(0, MAX_MATERIALS_IN_PROMPT)) {
    const head = `${m.title} (${m.kind})`;
    const body = extractMaterialBody(m).slice(0, MAX_MATERIAL_SUMMARY_CHARS);
    summaries.push(body ? `${head}: ${body}` : head);
  }
  return summaries;
}

interface ContentBlockLike { type?: string; content?: string }
interface ContentResourceLike { blocks?: ContentBlockLike[] }

function extractMaterialBody(material: ILessonMaterial): string {
  // notes/worksheet/activity/worked_example: pull from populated content
  // resource if present.
  const resourceRef = (material as { contentResourceId?: unknown }).contentResourceId;
  if (resourceRef && typeof resourceRef === 'object') {
    const r = resourceRef as ContentResourceLike;
    const text = (r.blocks ?? [])
      .filter((b) => b.type === 'text' && typeof b.content === 'string')
      .map((b) => (b.content ?? '').trim())
      .filter((s) => s.length > 0)
      .join(' · ');
    if (text) return text;
  }
  // teacherNotes is the safest fallback for any material kind.
  if (material.teacherNotes && material.teacherNotes.trim().length > 0) {
    return material.teacherNotes.trim();
  }
  return '';
}

// ── Helpers ──────────────────────────────────────────────────────────────
async function loadTopicDescription(node: unknown): Promise<string> {
  // Topic node arrives populated with title/code only. Fetch description on
  // demand if we have an ObjectId we can reference. Keep it short; the
  // prompt is already rich.
  const id = readObjectIdString(node);
  if (!id) return '';
  try {
    const fresh = await CurriculumNode.findById(id)
      .select('description')
      .lean<{ description?: string } | null>();
    if (!fresh?.description) return '';
    return fresh.description.trim().slice(0, 500);
  } catch {
    return '';
  }
}

function readPopulatedTitle(v: unknown): string {
  if (!v || typeof v !== 'object') return '';
  const o = v as { title?: string; name?: string };
  return o.title ?? o.name ?? '';
}

function readNestedNodeTitle(
  node: unknown,
  innerKey: 'subjectId' | 'gradeId',
): string {
  if (!node || typeof node !== 'object') return '';
  const inner = (node as Record<string, unknown>)[innerKey];
  if (!inner || typeof inner !== 'object') return '';
  const o = inner as { title?: string; name?: string };
  return o.title ?? o.name ?? '';
}

function readObjectIdString(v: unknown): string {
  if (!v) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'object') {
    const o = v as { _id?: { toString(): string } };
    if (o._id) return o._id.toString();
  }
  return '';
}

// Unused types kept here as documentation for future callers — the lesson
// context has more shape than the chat needs today, but we don't want to
// re-derive it when this surface grows (e.g. summarizing per-phase).
export type { ILesson };
