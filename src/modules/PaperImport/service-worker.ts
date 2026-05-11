import fs from 'fs';
import { logger } from '../../common/logger.js';
import { PaperImportJob, type IPaperImportJob } from './model.js';
import { renderPdfPages, pagePath, fileToBase64 } from './service-storage.js';
import { AIService } from '../../services/ai.service.js';
import {
  SegmentResponseSchema,
  type SegmentResponse,
  TranscribeResponseSchema,
  type TranscribeResponse,
  AnswersEnhancementSchema,
  HintsEnhancementSchema,
  ExplanationsEnhancementSchema,
  WorkedExampleEnhancementSchema,
} from './validation.js';
import { SEGMENT_SYSTEM, STRICTIFY_SUFFIX, transcribeSystem,
  ANSWERS_ENHANCEMENT_SYSTEM,
  HINTS_ENHANCEMENT_SYSTEM,
  EXPLANATIONS_ENHANCEMENT_SYSTEM,
  WORKED_EXAMPLE_ENHANCEMENT_SYSTEM,
} from './service-conversion-prompts.js';
import type { ResourceType } from '../ContentLibrary/model.js';
import { ResourcesService } from '../ContentLibrary/service-resources.js';
import { cropPageRegion } from './service-storage.js';

async function setProgress(
  job: IPaperImportJob,
  patch: Partial<IPaperImportJob['progress']>,
): Promise<void> {
  Object.assign(job.progress, patch);
  await job.save();
}

async function isCancelled(jobId: string): Promise<boolean> {
  const fresh = await PaperImportJob.findOne(
    { _id: jobId, isDeleted: false },
  ).select('status').lean();
  return fresh?.status === 'cancelled';
}

async function stage1Render(job: IPaperImportJob): Promise<void> {
  await setProgress(job, { stage: 'uploading', message: 'Rendering pages…' });
  if (job.source.mimeType === 'application/pdf') {
    const firstPage = pagePath(String(job._id), 1);
    if (!fs.existsSync(firstPage) || job.source.pageCount === 0) {
      const count = await renderPdfPages(String(job._id), job.source.storagePath);
      job.source.pageCount = count;
      await job.save();
    }
  } else {
    if (job.source.pageCount === 0) {
      job.source.pageCount = 1;
      await job.save();
    }
  }
  await setProgress(job, { pagesTotal: job.source.pageCount });
}

async function stage2Segment(job: IPaperImportJob): Promise<SegmentResponse['resources']> {
  await setProgress(job, { stage: 'segmenting', message: 'Detecting resource boundaries…' });

  const total = job.source.pageCount;
  const usePdf = job.source.mimeType === 'application/pdf' && total <= 20;

  async function callOnce(strict: boolean): Promise<unknown> {
    const sys = strict ? SEGMENT_SYSTEM + STRICTIFY_SUFFIX : SEGMENT_SYSTEM;
    const userText = `The document has ${total} page(s). Segment it.`;
    if (usePdf) {
      const base64 = fileToBase64(job.source.storagePath);
      const { text } = await AIService.generateDocumentCompletion(
        sys, userText, base64, 'application/pdf',
      );
      return JSON.parse(text);
    }
    const images = Array.from({ length: total }, (_, i) => ({
      base64: fileToBase64(pagePath(String(job._id), i + 1)),
      mediaType: 'image/png' as const,
    }));
    const { text } = await AIService.generateVisionCompletionWithImages(sys, userText, images);
    return JSON.parse(text);
  }

  let raw: unknown;
  try {
    raw = await callOnce(false);
  } catch (err: unknown) {
    logger.warn(`[PaperImport] segment first attempt failed: ${(err as Error).message}`);
    raw = await callOnce(true);
  }

  const parsed = SegmentResponseSchema.safeParse(raw);
  if (!parsed.success) {
    logger.warn(`[PaperImport] segment parse failed, falling back to single worksheet`);
    return [{ kind: 'worksheet', title: 'Imported worksheet', pageRange: [1, total], reasoning: 'fallback' }];
  }
  return parsed.data.resources;
}

interface TranscribedResource {
  segmentKind: ResourceType;
  pageRange: [number, number];
  result: TranscribeResponse;
}

async function stage3Transcribe(
  job: IPaperImportJob,
  segments: SegmentResponse['resources'],
): Promise<TranscribedResource[]> {
  await setProgress(job, { stage: 'transcribing', message: 'Transcribing pages…' });
  const out: TranscribedResource[] = [];

  for (let i = 0; i < segments.length; i += 1) {
    if (await isCancelled(String(job._id))) return out;
    const seg = segments[i];
    const [startPage, endPage] = seg.pageRange;

    await setProgress(job, {
      pagesDone: startPage - 1,
      message: `Transcribing pages ${startPage}-${endPage} (${i + 1}/${segments.length})`,
    });

    const images: Array<{ base64: string; mediaType: 'image/png' }> = [];
    for (let p = startPage; p <= endPage; p += 1) {
      images.push({
        base64: fileToBase64(pagePath(String(job._id), p)),
        mediaType: 'image/png' as const,
      });
    }
    const sys = transcribeSystem(seg.kind);
    const userText = `Transcribe these ${endPage - startPage + 1} page(s) into a "${seg.kind}" resource titled "${seg.title}".`;

    async function callOnce(strict: boolean): Promise<unknown> {
      const fullSys = strict ? sys + STRICTIFY_SUFFIX : sys;
      const { text } = await AIService.generateVisionCompletionWithImages(fullSys, userText, images);
      return JSON.parse(text);
    }

    let raw: unknown;
    try {
      raw = await callOnce(false);
    } catch (err: unknown) {
      logger.warn(`[PaperImport] transcribe attempt 1 failed (${seg.title}): ${(err as Error).message}`);
      try {
        raw = await callOnce(true);
      } catch (err2: unknown) {
        logger.error(`[PaperImport] transcribe attempt 2 failed (${seg.title}): ${(err2 as Error).message}`);
        continue;
      }
    }

    const parsed = TranscribeResponseSchema.safeParse(raw);
    if (!parsed.success) {
      logger.warn(`[PaperImport] transcribe parse failed (${seg.title})`);
      continue;
    }
    out.push({ segmentKind: seg.kind, pageRange: seg.pageRange, result: parsed.data });
  }

  await setProgress(job, { pagesDone: job.source.pageCount });
  return out;
}

async function enhanceOne(
  systemPrompt: string,
  userPayload: unknown,
): Promise<unknown | null> {
  try {
    const text = await AIService.generateCompletion(
      systemPrompt,
      JSON.stringify(userPayload),
      { temperature: 0.2 },
    );
    return JSON.parse(text);
  } catch (err: unknown) {
    logger.warn(`[PaperImport] enhancement failed: ${(err as Error).message}`);
    return null;
  }
}

async function stage4Enhance(
  job: IPaperImportJob,
  transcribed: TranscribedResource[],
): Promise<TranscribedResource[]> {
  await setProgress(job, { stage: 'enhancing', message: 'Adding answers, hints, explanations…' });
  const opts = job.options;

  for (const r of transcribed) {
    if (await isCancelled(String(job._id))) return transcribed;

    const questionBlocks = r.result.blocks.filter((b) =>
      ['quiz', 'fill_blank', 'match_columns', 'ordering'].includes(b.type),
    );
    if (questionBlocks.length === 0) continue;

    const enhancements: Promise<void>[] = [];

    if (opts.generateAnswers) {
      enhancements.push((async () => {
        const raw = await enhanceOne(ANSWERS_ENHANCEMENT_SYSTEM, { blocks: questionBlocks });
        if (raw === null) return;
        const parsed = AnswersEnhancementSchema.safeParse(raw);
        if (parsed.success) {
          for (const { blockId, answer } of parsed.data.answers) {
            const target = r.result.blocks.find((b) => b.blockId === blockId);
            if (target) target.content = answer;
          }
        }
      })());
    }

    if (opts.addHints) {
      enhancements.push((async () => {
        const raw = await enhanceOne(HINTS_ENHANCEMENT_SYSTEM, { blocks: questionBlocks });
        if (raw === null) return;
        const parsed = HintsEnhancementSchema.safeParse(raw);
        if (parsed.success) {
          for (const { blockId, hints } of parsed.data.hints) {
            const target = r.result.blocks.find((b) => b.blockId === blockId);
            if (target) (target as unknown as { hints: string[] }).hints = hints;
          }
        }
      })());
    }

    if (opts.addExplanations) {
      enhancements.push((async () => {
        const raw = await enhanceOne(EXPLANATIONS_ENHANCEMENT_SYSTEM, { blocks: questionBlocks });
        if (raw === null) return;
        const parsed = ExplanationsEnhancementSchema.safeParse(raw);
        if (parsed.success) {
          for (const { blockId, explanation } of parsed.data.explanations) {
            const target = r.result.blocks.find((b) => b.blockId === blockId);
            if (target) (target as unknown as { explanation: string }).explanation = explanation;
          }
        }
      })());
    }

    if (opts.addWorkedExample) {
      enhancements.push((async () => {
        const raw = await enhanceOne(WORKED_EXAMPLE_ENHANCEMENT_SYSTEM, { resource: r.result });
        if (raw === null) return;
        const parsed = WorkedExampleEnhancementSchema.safeParse(raw);
        if (parsed.success) {
          r.result.blocks.push({
            blockId: parsed.data.block.blockId,
            type: 'step_reveal',
            order: parsed.data.block.order,
            content: parsed.data.block.content,
            confidence: 1,
          });
        }
      })());
    }

    await Promise.all(enhancements);
  }
  return transcribed;
}

const CONFIDENCE_THRESHOLD = Number(process.env.PAPER_IMPORT_CONFIDENCE_THRESHOLD ?? 0.55);

function median(values: number[]): number {
  if (values.length === 0) return 1;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function pageImageUrl(jobId: string, page: number): string {
  return `/api/paper-imports/${jobId}/page/${page}`;
}

function cropImageUrl(jobId: string, blockId: string): string {
  return `/api/paper-imports/${jobId}/crops/${blockId}.png`;
}

type FinalBlock = {
  blockId: string;
  type: string;
  order: number;
  content: string;
  curriculumNodeId: null;
  cognitiveLevel: null;
  points: number;
  hints: string[];
  explanation: string;
  metadata: Record<string, unknown>;
};

async function stage5Finalise(
  job: IPaperImportJob,
  enhanced: TranscribedResource[],
): Promise<void> {
  await setProgress(job, { stage: 'finalising', message: 'Saving resources…' });
  const jobId = String(job._id);

  for (const r of enhanced) {
    if (await isCancelled(jobId)) return;

    const confidences = r.result.blocks.map((b) => b.confidence ?? 1);
    const medianConf = median(confidences);
    const fallback = medianConf < CONFIDENCE_THRESHOLD;

    let finalBlocks: FinalBlock[];

    if (fallback) {
      finalBlocks = [];
      for (let p = r.pageRange[0]; p <= r.pageRange[1]; p += 1) {
        finalBlocks.push({
          blockId: `page-${p}-${jobId}`,
          type: 'image',
          order: p - r.pageRange[0],
          content: JSON.stringify({ src: pageImageUrl(jobId, p), alt: `Page ${p}` }),
          curriculumNodeId: null,
          cognitiveLevel: null,
          points: 0,
          hints: [],
          explanation: '',
          metadata: { needsReview: true },
        });
      }
    } else {
      finalBlocks = [];
      for (const b of r.result.blocks) {
        const needsReview = (b.confidence ?? 1) < CONFIDENCE_THRESHOLD;
        let content = b.content;
        if (b.type === 'image' && b.cropBox) {
          try {
            await cropPageRegion(jobId, b.cropBox.page, b.blockId, {
              x: b.cropBox.x, y: b.cropBox.y, w: b.cropBox.w, h: b.cropBox.h,
            });
            content = JSON.stringify({ src: cropImageUrl(jobId, b.blockId), alt: '' });
          } catch (err: unknown) {
            logger.warn(`[PaperImport] crop failed for ${b.blockId}: ${(err as Error).message}`);
            content = JSON.stringify({ src: pageImageUrl(jobId, b.cropBox.page), alt: '' });
          }
        }
        const blockHints = (b as unknown as { hints?: string[] }).hints;
        const blockExplanation = (b as unknown as { explanation?: string }).explanation;
        const block: FinalBlock = {
          blockId: b.blockId,
          type: b.type,
          order: b.order,
          content,
          curriculumNodeId: null,
          cognitiveLevel: null,
          points: 0,
          hints: blockHints ?? [],
          explanation: blockExplanation ?? '',
          metadata: needsReview ? { needsReview: true } : {},
        };
        finalBlocks.push(block);
      }
    }

    const created = await ResourcesService.createResource(
      String(job.schoolId),
      String(job.teacherId),
      {
        curriculumNodeId: String(job.curriculum.curriculumNodeId),
        type: r.segmentKind,
        format: 'static',
        title: r.result.title,
        blocks: finalBlocks as never,
        source: 'imported',
        sourceAttribution: '',
        gradeId: String(job.curriculum.gradeId),
        subjectId: String(job.curriculum.subjectId),
        term: job.curriculum.term,
        tags: [],
        difficulty: 3,
        estimatedMinutes: 30,
        prerequisites: [],
        sourceImport: {
          jobId,
          storagePath: job.source.storagePath,
          filename: job.source.filename,
          mimeType: job.source.mimeType,
          pageRange: { start: r.pageRange[0], end: r.pageRange[1] },
        },
        needsReview: fallback,
      },
    );
    job.resultResourceIds.push(created._id);
    await job.save();
  }

  job.status = 'completed';
  job.completedAt = new Date();
  await job.save();
}

export async function runConversion(job: IPaperImportJob): Promise<void> {
  job.status = 'running';
  await job.save();

  if (await isCancelled(String(job._id))) return;
  await stage1Render(job);

  if (await isCancelled(String(job._id))) return;
  const segments = await stage2Segment(job);
  logger.info(`[PaperImport] stage2 segments=${segments.length} jobId=${String(job._id)}`);

  if (await isCancelled(String(job._id))) return;
  const transcribed = await stage3Transcribe(job, segments);
  logger.info(`[PaperImport] stage3 resources=${transcribed.length} jobId=${String(job._id)}`);
  if (transcribed.length === 0) {
    job.status = 'failed';
    job.error = { code: 'transcribe_empty', message: 'Could not extract any content from the file.' };
    await job.save();
    return;
  }

  if (await isCancelled(String(job._id))) return;
  const enhanced = await stage4Enhance(job, transcribed);
  logger.info(`[PaperImport] stage4 enhanced=${enhanced.length} jobId=${String(job._id)}`);

  await stage5Finalise(job, enhanced);
}
