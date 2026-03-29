import mongoose, { Schema, Document, Types } from 'mongoose';

// ─── Book ───────────────────────────────────────────────────────────────────

export interface IBook extends Document {
  schoolId: Types.ObjectId;
  title: string;
  author: string;
  isbn?: string;
  category: string;
  copies: number;
  availableCopies: number;
  shelfLocation?: string;
  coverImageUrl?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    isbn: { type: String, trim: true },
    category: { type: String, required: true, trim: true },
    copies: { type: Number, required: true, min: 0 },
    availableCopies: { type: Number, required: true, min: 0 },
    shelfLocation: { type: String, trim: true },
    coverImageUrl: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bookSchema.index({ schoolId: 1, title: 1 });
bookSchema.index({ schoolId: 1, isbn: 1 });
bookSchema.index({ schoolId: 1, category: 1 });

export const Book = mongoose.model<IBook>('Book', bookSchema);

// ─── Book Loan ──────────────────────────────────────────────────────────────

export type BookLoanStatus = 'issued' | 'returned' | 'overdue' | 'lost';

export interface IBookLoan extends Document {
  bookId: Types.ObjectId;
  studentId: Types.ObjectId;
  schoolId: Types.ObjectId;
  issuedBy: Types.ObjectId;
  issuedDate: Date;
  dueDate: Date;
  returnedDate?: Date;
  status: BookLoanStatus;
  fineAmount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookLoanSchema = new Schema<IBookLoan>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    issuedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    issuedDate: { type: Date, required: true, default: () => new Date() },
    dueDate: { type: Date, required: true },
    returnedDate: { type: Date },
    status: {
      type: String,
      enum: ['issued', 'returned', 'overdue', 'lost'],
      default: 'issued',
    },
    fineAmount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

bookLoanSchema.index({ bookId: 1, studentId: 1, status: 1 });
bookLoanSchema.index({ schoolId: 1, status: 1 });
bookLoanSchema.index({ studentId: 1, status: 1 });
bookLoanSchema.index({ dueDate: 1, status: 1 });

export const BookLoan = mongoose.model<IBookLoan>('BookLoan', bookLoanSchema);

// ─── Reading Challenge ──────────────────────────────────────────────��───────

export interface IReadingChallenge extends Document {
  schoolId: Types.ObjectId;
  name: string;
  targetBooks: number;
  startDate: Date;
  endDate: Date;
  rewardPoints: number;
  participants: Types.ObjectId[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const readingChallengeSchema = new Schema<IReadingChallenge>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true, trim: true },
    targetBooks: { type: Number, required: true, min: 1 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rewardPoints: { type: Number, default: 0 },
    participants: { type: [Schema.Types.ObjectId], ref: 'Student', default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

readingChallengeSchema.index({ schoolId: 1, endDate: -1 });

export const ReadingChallenge = mongoose.model<IReadingChallenge>('ReadingChallenge', readingChallengeSchema);

// ─── Reading Log ────────────────────────────────────────────────────────────

export interface IReadingLog extends Document {
  studentId: Types.ObjectId;
  challengeId?: Types.ObjectId;
  bookId: Types.ObjectId;
  pagesRead: number;
  completedDate?: Date;
  rating?: number;
  review?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const readingLogSchema = new Schema<IReadingLog>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'ReadingChallenge' },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    pagesRead: { type: Number, default: 0 },
    completedDate: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, trim: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

readingLogSchema.index({ studentId: 1, bookId: 1 });
readingLogSchema.index({ challengeId: 1, studentId: 1 });

export const ReadingLog = mongoose.model<IReadingLog>('ReadingLog', readingLogSchema);
