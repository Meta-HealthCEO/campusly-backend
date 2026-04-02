import type { Request } from 'express';
import { Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { CareerModuleService } from './service.js';
import { Student } from '../Student/model.js';
import type { ApplicationStatus } from './model.js';

// ─── CSV helper ───────────────────────────────────────────────────────────────
function parseCSV(file: Express.Multer.File): Record<string, string>[] {
  const content = file.buffer.toString('utf-8');
  const lines = content.split('\n').filter((l: string) => l.trim());
  const headers = lines[0].split(',').map((h: string) => h.trim());
  return lines.slice(1).map((line: string) => {
    const values = line.split(',').map((v: string) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h: string, i: number) => { row[h] = values[i] ?? ''; });
    return row;
  });
}

// ─── Student resolver ─────────────────────────────────────────────────────────
async function resolveStudentId(userId: string): Promise<string> {
  const student = await Student.findOne({ userId, isDeleted: false }).lean();
  if (!student) throw new Error('Student record not found for current user');
  return String(student._id);
}

export class CareerController {
  // ═══════════════════════════════════════════════════════════════════════════
  // Portfolio (5)
  // ═══════════════════════════════════════════════════════════════════════════

  static async getPortfolio(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.getPortfolio(studentId);
    res.json(apiResponse(true, result));
  }

  static async createSnapshot(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId as string;
    const studentId = req.params.studentId as string;
    const { year, grade, subjects, promoted, promotionStatus } = req.body;
    const result = await CareerModuleService.createSnapshot(
      studentId,
      schoolId,
      year,
      grade,
      subjects,
      promoted,
      promotionStatus,
    );
    res.status(201).json(apiResponse(true, result, 'Snapshot created successfully'));
  }

  static async addExtracurricular(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const studentId = req.params.studentId as string;
    const schoolId = user.schoolId as string;
    const result = await CareerModuleService.addExtracurricular(studentId, schoolId, req.body);
    res.status(201).json(apiResponse(true, result, 'Extracurricular added successfully'));
  }

  static async addCommunityService(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const studentId = req.params.studentId as string;
    const schoolId = user.schoolId as string;
    const result = await CareerModuleService.addCommunityService(studentId, schoolId, req.body);
    res.status(201).json(apiResponse(true, result, 'Community service added successfully'));
  }

  static async getTranscript(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.generateTranscript(studentId);
    res.setHeader('Content-Type', 'application/json');
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // APS (2)
  // ═══════════════════════════════════════════════════════════════════════════

  static async getAPS(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.getAPS(studentId);
    res.json(apiResponse(true, result));
  }

  static async simulateAPS(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.simulateAPS(studentId, req.body.adjustments);
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Universities (4)
  // ═══════════════════════════════════════════════════════════════════════════

  static async listUniversities(req: Request, res: Response): Promise<void> {
    const result = await CareerModuleService.listUniversities({
      type: req.query.type as string | undefined,
      province: req.query.province as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getUniversity(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await CareerModuleService.getUniversityById(id);
    res.json(apiResponse(true, result));
  }

  static async createUniversity(req: Request, res: Response): Promise<void> {
    const result = await CareerModuleService.createUniversity(req.body);
    res.status(201).json(apiResponse(true, result, 'University created successfully'));
  }

  static async updateUniversity(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await CareerModuleService.updateUniversity(id, req.body);
    res.json(apiResponse(true, result, 'University updated successfully'));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Programmes (5)
  // ═══════════════════════════════════════════════════════════════════════════

  static async listProgrammes(req: Request, res: Response): Promise<void> {
    const result = await CareerModuleService.listProgrammes({
      universityId: req.query.universityId as string | undefined,
      faculty: req.query.faculty as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getProgramme(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await CareerModuleService.getProgrammeById(id);
    res.json(apiResponse(true, result));
  }

  static async createProgramme(req: Request, res: Response): Promise<void> {
    const result = await CareerModuleService.createProgramme(req.body);
    res.status(201).json(apiResponse(true, result, 'Programme created successfully'));
  }

  static async updateProgramme(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await CareerModuleService.updateProgramme(id, req.body);
    res.json(apiResponse(true, result, 'Programme updated successfully'));
  }

  static async importProgrammes(req: Request, res: Response): Promise<void> {
    const multerReq = req as Request & { file?: Express.Multer.File };
    if (!multerReq.file) {
      res.status(400).json(apiResponse(false, undefined, 'CSV file is required'));
      return;
    }
    const rows = parseCSV(multerReq.file);
    const result = await CareerModuleService.importProgrammes(rows);
    res.status(201).json(apiResponse(true, result, `${rows.length} programmes imported`));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Matcher (1)
  // ═══════════════════════════════════════════════════════════════════════════

  static async matchProgrammes(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.matchProgrammes(studentId, {
      universityId: req.query.universityId as string | undefined,
      field: req.query.field as string | undefined,
    });
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Applications (6)
  // ═══════════════════════════════════════════════════════════════════════════

  static async createApplication(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const studentId = await resolveStudentId(user.id);
    const schoolId = user.schoolId as string;
    const result = await CareerModuleService.createApplication(studentId, schoolId, {
      programmeId: req.body.programmeId,
      notes: req.body.notes,
    });
    res.status(201).json(apiResponse(true, result, 'Application created successfully'));
  }

  static async listApplications(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.listApplications(studentId, {
      status: req.query.status as ApplicationStatus | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async updateApplication(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await CareerModuleService.updateApplication(id, req.body);
    res.json(apiResponse(true, result, 'Application updated successfully'));
  }

  static async addDocument(req: Request, res: Response): Promise<void> {
    const multerReq = req as Request & { file?: Express.Multer.File };
    if (!multerReq.file) {
      res.status(400).json(apiResponse(false, undefined, 'Document file is required'));
      return;
    }
    const id = req.params.id as string;
    const result = await CareerModuleService.addApplicationDocument(id, {
      name: req.body.name as string,
      type: req.body.type as 'id_copy' | 'transcript' | 'proof_of_payment' | 'motivation_letter' | 'other',
      url: multerReq.file.originalname,
    });
    res.status(201).json(apiResponse(true, result, 'Document added successfully'));
  }

  static async getApplicationPrefill(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await CareerModuleService.getApplicationPrefill(id);
    res.json(apiResponse(true, result));
  }

  static async getDeadlines(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.getDeadlines(studentId);
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Aptitude (3)
  // ═══════════════════════════════════════════════════════════════════════════

  static async getAptitudeQuestions(_req: Request, res: Response): Promise<void> {
    const result = await CareerModuleService.getAptitudeQuestions();
    res.json(apiResponse(true, result));
  }

  static async submitAptitude(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const studentId = await resolveStudentId(user.id);
    const schoolId = user.schoolId as string;
    const result = await CareerModuleService.submitAptitude(studentId, schoolId, req.body.answers);
    res.status(201).json(apiResponse(true, result, 'Aptitude test submitted successfully'));
  }

  static async getAptitudeResults(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.getAptitudeResults(studentId);
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Career Explorer (1)
  // ═══════════════════════════════════════════════════════════════════════════

  static async listCareers(req: Request, res: Response): Promise<void> {
    const result = await CareerModuleService.listCareers({
      cluster: req.query.cluster as string | undefined,
      search: req.query.search as string | undefined,
    });
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Subject Advisor (1)
  // ═══════════════════════════════════════════════════════════════════════════

  static async getSubjectAdvice(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.getSubjectAdvice(studentId);
    res.json(apiResponse(true, result));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Bursaries (6)
  // ═══════════════════════════════════════════════════════════════════════════

  static async listBursaries(req: Request, res: Response): Promise<void> {
    const result = await CareerModuleService.listBursaries({
      field: req.query.field as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    });
    res.json(apiResponse(true, result));
  }

  static async getBursary(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await CareerModuleService.getBursaryById(id);
    res.json(apiResponse(true, result));
  }

  static async matchBursaries(req: Request, res: Response): Promise<void> {
    const studentId = req.params.studentId as string;
    const result = await CareerModuleService.matchBursaries(studentId);
    res.json(apiResponse(true, result));
  }

  static async createBursary(req: Request, res: Response): Promise<void> {
    const result = await CareerModuleService.createBursary(req.body);
    res.status(201).json(apiResponse(true, result, 'Bursary created successfully'));
  }

  static async updateBursary(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    const result = await CareerModuleService.updateBursary(id, req.body);
    res.json(apiResponse(true, result, 'Bursary updated successfully'));
  }

  static async importBursaries(req: Request, res: Response): Promise<void> {
    const multerReq = req as Request & { file?: Express.Multer.File };
    if (!multerReq.file) {
      res.status(400).json(apiResponse(false, undefined, 'CSV file is required'));
      return;
    }
    const rows = parseCSV(multerReq.file);
    const result = await CareerModuleService.importBursaries(rows);
    res.status(201).json(apiResponse(true, result, `${rows.length} bursaries imported`));
  }
}
