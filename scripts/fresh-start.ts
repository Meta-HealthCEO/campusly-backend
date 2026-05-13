/**
 * Fresh-start migration: wipe all teacher-generated and AI-generated content,
 * keep curriculum + textbooks + identity (users, schools, classes, etc.).
 *
 * Designed for local development on a single-machine MongoDB. Hard deletes.
 * Irreversible — run only on a DB you don't mind losing.
 *
 * Usage:
 *   npx tsx scripts/fresh-start.ts            # actually wipes
 *   npx tsx scripts/fresh-start.ts --dry-run  # show counts only, delete nothing
 */
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly';
const DRY_RUN = process.argv.includes('--dry-run');

/**
 * Mongo collections to wipe. Names match Mongoose's pluralised lowercase default
 * (verified by inspecting the model files).
 */
const COLLECTIONS_TO_WIPE = [
  // ── Content authored on top of curriculum (the primary target) ──────────
  'contentresources',          // ContentLibrary
  'studentattempts',           // ContentLibrary block-level attempts
  'studentmasteries',          // ContentLibrary mastery

  // ── Lessons and the deprecated lesson plans module ──────────────────────
  'lessons',                   // Lesson workspace
  'lessonplans',               // deprecated module
  'lessonnotes',               // Classroom inline notes

  // ── Homework + submissions + templates ──────────────────────────────────
  'homeworks',
  'homeworksubmissions',
  'homeworktemplates',

  // ── Question bank, papers, marking ──────────────────────────────────────
  'questions',                 // QuestionBank
  'assessmentpapers',          // QuestionBank exam papers
  'generatedpapers',           // older paper model (legacy)
  'papermarkings',             // AI marking results
  'markingbatches',            // AI marking batch jobs
  'rubrictemplates',           // AI grading rubrics

  // ── Learning module (quizzes + study materials) ─────────────────────────
  'quizzes',
  'quizattempts',
  'studymaterials',

  // ── AI service jobs + telemetry ─────────────────────────────────────────
  'gradingjobs',
  'aiusagelogs',
  'paperimportjobs',           // built yesterday — disposable
];

/**
 * Disk paths to clear (uploaded files tied to wiped collections).
 */
const DISK_PATHS_TO_CLEAR = [
  path.join(process.cwd(), 'uploads', 'paper-imports'),
  path.join(process.cwd(), 'uploads', 'markings'),
  path.join(process.cwd(), 'uploads', 'markings-batch'),
];

/**
 * Collections explicitly kept — for documentation / sanity check only.
 * Anything not in COLLECTIONS_TO_WIPE is kept by default.
 */
const KEPT_FOR_DOCUMENTATION = [
  'users', 'schools', 'classes', 'students', 'parents', 'teachers', 'staff',
  'subjects', 'grades', 'departments',
  'curriculumframeworks', 'curriculumnodes',
  'textbooks',
  'permissions', 'settings',
];

async function countDoc(name: string): Promise<number> {
  return mongoose.connection.collection(name).countDocuments();
}

async function wipeCollection(name: string): Promise<{ count: number; deleted: number }> {
  const count = await countDoc(name);
  if (count === 0) return { count, deleted: 0 };
  if (DRY_RUN) return { count, deleted: 0 };
  const result = await mongoose.connection.collection(name).deleteMany({});
  return { count, deleted: result.deletedCount ?? 0 };
}

function clearDisk(dir: string): { existed: boolean } {
  if (!fs.existsSync(dir)) return { existed: false };
  if (!DRY_RUN) fs.rmSync(dir, { recursive: true, force: true });
  return { existed: true };
}

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no deletes will happen\n' : '⚠️  LIVE RUN — wiping data\n');
  console.log(`Connecting to ${MONGODB_URI}`);
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected\n');

  console.log('Collections marked KEEP (documentation):');
  for (const name of KEPT_FOR_DOCUMENTATION) {
    const count = await countDoc(name).catch(() => -1);
    console.log(`  ${name.padEnd(30)} ${count >= 0 ? count : '(missing)'} docs`);
  }

  console.log('\nCollections to WIPE:');
  let totalCount = 0;
  let totalDeleted = 0;
  for (const name of COLLECTIONS_TO_WIPE) {
    const { count, deleted } = await wipeCollection(name);
    totalCount += count;
    totalDeleted += deleted;
    const action = DRY_RUN ? 'would wipe' : 'wiped';
    console.log(`  ${name.padEnd(30)} ${count.toString().padStart(6)} docs ${count > 0 ? `(${action} ${DRY_RUN ? count : deleted})` : ''}`);
  }

  console.log('\nDisk paths:');
  for (const dir of DISK_PATHS_TO_CLEAR) {
    const { existed } = clearDisk(dir);
    const action = DRY_RUN ? 'would clear' : 'cleared';
    console.log(`  ${dir}  ${existed ? action : '(missing)'}`);
  }

  console.log('\n──────────────────────────────────────────────────────');
  if (DRY_RUN) {
    console.log(`Dry run complete. ${totalCount} documents would be deleted.`);
    console.log('Re-run without --dry-run to actually wipe.');
  } else {
    console.log(`Wipe complete. ${totalDeleted} documents deleted across ${COLLECTIONS_TO_WIPE.length} collections.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
