import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { BulkImportService } from './bulk-import.service.js';
import { apiResponse } from '../../common/utils.js';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
}).single('file');

function handleUpload(req: Request, res: Response): Promise<void> {
  return new Promise((resolve, reject) => {
    upload(req, res, (err: unknown) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json(apiResponse(false, undefined, undefined, err.message));
        resolve();
        return;
      }
      if (err) {
        reject(err);
        return;
      }
      if (!req.file) {
        res.status(400).json(
          apiResponse(false, undefined, undefined, 'No CSV file uploaded. Please upload a .csv file.'),
        );
        resolve();
        return;
      }
      resolve();
    });
  });
}

export class BulkImportController {
  static async downloadTemplate(_req: Request, res: Response): Promise<void> {
    const csv = BulkImportService.getCSVTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=student-import-template.csv');
    res.send(csv);
  }

  static async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await handleUpload(req, res);
      if (res.headersSent) return;

      const schoolId = req.user!.schoolId!;
      const rows = BulkImportService.parseCSV(req.file!.buffer);

      if (rows.length === 0) {
        res.status(400).json(apiResponse(false, undefined, undefined, 'CSV file is empty or has no data rows'));
        return;
      }

      const result = await BulkImportService.validateRows(rows, schoolId);
      res.json(apiResponse(true, result, 'Validation complete'));
    } catch (err: unknown) {
      next(err);
    }
  }

  static async importStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await handleUpload(req, res);
      if (res.headersSent) return;

      const schoolId = req.user!.schoolId!;
      const userId = req.user!.id;
      const rows = BulkImportService.parseCSV(req.file!.buffer);

      if (rows.length === 0) {
        res.status(400).json(apiResponse(false, undefined, undefined, 'CSV file is empty or has no data rows'));
        return;
      }

      const validation = await BulkImportService.validateRows(rows, schoolId);

      if (validation.valid.length === 0) {
        res.status(400).json(
          apiResponse(false, { errors: validation.errors }, undefined, 'No valid rows to import'),
        );
        return;
      }

      const result = await BulkImportService.importStudents(schoolId, validation.valid, userId);
      res.json(
        apiResponse(true, {
          ...result,
          validationErrors: validation.errors,
          totalRows: validation.totalRows,
        }, 'Import complete'),
      );
    } catch (err: unknown) {
      next(err);
    }
  }
}
