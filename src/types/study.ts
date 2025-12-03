/**
 * Type definitions for Avo Study feature
 * Based on avo_study.md data model specifications
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Study Spot - Static location configuration (MVP: Card-based interface)
 */
export interface StudySpot {
  id: string;                    // Firestore document ID (e.g., "doe-library")
  name: string;                  // Display name (e.g., "Doe Library")
  hours: string;                 // Operating hours (e.g., "8:00 AM - 12:00 AM")
  latitude: number;              // Geographic latitude for map display
  longitude: number;             // Geographic longitude for map display
}

/**
 * Check-In Status
 */
export type CheckInStatus = 
  | 'open'          // Open to study together
  | 'solo'          // Solo mode
  | 'break';        // On a break

/**
 * Study Request Status
 */
export type StudyRequestStatus = 'pending' | 'accepted' | 'declined' | 'expired';

/**
 * Check-In - Active user session at a study spot
 */
export interface CheckIn {
  id: string;                    // Firestore document ID
  userId: string;                // User who checked in
  spotId: string;                // Study spot ID
  status: CheckInStatus;         // "open" = available to study together, "solo" = focused work
  statusNote?: string;           // Optional custom status message (120 char max)
  startedAt: Timestamp;          // When check-in was created
  expiresAt: Timestamp;          // When check-in expires (auto-checkout)
  isActive: boolean;             // False when expired or manually checked out
}

/**
 * Study Request - Message from one user to another
 */
export interface StudyRequest {
  id: string;                    // Firestore document ID
  fromUserId: string;            // Sender user ID
  toUserId: string;              // Recipient user ID
  checkInId: string;             // Reference to the check-in that prompted this request
  spotId: string;                // Study spot where request was sent (for context)
  message: string;               // Free-form message (500 char max)
  status: StudyRequestStatus;    // Request lifecycle status
  sentAt: Timestamp;             // When request was sent
  readAt?: Timestamp;            // When recipient read the request
}

/**
 * No changes to User type for MVP
 * We'll use existing fields: uid, username, kao
 */

/**
 * Post Types
 */
export type PostType = 'regular' | 'checkin';

/**
 * Base Post (existing posts collection)
 */
export interface Post {
  id?: string;                   // Firestore document ID
  text: string;                  // Post content
  date: string;                  // Date string (e.g., "11/18/2024") - for display
  createdAt?: Timestamp;         // Post creation timestamp - for sorting and time display
  likes: number;                 // Like count
  uid: string;                   // Author user ID
  type?: PostType;               // Post type (default: 'regular')
}

/**
 * Check-In Post (special post type created when checking in)
 */
export interface CheckInPost extends Post {
  type: 'checkin';
  checkInId: string;             // Reference to check_ins document
  spotId: string;                // Study spot ID
  spotName: string;              // Study spot name (denormalized for display)
  status: CheckInStatus;         // Study status
  statusNote?: string;           // Optional status note
  expiresAt: Timestamp;          // When check-in expires
}

/**
 * Check-In with populated user and spot data
 * Used for display in study spot cards
 */
export interface PopulatedCheckIn extends CheckIn {
  user?: {
    username: string;
    kao: string;
  };
  spot?: {
    name: string;
  };
}

/**
 * Study Request with populated user data
 * Used for display in inbox
 */
export interface PopulatedStudyRequest extends StudyRequest {
  fromUser?: {
    username: string;
    kao: string;
  };
  toUser?: {
    username: string;
    kao: string;
  };
}

/**
 * Check-In Form Data
 * Used when creating a new check-in
 */
export interface CheckInFormData {
  spotId: string;
  duration: number;              // minutes (30, 60, 120, 180, 240)
  status: CheckInStatus;
  statusNote?: string;           // Optional custom message
}

/**
 * Study Request Form Data
 * Used when sending a study request
 */
export interface StudyRequestFormData {
  toUserId: string;              // Recipient user ID
  message: string;               // 500 char max
}

/**
 * Active Check-In Summary
 * Lightweight data for displaying "Currently checked in" banner
 */
export interface ActiveCheckInSummary {
  id: string;
  spotId: string;
  spotName: string;
  status: CheckInStatus;
  expiresAt: Timestamp;
  minutesRemaining: number;
}

/**
 * Study Spot with Active Count
 * Used for study spot cards display
 */
export interface StudySpotWithCount extends StudySpot {
  activeCount: number;           // Total users checked in
  openCount: number;             // Users with "open" status
}

/**
 * Duration preset options
 */
export const DURATION_PRESETS = [
  { label: '30 min', value: 30 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
] as const;

/**
 * Maximum duration allowed for a check-in
 */
export const MAX_CHECK_IN_DURATION = 360; // 6 hours in minutes

/**
 * Rate limits
 */
export const RATE_LIMITS = {
  STUDY_REQUESTS_PER_HOUR: 8,
  MESSAGES_PER_THREAD_PER_HOUR: 20,
  MESSAGE_COOLDOWN_SECONDS: 30,
} as const;

/**
 * Character limits
 */
export const CHAR_LIMITS = {
  STATUS_NOTE: 120,
  STUDY_REQUEST_MESSAGE: 500,
} as const;

/**
 * Status option configurations
 */
export const STATUS_OPTIONS = [
  { value: 'open' as const, label: 'Open to study together', emoji: '🤝', description: 'Available to study together' },
  { value: 'solo' as const, label: 'Solo mode', emoji: '🎧', description: 'Focused solo work' },
  { value: 'break' as const, label: 'On a break', emoji: '☕', description: 'Taking a break' },
] as const;

// ============================================
// STUDY HISTORY & METRICS TYPES
// ============================================

/**
 * Study Session - Historical record of completed study session
 */
export interface StudySession {
  id: string;                    // Firestore document ID
  userId: string;                // Who studied
  spotId: string;                // Where they studied
  status: CheckInStatus;         // Their study mode
  statusNote?: string;           // Optional note
  startedAt: Timestamp;          // When they checked in
  endedAt: Timestamp;            // When session ended (checkout or expiry)
  duration: number;              // Actual duration in minutes
  wasManualCheckout: boolean;    // true = manual, false = auto-expired
  createdAt: Timestamp;          // For sorting/indexing
}

/**
 * User Statistics - Aggregated metrics per user
 */
export interface UserStats {
  userId: string;                // Document ID = user ID
  
  // Overall Stats
  totalSessions: number;         // All-time check-in count
  totalMinutes: number;          // All-time study minutes
  totalHours: number;            // Computed: totalMinutes / 60
  totalXP: number;               // Lifetime XP earned
  coins: number;                 // AvoCoins balance (totalXP / 5)
  
  // Streaks
  currentStreak: number;         // Consecutive days with check-ins
  longestStreak: number;         // Best streak ever
  lastStudyDate: string;         // YYYY-MM-DD for streak calculation
  
  // Favorites
  favoriteSpot: string;          // Most visited spot ID
  favoriteSpotCount: number;     // # of times at favorite spot
  
  // Per-Spot Breakdown
  spotStats: {
    [spotId: string]: {
      sessionCount: number;
      totalMinutes: number;
      lastVisit: Timestamp;
    };
  };
  
  // Social
  studyBuddies: {                // Who they've studied with
    [userId: string]: number;    // # of times studied together
  };
  
  // Time-based
  lastUpdated: Timestamp;        // When stats were last recalculated
  
  // Monthly tracking (for charts)
  monthlyMinutes: {              // Key: "YYYY-MM"
    [month: string]: number;
  };
}

/**
 * Leaderboard Entry - Used for displaying rankings
 */
export interface LeaderboardEntry {
  userId: string;
  username: string;
  kao: string;
  totalSessions: number;
  totalHours: number;
  currentStreak: number;
  favoriteSpot: string;
  favoriteSpotName?: string;
  rank?: number;
  spotStats?: {
    [spotId: string]: {
      sessionCount: number;
      totalMinutes: number;
    };
  };
}

/**
 * Leaderboard Metric Type
 */
export type LeaderboardMetric = 'hours' | 'sessions' | 'streak';

/**
 * Leaderboard Timeframe
 */
export type LeaderboardTimeframe = 'week' | 'month' | 'alltime';

// ============================================
// RANK TIERS & ACHIEVEMENT BADGES
// ============================================

/**
 * Tier Level - Based on total study hours
 */
export type TierLevel = 'seedling' | 'studier' | 'scholar' | 'grinder' | 'master' | 'legend';

/**
 * Tier Definition - Rank tier configuration
 * Supports both hours-based and XP-based tier systems
 */
export interface Tier {
  level: TierLevel;
  name: string;
  minHours?: number;          // Hours required (for hours-based system)
  maxHours?: number;          // Hours cap (for hours-based system)
  minXP?: number;             // XP required (for XP-based system)
  maxXP?: number;             // XP cap (for XP-based system)
  icon: string;               // lucide icon name
  color: string;              // Primary tier color
  bgColor: string;            // Background color for badges
  podiumHeight?: number;      // Visual height in pixels for tier showcase
}

/**
 * Badge Identifier - All available achievement badges
 */
export type BadgeId = 
  // Session Milestones
  | 'first-checkin' 
  | 'frequent-flyer' 
  | 'regular' 
  | 'dedicated'
  // Hour Milestones
  | 'getting-started' 
  | 'double-digits' 
  | 'half-century' 
  | 'century-club'
  // Streak Milestones
  | 'spark' 
  | 'on-fire' 
  | 'blazing' 
  | 'unstoppable'
  // Location-based
  | 'explorer' 
  | 'local-legend';

/**
 * Badge Category
 */
export type BadgeCategory = 'sessions' | 'hours' | 'streak' | 'location';

/**
 * Badge Definition - Achievement badge configuration
 */
export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: string;               // lucide icon name
  category: BadgeCategory;
  threshold: number;          // Value required to earn badge
  color: string;              // Badge accent color
}

/**
 * User's earned badges - stored with timestamp
 */
export interface EarnedBadge {
  badgeId: BadgeId;
  earnedAt: Date;
}

// ============================================
// XP & QUEST SYSTEM
// ============================================

/**
 * Quest Definition - Daily or weekly challenge
 */
export interface Quest {
  id: string;
  type: 'daily' | 'weekly';
  name: string;
  description: string;
  icon: string;               // lucide icon name
  target: number;             // Goal value to complete
  xpReward: number;          // XP awarded on completion
}

/**
 * User Quest Progress - Tracks individual quest completion
 */
export interface UserQuestProgress {
  questId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}
