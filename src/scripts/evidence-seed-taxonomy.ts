// src/scripts/evidence-seed-taxonomy.ts
/**
 * Seeds misconception types for every topic of one or more subject nodes
 * ahead of use (spec §6.3). Platform cost; no school is charged.
 *
 *   npm run evidence:seed-taxonomy -- --subject=<subject node code>[,<code>…]            # dry run
 *   npm run evidence:seed-taxonomy -- --subject=<codes> --apply [--grounding=<file.txt>]
 */
import { readFileSync } from 'node:fs';
import mongoose from 'mongoose';
import { config } from '../config/env.js';
import { logger } from '../common/logger.js';
import { CurriculumNode } from '../modules/CurriculumStructure/model.js';
import { hasActiveTypes, seedTopicTypes } from '../modules/Evidence/seed.js';
import { parseEvidenceArgs } from './evidence-args.js';
import { estimateRand } from './evidence-cost.js';

const SEED_INPUT_TOKENS = 900;
const SEED_OUTPUT_TOKENS = 1100;

async function main(): Promise<void> {
  const args = parseEvidenceArgs(process.argv.slice(2));
  if (!args.subject) throw new Error('--subject=<subject node code> is required');
  const grounding = args.grounding ? readFileSync(args.grounding, 'utf8') : undefined;
  await mongoose.connect(config.mongodb.uri);
  try {
    const subjects = await CurriculumNode.find({ code: { $in: args.subject.split(',') }, type: 'subject', isDeleted: false }).select('_id code').lean();
    const topics = await CurriculumNode.find({ subjectId: { $in: subjects.map((s) => s._id) }, type: 'topic', isDeleted: false }).select('_id title').lean();
    const todo: typeof topics = [];
    for (const t of topics) if (!(await hasActiveTypes(t._id))) todo.push(t);
    logger.info(`${todo.length} of ${topics.length} topics need types; estimated R${estimateRand(todo.length * SEED_INPUT_TOKENS, todo.length * SEED_OUTPUT_TOKENS, false)}.`);
    if (!args.apply) {
      logger.info('Dry run: nothing seeded. Run with --apply to seed.');
      return;
    }
    for (const t of todo) logger.info(`${t.title}: ${await seedTopicTypes(t._id, { schoolId: null, teacherId: null, grounding })} types`);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err: unknown) => {
  logger.error({ err }, 'evidence:seed-taxonomy failed');
  process.exit(1);
});
