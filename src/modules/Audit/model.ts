import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Audit Log ──────────────────────────────────────────────────────────────

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'export';

export interface IAuditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface IAuditLog extends Document {
  userId: Types.ObjectId;
  schoolId?: Types.ObjectId;
  action: AuditAction;
  entity: string;
  entityId?: string;
  changes: IAuditChange[];
  ipAddress?: string;
  userAgent?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const auditChangeSchema = new Schema<IAuditChange>(
  {
    field: {
      type: String,
      required: true,
    },
    oldValue: {
      type: Schema.Types.Mixed,
    },
    newValue: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: false },
);

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'login', 'export'],
      required: true,
    },
    entity: {
      type: String,
      required: true,
      trim: true,
    },
    entityId: {
      type: String,
      trim: true,
    },
    changes: {
      type: [auditChangeSchema],
      default: [],
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

auditLogSchema.index({ schoolId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
