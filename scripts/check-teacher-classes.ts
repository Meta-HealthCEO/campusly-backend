import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly_teacher_staging';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;
  const teachers = await db.collection('users').find({ isStandaloneTeacher: true }).toArray();
  for (const t of teachers) {
    console.log(`\nTeacher: ${t.email}  id=${t._id}  schoolId=${t.schoolId}`);
    const classes = await db.collection('classes').find({ teacherId: t._id, isDeleted: false }).toArray();
    console.log(`  Classes (${classes.length}):`);
    for (const c of classes) {
      console.log(`    ${c._id}  name="${c.name}"  gradeId=${c.gradeId}  isHomeroom=${c.isHomeroom ?? false}`);
    }
    const timetables = await db.collection('timetables').find({ teacherId: t._id, isDeleted: false }).toArray();
    console.log(`  Timetable rows (${timetables.length}):`);
    for (const tt of timetables) {
      console.log(`    classId=${tt.classId}  subjectId=${tt.subjectId}  day=${tt.day}  period=${tt.period}`);
    }
  }
  await mongoose.disconnect();
}
main().catch(console.error);
