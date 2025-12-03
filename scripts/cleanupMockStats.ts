/**
 * Cleanup Mock Study Statistics
 * Removes all mock data created by seedMockStats.ts
 * Uses client-side Firebase SDK (same as the app)
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, deleteDoc, query, where, getDocs } from 'firebase/firestore';

// Firebase config (same as app)
const firebaseConfig = {
  apiKey: "AIzaSyBMBoG-NX1lJmf01CAd26SY1Xp6B_PAMzU",
  authDomain: "avospace-6a984.firebaseapp.com",
  projectId: "avospace-6a984",
  storageBucket: "avospace-6a984.firebasestorage.app",
  messagingSenderId: "378745001771",
  appId: "1:378745001771:web:5257c9b6fc40ab98a8d76e",
  measurementId: "G-XNYHDHSFGC"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Mock user IDs
const mockUserIds = [
  'mock_alice',
  'mock_bob',
  'mock_charlie',
  'mock_diana',
  'mock_ethan',
  'mock_fiona',
  'mock_george',
  'mock_hannah',
  'mock_isaac',
  'mock_julia',
];

async function cleanupMockStats() {
  console.log('🧹 Starting mock data cleanup...\n');
  
  try {
    // 1. Delete mock users
    console.log('📝 Deleting mock users...');
    for (const userId of mockUserIds) {
      await deleteDoc(doc(db, 'users', userId));
      console.log(`  ✓ Deleted user: ${userId}`);
    }
    
    // 2. Delete user stats
    console.log('\n📊 Deleting user stats...');
    for (const userId of mockUserIds) {
      await deleteDoc(doc(db, 'user_stats', userId));
      console.log(`  ✓ Deleted stats: ${userId}`);
    }
    
    // 3. Delete study sessions
    console.log('\n📚 Deleting study sessions...');
    let totalDeleted = 0;
    
    for (const userId of mockUserIds) {
      const sessionsQuery = query(
        collection(db, 'study_sessions'),
        where('userId', '==', userId)
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      for (const docSnapshot of sessionsSnapshot.docs) {
        await deleteDoc(docSnapshot.ref);
      }
      
      if (sessionsSnapshot.size > 0) {
        totalDeleted += sessionsSnapshot.size;
        console.log(`  ✓ Deleted ${sessionsSnapshot.size} sessions for ${userId}`);
      }
    }
    
    console.log('\n✅ Mock data cleanup completed!');
    console.log(`\n📈 Summary:`);
    console.log(`   • ${mockUserIds.length} mock users deleted`);
    console.log(`   • ${mockUserIds.length} user stats documents deleted`);
    console.log(`   • ${totalDeleted} study sessions deleted\n`);
    
  } catch (error) {
    console.error('❌ Error cleaning up mock data:', error);
    throw error;
  }
}

// Run the cleanup
cleanupMockStats()
  .then(() => {
    console.log('Done! Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });

