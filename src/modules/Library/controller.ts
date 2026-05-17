import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { LibraryService } from './service.js';
import { LibraryFineService } from './fine.service.js';
import { apiResponse } from '../../common/utils.js';
import { UserRole } from '../../common/enums.js';

function scopedSchoolId(req: Request): string | undefined {
  if (req.user?.role === UserRole.SUPER_ADMIN && typeof req.query.schoolId === 'string') {
    return req.query.schoolId;
  }
  return req.user?.schoolId;
}

export class LibraryController {
  // ─── Books ────────────────────────────────────────────────────────────────

  static async createBook(req: Request, res: Response): Promise<void> {
    const book = await LibraryService.createBook(req.body);
    res.status(201).json(apiResponse(true, book, 'Book created successfully'));
  }

  static async listBooks(req: Request, res: Response): Promise<void> {
    const schoolId = scopedSchoolId(req);
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await LibraryService.listBooks(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: req.query.search as string | undefined,
      category: req.query.category as string | undefined,
    });
    res.json(apiResponse(true, result, 'Books retrieved successfully'));
  }

  static async getBook(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const book = await LibraryService.getBookById(req.params.id as string, schoolId);
    res.json(apiResponse(true, book, 'Book retrieved successfully'));
  }

  static async updateBook(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const book = await LibraryService.updateBook(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, book, 'Book updated successfully'));
  }

  static async deleteBook(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await LibraryService.deleteBook(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Book deleted successfully'));
  }

  // ─── Book Loans ───────────────────────────────────────────────────────────

  static async issueBook(req: Request, res: Response): Promise<void> {
    const loan = await LibraryService.issueBook(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, loan, 'Book issued successfully'));
  }

  static async returnBook(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const loan = await LibraryService.returnBook(req.params.id as string, schoolId, req.body.fineAmount);
    res.json(apiResponse(true, loan, 'Book returned successfully'));
  }

  static async markLost(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const fineAmount = req.body.fineAmount ?? 0;
    const loan = await LibraryService.markLost(req.params.id as string, schoolId, fineAmount);
    res.json(apiResponse(true, loan, 'Book marked as lost'));
  }

  static async getOverdueLoans(req: Request, res: Response): Promise<void> {
    const schoolId = scopedSchoolId(req);
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await LibraryService.getOverdueLoans(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Overdue loans retrieved successfully'));
  }

  static async getStudentLoans(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await LibraryService.getStudentLoans(req.params.studentId as string, schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Student loans retrieved successfully'));
  }

  // ─── Reading Challenges ───────────────────────────────────────────────────

  static async createChallenge(req: Request, res: Response): Promise<void> {
    const challenge = await LibraryService.createChallenge(req.body);
    res.status(201).json(apiResponse(true, challenge, 'Reading challenge created successfully'));
  }

  static async listChallenges(req: Request, res: Response): Promise<void> {
    const schoolId = scopedSchoolId(req);
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await LibraryService.listChallenges(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Reading challenges retrieved successfully'));
  }

  static async getChallenge(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const challenge = await LibraryService.getChallengeById(req.params.id as string, schoolId);
    res.json(apiResponse(true, challenge, 'Reading challenge retrieved successfully'));
  }

  static async updateChallenge(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const challenge = await LibraryService.updateChallenge(req.params.id as string, schoolId, req.body);
    res.json(apiResponse(true, challenge, 'Reading challenge updated successfully'));
  }

  static async joinChallenge(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const isAdmin = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.SCHOOL_ADMIN || user.role === UserRole.TEACHER;

    let studentId: string;
    if (isAdmin) {
      // Admins/teachers may join any student
      studentId = req.body.studentId as string;
    } else {
      // Students can only join themselves — resolve studentId from their user record
      const { Student } = await import('../Student/model.js');
      const student = await Student.findOne({
        userId: user.id,
        schoolId,
        isDeleted: false,
      }).lean();
      if (!student) {
        res.status(403).json(apiResponse(false, undefined, undefined, 'Student record not found for this user'));
        return;
      }
      studentId = String(student._id);
    }

    const challenge = await LibraryService.joinChallenge(req.params.id as string, schoolId, studentId);
    res.json(apiResponse(true, challenge, 'Joined reading challenge successfully'));
  }

  static async deleteChallenge(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    await LibraryService.deleteChallenge(req.params.id as string, schoolId);
    res.json(apiResponse(true, undefined, 'Reading challenge deleted successfully'));
  }

  // ─── Reading Logs ─────────────────────────────────────────────────────────

  static async createReadingLog(req: Request, res: Response): Promise<void> {
    const log = await LibraryService.createReadingLog(req.body);
    res.status(201).json(apiResponse(true, log, 'Reading log created successfully'));
  }

  static async getStudentReadingLogs(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const result = await LibraryService.getStudentReadingLogs(req.params.studentId as string, schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Reading logs retrieved successfully'));
  }

  // ─── Leaderboard ──────────────────────────────────────────────────────────

  static async getLeaderboard(req: Request, res: Response): Promise<void> {
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const result = await LibraryService.getLeaderboard(req.params.challengeId as string, limit);
    res.json(apiResponse(true, result, 'Leaderboard retrieved successfully'));
  }

  // ─── Library Fines ───────────────────────────────────────────────────────

  static async calculateFines(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const fines = await LibraryFineService.calculateFines(schoolId);
    res.json(apiResponse(true, fines, 'Overdue fines calculated'));
  }

  static async generateFineInvoices(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const finePerDayCents = req.body.finePerDayCents as number | undefined;
    const result = await LibraryFineService.generateFineInvoices(schoolId, finePerDayCents);
    res.status(201).json(apiResponse(true, result, 'Fine invoices generated'));
  }

  static async getFineConfig(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const config = await LibraryFineService.getFineConfig(schoolId);
    res.json(apiResponse(true, config, 'Fine config retrieved'));
  }

  static async updateFineConfig(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const config = await LibraryFineService.updateFineConfig(schoolId, req.body);
    res.json(apiResponse(true, config, 'Fine config updated'));
  }
}
