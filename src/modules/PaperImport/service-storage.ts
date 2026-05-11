import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { pdf } from 'pdf-to-img';
import sharp from 'sharp';

export const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25 MB
export const MAX_PAGES = 30;
export const RENDER_DPI = Number(process.env.PAPER_IMPORT_RENDER_DPI ?? 150);

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]);

function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function sanitiseExt(mimeType: string): string {
  if (mimeType === 'application/pdf') return '.pdf';
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  return '.bin';
}

export function importsRoot(): string {
  return path.join(process.cwd(), 'uploads', 'paper-imports');
}

export function jobDir(jobId: string): string {
  return path.join(importsRoot(), jobId);
}

export function sourcePath(jobId: string, mimeType: string): string {
  return path.join(jobDir(jobId), `source${sanitiseExt(mimeType)}`);
}

export function pagePath(jobId: string, pageNumber: number): string {
  const padded = String(pageNumber).padStart(3, '0');
  return path.join(jobDir(jobId), `page-${padded}.png`);
}

export function cropPath(jobId: string, blockId: string): string {
  return path.join(jobDir(jobId), 'crops', `${blockId}.png`);
}

export function createUpload(): multer.Multer {
  ensureDir(importsRoot());
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      const tmp = path.join(importsRoot(), '_incoming');
      ensureDir(tmp);
      cb(null, tmp);
    },
    filename: (_req, file, cb) => {
      const stamp = Date.now() + '-' + Math.random().toString(36).slice(2, 8);
      cb(null, `incoming-${stamp}${sanitiseExt(file.mimetype)}`);
    },
  });
  return multer({
    storage,
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
      else cb(new Error(`Unsupported file type: ${file.mimetype}`));
    },
    limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  });
}

export function finaliseUpload(
  tmpPath: string,
  jobId: string,
  mimeType: string,
): string {
  const dir = jobDir(jobId);
  ensureDir(dir);
  const finalPath = sourcePath(jobId, mimeType);
  fs.renameSync(tmpPath, finalPath);
  return finalPath;
}

export async function renderPdfPages(jobId: string, pdfPath: string): Promise<number> {
  const dir = jobDir(jobId);
  ensureDir(dir);
  const scale = RENDER_DPI / 72;
  const document = await pdf(pdfPath, { scale });
  let count = 0;
  for await (const pageBuffer of document) {
    count += 1;
    fs.writeFileSync(pagePath(jobId, count), pageBuffer);
  }
  return count;
}

export async function cropPageRegion(
  jobId: string,
  page: number,
  blockId: string,
  box: { x: number; y: number; w: number; h: number },
): Promise<string> {
  const cropDir = path.join(jobDir(jobId), 'crops');
  ensureDir(cropDir);
  const src = pagePath(jobId, page);
  const meta = await sharp(src).metadata();
  const W = meta.width ?? 0;
  const H = meta.height ?? 0;
  const left = Math.max(0, Math.floor(box.x * W));
  const top = Math.max(0, Math.floor(box.y * H));
  const width = Math.max(1, Math.floor(box.w * W));
  const height = Math.max(1, Math.floor(box.h * H));
  const dest = cropPath(jobId, blockId);
  await sharp(src).extract({ left, top, width, height }).png().toFile(dest);
  return dest;
}

export function fileToBase64(filePath: string): string {
  return fs.readFileSync(filePath).toString('base64');
}

export function purgeJobFiles(jobId: string): void {
  const dir = jobDir(jobId);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}
