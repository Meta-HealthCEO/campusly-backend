// src/modules/Readiness/engine/sast.ts
//
// South African calendar days and weeks (UTC+2, no daylight saving), pure (ruling RP5).
const SAST_MS = 2 * 3600_000;
export const DAY_MS = 86_400_000;

export function sastDay(d: Date): string {
  return new Date(d.getTime() + SAST_MS).toISOString().slice(0, 10);
}

/** The SAST Monday of the week, YYYY-MM-DD. */
export function sastWeekStart(d: Date): string {
  const local = new Date(d.getTime() + SAST_MS);
  const back = (local.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - back)).toISOString().slice(0, 10);
}

export function sastYear(d: Date): number {
  return Number(sastDay(d).slice(0, 4));
}

export function sastMonth(d: Date): number {
  return Number(sastDay(d).slice(5, 7));
}

/** The instant a SAST day starts. */
export function sastDayStart(day: string): Date {
  return new Date(Date.parse(`${day}T00:00:00Z`) - SAST_MS);
}

/** Whole SAST days from today to `day`; negative once it has passed. */
export function daysUntilDay(day: string, now: Date): number {
  return Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${sastDay(now)}T00:00:00Z`)) / DAY_MS);
}
