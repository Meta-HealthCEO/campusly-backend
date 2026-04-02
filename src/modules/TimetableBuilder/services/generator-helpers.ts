import type { ITeacherAvailability, IPeriodsPerDay, DayOfWeek } from '../model.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Slot {
  day: DayOfWeek;
  period: number;
}

export interface PlacementTask {
  classId: string;
  subjectId: string;
  teacherId: string;
  count: number;
  requiresDouble: boolean;
  lineId?: string;
  priority: number;
}

export interface Assignment {
  subjectId: string;
  teacherId: string;
}

export interface GeneratorState {
  teacherSchedule: Map<string, Set<string>>;
  classSchedule: Map<string, Map<string, Assignment>>;
}

export interface PlacedEntry {
  classId: string;
  day: DayOfWeek;
  period: number;
  subjectId: string;
  teacherId: string;
}

// ─── Slot Key ───────────────────────────────────────────────────────────────

export function slotKey(day: string, period: number): string {
  return `${day}:${period}`;
}

// ─── Build Slot Grid ────────────────────────────────────────────────────────

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];

export function buildSlotGrid(periodsPerDay: IPeriodsPerDay): Slot[] {
  const slots: Slot[] = [];
  for (const day of DAYS) {
    const count = periodsPerDay[day] || 7;
    for (let p = 1; p <= count; p++) {
      slots.push({ day, period: p });
    }
  }
  return slots;
}

// ─── Teacher Unavailability Check ───────────────────────────────────────────

export function buildUnavailabilityMap(
  availability: ITeacherAvailability[],
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const rec of availability) {
    const tid = String(rec.teacherId);
    if (!map.has(tid)) map.set(tid, new Set());
    const set = map.get(tid)!;
    for (const u of rec.unavailable) {
      for (const p of u.periods) {
        set.add(slotKey(u.day, p));
      }
    }
  }
  return map;
}

// ─── Constraint Checks ─────────────────────────────────────────────────────

export function isTeacherUnavailable(
  teacherId: string,
  slot: Slot,
  unavailMap: Map<string, Set<string>>,
): boolean {
  return unavailMap.get(teacherId)?.has(slotKey(slot.day, slot.period)) === true;
}

export function isValidPlacement(
  task: PlacementTask,
  slot: Slot,
  state: GeneratorState,
  unavailMap: Map<string, Set<string>>,
): boolean {
  const key = slotKey(slot.day, slot.period);

  // Hard: teacher not double-booked
  if (state.teacherSchedule.get(task.teacherId)?.has(key)) return false;

  // Hard: class not double-booked
  if (state.classSchedule.get(task.classId)?.has(key)) return false;

  // Hard: teacher available
  if (isTeacherUnavailable(task.teacherId, slot, unavailMap)) return false;

  return true;
}

// ─── Scoring ────────────────────────────────────────────────────────────────

export function countTeacherPeriodsOnDay(
  teacherId: string,
  day: string,
  state: GeneratorState,
): number {
  const sched = state.teacherSchedule.get(teacherId);
  if (!sched) return 0;
  let count = 0;
  for (const key of sched) {
    if (key.startsWith(`${day}:`)) count++;
  }
  return count;
}

export function countSubjectOnDay(
  classId: string,
  subjectId: string,
  day: string,
  state: GeneratorState,
): number {
  const classSched = state.classSchedule.get(classId);
  if (!classSched) return 0;
  let count = 0;
  for (const [key, assignment] of classSched) {
    if (key.startsWith(`${day}:`) && assignment.subjectId === subjectId) count++;
  }
  return count;
}

export function hasAdjacentSameSubject(
  classId: string,
  subjectId: string,
  slot: Slot,
  state: GeneratorState,
): boolean {
  const classSched = state.classSchedule.get(classId);
  if (!classSched) return false;

  const prev = classSched.get(slotKey(slot.day, slot.period - 1));
  if (prev?.subjectId === subjectId) return true;

  const next = classSched.get(slotKey(slot.day, slot.period + 1));
  if (next?.subjectId === subjectId) return true;

  return false;
}

export function scorePlacement(
  task: PlacementTask,
  slot: Slot,
  state: GeneratorState,
): number {
  let score = 0;

  // Prefer light teacher days (bonus for fewer periods)
  const teacherDayLoad = countTeacherPeriodsOnDay(task.teacherId, slot.day, state);
  score += Math.max(0, 5 - teacherDayLoad);

  // Big bonus for spreading subjects across different days
  const subjectDayCount = countSubjectOnDay(task.classId, task.subjectId, slot.day, state);
  score += subjectDayCount === 0 ? 10 : 0;

  // Bonus for double period adjacency when needed
  if (task.requiresDouble && hasAdjacentSameSubject(task.classId, task.subjectId, slot, state)) {
    score += 15;
  }

  // Penalty for back-to-back same subject (unless double period wanted)
  if (!task.requiresDouble && hasAdjacentSameSubject(task.classId, task.subjectId, slot, state)) {
    score -= 8;
  }

  return score;
}

// ─── State Mutation ─────────────────────────────────────────────────────────

export function placeInState(
  entry: PlacedEntry,
  state: GeneratorState,
): void {
  const key = slotKey(entry.day, entry.period);

  if (!state.teacherSchedule.has(entry.teacherId)) {
    state.teacherSchedule.set(entry.teacherId, new Set());
  }
  state.teacherSchedule.get(entry.teacherId)!.add(key);

  if (!state.classSchedule.has(entry.classId)) {
    state.classSchedule.set(entry.classId, new Map());
  }
  state.classSchedule.get(entry.classId)!.set(key, {
    subjectId: entry.subjectId,
    teacherId: entry.teacherId,
  });
}

export function removeFromState(
  entry: PlacedEntry,
  state: GeneratorState,
): void {
  const key = slotKey(entry.day, entry.period);
  state.teacherSchedule.get(entry.teacherId)?.delete(key);
  state.classSchedule.get(entry.classId)?.delete(key);
}

// ─── Score Calculation ──────────────────────────────────────────────────────

export interface ScoreDetail {
  constraint: string;
  score: number;
}

export function calculateScore(
  placements: PlacedEntry[],
  state: GeneratorState,
  tasks: PlacementTask[],
): ScoreDetail[] {
  let spreadScore = 0;
  let balanceScore = 0;
  let completenessScore = 0;

  // Subject spread: count unique days per class+subject
  const classSubjectDays = new Map<string, Set<string>>();
  for (const p of placements) {
    const key = `${p.classId}:${p.subjectId}`;
    if (!classSubjectDays.has(key)) classSubjectDays.set(key, new Set());
    classSubjectDays.get(key)!.add(p.day);
  }
  for (const [, days] of classSubjectDays) {
    spreadScore += days.size * 2;
  }

  // Teacher balance: penalty for teacher-day combos with >4 periods
  for (const [, sched] of state.teacherSchedule) {
    const dayCounts = new Map<string, number>();
    for (const key of sched) {
      const day = key.split(':')[0];
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
    for (const [, count] of dayCounts) {
      if (count <= 4) balanceScore += 5;
      else balanceScore -= (count - 4) * 3;
    }
  }

  // Completeness: how many tasks are fully placed
  const taskCounts = new Map<string, number>();
  for (const p of placements) {
    const key = `${p.classId}:${p.subjectId}`;
    taskCounts.set(key, (taskCounts.get(key) ?? 0) + 1);
  }
  for (const task of tasks) {
    const key = `${task.classId}:${task.subjectId}`;
    const placed = taskCounts.get(key) ?? 0;
    if (placed >= task.count) completenessScore += 10;
    else completenessScore += Math.floor((placed / task.count) * 5);
  }

  return [
    { constraint: 'subject_spread', score: spreadScore },
    { constraint: 'teacher_balance', score: balanceScore },
    { constraint: 'completeness', score: completenessScore },
  ];
}
