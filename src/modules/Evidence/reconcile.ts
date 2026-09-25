// src/modules/Evidence/reconcile.ts
//
// Walks every source (or one) and runs the same writers the hooks run, so a
// backfill run twice changes nothing and the daily run repairs missed hooks
// and rows whose source was deleted (spec §5). Each writer reads its record
// inside the record's own school, and the test writer applies the same
// wrong-paper rule the hooks do (markingWritesEvidence).
import type { Model } from 'mongoose';
import mongoose from 'mongoose';
import { PaperMarking } from '../AITools/model-marking.js';
import { HomeworkSubmission } from '../Homework/model.js';
import { QuizAttempt } from '../Course/model.js';
import { PracticeAttempt } from '../AITutor/model.js';
import { StudentAttempt } from '../ContentLibrary/model-tracking.js';
import { syncMarkingEvidence } from './writers/test.js';
import { syncHomeworkEvidence } from './writers/homework.js';
import { syncQuickCheckEvidence } from './writers/unit-check.js';
import { syncPracticeEvidence } from './writers/practice.js';
import { syncLibraryEvidence } from './writers/library.js';
import { logger } from '../../common/logger.js';
import { SOURCE_TYPES, emptyResult, type Oid, type SourceType, type WriteResult, type WriterOptions } from './types.js';

export interface ReconcileOptions { apply: boolean; schoolId?: string; source?: SourceType; since?: Date }
export interface SourceReport {
  records: number; written: number; updated: number; unchanged: number; removed: number;
  rows: number; withTopic: number; withLevel: number; skipped: Record<string, number>;
}

interface SourceWalker {
  model: Model<Record<string, unknown>>;
  /** The timestamp that moves when the record changes. */
  changedAt: string;
  sync: (id: Oid, schoolId: Oid, options: WriterOptions) => Promise<WriteResult | null>;
}

const WALKERS: Record<SourceType, SourceWalker> = {
  test: { model: PaperMarking as unknown as Model<Record<string, unknown>>, changedAt: 'updatedAt', sync: syncMarkingEvidence },
  homework: { model: HomeworkSubmission as unknown as Model<Record<string, unknown>>, changedAt: 'updatedAt', sync: syncHomeworkEvidence },
  unit_check: { model: QuizAttempt as unknown as Model<Record<string, unknown>>, changedAt: 'submittedAt', sync: syncQuickCheckEvidence },
  practice: { model: PracticeAttempt as unknown as Model<Record<string, unknown>>, changedAt: 'updatedAt', sync: syncPracticeEvidence },
  library: { model: StudentAttempt as unknown as Model<Record<string, unknown>>, changedAt: 'createdAt', sync: syncLibraryEvidence },
};

const emptyReport = (): SourceReport => ({ records: 0, written: 0, updated: 0, unchanged: 0, removed: 0, rows: 0, withTopic: 0, withLevel: 0, skipped: {} });

function add(report: SourceReport, r: WriteResult | null): void {
  report.records += 1;
  if (!r) return;
  report.written += r.written;
  report.updated += r.updated;
  report.unchanged += r.unchanged;
  report.removed += r.removed;
  report.rows += r.written + r.updated + r.unchanged;
  report.withTopic += r.withTopic;
  report.withLevel += r.withLevel;
  for (const [reason, n] of Object.entries(r.skipped)) report.skipped[reason] = (report.skipped[reason] ?? 0) + n;
}

export async function reconcileEvidence(options: ReconcileOptions): Promise<Record<SourceType, SourceReport>> {
  const reports = Object.fromEntries(SOURCE_TYPES.map((s) => [s, emptyReport()])) as Record<SourceType, SourceReport>;
  const sources = options.source ? [options.source] : [...SOURCE_TYPES];
  for (const source of sources) {
    const walker = WALKERS[source];
    const filter: Record<string, unknown> = {};
    if (options.schoolId) filter.schoolId = new mongoose.Types.ObjectId(options.schoolId);
    if (options.since) filter[walker.changedAt] = { $gte: options.since };
    const cursor = walker.model.find(filter).select('_id schoolId').sort({ _id: 1 }).lean().cursor();
    for await (const doc of cursor) {
      const { _id, schoolId } = doc as unknown as { _id: Oid; schoolId?: Oid | null };
      add(reports[source], await syncOne(walker, source, _id, schoolId ?? null, !options.apply));
    }
  }
  return reports;
}

const skippedAs = (reason: string): WriteResult => ({ ...emptyResult(), skipped: { [reason]: 1 } });

/** One record: a record with no school cannot be scoped and is skipped; a failing record is logged and the run goes on. */
async function syncOne(walker: SourceWalker, source: SourceType, id: Oid, schoolId: Oid | null, dryRun: boolean): Promise<WriteResult | null> {
  if (!schoolId || !mongoose.isValidObjectId(schoolId)) return skippedAs('no_school');
  try {
    return await walker.sync(id, schoolId, { dryRun });
  } catch (err: unknown) {
    logger.error({ err, source, recordId: String(id) }, '[Evidence] reconcile could not sync a record; carrying on');
    return skippedAs('error');
  }
}
