import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── AI Performance Report ───────────────────────────────────────────────────

export type AIReportType =
  | 'player_analysis'
  | 'development_plan'
  | 'scouting_report'
  | 'parent_report'
  | 'match_report'
  | 'team_analysis';

export type InsightCategory =
  | 'strength'
  | 'weakness'
  | 'trend'
  | 'risk'
  | 'recommendation'
  | 'talent_flag';

export type InsightPriority = 'low' | 'medium' | 'high';

export interface IInsight {
  category: InsightCategory;
  title: string;
  description: string;
  priority: InsightPriority;
}

export interface IDataRange {
  from: Date;
  to: Date;
}

export interface IAIPerformanceReport extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  sportCode: string;
  reportType: AIReportType;
  content: string;
  insights: IInsight[];
  dataRange?: IDataRange;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const insightSchema = new Schema<IInsight>(
  {
    category: {
      type: String,
      enum: ['strength', 'weakness', 'trend', 'risk', 'recommendation', 'talent_flag'],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
  },
  { _id: false },
);

const aiPerformanceReportSchema = new Schema<IAIPerformanceReport>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    sportCode: { type: String, required: true, trim: true },
    reportType: {
      type: String,
      enum: ['player_analysis', 'development_plan', 'scouting_report', 'parent_report', 'match_report', 'team_analysis'],
      required: true,
    },
    content: { type: String, required: true },
    insights: { type: [insightSchema], default: [] },
    dataRange: {
      from: { type: Date },
      to: { type: Date },
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

aiPerformanceReportSchema.index({ schoolId: 1, studentId: 1, sportCode: 1, reportType: 1 });

export const AIPerformanceReport = mongoose.model<IAIPerformanceReport>(
  'AIPerformanceReport',
  aiPerformanceReportSchema,
);

// ─── Talent Flag ─────────────────────────────────────────────────────────────

export type TalentLevel = 'school' | 'district' | 'provincial' | 'national';
export type TalentFlagStatus = 'flagged' | 'confirmed' | 'dismissed';

export interface ITalentFlag extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  sportCode: string;
  level: TalentLevel;
  reasoning: string;
  supportingStats: Record<string, unknown>;
  flaggedAt: Date;
  reviewedBy?: Types.ObjectId;
  status: TalentFlagStatus;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const talentFlagSchema = new Schema<ITalentFlag>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    sportCode: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ['school', 'district', 'provincial', 'national'],
      required: true,
    },
    reasoning: { type: String, required: true },
    supportingStats: { type: Schema.Types.Mixed, default: {} },
    flaggedAt: { type: Date, default: () => new Date() },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['flagged', 'confirmed', 'dismissed'],
      default: 'flagged',
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

talentFlagSchema.index({ schoolId: 1, sportCode: 1, status: 1 });

export const TalentFlag = mongoose.model<ITalentFlag>('TalentFlag', talentFlagSchema);
