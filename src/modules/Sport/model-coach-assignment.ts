import mongoose, { Schema, Document, Types } from 'mongoose';

export const COACH_ROLES = [
  'head_coach',
  'assistant_coach',
  'manager',
  'physio',
] as const;
export type CoachRole = (typeof COACH_ROLES)[number];

export interface ICoachAssignment extends Document {
  schoolId: Types.ObjectId;
  userId: Types.ObjectId;
  teamId: Types.ObjectId;
  role: CoachRole;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const coachAssignmentSchema = new Schema<ICoachAssignment>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    teamId: { type: Schema.Types.ObjectId, ref: 'SportTeam', required: true },
    role: { type: String, enum: COACH_ROLES, default: 'head_coach' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

coachAssignmentSchema.index({ schoolId: 1, userId: 1 });
coachAssignmentSchema.index({ teamId: 1, userId: 1 }, { unique: true });

export const CoachAssignment = mongoose.model<ICoachAssignment>(
  'CoachAssignment',
  coachAssignmentSchema,
);
