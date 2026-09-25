// src/scripts/evidence-diagnose.ts
/**
 * Diagnoses rows that lost marks (Phase E §5, §6).
 *
 *   npm run evidence:diagnose                                  # dry run: candidates, cache hits, pool skips, requests, estimated cost
 *   npm run evidence:diagnose -- --apply                       # submits the normal way (batch: the collect job gathers results)
 *   npm run evidence:diagnose -- --apply --direct              # plain Messages API, results now (dev, e2e)
 *   npm run evidence:diagnose -- --apply --retry-skipped-budget --school=<id> --limit=500
 *
 * EVIDENCE_DIAGNOSIS_MODE=fixture answers with canned replies (never in production).
 */
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { AnswerEvidence } from '../modules/Evidence/model.js';
import { transportMode } from '../modules/Evidence/ai-transport.js';
import { submitDiagnoses } from '../modules/Evidence/pipeline-submit.js';
import { parseEvidenceArgs } from './evidence-args.js';
import { estimateRand } from './evidence-cost.js';

const FIXED_INPUT_PER_REQUEST = 1750;
const INPUT_PER_ANSWER = 370;
const OUTPUT_PER_ANSWER = 75;

async function main(): Promise<void> {
  const args = parseEvidenceArgs(process.argv.slice(2));
  const configured = transportMode();
  const mode = configured === 'fixture' ? 'fixture' : args.direct ? 'direct' : configured;
  await mongoose.connect(config.mongodb.uri);
  try {
    const school = args.school ? { schoolId: new mongoose.Types.ObjectId(args.school) } : {};
    if (args.apply && args.retrySkippedBudget) {
      const res = await AnswerEvidence.updateMany({ ...school, 'diagnosis.state': 'skipped_budget', isDeleted: false },
        { $set: { 'diagnosis.state': 'pending', 'diagnosis.skippedReason': null } });
      logger.info(`${res.modifiedCount} rows skipped for budget are pending again.`);
    }
    const report = await submitDiagnoses({ schoolId: args.school, limit: args.limit, mode, dryRun: !args.apply });
    const rand = estimateRand(report.requests * FIXED_INPUT_PER_REQUEST + report.keys * INPUT_PER_ANSWER, report.keys * OUTPUT_PER_ANSWER, mode === 'batch');
    logger.info({ ...report, mode }, `${report.candidates} rows lost marks; ${report.cacheHits} cache hits, ${report.joined} joined a request in flight, `
      + `${report.skippedBudget} over a school's pool; ${report.keys} answers in ${report.requests} requests; estimated R${rand}.`);
    if (!args.apply) logger.info('Dry run: nothing sent. Run with --apply to diagnose.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'evidence:diagnose failed');
  process.exit(1);
});
