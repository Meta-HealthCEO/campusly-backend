import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly_teacher_staging';
const ID = process.argv[2] || '69d1a9f73d8a213e24b5f87e';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection;
  const oid = new mongoose.Types.ObjectId(ID);
  const subj = await db.collection('subjects').findOne({ _id: oid });
  const node = await db.collection('curriculumnodes').findOne({ _id: oid });
  console.log(`ID: ${ID}`);
  console.log(`  In subjects collection: ${subj ? `YES — name="${subj.name}"` : 'no'}`);
  console.log(`  In curriculumnodes:     ${node ? `YES — title="${node.title}" type=${node.type}` : 'no'}`);
  await mongoose.disconnect();
}
main().catch(console.error);
