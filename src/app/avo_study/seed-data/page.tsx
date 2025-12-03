'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  query,
  where,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function SeedDataPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addLog = (message: string) => {
    setLog(prev => [...prev, message]);
  };

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

  const studySpots = [
    'doe-library',
    'moffitt-library',
    'main-stacks',
    'mlk-student-union',
    'kresge-engineering',
  ];

  const randomInt = (min: number, max: number) => 
    Math.floor(Math.random() * (max - min + 1)) + min;

  const randomPastDate = (daysAgo: number) => {
    const now = Date.now();
    const pastTime = now - (daysAgo * 24 * 60 * 60 * 1000);
    const randomTime = pastTime + Math.random() * (now - pastTime);
    return new Date(randomTime);
  };

  const generateUserStats = (userId: string) => {
    const totalSessions = randomInt(15, 120);
    const avgSessionMinutes = randomInt(45, 180);
    const totalMinutes = totalSessions * avgSessionMinutes + randomInt(-500, 500);
    const totalHours = parseFloat((totalMinutes / 60).toFixed(2));
    
    const currentStreak = randomInt(1, 45);
    const longestStreak = Math.max(currentStreak, randomInt(currentStreak, 60));
    
    const spotStats: any = {};
    const numSpots = randomInt(2, 5);
    const selectedSpots = [...studySpots].sort(() => Math.random() - 0.5).slice(0, numSpots);
    
    let remainingSessions = totalSessions;
    let remainingMinutes = totalMinutes;
    
    selectedSpots.forEach((spotId, index) => {
      const isLast = index === selectedSpots.length - 1;
      const sessionCount = isLast ? remainingSessions : randomInt(1, Math.floor(remainingSessions / 2));
      const minutes = isLast ? remainingMinutes : randomInt(sessionCount * 30, sessionCount * 120);
      
      spotStats[spotId] = {
        sessionCount,
        totalMinutes: Math.max(minutes, sessionCount * 30),
        lastVisit: Timestamp.fromDate(randomPastDate(7)),
      };
      
      remainingSessions -= sessionCount;
      remainingMinutes -= minutes;
    });
    
    const favoriteSpot = Object.entries(spotStats)
      .sort((a: any, b: any) => b[1].sessionCount - a[1].sessionCount)[0][0];
    const favoriteSpotCount = spotStats[favoriteSpot].sessionCount;
    
    const monthlyMinutes: any = {};
    const currentMonth = new Date().toISOString().slice(0, 7);
    monthlyMinutes[currentMonth] = randomInt(500, 2000);
    
    for (let i = 1; i <= 3; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      monthlyMinutes[monthKey] = randomInt(300, 1500);
    }
    
    const today = new Date();
    const lastStudyDate = new Date(today);
    lastStudyDate.setDate(today.getDate() - randomInt(0, 2));
    
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

  const handleSeedData = async () => {
    if (!auth.currentUser) {
      setError('Please log in first!');
      return;
    }

    setLoading(true);
    setLog([]);
    setError(null);

    try {
      addLog('🌱 Starting mock data seeding...');
      addLog('');

      // Create mock users
      addLog('📝 Creating mock users...');
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
        addLog(`  ✓ Created user: ${user.username}`);
      }

      // Generate and save stats
      addLog('');
      addLog('📊 Generating user stats...');
      const allUserStats: any[] = [];

      for (const user of mockUsers) {
        const userStats = generateUserStats(user.userId);
        allUserStats.push(userStats);
        
        await setDoc(doc(db, 'user_stats', user.userId), userStats);
        addLog(`  ✓ ${user.username}: ${userStats.totalSessions} sessions, ${userStats.totalHours}h, ${userStats.currentStreak} day streak`);
      }

      // Generate sessions
      addLog('');
      addLog('📚 Generating study sessions...');
      let totalSessions = 0;

      for (const user of mockUsers) {
        const userStats = allUserStats.find(s => s.userId === user.userId);
        const sessionCount = Math.min(userStats.totalSessions, 30);
        
        for (let i = 0; i < sessionCount; i++) {
          const daysAgo = randomInt(0, 30);
          const startTime = randomPastDate(daysAgo);
          const durationMinutes = randomInt(30, 240);
          const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);
          
          const userSpots = Object.keys(userStats.spotStats);
          const spotId = userSpots[randomInt(0, userSpots.length - 1)];
          const status = ['open', 'solo', 'break'][randomInt(0, 2)];
          
          const statusNotes = [
            'Working on CS 61A',
            'Math midterm prep',
            'Reading for History',
            'Group project',
            'Solo study time',
            '',
          ];
          
          await setDoc(doc(collection(db, 'study_sessions')), {
            userId: user.userId,
            spotId,
            status,
            statusNote: statusNotes[randomInt(0, statusNotes.length - 1)],
            startedAt: Timestamp.fromDate(startTime),
            endedAt: Timestamp.fromDate(endTime),
            duration: durationMinutes,
            wasManualCheckout: Math.random() > 0.3,
            createdAt: Timestamp.fromDate(endTime),
          });
        }
        
        totalSessions += sessionCount;
        addLog(`  ✓ ${user.username}: ${sessionCount} sessions`);
      }

      addLog('');
      addLog('✅ Mock data seeding completed!');
      addLog('');
      addLog(`📈 Summary:`);
      addLog(`   • ${mockUsers.length} mock users created`);
      addLog(`   • ${mockUsers.length} user stats documents created`);
      addLog(`   • ${totalSessions} study sessions created`);
      addLog('');
      addLog('🎉 Your leaderboard now has data!');

    } catch (err: any) {
      console.error('Error seeding data:', err);
      setError(err.message || 'Failed to seed data');
      addLog('');
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!auth.currentUser) {
      setError('Please log in first!');
      return;
    }

    if (!confirm('Are you sure you want to delete all mock data?')) {
      return;
    }

    setLoading(true);
    setLog([]);
    setError(null);

    try {
      addLog('🧹 Starting mock data cleanup...');
      addLog('');

      const mockUserIds = mockUsers.map(u => u.userId);

      // Delete users
      addLog('📝 Deleting mock users...');
      for (const userId of mockUserIds) {
        await deleteDoc(doc(db, 'users', userId));
        addLog(`  ✓ Deleted user: ${userId}`);
      }

      // Delete stats
      addLog('');
      addLog('📊 Deleting user stats...');
      for (const userId of mockUserIds) {
        await deleteDoc(doc(db, 'user_stats', userId));
        addLog(`  ✓ Deleted stats: ${userId}`);
      }

      // Delete sessions
      addLog('');
      addLog('📚 Deleting study sessions...');
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
          addLog(`  ✓ Deleted ${sessionsSnapshot.size} sessions for ${userId}`);
        }
      }

      addLog('');
      addLog('✅ Mock data cleanup completed!');
      addLog(`   • ${mockUserIds.length} mock users deleted`);
      addLog(`   • ${mockUserIds.length} user stats deleted`);
      addLog(`   • ${totalDeleted} study sessions deleted`);

    } catch (err: any) {
      console.error('Error cleaning up:', err);
      setError(err.message || 'Failed to cleanup data');
      addLog('');
      addLog(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="stats-page">
      <div className="container stats-container">
        {/* Header */}
        <div className="stats-header">
          <button 
            className="back-button"
            onClick={() => router.push('/avo_study')}
          >
            ← Back to Avo Study
          </button>
          <h2 className="stats-title">🎭 Seed Mock Data</h2>
        </div>

        {/* Info Card */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
        }}>
          <h3 style={{ marginBottom: '1rem' }}>About This Tool</h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            This tool creates fake users and study data to test the leaderboard feature.
            It creates 10 mock users with realistic study patterns, stats, and sessions.
          </p>
          <p style={{ color: '#666', marginBottom: '0' }}>
            <strong>Note:</strong> Mock users have IDs starting with <code>mock_</code> so they won't interfere with real users.
          </p>
        </div>

        {/* Actions */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleSeedData}
            disabled={loading}
            style={{
              flex: 1,
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #4A6B4A 0%, #5B9B7E 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              minWidth: '200px'
            }}
          >
            {loading ? '⏳ Seeding...' : '🌱 Seed Mock Data'}
          </button>

          <button
            onClick={handleCleanup}
            disabled={loading}
            style={{
              flex: 1,
              padding: '1rem 2rem',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              minWidth: '200px'
            }}
          >
            {loading ? '⏳ Cleaning...' : '🧹 Cleanup Mock Data'}
          </button>

          <button
            onClick={() => router.push('/avo_study/stats')}
            style={{
              padding: '1rem 2rem',
              background: '#f8f9fa',
              color: '#4A6B4A',
              border: '2px solid #4A6B4A',
              borderRadius: '12px',
              fontSize: '1.05rem',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            📊 View Leaderboard
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '2rem',
            color: '#c33'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Log Display */}
        {log.length > 0 && (
          <div style={{
            background: '#1e1e1e',
            borderRadius: '16px',
            padding: '2rem',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            color: '#00ff00',
            maxHeight: '500px',
            overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
          }}>
            {log.map((line, i) => (
              <div key={i}>{line || '\u00A0'}</div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

