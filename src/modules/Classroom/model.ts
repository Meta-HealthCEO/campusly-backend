import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── VirtualSession ──────────────────────────────────────────────────────────

export type SessionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled';

export interface ISessionSettings {
  studentVideoEnabled: boolean;
  studentAudioEnabled: boolean;
  chatEnabled: boolean;
  maxParticipants: number;
  allowLateJoin: boolean;
}

export interface IPollResponse {
  userId: Types.ObjectId;
  answer: number;
  answeredAt: Date;
}

export interface IPoll {
  _id: Types.ObjectId;
  question: string;
  options: string[];
  responses: IPollResponse[];
}

export interface ISharedFile {
  name: string;
  url: string;
  uploadedBy: Types.ObjectId;
  uploadedAt: Date;
}

export interface IVirtualSession extends Document {
  schoolId: Types.ObjectId;
  title: string;
  description?: string;
  subjectId: Types.ObjectId;
  classId: Types.ObjectId;
  gradeId?: Types.ObjectId;
  teacherId: Types.ObjectId;
  scheduledStart: Date;
  scheduledEnd: Date;
  status: SessionStatus;
  isRecorded: boolean;
  roomId?: string;
  recordingUrl?: string;
  egressId?: string;
  isRecording: boolean;
  lessonNoteId?: Types.ObjectId;
  settings: ISessionSettings;
  recurringRule?: string;
  timetablePeriodId?: Types.ObjectId;
  polls: IPoll[];
  sharedFiles: ISharedFile[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pollResponseSchema = new Schema<IPollResponse>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answer: { type: Number, required: true },
    answeredAt: { type: Date, required: true },
  },
  { _id: false },
);

const pollSchema = new Schema<IPoll>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  responses: { type: [pollResponseSchema], default: [] },
});

const sharedFileSchema = new Schema<ISharedFile>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, required: true },
  },
  { _id: false },
);

const sessionSettingsSchema = new Schema<ISessionSettings>(
  {
    studentVideoEnabled: { type: Boolean, default: false },
    studentAudioEnabled: { type: Boolean, default: false },
    chatEnabled: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: 50 },
    allowLateJoin: { type: Boolean, default: true },
  },
  { _id: false },
);

const virtualSessionSchema = new Schema<IVirtualSession>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    isRecorded: { type: Boolean, default: true },
    roomId: { type: String },
    recordingUrl: { type: String },
    egressId: { type: String },
    isRecording: { type: Boolean, default: false },
    lessonNoteId: { type: Schema.Types.ObjectId, ref: 'LessonNote' },
    settings: { type: sessionSettingsSchema, default: () => ({}) },
    recurringRule: { type: String },
    timetablePeriodId: { type: Schema.Types.ObjectId },
    polls: { type: [pollSchema], default: [] },
    sharedFiles: { type: [sharedFileSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

virtualSessionSchema.index({ schoolId: 1, status: 1, scheduledStart: 1 });
virtualSessionSchema.index({ teacherId: 1, scheduledStart: 1 });
virtualSessionSchema.index({ classId: 1, scheduledStart: 1 });

export const VirtualSession = mongoose.model<IVirtualSession>('VirtualSession', virtualSessionSchema);

// ─── SessionAttendance ───────────────────────────────────────────────────────

export interface ISessionAttendance extends Document {
  sessionId: Types.ObjectId;
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  joinedAt: Date;
  leftAt?: Date;
  duration?: number;
  rejoinCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sessionAttendanceSchema = new Schema<ISessionAttendance>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'VirtualSession', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, required: true },
    leftAt: { type: Date },
    duration: { type: Number },
    rejoinCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sessionAttendanceSchema.index({ sessionId: 1, studentId: 1 }, { unique: true });
sessionAttendanceSchema.index({ schoolId: 1, studentId: 1 });

export const SessionAttendance = mongoose.model<ISessionAttendance>(
  'SessionAttendance',
  sessionAttendanceSchema,
);

// ─── VideoLesson ─────────────────────────────────────────────────────────────

export type VideoType = 'upload' | 'youtube' | 'vimeo' | 'recording';

export interface IVideoLesson extends Document {
  schoolId: Types.ObjectId;
  title: string;
  description?: string;
  subjectId?: Types.ObjectId;
  gradeId?: Types.ObjectId;
  classId?: Types.ObjectId;
  teacherId: Types.ObjectId;
  videoUrl: string;
  videoType: VideoType;
  thumbnailUrl?: string;
  durationSeconds?: number;
  isPublished: boolean;
  viewCount: number;
  tags: string[];
  sessionId?: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const videoLessonSchema = new Schema<IVideoLesson>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true },
    description: { type: String },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    gradeId: { type: Schema.Types.ObjectId, ref: 'Grade' },
    classId: { type: Schema.Types.ObjectId, ref: 'Class' },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    videoUrl: { type: String, required: true },
    videoType: {
      type: String,
      enum: ['upload', 'youtube', 'vimeo', 'recording'],
      required: true,
    },
    thumbnailUrl: { type: String },
    durationSeconds: { type: Number },
    isPublished: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    sessionId: { type: Schema.Types.ObjectId, ref: 'VirtualSession' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

videoLessonSchema.index({ schoolId: 1, subjectId: 1 });
videoLessonSchema.index({ schoolId: 1, teacherId: 1 });
videoLessonSchema.index({ schoolId: 1, isPublished: 1 });

export const VideoLesson = mongoose.model<IVideoLesson>('VideoLesson', videoLessonSchema);

// ─── VideoProgress ────────────────────────────────────────────────────────────

export interface IVideoProgress extends Document {
  videoId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  watchedSeconds: number;
  totalSeconds: number;
  progressPercent: number;
  isCompleted: boolean;
  lastWatchedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const videoProgressSchema = new Schema<IVideoProgress>(
  {
    videoId: { type: Schema.Types.ObjectId, ref: 'VideoLesson', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    watchedSeconds: { type: Number, default: 0 },
    totalSeconds: { type: Number, required: true },
    progressPercent: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    lastWatchedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

videoProgressSchema.index({ videoId: 1, studentId: 1 }, { unique: true });
videoProgressSchema.index({ schoolId: 1, studentId: 1 });

export const VideoProgress = mongoose.model<IVideoProgress>('VideoProgress', videoProgressSchema);
