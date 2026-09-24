/**
 * Pure planning for the teacher demo seed: which class is taught when, and
 * the dates the demo data hangs off. No database access here, so it can be
 * unit tested and the seed stays idempotent (same plan every run).
 */

export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

/** The school's period times for the demo, so the timetable page can draw the week. */
export function demoPeriodConfig(): {
  periodsPerDay: Record<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday', number>;
  periodTimes: Array<{ period: number; startTime: string; endTime: string }>;
  breakSlots: Array<{ afterPeriod: number; duration: number; label: string }>;
} {
  const n = DEMO_PERIODS.length;
  return {
    periodsPerDay: { monday: n, tuesday: n, wednesday: n, thursday: n, friday: n },
    periodTimes: DEMO_PERIODS.map((p) => ({ ...p })),
    breakSlots: [{ afterPeriod: 3, duration: 30, label: 'Break' }],
  };
}
export type Weekday = (typeof WEEKDAYS)[number];

/** A South African primary school morning: register period first, break after period 3. */
export const DEMO_PERIODS = [
  { period: 1, startTime: '07:45', endTime: '08:30' },
  { period: 2, startTime: '08:30', endTime: '09:15' },
  { period: 3, startTime: '09:15', endTime: '10:00' },
  { period: 4, startTime: '10:30', endTime: '11:15' },
  { period: 5, startTime: '11:15', endTime: '12:00' },
] as const;

export interface TeachingPair<Id = string> {
  classId: Id;
  subjectId: Id;
  /** The teacher's register class: taught first thing every day. */
  homeroom: boolean;
}

export interface PlannedSlot<Id = string> {
  day: Weekday;
  period: number;
  startTime: string;
  endTime: string;
  classId: Id;
  subjectId: Id;
}

export function planWeek<Id>(pairs: TeachingPair<Id>[]): PlannedSlot<Id>[] {
  if (pairs.length === 0) return [];
  const homeroom = pairs.filter((p) => p.homeroom);
  const firstPeriodPairs = homeroom.length > 0 ? homeroom : pairs;
  const slots: PlannedSlot<Id>[] = [];
  WEEKDAYS.forEach((day, dayIndex) => {
    for (const { period, startTime, endTime } of DEMO_PERIODS) {
      const pair = period === 1
        ? firstPeriodPairs[dayIndex % firstPeriodPairs.length]
        : pairs[(dayIndex * (DEMO_PERIODS.length - 1) + (period - 2)) % pairs.length];
      slots.push({ day, period, startTime, endTime, classId: pair.classId, subjectId: pair.subjectId });
    }
  });
  return slots;
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

export interface DemoDates {
  /** Local midnight today. */
  today: Date;
  /** Attendance stores the register day as UTC midnight of the local date. */
  registerDate: Date;
  weekday: Weekday | null;
  dueToday: Date;
  overdue: Date;
  dueSoon: Date;
  atPeriod: (day: Date, period: number) => Date;
}

export function demoDates(now: Date): DemoDates {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const addDays = (d: Date, n: number, hour = 14): Date => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, hour, 0);
  const name = DAY_NAMES[now.getDay()];
  return {
    today,
    registerDate: new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())),
    weekday: (WEEKDAYS as readonly string[]).includes(name) ? (name as Weekday) : null,
    dueToday: addDays(today, 0),
    overdue: addDays(today, -2),
    dueSoon: addDays(today, 3),
    atPeriod: (day: Date, period: number): Date => {
      const slot = DEMO_PERIODS.find((p) => p.period === period) ?? DEMO_PERIODS[0];
      const [h, m] = slot.startTime.split(':').map(Number);
      return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);
    },
  };
}
