import mongoose from 'mongoose';
import { Invoice, Payment } from '../../Fee/model.js';
import type { IAccountingConfig, IGLMapping, IBankMapping } from '../model.js';

interface DateRange {
  from: Date;
  to: Date;
}

interface JournalEntry {
  date: string;
  reference: string;
  accountCode: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
  vatCode: string;
  vatAmount: number;
}

function toLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toRands(cents: number): number {
  return Math.round(cents) / 100;
}

function findGLMapping(mappings: IGLMapping[], category: string): IGLMapping {
  return (
    mappings.find((m: IGLMapping) => m.feeCategory === category) ?? {
      feeCategory: category,
      accountCode: '4000',
      accountName: 'Revenue',
      vatCode: 'zero_rated',
    }
  );
}

function findBankMapping(mappings: IBankMapping[], method: string): IBankMapping {
  return (
    mappings.find((m: IBankMapping) => m.paymentMethod === method) ?? {
      paymentMethod: method,
      bankAccountCode: '1100',
      bankAccountName: 'Bank',
    }
  );
}

function calcVat(amount: number, vatCode: string, vatRegistered: boolean): number {
  if (!vatRegistered || vatCode !== 'standard') return 0;
  return Math.round((amount / 115) * 15 * 100) / 100; // 15% inclusive
}

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

async function fetchJournalEntries(
  schoolId: string,
  dateRange: DateRange,
  config: IAccountingConfig,
): Promise<{ entries: JournalEntry[]; recordCount: number }> {
  const sid = new mongoose.Types.ObjectId(schoolId);

  const [invoices, payments] = await Promise.all([
    Invoice.find({
      schoolId: sid,
      isDeleted: false,
      status: { $ne: 'cancelled' },
      createdAt: { $gte: dateRange.from, $lte: dateRange.to },
    }).lean(),
    Payment.find({
      schoolId: sid,
      isDeleted: false,
      paymentDate: { $gte: dateRange.from, $lte: dateRange.to },
    }).lean(),
  ]);

  const entries: JournalEntry[] = [];

  for (const inv of invoices) {
    const date = toLocalDate(new Date(inv.createdAt));
    const ref = inv.invoiceNumber;
    const category = (inv as unknown as Record<string, unknown>).category as string | undefined;
    const gl = findGLMapping(config.glMapping, category ?? 'other');
    const amount = toRands(inv.totalAmount);
    const vat = calcVat(amount, gl.vatCode, config.vatRegistered);
    const netAmount = config.vatRegistered && gl.vatCode === 'standard' ? amount - vat : amount;

    // Debit: Accounts Receivable
    entries.push({
      date,
      reference: ref,
      accountCode: '1200',
      accountName: 'Accounts Receivable',
      description: `Invoice ${ref}`,
      debit: amount,
      credit: 0,
      vatCode: gl.vatCode,
      vatAmount: 0,
    });

    // Credit: Revenue account
    entries.push({
      date,
      reference: ref,
      accountCode: gl.accountCode,
      accountName: gl.accountName,
      description: `Invoice ${ref} - Revenue`,
      debit: 0,
      credit: netAmount,
      vatCode: gl.vatCode,
      vatAmount: vat,
    });

    // VAT line if applicable
    if (vat > 0) {
      entries.push({
        date,
        reference: ref,
        accountCode: '2200',
        accountName: 'VAT Output',
        description: `Invoice ${ref} - VAT`,
        debit: 0,
        credit: vat,
        vatCode: 'standard',
        vatAmount: vat,
      });
    }
  }

  for (const pmt of payments) {
    const date = toLocalDate(new Date(pmt.paymentDate));
    const ref = pmt.receiptNumber ?? pmt.reference ?? String(pmt._id);
    const bank = findBankMapping(config.bankMapping, pmt.paymentMethod);
    const amount = toRands(pmt.amount);

    // Debit: Bank
    entries.push({
      date,
      reference: ref,
      accountCode: bank.bankAccountCode,
      accountName: bank.bankAccountName,
      description: `Payment ${ref} (${pmt.paymentMethod})`,
      debit: amount,
      credit: 0,
      vatCode: '',
      vatAmount: 0,
    });

    // Credit: Accounts Receivable
    entries.push({
      date,
      reference: ref,
      accountCode: '1200',
      accountName: 'Accounts Receivable',
      description: `Payment ${ref}`,
      debit: 0,
      credit: amount,
      vatCode: '',
      vatAmount: 0,
    });
  }

  return { entries, recordCount: invoices.length + payments.length };
}

// ─── CSV Generators ──────────────────────────────────────────────────────────

export async function generateCSV(
  schoolId: string,
  dateRange: DateRange,
  config: IAccountingConfig,
): Promise<{ content: string; recordCount: number }> {
  const { entries, recordCount } = await fetchJournalEntries(schoolId, dateRange, config);
  const header = 'Date,Reference,Account Code,Account Name,Description,Debit,Credit,VAT Code,VAT Amount';
  const rows = entries.map((e: JournalEntry) =>
    [e.date, escapeCsv(e.reference), e.accountCode, escapeCsv(e.accountName),
     escapeCsv(e.description), e.debit.toFixed(2), e.credit.toFixed(2),
     e.vatCode, e.vatAmount.toFixed(2)].join(','),
  );
  return { content: [header, ...rows].join('\n'), recordCount };
}

export async function generateSageCSV(
  schoolId: string,
  dateRange: DateRange,
  config: IAccountingConfig,
): Promise<{ content: string; recordCount: number }> {
  const { entries, recordCount } = await fetchJournalEntries(schoolId, dateRange, config);
  const header = 'AccountCode,Date,Reference,Description,TaxType,Debit,Credit';
  const rows = entries.map((e: JournalEntry) =>
    [e.accountCode, e.date, escapeCsv(e.reference), escapeCsv(e.description),
     e.vatCode === 'standard' ? '01' : '00', e.debit.toFixed(2), e.credit.toFixed(2)].join(','),
  );
  return { content: [header, ...rows].join('\n'), recordCount };
}

export async function generatePastelCSV(
  schoolId: string,
  dateRange: DateRange,
  config: IAccountingConfig,
): Promise<{ content: string; recordCount: number }> {
  const { entries, recordCount } = await fetchJournalEntries(schoolId, dateRange, config);
  const header = 'Date,Account,Description,Debit,Credit,Tax Type';
  const rows = entries.map((e: JournalEntry) =>
    [e.date, e.accountCode, escapeCsv(e.description),
     e.debit.toFixed(2), e.credit.toFixed(2),
     e.vatCode === 'standard' ? '1' : e.vatCode === 'exempt' ? '2' : '0'].join(','),
  );
  return { content: [header, ...rows].join('\n'), recordCount };
}

export async function generateQuickBooksIIF(
  schoolId: string,
  dateRange: DateRange,
  config: IAccountingConfig,
): Promise<{ content: string; recordCount: number }> {
  const { entries, recordCount } = await fetchJournalEntries(schoolId, dateRange, config);
  const lines: string[] = [];

  lines.push('!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO');
  lines.push('!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO');
  lines.push('!ENDTRNS');

  // Group entries by reference for proper IIF transactions
  const grouped = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const existing = grouped.get(entry.reference) ?? [];
    existing.push(entry);
    grouped.set(entry.reference, existing);
  }

  for (const [ref, group] of grouped) {
    if (group.length === 0) continue;
    const first = group[0];
    const totalAmount = group.reduce((sum: number, e: JournalEntry) => sum + e.debit - e.credit, 0);

    lines.push(
      `TRNS\tGENERAL JOURNAL\t${first.date}\t${first.accountCode}\t\t${totalAmount.toFixed(2)}\t${ref}`,
    );

    for (let i = 1; i < group.length; i++) {
      const e = group[i];
      const amt = e.debit - e.credit;
      lines.push(`SPL\tGENERAL JOURNAL\t${e.date}\t${e.accountCode}\t\t${amt.toFixed(2)}\t${e.description}`);
    }

    lines.push('ENDTRNS');
  }

  return { content: lines.join('\n'), recordCount };
}
