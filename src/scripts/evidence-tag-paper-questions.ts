// src/scripts/evidence-tag-paper-questions.ts
/**
 * Tags inline questions on finalised papers that have markings (Phase E §5),
 * one AI call per paper, before the evidence backfill.
 *
 *   npm run migrate:paper-question-tags                        # dry run: papers, questions, estimated cost
 *   npm run migrate:paper-question-tags -- --apply [--yes]     # --yes is required above R50
 *   npm run migrate:paper-question-tags -- --school=<id>
 */
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { AssessmentPaper } from '../modules/QuestionBank/model.js';
import { PaperMarking } from '../modules/AITools/model-marking.js';
import { tagPaperQuestions } from '../modules/Evidence/tagging.js';
import { parseEvidenceArgs } from './evidence-args.js';
import { estimateRand } from './evidence-cost.js';

const MAX_UNCONFIRMED_RAND = 50;

async function main(): Promise<void> {
  const args = parseEvidenceArgs(process.argv.slice(2));
  await mongoose.connect(config.mongodb.uri);
  try {
    const school = args.school ? { schoolId: new mongoose.Types.ObjectId(args.school) } : {};
    const marked = await PaperMarking.distinct('paperId', { paperType: 'assessment', isDeleted: false, ...school });
    const papers = await AssessmentPaper.find({ _id: { $in: marked }, status: 'finalised', isDeleted: false, ...school }).select('_id title schoolId').lean();
    const plan: Array<{ id: mongoose.Types.ObjectId; schoolId: mongoose.Types.ObjectId; title: string; questions: number }> = [];
    for (const p of papers) {
      const { untagged } = await tagPaperQuestions(p._id, p.schoolId, { dryRun: true });
      if (untagged > 0) plan.push({ id: p._id as mongoose.Types.ObjectId, schoolId: p.schoolId, title: p.title, questions: untagged });
    }
    const questions = plan.reduce((s, p) => s + p.questions, 0);
    const rand = estimateRand(plan.length * 1200 + questions * 150, questions * 30, false);
    logger.info(`${plan.length} papers, ${questions} untagged questions; estimated R${rand}.`);
    if (!args.apply) {
      logger.info('Dry run: nothing tagged. Run with --apply to tag.');
      return;
    }
    if (rand > MAX_UNCONFIRMED_RAND && !args.yes) throw new Error(`Estimated R${rand} is above R${MAX_UNCONFIRMED_RAND}: add --yes to go ahead`);
    for (const p of plan) logger.info({ paper: p.title, ...(await tagPaperQuestions(p.id, p.schoolId)) }, 'tagged');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'migrate:paper-question-tags failed');
  process.exit(1);
});
