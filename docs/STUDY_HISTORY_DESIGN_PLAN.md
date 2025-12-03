# 📊 Study History & Metrics Feature - Design Plan

**AvoSpace Enhancement: Historical Data & User Metrics**

**Version:** 1.0  
**Created:** December 2, 2024  
**Status:** Design Phase - Awaiting Approval

---

## 📋 Executive Summary

This document outlines a comprehensive design plan for adding **Study History** and **User Metrics** features to AvoSpace. The goal is to:

1. **Track historical presence** at study locations
2. **Display past check-ins** for each study spot
3. **Show user metrics** (most frequent studiers, study streaks, etc.)
4. **Create leaderboards** and social engagement
5. **Provide personal study statistics** for motivation

---

## 🎯 Feature Goals

### Primary Goals
- ✅ **Historical Context**: Show who studied at each location over time
- ✅ **Gamification**: Motivate users with metrics and achievements
- ✅ **Social Discovery**: Help users find study buddies based on shared history
- ✅ **Personal Insights**: Give users data about their study habits

### Success Metrics
- Increase check-in frequency by 20%
- Increase user retention by 15%
- Increase study request acceptance rate by 10%

---

## 🏗️ Architecture Overview

### Data Model Changes

#### 1. New Collection: `study_sessions` (Historical Record)

**Purpose:** Permanent record of completed study sessions  
**Why separate from check_ins?** Keep active check-ins lean and fast, archive historical data

```typescript
interface StudySession {
  id: string;                    // Auto-generated ID
  userId: string;                // Who studied
  spotId: string;                // Where they studied
  status: CheckInStatus;         // Their study mode
  statusNote?: string;           // Optional note
  startedAt: Timestamp;          // When they checked in
  endedAt: Timestamp;            // When session ended (checkout or expiry)
  duration: number;              // Actual duration in minutes
  wasManualCheckout: boolean;    // true = manual, false = auto-expired
  createdAt: Timestamp;          // For sorting
}
```

**Storage Estimate:** 
- ~250 bytes per session
- 100 users × 2 sessions/day × 30 days = 6,000 sessions/month = ~1.5 MB/month

#### 2. Enhanced Collection: `user_stats` (Aggregated Metrics)

**Purpose:** Cached statistics per user (updated on session complete)  
**Why cache?** Avoid expensive aggregation queries on every page load

```typescript
interface UserStats {
  userId: string;                // Document ID = user ID
  
  // Overall Stats
  totalSessions: number;         // All-time check-in count
  totalMinutes: number;          // All-time study minutes
  totalHours: number;            // Computed: totalMinutes / 60
  
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
```

**Storage Estimate:** 
- ~800 bytes per user
- 100 users = ~80 KB

#### 3. Enhanced Collection: `spot_stats` (Per-Location Leaderboards)

**Purpose:** Aggregated data per study spot  
**Why?** Fast leaderboard queries without scanning all sessions

```typescript
interface SpotStats {
  spotId: string;                // Document ID = spot ID
  
  // All-time leaderboard (top 10)
  topStudiers: Array<{
    userId: string;
    sessionCount: number;
    totalMinutes: number;
  }>;
  
  // This week's leaders (resets Monday)
  weeklyLeaders: Array<{
    userId: string;
    sessionCount: number;
  }>;
  
  // Quick stats
  totalSessions: number;         // All-time sessions at this spot
  totalUniqueUsers: number;      // # of different users
  averageSessionLength: number;  // Minutes
  
  // Peak times (for heatmap)
  hourlyActivity: {              // 0-23 hours
    [hour: string]: number;      // # of sessions started in that hour
  };
  
  lastUpdated: Timestamp;
}
```

**Storage Estimate:** 
- ~1 KB per spot
- 5 spots = ~5 KB

---

## 🎨 UI/UX Design

### 1. Study Spot Card Enhancements

**Current State:** Shows active check-ins only  
**New State:** Add "History" tab to each card

```
┌─────────────────────────────────────────┐
│ 📚 Doe Library                          │
│ 8:00 AM - 12:00 AM                      │
│                                         │
│ [Active (12)] [History] [Stats]        │  ← New tabs
│                                         │
│ Active Now:                             │
│ 🤝 @alice (Open) - "CS 61A"           │
│ 🎧 @bob (Solo)                         │
│ ...                                     │
└─────────────────────────────────────────┘
```

**"History" Tab Content:**
```
┌─────────────────────────────────────────┐
│ 📅 Recent Sessions at Doe Library      │
│ [Today] [This Week] [This Month]       │
│                                         │
│ Today (Dec 2, 2024)                    │
│ ────────────────────────────────────    │
│ • @alice studied for 2h 30m (9am-11:30am) │
│ • @bob studied for 1h (10am-11am)      │
│ • @charlie studied for 45m (2pm-2:45pm) │
│                                         │
│ Yesterday (Dec 1, 2024)                │
│ ────────────────────────────────────    │
│ • @dave studied for 3h (1pm-4pm)       │
│ • @alice studied for 1h 15m (3pm-4:15pm) │
│ ...                                     │
│                                         │
│ [Load More]                             │
└─────────────────────────────────────────┘
```

**"Stats" Tab Content:**
```
┌─────────────────────────────────────────┐
│ 📊 Doe Library Statistics              │
│                                         │
│ 🏆 Top Studiers (All Time)            │
│ 1. 🥇 @alice - 45 sessions, 67h        │
│ 2. 🥈 @bob - 38 sessions, 52h          │
│ 3. 🥉 @charlie - 32 sessions, 41h      │
│ 4. @dave - 28 sessions, 35h            │
│ 5. @eve - 25 sessions, 30h             │
│                                         │
│ 📈 This Week                           │
│ • 125 total sessions                   │
│ • 15 unique visitors                   │
│ • Avg. session: 1h 45m                 │
│                                         │
│ ⏰ Peak Times (This Week)              │
│ [Chart showing hourly activity]        │
│ Most popular: 2pm-4pm (35 sessions)   │
└─────────────────────────────────────────┘
```

---

### 2. User Profile Enhancements

**Location:** `/user/[userid]/page.tsx`  
**New Section:** "Study Statistics" tab

```
┌─────────────────────────────────────────┐
│ (^ᗜ^) @alice                           │
│ [Profile] [Study Stats] [History]      │  ← New tabs
│                                         │
│ 📊 Study Statistics                    │
│                                         │
│ 🔥 Current Streak: 15 days            │
│ 📅 Total Sessions: 127                 │
│ ⏱️  Total Study Time: 189h 30m         │
│                                         │
│ 📍 Favorite Spots:                     │
│ 1. Doe Library - 45 sessions           │
│ 2. Moffitt Library - 38 sessions       │
│ 3. Main Stacks - 28 sessions           │
│                                         │
│ 👥 Study Buddies:                      │
│ • @bob (studied together 12 times)     │
│ • @charlie (studied together 8 times)  │
│ • @dave (studied together 5 times)     │
│                                         │
│ 📈 Monthly Activity                    │
│ [Bar chart showing hours per month]    │
│                                         │
│ 🏆 Achievements                        │
│ 🔥 "Marathon Master" - 3h session      │
│ 🌟 "Early Bird" - 5 sessions before 8am│
│ 💪 "Study Warrior" - 30 day streak     │
└─────────────────────────────────────────┘
```

---

### 3. New Page: Personal Dashboard

**Location:** `/avo_study/dashboard` (new route)  
**Access:** Link in navbar or Avo Study page

```
┌─────────────────────────────────────────┐
│ 📊 My Study Dashboard                  │
│                                         │
│ Overview (This Week)                   │
│ ┌─────────┬─────────┬─────────────┐   │
│ │ 🔥 12   │ 📅 15   │ ⏱️ 23h 45m │   │
│ │ Streak  │ Sessions│ Total Time  │   │
│ └─────────┴─────────┴─────────────┘   │
│                                         │
│ 📈 Study Activity (Last 30 Days)      │
│ [Line/Bar chart showing daily hours]   │
│                                         │
│ 📍 Your Favorite Spots                 │
│ [Pie chart of spot distribution]       │
│                                         │
│ 🏆 Your Rankings                       │
│ • Doe Library: #2 (67h total)         │
│ • Moffitt Library: #5 (52h total)     │
│ • Campus-wide: Top 10%                 │
│                                         │
│ 🎯 Goals & Challenges                  │
│ □ Study 20 hours this week (18/20)    │
│ □ Visit 3 different spots (2/3)       │
│ □ Morning session before 9am           │
│                                         │
│ 👥 Recent Study Buddies               │
│ • Studied with @bob 2 times this week  │
│ • Studied with @alice 1 time this week │
└─────────────────────────────────────────┘
```

---

### 4. Global Leaderboards Page

**Location:** `/avo_study/leaderboards` (new route)

```
┌─────────────────────────────────────────┐
│ 🏆 AvoSpace Leaderboards               │
│                                         │
│ [This Week] [This Month] [All Time]    │
│ [By Sessions] [By Hours] [By Streak]   │
│                                         │
│ 👑 Top Studiers (All Time - By Hours) │
│                                         │
│ 1. 🥇 @alice                           │
│    189h 30m · 127 sessions · 15 day streak │
│    Favorite: Doe Library               │
│                                         │
│ 2. 🥈 @bob                             │
│    156h 15m · 98 sessions · 8 day streak  │
│    Favorite: Moffitt Library           │
│                                         │
│ 3. 🥉 @charlie                         │
│    142h 45m · 85 sessions · 22 day streak │
│    Favorite: Main Stacks               │
│                                         │
│ 4. @dave - 128h 30m                    │
│ 5. @eve - 115h 20m                     │
│ ...                                     │
│ 15. You (@username) - 87h 45m          │
│                                         │
│ 📊 By Location                         │
│ [Tabs for each study spot]             │
└─────────────────────────────────────────┘
```

---

## 🔧 Technical Implementation

### Phase 1: Data Collection (Foundation)

**Goal:** Start tracking historical sessions without breaking current features

#### Step 1.1: Create Cloud Function (or client-side handler)

**Option A: Cloud Function (Recommended for production)**
```typescript
// functions/src/onCheckInComplete.ts
export const onCheckInComplete = functions.firestore
  .document('check_ins/{checkInId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    
    // Detect when check-in becomes inactive
    if (before.isActive && !after.isActive) {
      const checkInId = context.params.checkInId;
      const userId = after.userId;
      const spotId = after.spotId;
      
      // Calculate actual duration
      const startedAt = after.startedAt;
      const endedAt = Timestamp.now();
      const duration = Math.floor((endedAt.toMillis() - startedAt.toMillis()) / 60000); // minutes
      
      // Create study session record
      await admin.firestore().collection('study_sessions').add({
        userId,
        spotId,
        status: after.status,
        statusNote: after.statusNote || null,
        startedAt,
        endedAt,
        duration,
        wasManualCheckout: true, // Can detect this by checking if before expiresAt > now
        createdAt: Timestamp.now()
      });
      
      // Update user stats (increment counters)
      await updateUserStats(userId, spotId, duration);
      
      // Update spot stats
      await updateSpotStats(spotId, userId, duration);
    }
  });
```

**Option B: Client-side (Simpler for MVP, no Cloud Functions needed)**
```typescript
// In CheckInModal or ActiveCheckInBanner
const handleCheckOut = async () => {
  const checkInDoc = doc(db, 'check_ins', checkInId);
  const checkInData = (await getDoc(checkInDoc)).data();
  
  // Create study session
  const duration = Math.floor((Date.now() - checkInData.startedAt.toMillis()) / 60000);
  
  await addDoc(collection(db, 'study_sessions'), {
    userId: auth.currentUser!.uid,
    spotId: checkInData.spotId,
    status: checkInData.status,
    statusNote: checkInData.statusNote || null,
    startedAt: checkInData.startedAt,
    endedAt: Timestamp.now(),
    duration,
    wasManualCheckout: true,
    createdAt: Timestamp.now()
  });
  
  // Mark check-in as inactive
  await updateDoc(checkInDoc, { isActive: false });
  
  // Update stats (simplified - just increment counters)
  await updateUserStatsSimple(auth.currentUser!.uid, checkInData.spotId, duration);
};
```

#### Step 1.2: Update Firestore Indexes

```json
// firestore.indexes.json
{
  "indexes": [
    // Existing indexes...
    
    // New indexes for study_sessions
    {
      "collectionGroup": "study_sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "spotId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "study_sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "study_sessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "spotId", "order": "ASCENDING" },
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

#### Step 1.3: Update Security Rules

```javascript
// firestore.rules
match /study_sessions/{sessionId} {
  // Anyone can read sessions (for history display)
  allow read: if isSignedIn();
  
  // Only system/functions can create (prevent tampering)
  // For client-side creation, allow users to create their own
  allow create: if isSignedIn() 
    && request.resource.data.userId == request.auth.uid;
  
  // No updates or deletes (immutable record)
  allow update, delete: if false;
}

match /user_stats/{userId} {
  // Anyone can read stats (for leaderboards)
  allow read: if isSignedIn();
  
  // Owner can update (for client-side stats)
  allow write: if isOwner(userId);
}

match /spot_stats/{spotId} {
  // Anyone can read spot stats
  allow read: if isSignedIn();
  
  // Only functions can write (for accuracy)
  // For client-side, restrict to trusted updates
  allow write: if isSignedIn(); // Can be more restrictive
}
```

---

### Phase 2: Stats Calculation

#### Approach A: Real-time Updates (Simpler, more write costs)

**When:** On every check-out  
**How:** Increment counters in `user_stats` and `spot_stats`

```typescript
async function updateUserStatsSimple(userId: string, spotId: string, duration: number) {
  const statsRef = doc(db, 'user_stats', userId);
  const statsDoc = await getDoc(statsRef);
  
  if (!statsDoc.exists()) {
    // Create initial stats document
    await setDoc(statsRef, {
      userId,
      totalSessions: 1,
      totalMinutes: duration,
      totalHours: duration / 60,
      currentStreak: 1,
      longestStreak: 1,
      lastStudyDate: new Date().toISOString().split('T')[0],
      favoriteSpot: spotId,
      favoriteSpotCount: 1,
      spotStats: {
        [spotId]: {
          sessionCount: 1,
          totalMinutes: duration,
          lastVisit: Timestamp.now()
        }
      },
      studyBuddies: {},
      lastUpdated: Timestamp.now(),
      monthlyMinutes: {
        [new Date().toISOString().slice(0, 7)]: duration // "YYYY-MM"
      }
    });
  } else {
    // Update existing stats
    const data = statsDoc.data();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate streak
    const lastDate = new Date(data.lastStudyDate);
    const currentDate = new Date(today);
    const daysDiff = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let newStreak = data.currentStreak;
    if (daysDiff === 0) {
      // Same day, streak unchanged
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      newStreak += 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }
    
    await updateDoc(statsRef, {
      totalSessions: data.totalSessions + 1,
      totalMinutes: data.totalMinutes + duration,
      totalHours: (data.totalMinutes + duration) / 60,
      currentStreak: newStreak,
      longestStreak: Math.max(data.longestStreak, newStreak),
      lastStudyDate: today,
      [`spotStats.${spotId}.sessionCount`]: (data.spotStats[spotId]?.sessionCount || 0) + 1,
      [`spotStats.${spotId}.totalMinutes`]: (data.spotStats[spotId]?.totalMinutes || 0) + duration,
      [`spotStats.${spotId}.lastVisit`]: Timestamp.now(),
      [`monthlyMinutes.${currentMonth}`]: (data.monthlyMinutes[currentMonth] || 0) + duration,
      lastUpdated: Timestamp.now()
    });
    
    // Update favorite spot (most visited)
    const spotCounts = Object.entries(data.spotStats).map(([id, stats]: [string, any]) => ({
      spotId: id,
      count: stats.sessionCount + (id === spotId ? 1 : 0)
    }));
    const favorite = spotCounts.sort((a, b) => b.count - a.count)[0];
    
    await updateDoc(statsRef, {
      favoriteSpot: favorite.spotId,
      favoriteSpotCount: favorite.count
    });
  }
}
```

#### Approach B: Batch Recalculation (More accurate, less write costs)

**When:** Scheduled (daily at midnight)  
**How:** Cloud Function scans all study_sessions and recalculates

```typescript
// functions/src/dailyStatsRecalculation.ts
export const dailyStatsRecalculation = functions.pubsub
  .schedule('0 0 * * *') // Midnight daily
  .timeZone('America/Los_Angeles')
  .onRun(async (context) => {
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      await recalculateUserStats(userDoc.id);
    }
    
    // Recalculate spot stats
    const spotsSnapshot = await admin.firestore().collection('study_spots').get();
    for (const spotDoc of spotsSnapshot.docs) {
      await recalculateSpotStats(spotDoc.id);
    }
  });

async function recalculateUserStats(userId: string) {
  const sessionsSnapshot = await admin.firestore()
    .collection('study_sessions')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get();
  
  // Calculate all stats from scratch
  // ... (aggregate logic)
  
  // Update user_stats document
  await admin.firestore().collection('user_stats').doc(userId).set({
    // ... calculated stats
  });
}
```

**Recommendation:** Use **Approach A (Real-time)** for MVP, migrate to **Approach B** for production scale.

---

### Phase 3: UI Components

#### Component 1: `StudyHistory.tsx`

**Location:** `src/app/avo_study/components/StudyHistory.tsx`

```typescript
interface StudyHistoryProps {
  spotId: string;
  timeRange: 'today' | 'week' | 'month';
}

export default function StudyHistory({ spotId, timeRange }: StudyHistoryProps) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const now = Date.now();
    let startTime: number;
    
    switch (timeRange) {
      case 'today':
        startTime = new Date().setHours(0, 0, 0, 0);
        break;
      case 'week':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'month':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
    }
    
    const q = query(
      collection(db, 'study_sessions'),
      where('spotId', '==', spotId),
      where('createdAt', '>=', Timestamp.fromMillis(startTime)),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const sessionsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const user = await getUserData(data.userId);
          return {
            id: doc.id,
            ...data,
            user
          } as StudySession & { user: UserData };
        })
      );
      
      setSessions(sessionsData);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [spotId, timeRange]);
  
  // Group by date
  const sessionsByDate = groupBy(sessions, (s) => 
    new Date(s.createdAt.toMillis()).toLocaleDateString()
  );
  
  return (
    <div className="study-history">
      {Object.entries(sessionsByDate).map(([date, dateSessions]) => (
        <div key={date} className="history-day">
          <h4 className="history-date">{date}</h4>
          {dateSessions.map((session) => (
            <div key={session.id} className="history-item">
              <div className="history-avatar">{session.user.kao}</div>
              <div className="history-info">
                <span className="history-username">@{session.user.username}</span>
                <span className="history-duration">
                  studied for {Math.floor(session.duration / 60)}h {session.duration % 60}m
                </span>
                <span className="history-time">
                  {new Date(session.startedAt.toMillis()).toLocaleTimeString()} - 
                  {new Date(session.endedAt.toMillis()).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### Component 2: `SpotLeaderboard.tsx`

```typescript
interface SpotLeaderboardProps {
  spotId: string;
  timeframe: 'week' | 'month' | 'alltime';
}

export default function SpotLeaderboard({ spotId, timeframe }: SpotLeaderboardProps) {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  
  useEffect(() => {
    // Query user_stats, filter by spot, sort by session count
    // ... fetch logic
  }, [spotId, timeframe]);
  
  return (
    <div className="spot-leaderboard">
      <h3>🏆 Top Studiers</h3>
      {leaders.map((entry, index) => (
        <div key={entry.userId} className="leaderboard-entry">
          <span className="rank">#{index + 1}</span>
          <div className="leader-avatar">{entry.user.kao}</div>
          <div className="leader-info">
            <span className="leader-username">@{entry.user.username}</span>
            <span className="leader-stats">
              {entry.sessionCount} sessions · {entry.totalHours}h
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Component 3: `UserStatsCard.tsx`

```typescript
interface UserStatsCardProps {
  userId: string;
}

export default function UserStatsCard({ userId }: UserStatsCardProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'user_stats', userId),
      (doc) => {
        if (doc.exists()) {
          setStats(doc.data() as UserStats);
        }
      }
    );
    
    return () => unsubscribe();
  }, [userId]);
  
  if (!stats) return <div>Loading stats...</div>;
  
  return (
    <div className="user-stats-card">
      <div className="stat-row">
        <div className="stat">
          <span className="stat-value">🔥 {stats.currentStreak}</span>
          <span className="stat-label">Day Streak</span>
        </div>
        <div className="stat">
          <span className="stat-value">📅 {stats.totalSessions}</span>
          <span className="stat-label">Total Sessions</span>
        </div>
        <div className="stat">
          <span className="stat-value">⏱️ {stats.totalHours.toFixed(1)}h</span>
          <span className="stat-label">Total Time</span>
        </div>
      </div>
      
      <div className="favorite-spot">
        <h4>📍 Favorite Spot</h4>
        <p>{getFavoriteSpotName(stats.favoriteSpot)} - {stats.favoriteSpotCount} visits</p>
      </div>
    </div>
  );
}
```

---

## 🔒 Privacy & Security Considerations

### Privacy Settings (Future Enhancement)

Allow users to control visibility of their stats:

```typescript
interface UserPrivacySettings {
  userId: string;
  
  // What's visible on profile
  showTotalHours: boolean;         // default: true
  showStreak: boolean;             // default: true
  showFavoriteSpot: boolean;       // default: true
  showStudyBuddies: boolean;       // default: true
  
  // Leaderboard participation
  appearInLeaderboards: boolean;   // default: true
  showRealName: boolean;           // default: false (show username)
  
  // History visibility
  showRecentSessions: boolean;     // default: true (who can see your history)
  historyVisibility: 'public' | 'friends' | 'private'; // default: 'public'
}
```

### Security Rules

```javascript
match /user_stats/{userId} {
  allow read: if isSignedIn() && (
    // Always allow user to read their own stats
    request.auth.uid == userId
    // Others can read if user hasn't opted out of leaderboards
    || get(/databases/$(database)/documents/user_privacy/$(userId)).data.appearInLeaderboards == true
  );
}

match /study_sessions/{sessionId} {
  allow read: if isSignedIn() && (
    // Owner can always read
    resource.data.userId == request.auth.uid
    // Others can read if history is public
    || get(/databases/$(database)/documents/user_privacy/$(resource.data.userId)).data.showRecentSessions == true
  );
}
```

---

## 📊 Analytics & Gamification

### Achievements System (Phase 4)

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;                  // Emoji
  condition: (stats: UserStats) => boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_session',
    name: 'Getting Started',
    description: 'Complete your first study session',
    icon: '🎯',
    condition: (stats) => stats.totalSessions >= 1,
    tier: 'bronze'
  },
  {
    id: 'marathon',
    name: 'Marathon Master',
    description: 'Study for 3+ hours in one session',
    icon: '🏃',
    condition: (stats) => {
      // Check if user has any session >= 180 minutes
      // (requires querying study_sessions)
      return false; // Placeholder
    },
    tier: 'silver'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Check in before 8am 5 times',
    icon: '🌅',
    condition: (stats) => {
      // Requires tracking early morning sessions
      return false;
    },
    tier: 'silver'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Study after 10pm 10 times',
    icon: '🦉',
    condition: (stats) => {
      return false;
    },
    tier: 'silver'
  },
  {
    id: 'streak_warrior',
    name: 'Study Warrior',
    description: 'Maintain a 30-day streak',
    icon: '💪',
    condition: (stats) => stats.currentStreak >= 30,
    tier: 'gold'
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Study with 10 different people',
    icon: '🦋',
    condition: (stats) => Object.keys(stats.studyBuddies).length >= 10,
    tier: 'silver'
  },
  {
    id: 'spot_explorer',
    name: 'Spot Explorer',
    description: 'Visit all 5 study spots',
    icon: '🗺️',
    condition: (stats) => Object.keys(stats.spotStats).length === 5,
    tier: 'bronze'
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Complete 100 study sessions',
    icon: '💯',
    condition: (stats) => stats.totalSessions >= 100,
    tier: 'gold'
  },
  {
    id: 'time_master',
    name: 'Time Master',
    description: 'Log 100+ hours total',
    icon: '⏰',
    condition: (stats) => stats.totalHours >= 100,
    tier: 'platinum'
  }
];
```

**UI Display:**
```
┌─────────────────────────────────────────┐
│ 🏆 Your Achievements (7/25)           │
│                                         │
│ ✅ 🎯 Getting Started                  │
│ ✅ 🗺️ Spot Explorer                    │
│ ✅ 💯 Century Club                     │
│ ✅ 💪 Study Warrior (30-day streak!)   │
│                                         │
│ 🔒 Next Achievements:                  │
│ ⏰ Time Master - 85/100 hours          │
│ 🦋 Social Butterfly - 7/10 buddies     │
│ 🏃 Marathon Master - Complete a 3h session │
└─────────────────────────────────────────┘
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Create `study_sessions` collection schema
- [ ] Implement session creation on check-out
- [ ] Add Firestore indexes
- [ ] Update security rules
- [ ] Test data collection in development

**Deliverable:** Sessions are being recorded, no UI changes yet

---

### Phase 2: Basic Stats (Week 3-4)
- [ ] Create `user_stats` collection
- [ ] Implement basic stats calculation (sessions, hours)
- [ ] Add stats display to user profiles
- [ ] Create "My Stats" section in account page
- [ ] Test with real usage data

**Deliverable:** Users can see their own statistics

---

### Phase 3: History UI (Week 5-6)
- [ ] Build `StudyHistory` component
- [ ] Add "History" tab to StudySpotCard
- [ ] Add date filters (today/week/month)
- [ ] Style history display
- [ ] Add pagination/load more

**Deliverable:** Users can view past check-ins at each spot

---

### Phase 4: Leaderboards (Week 7-8)
- [ ] Create `spot_stats` collection
- [ ] Build `SpotLeaderboard` component
- [ ] Add "Stats" tab to StudySpotCard
- [ ] Create global leaderboards page (`/avo_study/leaderboards`)
- [ ] Add filters (week/month/all-time)
- [ ] Show user's rank

**Deliverable:** Leaderboards showing top studiers

---

### Phase 5: Dashboard (Week 9-10)
- [ ] Create personal dashboard page (`/avo_study/dashboard`)
- [ ] Add charts (activity over time, spot distribution)
- [ ] Implement streak tracking
- [ ] Add "study buddies" tracking
- [ ] Create month-over-month comparisons

**Deliverable:** Comprehensive personal study dashboard

---

### Phase 6: Gamification (Week 11-12)
- [ ] Implement achievements system
- [ ] Add achievement badges to profiles
- [ ] Create achievement notifications
- [ ] Add progress bars for goals
- [ ] Implement weekly challenges

**Deliverable:** Full gamification with achievements

---

## 💰 Cost Analysis

### Firestore Costs (100 active users, 30 days)

**Current (without history):**
- Reads: ~5,000/day = 150,000/month
- Writes: ~500/day = 15,000/month
- Storage: ~130 KB
- **Monthly Cost:** $0 (within free tier)

**With History Feature:**
- Reads: ~8,000/day = 240,000/month (history views)
- Writes: ~1,000/day = 30,000/month (sessions + stats)
- Storage: ~2 MB (sessions + stats)
- **Monthly Cost:** $0-$5 (approaching free tier limits)

**At Scale (1,000 users):**
- Reads: ~80,000/day = 2.4M/month
- Writes: ~10,000/day = 300,000/month
- Storage: ~20 MB
- **Monthly Cost:** $15-25

**Optimization Tips:**
- Cache leaderboards (1 hour TTL)
- Paginate history results
- Limit real-time listeners
- Use batch writes for stats updates

---

## ❓ Open Questions & Decisions Needed

### 1. Data Retention
- **Question:** How long should we keep study_sessions data?
- **Options:**
  - A. Keep forever (full history)
  - B. Keep 1 year, archive older
  - C. Keep 6 months, delete older
- **Recommendation:** Keep 1 year for now (Option B)

### 2. Leaderboard Scope
- **Question:** What leaderboards should we show?
- **Options:**
  - A. Global only
  - B. Global + per-spot
  - C. Global + per-spot + friends-only
- **Recommendation:** Start with B, add C in Phase 6

### 3. Real-time vs Scheduled Updates
- **Question:** How often should stats update?
- **Options:**
  - A. Real-time on every check-out (more writes, instant feedback)
  - B. Scheduled daily recalculation (fewer writes, delayed feedback)
  - C. Hybrid (real-time for user, scheduled for leaderboards)
- **Recommendation:** Option C for best UX and cost balance

### 4. Privacy Controls
- **Question:** Should history/stats be opt-in or opt-out?
- **Options:**
  - A. Public by default (opt-out)
  - B. Private by default (opt-in)
  - C. Public stats, private history
- **Recommendation:** Option A (public by default) to encourage engagement

### 5. Study Buddy Detection
- **Question:** How to define "studied together"?
- **Options:**
  - A. Same spot + overlapping time (even if no interaction)
  - B. Only if study request was accepted
  - C. A + visible to each other on roster
- **Recommendation:** Option A (most inclusive)

### 6. Achievement Notifications
- **Question:** How to notify users of achievements?
- **Options:**
  - A. In-app toast only
  - B. In-app + push notification
  - C. In-app + email summary
- **Recommendation:** Start with A, add B in Phase 6

---

## 🎨 Design Mockups Needed

### Before Implementation:
1. [ ] StudySpotCard with History/Stats tabs (Figma/sketch)
2. [ ] Personal dashboard layout
3. [ ] Leaderboard page design
4. [ ] Achievement card design
5. [ ] Mobile responsive versions

---

## 📋 Success Criteria

### MVP Launch (Phase 3 complete):
- ✅ Sessions are recorded automatically
- ✅ Users can view history at each spot
- ✅ Users can see their own basic stats
- ✅ No performance degradation vs current app
- ✅ Privacy controls in place

### Full Feature Launch (Phase 6 complete):
- ✅ Leaderboards with multiple views
- ✅ Personal dashboard with charts
- ✅ Achievement system with 10+ achievements
- ✅ Study buddy tracking
- ✅ Mobile-optimized UI

### Long-term Success Metrics:
- 📈 20% increase in check-in frequency
- 📈 15% increase in user retention
- 📈 10% increase in study request acceptance
- 📈 Average session duration increases by 10%
- 📈 80% of users view their stats at least once/week

---

## 🚧 Potential Challenges

### Technical Challenges:
1. **Query Performance:** Large history queries could be slow
   - **Solution:** Pagination + caching
   
2. **Stats Accuracy:** Real-time updates might have race conditions
   - **Solution:** Use Firestore transactions or scheduled recalculation
   
3. **Streak Calculation:** Time zones and date boundaries are tricky
   - **Solution:** Store dates as strings (YYYY-MM-DD) in user's timezone

### UX Challenges:
1. **Information Overload:** Too many stats could be overwhelming
   - **Solution:** Progressive disclosure, start simple
   
2. **Privacy Concerns:** Some users might not want history visible
   - **Solution:** Clear privacy controls, opt-out option
   
3. **Competitive Pressure:** Leaderboards might create stress
   - **Solution:** De-emphasize rankings, focus on personal progress

---

## 📞 Next Steps

### For You (Product Owner):
1. Review this design plan
2. Provide feedback on:
   - Overall approach (data model, UI)
   - Priority of phases
   - Answers to open questions
   - Any concerns or suggestions
3. Approve to proceed with Phase 1

### For Development:
1. Await approval
2. Create detailed technical tasks for Phase 1
3. Set up development environment for history feature
4. Begin implementation

---

## 📚 References

- Current Architecture: `/docs/ARCHITECTURE.md`
- Data Model: `/docs/FIRESTORE_DATA_MODEL.md`
- Current Features: `/docs/FEATURES.md`
- Check-in System: `/src/app/avo_study/`

---

**Questions? Feedback?**  
This is a comprehensive starting point. Let's discuss any aspects you'd like to change, add, or prioritize differently!

---

**End of Design Plan**

