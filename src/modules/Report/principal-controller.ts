import type { Request, Response } from 'express';
import { apiResponse } from '../../common/utils.js';
import { getKPIs } from './services/principal-kpi.service.js';
import {
  getSubjectHeatmap,
  getTermTrends,
  getTeacherPerformance,
} from './services/principal-analytics.service.js';
import { getFinancialHealth } from './services/principal-financial.service.js';
import { getRiskAlerts } from './services/principal-alerts.service.js';
import { SchoolBenchmark } from './models/SchoolBenchmark.js';
import { logger } from '../../common/logger.js';

function resolveSchoolId(req: Request): string | undefined {
  return (req.query.schoolId as string) ?? req.user?.schoolId;
}

export class PrincipalController {
  // ─── KPIs ──────────────────────────────────────────────────────────────────

  static async getKpis(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const term = req.query.term ? Number(req.query.term) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const data = await getKPIs(schoolId, term, year);
    res.json(apiResponse(true, data, 'Principal KPIs retrieved successfully'));
  }

  // ─── Subject Heatmap ───────────────────────────────────────────────────────

  static async getSubjectHeatmap(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const term = req.query.term ? Number(req.query.term) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const data = await getSubjectHeatmap(schoolId, term, year);
    res.json(apiResponse(true, data, 'Subject heatmap retrieved successfully'));
  }

  // ─── Term Trends ───────────────────────────────────────────────────────────

  static async getTrends(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const year = req.query.year ? Number(req.query.year) : undefined;
    const data = await getTermTrends(schoolId, year);
    res.json(apiResponse(true, data, 'Term trends retrieved successfully'));
  }

  // ─── Teacher Performance ───────────────────────────────────────────────────

  static async getTeacherPerformance(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const term = req.query.term ? Number(req.query.term) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const data = await getTeacherPerformance(schoolId, term, year);
    res.json(apiResponse(true, data, 'Teacher performance retrieved successfully'));
  }

  // ─── Financial Health ──────────────────────────────────────────────────────

  static async getFinancialHealth(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const year = req.query.year ? Number(req.query.year) : undefined;
    const data = await getFinancialHealth(schoolId, year);
    res.json(apiResponse(true, data, 'Financial health retrieved successfully'));
  }

  // ─── Risk Alerts ───────────────────────────────────────────────────────────

  static async getRiskAlerts(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const data = await getRiskAlerts(schoolId);
    res.json(apiResponse(true, data, 'Risk alerts retrieved successfully'));
  }

  // ─── Benchmarks ────────────────────────────────────────────────────────────

  static async getBenchmarks(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const data = await SchoolBenchmark.findOne({
      schoolId,
      isDeleted: false,
    }).lean();
    res.json(apiResponse(true, data, 'Benchmarks retrieved successfully'));
  }

  static async updateBenchmarks(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolId(req) ?? (req.body.schoolId as string);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const { benchmarks, annualBudget, monthlyExpenseEstimate } = req.body as {
      benchmarks?: Record<string, unknown>;
      annualBudget?: number;
      monthlyExpenseEstimate?: number;
    };

    const updateData: Record<string, unknown> = { updatedBy: req.user?.id };
    if (benchmarks) updateData.benchmarks = benchmarks;
    if (annualBudget !== undefined) updateData.annualBudget = annualBudget;
    if (monthlyExpenseEstimate !== undefined) updateData.monthlyExpenseEstimate = monthlyExpenseEstimate;

    const data = await SchoolBenchmark.findOneAndUpdate(
      { schoolId, isDeleted: false },
      { $set: updateData, $setOnInsert: { schoolId } },
      { upsert: true, new: true, lean: true },
    );
    res.json(apiResponse(true, data, 'Benchmarks updated successfully'));
  }

  // ─── Executive Summary ─────────────────────────────────────────────────────

  static async getExecutiveSummary(req: Request, res: Response): Promise<void> {
    const schoolId = resolveSchoolId(req);
    if (!schoolId) {
      res.status(400).json(apiResponse(false, undefined, undefined, 'School ID is required'));
      return;
    }
    const term = req.query.term ? Number(req.query.term) : undefined;
    const year = req.query.year ? Number(req.query.year) : undefined;

    const [kpis, benchmarkDoc, heatmap, alerts, financial] = await Promise.all([
      getKPIs(schoolId, term, year),
      SchoolBenchmark.findOne({ schoolId, isDeleted: false }).lean(),
      getSubjectHeatmap(schoolId, term, year),
      getRiskAlerts(schoolId),
      getFinancialHealth(schoolId, year),
    ]);

    // Top/bottom subjects from heatmap
    const subjectAvgs = heatmap.map((s) => {
      const avg = s.grades.length > 0
        ? s.grades.reduce((sum, g) => sum + g.averagePercent, 0) / s.grades.length
        : 0;
      return { subjectName: s.subjectName, averagePercent: Math.round(avg * 10) / 10 };
    });
    subjectAvgs.sort((a, b) => b.averagePercent - a.averagePercent);

    const data = {
      schoolName: '', // Frontend can overlay school name
      generatedAt: new Date().toISOString(),
      period: {
        term: term ?? Math.min(4, Math.ceil((new Date().getMonth() + 1) / 3)),
        year: year ?? new Date().getFullYear(),
      },
      kpis,
      benchmarkComparison: benchmarkDoc?.benchmarks ?? null,
      topPerformingSubjects: subjectAvgs.slice(0, 3),
      underperformingSubjects: subjectAvgs.slice(-3).reverse(),
      riskAlerts: alerts.alerts,
      financialSummary: {
        totalRevenue: financial.revenueVsBudget.totalRevenue,
        outstandingFees: financial.outstandingFeesAging.total,
        collectionRate: kpis.feeCollectionRate.current,
      },
    };

    res.json(apiResponse(true, data, 'Executive summary retrieved successfully'));
  }
}
