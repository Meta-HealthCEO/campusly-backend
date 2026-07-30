import { describe, it, expect } from 'vitest';
import { isProtectedUploadPath, safeUploadFilename } from '../upload-paths.js';

describe('isProtectedUploadPath', () => {
  it('blocks the marking directories', () => {
    expect(isProtectedUploadPath('/markings/abc.jpg')).toBe(true);
    expect(isProtectedUploadPath('/markings-batch/abc.jpg')).toBe(true);
  });

  it('blocks traversal that normalises into a marking directory', () => {
    // The old guard used a raw startsWith, so these slipped past it and
    // express.static then normalised the path and served the file.
    expect(isProtectedUploadPath('/foo/../markings/abc.jpg')).toBe(true);
    expect(isProtectedUploadPath('/a/b/../../markings-batch/x.png')).toBe(true);
  });

  it('blocks double-slash variants', () => {
    expect(isProtectedUploadPath('//markings/abc.jpg')).toBe(true);
  });

  it('blocks percent-encoded traversal', () => {
    expect(isProtectedUploadPath('/%2e%2e/markings/abc.jpg')).toBe(true);
    expect(isProtectedUploadPath('/foo/%2E%2E/markings/a.jpg')).toBe(true);
  });

  it('blocks backslash separators (Windows hosts)', () => {
    expect(isProtectedUploadPath('\\markings\\abc.jpg')).toBe(true);
    expect(isProtectedUploadPath('/foo\\..\\markings\\abc.jpg')).toBe(true);
  });

  it('blocks case variants on case-insensitive filesystems', () => {
    expect(isProtectedUploadPath('/Markings/abc.jpg')).toBe(true);
    expect(isProtectedUploadPath('/MARKINGS-BATCH/abc.jpg')).toBe(true);
  });

  it('allows ordinary public uploads', () => {
    expect(isProtectedUploadPath('/logos/school.png')).toBe(false);
    expect(isProtectedUploadPath('/assignments/essay.pdf')).toBe(false);
  });

  it('does not over-block names that merely start with the same letters', () => {
    expect(isProtectedUploadPath('/markings-public-notes/x.png')).toBe(false);
    expect(isProtectedUploadPath('/markingsomething.png')).toBe(false);
  });
});

describe('safeUploadFilename', () => {
  it('accepts an ordinary filename', () => {
    expect(safeUploadFilename('page-1.jpg')).toBe('page-1.jpg');
  });

  it('accepts a filename containing spaces (phone photos routinely do)', () => {
    expect(safeUploadFilename('IMG 0042 page 1.jpg')).toBe('IMG 0042 page 1.jpg');
  });

  it('rejects POSIX traversal', () => {
    expect(safeUploadFilename('../../../etc/passwd')).toBeNull();
    expect(safeUploadFilename('..')).toBeNull();
  });

  it('rejects Windows traversal and absolute paths', () => {
    expect(safeUploadFilename('..\\..\\.env')).toBeNull();
    expect(safeUploadFilename('C:\\Windows\\win.ini')).toBeNull();
    expect(safeUploadFilename('/etc/passwd')).toBeNull();
  });

  it('rejects any embedded separator', () => {
    expect(safeUploadFilename('sub/dir/file.jpg')).toBeNull();
    expect(safeUploadFilename('sub\\file.jpg')).toBeNull();
  });

  it('rejects percent-encoded separators', () => {
    expect(safeUploadFilename('%2e%2e%2fsecret')).toBeNull();
    expect(safeUploadFilename('a%2Fb.jpg')).toBeNull();
  });

  it('rejects NUL bytes and empty input', () => {
    expect(safeUploadFilename('a\u0000.jpg')).toBeNull();
    expect(safeUploadFilename('')).toBeNull();
    expect(safeUploadFilename('   ')).toBeNull();
  });
});
