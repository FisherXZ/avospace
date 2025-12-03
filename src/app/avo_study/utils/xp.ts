/**
 * XP System Utilities
 * Handles XP calculation, tier progression, and coin conversion
 */

import { Tier, TierLevel } from '@/types/study';

/**
 * XP-based tier definitions (updated from hours to XP)
 */
export const XP_TIERS: Tier[] = [
  {
    level: 'seedling',
    name: 'Seedling',
    minXP: 0,
    maxXP: 600,
    icon: 'Sprout',
    color: '#9CB99C',      // Light sage
    bgColor: '#F0F5F0',
    podiumHeight: 50,
  },
  {
    level: 'studier',
    name: 'Studier',
    minXP: 600,
    maxXP: 1500,
    icon: 'BookOpen',
    color: '#7A9A7A',      // Sage green
    bgColor: '#EBF2EB',
    podiumHeight: 80,
  },
  {
    level: 'scholar',
    name: 'Scholar',
    minXP: 1500,
    maxXP: 3000,
    icon: 'Scroll',
    color: '#4A6B4A',      // Forest green
    bgColor: '#E5EDE5',
    podiumHeight: 120,
  },
  {
    level: 'grinder',
    name: 'Grinder',
    minXP: 3000,
    maxXP: 6000,
    icon: 'Flame',
    color: '#E85D04',      // Fiery orange
    bgColor: '#FFF3E6',
    podiumHeight: 170,
  },
  {
    level: 'master',
    name: 'Master',
    minXP: 6000,
    maxXP: 12000,
    icon: 'Star',
    color: '#7B2CBF',      // Royal purple
    bgColor: '#F3E8FF',
    podiumHeight: 230,
  },
  {
    level: 'legend',
    name: 'Legend',
    minXP: 12000,
    maxXP: Infinity,
    icon: 'Crown',
    color: '#D4AF37',      // Gold
    bgColor: '#FDF8E8',
    podiumHeight: 300,
  },
];

/**
 * Calculate XP earned from a study session
 */
export function calculateSessionXP(params: {
  durationMinutes: number;
  hasStatusNote?: boolean;
  isCoStudy?: boolean;
  isFirstSessionToday?: boolean;
  dailyXPSoFar?: number;
}): {
  baseXP: number;
  bonuses: { type: string; xp: number }[];
  totalXP: number;
} {
  const {
    durationMinutes,
    hasStatusNote = false,
    isCoStudy = false,
    isFirstSessionToday = false,
    dailyXPSoFar = 0,
  } = params;

  // Base XP: 10 XP per 25-minute block
  const blocks = Math.floor(durationMinutes / 25);
  let baseXP = blocks * 10;

  const bonuses: { type: string; xp: number }[] = [];

  // Bonus: Status note
  if (hasStatusNote) {
    bonuses.push({ type: 'Status Note', xp: 5 });
  }

  // Bonus: Co-study
  if (isCoStudy) {
    bonuses.push({ type: 'Co-Study', xp: 5 });
  }

  // Bonus: First session of the day
  if (isFirstSessionToday) {
    bonuses.push({ type: 'First Session Today', xp: 10 });
  }

  // Calculate total before soft cap
  const bonusXP = bonuses.reduce((sum, b) => sum + b.xp, 0);
  let totalXP = baseXP + bonusXP;

  // Apply daily soft cap (after 300 XP/day, 50% rate)
  const softCapThreshold = 300;
  if (dailyXPSoFar + totalXP > softCapThreshold) {
    const xpBeforeCap = Math.max(0, softCapThreshold - dailyXPSoFar);
    const xpAfterCap = Math.max(0, (dailyXPSoFar + totalXP) - softCapThreshold);
    const reducedXP = xpAfterCap * 0.5;
    
    totalXP = xpBeforeCap + reducedXP;
    
    if (xpAfterCap > 0) {
      bonuses.push({ 
        type: 'Soft Cap Applied', 
        xp: -(xpAfterCap - reducedXP) 
      });
    }
  }

  return {
    baseXP,
    bonuses,
    totalXP: Math.floor(totalXP),
  };
}

/**
 * Get tier for a given XP amount
 */
export function getTierByXP(xp: number): Tier {
  for (let i = XP_TIERS.length - 1; i >= 0; i--) {
    if (xp >= XP_TIERS[i].minXP) {
      return XP_TIERS[i];
    }
  }
  return XP_TIERS[0]; // Default to Seedling
}

/**
 * Get tier by level name
 */
export function getTierByLevel(level: TierLevel): Tier {
  return XP_TIERS.find(t => t.level === level) || XP_TIERS[0];
}

/**
 * Get the next tier after the current one
 */
export function getNextTier(currentTier: Tier): Tier | null {
  const currentIndex = XP_TIERS.findIndex(t => t.level === currentTier.level);
  if (currentIndex === -1 || currentIndex >= XP_TIERS.length - 1) {
    return null;
  }
  return XP_TIERS[currentIndex + 1];
}

/**
 * Calculate progress percentage to next tier
 */
export function getTierProgress(xp: number): number {
  const currentTier = getTierByXP(xp);
  const nextTier = getNextTier(currentTier);
  
  if (!nextTier) {
    return 100; // Already at Legend
  }
  
  const tierRange = nextTier.minXP - currentTier.minXP;
  const userProgress = xp - currentTier.minXP;
  
  return Math.min(100, Math.max(0, (userProgress / tierRange) * 100));
}

/**
 * Get XP remaining until next tier
 */
export function getXPToNextTier(xp: number): number {
  const currentTier = getTierByXP(xp);
  const nextTier = getNextTier(currentTier);
  
  if (!nextTier) {
    return 0;
  }
  
  return Math.max(0, nextTier.minXP - xp);
}

/**
 * Convert XP to AvoCoins (5 XP = 1 coin)
 */
export function xpToCoins(xp: number): number {
  return Math.floor(xp / 5);
}

/**
 * Get tier display with progress information
 */
export function getTierDisplay(xp: number): {
  tier: Tier;
  nextTier: Tier | null;
  progress: number;
  xpToNext: number;
  coins: number;
} {
  const tier = getTierByXP(xp);
  const nextTier = getNextTier(tier);
  const progress = getTierProgress(xp);
  const xpToNext = getXPToNextTier(xp);
  const coins = xpToCoins(xp);
  
  return { tier, nextTier, progress, xpToNext, coins };
}

/**
 * Migrate hours to XP (for existing users)
 * Formula: 1 hour = 60 XP (equivalent to ~2.5 Pomodoro blocks)
 */
export function hoursToXP(hours: number): number {
  return Math.floor(hours * 60);
}

