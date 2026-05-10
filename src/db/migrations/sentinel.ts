import mongoose, { Schema } from 'mongoose';

const sentinelSchema = new Schema(
  {
    name: { type: String, unique: true, required: true },
    completedAt: { type: Date, required: true },
  },
  { collection: 'migrations' },
);

export const MigrationSentinel =
  mongoose.models.MigrationSentinel ||
  mongoose.model('MigrationSentinel', sentinelSchema);

export async function hasRun(name: string): Promise<boolean> {
  const doc = await MigrationSentinel.findOne({ name }).lean();
  return !!doc;
}

export async function markComplete(name: string): Promise<void> {
  await MigrationSentinel.updateOne(
    { name },
    { $set: { name, completedAt: new Date() } },
    { upsert: true },
  );
}
