import type { Request, Response } from 'express';
import { Invoice } from './model.js';
import { generateCSV, setCsvHeaders, type CSVColumn } from '../../common/csv-export.js';
import { InvoiceStatus } from '../../common/enums.js';
import mongoose from 'mongoose';

interface PopulatedInvoice {
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  writeOffAmount: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
  studentId?: {
    admissionNumber?: string;
    userId?: { firstName?: string; lastName?: string };
  };
}

interface DebtorRow {
  _id: string;
  totalOwed: number;
  totalPaid: number;
  totalDiscount: number;
  totalWrittenOff: number;
  outstanding: number;
  student?: {
    admissionNumber?: string;
    userId?: { firstName?: string; lastName?: string };
    gradeId?: { name?: string };
    classId?: { name?: string };
  };
  current: number;
  days30: number;
  days60: number;
  days90: number;
  days120Plus: number;
}

function formatDate(d: Date): string {
  const dt = new Date(d);
  return dt.toISOString().split('T')[0] ?? '';
}

export class FeeExportController {
  static async exportInvoices(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;

    const invoices = (await Invoice.find({ schoolId, isDeleted: false })
      .populate({
        path: 'studentId',
        select: 'admissionNumber userId',
        populate: { path: 'userId', select: 'firstName lastName' },
      })
      .sort({ createdAt: -1 })
      .lean()) as unknown as PopulatedInvoice[];

    const columns: CSVColumn<PopulatedInvoice>[] = [
      { header: 'Date', accessor: (r) => formatDate(r.createdAt) },
      { header: 'Student', accessor: (r) => {
        const u = r.studentId?.userId;
        return u ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : '';
      }},
      { header: 'Invoice No', accessor: (r) => r.invoiceNumber },
      { header: 'Amount', accessor: (r) => r.totalAmount },
      { header: 'Status', accessor: (r) => r.status },
      { header: 'Due Date', accessor: (r) => formatDate(r.dueDate) },
      { header: 'Paid Amount', accessor: (r) => r.paidAmount },
      { header: 'Balance', accessor: (r) => r.totalAmount - r.paidAmount - r.discountAmount - r.writeOffAmount },
    ];

    const csv = generateCSV(invoices, columns);
    setCsvHeaders(res, 'invoices.csv');
    res.send(csv);
  }

  static async exportDebtors(req: Request, res: Response): Promise<void> {
    const schoolId = req.user!.schoolId!;
    const now = new Date();

    const debtors = (await Invoice.aggregate([
      {
        $match: {
          schoolId: new mongoose.Types.ObjectId(schoolId),
          isDeleted: false,
          status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
        },
      },
      {
        $group: {
          _id: '$studentId',
          totalOwed: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalDiscount: { $sum: '$discountAmount' },
          totalWrittenOff: { $sum: '$writeOffAmount' },
          oldestDueDate: { $min: '$dueDate' },
          invoices: { $push: { totalAmount: '$totalAmount', paidAmount: '$paidAmount', discountAmount: '$discountAmount', writeOffAmount: '$writeOffAmount', dueDate: '$dueDate' } },
        },
      },
      {
        $addFields: {
          outstanding: { $subtract: ['$totalOwed', { $add: ['$totalPaid', '$totalDiscount', '$totalWrittenOff'] }] },
        },
      },
      { $sort: { outstanding: -1 } },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'studentArr',
        },
      },
      { $unwind: { path: '$studentArr', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentArr.userId',
          foreignField: '_id',
          as: 'userArr',
        },
      },
      { $unwind: { path: '$userArr', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'grades',
          localField: 'studentArr.gradeId',
          foreignField: '_id',
          as: 'gradeArr',
        },
      },
      { $unwind: { path: '$gradeArr', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classes',
          localField: 'studentArr.classId',
          foreignField: '_id',
          as: 'classArr',
        },
      },
      { $unwind: { path: '$classArr', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          totalOwed: 1,
          totalPaid: 1,
          outstanding: 1,
          invoices: 1,
          studentName: { $concat: [{ $ifNull: ['$userArr.firstName', ''] }, ' ', { $ifNull: ['$userArr.lastName', ''] }] },
          grade: { $ifNull: ['$gradeArr.name', ''] },
          class: { $ifNull: ['$classArr.name', ''] },
        },
      },
    ])) as Array<{
      _id: string;
      totalOwed: number;
      totalPaid: number;
      outstanding: number;
      studentName: string;
      grade: string;
      class: string;
      invoices: Array<{ totalAmount: number; paidAmount: number; discountAmount: number; writeOffAmount: number; dueDate: Date }>;
    }>;

    // Calculate ageing buckets per debtor
    const rows = debtors.map((d) => {
      let current = 0, days30 = 0, days60 = 0, days90 = 0, days120Plus = 0;
      for (const inv of d.invoices) {
        const balance = inv.totalAmount - inv.paidAmount - inv.discountAmount - inv.writeOffAmount;
        if (balance <= 0) continue;
        const age = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        if (age <= 0) current += balance;
        else if (age <= 30) current += balance;
        else if (age <= 60) days30 += balance;
        else if (age <= 90) days60 += balance;
        else if (age <= 120) days90 += balance;
        else days120Plus += balance;
      }
      return { ...d, current, days30, days60, days90, days120Plus };
    });

    type DebtorExportRow = typeof rows[number];

    const columns: CSVColumn<DebtorExportRow>[] = [
      { header: 'Student Name', accessor: (r) => r.studentName.trim() },
      { header: 'Grade', accessor: (r) => r.grade },
      { header: 'Class', accessor: (r) => r.class },
      { header: 'Total Owed', accessor: (r) => r.outstanding },
      { header: 'Current', accessor: (r) => r.current },
      { header: '30 Days', accessor: (r) => r.days30 },
      { header: '60 Days', accessor: (r) => r.days60 },
      { header: '90 Days', accessor: (r) => r.days90 },
      { header: '120+ Days', accessor: (r) => r.days120Plus },
    ];

    const csv = generateCSV(rows, columns);
    setCsvHeaders(res, 'debtors.csv');
    res.send(csv);
  }
}
