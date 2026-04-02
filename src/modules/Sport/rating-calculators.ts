// ─── Rating Calculation Utilities ─────────────────────────────────────────────
// Extracted from service-stats.ts to stay under 350 lines per file.

import type { SportCodeConfig } from './sport-configs.js';

export function clamp99(val: number): number {
  return Math.max(0, Math.min(99, Math.round(val)));
}

export function getTier(overall: number): 'bronze' | 'silver' | 'gold' | 'elite' {
  if (overall >= 85) return 'elite';
  if (overall >= 70) return 'gold';
  if (overall >= 50) return 'silver';
  return 'bronze';
}

export function calculateOverall(attributes: Record<string, number>): number {
  const vals = Object.values(attributes);
  if (vals.length === 0) return 0;
  const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
  return clamp99(avg);
}

export function calculateAttributes(
  config: SportCodeConfig,
  aggregated: Record<string, number>,
  appearances: number,
): Record<string, number> {
  if (appearances === 0) {
    const attrs: Record<string, number> = {};
    for (const attr of config.ratingAttributes) {
      attrs[attr] = 0;
    }
    return attrs;
  }

  const calculator = RATING_CALCULATORS[config.code];
  if (calculator) {
    return calculator(config.ratingAttributes, aggregated, appearances);
  }

  return defaultAttributeCalc(config.ratingAttributes, aggregated, appearances);
}

function defaultAttributeCalc(
  ratingAttributes: string[],
  aggregated: Record<string, number>,
  appearances: number,
): Record<string, number> {
  const attrs: Record<string, number> = {};
  const values = Object.values(aggregated);
  const total = values.reduce((sum, v) => sum + v, 0);
  const avgContribution = appearances > 0 ? total / appearances : 0;
  const base = clamp99(Math.min(avgContribution * 2, 80));

  for (const attr of ratingAttributes) {
    attrs[attr] = base;
  }
  return attrs;
}

// ─── Sport-Specific Rating Calculators ──────────────────────────────────────

type RatingCalcFn = (
  attrs: string[],
  agg: Record<string, number>,
  appearances: number,
) => Record<string, number>;

const RATING_CALCULATORS: Record<string, RatingCalcFn> = {
  cricket: (attrs, agg, appearances) => {
    const runs = agg.runs ?? 0;
    const wickets = agg.wickets ?? 0;
    const catches = agg.catches ?? 0;
    const runOuts = agg.runOuts ?? 0;
    const stumpings = agg.stumpings ?? 0;
    const avgRuns = appearances > 0 ? runs / appearances : 0;
    const ballsFaced = agg.ballsFaced ?? 0;
    const strikeRate = ballsFaced > 0 ? (runs / ballsFaced) * 100 : 0;

    return {
      [attrs[0]]: clamp99(avgRuns * 2),                          // Batting
      [attrs[1]]: clamp99((wickets / Math.max(appearances, 1)) * 20), // Bowling
      [attrs[2]]: clamp99((catches + runOuts + stumpings) * 8),  // Fielding
      [attrs[3]]: clamp99(Math.min(appearances * 5, 80)),        // Fitness
      [attrs[4]]: clamp99(Math.min(strikeRate * 0.5, 80)),       // Consistency
      [attrs[5]]: clamp99(avgRuns * 1.5 + wickets * 3),          // Impact
    };
  },

  rugby: (attrs, agg, appearances) => {
    const tries = agg.tries ?? 0;
    const metres = agg.metresGained ?? 0;
    const tackles = agg.tackles ?? 0;
    const missed = agg.tacklesMissed ?? 0;
    const conversions = agg.conversions ?? 0;
    const penalties = agg.penalties ?? 0;
    const tackleRate = tackles + missed > 0 ? (tackles / (tackles + missed)) * 100 : 0;

    return {
      [attrs[0]]: clamp99(tries * 10 + metres * 0.2),            // Attack
      [attrs[1]]: clamp99(tackleRate * 0.8),                      // Defence
      [attrs[2]]: clamp99((conversions + penalties) * 8),         // Kicking
      [attrs[3]]: clamp99(Math.min(appearances * 5, 80)),         // Strength
      [attrs[4]]: clamp99(metres / Math.max(appearances, 1) * 2),// Speed
      [attrs[5]]: clamp99((tries + tackles * 0.5) / Math.max(appearances, 1) * 10), // Game Sense
    };
  },

  soccer: (attrs, agg, appearances) => {
    const goals = agg.goals ?? 0;
    const assists = agg.assists ?? 0;

    return {
      [attrs[0]]: clamp99(Math.min(appearances * 6, 85)),                  // Pace
      [attrs[1]]: clamp99(goals / Math.max(appearances, 1) * 40),         // Shooting
      [attrs[2]]: clamp99(assists / Math.max(appearances, 1) * 40),       // Passing
      [attrs[3]]: clamp99((goals + assists) / Math.max(appearances, 1) * 20), // Dribbling
      [attrs[4]]: clamp99(Math.min(appearances * 5, 75)),                  // Defence
      [attrs[5]]: clamp99(Math.min(appearances * 5, 80)),                  // Physical
    };
  },

  hockey: (attrs, agg, appearances) => {
    const goals = agg.goals ?? 0;
    const assists = agg.assists ?? 0;
    const saves = agg.saves ?? 0;
    const penaltyCorners = agg.penaltyCorners ?? 0;

    return {
      [attrs[0]]: clamp99((goals + assists) / Math.max(appearances, 1) * 20), // Attack
      [attrs[1]]: clamp99(saves * 5 + Math.min(appearances * 3, 50)),         // Defence
      [attrs[2]]: clamp99((goals + assists + penaltyCorners) * 5),            // Skill
      [attrs[3]]: clamp99(Math.min(appearances * 5, 80)),                     // Speed
      [attrs[4]]: clamp99(Math.min(appearances * 5, 80)),                     // Fitness
      [attrs[5]]: clamp99(assists / Math.max(appearances, 1) * 30),           // Vision
    };
  },

  netball: (attrs, agg, appearances) => {
    const goals = agg.goals ?? 0;
    const attempts = agg.goalAttempts ?? 0;
    const interceptions = agg.interceptions ?? 0;
    const accuracy = attempts > 0 ? (goals / attempts) * 100 : 0;

    return {
      [attrs[0]]: clamp99(accuracy * 0.8),                                 // Shooting
      [attrs[1]]: clamp99(Math.min(appearances * 5, 75)),                  // Passing
      [attrs[2]]: clamp99(interceptions / Math.max(appearances, 1) * 25),  // Defence
      [attrs[3]]: clamp99(Math.min(appearances * 5, 80)),                  // Movement
      [attrs[4]]: clamp99(Math.min(appearances * 5, 80)),                  // Fitness
      [attrs[5]]: clamp99((goals + interceptions) / Math.max(appearances, 1) * 10), // Game Sense
    };
  },

  tennis: (attrs, agg, appearances) => {
    const aces = agg.aces ?? 0;
    const doubleFaults = agg.doubleFaults ?? 0;
    const winners = agg.winners ?? 0;
    const unforcedErrors = agg.unforcedErrors ?? 0;
    const firstServe = agg.firstServePercent ?? 0;
    const setsWon = agg.setsWon ?? 0;

    return {
      [attrs[0]]: clamp99(aces / Math.max(appearances, 1) * 15),          // Serve
      [attrs[1]]: clamp99(winners / Math.max(appearances, 1) * 10),       // Return
      [attrs[2]]: clamp99(Math.min(firstServe * 0.8, 80)),                // Forehand
      [attrs[3]]: clamp99(Math.max(0, 70 - unforcedErrors)),              // Backhand
      [attrs[4]]: clamp99(Math.min(appearances * 5, 80)),                 // Fitness
      [attrs[5]]: clamp99(setsWon / Math.max(appearances, 1) * 20),      // Mental
    };
  },
};
