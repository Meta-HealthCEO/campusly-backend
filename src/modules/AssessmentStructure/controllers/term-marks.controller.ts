import type { Request, Response } from 'express';
import { getUser } from '../../../types/authenticated-request.js';
import { apiResponse } from '../../../common/utils.js';
import { CalculationService } from '../services/calculation.service.js';
import type { TermMarksResult } from '../services/calculation.service.js';

function getTenant(req: Request): { teacherId: string; schoolId: string | null } {
  const user = getUser(req);
  return { teacherId: user.id, schoolId: user.schoolId ?? null };
}

function buildCsv(result: TermMarksResult): string {
  // Collect all (categoryName, lineItemName) pairs across all categories
  const columns: { catName: string; itemName: string }[] = [];
  for (const cat of result.categories) {
    for (const li of cat.lineItems) {
      columns.push({ catName: cat.name, itemName: li.name });
    }
  }

  // Header row
  const headerCells = [
    'Student',
    ...columns.map((c) => `"${c.catName} - ${c.itemName}"`),
    'Projected Term Mark',
    'Achievement Level',
  ];
  const rows: string[] = [headerCells.join(',')];

  for (const student of result.students) {
    const cells: string[] = [`"${student.studentName}"`];

    // Build a flat lookup: catIndex → lineItemIndex → percentage | isAbsent
    for (let catIdx = 0; catIdx < result.categories.length; catIdx++) {
      const cat = result.categories[catIdx];
      const studentCat = student.categories.find((c) => c.categoryId === cat.categoryId);
      for (const li of cat.lineItems) {
        const studentLi = studentCat?.lineItems.find((l) => l.lineItemId === li.lineItemId);
        if (!studentLi) {
          cells.push('');
        } else if (studentLi.isAbsent) {
          cells.push('ABS');
        } else if (studentLi.percentage === null) {
          cells.push('');
        } else {
          cells.push(String(studentLi.percentage));
        }
      }
    }

    cells.push(
      student.projectedTermMark !== null ? String(student.projectedTermMark) : '',
      student.achievementLevel !== null ? String(student.achievementLevel) : '',
    );
    rows.push(cells.join(','));
  }

  return rows.join('\r\n');
}

export class TermMarksController {
  static async getTermMarks(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const result = await CalculationService.getTermMarks(req.params.id as string, tenant);
    res.json(apiResponse(true, result));
  }

  static async getStudentTermMarks(req: Request, res: Response): Promise<void> {
    const tenant = getTenant(req);
    const result = await CalculationService.getStudentTermMarks(
      req.params.id as string,
      req.params.studentId as string,
      tenant,
    );
    res.json(apiResponse(true, result));
  }

  static async exportTermMarks(req: Request, res: Response): Promise<void> {
    const format = (req.query.format as string) || 'csv';
    const tenant = getTenant(req);
    const result = await CalculationService.getTermMarks(req.params.id as string, tenant);

    if (format === 'csv') {
      const csv = buildCsv(result);
      const safeName = result.structureName.replace(/[^a-zA-Z0-9 _-]/g, '');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}.csv"`);
      res.send(csv);
    } else {
      res.status(501).json(apiResponse(false, null, undefined, 'PDF export not yet implemented'));
    }
  }
}
