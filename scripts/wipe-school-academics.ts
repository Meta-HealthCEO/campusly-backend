/**
 * Wipe the school-scoped Subject and Grade records that were auto-created
 * before the teaching-scope feature. After this, standalone teachers will
 * derive grade/subject lists entirely from their teachingScope → CurriculumNode.
 *
 * Keeps: orphans (schoolId: null), curriculum nodes, textbooks, identity.
 * Wipes: every Grade and Subject record tied to any school.
 *
 * Usage:
 *   npx tsx scripts/wipe-school-academics.ts --dry-run
 *   npx tsx scripts/wipe-school-academics.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly_teacher_staging';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no deletes' : '⚠️  LIVE — wiping school-scoped grades + subjects');
  await mongoose.connect(MONGODB_URI);

  const gradeFilter = { schoolId: { $ne: null } };
  const subjectFilter = { schoolId: { $ne: null } };

  const [gradeCount, subjectCount] = await Promise.all([
    mongoose.connection.collection('grades').countDocuments(gradeFilter),
    mongoose.connection.collection('subjects').countDocuments(subjectFilter),
  ]);

  console.log(`School-scoped grades to wipe   : ${gradeCount}`);
  console.log(`School-scoped subjects to wipe : ${subjectCount}`);

  if (!DRY_RUN) {
    const g = await mongoose.connection.collection('grades').deleteMany(gradeFilter);
    const s = await mongoose.connection.collection('subjects').deleteMany(subjectFilter);
    console.log(`Deleted ${g.deletedCount} grades, ${s.deletedCount} subjects.`);
  }

  // Sanity-print what remains
  const remainingGrades = await mongoose.connection.collection('grades').countDocuments({});
  const remainingSubjects = await mongoose.connection.collection('subjects').countDocuments({});
  console.log(`\nRemaining grades (all orphans): ${remainingGrades}`);
  console.log(`Remaining subjects (all orphans): ${remainingSubjects}`);

  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });
