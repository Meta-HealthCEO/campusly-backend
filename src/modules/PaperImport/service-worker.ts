import fs from 'fs';
import { logger } from '../../common/logger.js';
import { PaperImportJob, type IPaperImportJob } from './model.js';
import { renderPdfPages, pagePath } from './service-storage.js';

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

export async function runConversion(job: IPaperImportJob): Promise<void> {
  job.status = 'running';
  await job.save();

  if (await isCancelled(String(job._id))) return;
  await stage1Render(job);

  logger.info(`[PaperImport] stage1 complete jobId=${String(job._id)} pages=${job.source.pageCount}`);
}
