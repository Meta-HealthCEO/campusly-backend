import path from 'path';
import fs from 'fs';
import multer, { type Options } from 'multer';
import type { PaperMarkingImage } from './model-marking.js';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILES_PER_REQUEST = 80; // bulk class can have many; single is gated to 8 in service layer

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function sanitiseExt(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
}

/**
 * Multer config for marking image uploads.
 *
 * For a single-marking upload, files land at:
 *   uploads/markings/<markingId>/page-<n>.<ext>
 *
 * For a batch upload, files land at:
 *   uploads/markings-batch/<batchId>/page-<n>.<ext>
 *
 * The destination + filename are resolved in the request handler using a
 * factory below; Multer is created per-request to inject the destination.
 */
export function createMarkingUpload(destDir: string): multer.Multer {
  ensureDir(destDir);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, destDir),
    filename: (_req, file, cb) => {
      // Filename collisions are handled at the caller; we use index-based names like page-1.jpg.
      // Multer needs a unique-ish name here; the caller will rename later.
      const safeExt = sanitiseExt(file.originalname);
      const stamp = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      cb(null, `incoming-${stamp}${safeExt}`);
    },
  });

  const fileFilter: Options['fileFilter'] = (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error(`Unsupported image type: ${file.mimetype}`));
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_BYTES, files: MAX_FILES_PER_REQUEST },
  });
}

/**
 * After Multer writes incoming-*.jpg, rename to page-N.<ext> per index.
 * Returns the final image record list ready for PaperMarking.images[].
 */
export function finaliseImages(
  files: Express.Multer.File[],
  destDir: string,
): PaperMarkingImage[] {
  ensureDir(destDir);
  return files.map((file, idx): PaperMarkingImage => {
    const pageNumber = idx + 1;
    const ext = sanitiseExt(file.originalname);
    const finalName = `page-${pageNumber}${ext}`;
    const finalPath = path.join(destDir, finalName);
    fs.renameSync(file.path, finalPath);
    return {
      filename: finalName,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      pageNumber,
    };
  });
}

/** Marking storage root: `<repo>/uploads/markings`. */
export function markingDir(markingId: string): string {
  return path.join(process.cwd(), 'uploads', 'markings', markingId);
}

export function batchDir(batchId: string): string {
  return path.join(process.cwd(), 'uploads', 'markings-batch', batchId);
}
