import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import {
  MarkingBatch,
  type IMarkingBatch,
  type MarkingBatchPageExtract,
} from './model-marking-batch.js';
import { Student } from '../Student/model.js';
import { logger } from '../../common/logger.js';
import { BadRequestError } from '../../common/errors.js';
import { batchDir, finaliseImages } from './service-marking-images.js';
import { AIService } from '../../services/ai.service.js';

interface CreateBatchInput {
  teacherId: string;
  schoolId: string;
  paperId: string;
  paperType: 'generated' | 'assessment';
  classId: string;
  files: Express.Multer.File[];
}

type ClaudeMediaType = 'image/jpeg' | 'image/png' | 'image/webp';

function extToMediaType(filename: string): ClaudeMediaType {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

export async function createBatch(input: CreateBatchInput): Promise<IMarkingBatch> {
  if (input.files.length === 0) throw new BadRequestError('No images provided');

  const batch = await MarkingBatch.create({
    schoolId: new mongoose.Types.ObjectId(input.schoolId),
    teacherId: new mongoose.Types.ObjectId(input.teacherId),
    paperId: new mongoose.Types.ObjectId(input.paperId),
    paperType: input.paperType,
    classId: new mongoose.Types.ObjectId(input.classId),
    imageCount: input.files.length,
    status: 'extracting',
  });

  // Move uploads into batch dir as page-1, page-2, ...
  const dir = batchDir(String(batch._id));
  finaliseImages(input.files, dir);

  // Kick off async extraction (fire-and-forget)
  void extractBatchHeaders(String(batch._id)).catch((err: unknown) => {
    logger.error({ err, batchId: String(batch._id) }, 'Batch extraction failed');
  });

  return batch;
}

const HEADER_EXTRACTION_SYSTEM_PROMPT =
  `You are reading the top header of a single page of a student's hand-written test paper. ` +
  `Return JSON only, with this shape: ` +
  `{ "studentName": string | null, "admissionNumber": string | null, ` +
  `"sectionLabel": string | null, "confidence": number (0..1) }. ` +
  `Only extract what is clearly visible. Use null when uncertain. ` +
  `Confidence reflects how clearly you read the name.`;

const HEADER_EXTRACTION_USER_PROMPT =
  'Extract the header fields from this page. Return JSON only — no prose, no markdown fences.';

interface ExtractedHeader {
  studentName: string | null;
  admissionNumber: string | null;
  sectionLabel: string | null;
  confidence: number;
}

function parseHeaderResponse(text: string): ExtractedHeader {
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  const raw = JSON.parse(cleaned) as Partial<ExtractedHeader>;
  return {
    studentName: typeof raw.studentName === 'string' ? raw.studentName : null,
    admissionNumber: typeof raw.admissionNumber === 'string' ? raw.admissionNumber : null,
    sectionLabel: typeof raw.sectionLabel === 'string' ? raw.sectionLabel : null,
    confidence: typeof raw.confidence === 'number' ? raw.confidence : 0,
  };
}

export async function extractBatchHeaders(batchId: string): Promise<void> {
  const batch = await MarkingBatch.findById(batchId);
  if (!batch || batch.isDeleted) return;

  try {
    const dir = batchDir(batchId);
    const files = fs.readdirSync(dir).filter((f) => f.startsWith('page-')).sort();
    const extracts: MarkingBatchPageExtract[] = [];

    for (let idx = 0; idx < files.length; idx++) {
      const filename = files[idx];
      const filepath = path.join(dir, filename);
      const base64 = fs.readFileSync(filepath).toString('base64');
      const mediaType = extToMediaType(filename);

      try {
        const { text } = await AIService.generateVisionCompletionWithImages(
          HEADER_EXTRACTION_SYSTEM_PROMPT,
          HEADER_EXTRACTION_USER_PROMPT,
          [{ base64, mediaType }],
          { maxTokens: 512, temperature: 0.1 },
        );
        const parsed = parseHeaderResponse(text);
        extracts.push({
          filename,
          pageNumber: idx + 1,
          extractedName: parsed.studentName,
          extractedAdmissionNumber: parsed.admissionNumber,
          extractedSectionLabel: parsed.sectionLabel,
          confidence: parsed.confidence,
          matchedStudentId: null,
        });
      } catch (err: unknown) {
        logger.error({ err, batchId, filename }, 'Header extraction failed for image');
        extracts.push({
          filename,
          pageNumber: idx + 1,
          extractedName: null,
          extractedAdmissionNumber: null,
          extractedSectionLabel: null,
          confidence: 0,
          matchedStudentId: null,
        });
      }
    }

    batch.pageExtracts = extracts;
    await batch.save();

    await matchToRoster(batchId);
  } catch (err: unknown) {
    logger.error({ err, batchId }, 'Batch extraction job failed');
    await MarkingBatch.updateOne(
      { _id: batchId },
      {
        $set: {
          status: 'failed',
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        },
      },
    );
  }
}

function normaliseName(s: string | null | undefined): string {
  return (s ?? '')
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface RosterStudent {
  _id: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  admissionNumber: string | null;
}

interface MatchScore {
  studentId: mongoose.Types.ObjectId;
  confidence: number;
}

function scoreMatches(extract: MarkingBatchPageExtract, roster: RosterStudent[]): MatchScore[] {
  const scores: MatchScore[] = [];
  const ext = normaliseName(extract.extractedName);
  const adm = (extract.extractedAdmissionNumber ?? '').trim();
  for (const s of roster) {
    if (
      adm &&
      s.admissionNumber &&
      s.admissionNumber.trim().toLowerCase() === adm.toLowerCase()
    ) {
      scores.push({ studentId: s._id, confidence: 1.0 });
      continue;
    }
    if (!ext) continue;
    const full = normaliseName(`${s.firstName} ${s.lastName}`);
    if (full === ext) {
      scores.push({ studentId: s._id, confidence: 0.95 });
      continue;
    }
    const first = normaliseName(s.firstName);
    const last = normaliseName(s.lastName);
    if (first && last && ext.includes(first) && ext.includes(last)) {
      scores.push({ studentId: s._id, confidence: 0.85 });
      continue;
    }
    if (last && ext === last) {
      scores.push({ studentId: s._id, confidence: 0.4 });
      continue;
    }
    if (first && ext === first) {
      scores.push({ studentId: s._id, confidence: 0.3 });
      continue;
    }
  }
  return scores.sort((a, b) => b.confidence - a.confidence);
}

interface PopulatedRosterRecord {
  _id: mongoose.Types.ObjectId;
  admissionNumber?: string | null;
  userId?: { firstName?: string | null; lastName?: string | null } | null;
}

async function loadRoster(
  classId: mongoose.Types.ObjectId,
  schoolId: mongoose.Types.ObjectId,
): Promise<RosterStudent[]> {
  const docs = await Student.find({ classId, schoolId, isDeleted: false })
    .select('admissionNumber userId')
    .populate('userId', 'firstName lastName')
    .lean<PopulatedRosterRecord[]>();

  return docs.map((d): RosterStudent => ({
    _id: d._id,
    firstName: d.userId?.firstName ?? '',
    lastName: d.userId?.lastName ?? '',
    admissionNumber: d.admissionNumber ?? null,
  }));
}

export async function matchToRoster(batchId: string): Promise<void> {
  const batch = await MarkingBatch.findById(batchId);
  if (!batch) return;

  const roster = await loadRoster(batch.classId, batch.schoolId);

  // Group extracts by extractedName + admissionNumber (so multi-page papers stay together)
  const groups = new Map<string, MarkingBatchPageExtract[]>();
  for (const e of batch.pageExtracts) {
    const key = `${(e.extractedName ?? '').toLowerCase()}|${(e.extractedAdmissionNumber ?? '').toLowerCase()}`;
    const arr = groups.get(key) ?? [];
    arr.push(e);
    groups.set(key, arr);
  }

  let matched = 0;
  let unmatched = 0;
  const ambiguous: IMarkingBatch['ambiguousMatches'] = [];

  for (const [, pages] of groups) {
    const repr = pages[0];
    const scores = scoreMatches(repr, roster);
    const top = scores[0];
    const second = scores[1];

    if (
      top &&
      top.confidence >= 0.85 &&
      (!second || top.confidence - second.confidence >= 0.1)
    ) {
      pages.forEach((p) => {
        p.matchedStudentId = top.studentId;
      });
      matched += pages.length;
    } else {
      unmatched += pages.length;
      ambiguous.push({
        imageFilenames: pages.map((p) => p.filename),
        extractedName: repr.extractedName,
        extractedAdmissionNumber: repr.extractedAdmissionNumber,
        suggestedStudentIds: scores.slice(0, 3).map((s) => s.studentId),
        confidence: top?.confidence ?? 0,
      });
    }
  }

  batch.matchedCount = matched;
  batch.unmatchedCount = unmatched;
  batch.ambiguousMatches = ambiguous;
  batch.status = 'reviewing';
  await batch.save();
}

export async function getBatch(
  batchId: string,
  schoolId: string,
): Promise<IMarkingBatch | null> {
  return MarkingBatch.findOne({ _id: batchId, schoolId, isDeleted: false });
}

export async function cancelBatch(batchId: string, schoolId: string): Promise<void> {
  await MarkingBatch.updateOne(
    { _id: batchId, schoolId },
    { $set: { isDeleted: true, status: 'failed', errorMessage: 'Cancelled by user' } },
  );
}

// Re-export confirmBatch from sibling module so consumers can import everything
// from this file. Implementation lives in service-marking-batch-confirm.ts to
// keep this file under the 350-line limit.
export { confirmBatch } from './service-marking-batch-confirm.js';
