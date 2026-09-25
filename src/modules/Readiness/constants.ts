// src/modules/Readiness/constants.ts
//
// Every number of the readiness model and the path (spec §3–§4, decided §12). The one place they live.
import type { SourceType } from './types.js';

export const DECAY_HALF_LIFE_DAYS = 56;
export const DECAY_FLOOR = 0.2;
export const SOURCE_WEIGHT: Readonly<Record<SourceType, number>> = { test: 1, homework: 0.7, unit_check: 0.6, practice: 0.6, library: 0.5 };
export const AI_TAG_WEIGHT = 0.8;
export const OVERRIDE_WEIGHT = 0.5;

export const TESTED_MIN_ANSWERS = 3;
export const TESTED_MIN_MARKS = 6;
export const EXAM_DAY_SPREAD = 0.05;
export const UNTESTED_SPREAD = 0.25;
export const MASTERY_CLAMP_LOW = 0.1;
export const MASTERY_CLAMP_HIGH = 0.9;

export const LEVEL_SHRINK = 6;
export const LEVEL_CAP = 0.1;
export const LEVEL_MIN_KNOWN_ANSWERS = 10;
export const LEVEL_THIN_EFFECTIVE = 3;
export const LEVEL_UNKNOWN_SPREAD = 0.15;

export const GATE_MIN_ANSWERS = 20;
export const GATE_MIN_TESTED_SHARE = 0.5;
export const NSC_BOUNDARIES = [30, 40, 50, 60, 70, 80] as const;
/** Mirrors the frontend's MASTERY_THRESHOLDS (src/lib/readiness/mastery.ts). */
export const MASTERY_SECURE = 70;
export const MASTERY_BUILDING = 60;
export const MIN_CONFIDENCE = 0.6;
export const RECENT_DAYS = 56;

export const PATH_ITEMS_PER_WEEK = 3;
export const PATH_DONE_ANSWERS = 4;
export const MISCONCEPTION_WINDOW_DAYS = 21;
export const MISCONCEPTION_BOOST_REPEATED = 1.5;
export const MISCONCEPTION_BOOST_ONCE = 1.25;
export const PROXIMITY_WINDOW_DAYS = 56;
export const PROXIMITY_MAX_BOOST = 0.5;
export const ALL_DUE_WINDOW_DAYS = 84;
export const PRACTICE_QUESTIONS = 5;

export const RECOMPUTE_DELAY_MS = 120_000;
export const RECOMPUTE_CONCURRENCY = 5;
export const HISTORY_WEEKS = 12;
export const NIGHTLY_EVIDENCE_DAYS = 180;
export const NIGHTLY_VIEWED_DAYS = 30;
export const CLASS_GROUP_WINDOW_DAYS = 42;
export const CLASS_GROUPS_MAX = 5;
export const PIN_MAX_LEARNERS = 60;
