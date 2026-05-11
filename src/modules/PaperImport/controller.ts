import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { getUser } from '../../types/authenticated-request.js';
import { PaperImportJob, type SourceMimeType } from './model.js';
import { PaperImportJobsService } from './service-jobs.js';
import { CreatePaperImportSchema } from './validation.js';
import {
  finaliseUpload,
  sourcePath as sourcePathFor,
  jobDir,
  pagePath,
  MAX_PAGES,
} from './service-storage.js';
import { enqueuePaperImportJob } from '../../jobs/paper-import.job.js';
import { BadRequestError, ForbiddenError } from '../../common/errors.js';

export class PaperImportController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const schoolId = user.schoolId ?? '';
      if (!req.file) throw new BadRequestError('Source file is required');
      const parsed = CreatePaperImportSchema.safeParse({
        ...req.body,
        term: Number(req.body.term),
        generateAnswers: req.body.generateAnswers === 'true',
        addHints: req.body.addHints === 'true',
        addWorkedExample: req.body.addWorkedExample === 'true',
        addExplanations: req.body.addExplanations === 'true',
      });
      if (!parsed.success) throw new BadRequestError(parsed.error.message);

      const running = await PaperImportJobsService.countRunningForTeacher(schoolId, user.id);
      if (running >= 2) {
        res.status(429).json({ message: 'You already have 2 jobs in progress' });
        return;
      }

      const job = await PaperImportJob.create({
        schoolId,
        teacherId: user.id,
        status: 'pending',
        curriculum: {
          subjectId: parsed.data.subjectId,
          gradeId: parsed.data.gradeId,
          term: parsed.data.term,
          curriculumNodeId: parsed.data.curriculumNodeId,
        },
        options: {
          generateAnswers: parsed.data.generateAnswers,
          addHints: parsed.data.addHints,
          addWorkedExample: parsed.data.addWorkedExample,
          addExplanations: parsed.data.addExplanations,
          instructions: parsed.data.instructions,
        },
        source: {
          filename: req.file.originalname,
          mimeType: req.file.mimetype as SourceMimeType,
          sizeBytes: req.file.size,
          pageCount: 0,
          storagePath: '',
        },
      });

      const final = finaliseUpload(req.file.path, String(job._id), req.file.mimetype);
      job.source.storagePath = final;
      await job.save();

      await enqueuePaperImportJob({
        jobId: String(job._id),
        teacherId: user.id,
        schoolId,
      });

      res.status(201).json({ jobId: String(job._id) });
    } catch (err) { next(err); }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const schoolId = user.schoolId ?? '';
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const offset = req.query.offset ? Number(req.query.offset) : undefined;
      const result = await PaperImportJobsService.list(schoolId, user.id, {
        status: status as never,
        limit,
        offset,
      });
      res.json({ data: result.items, total: result.total });
    } catch (err) { next(err); }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const schoolId = user.schoolId ?? '';
      const job = await PaperImportJobsService.get(
        String(req.params.jobId), schoolId, user.id,
      );
      res.json({ data: job });
    } catch (err) { next(err); }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const schoolId = user.schoolId ?? '';
      const job = await PaperImportJobsService.cancel(
        String(req.params.jobId), schoolId, user.id,
      );
      res.json({ data: job });
    } catch (err) { next(err); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const schoolId = user.schoolId ?? '';
      await PaperImportJobsService.softDelete(
        String(req.params.jobId), schoolId, user.id,
      );
      res.json({ ok: true });
    } catch (err) { next(err); }
  }

  static async streamSource(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const schoolId = user.schoolId ?? '';
      const job = await PaperImportJobsService.get(
        String(req.params.jobId), schoolId, user.id,
      );
      const file = sourcePathFor(String(job._id), job.source.mimeType);
      if (!fs.existsSync(file)) throw new ForbiddenError('Source file no longer exists');
      res.setHeader('Content-Type', job.source.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${job.source.filename}"`);
      fs.createReadStream(file).pipe(res);
    } catch (err) { next(err); }
  }

  static async streamCrop(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const schoolId = user.schoolId ?? '';
      await PaperImportJobsService.get(String(req.params.jobId), schoolId, user.id);
      const safeName = path.basename(String(req.params.filename));
      const file = path.join(jobDir(String(req.params.jobId)), 'crops', safeName);
      if (!fs.existsSync(file)) throw new ForbiddenError('Crop not found');
      res.setHeader('Content-Type', 'image/png');
      fs.createReadStream(file).pipe(res);
    } catch (err) { next(err); }
  }

  static async streamPage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = getUser(req);
      const schoolId = user.schoolId ?? '';
      await PaperImportJobsService.get(String(req.params.jobId), schoolId, user.id);
      const page = Number(req.params.page);
      if (!Number.isFinite(page) || page < 1 || page > MAX_PAGES) {
        throw new ForbiddenError('Invalid page');
      }
      const file = pagePath(String(req.params.jobId), page);
      if (!fs.existsSync(file)) throw new ForbiddenError('Page not found');
      res.setHeader('Content-Type', 'image/png');
      fs.createReadStream(file).pipe(res);
    } catch (err) { next(err); }
  }
}
