// src/jobs/__tests__/evidence-job.test.ts
//
// The `evidence` queue's four repeatable jobs (plan ruling P17): the daily
// reconcile (Task 9), diagnosis submit and collect (Task 15) and the weekly
// taxonomy tidy (Task 16). No Redis and no database: the work is mocked.
import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  evidence: { mode: 'batch', enabled: true },
  add: vi.fn(), reconcile: vi.fn(), submit: vi.fn(), collect: vi.fn(), tidy: vi.fn(),
}));
vi.mock('../../config/env.js', async (importOriginal) => {
  const real = await importOriginal<typeof import('../../config/env.js')>();
  return { config: { ...real.config, evidence: h.evidence } };
});
vi.mock('../queues.js', () => ({ evidenceQueue: { add: h.add }, redisConnection: {} }));
vi.mock('../../modules/Evidence/reconcile.js', () => ({ reconcileEvidence: h.reconcile }));
vi.mock('../../modules/Evidence/pipeline-submit.js', () => ({ submitDiagnoses: h.submit }));
vi.mock('../../modules/Evidence/pipeline-collect.js', () => ({ collectDiagnoses: h.collect }));
vi.mock('../../modules/Evidence/tidy.js', () => ({ tidyTaxonomy: h.tidy }));

import { EVIDENCE_JOBS, processEvidenceJob, scheduleEvidenceJobs } from '../evidence.job.js';

const NOW = new Date('2026-09-25T10:00:00Z');

beforeEach(() => {
  for (const fn of [h.add, h.reconcile, h.submit, h.collect, h.tidy]) fn.mockReset();
  h.evidence.enabled = true;
});

describe('processEvidenceJob', () => {
  it('reconciles the last two days', async () => {
    await processEvidenceJob(EVIDENCE_JOBS.reconcile, NOW);
    expect(h.reconcile).toHaveBeenCalledWith({ apply: true, since: new Date('2026-09-23T10:00:00Z') });
  });

  it('submits and collects diagnoses, and tidies the taxonomy', async () => {
    await processEvidenceJob(EVIDENCE_JOBS.diagnosisSubmit, NOW);
    await processEvidenceJob(EVIDENCE_JOBS.diagnosisCollect, NOW);
    await processEvidenceJob(EVIDENCE_JOBS.taxonomyTidy, NOW);
    expect(h.submit).toHaveBeenCalledWith({ now: NOW });
    expect(h.collect).toHaveBeenCalledWith(NOW);
    expect(h.tidy).toHaveBeenCalledTimes(1);
  });

  it('diagnosis does nothing when EVIDENCE_DIAGNOSIS_ENABLED=false', async () => {
    h.evidence.enabled = false;
    await expect(processEvidenceJob(EVIDENCE_JOBS.diagnosisSubmit, NOW)).resolves.toEqual({ skipped: 'EVIDENCE_DIAGNOSIS_ENABLED=false' });
    await expect(processEvidenceJob(EVIDENCE_JOBS.diagnosisCollect, NOW)).resolves.toEqual({ skipped: 'EVIDENCE_DIAGNOSIS_ENABLED=false' });
    expect(h.submit).not.toHaveBeenCalled();
    expect(h.collect).not.toHaveBeenCalled();
  });

  it('an unknown job is an error', async () => {
    await expect(processEvidenceJob('nope', NOW)).rejects.toThrow('Unknown evidence job nope');
  });
});

describe('scheduleEvidenceJobs', () => {
  it('schedules the four repeatable jobs', async () => {
    await scheduleEvidenceJobs();
    const calls = h.add.mock.calls as Array<[string, unknown, { repeat: { pattern: string } }]>;
    const patterns = Object.fromEntries(calls.map(([name, , opts]) => [name, opts.repeat.pattern]));
    expect(patterns).toEqual({
      reconcile: '30 0 * * *', 'diagnosis-submit': '*/10 * * * *', 'diagnosis-collect': '*/2 * * * *', 'taxonomy-tidy': '0 1 * * 1',
    });
  });
});
