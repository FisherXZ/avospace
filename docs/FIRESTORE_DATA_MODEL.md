# 🗂️ Firestore Data Model - Avo Study

Visual reference for collection relationships, field details, and query patterns.

---

## 📊 Collection Overview

```
firestore (database)
│
├── study_spots/              [5 documents, static]
│   ├── doe-library
│   ├── moffitt-library
│   ├── main-stacks
│   ├── mlk-student-union
│   └── kresge-engineering
│
├── check_ins/                [dynamic, real-time]
│   ├── {auto-id}
│   ├── {auto-id}
│   └── ...
│
├── study_requests/           [dynamic, real-time]
│   ├── {auto-id}
│   ├── {auto-id}
│   └── ...
│
└── users/                    [existing collection]
    ├── {user-uid}
    ├── {user-uid}
    └── ...
```

---

## 🔗 Entity Relationships

```
┌─────────────┐
│  users      │
│  (existing) │
└──────┬──────┘
       │
       │ userId (FK)
       ├─────────────────────┐
       │                     │
       ▼                     ▼
┌──────────────┐      ┌──────────────┐
│  check_ins   │      │study_requests│
│              │      │              │
│  spotId (FK) │      │  fromUserId  │
└──────┬───────┘      │  toUserId    │
       │              └──────────────┘
       │
       │ spotId (FK)
       │
       ▼
┌──────────────┐
│ study_spots  │
│   (static)   │
└──────────────┘
```

**Foreign Keys**:
- `check_ins.userId` → `users.uid`
- `check_ins.spotId` → `study_spots.id` (document ID)
- `study_requests.fromUserId` → `users.uid`
- `study_requests.toUserId` → `users.uid`

---

## 📋 Collection Schemas

### 1️⃣ study_spots

**Purpose**: Static list of study locations on campus  
**Total Documents**: 5 (fixed)  
**Created By**: Admin seeding  
**Updated By**: Manual (Firebase Console only)

```typescript
{
  // Document ID: "doe-library" (custom, not a field)
  
  name: string,        // "Doe Library"
  hours: string        // "8:00 AM - 12:00 AM"
}
```

**Storage**: ~50 bytes per document  
**Indexes**: None needed (simple queries only)

**Example Document**:
```json
{
  "name": "Doe Library",
  "hours": "8:00 AM - 12:00 AM"
}
```

---

### 2️⃣ check_ins

**Purpose**: Track active user sessions at study spots  
**Total Documents**: Variable (0-100 expected)  
**Created By**: Users via app  
**Updated By**: User (own check-ins only)  
**Deleted By**: User or auto-expire

```typescript
{
  // Document ID: auto-generated
  
  userId: string,           // Foreign key to users.uid
  spotId: string,           // Foreign key to study_spots doc ID
  status: string,           // "open" | "solo"
  statusNote?: string,      // Optional, max 120 chars
  startedAt: Timestamp,     // Check-in creation time
  expiresAt: Timestamp,     // Auto-checkout time
  isActive: boolean         // false = expired/checked out
}
```

**Storage**: ~200 bytes per document  
**Indexes**: 
- Composite: `spotId + isActive + startedAt`
- Composite: `userId + isActive`

**Example Document**:
```json
{
  "userId": "abc123xyz",
  "spotId": "doe-library",
  "status": "open",
  "statusNote": "Working on CS 61A midterm",
  "startedAt": { "_seconds": 1700000000, "_nanoseconds": 0 },
  "expiresAt": { "_seconds": 1700007200, "_nanoseconds": 0 },
  "isActive": true
}
```

**Lifecycle**:
1. User creates check-in → `isActive = true`
2. User manually checks out → `isActive = false`
3. `expiresAt` passes → Client filters it out (still `isActive = true` in DB)
4. [Future] Cloud Function sets `isActive = false` for expired check-ins

---

### 3️⃣ study_requests

**Purpose**: Messages sent between users to study together  
**Total Documents**: Variable (0-500 expected)  
**Created By**: Users via app  
**Updated By**: Recipient (status only)  
**Deleted By**: Manual cleanup only

```typescript
{
  // Document ID: auto-generated
  
  fromUserId: string,       // Sender user ID
  toUserId: string,         // Recipient user ID
  message: string,          // Free text, max 500 chars
  status: string,           // "pending" | "accepted" | "declined"
  sentAt: Timestamp         // Request creation time
}
```

**Storage**: ~600 bytes per document (varies with message length)  
**Indexes**: 
- Composite: `toUserId + status + sentAt`

**Example Document**:
```json
{
  "fromUserId": "abc123xyz",
  "toUserId": "def456uvw",
  "message": "Hey! I'm studying for CS 61A too. Want to work on problem set 3 together?",
  "status": "pending",
  "sentAt": { "_seconds": 1700000000, "_nanoseconds": 0 }
}
```

**Lifecycle**:
1. User A sends request to User B → `status = "pending"`
2. User B accepts → `status = "accepted"`
3. User B declines → `status = "declined"`
4. [Future] Auto-expire after 7 days → `status = "expired"`

---

### 4️⃣ users (existing)

**Purpose**: User profiles (no changes for MVP)  
**Total Documents**: Variable  
**Created By**: User registration  
**Updated By**: User (own profile only)

```typescript
{
  // Document ID: Firebase Auth UID
  
  username: string,         // Display name
  kao: string,             // Kaomoji avatar
  bgColor: string,         // Profile background color
  friends: string[]        // Array of user IDs (existing feature)
}
```

**Used By Avo Study**:
- ✅ `username` - Display in check-in roster
- ✅ `kao` - Display avatar in check-in roster
- ❌ Other fields not used

---

## 🔍 Query Patterns

### Pattern 1: Get All Study Spots (Static Data)

**Use Case**: Load study spots on page load  
**Frequency**: Once per session (cache recommended)

```typescript
// Collection: study_spots
// Method: getDocs() - one-time read
// Filters: None
// Sort: None
// Indexes: None needed
```

**Cost**: 5 reads (one-time, cacheable)

---

### Pattern 2: Get Active Check-ins for a Spot

**Use Case**: Display roster on study spot card  
**Frequency**: Real-time listener (continuous)

```typescript
// Collection: check_ins
// Method: onSnapshot() - real-time
// Filters: 
//   - spotId == "doe-library"
//   - isActive == true
//   - expiresAt > now()
// Sort: startedAt DESC (most recent first)
// Index: spotId + isActive + startedAt (composite)
```

**Cost**: 
- Initial: N reads (N = active users at spot)
- Updates: 1 read per change
- Average: 10-20 reads per spot per hour

---

### Pattern 3: Get User's Active Check-in

**Use Case**: Check if user is already checked in  
**Frequency**: On page load, before allowing new check-in

```typescript
// Collection: check_ins
// Method: getDocs() - one-time read
// Filters: 
//   - userId == currentUser.uid
//   - isActive == true
// Sort: None (expecting 0 or 1 result)
// Limit: 1
// Index: userId + isActive (composite)
```

**Cost**: 0-1 reads per query

---

### Pattern 4: Get Pending Study Requests (Inbox)

**Use Case**: Display inbox of study requests  
**Frequency**: Real-time listener or on-demand

```typescript
// Collection: study_requests
// Method: onSnapshot() - real-time
// Filters: 
//   - toUserId == currentUser.uid
//   - status == "pending"
// Sort: sentAt DESC (most recent first)
// Index: toUserId + status + sentAt (composite)
```

**Cost**: 
- Initial: N reads (N = pending requests)
- Updates: 1 read per new request
- Average: 5-10 reads per user per day

---

### Pattern 5: Populate User Data

**Use Case**: Add username/kao to check-ins for display  
**Frequency**: After fetching check-ins

```typescript
// Collection: users
// Method: getDoc() - one-time read per user
// Filters: Document ID lookup
// Optimization: Batch requests, cache results
```

**Cost**: 1 read per unique user (cache to reduce)

---

## 💾 Storage Estimates

Based on 100 active users:

| Collection | Docs | Bytes/Doc | Total Storage | Monthly Cost |
|------------|------|-----------|---------------|--------------|
| study_spots | 5 | 50 | 250 B | $0.00 (negligible) |
| check_ins | 50 | 200 | 10 KB | $0.00 (free tier) |
| study_requests | 200 | 600 | 120 KB | $0.00 (free tier) |
| **Total** | **255** | - | **~130 KB** | **Free** |

**Firebase Free Tier**:
- ✅ 1 GB storage (using 0.01%)
- ✅ 50K reads/day (expect ~5K)
- ✅ 20K writes/day (expect ~500)

---

## 📈 Read/Write Estimates

Daily estimates for 50 active users:

| Operation | Collection | Count | Type |
|-----------|------------|-------|------|
| Load study spots | study_spots | 50 | Read |
| Real-time check-ins | check_ins | 2,000 | Read |
| Create check-ins | check_ins | 100 | Write |
| Update check-ins | check_ins | 50 | Write |
| User profile lookups | users | 500 | Read |
| Send study requests | study_requests | 20 | Write |
| **Total Reads** | - | **2,550** | - |
| **Total Writes** | - | **170** | - |

**Free Tier Limit**: 50,000 reads, 20,000 writes per day  
**Usage**: **5% of free tier** ✅

---

## 🎯 Optimization Strategies

### 1. Cache Study Spots

```typescript
// Load once per session, store in memory
const SPOTS_CACHE = new Map();

async function getStudySpots() {
  if (SPOTS_CACHE.size === 0) {
    const snapshot = await getDocs(collection(db, 'study_spots'));
    snapshot.docs.forEach(doc => 
      SPOTS_CACHE.set(doc.id, { id: doc.id, ...doc.data() })
    );
  }
  return Array.from(SPOTS_CACHE.values());
}
```

**Savings**: 49 reads per 50 users (98% reduction)

---

### 2. Cache User Data

```typescript
// Store in component state or React Context
const USER_CACHE = new Map();

async function getUserData(userId) {
  if (!USER_CACHE.has(userId)) {
    const doc = await getDoc(doc(db, 'users', userId));
    USER_CACHE.set(userId, doc.data());
  }
  return USER_CACHE.get(userId);
}
```

**Savings**: Reduces redundant user lookups by 80%

---

### 3. Limit Real-time Listeners

```typescript
// Only listen to currently visible spot
useEffect(() => {
  if (!selectedSpot) return;
  
  const q = query(
    collection(db, 'check_ins'),
    where('spotId', '==', selectedSpot),
    where('isActive', '==', true),
    limit(50) // Prevent unbounded queries
  );
  
  const unsubscribe = onSnapshot(q, handleSnapshot);
  return () => unsubscribe();
}, [selectedSpot]);
```

**Savings**: 80% reduction in listener reads

---

### 4. Batch User Lookups

```typescript
// Instead of N sequential reads, do N parallel reads
const userIds = [...new Set(checkIns.map(c => c.userId))];
const userDocs = await Promise.all(
  userIds.map(uid => getDoc(doc(db, 'users', uid)))
);
```

**Savings**: Faster performance, same read count

---

## 🔒 Security Rule Patterns

### Read Access

| Collection | Who Can Read | Why |
|------------|-------------|-----|
| study_spots | All authenticated | Public directory |
| check_ins | All authenticated | Public roster (for discovery) |
| study_requests | Sender or recipient only | Privacy |
| users | All authenticated | Display names/avatars |

### Write Access

| Collection | Who Can Write | Why |
|------------|-------------|-----|
| study_spots | Admin only | Prevent tampering |
| check_ins | Owner only | Users manage own sessions |
| study_requests | Create: sender, Update: recipient | Message flow control |
| users | Owner only | Users manage own profiles |

---

## 🧪 Test Data Examples

### Seed Study Spots

```bash
npx ts-node scripts/seedStudySpots.ts
```

Creates 5 documents in `study_spots`.

---

### Create Test Check-in (Console)

```javascript
{
  "userId": "your-test-user-id",
  "spotId": "doe-library",
  "status": "open",
  "statusNote": "Test check-in",
  "startedAt": new Date(),
  "expiresAt": new Date(Date.now() + 7200000), // 2 hours
  "isActive": true
}
```

---

### Create Test Study Request (Console)

```javascript
{
  "fromUserId": "user1",
  "toUserId": "user2",
  "message": "Test message",
  "status": "pending",
  "sentAt": new Date()
}
```

---

## 📚 Related Documentation

- [Setup Instructions](./FIRESTORE_SETUP_INSTRUCTIONS.md)
- [Quick Reference](./FIRESTORE_QUICK_REFERENCE.md)
- [Feature Spec](./avo_study.md)
- [TypeScript Types](../src/types/study.ts)

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Production Ready

