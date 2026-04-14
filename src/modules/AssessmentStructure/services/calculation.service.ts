import mongoose from 'mongoose';
import { Mark } from '../../Academic/model.js';
import { Student } from '../../Student/model.js';
import { User } from '../../Auth/model.js';
import { StructureService } from './structure.service.js';
import type { IAssessmentStructure, ICategory, ILineItem } from '../model.js';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TenantFilter {
  teacherId: string;
  schoolId: string | null;
}

interface LineItemResult {
  lineItemId: string;
  name: string;
  mark: number | null;
  total: number;
  percentage: number | null;
  isAbsent: boolean;
}

interface CategoryResult {
  categoryId: string;
  name: string;
  weight: number;
  score: number | null;
}

interface StudentResult {
  studentId: string;
  studentName: string;
  capturedWeight: number;
  capturedTotal: number;
  projectedTermMark: number | null;
  finalTermMark: number | null;
  achievementLevel: number | null;
  categories: (CategoryResult & { lineItems: LineItemResult[] })[];
}

interface LineItemSummary {
  lineItemId: string;
  name: string;
  totalMarks: number;
  studentsCaptured: number;
  studentsPending: number;
}

type CategoryStatus = 'pending' | 'in_progress' | 'complete';

interface CategorySummary {
  categoryId: string;
  name: string;
  weight: number;
  status: CategoryStatus;
  lineItems: LineItemSummary[];
}

export interface TermMarksResult {
  structureId: string;
  structureName: string;
  term: number;
  academicYear: number;
  completionPercent: number;
  categories: CategorySummary[];
  students: StudentResult[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAchievementLevel(mark: number): number {
  if (mark >= 80) return 7;
  if (mark >= 70) return 6;
  if (mark >= 60) return 5;
  if (mark >= 50) return 4;
  if (mark >= 40) return 3;
  if (mark >= 30) return 2;
  return 1;
}

function deriveCategoryStatus(
  category: ICategory,
  markIndex: Map<string, Map<string, { mark: number; isAbsent: boolean }>>,
  studentIds: mongoose.Types.ObjectId[],
): CategoryStatus {
  const { lineItems } = category;

  // pending = all items pending
  const allPending = lineItems.every((li) => li.status === 'pending');
  if (allPending) return 'pending';

  // complete = all items closed AND all students have marks
  const allClosed = lineItems.every((li) => li.status === 'closed');
  if (allClosed) {
    const allMarked = lineItems.every((li) => {
      if (!li.assessmentId) return false;
      const assessKey = li.assessmentId.toString();
      const studentMap = markIndex.get(assessKey);
      if (!studentMap) return false;
      return studentIds.every((sid) => studentMap.has(sid.toString()));
    });
    if (allMarked) return 'complete';
  }

  return 'in_progress';
}

// ─── Core calculation per student ─────────────────────────────────────────────

function calculateStudentResult(
  studentId: string,
  studentName: string,
  structure: IAssessmentStructure,
  markIndex: Map<string, Map<string, { mark: number; isAbsent: boolean }>>,
): StudentResult {
  let capturedWeight = 0;
  let capturedTotal = 0;

  const categoryResults: (CategoryResult & { lineItems: LineItemResult[] })[] = [];

  for (const cat of structure.categories) {
    // Only capturing and closed line items participate
    const participating = cat.lineItems.filter(
      (li) => li.status === 'capturing' || li.status === 'closed',
    );

    if (participating.length === 0) {
      // Category has no participating line items — excluded
      categoryResults.push({
        categoryId: cat._id.toString(),
        name: cat.name,
        weight: cat.weight,
        score: null,
        lineItems: cat.lineItems.map((li) => ({
          lineItemId: li._id.toString(),
          name: li.name,
          mark: null,
          total: li.totalMarks,
          percentage: null,
          isAbsent: false,
        })),
      });
      continue;
    }

    // Determine base weights per line item
    const hasCustomWeights = participating.every((li) => li.weight != null);
    const baseWeights: Map<string, number> = new Map();

    if (hasCustomWeights) {
      for (const li of participating) {
        baseWeights.set(li._id.toString(), li.weight ?? 0);
      }
    } else {
      const equalWeight = 100 / participating.length;
      for (const li of participating) {
        baseWeights.set(li._id.toString(), equalWeight);
      }
    }

    // Identify which participating items this student has a non-absent mark for
    const presentItems: { li: ILineItem; weight: number; percentage: number }[] = [];
    let allAbsent = true;

    for (const li of participating) {
      const itemKey = li._id.toString();
      const baseWeight = baseWeights.get(itemKey) ?? 0;
      const assessKey = li.assessmentId?.toString() ?? '';
      const studentMap = markIndex.get(assessKey);
      const markEntry = studentMap?.get(studentId);

      if (!markEntry) {
        // No mark yet — skip this item for this student (mark pending)
        continue;
      }

      if (markEntry.isAbsent) {
        // Absent — excluded, but we know a record exists
        continue;
      }

      // Present with a mark (including 0)
      allAbsent = false;
      const percentage = markEntry.mark; // IMark.percentage is already stored, but we recalculate
      // Actually use stored percentage field — but markEntry only stores mark + isAbsent
      // We need the totalMarks from line item to compute percentage
      const pct = li.totalMarks > 0 ? (markEntry.mark / li.totalMarks) * 100 : 0;
      presentItems.push({ li, weight: baseWeight, percentage: pct });
    }

    // Check if student was absent for ALL participating items
    // (allAbsent is true if presentItems is empty AND at least one mark record exists)
    const hasAnyMarkRecord = participating.some((li) => {
      const assessKey = li.assessmentId?.toString() ?? '';
      return markIndex.get(assessKey)?.has(studentId) === true;
    });

    const lineItemResults: LineItemResult[] = cat.lineItems.map((li) => {
      const assessKey = li.assessmentId?.toString() ?? '';
      const studentMap = markIndex.get(assessKey);
      const markEntry = studentMap?.get(studentId);
      const pct =
        markEntry && !markEntry.isAbsent && li.totalMarks > 0
          ? (markEntry.mark / li.totalMarks) * 100
          : null;
      return {
        lineItemId: li._id.toString(),
        name: li.name,
        mark: markEntry ? markEntry.mark : null,
        total: li.totalMarks,
        percentage: pct !== null ? Math.round(pct) : null,
        isAbsent: markEntry?.isAbsent ?? false,
      };
    });

    if (presentItems.length === 0) {
      // No marks captured for this student in this category
      // If all absent, exclude from term mark; otherwise just no data yet
      categoryResults.push({
        categoryId: cat._id.toString(),
        name: cat.name,
        weight: cat.weight,
        score: allAbsent && hasAnyMarkRecord ? 0 : null,
        lineItems: lineItemResults,
      });

      if (allAbsent && hasAnyMarkRecord) {
        // Student absent for all — excluded from weight redistribution (weight not added to capturedWeight)
      }
      continue;
    }

    // Re-normalise weights for present items only
    const totalPresentWeight = presentItems.reduce((s, p) => s + p.weight, 0);
    const categoryScore = presentItems.reduce((s, p) => {
      const normalised = (p.weight / totalPresentWeight) * 100;
      return s + (p.percentage * normalised) / 100;
    }, 0);

    // Proportion of participating items this student was present for
    const proportion = totalPresentWeight / (participating.reduce((s, li) => {
      return s + (baseWeights.get(li._id.toString()) ?? 0);
    }, 0));

    capturedWeight += cat.weight * proportion;
    capturedTotal += (categoryScore / 100) * cat.weight * proportion;

    categoryResults.push({
      categoryId: cat._id.toString(),
      name: cat.name,
      weight: cat.weight,
      score: Math.round(categoryScore),
      lineItems: lineItemResults,
    });
  }

  const projectedTermMark =
    capturedWeight > 0
      ? Math.round((capturedTotal / (capturedWeight / 100)))
      : null;

  const finalTermMark =
    structure.status === 'locked' && projectedTermMark !== null
      ? projectedTermMark
      : null;

  const achievementLevel =
    projectedTermMark !== null ? getAchievementLevel(projectedTermMark) : null;

  return {
    studentId,
    studentName,
    capturedWeight: Math.round(capturedWeight * 100) / 100,
    capturedTotal: Math.round(capturedTotal * 100) / 100,
    projectedTermMark,
    finalTermMark,
    achievementLevel,
    categories: categoryResults,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class CalculationService {
  // ── getTermMarks ─────────────────────────────────────────────────────────────

  static async getTermMarks(
    structureId: string,
    tenant: TenantFilter,
  ): Promise<TermMarksResult> {
    // 1. Load structure
    const structure = await StructureService.getById(structureId, tenant);

    // 2. Get student IDs
    const studentObjectIds = await StructureService.getStudentIds(structure);
    const studentIds = studentObjectIds.map((id) => id.toString());

    // 3. Collect all assessmentIds from non-pending line items
    const assessmentObjectIds: mongoose.Types.ObjectId[] = [];
    for (const cat of structure.categories) {
      for (const li of cat.lineItems) {
        if (li.status !== 'pending' && li.assessmentId) {
          assessmentObjectIds.push(li.assessmentId as mongoose.Types.ObjectId);
        }
      }
    }

    // 4. Batch-fetch all marks in one query
    const allMarks =
      assessmentObjectIds.length > 0 && studentObjectIds.length > 0
        ? await Mark.find({
            assessmentId: { $in: assessmentObjectIds },
            studentId: { $in: studentObjectIds },
            isDeleted: false,
          }).lean()
        : [];

    // 5. Index marks: assessmentId → studentId → { mark, isAbsent }
    const markIndex = new Map<
      string,
      Map<string, { mark: number; isAbsent: boolean }>
    >();

    for (const m of allMarks) {
      const aKey = m.assessmentId.toString();
      const sKey = m.studentId.toString();
      if (!markIndex.has(aKey)) markIndex.set(aKey, new Map());
      markIndex.get(aKey)!.set(sKey, { mark: m.mark, isAbsent: m.isAbsent });
    }

    // 6. Get student names via Student → User lookup
    const studentDocs =
      studentObjectIds.length > 0
        ? await Student.find(
            { _id: { $in: studentObjectIds }, isDeleted: false },
            { _id: 1, userId: 1 },
          ).lean()
        : [];

    const userIds = studentDocs
      .map((s) => s.userId)
      .filter((id): id is mongoose.Types.ObjectId => id != null);

    const userDocs =
      userIds.length > 0
        ? await User.find(
            { _id: { $in: userIds } },
            { _id: 1, firstName: 1, lastName: 1 },
          ).lean()
        : [];

    const userNameMap = new Map<string, string>();
    for (const u of userDocs) {
      userNameMap.set(
        u._id.toString(),
        `${u.firstName} ${u.lastName}`.trim(),
      );
    }

    const studentNameMap = new Map<string, string>();
    for (const s of studentDocs) {
      const name = s.userId
        ? (userNameMap.get(s.userId.toString()) ?? 'Unknown Student')
        : 'Unknown Student';
      studentNameMap.set((s._id as mongoose.Types.ObjectId).toString(), name);
    }

    // 7. Calculate per-student results
    const studentResults: StudentResult[] = studentIds.map((sid) => {
      const name = studentNameMap.get(sid) ?? 'Unknown Student';
      return calculateStudentResult(sid, name, structure, markIndex);
    });

    // 8. Build category summaries with line item stats
    const categorySummaries: CategorySummary[] = structure.categories.map(
      (cat) => {
        const lineItemSummaries: LineItemSummary[] = cat.lineItems.map((li) => {
          const assessKey = li.assessmentId?.toString() ?? '';
          const studentMap = markIndex.get(assessKey);
          let captured = 0;
          let pending = 0;

          for (const sid of studentIds) {
            const entry = studentMap?.get(sid);
            if (entry) {
              captured++;
            } else {
              pending++;
            }
          }

          return {
            lineItemId: li._id.toString(),
            name: li.name,
            totalMarks: li.totalMarks,
            studentsCaptured: captured,
            studentsPending: pending,
          };
        });

        const status = deriveCategoryStatus(cat, markIndex, studentObjectIds);

        return {
          categoryId: cat._id.toString(),
          name: cat.name,
          weight: cat.weight,
          status,
          lineItems: lineItemSummaries,
        };
      },
    );

    // 9. Completion percent: proportion of all (lineItem × student) pairs captured
    const totalPairs = structure.categories.reduce(
      (s, cat) => s + cat.lineItems.filter((li) => li.status !== 'pending').length * studentIds.length,
      0,
    );
    const capturedPairs = structure.categories.reduce((s, cat) => {
      return (
        s +
        cat.lineItems
          .filter((li) => li.status !== 'pending')
          .reduce((ls, li) => {
            const assessKey = li.assessmentId?.toString() ?? '';
            const studentMap = markIndex.get(assessKey);
            const count = studentMap ? studentMap.size : 0;
            return ls + count;
          }, 0)
      );
    }, 0);

    const completionPercent =
      totalPairs > 0 ? Math.round((capturedPairs / totalPairs) * 100) : 0;

    return {
      structureId: structure._id.toString(),
      structureName: structure.name,
      term: structure.term,
      academicYear: structure.academicYear,
      completionPercent,
      categories: categorySummaries,
      students: studentResults,
    };
  }

  // ── getStudentTermMarks ───────────────────────────────────────────────────────

  static async getStudentTermMarks(
    structureId: string,
    studentId: string,
    tenant: TenantFilter,
  ): Promise<StudentResult | null> {
    const result = await CalculationService.getTermMarks(structureId, tenant);
    return result.students.find((s) => s.studentId === studentId) ?? null;
  }
}
