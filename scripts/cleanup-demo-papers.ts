/**
 * Removes duplicate seeded papers, keeps only the latest one with all diagrams.
 * Usage: npx tsx scripts/cleanup-demo-papers.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campusly';

async function main() {
  await mongoose.connect(MONGODB_URI);
  const col = mongoose.connection.collection('generatedpapers');

  // Find all demo papers (topic matches our seed)
  const demoPapers = await col.find({
    topic: 'Functions, Geometry & Statistics',
  }).sort({ createdAt: -1 }).toArray();

  console.log(`Found ${demoPapers.length} demo papers`);

  if (demoPapers.length > 1) {
    // Keep the newest, delete the rest
    const toDelete = demoPapers.slice(1).map((p) => p._id);
    await col.deleteMany({ _id: { $in: toDelete } });
    console.log(`Deleted ${toDelete.length} duplicate(s), kept newest`);
  }

  // Show the kept paper's diagram status
  const kept = demoPapers[0];
  if (kept) {
    const sections = kept.sections as Array<{ questions: Array<{ questionNumber: number; diagram: { svgUrl?: string; renderStatus?: string } | null }> }>;
    for (const sec of sections) {
      for (const q of sec.questions) {
        const status = q.diagram ? `${q.diagram.renderStatus} → ${q.diagram.svgUrl}` : 'no diagram';
        console.log(`  Q${q.questionNumber}: ${status}`);
      }
    }
  }

  await mongoose.disconnect();
}

main().catch(console.error);
