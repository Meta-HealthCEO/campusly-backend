// src/modules/Readiness/blueprint-service.ts
//
// Import as a draft, publish, copy to a new year, and the verification patch (spec §2.4). Numbers change only
// through the file; the patch touches flags, source references and dates, and never a verified published blueprint.
import mongoose from 'mongoose';
import { BadRequestError, ConflictError, NotFoundError } from '../../common/errors.js';
import { CurriculumNode } from '../CurriculumStructure/model.js';
import { ExamBlueprint, type IExamBlueprint } from './model-blueprint.js';
import {
  blueprintFileSchema, isBlueprintVerified, validateBlueprint, type BlueprintFile, type NodeInfo, type ValidationReport,
} from './blueprint-validate.js';
import type { BlueprintData } from './types.js';

type RawNode = { _id: mongoose.Types.ObjectId; code: string; type: string; title: string; parentId: mongoose.Types.ObjectId | null; termNumber?: number | null; schoolId: mongoose.Types.ObjectId | null; isDeleted: boolean };
const escape = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toInfo = (n: RawNode): NodeInfo => ({
  id: String(n._id), code: n.code, type: n.type, title: n.title, parentId: n.parentId ? String(n.parentId) : null,
  termNumber: n.termNumber ?? null, system: n.schoolId === null, deleted: n.isDeleted,
});
const FIELDS = 'code type title parentId termNumber schoolId isDeleted';

export async function loadNodesFor(file: BlueprintFile): Promise<{ byCode: Map<string, NodeInfo>; family: NodeInfo[] }> {
  const codes = [...new Set(file.papers.flatMap((p) => p.topics.flatMap((t) => t.nodes)))];
  const [named, family] = await Promise.all([
    CurriculumNode.find({ code: { $in: codes } }).select(FIELDS).lean(),
    CurriculumNode.find({
      code: new RegExp(`^${escape(file.subjectKey)}-GR1[0-2]-`), type: { $in: ['topic', 'subtopic'] }, schoolId: null, isDeleted: false,
    }).select(FIELDS).lean(),
  ]);
  return {
    byCode: new Map((named as unknown as RawNode[]).map((n) => [n.code, toInfo(n)])),
    family: (family as unknown as RawNode[]).map(toInfo),
  };
}

export async function validateRaw(raw: unknown): Promise<ValidationReport & { parseErrors: string[] }> {
  const parsed = blueprintFileSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: [], warnings: [], unverified: [], data: null, parseErrors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) };
  }
  const { byCode, family } = await loadNodesFor(parsed.data);
  return { ...validateBlueprint(parsed.data, byCode, family), parseErrors: [] };
}

/** The data part of a stored blueprint, as plain JSON (for re-validation, comparison and the engine). */
export function blueprintData(doc: IExamBlueprint): BlueprintData {
  const o = doc.toObject() as unknown as BlueprintData;
  return {
    family: o.family, examBody: o.examBody, qualification: o.qualification, session: o.session, subjectKey: o.subjectKey,
    slug: o.slug, subjectTitle: o.subjectTitle, grade: o.grade, examYear: o.examYear, sources: o.sources,
    cognitiveScheme: { key: o.cognitiveScheme.key, levels: o.cognitiveScheme.levels }, papers: o.papers,
  };
}

/** Key-order-free JSON, so a stored document and a parsed file compare by content. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k: string) => `${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}
const same = (a: BlueprintData, b: BlueprintData): boolean => stable(a) === stable(b);

export async function importDraft(raw: unknown): Promise<{
  report: ValidationReport & { parseErrors: string[] }; blueprint: IExamBlueprint | null; changed: boolean;
}> {
  const report = await validateRaw(raw);
  if (!report.data) return { report, blueprint: null, changed: false };
  const existing = await ExamBlueprint.findOne({ family: report.data.family, examYear: report.data.examYear, status: 'draft', isDeleted: false });
  if (existing && same(blueprintData(existing), report.data)) return { report, blueprint: existing, changed: false };
  const blueprint = await ExamBlueprint.findOneAndUpdate(
    { family: report.data.family, examYear: report.data.examYear, status: 'draft', isDeleted: false },
    { $set: { ...report.data, acknowledgedWarnings: [] }, $setOnInsert: { version: 0, publishedBy: null, publishedAt: null, supersedes: null } },
    { upsert: true, new: true },
  );
  return { report, blueprint, changed: true };
}

/** The validation report for a stored blueprint, against the nodes as they are now. */
export async function reportFor(doc: IExamBlueprint): Promise<ValidationReport> {
  const data = blueprintData(doc);
  const file = blueprintFileSchema.parse({ ...data, papers: data.papers.map((p) => ({ ...p, topics: p.topics.map((t) => ({ ...t, nodes: t.nodes.map((n) => n.code) })) })) });
  const { byCode, family } = await loadNodesFor(file);
  return validateBlueprint(file, byCode, family);
}

export async function publishBlueprint(id: string, byUserId: string, acknowledgeWarnings: boolean): Promise<IExamBlueprint> {
  const doc = await ExamBlueprint.findOne({ _id: id, status: 'draft', isDeleted: false });
  if (!doc) throw new NotFoundError('Draft blueprint not found');
  const report = await reportFor(doc);
  if (report.errors.length > 0) throw new BadRequestError(`This blueprint has errors: ${report.errors.join('; ')}`);
  if (report.warnings.length > 0 && !acknowledgeWarnings) throw new BadRequestError(`Acknowledge the warnings to publish: ${report.warnings.join('; ')}`);
  const other = await ExamBlueprint.findOne({
    subjectKey: doc.subjectKey, grade: doc.grade, examYear: doc.examYear, status: 'published', isDeleted: false, family: { $ne: doc.family },
  }).select('family').lean();
  if (other) throw new ConflictError(`${other.family} is already published for this subject, grade and year: retire it first`);
  const previous = await ExamBlueprint.findOne({ family: doc.family, examYear: doc.examYear, status: 'published', isDeleted: false });
  const top = await ExamBlueprint.findOne({ family: doc.family, examYear: doc.examYear, isDeleted: false }).sort({ version: -1 }).select('version').lean();
  if (previous) await ExamBlueprint.updateOne({ _id: previous._id }, { $set: { status: 'retired' } });
  doc.set({
    status: 'published', version: (top?.version ?? 0) + 1, acknowledgedWarnings: report.warnings,
    publishedBy: mongoose.Types.ObjectId.isValid(byUserId) ? new mongoose.Types.ObjectId(byUserId) : null,
    publishedAt: new Date(), supersedes: previous?._id ?? null,
  });
  await doc.save();
  return doc;
}

export async function copyBlueprint(id: string, examYear: number): Promise<IExamBlueprint> {
  const doc = await ExamBlueprint.findOne({ _id: id, isDeleted: false });
  if (!doc) throw new NotFoundError('Blueprint not found');
  const data = blueprintData(doc);
  if (await ExamBlueprint.exists({ family: data.family, examYear, status: 'draft', isDeleted: false })) {
    throw new ConflictError(`A draft for ${examYear} already exists`);
  }
  return ExamBlueprint.create({
    ...data, examYear, status: 'draft', version: 0, acknowledgedWarnings: [], publishedBy: null, publishedAt: null, supersedes: null,
    cognitiveScheme: { key: data.cognitiveScheme.key, levels: data.cognitiveScheme.levels.map((l) => ({ ...l, verified: false })) },
    papers: data.papers.map((p) => ({ ...p, verified: false, examDate: null, sitting: null, topics: p.topics.map((t) => ({ ...t, verified: false })) })),
  });
}

export interface VerificationPatch {
  papers?: Array<{ key: string; verified?: boolean; sourceRef?: string; examDate?: string | null; sitting?: 'morning' | 'afternoon' | null }>;
  topics?: Array<{ key: string; verified?: boolean; sourceRef?: string }>;
  levels?: Array<{ key: string; verified?: boolean; sourceRef?: string }>;
}

export async function patchVerification(id: string, patch: VerificationPatch): Promise<IExamBlueprint> {
  const doc = await ExamBlueprint.findOne({ _id: id, status: { $in: ['draft', 'published'] }, isDeleted: false });
  if (!doc) throw new NotFoundError('Blueprint not found');
  const data = blueprintData(doc);
  if (doc.status === 'published' && isBlueprintVerified(data)) {
    throw new BadRequestError('This blueprint is verified and published: copy it to change it');
  }
  const topicPatch = new Map((patch.topics ?? []).map((t) => [t.key, t]));
  const papers = data.papers.map((p) => {
    const pp = (patch.papers ?? []).find((x) => x.key === p.key);
    if (pp?.examDate && Number(pp.examDate.slice(0, 4)) !== data.examYear) {
      throw new BadRequestError(`${p.key}: exam date ${pp.examDate} is not in ${data.examYear}`);
    }
    return {
      ...p, ...(pp ? Object.fromEntries(Object.entries(pp).filter(([k]) => k !== 'key')) : {}),
      topics: p.topics.map((t) => ({ ...t, ...Object.fromEntries(Object.entries(topicPatch.get(t.key) ?? {}).filter(([k]) => k !== 'key')) })),
    };
  });
  const levels = data.cognitiveScheme.levels.map((l) => {
    const lp = (patch.levels ?? []).find((x) => x.key === l.key);
    return { ...l, ...(lp ? Object.fromEntries(Object.entries(lp).filter(([k]) => k !== 'key')) : {}) };
  });
  doc.set({ papers, cognitiveScheme: { key: data.cognitiveScheme.key, levels } });
  await doc.save();
  return doc;
}
