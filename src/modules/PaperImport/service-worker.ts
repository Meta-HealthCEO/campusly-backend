import type { IPaperImportJob } from './model.js';

export async function runConversion(job: IPaperImportJob): Promise<void> {
  // Implemented across Tasks 8-13
  job.status = 'completed';
  await job.save();
}
