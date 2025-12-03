/**
 * Rank Tier System
 * Users earn tiers based on total study hours
 */

import { Tier, TierLevel } from '@/types/study';

/**
 * All tier definitions ordered by progression
 */
export const TIERS: Tier[] = [
  {
    level: 'seedling',
    name: 'Seedling',
    minHours: 0,
    maxHours: 10,
    icon: 'Sprout',
    color: '#9CB99C',      // Light sage
    bgColor: '#F0F5F0',
  },
  {
    level: 'studier',
    name: 'Studier',
    minHours: 10,
    maxHours: 25,
    icon: 'BookOpen',
    color: '#7A9A7A',      // Sage green
    bgColor: '#EBF2EB',
  },
  {
    level: 'scholar',
    name: 'Scholar',
    minHours: 25,
    maxHours: 50,
    icon: 'Scroll',
    color: '#4A6B4A',      // Forest green
    bgColor: '#E5EDE5',
  },
  {
    level: 'grinder',
    name: 'Grinder',
    minHours: 50,
    maxHours: 100,
    icon: 'Flame',
    color: '#3D583D',      // Deep forest
    bgColor: '#E0E8E0',
  },
  {
    level: 'master',
    name: 'Master',
    minHours: 100,
    maxHours: 200,
    icon: 'Star',
    color: '#2D4A2D',      // Emerald
    bgColor: '#D8E3D8',
  },
  {
    level: 'legend',
    name: 'Legend',
    minHours: 200,
    maxHours: Infinity,
    icon: 'Crown',
    color: '#D4AF37',      // Gold accent
    bgColor: '#FDF8E8',
  },
];

/**
 * Get the tier for a given number of hours
 */
export function getTier(hours: number): Tier {
  // Find the highest tier the user qualifies for
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (hours >= TIERS[i].minHours) {
      return TIERS[i];
    }
  }
  return TIERS[0]; // Default to seedling
}

/**
 * Get tier by level name
 */
export function getTierByLevel(level: TierLevel): Tier {
  return TIERS.find(t => t.level === level) || TIERS[0];
}

/**
 * Get the next tier after the current one (null if at legend)
 */
export function getNextTier(currentTier: Tier): Tier | null {
  const currentIndex = TIERS.findIndex(t => t.level === currentTier.level);
  if (currentIndex === -1 || currentIndex >= TIERS.length - 1) {
    return null;
  }
  return TIERS[currentIndex + 1];
}

/**
 * Calculate progress percentage to next tier
 * Returns 100 if at legend tier
 */
export function getTierProgress(hours: number): number {
  const currentTier = getTier(hours);
  const nextTier = getNextTier(currentTier);
  
  if (!nextTier) {
    return 100; // Already at legend
  }
  
  const tierRange = nextTier.minHours - currentTier.minHours;
  const userProgress = hours - currentTier.minHours;
  
  return Math.min(100, Math.max(0, (userProgress / tierRange) * 100));
}

/**
 * Get hours remaining until next tier
 * Returns 0 if at legend tier
 */
export function getHoursToNextTier(hours: number): number {
  const currentTier = getTier(hours);
  const nextTier = getNextTier(currentTier);
  
  if (!nextTier) {
    return 0;
  }
  
  return Math.max(0, nextTier.minHours - hours);
}

/**
 * Format tier display with icon name for dynamic rendering
 */
export function getTierDisplay(hours: number): {
  tier: Tier;
  nextTier: Tier | null;
  progress: number;
  hoursToNext: number;
} {
  const tier = getTier(hours);
  const nextTier = getNextTier(tier);
  const progress = getTierProgress(hours);
  const hoursToNext = getHoursToNextTier(hours);
  
  return { tier, nextTier, progress, hoursToNext };
}

