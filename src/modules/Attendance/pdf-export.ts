import { createDocument, finalise } from '../../common/pdf/document.js';

export interface RegisterRow {
  admissionNumber: string;
  studentName: string;
  status: string;
  notes: string;
}

export interface RegisterPdfInput {
  schoolName: string;
  classLabel: string;
  date: string;   // YYYY-MM-DD
  period: number;
  rows: RegisterRow[];
}

export interface HistoryCell {
  status: 'present' | 'absent' | 'late' | 'excused' | null;
}

export interface HistoryGridPdfInput {
  schoolName: string;
  classLabel: string;
  period: number;
  dates: string[];           // column headers, YYYY-MM-DD
  rows: { admissionNumber: string; studentName: string }[];
  cells: HistoryCell[][];    // rows x dates
}

const STATUS_LETTER: Record<string, string> = {
  present: 'P',
  absent: 'A',
  late: 'L',
  excused: 'E',
};

export async function renderRegisterPdf(input: RegisterPdfInput): Promise<Buffer> {
  const doc = createDocument();

  doc.font('Helvetica-Bold').fontSize(16).text(input.schoolName, { align: 'center' });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(12).text(`Attendance Register — ${input.classLabel}`, { align: 'center' });
  doc.moveDown(0.2);
  doc.fontSize(10).text(`Date: ${input.date}    Period: ${input.period}`, { align: 'center' });
  doc.moveDown(0.8);

  // Table header
  const colX = { adm: 50, name: 130, status: 380, notes: 450 };
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('Adm. #', colX.adm, doc.y);
  doc.text('Student name', colX.name, doc.y - 12);
  doc.text('Status', colX.status, doc.y - 12);
  doc.text('Notes', colX.notes, doc.y - 12);
  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);

  doc.font('Helvetica').fontSize(10);
  for (const row of input.rows) {
    const y = doc.y;
    doc.text(row.admissionNumber, colX.adm, y, { width: 70 });
    doc.text(row.studentName, colX.name, y, { width: 240 });
    doc.text(STATUS_LETTER[row.status] ?? row.status, colX.status, y, { width: 60 });
    doc.text(row.notes, colX.notes, y, { width: 95 });
    doc.moveDown(0.3);
  }

  if (input.rows.length === 0) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Oblique').text('No students enrolled in this class.', { align: 'center' });
  }

  // Summary totals
  const totals = input.rows.reduce(
    (acc, r) => {
      const key = (STATUS_LETTER[r.status] ?? '?') as 'P' | 'A' | 'L' | 'E';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<'P' | 'A' | 'L' | 'E', number>,
  );
  doc.moveDown(1);
  doc.font('Helvetica-Bold').fontSize(10).text(
    `Totals — Present: ${totals.P ?? 0}    Absent: ${totals.A ?? 0}    Late: ${totals.L ?? 0}    Excused: ${totals.E ?? 0}`,
  );

  // Signature lines
  doc.moveDown(3);
  doc.font('Helvetica').fontSize(10);
  doc.text('Teacher signature: ____________________________     Date: ____________');

  return finalise(doc);
}

export async function renderHistoryGridPdf(input: HistoryGridPdfInput): Promise<Buffer> {
  const doc = createDocument();

  doc.font('Helvetica-Bold').fontSize(16).text(input.schoolName, { align: 'center' });
  doc.moveDown(0.3);
  doc.font('Helvetica').fontSize(12).text(
    `Attendance History — ${input.classLabel} (Period ${input.period})`,
    { align: 'center' },
  );
  doc.moveDown(0.2);
  if (input.dates.length > 0) {
    doc.fontSize(10).text(`${input.dates[0]} → ${input.dates[input.dates.length - 1]}`, { align: 'center' });
  }
  doc.moveDown(0.8);

  // Column layout: student name on the left, then one narrow column per date.
  const nameWidth = 160;
  const startX = 50;
  const cellWidth = Math.min(40, (545 - startX - nameWidth) / Math.max(input.dates.length, 1));

  // Header row
  doc.font('Helvetica-Bold').fontSize(8);
  doc.text('Student', startX, doc.y, { width: nameWidth, continued: false });
  const headerY = doc.y - 10;
  input.dates.forEach((d, i) => {
    doc.text(d.slice(5), startX + nameWidth + i * cellWidth, headerY, {
      width: cellWidth,
      align: 'center',
    });
  });
  doc.moveDown(0.4);
  doc.moveTo(startX, doc.y).lineTo(startX + nameWidth + input.dates.length * cellWidth, doc.y).stroke();
  doc.moveDown(0.2);

  // Body rows
  doc.font('Helvetica').fontSize(9);
  input.rows.forEach((row, rowIndex) => {
    const y = doc.y;
    doc.text(row.studentName, startX, y, { width: nameWidth });
    input.cells[rowIndex]?.forEach((cell, colIndex) => {
      const letter = cell.status ? STATUS_LETTER[cell.status] ?? '?' : '–';
      doc.text(letter, startX + nameWidth + colIndex * cellWidth, y, {
        width: cellWidth,
        align: 'center',
      });
    });
    doc.moveDown(0.3);
  });

  return finalise(doc);
}
