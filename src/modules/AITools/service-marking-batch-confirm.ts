import path from 'path';
import fs from 'fs';
import { MarkingBatch } from './model-marking-batch.js';
import { logger } from '../../common/logger.js';
import { BadRequestError, NotFoundError } from '../../common/errors.js';
import { batchDir } from './service-marking-images.js';
import { markPaperFromImages } from './service-marking.js';

function normaliseMime(filename: string): string {
  const ext = path.extname(filename).slice(1).toLowerCase();
  if (ext === 'jpg' || ext === 'jpeg' || ext === '') return 'image/jpeg';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return `image/${ext}`;
}

interface ConfirmAssignment {
  imageFilenames: string[];
  studentId: string;        // resolved student
  studentName: string;      // captured for marking record
}

export async function confirmBatch(
  batchId: string,
  schoolId: string,
  teacherId: string,
  assignments: ConfirmAssignment[],
): Promise<{ spawned: number; failed: number }> {
  const batch = await MarkingBatch.findOne({ _id: batchId, schoolId, isDeleted: false });
  if (!batch) throw new NotFoundError('Batch not found');
  if (batch.status !== 'reviewing') {
    throw new BadRequestError(`Batch in unexpected state: ${batch.status}`);
  }

  batch.status = 'marking';
  await batch.save();

  const dir = batchDir(batchId);

  // Concurrency gate
  const limit = 3;
  let active = 0;
  let spawned = 0;
  let failed = 0;
  const queue: ConfirmAssignment[] = [...assignments];

  await new Promise<void>((resolve) => {
    const runOne = async (a: ConfirmAssignment): Promise<void> => {
      // Build a synthetic Multer.File[] by copying batch files into a temp area for finaliseImages.
      // markPaperFromImages calls finaliseImages which renames source files via fs.renameSync —
      // since multiple markings share files in the batch dir, we must copy first.
      const stagedPaths: string[] = [];
      const stagedFiles = a.imageFilenames.map((fname): Express.Multer.File => {
        const srcPath = path.join(dir, fname);
        const stagedPath = path.join(dir, `staged-${a.studentId}-${path.basename(fname)}`);
        fs.copyFileSync(srcPath, stagedPath);
        stagedPaths.push(stagedPath);
        const stat = fs.statSync(stagedPath);
        return {
          fieldname: 'files',
          originalname: fname,
          encoding: '7bit',
          mimetype: normaliseMime(fname),
          size: stat.size,
          destination: dir,
          filename: path.basename(stagedPath),
          path: stagedPath,
          buffer: Buffer.alloc(0),
          stream: undefined as never,
        } as unknown as Express.Multer.File;
      });

      try {
        await markPaperFromImages(teacherId, schoolId, {
          paperId: String(batch.paperId),
          paperType: batch.paperType,
          studentName: a.studentName,
          studentId: a.studentId,
          classId: String(batch.classId),
          files: stagedFiles,
        });
      } finally {
        // Clean up staged copies. On success, finaliseImages already renamed them
        // out of this directory so unlink will ENOENT — that's fine.
        for (const p of stagedPaths) {
          try { fs.unlinkSync(p); } catch { /* ENOENT expected on success path */ }
        }
      }
    };

    const next = (): void => {
      if (queue.length === 0 && active === 0) { resolve(); return; }
      while (active < limit && queue.length > 0) {
        const a = queue.shift();
        if (!a) break;
        active += 1;
        runOne(a)
          .then(() => { spawned += 1; })
          .catch((err: unknown) => {
            failed += 1;
            logger.error({ err, batchId, studentId: a.studentId }, 'Marking spawn failed');
          })
          .finally(() => { active -= 1; next(); });
      }
    };

    next();
  });

  batch.status = 'complete';
  await batch.save();
  return { spawned, failed };
}
