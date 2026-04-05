import path from 'path';
import dotenv from 'dotenv';
// Load .env BEFORE any imports that use process.env
dotenv.config({ path: path.resolve(import.meta.dirname ?? __dirname, '..', '.env') });

import mongoose from 'mongoose';
import { CurriculumNode } from '../src/modules/CurriculumStructure/model.js';
import { GenerationService } from '../src/modules/ContentLibrary/service-generation.js';
import { ContentResource } from '../src/modules/ContentLibrary/model.js';
import { logger } from '../src/common/logger.js';

const SCHOOL_ID = '69ce960a98ca4ee738d25416';
const USER_ID = '69ce960b98ca4ee738d25432'; // admin
const GRADE_ID = '69d0c1241d8a9f6a83801642'; // Grade 10 academic grade (reuse for now)
const SUBJECT_ID = '69d0c1241d8a9f6a83801644'; // Mathematics academic subject

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  logger.info('Connected to MongoDB');

  // Get all Gr12 Maths subtopics
  const subtopics = await CurriculumNode.find({
    code: { $regex: /^CAPS-MATHEMATICS-GR12-T[1-4]-/ },
    type: 'subtopic',
    isDeleted: false,
  }).sort({ code: 1 }).lean();

  logger.info(`Found ${subtopics.length} subtopics to generate lessons for`);

  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const sub of subtopics) {
    // Check if a lesson already exists for this node
    const existing = await ContentResource.findOne({
      curriculumNodeId: sub._id,
      type: 'lesson',
      isDeleted: false,
    });

    if (existing) {
      logger.info(`SKIP: ${sub.title} (lesson already exists)`);
      skipped++;
      continue;
    }

    logger.info(`GENERATING: ${sub.title} (${sub.code})`);

    try {
      const resource = await GenerationService.generateContent(
        SCHOOL_ID,
        USER_ID,
        {
          curriculumNodeId: sub._id.toString(),
          type: 'lesson',
          gradeId: GRADE_ID,
          subjectId: SUBJECT_ID,
          term: parseInt(sub.code.match(/-T(\d)-/)?.[1] ?? '1'),
          blockTypes: ['text', 'quiz', 'fill_blank', 'step_reveal', 'image'],
          difficulty: 3,
          instructions: 'This is for a Grade 12 Matric textbook. Include NSC exam-style worked examples. Use proper SA terminology (learners, not students). Include exam tips and common mistakes learners make.',
        },
      );

      // Auto-approve the resource
      await ContentResource.updateOne(
        { _id: resource._id },
        { $set: { status: 'approved' } },
      );

      generated++;
      logger.info(`  ✓ Generated and approved: ${resource.title} (${resource.blocks?.length ?? 0} blocks)`);

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 2000));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error(`  ✗ FAILED: ${sub.title} — ${msg}`);
      failed++;
    }
  }

  logger.info('\n========================================');
  logger.info(`  Textbook generation complete!`);
  logger.info(`  Generated: ${generated}`);
  logger.info(`  Skipped: ${skipped}`);
  logger.info(`  Failed: ${failed}`);
  logger.info('========================================\n');

  await mongoose.disconnect();
}

main().catch(console.error);
