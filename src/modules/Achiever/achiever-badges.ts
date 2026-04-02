// ─── Badge Definitions & XP/Level Configuration ────────────────────────────

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'academic' | 'attendance' | 'sport' | 'behaviour' | 'social' | 'special';
  criteria: string;
  xpReward: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first_merit', name: 'First Steps', description: 'Earn your first merit', icon: '⭐', category: 'behaviour', criteria: 'Earn 1 merit point', xpReward: 10 },
  { id: 'perfect_week', name: 'Perfect Week', description: '5 days present in a row', icon: '🔥', category: 'attendance', criteria: '5 consecutive present days', xpReward: 25 },
  { id: 'bookworm', name: 'Bookworm', description: 'Borrow 5 library books', icon: '📚', category: 'academic', criteria: 'Borrow 5+ books', xpReward: 20 },
  { id: 'homework_hero', name: 'Homework Hero', description: 'Submit 10 homework on time', icon: '📝', category: 'academic', criteria: '10 on-time submissions', xpReward: 30 },
  { id: 'century', name: 'Century Maker', description: 'Score 100% on any assessment', icon: '💯', category: 'academic', criteria: '100% on assessment', xpReward: 50 },
  { id: 'sports_star', name: 'Sports Star', description: 'Man of the match 3 times', icon: '🏆', category: 'sport', criteria: '3 MOM awards', xpReward: 40 },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day activity streak', icon: '🔥', category: 'special', criteria: '7-day streak', xpReward: 35 },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day activity streak', icon: '💎', category: 'special', criteria: '30-day streak', xpReward: 100 },
  { id: 'top_achiever', name: 'Top Achiever', description: 'Highest merit points in class', icon: '👑', category: 'behaviour', criteria: 'Top merit earner', xpReward: 50 },
  { id: 'helpful_hand', name: 'Helpful Hand', description: 'Earn 5 service merits', icon: '🤝', category: 'social', criteria: '5 service merits', xpReward: 30 },
];

/** XP thresholds per level (index 0 = level 1, index 1 = level 2, etc.) */
export const LEVEL_THRESHOLDS = [0, 50, 120, 200, 300, 420, 560, 720, 900, 1100, 1320];

/** Calculate the level for a given XP amount. */
export function getLevelForXP(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

/** Get XP required for the next level. Returns null if at max level. */
export function getXPForNextLevel(currentXP: number): number | null {
  const level = getLevelForXP(currentXP);
  if (level >= LEVEL_THRESHOLDS.length) return null;
  return LEVEL_THRESHOLDS[level];
}

/** Look up a badge definition by id. */
export function getBadgeById(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
}
