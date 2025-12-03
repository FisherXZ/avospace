/**
 * Quest System Definitions
 * Daily and weekly quest configurations for MVP display
 */

import { Quest } from '@/types/study';

/**
 * Daily Quest Definitions
 * Reset at midnight user timezone
 */
export const DAILY_QUESTS: Quest[] = [
  {
    id: 'quick-study',
    type: 'daily',
    name: 'Quick Study',
    description: 'Complete 1 study session',
    icon: 'Zap',
    target: 1,
    xpReward: 15,
  },
  {
    id: 'double-down',
    type: 'daily',
    name: 'Double Down',
    description: 'Complete 2 study sessions',
    icon: 'Target',
    target: 2,
    xpReward: 25,
  },
  {
    id: 'early-bird',
    type: 'daily',
    name: 'Early Bird',
    description: 'Study before 10 AM',
    icon: 'Sunrise',
    target: 1,
    xpReward: 20,
  },
  {
    id: 'night-owl',
    type: 'daily',
    name: 'Night Owl',
    description: 'Study after 8 PM',
    icon: 'Moon',
    target: 1,
    xpReward: 20,
  },
  {
    id: 'focus-master',
    type: 'daily',
    name: 'Focus Master',
    description: 'Complete a 2+ hour session',
    icon: 'Brain',
    target: 120, // minutes
    xpReward: 30,
  },
];

/**
 * Weekly Quest Definitions
 * Reset Sunday midnight
 */
export const WEEKLY_QUESTS: Quest[] = [
  {
    id: 'consistency-king',
    type: 'weekly',
    name: 'Consistency King',
    description: 'Study 5 different days',
    icon: 'Crown',
    target: 5,
    xpReward: 75,
  },
  {
    id: 'hour-grinder',
    type: 'weekly',
    name: 'Hour Grinder',
    description: 'Accumulate 10+ hours',
    icon: 'Timer',
    target: 10, // hours
    xpReward: 100,
  },
  {
    id: 'location-explorer',
    type: 'weekly',
    name: 'Location Explorer',
    description: 'Study at 2+ different spots',
    icon: 'Compass',
    target: 2,
    xpReward: 50,
  },
  {
    id: 'streak-builder',
    type: 'weekly',
    name: 'Streak Builder',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    target: 7,
    xpReward: 80,
  },
];

/**
 * Get all daily quests
 */
export function getDailyQuests(): Quest[] {
  return [...DAILY_QUESTS];
}

/**
 * Get all weekly quests
 */
export function getWeeklyQuests(): Quest[] {
  return [...WEEKLY_QUESTS];
}

/**
 * Get quest by ID
 */
export function getQuestById(id: string): Quest | undefined {
  return [...DAILY_QUESTS, ...WEEKLY_QUESTS].find(q => q.id === id);
}

/**
 * Calculate quest coin reward (for future use)
 * Currently using XP / 5 = coins formula
 */
export function getQuestCoinReward(quest: Quest): number {
  return Math.floor(quest.xpReward / 5);
}

