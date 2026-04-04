import mongoose from 'mongoose';
import { TaxTable } from './model.js';
import type { ITaxTable, ITaxBracket } from './model.js';
import { NotFoundError } from '../../common/errors.js';
import { logger } from '../../common/logger.js';

// ─── Tax Table CRUD ───────────────────────────────────────────────────────────

export class TaxService {
  static async getTaxTable(schoolId: string, taxYear?: number): Promise<ITaxTable> {
    const year = taxYear ?? TaxService.currentTaxYear();
    const table = await TaxTable.findOne({
      schoolId: new mongoose.Types.ObjectId(schoolId),
      taxYear: year,
      isDeleted: false,
    }).lean<ITaxTable>();

    if (!table) {
      throw new NotFoundError(`Tax table not found for year ${year}`);
    }
    return table;
  }

  static async upsertTaxTable(
    schoolId: string,
    data: {
      taxYear: number;
      brackets: ITaxBracket[];
      rebates: { primary: number; secondary: number; tertiary: number };
      taxThresholds: { under65: number; age65to74: number; age75plus: number };
      uifRate: number;
      uifCeiling: number;
      sdlRate: number;
      medicalCredits: { main: number; firstDependant: number; additionalDependant: number };
    },
  ): Promise<ITaxTable> {
    const result = await TaxTable.findOneAndUpdate(
      { schoolId: new mongoose.Types.ObjectId(schoolId), taxYear: data.taxYear },
      { $set: { ...data, schoolId: new mongoose.Types.ObjectId(schoolId), isDeleted: false } },
      { upsert: true, new: true },
    ).lean<ITaxTable>();

    logger.info({ schoolId, taxYear: data.taxYear }, 'Tax table upserted');
    return result as ITaxTable;
  }

  // ─── PAYE Calculation (SARS Annual Equivalent Method) ─────────────────

  static calculatePAYE(
    monthlyTaxable: number,
    brackets: ITaxBracket[],
    rebates: { primary: number; secondary: number; tertiary: number },
    medicalCredits: { main: number; firstDependant: number; additionalDependant: number },
    age: number,
  ): number {
    if (monthlyTaxable <= 0) return 0;

    // Step 1: Annual equivalent
    const annualTaxable = monthlyTaxable * 12;

    // Step 2: Apply brackets
    let annualTax = 0;
    for (const bracket of brackets) {
      if (annualTaxable >= bracket.from) {
        if (bracket.to === null || annualTaxable <= bracket.to) {
          annualTax = bracket.baseAmount + Math.round(((annualTaxable - bracket.from) * bracket.rate) / 100);
          break;
        }
      }
    }

    // Step 3: Subtract rebates
    annualTax -= rebates.primary;
    if (age >= 65) annualTax -= rebates.secondary;
    if (age >= 75) annualTax -= rebates.tertiary;

    // Step 4: Monthly PAYE
    let monthlyPAYE = Math.round(annualTax / 12);

    // Step 5: Subtract medical tax credits (monthly)
    monthlyPAYE -= medicalCredits.main;

    return Math.max(0, monthlyPAYE);
  }

  static calculateUIF(grossPay: number, uifRate: number, uifCeiling: number): { employee: number; employer: number } {
    const base = Math.min(grossPay, uifCeiling);
    const employee = Math.round((base * uifRate) / 100);
    const employer = Math.round((base * uifRate) / 100);
    return { employee, employer };
  }

  static calculateSDL(grossPay: number, sdlRate: number): number {
    return Math.round((grossPay * sdlRate) / 100);
  }

  static calculateAge(dateOfBirth: Date, referenceDate: Date): number {
    let age = referenceDate.getFullYear() - dateOfBirth.getFullYear();
    const m = referenceDate.getMonth() - dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && referenceDate.getDate() < dateOfBirth.getDate())) {
      age--;
    }
    return age;
  }

  /** SA tax year: e.g., 2027 means March 2026 – February 2027. */
  static currentTaxYear(): number {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    const year = now.getFullYear();
    // March (2) onwards = next tax year
    return month >= 2 ? year + 1 : year;
  }
}
