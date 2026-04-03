/**
 * Batch parser for all ATP PDFs in a directory.
 *
 * Reads file names to detect subject and grade, then runs the parser on each.
 *
 * Usage:
 *   npx tsx scripts/parse-all-atps.ts <pdf-directory> [--output-dir <dir>]
 *
 * Example:
 *   npx tsx scripts/parse-all-atps.ts "C:/Users/shaun/OneDrive/Desktop/Curriculum"
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface DetectedFile {
  path: string;
  filename: string;
  subject: string;
  grade: number;
  type: 'atp' | 'caps';
}

const SUBJECT_PATTERNS: Array<{ pattern: RegExp; subject: string }> = [
  { pattern: /maths?\s*lit/i, subject: 'Mathematical Literacy' },
  { pattern: /\bmaths?\b(?!\s*lit)/i, subject: 'Mathematics' },
  { pattern: /phys(?:ical)?\s*sci/i, subject: 'Physical Sciences' },
  { pattern: /life\s*sci/i, subject: 'Life Sciences' },
  { pattern: /nat(?:ural)?\s*sci/i, subject: 'Natural Sciences' },
  { pattern: /accounting/i, subject: 'Accounting' },
  { pattern: /business\s*stud/i, subject: 'Business Studies' },
  { pattern: /economics/i, subject: 'Economics' },
  { pattern: /geography/i, subject: 'Geography' },
  { pattern: /history/i, subject: 'History' },
  { pattern: /english.*home/i, subject: 'English Home Language' },
  { pattern: /english.*first\s*add/i, subject: 'English First Additional Language' },
  { pattern: /afrikaans.*home/i, subject: 'Afrikaans Home Language' },
  { pattern: /afrikaans.*first\s*add/i, subject: 'Afrikaans First Additional Language' },
];

function detectFile(filename: string): { subject: string; grade: number; type: 'atp' | 'caps' } | null {
  // Detect subject
  let subject = '';
  for (const { pattern, subject: subj } of SUBJECT_PATTERNS) {
    if (pattern.test(filename)) {
      subject = subj;
      break;
    }
  }
  if (!subject) return null;

  // Detect grade
  const gradeMatch = filename.match(/gr(?:ade)?\s*(\d{1,2})/i);
  const grade = gradeMatch ? parseInt(gradeMatch[1], 10) : 0;

  // Detect type (ATP vs CAPS)
  const isAtp = /atp|annual\s*teach/i.test(filename);
  const isCaps = /caps/i.test(filename);
  const type = isAtp ? 'atp' : isCaps ? 'caps' : 'atp'; // default to ATP

  if (!grade && isCaps) {
    // CAPS docs cover a range (e.g., Gr 10-12) — skip for now, we parse ATPs per grade
    return null;
  }

  if (!grade) return null;

  return { subject, grade, type };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log('Usage: npx tsx scripts/parse-all-atps.ts <pdf-directory> [--output-dir <dir>]');
    process.exit(1);
  }

  const pdfDir = path.resolve(args[0]);
  const outputIdx = args.indexOf('--output-dir');
  const outputDir = outputIdx !== -1 && args[outputIdx + 1]
    ? path.resolve(args[outputIdx + 1])
    : path.resolve('scripts/output');

  if (!fs.existsSync(pdfDir)) {
    console.error(`Directory not found: ${pdfDir}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  // Scan directory
  const files = fs.readdirSync(pdfDir).filter((f) => f.toLowerCase().endsWith('.pdf'));
  console.log(`Found ${files.length} PDFs in ${pdfDir}\n`);

  const detected: DetectedFile[] = [];
  const skipped: string[] = [];

  for (const filename of files) {
    const info = detectFile(filename);
    if (info && info.type === 'atp') {
      detected.push({
        path: path.join(pdfDir, filename),
        filename,
        ...info,
      });
    } else {
      skipped.push(filename);
    }
  }

  console.log(`ATPs to parse: ${detected.length}`);
  if (skipped.length > 0) {
    console.log(`Skipped (CAPS docs or unrecognised): ${skipped.length}`);
    for (const s of skipped) {
      console.log(`  - ${s}`);
    }
  }
  console.log('');

  // Process each ATP
  const results: Array<{ file: string; subject: string; grade: number; status: string; nodes?: number }> = [];

  for (const file of detected) {
    const outputFile = path.join(outputDir, `caps-${file.subject.toLowerCase().replace(/\s+/g, '-')}-gr${file.grade}.json`);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${file.filename}`);
    console.log(`Subject: ${file.subject} | Grade: ${file.grade}`);
    console.log(`Output: ${outputFile}`);
    console.log('='.repeat(60));

    try {
      const cmd = `npx tsx scripts/parse-caps-atp.ts "${file.path}" "${file.subject}" ${file.grade} --output "${outputFile}"`;
      execSync(cmd, { stdio: 'inherit', cwd: path.resolve(__dirname, '..') });

      // Count nodes in output
      const output = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
      const nodeCount = output.nodes?.length ?? 0;

      results.push({ file: file.filename, subject: file.subject, grade: file.grade, status: 'OK', nodes: nodeCount });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`FAILED: ${msg}`);
      results.push({ file: file.filename, subject: file.subject, grade: file.grade, status: `FAILED: ${msg}` });
    }
  }

  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  for (const r of results) {
    const nodeStr = r.nodes ? ` (${r.nodes} nodes)` : '';
    console.log(`  ${r.status === 'OK' ? '✓' : '✗'} ${r.subject} Gr ${r.grade}: ${r.status}${nodeStr}`);
  }

  const ok = results.filter((r) => r.status === 'OK').length;
  const failed = results.filter((r) => r.status !== 'OK').length;
  console.log(`\nTotal: ${ok} succeeded, ${failed} failed`);
  console.log(`Output directory: ${outputDir}`);
}

main().catch((err) => {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
