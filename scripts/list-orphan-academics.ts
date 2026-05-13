import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly_teacher_staging';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;
  const grades = await db.collection('grades').find({ schoolId: null }).project({ name: 1, level: 1, orderIndex: 1 }).toArray();
  const subjects = await db.collection('subjects').find({ schoolId: null }).project({ name: 1, code: 1, gradeIds: 1 }).toArray();
  console.log(`Orphan grades (${grades.length}):`);
  for (const g of grades) console.log(`  ${g.name?.padEnd(20)} level=${g.level ?? g.orderIndex ?? '?'}`);
  console.log(`\nOrphan subjects (${subjects.length}):`);
  for (const s of subjects) console.log(`  ${s.name?.padEnd(35)} ${s.code ?? ''}  (${(s.gradeIds ?? []).length} grade links)`);
  await mongoose.disconnect();
}
main().catch((err) => { console.error(err); process.exit(1); });
