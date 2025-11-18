/**
 * User Data Cache Utility
 * Fetches and caches user data (username, kao) to avoid redundant Firestore reads
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserData {
  username: string;
  kao: string;
}

// In-memory cache to store fetched user data
const userCache = new Map<string, UserData>();

/**
 * Fetch user data for a single user ID
 * Results are cached to avoid redundant reads
 */
export async function getUserData(userId: string): Promise<UserData | null> {
  // Check cache first
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.warn(`User ${userId} not found`);
      return null;
    }

    const userData: UserData = {
      username: userDoc.data().username || 'Unknown',
      kao: userDoc.data().kao || '(^_^)'
    };

    // Cache for future use
    userCache.set(userId, userData);
    return userData;
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Batch fetch multiple users in parallel
 * More efficient than sequential fetches
 */
export async function getUsersData(userIds: string[]): Promise<Map<string, UserData>> {
  const results = new Map<string, UserData>();
  
  // Separate cached and uncached IDs
  const uncachedIds: string[] = [];
  
  userIds.forEach(id => {
    if (userCache.has(id)) {
      results.set(id, userCache.get(id)!);
    } else {
      uncachedIds.push(id);
    }
  });

  // Fetch uncached users in parallel
  if (uncachedIds.length > 0) {
    const promises = uncachedIds.map(id => getUserData(id));
    const fetchedUsers = await Promise.all(promises);

    fetchedUsers.forEach((userData, index) => {
      if (userData) {
        results.set(uncachedIds[index], userData);
      }
    });
  }

  return results;
}

/**
 * Clear the cache (useful for testing or memory management)
 */
export function clearUserCache() {
  userCache.clear();
}

/**
 * Get cache size (for debugging)
 */
export function getCacheSize(): number {
  return userCache.size;
}

