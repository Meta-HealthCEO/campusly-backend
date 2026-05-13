import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly_teacher_staging';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;
  const users = await db.collection('users').find({}).project({ email: 1, isStandaloneTeacher: 1, teachingScope: 1 }).toArray();
  for (const u of users) {
    console.log(`${u.email}  standalone=${u.isStandaloneTeacher}`);
    console.log(`  scope grades: ${u.teachingScope?.grades?.length ?? 0}`);
    console.log(`  scope subjectsByGrade entries: ${u.teachingScope?.subjectsByGrade?.length ?? 0}`);
    if (u.teachingScope?.subjectsByGrade) {
      for (const entry of u.teachingScope.subjectsByGrade) {
        console.log(`    gradeId=${entry.gradeId}  subjectIds=${entry.subjectIds?.length ?? 0}`);
      }
    }
  }
  await mongoose.disconnect();
}
main().catch(console.error);
