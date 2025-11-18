import { Timestamp } from 'firebase/firestore';

/**
 * Complete user profile data structure
 */
export interface UserProfile {
  // Identity
  email: string;
  username: string;
  
  // Contact
  phoneNumber?: string;
  phoneCountryCode?: string;
  phoneVerified: boolean;
  
  // Profile Status
  profileComplete: boolean;
  createdAt: Timestamp;
  
  // Appearance
  kao: string;
  bgColor: string;
  accessory: string;
  leftSide: string;
  leftCheek: string;
  leftEye: string;
  mouth: string;
  rightEye: string;
  rightCheek: string;
  rightSide: string;
  
  // Social
  friends: string[];
}

/**
 * Minimal user info for display purposes
 */
export interface UserDisplayInfo {
  username: string;
  kao: string;
  bgColor: string;
}

/**
 * User registration data
 */
export interface UserRegistrationData {
  email: string;
  username: string;
  phoneNumber?: string;
  phoneCountryCode?: string;
}

/**
 * Username validation result
 */
export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Phone number validation result
 */
export interface PhoneValidationResult {
  valid: boolean;
  formatted?: string;
  countryCode?: string;
  error?: string;
}

