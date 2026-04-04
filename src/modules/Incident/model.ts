import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Incident ──────────────────────────────────────────────────────────────

export const INCIDENT_TYPES = [
  'bullying', 'injury', 'property_damage', 'safety_concern',
  'substance', 'theft', 'verbal_abuse', 'cyber_bullying', 'other',
] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

export const INCIDENT_STATUSES = ['reported', 'investigating', 'resolved', 'escalated'] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const PARTY_ROLES = ['perpetrator', 'victim', 'bystander', 'witness'] as const;
export type PartyRole = (typeof PARTY_ROLES)[number];

export const WITNESS_TYPES = ['student', 'staff', 'other'] as const;
export type WitnessType = (typeof WITNESS_TYPES)[number];

export interface IInvolvedParty {
  studentId: Types.ObjectId;
  role: PartyRole;
  description?: string;
  parentNotified: boolean;
  parentNotifiedAt?: Date;
}

export interface IWitness {
  type: WitnessType;
  studentId?: Types.ObjectId;
  staffId?: Types.ObjectId;
  name?: string;
  statement?: string;
}

export interface IStatusHistory {
  status: IncidentStatus;
  date: Date;
  changedBy?: Types.ObjectId;
  notes?: string;
}

export interface IIncident extends Document {
  schoolId: Types.ObjectId;
  incidentNumber: string;
  type: IncidentType;
  severity: SeverityLevel;
  title: string;
  description: string;
  location?: string;
  incidentDate: Date;
  incidentTime?: string;
  status: IncidentStatus;
  involvedParties: IInvolvedParty[];
  witnesses: IWitness[];
  immediateActionTaken?: string;
  reportedBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  statusHistory: IStatusHistory[];
  resolutionSummary?: string;
  resolvedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const incidentSchema = new Schema<IIncident>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    incidentNumber: { type: String, required: true },
    type: { type: String, enum: INCIDENT_TYPES, required: true },
    severity: { type: String, enum: SEVERITY_LEVELS, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    incidentDate: { type: Date, required: true },
    incidentTime: { type: String },
    status: { type: String, enum: INCIDENT_STATUSES, default: 'reported' },
    involvedParties: [
      {
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        role: { type: String, enum: PARTY_ROLES, required: true },
        description: { type: String },
        parentNotified: { type: Boolean, default: false },
        parentNotifiedAt: { type: Date },
      },
    ],
    witnesses: [
      {
        type: { type: String, enum: WITNESS_TYPES, required: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
        staffId: { type: Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        statement: { type: String },
      },
    ],
    immediateActionTaken: { type: String },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    statusHistory: [
      {
        status: { type: String, required: true },
        date: { type: Date, required: true, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        notes: { type: String },
      },
    ],
    resolutionSummary: { type: String },
    resolvedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

incidentSchema.index({ schoolId: 1, incidentNumber: 1 }, { unique: true });
incidentSchema.index({ schoolId: 1, status: 1, severity: 1 });
incidentSchema.index({ schoolId: 1, type: 1, incidentDate: -1 });
incidentSchema.index({ schoolId: 1, 'involvedParties.studentId': 1 });

export const Incident = mongoose.model<IIncident>('Incident', incidentSchema);

// ─── Incident Action ───────────────────────────────────────────────────────

export const ACTION_STATUSES = ['pending', 'in_progress', 'completed', 'overdue'] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export interface IIncidentAction extends Document {
  schoolId: Types.ObjectId;
  incidentId: Types.ObjectId;
  description: string;
  assignedTo: Types.ObjectId;
  dueDate: Date;
  status: ActionStatus;
  completedAt?: Date;
  notes?: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const incidentActionSchema = new Schema<IIncidentAction>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true },
    description: { type: String, required: true, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ACTION_STATUSES, default: 'pending' },
    completedAt: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

incidentActionSchema.index({ incidentId: 1, status: 1 });
incidentActionSchema.index({ assignedTo: 1, status: 1 });

export const IncidentAction = mongoose.model<IIncidentAction>('IncidentAction', incidentActionSchema);

// ─── Confidential Note ─────────────────────────────────────────────────────

export interface IConfidentialNote extends Document {
  schoolId: Types.ObjectId;
  incidentId: Types.ObjectId;
  content: string;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const confidentialNoteSchema = new Schema<IConfidentialNote>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    incidentId: { type: Schema.Types.ObjectId, ref: 'Incident', required: true },
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

confidentialNoteSchema.index({ incidentId: 1, createdBy: 1 });
confidentialNoteSchema.index({ schoolId: 1 });

export const ConfidentialNote = mongoose.model<IConfidentialNote>(
  'ConfidentialNote',
  confidentialNoteSchema,
);

// ─── Incident Counter ──────────────────────────────────────────────────────

export interface IIncidentCounter extends Document {
  schoolId: Types.ObjectId;
  year: number;
  seq: number;
}

const incidentCounterSchema = new Schema<IIncidentCounter>({
  schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
  year: { type: Number, required: true },
  seq: { type: Number, default: 0 },
});

incidentCounterSchema.index({ schoolId: 1, year: 1 }, { unique: true });

export const IncidentCounter = mongoose.model<IIncidentCounter>(
  'IncidentCounter',
  incidentCounterSchema,
);
