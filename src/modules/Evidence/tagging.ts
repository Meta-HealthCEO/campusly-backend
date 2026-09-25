// src/modules/Evidence/tagging.ts
//
// Inline paper questions still missing a topic or level are tagged with one
// call per paper (spec §4.2, plan ruling P9), counted as one unit of the
// school's pool. Only missing fields are filled; the paper version is not
// bumped (tags change nothing a learner sees).
import mongoose from 'mongoose';
import { z } from 'zod/v4';
import { AssessmentPaper } from '../QuestionBank/model.js';
import { CAPS_LEVELS } from '../QuestionBank/model-shared.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { diagnosisPool, poolRemaining } from './diagnosis-pool.js';
import { parseReply, sendDirect, transportMode } from './ai-transport.js';
import { closeRequest, customIdFor, logAIUsage, openRequest } from './ledger.js';
import type { Oid } from './types.js';

/**
 * Words that, on their own, make a CAPS node about assessment, revision or
 * planning rather than content (from the node titles in scripts/output):
 * "Formal Assessment Task: Investigation", "Final NSC Examination",
 * "Planning for 2024/25", "Weeks 9-10: Assessment and Consolidation".
 */
const NON_CONTENT_WORDS = new Set([
  'revision', 'consolidation', 'comprehensive', 'assessment', 'formal', 'task', 'tasks', 'test', 'tests', 'controlled',
  'exam', 'exams', 'examination', 'examinations', 'final', 'trial', 'preparatory', 'internal', 'end', 'year', 'nsc', 'ncs',
  'paper', 'papers', 'week', 'weeks', 'june', 'november', 'planning', 'academic', 'preparation', 'fat', 'pat', 'completion',
  'investigation', 'assignment', 'project', 'prior', 'knowledge', 'grade', 'grades', 'caps', 'topics', 'all', 'of', 'and', 'the', 'for',
]);

/**
 * True only when every word of the title is an assessment/planning word, so
 * "Measurement (Revision)" and "Revision of lines, angles and triangles" stay
 * content topics while "Revision" or "Trial Examination" do not.
 */
export function isNonContentTitle(title: string): boolean {
  const words = title.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  return words.length > 0 && words.every((w: string) => NON_CONTENT_WORDS.has(w));
}
export interface TopicCandidate { _id: Oid; code: string; title: string }
export interface TagOutcome { tagged: number; untagged: number; skipped: 'none' | 'budget' | 'no_candidates' | 'failed' | null }

const TaggingReplySchema = z.object({
  items: z.array(z.object({ ref: z.string(), topicCode: z.string().nullable(), capsLevel: z.enum(CAPS_LEVELS).nullable() })),
});

const TAGGING_SYSTEM = [
  'You tag school test questions with the CAPS topic they assess and their cognitive level.',
  'For each question choose exactly one topic code from the list (or null if none fits) and one level: knowledge | routine | complex | problem_solving.',
  'Return JSON only: {"items":[{"ref":"<ref>","topicCode":"<code or null>","capsLevel":"<level or null>"}]}.',
].join('\n');

interface NodeLite { _id: Oid; type: string; title: string; code: string; subjectId: Oid | null }

export async function candidateTopics(paper: { schoolId: Oid; topicIds: Oid[] }): Promise<TopicCandidate[]> {
  const visible = [{ schoolId: null }, { schoolId: paper.schoolId }];
  const picked = (await CurriculumNode.find({ _id: { $in: paper.topicIds }, isDeleted: false, $or: visible })
    .select('type title code subjectId').lean()) as unknown as NodeLite[];
  const content = picked.filter((n) => (n.type === 'topic' || n.type === 'subtopic') && !isNonContentTitle(n.title));
  const other = picked.filter((n) => !content.includes(n));
  const extra = other.length === 0 ? [] : ((await CurriculumNode.find({
    subjectId: { $in: other.map((n) => n.subjectId).filter(Boolean) }, type: 'topic', isDeleted: false, $or: visible,
  }).select('type title code subjectId').lean()) as unknown as NodeLite[]).filter((n) => !isNonContentTitle(n.title));
  const topics = [...content, ...extra];
  const subtopics = (await CurriculumNode.find({
    parentId: { $in: topics.filter((t) => t.type === 'topic').map((t) => t._id) }, type: 'subtopic', isDeleted: false, $or: visible,
  }).select('type title code subjectId').lean()) as unknown as NodeLite[];
  const seen = new Set<string>();
  return [...topics, ...subtopics].filter((n) => !seen.has(String(n._id)) && seen.add(String(n._id)))
    .map((n) => ({ _id: n._id, code: n.code, title: n.title }));
}

const toOid = (id: string | Oid): Oid => new mongoose.Types.ObjectId(String(id));

export async function tagPaperQuestions(
  paperId: string | Oid, schoolId: string | Oid, options: { dryRun?: boolean } = {},
): Promise<TagOutcome> {
  const paper = await AssessmentPaper.findOne({ _id: toOid(paperId), schoolId: toOid(schoolId), isDeleted: false });
  if (!paper) return { tagged: 0, untagged: 0, skipped: 'none' };
  const targets = paper.sections.flatMap((section, s) => section.questions
    .filter((q) => !q.questionId && q.questionText && (!q.curriculumNodeId || !q.capsLevel))
    .map((q) => ({ ref: `${s + 1}.${q.position + 1}`, q })));
  if (targets.length === 0) return { tagged: 0, untagged: 0, skipped: 'none' };
  if (options.dryRun) return { tagged: 0, untagged: targets.length, skipped: null };
  if (poolRemaining(await diagnosisPool(paper.schoolId)) < 1) return { tagged: 0, untagged: targets.length, skipped: 'budget' };
  const candidates = await candidateTopics({ schoolId: paper.schoolId, topicIds: paper.topicIds });
  if (candidates.length === 0) return { tagged: 0, untagged: targets.length, skipped: 'no_candidates' };

  const mode = transportMode() === 'fixture' ? 'fixture' : 'direct';
  const request = await openRequest({ kind: 'tagging', mode, schoolId: paper.schoolId, paperId: paper._id as Oid, items: [{ ref: 'paper', cacheKey: `tag:${String(paper._id)}` }] });
  const user = [
    'Topics:', ...candidates.map((c) => `- ${c.code}: ${c.title}`), '', 'Questions:',
    ...targets.map((t) => `[${t.ref}] ${String(t.q.questionText).slice(0, 800)}\nMemo: ${String(t.q.modelAnswer ?? '').slice(0, 400)}`),
  ].join('\n');
  const reply = await sendDirect({
    customId: customIdFor(request._id), kind: 'tagging', system: TAGGING_SYSTEM, user, maxTokens: 200 + 40 * targets.length,
    hint: { refs: targets.map((t) => t.ref), codes: candidates.map((c) => c.code) },
  }, mode);
  const parsed = reply.ok ? parseReply(reply.text, TaggingReplySchema) : null;
  await closeRequest(request._id, reply, reply.ok && !parsed ? 'invalid_reply' : undefined);
  await logAIUsage(paper.schoolId, paper.createdBy, 'question_tagging', reply.usage);
  if (!parsed) return { tagged: 0, untagged: targets.length, skipped: 'failed' };

  const nodeByCode = new Map(candidates.map((c) => [c.code, c._id]));
  let tagged = 0;
  for (const item of parsed.items) {
    const target = targets.find((t) => t.ref === item.ref);
    if (!target) continue;
    const node = item.topicCode ? nodeByCode.get(item.topicCode) : undefined;
    const fillNode = !target.q.curriculumNodeId && node;
    const fillLevel = !target.q.capsLevel && item.capsLevel;
    if (fillNode) target.q.curriculumNodeId = node;
    if (fillLevel) target.q.capsLevel = item.capsLevel;
    if (fillNode || fillLevel) {
      target.q.tagFrom = target.q.tagFrom ?? 'ai_tag';
      tagged += 1;
    }
  }
  paper.markModified('sections');
  await paper.save();
  return { tagged, untagged: targets.length - tagged, skipped: null };
}
