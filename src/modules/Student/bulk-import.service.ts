import { Student } from './model.js';
import { User } from '../Auth/model.js';
import { Grade } from '../Academic/model.js';
import { Class } from '../Academic/model.js';
import { UserRole } from '../../common/enums.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ParsedRow {
  firstName: string;
  lastName: string;
  admissionNumber: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  grade?: string;
  class?: string;
  homeLanguage?: string;
  saIdNumber?: string;
  phone?: string;
}

export interface RowError {
  row: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: ParsedRow[];
  errors: RowError[];
  totalRows: number;
}

interface ResolvedRow extends ParsedRow {
  gradeId: string;
  classId: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

// ─── CSV Template ───────────────────────────────────────────────────────────

const TEMPLATE_HEADERS = [
  'firstName',
  'lastName',
  'admissionNumber',
  'email',
  'dateOfBirth',
  'gender',
  'grade',
  'class',
  'homeLanguage',
  'saIdNumber',
  'phone',
];

// ─── Service ────────────────────────────────────────────────────────────────

export class BulkImportService {
  /** Return CSV header string for the import template. */
  static getCSVTemplate(): string {
    return TEMPLATE_HEADERS.join(',') + '\n';
  }

  /** Parse a CSV buffer into an array of row objects. Handles quoted fields. */
  static parseCSV(fileBuffer: Buffer): ParsedRow[] {
    const text = fileBuffer.toString('utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = text.split('\n');
    if (lines.length === 0) return [];

    const headers = BulkImportService.parseLine(lines[0]);
    return lines
      .slice(1)
      .filter((l) => l.trim().length > 0)
      .map((line) => {
        const values = BulkImportService.parseLine(line);
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] ?? '';
        });
        return obj as unknown as ParsedRow;
      });
  }

  /** Parse a single CSV line respecting quoted fields with commas. */
  private static parseLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current.trim());
    return result;
  }

  /** Validate parsed rows against required fields and database state. */
  static async validateRows(
    rows: ParsedRow[],
    schoolId: string,
  ): Promise<ValidationResult> {
    const errors: RowError[] = [];
    const valid: ParsedRow[] = [];

    // Pre-fetch grades and classes for this school
    const grades = await Grade.find({ schoolId, isDeleted: false }).lean();
    const classes = await Class.find({ schoolId, isDeleted: false }).lean();
    const gradeMap = new Map(grades.map((g) => [g.name.toLowerCase(), g]));
    const classMap = new Map(classes.map((c) => [c.name.toLowerCase(), c]));

    // Check for duplicate admission numbers in file
    const seenAdmissions = new Map<string, number>();

    // Pre-fetch existing admission numbers
    const existingStudents = await Student.find(
      { schoolId, isDeleted: false },
      { admissionNumber: 1 },
    ).lean();
    const existingAdmissions = new Set(
      existingStudents.map((s) => s.admissionNumber.toLowerCase()),
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-indexed, +1 for header
      let rowValid = true;

      // Required fields
      if (!row.firstName?.trim()) {
        errors.push({ row: rowNum, field: 'firstName', message: 'First name is required' });
        rowValid = false;
      }
      if (!row.lastName?.trim()) {
        errors.push({ row: rowNum, field: 'lastName', message: 'Last name is required' });
        rowValid = false;
      }
      if (!row.admissionNumber?.trim()) {
        errors.push({ row: rowNum, field: 'admissionNumber', message: 'Admission number is required' });
        rowValid = false;
      }

      // Duplicate check within file
      if (row.admissionNumber?.trim()) {
        const admLower = row.admissionNumber.trim().toLowerCase();
        const prevRow = seenAdmissions.get(admLower);
        if (prevRow !== undefined) {
          errors.push({
            row: rowNum,
            field: 'admissionNumber',
            message: `Duplicate admission number (same as row ${prevRow})`,
          });
          rowValid = false;
        } else {
          seenAdmissions.set(admLower, rowNum);
        }

        // Existing in database
        if (existingAdmissions.has(admLower)) {
          errors.push({
            row: rowNum,
            field: 'admissionNumber',
            message: 'Admission number already exists in this school',
          });
          rowValid = false;
        }
      }

      // Grade validation
      if (row.grade?.trim() && !gradeMap.has(row.grade.trim().toLowerCase())) {
        errors.push({
          row: rowNum,
          field: 'grade',
          message: `Grade "${row.grade}" not found in school`,
        });
        rowValid = false;
      }

      // Class validation
      if (row.class?.trim() && !classMap.has(row.class.trim().toLowerCase())) {
        errors.push({
          row: rowNum,
          field: 'class',
          message: `Class "${row.class}" not found in school`,
        });
        rowValid = false;
      }

      // Gender validation
      if (row.gender?.trim() && !['male', 'female', 'other'].includes(row.gender.trim().toLowerCase())) {
        errors.push({
          row: rowNum,
          field: 'gender',
          message: 'Gender must be male, female, or other',
        });
        rowValid = false;
      }

      if (rowValid) valid.push(row);
    }

    return { valid, errors, totalRows: rows.length };
  }

  /** Bulk create students from validated rows. */
  static async importStudents(
    schoolId: string,
    validRows: ParsedRow[],
    _createdBy: string,
  ): Promise<ImportResult> {
    const grades = await Grade.find({ schoolId, isDeleted: false }).lean();
    const classes = await Class.find({ schoolId, isDeleted: false }).lean();
    const gradeMap = new Map(grades.map((g) => [g.name.toLowerCase(), g]));
    const classMap = new Map(classes.map((c) => [c.name.toLowerCase(), c]));

    // Resolve grade/class IDs and assign defaults
    const defaultGrade = grades[0];
    const defaultClass = classes[0];
    if (!defaultGrade || !defaultClass) {
      return { imported: 0, skipped: 0, errors: ['No grades or classes exist for this school'] };
    }

    const resolved: ResolvedRow[] = validRows.map((row) => {
      const grade = row.grade?.trim() ? gradeMap.get(row.grade.trim().toLowerCase()) : undefined;
      const cls = row.class?.trim() ? classMap.get(row.class.trim().toLowerCase()) : undefined;
      return {
        ...row,
        gradeId: grade ? String(grade._id) : String(defaultGrade._id),
        classId: cls ? String(cls._id) : String(defaultClass._id),
      };
    });

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const row of resolved) {
      try {
        const email =
          row.email?.trim() ||
          `${row.firstName.trim().toLowerCase()}.${row.lastName.trim().toLowerCase()}.${row.admissionNumber.trim()}@student.campusly.local`;

        const user = await User.create({
          email,
          password: `Temp@${row.admissionNumber.trim()}`,
          firstName: row.firstName.trim(),
          lastName: row.lastName.trim(),
          role: UserRole.STUDENT,
          schoolId,
          phone: row.phone?.trim() || undefined,
        });

        await Student.create({
          userId: user._id,
          schoolId,
          gradeId: row.gradeId,
          classId: row.classId,
          admissionNumber: row.admissionNumber.trim(),
          dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth) : undefined,
          gender: row.gender?.trim().toLowerCase() as 'male' | 'female' | 'other' | undefined,
          homeLanguage: row.homeLanguage?.trim() || undefined,
          saIdNumber: row.saIdNumber?.trim() || undefined,
        });

        imported++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Row ${row.admissionNumber}: ${msg}`);
        skipped++;
      }
    }

    return { imported, skipped, errors };
  }
}
