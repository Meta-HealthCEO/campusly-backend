// File upload handler for assignment submissions. Mirrors the
// TeacherWorkbench upload controller pattern but accepts the wider mime set
// students need: PDF, common image formats, and Office docs.

import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { apiResponse } from '../../common/utils.js';

const UPLOAD_DIR = 'uploads/assignment-submissions';
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB — assignment artefacts can be larger than headshots.
const ALLOWED_EXTS = new Set([
  '.pdf',
  '.jpg', '.jpeg', '.png', '.webp', '.gif',
  '.doc', '.docx',
  '.odt', '.rtf',
  '.txt', '.md',
  '.ppt', '.pptx',
  '.xls', '.xlsx',
]);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuid()}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, ALLOWED_EXTS.has(ext));
};

const uploader = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('file');

export function postUploadSubmissionFile(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  uploader(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json(apiResponse(false, null, err.message));
      return;
    }
    if (err) {
      next(err);
      return;
    }
    if (!req.file) {
      res.status(400).json(apiResponse(
        false,
        null,
        'No file uploaded or file type not allowed.',
      ));
      return;
    }
    const url = `/uploads/assignment-submissions/${req.file.filename}`;
    res.status(201).json(apiResponse(true, {
      url,
      filename: req.file.originalname,
      sizeBytes: req.file.size,
      mimeType: req.file.mimetype,
    }, 'File uploaded'));
  });
}
