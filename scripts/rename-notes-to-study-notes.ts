/**
 * One-time migration: rename Lesson material kind 'notes' → 'study_notes'.
 *
 * Run: npx tsx scripts/rename-notes-to-study-notes.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { config } from '../src/config/env.js';
import { Lesson } from '../src/modules/Lesson/model.js';

async function run() {
  await mongoose.connect(config.mongodb.uri);
  console.log('Connected to MongoDB');

  const result = await Lesson.updateMany(
    { 'materials.kind': 'notes' },
    { $set: { 'materials.$[m].kind': 'study_notes' } },
    { arrayFilters: [{ 'm.kind': 'notes' }] },
  );
  console.log(`Migrated ${result.modifiedCount} lesson(s) with notes → study_notes`);

  await mongoose.disconnect();
}

run().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
