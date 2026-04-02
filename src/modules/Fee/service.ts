/**
 * Fee service barrel — re-exports all sub-service methods under the original
 * FeeService class so that existing controller/job imports remain unchanged.
 *
 * Implementation is split across:
 *   - services/feeType.service.ts  (FeeType + FeeSchedule CRUD)
 *   - services/invoice.service.ts  (Invoice, CreditNote, Statement, Discount, Ledger)
 *   - services/payment.service.ts  (Payment, Allocation, DebitOrder, Arrangement, Exemption)
 *   - services/debtor.service.ts   (Debtors, Collection, WriteOff)
 */
import { FeeTypeService } from './services/feeType.service.js';
import { InvoiceService } from './services/invoice.service.js';
import { PaymentService } from './services/payment.service.js';
import { DebtorService } from './services/debtor.service.js';

export class FeeService {
  // ─── FeeType + FeeSchedule (from feeType.service) ─────────────────────────
  static createFeeType = FeeTypeService.createFeeType;
  static listFeeTypes = FeeTypeService.listFeeTypes;
  static getFeeType = FeeTypeService.getFeeType;
  static updateFeeType = FeeTypeService.updateFeeType;
  static deleteFeeType = FeeTypeService.deleteFeeType;
  static createFeeSchedule = FeeTypeService.createFeeSchedule;
  static listFeeSchedules = FeeTypeService.listFeeSchedules;
  static getFeeSchedule = FeeTypeService.getFeeSchedule;
  static updateFeeSchedule = FeeTypeService.updateFeeSchedule;
  static deleteFeeSchedule = FeeTypeService.deleteFeeSchedule;

  // ─── Invoice + CreditNote + Statement (from invoice.service) ──────────────
  static createInvoice = InvoiceService.createInvoice;
  static listInvoices = InvoiceService.listInvoices;
  static getInvoice = InvoiceService.getInvoice;
  static getOverdueInvoices = InvoiceService.getOverdueInvoices;
  static getStudentBalance = InvoiceService.getStudentBalance;
  static generateStatement = InvoiceService.generateStatement;
  static applyDiscount = InvoiceService.applyDiscount;
  static bulkInvoiceGeneration = InvoiceService.bulkInvoiceGeneration;
  static createCreditNote = InvoiceService.createCreditNote;
  static approveCreditNote = InvoiceService.approveCreditNote;
  static listCreditNotes = InvoiceService.listCreditNotes;
  static getParentAccountBalance = InvoiceService.getParentAccountBalance;
  static getAccountLedger = InvoiceService.getAccountLedger;

  // ─── Payment + DebitOrder + Arrangement + Exemption (from payment.service) ─
  static recordPayment = PaymentService.recordPayment;
  static getPayments = PaymentService.getPayments;
  static calculateLateFees = PaymentService.calculateLateFees;
  static allocatePayment = PaymentService.allocatePayment;
  static createDebitOrder = PaymentService.createDebitOrder;
  static listDebitOrders = PaymentService.listDebitOrders;
  static getDebitOrder = PaymentService.getDebitOrder;
  static updateDebitOrder = PaymentService.updateDebitOrder;
  static deleteDebitOrder = PaymentService.deleteDebitOrder;
  static createPaymentArrangement = PaymentService.createPaymentArrangement;
  static listPaymentArrangements = PaymentService.listPaymentArrangements;
  static createFeeExemption = PaymentService.createFeeExemption;
  static listFeeExemptions = PaymentService.listFeeExemptions;

  // ─── Debtors + Collection + WriteOff (from debtor.service) ────────────────
  static getDebtorsReport = DebtorService.getDebtorsReport;
  static escalateCollection = DebtorService.escalateCollection;
  static writeOffDebt = DebtorService.writeOffDebt;
  static listCollectionActions = DebtorService.listCollectionActions;
}

// Also export sub-services for direct import
export { FeeTypeService } from './services/feeType.service.js';
export { InvoiceService } from './services/invoice.service.js';
export { PaymentService } from './services/payment.service.js';
export { DebtorService } from './services/debtor.service.js';
