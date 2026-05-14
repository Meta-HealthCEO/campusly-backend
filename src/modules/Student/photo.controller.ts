import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { Student } from './model.js';
import { apiResponse } from '../../common/utils.js';
import { ForbiddenError } from '../../common/errors.js';

const UPLOAD_DIR = 'uploads/student-photos';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);

// Ensure upload directory exists
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
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
  if (ALLOWED_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single('photo');

async function assertTeacherCanAccessStudent(req: Request, studentId: string): Promise<void> {
  if (req.user?.role !== 'teacher') return;
  const schoolId = req.user.schoolId;
  if (!schoolId) throw new ForbiddenError('School context is required');
  const student = await Student.findOne({ _id: studentId, schoolId, isDeleted: false })
    .select('classId')
    .lean();
  if (!student) return;
  const { AcademicService } = await import('../Academic/service.js');
  const canAccess = await AcademicService.teacherCanAccessClass(req.user.id, String(student.classId), schoolId);
  if (!canAccess) throw new ForbiddenError('You can only manage learners in your own teaching groups');
}

export class PhotoController {
  static uploadPhoto(req: Request, res: Response, next: NextFunction): void {
    uploadMiddleware(req, res, async (err: unknown) => {
      try {
        if (err instanceof multer.MulterError) {
          res.status(400).json(apiResponse(false, undefined, undefined, err.message));
          return;
        }
        if (err) {
          next(err);
          return;
        }
        if (!req.file) {
          res.status(400).json(
            apiResponse(false, undefined, undefined, 'No file uploaded or file type not allowed. Use jpeg, png, gif, or webp.'),
          );
          return;
        }

        const schoolId = req.user!.schoolId!;
        const studentId = req.params.id;
        const photoUrl = `/${UPLOAD_DIR}/${req.file.filename}`;
        await assertTeacherCanAccessStudent(req, studentId as string);

        const student = await Student.findOneAndUpdate(
          { _id: studentId, schoolId, isDeleted: false },
          { $set: { photoUrl } },
          { new: true },
        )
          .populate('userId', 'firstName lastName email')
          .populate('gradeId')
          .populate('classId');

        if (!student) {
          // Clean up uploaded file if student not found
          fs.unlinkSync(req.file.path);
          res.status(404).json(apiResponse(false, undefined, undefined, 'Student not found'));
          return;
        }

        res.json(apiResponse(true, student, 'Photo uploaded successfully'));
      } catch (uploadErr: unknown) {
        next(uploadErr);
      }
    });
  }

  static async getPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const schoolId = req.user!.schoolId!;
      const student = await Student.findOne(
        { _id: req.params.id, schoolId, isDeleted: false },
        { photoUrl: 1 },
      ).lean();

      if (!student) {
        res.status(404).json(apiResponse(false, undefined, undefined, 'Student not found'));
        return;
      }

      if (!student.photoUrl) {
        res.status(404).json(apiResponse(false, undefined, undefined, 'No photo uploaded'));
        return;
      }

      res.json(apiResponse(true, { photoUrl: student.photoUrl }, 'Photo URL retrieved'));
    } catch (err: unknown) {
      next(err);
    }
  }
}
