import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── After Care Registration ────────────────────────────────────────────────

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export interface IAfterCareRegistration extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  term: number;
  academicYear: number;
  daysPerWeek: WeekDay[];
  monthlyFee: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const afterCareRegistrationSchema = new Schema<IAfterCareRegistration>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    term: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: Number,
      required: true,
    },
    daysPerWeek: {
      type: [String],
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      default: [],
    },
    monthlyFee: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

afterCareRegistrationSchema.index({ schoolId: 1, studentId: 1, term: 1, academicYear: 1 });
afterCareRegistrationSchema.index({ schoolId: 1, isActive: 1 });

export const AfterCareRegistration = mongoose.model<IAfterCareRegistration>(
  'AfterCareRegistration',
  afterCareRegistrationSchema,
);

// ─── After Care Attendance ──────────────────────────────────────────────────

export interface IAfterCareAttendance extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  date: Date;
  checkInTime: string;
  checkOutTime?: string;
  checkedInBy: Types.ObjectId;
  checkedOutBy?: Types.ObjectId;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const afterCareAttendanceSchema = new Schema<IAfterCareAttendance>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkInTime: {
      type: String,
      required: true,
    },
    checkOutTime: {
      type: String,
    },
    checkedInBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    checkedOutBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    notes: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

afterCareAttendanceSchema.index({ schoolId: 1, date: 1 });
afterCareAttendanceSchema.index({ studentId: 1, date: 1 });

export const AfterCareAttendance = mongoose.model<IAfterCareAttendance>(
  'AfterCareAttendance',
  afterCareAttendanceSchema,
);

// ─── Pickup Authorization ──────────────────────────────────────────────────

export interface IPickupAuthorization extends Document {
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  authorizedPersonName: string;
  idNumber: string;
  relationship: string;
  phoneNumber: string;
  photoUrl?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pickupAuthorizationSchema = new Schema<IPickupAuthorization>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    authorizedPersonName: {
      type: String,
      required: true,
      trim: true,
    },
    idNumber: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    photoUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

pickupAuthorizationSchema.index({ schoolId: 1, studentId: 1 });

export const PickupAuthorization = mongoose.model<IPickupAuthorization>(
  'PickupAuthorization',
  pickupAuthorizationSchema,
);

// ─── Sign Out Log ──────────────────────────────────────────────────────────

export interface ISignOutLog extends Document {
  attendanceId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  pickedUpBy: string;
  pickedUpAt: Date;
  isAuthorized: boolean;
  authorizationId?: Types.ObjectId;
  notes?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const signOutLogSchema = new Schema<ISignOutLog>(
  {
    attendanceId: {
      type: Schema.Types.ObjectId,
      ref: 'AfterCareAttendance',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    pickedUpBy: {
      type: String,
      required: true,
      trim: true,
    },
    pickedUpAt: {
      type: Date,
      required: true,
    },
    isAuthorized: {
      type: Boolean,
      required: true,
    },
    authorizationId: {
      type: Schema.Types.ObjectId,
      ref: 'PickupAuthorization',
    },
    notes: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

signOutLogSchema.index({ studentId: 1, pickedUpAt: -1 });

export const SignOutLog = mongoose.model<ISignOutLog>(
  'SignOutLog',
  signOutLogSchema,
);

// ─── After Care Activity ───────────────────────────────────────────────────

export type AfterCareActivityType = 'homework_help' | 'sport' | 'free_play' | 'arts_crafts' | 'reading' | 'other';

export interface IAfterCareActivity extends Document {
  schoolId: Types.ObjectId;
  date: Date;
  activityType: AfterCareActivityType;
  name: string;
  description?: string;
  supervisorId: Types.ObjectId;
  studentIds: Types.ObjectId[];
  capacity: number;
  startTime: string;
  endTime: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const afterCareActivitySchema = new Schema<IAfterCareActivity>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    activityType: {
      type: String,
      enum: ['homework_help', 'sport', 'free_play', 'arts_crafts', 'reading', 'other'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    supervisorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Student',
      default: [],
    },
    capacity: {
      type: Number,
      default: 0,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

afterCareActivitySchema.index({ schoolId: 1, date: -1 });

export const AfterCareActivity = mongoose.model<IAfterCareActivity>(
  'AfterCareActivity',
  afterCareActivitySchema,
);

// ─── After Care Invoice ────────────────────────────────────────────────────

export type AfterCareInvoiceStatus = 'pending' | 'invoiced' | 'paid';

export interface IAfterCareInvoice extends Document {
  schoolId: Types.ObjectId;
  registrationId: Types.ObjectId;
  studentId: Types.ObjectId;
  month: number;
  year: number;
  amount: number;
  status: AfterCareInvoiceStatus;
  feeInvoiceId?: Types.ObjectId;
  generatedAt: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const afterCareInvoiceSchema = new Schema<IAfterCareInvoice>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: 'AfterCareRegistration',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'invoiced', 'paid'],
      default: 'pending',
    },
    feeInvoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
    },
    generatedAt: {
      type: Date,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

afterCareInvoiceSchema.index({ schoolId: 1, month: 1, year: 1 });

export const AfterCareInvoice = mongoose.model<IAfterCareInvoice>(
  'AfterCareInvoice',
  afterCareInvoiceSchema,
);
