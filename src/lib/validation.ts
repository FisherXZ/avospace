import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { UsernameValidationResult, PhoneValidationResult } from '@/types/user';

// ============================================
// USERNAME VALIDATION
// ============================================

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const RESERVED_USERNAMES = [
  'admin', 
  'root', 
  'system', 
  'avospace', 
  'support', 
  'moderator', 
  'help',
  'user',
  'official',
  'staff',
  'team'
];

/**
 * Validate username format and uniqueness
 * Checks:
 * - Length (3-20 characters)
 * - Pattern (alphanumeric + underscore only)
 * - Not reserved
 * - Unique (case-insensitive)
 */
export async function validateUsername(
  username: string,
  currentUserId?: string
): Promise<UsernameValidationResult> {
  // Trim and convert to lowercase for checking
  const cleanUsername = username.trim();
  const lowerUsername = cleanUsername.toLowerCase();
  
  // Check empty
  if (!cleanUsername) {
    return { valid: false, error: 'Username is required' };
  }
  
  // Check length
  if (cleanUsername.length < USERNAME_MIN_LENGTH) {
    return { 
      valid: false, 
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters` 
    };
  }
  
  if (cleanUsername.length > USERNAME_MAX_LENGTH) {
    return { 
      valid: false, 
      error: `Username must be less than ${USERNAME_MAX_LENGTH} characters` 
    };
  }
  
  // Check pattern
  if (!USERNAME_PATTERN.test(cleanUsername)) {
    return { 
      valid: false, 
      error: 'Username can only contain letters, numbers, and underscores' 
    };
  }
  
  // Check reserved
  if (RESERVED_USERNAMES.includes(lowerUsername)) {
    return { valid: false, error: 'This username is reserved' };
  }
  
  // Check uniqueness (case-insensitive)
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', lowerUsername));
    const snapshot = await getDocs(q);
    
    // If we find a match, check if it's the current user
    if (!snapshot.empty) {
      const existingUser = snapshot.docs[0];
      if (currentUserId && existingUser.id === currentUserId) {
        // User is checking their own username
        return { valid: true };
      }
      return { valid: false, error: 'This username is already taken' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Error checking username uniqueness:', error);
    return { 
      valid: false, 
      error: 'Could not verify username availability. Please try again.' 
    };
  }
}

/**
 * Quick client-side username format validation (without uniqueness check)
 * Use this for real-time feedback before hitting the database
 */
export function validateUsernameFormat(username: string): UsernameValidationResult {
  const cleanUsername = username.trim();
  const lowerUsername = cleanUsername.toLowerCase();
  
  if (!cleanUsername) {
    return { valid: false, error: 'Username is required' };
  }
  
  if (cleanUsername.length < USERNAME_MIN_LENGTH) {
    return { 
      valid: false, 
      error: `At least ${USERNAME_MIN_LENGTH} characters` 
    };
  }
  
  if (cleanUsername.length > USERNAME_MAX_LENGTH) {
    return { 
      valid: false, 
      error: `Maximum ${USERNAME_MAX_LENGTH} characters` 
    };
  }
  
  if (!USERNAME_PATTERN.test(cleanUsername)) {
    return { 
      valid: false, 
      error: 'Letters, numbers, and underscores only' 
    };
  }
  
  if (RESERVED_USERNAMES.includes(lowerUsername)) {
    return { valid: false, error: 'This username is reserved' };
  }
  
  return { valid: true };
}

// ============================================
// PHONE NUMBER VALIDATION
// ============================================

/**
 * Validate and format phone number
 * Basic validation for E.164 format
 * 
 * E.164 format: +[country code][number]
 * Examples:
 *   US: +14155551234 (1 + 10 digits)
 *   UK: +447911123456 (44 + 10 digits)
 *   India: +919876543210 (91 + 10 digits)
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  if (!phone || phone.trim() === '') {
    return { valid: true, formatted: '', countryCode: '' }; // Optional field
  }
  
  // Remove all whitespace and formatting characters except +
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
  
  // Check if it contains only digits and optional + at start
  if (!/^\+?\d+$/.test(cleaned)) {
    return { 
      valid: false, 
      error: 'Phone number can only contain digits and country code' 
    };
  }
  
  // Must start with + for international format
  if (!cleaned.startsWith('+')) {
    return { 
      valid: false, 
      error: 'Phone must start with country code (e.g., +1 for US)' 
    };
  }
  
  // Extract country code and number
  const match = cleaned.match(/^\+(\d{1,3})(\d+)$/);
  if (!match) {
    return { 
      valid: false, 
      error: 'Invalid phone number format' 
    };
  }
  
  const [_, countryCode, number] = match;
  
  // Check total digits (10-15 after country code is typical)
  if (number.length < 7 || number.length > 15) {
    return { 
      valid: false, 
      error: 'Phone number must be 7-15 digits after country code' 
    };
  }
  
  // Return validated E.164 format
  return { 
    valid: true, 
    formatted: cleaned,
    countryCode: `+${countryCode}`
  };
}

/**
 * Format phone number for display
 * Attempts to format based on country code
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone || !phone.startsWith('+')) return phone;
  
  // Extract country code and number
  const match = phone.match(/^\+(\d{1,3})(\d+)$/);
  if (!match) return phone;
  
  const [_, countryCode, number] = match;
  
  // US/Canada formatting (+1 XXX XXX-XXXX)
  if (countryCode === '1' && number.length === 10) {
    return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  
  // UK formatting (+44 XXXX XXXXXX)
  if (countryCode === '44' && number.length === 10) {
    return `+44 ${number.slice(0, 4)} ${number.slice(4)}`;
  }
  
  // Default: +CC XXX XXX XXXX (group by 3)
  const formatted = number.match(/.{1,3}/g)?.join(' ') || number;
  return `+${countryCode} ${formatted}`;
}

/**
 * Mask phone number for privacy (show last 4 digits only)
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  
  const match = phone.match(/^\+(\d{1,3})(\d+)$/);
  if (!match) return phone;
  
  const [_, countryCode, number] = match;
  const masked = '*'.repeat(number.length - 4) + number.slice(-4);
  
  return `+${countryCode} ${masked}`;
}

// ============================================
// EMAIL VALIDATION
// ============================================

/**
 * Simple email format validation
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || email.trim() === '') {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!emailPattern.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
}

