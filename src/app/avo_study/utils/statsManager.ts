/**
 * Study Statistics Management Utilities
 * Handles session recording and stats calculation
 */

import {
  collection,
  doc,
  addDoc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudySession, UserStats, CheckIn } from '@/types/study';

/**
 * Record a completed study session
 * Called when user checks out or session expires
 */
export async function recordStudySession(
  checkIn: CheckIn,
  wasManualCheckout: boolean
): Promise<string> {
  const now = Timestamp.now();
  const startTime = checkIn.startedAt.toMillis();
  const endTime = now.toMillis();
  const duration = Math.floor((endTime - startTime) / 60000); // minutes

  // Create study session record
  const sessionData = {
    userId: checkIn.userId,
    spotId: checkIn.spotId,
    status: checkIn.status,
    statusNote: checkIn.statusNote || null,
    startedAt: checkIn.startedAt,
    endedAt: now,
    duration,
    wasManualCheckout,
    createdAt: now,
  };

  const sessionRef = await addDoc(collection(db, 'study_sessions'), sessionData);

  // Update user stats
  await updateUserStats(checkIn.userId, checkIn.spotId, duration);

  return sessionRef.id;
}

/**
 * Update user statistics after a completed session
 */
export async function updateUserStats(
  userId: string,
  spotId: string,
  duration: number
): Promise<void> {
  const statsRef = doc(db, 'user_stats', userId);
  const statsDoc = await getDoc(statsRef);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  if (!statsDoc.exists()) {
    // Create initial stats document
    const initialXP = Math.floor(duration / 60) * 60; // Simple: 60 XP per hour
    const initialStats: UserStats = {
      userId,
      totalSessions: 1,
      totalMinutes: duration,
      totalHours: parseFloat((duration / 60).toFixed(2)),
      totalXP: initialXP,
      coins: Math.floor(initialXP / 5), // 5 XP = 1 coin
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: today,
      favoriteSpot: spotId,
      favoriteSpotCount: 1,
      spotStats: {
        [spotId]: {
          sessionCount: 1,
          totalMinutes: duration,
          lastVisit: Timestamp.now(),
        },
      },
      studyBuddies: {},
      lastUpdated: Timestamp.now(),
      monthlyMinutes: {
        [currentMonth]: duration,
      },
    };

    await setDoc(statsRef, initialStats);
  } else {
    // Update existing stats
    const data = statsDoc.data() as UserStats;

    // Calculate streak
    const lastDate = new Date(data.lastStudyDate);
    const currentDate = new Date(today);
    const daysDiff = Math.floor(
      (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = data.currentStreak;
    if (daysDiff === 0) {
      // Same day, streak unchanged
      newStreak = data.currentStreak;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStreak = data.currentStreak + 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    const newTotalMinutes = data.totalMinutes + duration;
    const newTotalHours = parseFloat((newTotalMinutes / 60).toFixed(2));

    // Update spot stats for this location
    const spotSessionCount = (data.spotStats[spotId]?.sessionCount || 0) + 1;
    const spotTotalMinutes = (data.spotStats[spotId]?.totalMinutes || 0) + duration;

    // Determine favorite spot (most sessions)
    const allSpotCounts = Object.entries(data.spotStats).map(([id, stats]) => ({
      spotId: id,
      count: stats.sessionCount + (id === spotId ? 1 : 0),
    }));
    allSpotCounts.push({ spotId, count: spotSessionCount });

    const spotCountsUnique = allSpotCounts.reduce((acc, curr) => {
      const existing = acc.find((s) => s.spotId === curr.spotId);
      if (existing) {
        existing.count = curr.count;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [] as { spotId: string; count: number }[]);

    const favorite = spotCountsUnique.sort((a, b) => b.count - a.count)[0];

    // Calculate XP for this session
    const sessionXP = Math.floor(duration / 60) * 60; // 60 XP per hour
    const newTotalXP = (data.totalXP || 0) + sessionXP;
    const newCoins = Math.floor(newTotalXP / 5); // 5 XP = 1 coin
    
    // Update document
    await updateDoc(statsRef, {
      totalSessions: data.totalSessions + 1,
      totalMinutes: newTotalMinutes,
      totalHours: newTotalHours,
      totalXP: newTotalXP,
      coins: newCoins,
      currentStreak: newStreak,
      longestStreak: Math.max(data.longestStreak, newStreak),
      lastStudyDate: today,
      favoriteSpot: favorite.spotId,
      favoriteSpotCount: favorite.count,
      [`spotStats.${spotId}.sessionCount`]: spotSessionCount,
      [`spotStats.${spotId}.totalMinutes`]: spotTotalMinutes,
      [`spotStats.${spotId}.lastVisit`]: Timestamp.now(),
      [`monthlyMinutes.${currentMonth}`]: (data.monthlyMinutes[currentMonth] || 0) + duration,
      lastUpdated: Timestamp.now(),
    });
  }
}

/**
 * Get user stats (create if doesn't exist)
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const statsRef = doc(db, 'user_stats', userId);
  const statsDoc = await getDoc(statsRef);

  if (!statsDoc.exists()) {
    return null;
  }

  return statsDoc.data() as UserStats;
}

/**
 * Calculate time range for leaderboard queries
 */
export function getTimeRangeTimestamp(timeframe: 'week' | 'month' | 'alltime'): Timestamp {
  const now = Date.now();

  switch (timeframe) {
    case 'week':
      return Timestamp.fromMillis(now - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return Timestamp.fromMillis(now - 30 * 24 * 60 * 60 * 1000);
    case 'alltime':
      return Timestamp.fromMillis(0);
  }
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

/**
 * Format hours with decimal
 */
export function formatHours(minutes: number): string {
  const hours = (minutes / 60).toFixed(1);
  return `${hours}h`;
}

/**
 * Get ordinal suffix for rank (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(rank: number): string {
  const j = rank % 10;
  const k = rank % 100;

  if (j === 1 && k !== 11) {
    return `${rank}st`;
  }
  if (j === 2 && k !== 12) {
    return `${rank}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${rank}rd`;
  }
  return `${rank}th`;
}

