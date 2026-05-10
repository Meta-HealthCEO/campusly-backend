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

/**
 * Returns true only if the migration has actually completed. An epoch
 * placeholder (`completedAt: new Date(0)`) inserted by `tryClaim` does NOT
 * count as complete — that's an in-progress lock, not a completion record.
 */
export async function hasRun(name: string): Promise<boolean> {
  const doc = await MigrationSentinel.findOne({
    name,
    completedAt: { $gt: new Date(0) },
  }).lean();
  return !!doc;
}

/**
 * Atomically claim a migration lock. Returns true if THIS process claimed it
 * (and is responsible for running the migration); false if another process
 * already claimed it (and we should skip).
 *
 * Uses the unique `name` index as a distributed lock. The sentinel doc is
 * inserted with `completedAt = epoch` (placeholder); `markComplete` updates it
 * to the real timestamp when the migration finishes successfully.
 */
export async function tryClaim(name: string): Promise<boolean> {
  try {
    await MigrationSentinel.create({ name, completedAt: new Date(0) });
    return true;
  } catch (err: unknown) {
    // Duplicate key (E11000) means another instance already claimed.
    if (
      err instanceof Error &&
      'code' in err &&
      (err as Record<string, unknown>).code === 11000
    ) {
      return false;
    }
    throw err;
  }
}

export async function markComplete(name: string): Promise<void> {
  await MigrationSentinel.updateOne(
    { name },
    { $set: { name, completedAt: new Date() } },
    { upsert: true },
  );
}

/**
 * Release a previously-claimed lock by deleting the epoch-placeholder sentinel.
 * Safe to call on failure: only deletes docs where completedAt is still the
 * epoch placeholder; a successfully-completed sentinel (completedAt > epoch)
 * is preserved so the migration is recognised as done.
 */
export async function releaseClaim(name: string): Promise<void> {
  await MigrationSentinel.deleteOne({ name, completedAt: new Date(0) });
}
