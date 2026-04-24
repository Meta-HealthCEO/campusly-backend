/**
 * Seed script — starter content pack for HomeworkBuilder pickers.
 *
 * Inserts quizzes (Learning), content resources (ContentLibrary), and
 * questions (QuestionBank) for one subject/grade pack so pickers are
 * non-empty out of the box.
 *
 * Usage:
 *   npx tsx scripts/seed-content-library.ts
 *
 * The script is idempotent: it skips rows that already exist (matched by
 * title/stem + schoolId).
 *
 * Requirements per school:
 *  - A matching Subject (name contains pack.subjectName, case-insensitive)
 *  - A matching Grade   (name contains pack.gradeLabel, case-insensitive)
 *  - At least one User  (used as createdBy / teacherId placeholder)
 *  - At least one Class tied to that grade (for Quiz classId)
 *  - At least one CurriculumNode (for ContentResource / Question)
 *
 * If any prerequisite is missing the pack is skipped for that school with
 * a clear log message. Quizzes are skipped independently when no class is
 * found — resources/questions still seed in that case.
 */

import mongoose, { Types } from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from '../src/config/env.js';
import { Quiz } from '../src/modules/Learning/model.js';
import { ContentResource } from '../src/modules/ContentLibrary/model.js';
import { Question } from '../src/modules/QuestionBank/model.js';
import { School } from '../src/modules/School/model.js';
import { Grade, Subject, Class } from '../src/modules/Academic/model.js';
import { CurriculumNode } from '../src/modules/CurriculumStructure/model.js';
import { User } from '../src/modules/Auth/model.js';
import { logger } from '../src/common/logger.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SeedPack {
  subjectName: string;
  gradeLabel: string;
  quizFile: string;
  resourceFile: string;
  questionFile: string;
}

interface RawQuizQuestion {
  questionText: string;
  questionType: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  correctAnswer: string;
  points: number;
  explanation?: string;
}

interface RawQuiz {
  title: string;
  description?: string;
  type: string;
  totalPoints: number;
  questions: RawQuizQuestion[];
  showInstantFeedback?: boolean;
  allowRetry?: boolean;
}

interface RawBlock {
  blockId: string;
  type: string;
  order: number;
  content: string;
}

interface RawResource {
  title: string;
  type: string;
  format: string;
  difficulty: number;
  estimatedMinutes: number;
  blocks: RawBlock[];
}

interface RawOption {
  label: string;
  text: string;
  isCorrect: boolean;
}

interface RawQuestion {
  type: string;
  stem: string;
  options: RawOption[];
  answer: string;
  markingRubric: string;
  marks: number;
  difficulty: number;
  cognitiveLevel: { caps: string; blooms: string };
}

// ─── Packs ────────────────────────────────────────────────────────────────────

const DATA_DIR = join(process.cwd(), 'scripts', 'seed-data');

const PACKS: SeedPack[] = [
  {
    subjectName: 'Mathematics',
    gradeLabel: 'Grade 7',
    quizFile: 'quizzes-math-gr7.json',
    resourceFile: 'resources-math-gr7.json',
    questionFile: 'questions-math-gr7.json',
  },
  // Add more packs here for other subjects/grades
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson<T>(file: string): T[] {
  return JSON.parse(readFileSync(join(DATA_DIR, file), 'utf8')) as T[];
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  await mongoose.connect(config.mongodb.uri);
  logger.info(`Connected to ${config.mongodb.uri}`);

  const schools = await School.find({ isDeleted: false }).lean();
  if (schools.length === 0) {
    logger.warn('No schools found — seed aborted.');
    await mongoose.disconnect();
    return;
  }

  for (const school of schools) {
    const schoolId = school._id as Types.ObjectId;
    logger.info(`\nSeeding for school: ${school.name} (${String(schoolId)})`);

    // Find any admin/teacher user for createdBy / teacherId
    const systemUser = await User.findOne({
      schoolId,
      isDeleted: false,
      isActive: true,
    })
      .select('_id')
      .lean();

    if (!systemUser) {
      logger.warn(`  [skip] No active user found for school ${school.name}`);
      continue;
    }
    const userId = systemUser._id as Types.ObjectId;

    // Find any curriculum node for this school (or global)
    const curriculumNode = await CurriculumNode.findOne({
      $or: [{ schoolId }, { schoolId: null }],
      isDeleted: false,
    })
      .select('_id')
      .lean();

    if (!curriculumNode) {
      logger.warn(`  [skip] No CurriculumNode found for school ${school.name}`);
      continue;
    }
    const curriculumNodeId = curriculumNode._id as Types.ObjectId;

    for (const pack of PACKS) {
      // Look up subject
      const subjectDoc = await Subject.findOne({
        schoolId,
        isDeleted: false,
        name: { $regex: pack.subjectName, $options: 'i' },
      })
        .select('_id')
        .lean();

      if (!subjectDoc) {
        logger.info(
          `  [skip] Subject "${pack.subjectName}" not found in ${school.name}`,
        );
        continue;
      }
      const subjectId = subjectDoc._id as Types.ObjectId;

      // Look up grade
      const gradeDoc = await Grade.findOne({
        schoolId,
        isDeleted: false,
        name: { $regex: pack.gradeLabel, $options: 'i' },
      })
        .select('_id')
        .lean();

      if (!gradeDoc) {
        logger.info(
          `  [skip] Grade "${pack.gradeLabel}" not found in ${school.name}`,
        );
        continue;
      }
      const gradeId = gradeDoc._id as Types.ObjectId;

      // Look up a class for the grade (needed for Quiz)
      const classDoc = await Class.findOne({
        schoolId,
        gradeId,
        isDeleted: false,
      })
        .select('_id')
        .lean();

      // ── Quizzes ──────────────────────────────────────────────────────────
      let quizInserted = 0;

      if (!classDoc) {
        logger.info(
          `  [quiz skip] No class found for grade "${pack.gradeLabel}" — quizzes require a classId`,
        );
      } else {
        const classId = classDoc._id as Types.ObjectId;
        const quizzes = readJson<RawQuiz>(pack.quizFile);

        for (const q of quizzes) {
          const exists = await Quiz.findOne({
            title: q.title,
            schoolId,
            isDeleted: false,
          }).lean();
          if (exists) continue;

          await Quiz.create({
            title: q.title,
            description: q.description ?? '',
            type: q.type,
            totalPoints: q.totalPoints,
            questions: q.questions,
            showInstantFeedback: q.showInstantFeedback ?? false,
            allowRetry: q.allowRetry ?? false,
            status: 'published',
            schoolId,
            subjectId,
            classId,
            teacherId: userId,
          });
          quizInserted++;
        }
      }
      logger.info(
        `  [quiz] ${quizInserted} new quizzes for ${pack.subjectName}`,
      );

      // ── Content Resources ─────────────────────────────────────────────────
      const resources = readJson<RawResource>(pack.resourceFile);
      let resourceInserted = 0;

      for (const r of resources) {
        const exists = await ContentResource.findOne({
          title: r.title,
          schoolId,
          isDeleted: false,
        }).lean();
        if (exists) continue;

        await ContentResource.create({
          title: r.title,
          type: r.type,
          format: r.format,
          difficulty: r.difficulty,
          estimatedMinutes: r.estimatedMinutes,
          blocks: r.blocks,
          source: 'system',
          status: 'approved',
          term: 1,
          schoolId,
          subjectId,
          gradeId,
          curriculumNodeId,
          createdBy: userId,
          sourceAttribution: '',
          reviewNotes: '',
        });
        resourceInserted++;
      }
      logger.info(
        `  [resource] ${resourceInserted} new resources for ${pack.subjectName}`,
      );

      // ── Questions ─────────────────────────────────────────────────────────
      const questions = readJson<RawQuestion>(pack.questionFile);
      let qInserted = 0;

      for (const q of questions) {
        const exists = await Question.findOne({
          stem: q.stem,
          schoolId,
          isDeleted: false,
        }).lean();
        if (exists) continue;

        await Question.create({
          stem: q.stem,
          type: q.type,
          options: q.options,
          answer: q.answer,
          markingRubric: q.markingRubric,
          marks: q.marks,
          difficulty: q.difficulty,
          cognitiveLevel: q.cognitiveLevel,
          source: 'system',
          status: 'approved',
          schoolId,
          subjectId,
          gradeId,
          curriculumNodeId,
          createdBy: userId,
          tags: [],
        });
        qInserted++;
      }
      logger.info(
        `  [question] ${qInserted} new questions for ${pack.subjectName}`,
      );
    }
  }

  await mongoose.disconnect();
  logger.info('\nDone.');
}

main().catch((err: unknown) => {
  logger.error({ err }, 'Seed failed');
  process.exit(1);
});
