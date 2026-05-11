import fs from 'fs';
import { logger } from '../../common/logger.js';
import { PaperImportJob, type IPaperImportJob } from './model.js';
import { renderPdfPages, pagePath, fileToBase64 } from './service-storage.js';
import { AIService } from '../../services/ai.service.js';
import { SegmentResponseSchema, type SegmentResponse } from './validation.js';
import { SEGMENT_SYSTEM, STRICTIFY_SUFFIX } from './service-conversion-prompts.js';

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

export async function runConversion(job: IPaperImportJob): Promise<void> {
  job.status = 'running';
  await job.save();

  if (await isCancelled(String(job._id))) return;
  await stage1Render(job);

  if (await isCancelled(String(job._id))) return;
  const segments = await stage2Segment(job);
  logger.info(`[PaperImport] stage2 segments=${segments.length} jobId=${String(job._id)}`);
}
