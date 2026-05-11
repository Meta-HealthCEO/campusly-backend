import { logger } from '../common/logger.js';
import { PaperImportJob } from '../modules/PaperImport/model.js';
import { purgeJobFiles } from '../modules/PaperImport/service-storage.js';

const RETENTION_DAYS = Number(process.env.PAPER_IMPORT_RETENTION_DAYS ?? 90);

export async function runPaperImportCleanup(): Promise<void> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 3600 * 1000);
  const stale = await PaperImportJob.find({
    isDeleted: false,
    createdAt: { $lt: cutoff },
  }).select('_id').lean();

  for (const job of stale) {
    purgeJobFiles(String(job._id));
    await PaperImportJob.updateOne(
      { _id: job._id },
      { $set: { isDeleted: true } },
    );
    logger.info(`[PaperImport] cleanup purged jobId=${String(job._id)}`);
  }
}
