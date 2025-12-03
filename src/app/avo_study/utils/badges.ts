/**
 * Achievement Badge System
 * Users earn badges through various study milestones
 */

import { Badge, BadgeId, BadgeCategory, UserStats } from '@/types/study';

/**
 * All badge definitions
 */
export const BADGES: Badge[] = [
  // Session Milestones
  {
    id: 'first-checkin',
    name: 'First Steps',
    description: 'Complete your first study session',
    icon: 'Footprints',
    category: 'sessions',
    threshold: 1,
    color: '#9CB99C',
  },
  {
    id: 'frequent-flyer',
    name: 'Frequent Flyer',
    description: 'Complete 25 study sessions',
    icon: 'Plane',
    category: 'sessions',
    threshold: 25,
    color: '#7A9A7A',
  },
  {
    id: 'regular',
    name: 'Regular',
    description: 'Complete 50 study sessions',
    icon: 'Coffee',
    category: 'sessions',
    threshold: 50,
    color: '#4A6B4A',
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 100 study sessions',
    icon: 'Award',
    category: 'sessions',
    threshold: 100,
    color: '#3D583D',
  },
  
  // Hour Milestones
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Study for 1 total hour',
    icon: 'Clock',
    category: 'hours',
    threshold: 1,
    color: '#9CB99C',
  },
  {
    id: 'double-digits',
    name: 'Double Digits',
    description: 'Study for 10 total hours',
    icon: 'Timer',
    category: 'hours',
    threshold: 10,
    color: '#7A9A7A',
  },
  {
    id: 'half-century',
    name: 'Half Century',
    description: 'Study for 50 total hours',
    icon: 'Hourglass',
    category: 'hours',
    threshold: 50,
    color: '#4A6B4A',
  },
  {
    id: 'century-club',
    name: 'Century Club',
    description: 'Study for 100 total hours',
    icon: 'Trophy',
    category: 'hours',
    threshold: 100,
    color: '#D4AF37',
  },
  
  // Streak Milestones
  {
    id: 'spark',
    name: 'Spark',
    description: 'Achieve a 3-day study streak',
    icon: 'Zap',
    category: 'streak',
    threshold: 3,
    color: '#FFB347',
  },
  {
    id: 'on-fire',
    name: 'On Fire',
    description: 'Achieve a 7-day study streak',
    icon: 'Flame',
    category: 'streak',
    threshold: 7,
    color: '#FF7043',
  },
  {
    id: 'blazing',
    name: 'Blazing',
    description: 'Achieve a 14-day study streak',
    icon: 'Sparkles',
    category: 'streak',
    threshold: 14,
    color: '#E53935',
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Achieve a 30-day study streak',
    icon: 'Rocket',
    category: 'streak',
    threshold: 30,
    color: '#9C27B0',
  },
  
  // Location-based
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Study at 3 different locations',
    icon: 'Compass',
    category: 'location',
    threshold: 3,
    color: '#42A5F5',
  },
  {
    id: 'local-legend',
    name: 'Local Legend',
    description: 'Study 50+ hours at one location',
    icon: 'MapPin',
    category: 'location',
    threshold: 50,
    color: '#7E57C2',
  },
];

/**
 * Get badge by ID
 */
export function getBadge(id: BadgeId): Badge | undefined {
  return BADGES.find(b => b.id === id);
}

/**
 * Get badges by category
 */
export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return BADGES.filter(b => b.category === category);
}

/**
 * Check if user has earned a specific badge based on their stats
 */
export function hasBadge(stats: UserStats, badgeId: BadgeId): boolean {
  const badge = getBadge(badgeId);
  if (!badge) return false;
  
  switch (badge.category) {
    case 'sessions':
      return stats.totalSessions >= badge.threshold;
    
    case 'hours':
      return stats.totalHours >= badge.threshold;
    
    case 'streak':
      // Check both current and longest streak
      return stats.currentStreak >= badge.threshold || stats.longestStreak >= badge.threshold;
    
    case 'location':
      if (badge.id === 'explorer') {
        // Count unique locations visited
        return Object.keys(stats.spotStats || {}).length >= badge.threshold;
      }
      if (badge.id === 'local-legend') {
        // Check if any single location has 50+ hours
        return Object.values(stats.spotStats || {}).some(
          spot => (spot.totalMinutes / 60) >= badge.threshold
        );
      }
      return false;
    
    default:
      return false;
  }
}

/**
 * Get all earned badges for a user
 */
export function getEarnedBadges(stats: UserStats): Badge[] {
  return BADGES.filter(badge => hasBadge(stats, badge.id));
}

/**
 * Get all unearned badges for a user
 */
export function getUnearnedBadges(stats: UserStats): Badge[] {
  return BADGES.filter(badge => !hasBadge(stats, badge.id));
}

/**
 * Get progress towards a specific badge (0-100)
 */
export function getBadgeProgress(stats: UserStats, badgeId: BadgeId): number {
  const badge = getBadge(badgeId);
  if (!badge) return 0;
  
  let currentValue = 0;
  
  switch (badge.category) {
    case 'sessions':
      currentValue = stats.totalSessions;
      break;
    
    case 'hours':
      currentValue = stats.totalHours;
      break;
    
    case 'streak':
      currentValue = Math.max(stats.currentStreak, stats.longestStreak);
      break;
    
    case 'location':
      if (badge.id === 'explorer') {
        currentValue = Object.keys(stats.spotStats || {}).length;
      } else if (badge.id === 'local-legend') {
        const maxHoursAtSpot = Math.max(
          0,
          ...Object.values(stats.spotStats || {}).map(s => s.totalMinutes / 60)
        );
        currentValue = maxHoursAtSpot;
      }
      break;
  }
  
  return Math.min(100, (currentValue / badge.threshold) * 100);
}

/**
 * Get the next badge to earn in each category
 */
export function getNextBadges(stats: UserStats): Badge[] {
  const nextBadges: Badge[] = [];
  const categories: BadgeCategory[] = ['sessions', 'hours', 'streak', 'location'];
  
  for (const category of categories) {
    const categoryBadges = getBadgesByCategory(category);
    const unearnedInCategory = categoryBadges.filter(b => !hasBadge(stats, b.id));
    
    if (unearnedInCategory.length > 0) {
      // Get the badge with the lowest threshold
      const nextBadge = unearnedInCategory.reduce((prev, curr) => 
        curr.threshold < prev.threshold ? curr : prev
      );
      nextBadges.push(nextBadge);
    }
  }
  
  return nextBadges;
}

/**
 * Get badge display info with progress
 */
export function getBadgeDisplay(stats: UserStats, badgeId: BadgeId): {
  badge: Badge;
  earned: boolean;
  progress: number;
} | null {
  const badge = getBadge(badgeId);
  if (!badge) return null;
  
  return {
    badge,
    earned: hasBadge(stats, badgeId),
    progress: getBadgeProgress(stats, badgeId),
  };
}

