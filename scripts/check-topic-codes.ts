import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly_teacher_staging';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;
  // Sample 5 topic-level nodes for inspection
  const topics = await db.collection('curriculumnodes')
    .find({ type: 'topic' })
    .limit(5)
    .project({ title: 1, code: 1, type: 1 })
    .toArray();
  console.log('Sample topic nodes (n=5):\n');
  for (const t of topics) {
    console.log(`  type=${t.type}`);
    console.log(`  title="${t.title}"`);
    console.log(`  code="${t.code}"`);
    console.log('  ---');
  }
  await mongoose.disconnect();
}
main().catch(console.error);
