import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { LibraryService } from './service.js';
import { apiResponse } from '../../common/utils.js';

export class LibraryController {
  // ─── Books ────────────────────────────────────────────────────────────────

  static async createBook(req: Request, res: Response): Promise<void> {
    const book = await LibraryService.createBook(req.body);
    res.status(201).json(apiResponse(true, book, 'Book created successfully'));
  }

  static async listBooks(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
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
    const book = await LibraryService.getBookById(req.params.id as string);
    res.json(apiResponse(true, book, 'Book retrieved successfully'));
  }

  static async updateBook(req: Request, res: Response): Promise<void> {
    const book = await LibraryService.updateBook(req.params.id as string, req.body);
    res.json(apiResponse(true, book, 'Book updated successfully'));
  }

  static async deleteBook(req: Request, res: Response): Promise<void> {
    await LibraryService.deleteBook(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Book deleted successfully'));
  }

  // ─── Book Loans ───────────────────────────────────────────────────────────

  static async issueBook(req: Request, res: Response): Promise<void> {
    const loan = await LibraryService.issueBook(req.body, getUser(req).id);
    res.status(201).json(apiResponse(true, loan, 'Book issued successfully'));
  }

  static async returnBook(req: Request, res: Response): Promise<void> {
    const loan = await LibraryService.returnBook(req.params.id as string, req.body.fineAmount);
    res.json(apiResponse(true, loan, 'Book returned successfully'));
  }

  static async markLost(req: Request, res: Response): Promise<void> {
    const fineAmount = req.body.fineAmount ?? 0;
    const loan = await LibraryService.markLost(req.params.id as string, fineAmount);
    res.json(apiResponse(true, loan, 'Book marked as lost'));
  }

  static async getOverdueLoans(req: Request, res: Response): Promise<void> {
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await LibraryService.getOverdueLoans(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Overdue loans retrieved successfully'));
  }

  static async getStudentLoans(req: Request, res: Response): Promise<void> {
    const result = await LibraryService.getStudentLoans(req.params.studentId as string, {
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
    const schoolId = (req.query.schoolId as string) ?? req.user?.schoolId;
    if (!schoolId) { res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required')); return; }
    const result = await LibraryService.listChallenges(schoolId, {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result, 'Reading challenges retrieved successfully'));
  }

  static async getChallenge(req: Request, res: Response): Promise<void> {
    const challenge = await LibraryService.getChallengeById(req.params.id as string);
    res.json(apiResponse(true, challenge, 'Reading challenge retrieved successfully'));
  }

  static async updateChallenge(req: Request, res: Response): Promise<void> {
    const challenge = await LibraryService.updateChallenge(req.params.id as string, req.body);
    res.json(apiResponse(true, challenge, 'Reading challenge updated successfully'));
  }

  static async joinChallenge(req: Request, res: Response): Promise<void> {
    const { studentId } = req.body;
    const challenge = await LibraryService.joinChallenge(req.params.id as string, studentId);
    res.json(apiResponse(true, challenge, 'Joined reading challenge successfully'));
  }

  static async deleteChallenge(req: Request, res: Response): Promise<void> {
    await LibraryService.deleteChallenge(req.params.id as string);
    res.json(apiResponse(true, undefined, 'Reading challenge deleted successfully'));
  }

  // ─── Reading Logs ─────────────────────────────────────────────────────────

  static async createReadingLog(req: Request, res: Response): Promise<void> {
    const log = await LibraryService.createReadingLog(req.body);
    res.status(201).json(apiResponse(true, log, 'Reading log created successfully'));
  }

  static async getStudentReadingLogs(req: Request, res: Response): Promise<void> {
    const result = await LibraryService.getStudentReadingLogs(req.params.studentId as string, {
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
}
