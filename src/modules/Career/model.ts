import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Enums ────────────────────────────────────────────────────────────────────

export type UniversityType = 'traditional' | 'comprehensive' | 'university_of_technology' | 'tvet' | 'private';
export type QualificationType = 'bachelor' | 'diploma' | 'higher_certificate' | 'postgrad_diploma';
export type PromotionStatus = 'promoted' | 'condoned' | 'retained';
export type SubjectLevel = 'core' | 'home_language' | 'first_additional_language' | 'second_additional_language';
export type ApplicationStatus = 'draft' | 'submitted' | 'acknowledged' | 'accepted' | 'waitlisted' | 'rejected';
export type AppDocumentType = 'id_copy' | 'transcript' | 'proof_of_payment' | 'motivation_letter' | 'other';

// ─── Student Portfolio ────────────────────────────────────────────────────────

export interface ITermResult {
  term: number;
  percentage: number;
  assessmentCount: number;
}

export interface ISubjectRecord {
  subjectId: Types.ObjectId;
  name: string;
  level: SubjectLevel;
  code: string;
  terms: ITermResult[];
  finalPercentage: number;
  apsPoints: number;
}

export interface IAcademicYear {
  year: number;
  grade: string;
  subjects: ISubjectRecord[];
  totalAPS: number;
  promoted: boolean;
  promotionStatus: PromotionStatus;
}

export interface IExtracurricular {
  year: number;
  activity: string;
  role: string;
  description: string;
  verifiedBy?: Types.ObjectId;
}

export interface ICommunityService {
  year: number;
  organization: string;
  hours: number;
  description: string;
  verifiedBy?: Types.ObjectId;
}

export interface IStudentPortfolio extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  academicHistory: IAcademicYear[];
  extracurriculars: IExtracurricular[];
  communityService: ICommunityService[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const termResultSchema = new Schema<ITermResult>(
  {
    term: { type: Number, required: true },
    percentage: { type: Number, required: true },
    assessmentCount: { type: Number, required: true },
  },
  { _id: false },
);

const subjectRecordSchema = new Schema<ISubjectRecord>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    name: { type: String, required: true },
    level: {
      type: String,
      enum: ['core', 'home_language', 'first_additional_language', 'second_additional_language'],
      required: true,
    },
    code: { type: String, required: true },
    terms: [termResultSchema],
    finalPercentage: { type: Number, required: true },
    apsPoints: { type: Number, required: true },
  },
  { _id: false },
);

const academicYearSchema = new Schema<IAcademicYear>(
  {
    year: { type: Number, required: true },
    grade: { type: String, required: true },
    subjects: [subjectRecordSchema],
    totalAPS: { type: Number, required: true },
    promoted: { type: Boolean, required: true },
    promotionStatus: {
      type: String,
      enum: ['promoted', 'condoned', 'retained'],
      required: true,
    },
  },
  { _id: false },
);

const extracurricularSchema = new Schema<IExtracurricular>(
  {
    year: { type: Number, required: true },
    activity: { type: String, required: true },
    role: { type: String, required: true },
    description: { type: String, required: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

const communityServiceSchema = new Schema<ICommunityService>(
  {
    year: { type: Number, required: true },
    organization: { type: String, required: true },
    hours: { type: Number, required: true },
    description: { type: String, required: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false },
);

const studentPortfolioSchema = new Schema<IStudentPortfolio>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    academicHistory: [academicYearSchema],
    extracurriculars: [extracurricularSchema],
    communityService: [communityServiceSchema],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

studentPortfolioSchema.index({ studentId: 1 }, { unique: true });
studentPortfolioSchema.index({ schoolId: 1 });

export const StudentPortfolio = mongoose.model<IStudentPortfolio>('StudentPortfolio', studentPortfolioSchema);

// ─── University (Global) ─────────────────────────────────────────────────────

export interface ICampus {
  name: string;
  address: string;
}

export interface IUniversity extends Document {
  name: string;
  shortName: string;
  type: UniversityType;
  province: string;
  city: string;
  logo?: string;
  website?: string;
  applicationPortalUrl?: string;
  applicationOpenDate?: Date;
  applicationCloseDate?: Date;
  applicationFee: number;
  generalRequirements?: string;
  contactEmail?: string;
  contactPhone?: string;
  campuses: ICampus[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const campusSchema = new Schema<ICampus>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
  },
  { _id: false },
);

const universitySchema = new Schema<IUniversity>(
  {
    name: { type: String, required: true, trim: true },
    shortName: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['traditional', 'comprehensive', 'university_of_technology', 'tvet', 'private'],
      required: true,
    },
    province: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    logo: { type: String },
    website: { type: String },
    applicationPortalUrl: { type: String },
    applicationOpenDate: { type: Date },
    applicationCloseDate: { type: Date },
    applicationFee: { type: Number, default: 0 },
    generalRequirements: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },
    campuses: [campusSchema],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

universitySchema.index({ shortName: 1 }, { unique: true });
universitySchema.index({ type: 1, province: 1 });

export const University = mongoose.model<IUniversity>('University', universitySchema);

// ─── Programme ────────────────────────────────────────────────────────────────

export interface ISubjectRequirement {
  subjectName: string;
  minimumPercentage: number;
  isCompulsory: boolean;
}

export interface INbtRequirement {
  al: boolean;
  ql: boolean;
  mat: boolean;
}

export interface INbtMinimumScores {
  al: number;
  ql: number;
  mat: number;
}

export interface IProgramme extends Document {
  universityId: Types.ObjectId;
  faculty: string;
  department?: string;
  name: string;
  qualificationType: QualificationType;
  duration: string;
  minimumAPS: number;
  subjectRequirements: ISubjectRequirement[];
  nbtRequired: INbtRequirement;
  nbtMinimumScores: INbtMinimumScores;
  careerOutcomes: string[];
  annualTuition?: number;
  linkedBursaries: string[];
  applicationDeadline?: Date;
  additionalNotes?: string;
  dataVerifiedDate?: Date;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subjectRequirementSchema = new Schema<ISubjectRequirement>(
  {
    subjectName: { type: String, required: true },
    minimumPercentage: { type: Number, required: true },
    isCompulsory: { type: Boolean, required: true },
  },
  { _id: false },
);

const programmeSchema = new Schema<IProgramme>(
  {
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    faculty: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    name: { type: String, required: true, trim: true },
    qualificationType: {
      type: String,
      enum: ['bachelor', 'diploma', 'higher_certificate', 'postgrad_diploma'],
      required: true,
    },
    duration: { type: String, required: true },
    minimumAPS: { type: Number, required: true, min: 0, max: 42 },
    subjectRequirements: [subjectRequirementSchema],
    nbtRequired: {
      al: { type: Boolean, default: false },
      ql: { type: Boolean, default: false },
      mat: { type: Boolean, default: false },
    },
    nbtMinimumScores: {
      al: { type: Number, default: 0 },
      ql: { type: Number, default: 0 },
      mat: { type: Number, default: 0 },
    },
    careerOutcomes: [{ type: String }],
    annualTuition: { type: Number },
    linkedBursaries: [{ type: String }],
    applicationDeadline: { type: Date },
    additionalNotes: { type: String },
    dataVerifiedDate: { type: Date },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

programmeSchema.index({ universityId: 1 });
programmeSchema.index({ minimumAPS: 1 });
programmeSchema.index({ faculty: 1 });

export const Programme = mongoose.model<IProgramme>('Programme', programmeSchema);

// ─── Application ──────────────────────────────────────────────────────────────

export interface IAppDocument {
  name: string;
  type: AppDocumentType;
  url: string;
  uploadedAt: Date;
}

export interface IApplicationFee {
  amount: number;
  paid: boolean;
}

export interface IApplication extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  programmeId: Types.ObjectId;
  universityId: Types.ObjectId;
  status: ApplicationStatus;
  submittedAt?: Date;
  applicationReference?: string;
  documents: IAppDocument[];
  applicationFee?: IApplicationFee;
  notes?: string;
  responseDate?: Date;
  responseDetails?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appDocumentSchema = new Schema<IAppDocument>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['id_copy', 'transcript', 'proof_of_payment', 'motivation_letter', 'other'],
      required: true,
    },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new Schema<IApplication>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    programmeId: { type: Schema.Types.ObjectId, ref: 'Programme', required: true },
    universityId: { type: Schema.Types.ObjectId, ref: 'University', required: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'acknowledged', 'accepted', 'waitlisted', 'rejected'],
      default: 'draft',
    },
    submittedAt: { type: Date },
    applicationReference: { type: String },
    documents: [appDocumentSchema],
    applicationFee: {
      amount: { type: Number },
      paid: { type: Boolean, default: false },
    },
    notes: { type: String },
    responseDate: { type: Date },
    responseDetails: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

applicationSchema.index({ studentId: 1, programmeId: 1 }, { unique: true });
applicationSchema.index({ studentId: 1, status: 1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);

// ─── Aptitude Result ──────────────────────────────────────────────────────────

export interface IAptitudeAnswer {
  questionId: string;
  value: number;
}

export interface IClusterResult {
  name: string;
  score: number;
  rank: number;
  description: string;
}

export interface IAptitudeResult extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  answers: IAptitudeAnswer[];
  clusters: IClusterResult[];
  personalityType?: string;
  suggestedCareers: string[];
  completedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const aptitudeAnswerSchema = new Schema<IAptitudeAnswer>(
  {
    questionId: { type: String, required: true },
    value: { type: Number, required: true },
  },
  { _id: false },
);

const clusterResultSchema = new Schema<IClusterResult>(
  {
    name: { type: String, required: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { _id: false },
);

const aptitudeResultSchema = new Schema<IAptitudeResult>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    answers: [aptitudeAnswerSchema],
    clusters: [clusterResultSchema],
    personalityType: { type: String },
    suggestedCareers: [{ type: String }],
    completedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

aptitudeResultSchema.index({ studentId: 1 }, { unique: true });

export const AptitudeResult = mongoose.model<IAptitudeResult>('AptitudeResult', aptitudeResultSchema);

// ─── Bursary (Global) ────────────────────────────────────────────────────────

export interface IBursary extends Document {
  name: string;
  provider: string;
  description?: string;
  eligibilityCriteria?: string;
  minimumAPS?: number;
  fieldOfStudy: string[];
  coverageDetails?: string;
  applicationOpenDate?: Date;
  applicationCloseDate?: Date;
  applicationUrl?: string;
  linkedUniversities: Types.ObjectId[];
  annualValue?: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bursarySchema = new Schema<IBursary>(
  {
    name: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    description: { type: String },
    eligibilityCriteria: { type: String },
    minimumAPS: { type: Number },
    fieldOfStudy: [{ type: String, default: 'any' }],
    coverageDetails: { type: String },
    applicationOpenDate: { type: Date },
    applicationCloseDate: { type: Date },
    applicationUrl: { type: String },
    linkedUniversities: [{ type: Schema.Types.ObjectId, ref: 'University' }],
    annualValue: { type: Number },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bursarySchema.index({ provider: 1 });
bursarySchema.index({ minimumAPS: 1 });
bursarySchema.index({ applicationCloseDate: 1 });

export const Bursary = mongoose.model<IBursary>('Bursary', bursarySchema);
