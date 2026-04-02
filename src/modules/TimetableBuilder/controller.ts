import type { Request, Response } from 'express';
import { getUser } from '../../types/authenticated-request.js';
import { apiResponse } from '../../common/utils.js';
import { ConfigService } from './services/config.service.js';
import { RequirementsService } from './services/requirements.service.js';
import { TimetableGeneratorService } from './services/generator.service.js';
import { LineOptimizerService } from './services/line-optimizer.service.js';
import { CommitService } from './services/commit.service.js';
import { TimetableGeneration } from './model.js';
import type { DayOfWeek } from './model.js';

export class TimetableBuilderController {
  // ─── Config ───────────────────────────────────────────────────────────────

  static async getConfig(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const config = await ConfigService.getConfig(schoolId);
    res.json(apiResponse(true, config, 'Config retrieved'));
  }

  static async updateConfig(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const config = await ConfigService.updateConfig(schoolId, req.body);
    res.json(apiResponse(true, config, 'Config updated'));
  }

  // ─── Requirements ─────────────────────────────────────────────────────────

  static async listRequirements(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const gradeId = req.query.gradeId ? String(req.query.gradeId) : undefined;
    const requirements = await RequirementsService.listRequirements(schoolId, gradeId);
    res.json(apiResponse(true, requirements, 'Requirements retrieved'));
  }

  static async upsertRequirement(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const requirement = await RequirementsService.upsertRequirement(schoolId, req.body);
    res.status(201).json(apiResponse(true, requirement, 'Requirement saved'));
  }

  static async deleteRequirement(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    await RequirementsService.deleteRequirement(req.params.id as string, schoolId);
    res.json(apiResponse(true, null, 'Requirement deleted'));
  }

  // ─── Availability ─────────────────────────────────────────────────────────

  static async listAvailability(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const availability = await ConfigService.getAvailability(schoolId);
    res.json(apiResponse(true, availability, 'Availability retrieved'));
  }

  static async getTeacherAvailability(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const teacherId = req.params.teacherId as string;
    const records = await ConfigService.getAvailability(schoolId, teacherId);
    const record = records[0] ?? { teacherId, unavailable: [] };
    res.json(apiResponse(true, record, 'Teacher availability retrieved'));
  }

  static async updateAvailability(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const result = await ConfigService.updateAvailability(schoolId, req.params.teacherId as string, req.body);
    res.json(apiResponse(true, result, 'Availability updated'));
  }

  // ─── Subject Lines ────────────────────────────────────────────────────────

  static async listLines(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const gradeId = req.query.gradeId ? String(req.query.gradeId) : undefined;
    const lines = await RequirementsService.listLines(schoolId, gradeId);
    res.json(apiResponse(true, lines, 'Subject lines retrieved'));
  }

  static async upsertLine(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const line = await RequirementsService.upsertLine(schoolId, req.body);
    res.status(201).json(apiResponse(true, line, 'Subject line saved'));
  }

  static async updateLine(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const line = await RequirementsService.upsertLine(schoolId, { ...req.body, id: req.params.id as string });
    res.json(apiResponse(true, line, 'Subject line updated'));
  }

  static async deleteLine(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    await RequirementsService.deleteLine(req.params.id as string, schoolId);
    res.json(apiResponse(true, null, 'Subject line deleted'));
  }

  static async suggestLines(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const suggestions = await LineOptimizerService.suggestLines(schoolId, req.body.gradeId);
    res.json(apiResponse(true, suggestions, 'Line suggestions generated'));
  }

  // ─── Generate ─────────────────────────────────────────────────────────────

  static async generate(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const { gradeId, lockedSlots } = req.body as {
      gradeId?: string;
      lockedSlots: Array<{ classId: string; day: DayOfWeek; period: number; subjectId: string; teacherId: string }>;
    };

    // Create generation record
    const generation = await TimetableGeneration.create({
      schoolId,
      gradeId: gradeId ?? undefined,
      status: 'generating',
      lockedSlots: lockedSlots ?? [],
    });

    try {
      const result = await TimetableGeneratorService.generate(
        schoolId,
        gradeId ?? null,
        lockedSlots ?? [],
      );

      await TimetableGeneration.findOneAndUpdate(
        { _id: generation._id, schoolId },
        {
          $set: {
            status: result.warnings.some((w) => w.type === 'error') ? 'failed' : 'completed',
            result: result.result,
            score: result.score,
            warnings: result.warnings,
            generatedAt: new Date(),
          },
        },
      );

      const updated = await TimetableGeneration.findOne({ _id: generation._id }).lean();
      res.status(201).json(apiResponse(true, updated, 'Timetable generated'));
    } catch (err: unknown) {
      await TimetableGeneration.findOneAndUpdate(
        { _id: generation._id, schoolId },
        { $set: { status: 'failed', warnings: [{ type: 'error', message: String(err) }] } },
      );
      throw err;
    }
  }

  static async getGeneration(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const generation = await TimetableGeneration.findOne({
      _id: req.params.id as string,
      schoolId,
      isDeleted: false,
    }).lean();
    res.json(apiResponse(true, generation, 'Generation retrieved'));
  }

  static async commitGeneration(req: Request, res: Response): Promise<void> {
    const user = getUser(req);
    const schoolId = user.schoolId!;
    const result = await CommitService.commitGeneration(req.params.id as string, schoolId);
    res.json(apiResponse(true, result, 'Timetable committed'));
  }
}
