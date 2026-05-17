import { describe, it, expect } from 'vitest';
import { renderRegisterPdf, renderHistoryGridPdf, type RegisterRow, type HistoryCell } from '../pdf-export.js';

const PDF_MAGIC = Buffer.from('%PDF');

describe('renderRegisterPdf', () => {
  it('produces a non-empty Buffer starting with %PDF', async () => {
    const rows: RegisterRow[] = [
      { admissionNumber: 'A001', studentName: 'Alice Smith', status: 'present', notes: '' },
      { admissionNumber: 'A002', studentName: 'Bob Jones', status: 'absent', notes: 'Sick' },
    ];

    const buffer = await renderRegisterPdf({
      schoolName: 'Test High',
      classLabel: 'Grade 11A',
      date: '2026-05-15',
      period: 1,
      rows,
    });

    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 4).equals(PDF_MAGIC)).toBe(true);
  });

  it('handles an empty class', async () => {
    const buffer = await renderRegisterPdf({
      schoolName: 'Test High',
      classLabel: 'Grade 11A',
      date: '2026-05-15',
      period: 1,
      rows: [],
    });
    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 4).equals(PDF_MAGIC)).toBe(true);
  });
});

describe('renderHistoryGridPdf', () => {
  it('produces a non-empty Buffer starting with %PDF', async () => {
    const dates = ['2026-05-12', '2026-05-13', '2026-05-14'];
    const cells: HistoryCell[][] = [
      [
        { status: 'present' }, { status: 'absent' }, { status: 'present' },
      ],
      [
        { status: 'present' }, { status: 'late' }, { status: null },
      ],
    ];
    const rows: { admissionNumber: string; studentName: string }[] = [
      { admissionNumber: 'A001', studentName: 'Alice Smith' },
      { admissionNumber: 'A002', studentName: 'Bob Jones' },
    ];

    const buffer = await renderHistoryGridPdf({
      schoolName: 'Test High',
      classLabel: 'Grade 11A',
      period: 1,
      dates,
      rows,
      cells,
    });

    expect(buffer.length).toBeGreaterThan(0);
    expect(buffer.subarray(0, 4).equals(PDF_MAGIC)).toBe(true);
  });
});
