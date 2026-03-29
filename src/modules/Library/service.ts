import mongoose from 'mongoose';
import {
  Book, IBook,
  BookLoan, IBookLoan,
  ReadingChallenge, IReadingChallenge,
  ReadingLog, IReadingLog,
} from './model.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { PAGINATION_DEFAULTS } from '../../common/constants.js';

interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

function getPagination(query: ListQuery) {
  const page = Math.max(query.page ?? PAGINATION_DEFAULTS.page, 1);
  const limit = Math.min(Math.max(query.limit ?? PAGINATION_DEFAULTS.limit, 1), PAGINATION_DEFAULTS.maxLimit);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export class LibraryService {
  // ─── Book CRUD ────────────────────────────────────────────────────────────

  static async createBook(data: Partial<IBook>): Promise<IBook> {
    const book = new Book(data);
    return book.save();
  }

  static async listBooks(schoolId: string, query: ListQuery & { category?: string }) {
    const { page, limit, skip } = getPagination(query);
    const filter: Record<string, unknown> = { schoolId, isDeleted: false };
    if (query.category) filter.category = query.category;
    if (query.search) {
      filter.$or = [
        { title: new RegExp(query.search, 'i') },
        { author: new RegExp(query.search, 'i') },
        { isbn: new RegExp(query.search, 'i') },
      ];
    }

    const [data, total] = await Promise.all([
      Book.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
      Book.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getBookById(id: string): Promise<IBook> {
    const book = await Book.findOne({ _id: id, isDeleted: false });
    if (!book) throw new NotFoundError('Book not found');
    return book;
  }

  static async updateBook(id: string, data: Partial<IBook>): Promise<IBook> {
    const book = await Book.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!book) throw new NotFoundError('Book not found');
    return book;
  }

  static async deleteBook(id: string): Promise<IBook> {
    const book = await Book.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!book) throw new NotFoundError('Book not found');
    return book;
  }

  // ─── Book Loan Operations ─────────────────────────────────────────────────

  static async issueBook(data: { bookId: string; studentId: string; schoolId: string; dueDate: string }, issuedBy: string): Promise<IBookLoan> {
    const book = await Book.findOne({ _id: data.bookId, isDeleted: false });
    if (!book) throw new NotFoundError('Book not found');
    if (book.availableCopies <= 0) throw new BadRequestError('No copies available');

    book.availableCopies -= 1;
    await book.save();

    const loan = new BookLoan({
      bookId: data.bookId,
      studentId: data.studentId,
      schoolId: data.schoolId,
      issuedBy,
      issuedDate: new Date(),
      dueDate: new Date(data.dueDate),
      status: 'issued',
    });
    return loan.save();
  }

  static async returnBook(loanId: string, fineAmount?: number): Promise<IBookLoan> {
    const loan = await BookLoan.findOne({ _id: loanId, status: { $in: ['issued', 'overdue'] }, isDeleted: false });
    if (!loan) throw new NotFoundError('Active loan not found');

    loan.returnedDate = new Date();
    loan.status = 'returned';
    if (fineAmount !== undefined) loan.fineAmount = fineAmount;
    await loan.save();

    // Increment available copies
    await Book.updateOne({ _id: loan.bookId }, { $inc: { availableCopies: 1 } });

    return loan;
  }

  static async markLost(loanId: string, fineAmount: number): Promise<IBookLoan> {
    const loan = await BookLoan.findOne({ _id: loanId, status: { $in: ['issued', 'overdue'] }, isDeleted: false });
    if (!loan) throw new NotFoundError('Active loan not found');

    loan.status = 'lost';
    loan.fineAmount = fineAmount;
    await loan.save();

    // Reduce total copies
    await Book.updateOne({ _id: loan.bookId }, { $inc: { copies: -1 } });

    return loan;
  }

  static async getOverdueLoans(schoolId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const now = new Date();
    const filter = {
      schoolId: new mongoose.Types.ObjectId(schoolId),
      status: 'issued',
      dueDate: { $lt: now },
      isDeleted: false,
    };

    const [data, total] = await Promise.all([
      BookLoan.find(filter)
        .populate('bookId', 'title author')
        .populate('studentId')
        .populate('issuedBy', 'firstName lastName email')
        .sort('dueDate')
        .skip(skip)
        .limit(limit)
        .lean(),
      BookLoan.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getStudentLoans(studentId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter = { studentId, isDeleted: false };

    const [data, total] = await Promise.all([
      BookLoan.find(filter)
        .populate('bookId', 'title author coverImageUrl')
        .sort('-issuedDate')
        .skip(skip)
        .limit(limit)
        .lean(),
      BookLoan.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Reading Challenge CRUD ───────────────────────────────────────────────

  static async createChallenge(data: Partial<IReadingChallenge>): Promise<IReadingChallenge> {
    const challenge = new ReadingChallenge(data);
    return challenge.save();
  }

  static async listChallenges(schoolId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter = { schoolId, isDeleted: false };

    const [data, total] = await Promise.all([
      ReadingChallenge.find(filter).sort('-startDate').skip(skip).limit(limit).lean(),
      ReadingChallenge.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getChallengeById(id: string): Promise<IReadingChallenge> {
    const challenge = await ReadingChallenge.findOne({ _id: id, isDeleted: false });
    if (!challenge) throw new NotFoundError('Reading challenge not found');
    return challenge;
  }

  static async updateChallenge(id: string, data: Partial<IReadingChallenge>): Promise<IReadingChallenge> {
    const challenge = await ReadingChallenge.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: data },
      { new: true, runValidators: true },
    );
    if (!challenge) throw new NotFoundError('Reading challenge not found');
    return challenge;
  }

  static async joinChallenge(challengeId: string, studentId: string): Promise<IReadingChallenge> {
    const challenge = await ReadingChallenge.findOneAndUpdate(
      { _id: challengeId, isDeleted: false },
      { $addToSet: { participants: studentId } },
      { new: true },
    );
    if (!challenge) throw new NotFoundError('Reading challenge not found');
    return challenge;
  }

  static async deleteChallenge(id: string): Promise<IReadingChallenge> {
    const challenge = await ReadingChallenge.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!challenge) throw new NotFoundError('Reading challenge not found');
    return challenge;
  }

  // ─── Reading Log ──────────────────────────────────────────────────────────

  static async createReadingLog(data: Partial<IReadingLog>): Promise<IReadingLog> {
    const log = new ReadingLog(data);
    return log.save();
  }

  static async getStudentReadingLogs(studentId: string, query: ListQuery) {
    const { page, limit, skip } = getPagination(query);
    const filter = { studentId, isDeleted: false };

    const [data, total] = await Promise.all([
      ReadingLog.find(filter)
        .populate('bookId', 'title author')
        .populate('challengeId', 'name')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      ReadingLog.countDocuments(filter),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ─── Leaderboard ──────────────────────────────────────────────────────────

  static async getLeaderboard(challengeId: string, limit = 20) {
    const results = await ReadingLog.aggregate([
      {
        $match: {
          challengeId: new mongoose.Types.ObjectId(challengeId),
          completedDate: { $ne: null },
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: '$studentId',
          booksCompleted: { $sum: 1 },
          totalPages: { $sum: '$pagesRead' },
        },
      },
      { $sort: { booksCompleted: -1, totalPages: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'student.userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          studentId: '$_id',
          firstName: '$user.firstName',
          lastName: '$user.lastName',
          booksCompleted: 1,
          totalPages: 1,
        },
      },
    ]);

    return results;
  }

  // ─── Overdue Check (for BullMQ job) ───────────────────────────────────────

  static async markOverdueLoans(): Promise<number> {
    const now = new Date();
    const result = await BookLoan.updateMany(
      { status: 'issued', dueDate: { $lt: now }, isDeleted: false },
      { $set: { status: 'overdue' } },
    );
    return result.modifiedCount;
  }
}
