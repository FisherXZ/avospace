/**
 * Seed Mock Study Statistics
 * Creates fake user stats and study sessions for testing the leaderboard
 * Uses client-side Firebase SDK (same as the app)
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, Timestamp } from 'firebase/firestore';

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

// Mock users data
const mockUsers = [
  { userId: 'mock_alice', username: 'alice', kao: '(^ᗜ^)' },
  { userId: 'mock_bob', username: 'bob', kao: '(◕‿◕)' },
  { userId: 'mock_charlie', username: 'charlie', kao: '(✿◠‿◠)' },
  { userId: 'mock_diana', username: 'diana', kao: '(◠‿◠✿)' },
  { userId: 'mock_ethan', username: 'ethan', kao: '(•‿•)' },
  { userId: 'mock_fiona', username: 'fiona', kao: '(⌐■_■)' },
  { userId: 'mock_george', username: 'george', kao: '(ಠ_ಠ)' },
  { userId: 'mock_hannah', username: 'hannah', kao: '(◕ω◕)' },
  { userId: 'mock_isaac', username: 'isaac', kao: '(｡◕‿◕｡)' },
  { userId: 'mock_julia', username: 'julia', kao: '(≧◡≦)' },
];

// Study spots
const studySpots = [
  'doe-library',
  'moffitt-library',
  'main-stacks',
  'mlk-student-union',
  'kresge-engineering',
];

// Helper: Generate random number in range
const randomInt = (min: number, max: number) => 
  Math.floor(Math.random() * (max - min + 1)) + min;

// Helper: Generate random date in past N days
const randomPastDate = (daysAgo: number) => {
  const now = Date.now();
  const pastTime = now - (daysAgo * 24 * 60 * 60 * 1000);
  const randomTime = pastTime + Math.random() * (now - pastTime);
  return new Date(randomTime);
};

// Generate user stats
const generateUserStats = (userId: string, username: string) => {
  const totalSessions = randomInt(15, 120);
  const avgSessionMinutes = randomInt(45, 180);
  const totalMinutes = totalSessions * avgSessionMinutes + randomInt(-500, 500);
  const totalHours = parseFloat((totalMinutes / 60).toFixed(2));
  
  const currentStreak = randomInt(1, 45);
  const longestStreak = Math.max(currentStreak, randomInt(currentStreak, 60));
  
  // Generate spot stats
  const spotStats: any = {};
  const numSpots = randomInt(2, 5); // Each user visits 2-5 spots
  const selectedSpots = studySpots
    .sort(() => Math.random() - 0.5)
    .slice(0, numSpots);
  
  let remainingSessions = totalSessions;
  let remainingMinutes = totalMinutes;
  
  selectedSpots.forEach((spotId, index) => {
    const isLast = index === selectedSpots.length - 1;
    const sessionCount = isLast 
      ? remainingSessions 
      : randomInt(1, Math.floor(remainingSessions / 2));
    const minutes = isLast 
      ? remainingMinutes 
      : randomInt(sessionCount * 30, sessionCount * 120);
    
    spotStats[spotId] = {
      sessionCount,
      totalMinutes: Math.max(minutes, sessionCount * 30),
      lastVisit: Timestamp.fromDate(randomPastDate(7)),
    };
    
    remainingSessions -= sessionCount;
    remainingMinutes -= minutes;
  });
  
  // Find favorite spot (most sessions)
  const favoriteSpot = Object.entries(spotStats)
    .sort((a: any, b: any) => b[1].sessionCount - a[1].sessionCount)[0][0];
  const favoriteSpotCount = spotStats[favoriteSpot].sessionCount;
  
  // Generate monthly data
  const monthlyMinutes: any = {};
  const currentMonth = new Date().toISOString().slice(0, 7);
  monthlyMinutes[currentMonth] = randomInt(500, 2000);
  
  // Add previous months
  for (let i = 1; i <= 3; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().slice(0, 7);
    monthlyMinutes[monthKey] = randomInt(300, 1500);
  }
  
  // Calculate last study date for streak
  const today = new Date();
  const lastStudyDate = new Date(today);
  lastStudyDate.setDate(today.getDate() - randomInt(0, 2)); // 0-2 days ago
  
  return {
    userId,
    totalSessions,
    totalMinutes,
    totalHours,
    currentStreak,
    longestStreak,
    lastStudyDate: lastStudyDate.toISOString().split('T')[0],
    favoriteSpot,
    favoriteSpotCount,
    spotStats,
    studyBuddies: {},
    monthlyMinutes,
    lastUpdated: Timestamp.now(),
  };
};

// Generate study sessions
const generateStudySessions = (userId: string, userStats: any) => {
  const sessions: any[] = [];
  const sessionCount = Math.min(userStats.totalSessions, 30); // Generate last 30 sessions
  
  for (let i = 0; i < sessionCount; i++) {
    const daysAgo = randomInt(0, 30);
    const startTime = randomPastDate(daysAgo);
    const durationMinutes = randomInt(30, 240);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
    
    // Pick a random spot from user's spotStats
    const userSpots = Object.keys(userStats.spotStats);
    const spotId = userSpots[randomInt(0, userSpots.length - 1)];
    
    const status = ['open', 'solo', 'break'][randomInt(0, 2)] as any;
    const statusNotes = [
      'Working on CS 61A',
      'Math midterm prep',
      'Reading for History',
      'Group project',
      'Solo study time',
      'Quick review',
      '',
      '',
    ];
    
    sessions.push({
      userId,
      spotId,
      status,
      statusNote: statusNotes[randomInt(0, statusNotes.length - 1)],
      startedAt: Timestamp.fromDate(startTime),
      endedAt: Timestamp.fromDate(endTime),
      duration: durationMinutes,
      wasManualCheckout: Math.random() > 0.3, // 70% manual checkout
      createdAt: Timestamp.fromDate(endTime),
    });
  }
  
  return sessions;
};

// Main seeding function
async function seedMockStats() {
  console.log('🌱 Starting mock data seeding...\n');
  
  try {
    // 1. Create mock users in the users collection
    console.log('📝 Creating mock users...');
    for (const user of mockUsers) {
      await setDoc(doc(db, 'users', user.userId), {
        uid: user.userId,
        username: user.username,
        email: `${user.username}@mock.test`,
        profileComplete: true,
        kao: user.kao,
        bgColor: '#ffffff',
        accessory: '',
        leftSide: '(',
        leftCheek: '',
        leftEye: '^',
        mouth: 'ᗜ',
        rightEye: '^',
        rightCheek: '',
        rightSide: ')',
        friends: [],
        createdAt: Timestamp.now(),
      });
      console.log(`  ✓ Created user: ${user.username}`);
    }
    
    console.log('\n📊 Generating user stats...');
    const allUserStats: any[] = [];
    
    for (const user of mockUsers) {
      const userStats = generateUserStats(user.userId, user.username);
      allUserStats.push(userStats);
      
      // Save user stats
      await setDoc(doc(db, 'user_stats', user.userId), userStats);
      console.log(`  ✓ ${user.username}: ${userStats.totalSessions} sessions, ${userStats.totalHours}h, ${userStats.currentStreak} day streak`);
    }
    
    console.log('\n📚 Generating study sessions...');
    let totalSessions = 0;
    
    for (const user of mockUsers) {
      const userStats = allUserStats.find(s => s.userId === user.userId);
      const sessions = generateStudySessions(user.userId, userStats);
      
      // Save sessions individually (client SDK doesn't have writeBatch in same way)
      for (const session of sessions) {
        const sessionRef = doc(collection(db, 'study_sessions'));
        await setDoc(sessionRef, session);
      }
      
      totalSessions += sessions.length;
      console.log(`  ✓ ${user.username}: ${sessions.length} sessions`);
    }
    
    console.log('\n✅ Mock data seeding completed!');
    console.log(`\n📈 Summary:`);
    console.log(`   • ${mockUsers.length} mock users created`);
    console.log(`   • ${mockUsers.length} user stats documents created`);
    console.log(`   • ${totalSessions} study sessions created`);
    console.log('\n🎉 Your leaderboard should now have data!');
    console.log('   Visit: http://localhost:3000/avo_study/stats\n');
    
  } catch (error) {
    console.error('❌ Error seeding mock data:', error);
    throw error;
  }
}

// Run the seeding
seedMockStats()
  .then(() => {
    console.log('Done! Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });

