// src/jobs/evidence.job.ts
//
// The `evidence` queue (plan ruling P17): the daily reconcile (Task 9),
// diagnosis submit every 10 minutes and collect every 2 (Task 15), and the
// weekly taxonomy tidy (Task 16).
import { Worker, type Job } from 'bullmq';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { evidenceQueue, redisConnection } from './queues.js';

const DAY_MS = 24 * 3600_000;
const DIAGNOSIS_OFF = { skipped: 'EVIDENCE_DIAGNOSIS_ENABLED=false' } as const;

export const EVIDENCE_JOBS = {
  reconcile: 'reconcile',
  diagnosisSubmit: 'diagnosis-submit',
  diagnosisCollect: 'diagnosis-collect',
  taxonomyTidy: 'taxonomy-tidy',
} as const;

export async function processEvidenceJob(name: string, now: Date = new Date()): Promise<unknown> {
  switch (name) {
    case EVIDENCE_JOBS.reconcile: {
      const { reconcileEvidence } = await import('../modules/Evidence/reconcile.js');
      return reconcileEvidence({ apply: true, since: new Date(now.getTime() - 2 * DAY_MS) });
    }
    case EVIDENCE_JOBS.diagnosisSubmit: {
      if (!config.evidence.enabled) return DIAGNOSIS_OFF;
      const { submitDiagnoses } = await import('../modules/Evidence/pipeline-submit.js');
      return submitDiagnoses({ now });
    }
    case EVIDENCE_JOBS.diagnosisCollect: {
      if (!config.evidence.enabled) return DIAGNOSIS_OFF;
      const { collectDiagnoses } = await import('../modules/Evidence/pipeline-collect.js');
      return collectDiagnoses(now);
    }
    case EVIDENCE_JOBS.taxonomyTidy: {
      const { tidyTaxonomy } = await import('../modules/Evidence/tidy.js');
      return tidyTaxonomy();
    }
    default:
      throw new Error(`Unknown evidence job ${name}`);
  }
}

export function createEvidenceWorker(): Worker {
  const worker = new Worker('evidence', (job: Job) => processEvidenceJob(job.name), { connection: redisConnection, concurrency: 1 });
  worker.on('failed', (job, err) => logger.error(`[Evidence] ${job?.name} failed: ${err.message}`));
  return worker;
}

export async function scheduleEvidenceJobs(): Promise<void> {
  await evidenceQueue.add(EVIDENCE_JOBS.reconcile, {}, { repeat: { pattern: '30 0 * * *' } }); // 02:30 SAST daily
  await evidenceQueue.add(EVIDENCE_JOBS.diagnosisSubmit, {}, { repeat: { pattern: '*/10 * * * *' } });
  await evidenceQueue.add(EVIDENCE_JOBS.diagnosisCollect, {}, { repeat: { pattern: '*/2 * * * *' } });
  await evidenceQueue.add(EVIDENCE_JOBS.taxonomyTidy, {}, { repeat: { pattern: '0 1 * * 1' } }); // Mondays 03:00 SAST
  logger.info('[Evidence] repeatable jobs scheduled');
}
