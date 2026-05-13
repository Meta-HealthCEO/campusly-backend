/**
 * Inspect what grades and subjects belong to each school in the DB.
 * Usage: npx tsx scripts/check-school-academics.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly_teacher_staging';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;

  const schools = await db.collection('schools').find({}).toArray();
  console.log(`Schools (${schools.length}):\n`);
  for (const s of schools) {
    console.log(`  ${s._id}  ${s.name ?? '(unnamed)'}`);
    const gradeCount = await db.collection('grades').countDocuments({ schoolId: s._id });
    const subjectCount = await db.collection('subjects').countDocuments({ schoolId: s._id });
    const grades = await db.collection('grades').find({ schoolId: s._id }).project({ name: 1, level: 1 }).toArray();
    const subjects = await db.collection('subjects').find({ schoolId: s._id }).project({ name: 1, code: 1, gradeIds: 1 }).toArray();
    console.log(`    grades   : ${gradeCount}  — ${grades.map((g) => g.name).join(', ') || '(none)'}`);
    console.log(`    subjects : ${subjectCount}`);
    for (const subj of subjects) {
      console.log(`      ${subj.name?.padEnd(30) ?? ''} (${(subj.gradeIds ?? []).length} grade links)`);
    }
    console.log();
  }

  const orphanGrades = await db.collection('grades').countDocuments({ schoolId: null });
  const orphanSubjects = await db.collection('subjects').countDocuments({ schoolId: null });
  console.log(`Orphan (schoolId: null): grades=${orphanGrades}, subjects=${orphanSubjects}`);

  const totalGrades = await db.collection('grades').countDocuments({});
  const totalSubjects = await db.collection('subjects').countDocuments({});
  console.log(`Totals: grades=${totalGrades}, subjects=${totalSubjects}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
