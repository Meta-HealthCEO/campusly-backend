import { TimetableConfig, TeacherAvailability, SubjectRequirement, SubjectLine } from '../model.js';
import type { IResultSlot, IWarning, DayOfWeek } from '../model.js';
import { Class } from '../../Academic/model.js';
import { Subject } from '../../Academic/model.js';
import { User } from '../../Auth/model.js';
import {
  buildSlotGrid,
  buildUnavailabilityMap,
  isValidPlacement,
  scorePlacement,
  placeInState,
  removeFromState,
  slotKey,
  calculateScore,
} from './generator-helpers.js';
import type {
  Slot,
  PlacementTask,
  GeneratorState,
  PlacedEntry,
  ScoreDetail,
} from './generator-helpers.js';

const MAX_BACKTRACKS = 1000;

export interface GenerationResult {
  result: IResultSlot[];
  score: { total: number; details: ScoreDetail[] };
  warnings: IWarning[];
}

export class TimetableGeneratorService {
  static async generate(
    schoolId: string,
    gradeId: string | null,
    lockedSlots: Array<{ classId: string; day: DayOfWeek; period: number; subjectId: string; teacherId: string }>,
  ): Promise<GenerationResult> {
    // 1. SETUP — Load all data
    const config = await TimetableConfig.findOne({ schoolId, isDeleted: false }).lean();
    if (!config) {
      return { result: [], score: { total: 0, details: [] }, warnings: [{ type: 'error', message: 'No timetable config found. Please configure periods first.' }] };
    }

    const gradeFilter = gradeId ? { gradeId } : {};
    const [classes, requirements, availability, subjects, teachers, lines] = await Promise.all([
      Class.find({ schoolId, isDeleted: false, ...gradeFilter }).lean(),
      SubjectRequirement.find({ schoolId, isDeleted: false, ...gradeFilter }).lean(),
      TeacherAvailability.find({ schoolId, isDeleted: false }).lean(),
      Subject.find({ schoolId, isDeleted: false }).lean(),
      User.find({ schoolId, role: 'teacher', isActive: true, isDeleted: false }).lean(),
      SubjectLine.find({ schoolId, isDeleted: false, ...gradeFilter }).lean(),
    ]);

    const warnings: IWarning[] = [];

    if (classes.length === 0) {
      return { result: [], score: { total: 0, details: [] }, warnings: [{ type: 'error', message: 'No classes found for the selected grade(s).' }] };
    }

    if (requirements.length === 0) {
      return { result: [], score: { total: 0, details: [] }, warnings: [{ type: 'error', message: 'No subject requirements configured.' }] };
    }

    // 2. Build slot grid and maps
    const slots = buildSlotGrid(config.periodsPerDay);
    const unavailMap = buildUnavailabilityMap(availability);
    const teacherMap = new Map(teachers.map((t) => [String(t._id), t]));
    const subjectMap = new Map(subjects.map((s) => [String(s._id), s]));

    // Build line lookup: subjectId+gradeId → lineId
    const lineMap = new Map<string, string>();
    for (const line of lines) {
      for (const sid of line.subjectIds) {
        lineMap.set(`${String(sid)}:${String(line.gradeId)}`, String(line._id));
      }
    }

    // 3. Build placement tasks
    const tasks: PlacementTask[] = [];
    for (const req of requirements) {
      const reqSubjectId = String(req.subjectId);
      const reqGradeId = String(req.gradeId);
      const classesForGrade = classes.filter((c) => String(c.gradeId) === reqGradeId);

      if (classesForGrade.length === 0) continue;

      // Determine teacher: preferred or class teacher or first available
      let teacherId = req.preferredTeacherId ? String(req.preferredTeacherId) : '';
      if (!teacherId || !teacherMap.has(teacherId)) {
        // Fall back to first available teacher
        const fallback = teachers[0];
        if (!fallback) {
          warnings.push({ type: 'warning', message: `No teacher available for subject ${subjectMap.get(reqSubjectId)?.name ?? reqSubjectId}` });
          continue;
        }
        teacherId = String(fallback._id);
      }

      const lineId = lineMap.get(`${reqSubjectId}:${reqGradeId}`);

      // Priority: lines=100, double=50, few teachers=25, rest=0
      let priority = 0;
      if (lineId) priority += 100;
      if (req.requiresDoublePeriod) priority += 50;
      if (req.preferredTeacherId) priority += 25;

      for (const cls of classesForGrade) {
        tasks.push({
          classId: String(cls._id),
          subjectId: reqSubjectId,
          teacherId,
          count: req.periodsPerWeek,
          requiresDouble: req.requiresDoublePeriod,
          lineId,
          priority,
        });
      }
    }

    // Sort hardest first (deterministic: by priority desc, then classId, then subjectId)
    tasks.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (a.classId !== b.classId) return a.classId.localeCompare(b.classId);
      return a.subjectId.localeCompare(b.subjectId);
    });

    // 4. Initialize state
    const state: GeneratorState = {
      teacherSchedule: new Map(),
      classSchedule: new Map(),
    };

    const placements: PlacedEntry[] = [];

    // Place locked slots first
    for (const locked of lockedSlots) {
      const entry: PlacedEntry = {
        classId: locked.classId,
        day: locked.day,
        period: locked.period,
        subjectId: locked.subjectId,
        teacherId: locked.teacherId,
      };
      placeInState(entry, state);
      placements.push(entry);
    }

    // 5. Greedy placement with backtracking
    let backtracks = 0;

    for (const task of tasks) {
      const periodsToPlace = task.requiresDouble
        ? Math.floor(task.count / 2) * 2 + (task.count % 2)
        : task.count;

      let placed = 0;
      const triedSlots = new Set<string>();

      while (placed < periodsToPlace && backtracks < MAX_BACKTRACKS) {
        // Handle double periods
        if (task.requiresDouble && placed + 2 <= periodsToPlace) {
          const doublePlaced = TimetableGeneratorService.placeDouble(
            task, slots, state, unavailMap, triedSlots, placements, lockedSlots.length,
          );
          if (doublePlaced) {
            placed += 2;
            continue;
          }
        }

        // Single period placement
        const candidates = TimetableGeneratorService.findCandidates(
          task, slots, state, unavailMap, triedSlots,
        );

        if (candidates.length === 0) {
          // Backtrack: undo last non-locked placement
          const lastPlacement = TimetableGeneratorService.backtrackOne(
            placements, state, lockedSlots.length,
          );
          if (!lastPlacement) break;
          triedSlots.add(slotKey(lastPlacement.day, lastPlacement.period));
          backtracks++;
          continue;
        }

        // Pick best candidate
        const best = candidates[0];
        const entry: PlacedEntry = {
          classId: task.classId,
          day: best.slot.day,
          period: best.slot.period,
          subjectId: task.subjectId,
          teacherId: task.teacherId,
        };
        placeInState(entry, state);
        placements.push(entry);
        triedSlots.add(slotKey(best.slot.day, best.slot.period));
        placed++;
      }

      if (placed < periodsToPlace) {
        const subName = subjectMap.get(task.subjectId)?.name ?? task.subjectId;
        warnings.push({
          type: 'warning',
          message: `Could only place ${placed}/${periodsToPlace} periods for ${subName} in class ${task.classId}`,
        });
      }
    }

    // 6. Build result
    const result: IResultSlot[] = placements.map((p) => ({
      classId: p.classId as unknown as import('mongoose').Types.ObjectId,
      day: p.day,
      period: p.period,
      subjectId: p.subjectId as unknown as import('mongoose').Types.ObjectId,
      teacherId: p.teacherId as unknown as import('mongoose').Types.ObjectId,
    }));

    // 7. Calculate score
    const scoreDetails = calculateScore(placements, state, tasks);
    const totalScore = scoreDetails.reduce((sum, d) => sum + d.score, 0);

    if (backtracks >= MAX_BACKTRACKS) {
      warnings.push({ type: 'warning', message: `Hit max backtracks (${MAX_BACKTRACKS}). Result may be partial.` });
    }

    return {
      result,
      score: { total: totalScore, details: scoreDetails },
      warnings,
    };
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private static findCandidates(
    task: PlacementTask,
    slots: Slot[],
    state: GeneratorState,
    unavailMap: Map<string, Set<string>>,
    triedSlots: Set<string>,
  ): Array<{ slot: Slot; score: number }> {
    const candidates: Array<{ slot: Slot; score: number }> = [];

    for (const slot of slots) {
      const key = slotKey(slot.day, slot.period);
      if (triedSlots.has(key)) continue;
      if (!isValidPlacement(task, slot, state, unavailMap)) continue;

      candidates.push({ slot, score: scorePlacement(task, slot, state) });
    }

    // Sort by score descending, then deterministic tie-break
    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.slot.day !== b.slot.day) return a.slot.day.localeCompare(b.slot.day);
      return a.slot.period - b.slot.period;
    });

    return candidates;
  }

  private static placeDouble(
    task: PlacementTask,
    slots: Slot[],
    state: GeneratorState,
    unavailMap: Map<string, Set<string>>,
    triedSlots: Set<string>,
    placements: PlacedEntry[],
    lockedCount: number,
  ): boolean {
    // Find consecutive slot pairs
    const pairs: Array<{ s1: Slot; s2: Slot; score: number }> = [];

    for (let i = 0; i < slots.length - 1; i++) {
      const s1 = slots[i];
      const s2 = slots[i + 1];
      if (s1.day !== s2.day || s2.period !== s1.period + 1) continue;

      const k1 = slotKey(s1.day, s1.period);
      const k2 = slotKey(s2.day, s2.period);
      if (triedSlots.has(k1) || triedSlots.has(k2)) continue;

      if (!isValidPlacement(task, s1, state, unavailMap)) continue;
      if (!isValidPlacement(task, s2, state, unavailMap)) continue;

      const score = scorePlacement(task, s1, state) + scorePlacement(task, s2, state) + 15;
      pairs.push({ s1, s2, score });
    }

    pairs.sort((a, b) => b.score - a.score);

    if (pairs.length === 0) return false;

    const best = pairs[0];
    const e1: PlacedEntry = { classId: task.classId, day: best.s1.day, period: best.s1.period, subjectId: task.subjectId, teacherId: task.teacherId };
    const e2: PlacedEntry = { classId: task.classId, day: best.s2.day, period: best.s2.period, subjectId: task.subjectId, teacherId: task.teacherId };

    placeInState(e1, state);
    placeInState(e2, state);
    placements.push(e1, e2);

    triedSlots.add(slotKey(best.s1.day, best.s1.period));
    triedSlots.add(slotKey(best.s2.day, best.s2.period));

    return true;
  }

  private static backtrackOne(
    placements: PlacedEntry[],
    state: GeneratorState,
    lockedCount: number,
  ): PlacedEntry | null {
    if (placements.length <= lockedCount) return null;
    const entry = placements.pop()!;
    removeFromState(entry, state);
    return entry;
  }

}
