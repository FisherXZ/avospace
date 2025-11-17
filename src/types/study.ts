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
}

/**
 * Check-In Status
 */
export type CheckInStatus = 'open' | 'solo';

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
  message: string;               // Free-form message (500 char max)
  status: StudyRequestStatus;    // Request lifecycle status
  sentAt: Timestamp;             // When request was sent
}

/**
 * No changes to User type for MVP
 * We'll use existing fields: uid, username, kao
 */

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

