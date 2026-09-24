import mongoose, { Schema, type Document, type Types } from 'mongoose';
import { BEHAVIOUR_KINDS, SEVERITIES, type BehaviourKind, type Severity } from './behaviour-rules.js';

export const BEHAVIOUR_SOURCES = ['log', 'profile', 'roster', 'register'] as const;
export type BehaviourSource = (typeof BEHAVIOUR_SOURCES)[number];

/** One merit, demerit or incident a teacher noted for a learner. */
export interface IBehaviourEntry extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  /** The learner's class when it was logged. */
  classId: Types.ObjectId | null;
  kind: BehaviourKind;
  category: string;
  /** Signed: merits add, demerits take away, incidents carry none. */
  points: number;
  severity: Severity | null;
  note: string;
  occurredAt: Date;
  loggedBy: Types.ObjectId;
  /** Where it was logged from. */
  source: BehaviourSource;
  /** Sent by the app with each log, so a double tap logs once. */
  requestKey: string | null;
  /** The Merit or Discipline record it was moved from (one behaviour log). */
  legacyId: Types.ObjectId | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const behaviourEntrySchema = new Schema<IBehaviourEntry>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', default: null },
    kind: { type: String, enum: BEHAVIOUR_KINDS, required: true },
    category: { type: String, required: true, trim: true },
    points: { type: Number, required: true, default: 0 },
    severity: { type: String, enum: [...SEVERITIES, null], default: null },
    note: { type: String, default: '', trim: true, maxlength: 500 },
    occurredAt: { type: Date, default: () => new Date() },
    loggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, enum: BEHAVIOUR_SOURCES, default: 'log' },
    requestKey: { type: String, default: null },
    legacyId: { type: Schema.Types.ObjectId, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

behaviourEntrySchema.index({ schoolId: 1, studentId: 1, isDeleted: 1, occurredAt: -1 });
behaviourEntrySchema.index({ schoolId: 1, classId: 1, isDeleted: 1, occurredAt: -1 });
// A soft-deleted entry (undo) must free its requestKey: excluding isDeleted
// entries from the partial filter lets a retry with the same key make a new
// live entry instead of colliding with the deleted one.
behaviourEntrySchema.index(
  { schoolId: 1, loggedBy: 1, requestKey: 1 },
  { unique: true, partialFilterExpression: { requestKey: { $type: 'string' }, isDeleted: false } },
);
// One log entry per old record: the migration and the old routes' copies can't duplicate.
behaviourEntrySchema.index({ legacyId: 1 }, { unique: true, partialFilterExpression: { legacyId: { $type: 'objectId' } } });

export const BehaviourEntry = mongoose.model<IBehaviourEntry>('BehaviourEntry', behaviourEntrySchema);
