// ============================================================
// Upload path safety
// ============================================================
//
// Two related problems this guards:
//
// 1. `/uploads` is served with express.static. Marking images hold scans of
//    student work and must stay auth-gated. The old guard tested
//    `req.path.startsWith('/markings/')` on the RAW path, so
//    `/uploads/foo/../markings/x.jpg` sailed past it and express.static then
//    normalised the path and served the file.
//
// 2. Batch marking confirm built `path.join(dir, fname)` from an unvalidated
//    client string, so `../../../.env` copied an arbitrary server file into a
//    marking the teacher could then download.

import path from 'node:path';

const PROTECTED_UPLOAD_DIRS = ['markings', 'markings-batch'];

/** Decode percent-escapes as far as they nest, without throwing on bad input. */
function decodeDeep(value: string): string {
  let current = value;
  for (let i = 0; i < 3; i++) {
    let next: string;
    try {
      next = decodeURIComponent(current);
    } catch {
      return current;
    }
    if (next === current) return current;
    current = next;
  }
  return current;
}

/**
 * True when a request under /uploads resolves into an auth-gated directory.
 * Decodes, normalises separators, and resolves `..` before comparing.
 */
export function isProtectedUploadPath(requestPath: string): boolean {
  const decoded = decodeDeep(requestPath).replace(/\\/g, '/');
  // posix.normalize collapses `.`/`..` and duplicate slashes.
  const normalised = path.posix.normalize(decoded).toLowerCase();
  const firstSegment = normalised.split('/').filter(Boolean)[0];
  return firstSegment !== undefined && PROTECTED_UPLOAD_DIRS.includes(firstSegment);
}

/**
 * Validate a client-supplied upload filename. Returns the filename when it is
 * a plain basename, or null when it contains any traversal or separator.
 */
export function safeUploadFilename(filename: string): string | null {
  if (typeof filename !== 'string') return null;
  const decoded = decodeDeep(filename);
  if (!decoded.trim()) return null;
  // Control characters (incl. NUL) can truncate paths in native calls.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f]/.test(decoded)) return null;
  if (decoded.includes('/') || decoded.includes('\\')) return null;
  if (decoded === '.' || decoded === '..') return null;
  // Rejects `C:` style drive-relative names.
  if (path.win32.isAbsolute(decoded) || path.posix.isAbsolute(decoded)) return null;
  if (path.basename(decoded) !== decoded) return null;
  return decoded;
}
