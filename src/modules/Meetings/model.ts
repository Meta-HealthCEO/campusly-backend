import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Meeting Day ──────────────────────────────────────────────────────────────

export interface IMeetingDay extends Document {
  schoolId: Types.ObjectId;
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
  slotDuration: number;
  location: string;
  virtualMeetingEnabled: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const meetingDaySchema = new Schema<IMeetingDay>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    slotDuration: {
      type: Number,
      required: true,
      default: 15,
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    virtualMeetingEnabled: {
      type: Boolean,
      default: false,
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

meetingDaySchema.index({ schoolId: 1, date: 1 });

export const MeetingDay = mongoose.model<IMeetingDay>('MeetingDay', meetingDaySchema);

// ─── Meeting Slot ─────────────────────────────────────────────────────────────

export interface IBookedBy {
  parentId: Types.ObjectId;
  parentName: string;
  studentId: Types.ObjectId;
  studentName: string;
}

export interface IMeetingSlot extends Document {
  schoolId: Types.ObjectId;
  meetingDayId: Types.ObjectId;
  teacherId: Types.ObjectId;
  teacherName: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'available' | 'booked' | 'completed' | 'cancelled';
  bookedBy?: IBookedBy;
  notes?: string;
  meetingType: 'in_person' | 'virtual';
  meetingLink?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const meetingSlotSchema = new Schema<IMeetingSlot>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    meetingDayId: {
      type: Schema.Types.ObjectId,
      ref: 'MeetingDay',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'booked', 'completed', 'cancelled'],
      default: 'available',
    },
    bookedBy: {
      type: {
        parentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        parentName: { type: String, required: true },
        studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
        studentName: { type: String, required: true },
      },
      _id: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    meetingType: {
      type: String,
      enum: ['in_person', 'virtual'],
      default: 'in_person',
    },
    meetingLink: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

meetingSlotSchema.index({ schoolId: 1, meetingDayId: 1, teacherId: 1 });
meetingSlotSchema.index({ schoolId: 1, teacherId: 1, date: 1 });
meetingSlotSchema.index({ 'bookedBy.parentId': 1 });

export const MeetingSlot = mongoose.model<IMeetingSlot>('MeetingSlot', meetingSlotSchema);
