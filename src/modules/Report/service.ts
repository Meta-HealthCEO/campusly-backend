import { DashboardReportService } from './services/dashboard.service.js';
import { FinancialReportService } from './services/financial.service.js';
import { AcademicReportService } from './services/academic.service.js';
import { Student360Service } from './services/student360.service.js';

export { DashboardReportService } from './services/dashboard.service.js';
export { FinancialReportService } from './services/financial.service.js';
export { AcademicReportService } from './services/academic.service.js';
export { Student360Service } from './services/student360.service.js';
export { SchoolBenchmark } from './models/SchoolBenchmark.js';

/**
 * Unified facade so existing consumers (`import { ReportService }`)
 * continue to work without changes.
 */
export const ReportService = {
  // Dashboard
  getDashboardStats: DashboardReportService.getDashboardStats,
  getComprehensiveDashboard: DashboardReportService.getComprehensiveDashboard,

  // Financial
  getRevenueReport: FinancialReportService.getRevenueReport,
  getDebtorsReport: FinancialReportService.getDebtorsReport,
  getDebtorsAgeingReport: FinancialReportService.getDebtorsAgeingReport,
  getMonthlyFinancialSummary: FinancialReportService.getMonthlyFinancialSummary,
  getTuckShopSalesReport: FinancialReportService.getTuckShopSalesReport,

  // Academic
  getAttendanceReport: AcademicReportService.getAttendanceReport,
  getAcademicPerformanceReport: AcademicReportService.getAcademicPerformanceReport,
  getStudentReportCard: AcademicReportService.getStudentReportCard,
  getStudentFullReport: AcademicReportService.getStudentFullReport,
  getClassPerformance: AcademicReportService.getClassPerformance,
  getSubjectPerformance: AcademicReportService.getSubjectPerformance,
  // Student 360
  getStudent360: Student360Service.getStudent360,
} as const;
