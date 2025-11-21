# 🎨 Frontend Implementation Guide - Avo Study MVP

Step-by-step guide to build the Avo Study card-based interface.

---

## 📋 Prerequisites

✅ Firestore backend set up (rules, indexes deployed)  
✅ Study spots collection created (5 documents)  
✅ Dependencies installed: `date-fns`  
✅ TypeScript types defined: `src/types/study.ts`

---

## 🚀 Phase 1: MVP - Card-Based Interface

### Step 0: Install Dependencies

```bash
npm install date-fns
```

---

## Component 1: Main Page (30 minutes)

### File: `src/app/avo_study/page.tsx`

**Purpose:** Display 5 study spot cards in a grid

**Implementation:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { StudySpot } from '@/types/study';
import StudySpotCard from './components/StudySpotCard';

export default function AvoStudyPage() {
  const [spots, setSpots] = useState<StudySpot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'study_spots'));
        const spotsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as StudySpot));
        setSpots(spotsData);
      } catch (error) {
        console.error('Error fetching study spots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="container py-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold" style={{ color: '#4A6B4A' }}>
          🥑 Avo Study
        </h1>
        <p className="text-muted">Find study buddies at campus spots</p>
      </div>

      <div className="row g-4">
        {spots.map(spot => (
          <div key={spot.id} className="col-12 col-md-6">
            <StudySpotCard spot={spot} />
          </div>
        ))}
      </div>
    </main>
  );
}
```

**Styling Notes:**
- Uses Bootstrap grid (2 columns on desktop, 1 on mobile)
- Forest green header (#4A6B4A) per Cody design system
- Cards have spacing with `g-4` gap

---

## Component 2: Study Spot Card (1 hour)

### File: `src/app/avo_study/components/StudySpotCard.tsx`

**Purpose:** Display spot info + real-time roster of checked-in users

**Implementation:**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { StudySpot, CheckIn } from '@/types/study';
import CheckInModal from './CheckInModal';

interface StudySpotCardProps {
  spot: StudySpot;
}

export default function StudySpotCard({ spot }: StudySpotCardProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Real-time listener for active check-ins
  useEffect(() => {
    const q = query(
      collection(db, 'check_ins'),
      where('spotId', '==', spot.id),
      where('isActive', '==', true),
      orderBy('startedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeCheckIns = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CheckIn))
        .filter(checkIn => 
          checkIn.expiresAt.toMillis() > Date.now()
        );
      
      setCheckIns(activeCheckIns);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [spot.id]);

  return (
    <>
      <div 
        className="card h-100" 
        style={{ 
          border: '1px solid #e5e5e5',
          borderRadius: '12px',
          padding: '32px'
        }}
      >
        {/* Header */}
        <div className="mb-3">
          <h3 className="fw-bold mb-1" style={{ color: '#4A6B4A' }}>
            {spot.name}
          </h3>
          <p className="text-muted mb-0" style={{ fontSize: '16px' }}>
            {spot.hours}
          </p>
          <small className="text-muted">
            ({checkIns.length} studying)
          </small>
        </div>

        {/* Roster */}
        <div className="mb-4" style={{ minHeight: '200px' }}>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-success" />
            </div>
          ) : checkIns.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <p>No one studying here yet</p>
              <p className="small">Be the first to check in!</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {checkIns.map(checkIn => (
                <CheckInItem key={checkIn.id} checkIn={checkIn} />
              ))}
            </div>
          )}
        </div>

        {/* Check In Button */}
        <button
          className="btn w-100"
          style={{
            backgroundColor: '#5B9B7E',
            color: 'white',
            borderRadius: '25px',
            padding: '12px',
            fontWeight: '500'
          }}
          onClick={() => setShowModal(true)}
          disabled={!auth.currentUser}
        >
          Check In Here
        </button>
      </div>

      {/* Check-in Modal */}
      <CheckInModal
        spot={spot}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

// Sub-component for individual check-in
function CheckInItem({ checkIn }: { checkIn: CheckIn }) {
  const [user, setUser] = useState<{ username: string; kao: string } | null>(null);

  useEffect(() => {
    // TODO: Fetch user data from users collection
    // For now, using placeholder
    setUser({ username: 'User', kao: '(^_^)' });
  }, [checkIn.userId]);

  const statusColor = checkIn.status === 'open' ? '#E89B8E' : '#A8C8E8';

  return (
    <div 
      className="d-flex align-items-center gap-3 p-2"
      style={{ 
        border: '1px solid #f0f0f0',
        borderRadius: '8px'
      }}
    >
      {/* Avatar */}
      <div style={{ fontSize: '32px' }}>
        {user?.kao || '(^_^)'}
      </div>

      {/* Info */}
      <div className="flex-grow-1">
        <div className="fw-semibold">{user?.username || 'Loading...'}</div>
        {checkIn.statusNote && (
          <div className="small text-muted">{checkIn.statusNote}</div>
        )}
      </div>

      {/* Status Badge */}
      <span
        className="badge"
        style={{
          backgroundColor: statusColor,
          color: 'white',
          borderRadius: '12px',
          padding: '4px 12px',
          fontSize: '12px'
        }}
      >
        {checkIn.status === 'open' ? 'Open' : 'Solo'}
      </span>
    </div>
  );
}
```

**Key Features:**
- ✅ Real-time updates with `onSnapshot()`
- ✅ Filters expired check-ins client-side
- ✅ Cody design colors (coral/sky blue status badges)
- ✅ Pill-shaped check-in button

---

## Component 3: Check-In Modal (1 hour)

### File: `src/app/avo_study/components/CheckInModal.tsx`

**Purpose:** Allow users to create a new check-in

**Implementation:**

```typescript
'use client';

import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { StudySpot, CheckInStatus, DURATION_PRESETS } from '@/types/study';

interface CheckInModalProps {
  spot: StudySpot;
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckInModal({ spot, isOpen, onClose }: CheckInModalProps) {
  const [duration, setDuration] = useState(60); // Default 1 hour
  const [status, setStatus] = useState<CheckInStatus>('open');
  const [statusNote, setStatusNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    if (!auth.currentUser) {
      setError('You must be logged in to check in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const now = Timestamp.now();
      const expiresAt = Timestamp.fromMillis(
        Date.now() + duration * 60 * 1000
      );

      await addDoc(collection(db, 'check_ins'), {
        userId: auth.currentUser.uid,
        spotId: spot.id,
        status,
        statusNote: statusNote.trim() || null,
        startedAt: now,
        expiresAt,
        isActive: true
      });

      // Success - close modal
      onClose();
      setStatusNote('');
      setDuration(60);
      setStatus('open');
    } catch (err: any) {
      console.error('Error creating check-in:', err);
      setError(err.message || 'Failed to check in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1050 }}
      />

      {/* Modal */}
      <div 
        className="modal fade show d-block"
        tabIndex={-1}
        style={{ zIndex: 1055 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" style={{ borderRadius: '12px' }}>
            {/* Header */}
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">
                Check in to {spot.name}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                disabled={loading}
              />
            </div>

            {/* Body */}
            <div className="modal-body">
              {/* Duration Picker */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  How long will you study?
                </label>
                <div className="btn-group w-100" role="group">
                  {DURATION_PRESETS.map(preset => (
                    <button
                      key={preset.value}
                      type="button"
                      className={`btn ${duration === preset.value ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setDuration(preset.value)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Picker */}
              <div className="mb-4">
                <label className="form-label fw-semibold">Status</label>
                <div className="d-flex gap-3">
                  <div className="form-check flex-fill">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      id="statusOpen"
                      checked={status === 'open'}
                      onChange={() => setStatus('open')}
                    />
                    <label className="form-check-label" htmlFor="statusOpen">
                      Open to study together
                    </label>
                  </div>
                  <div className="form-check flex-fill">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="status"
                      id="statusSolo"
                      checked={status === 'solo'}
                      onChange={() => setStatus('solo')}
                    />
                    <label className="form-check-label" htmlFor="statusSolo">
                      Solo study
                    </label>
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div className="mb-3">
                <label className="form-label fw-semibold">
                  Status note (optional)
                </label>
                <textarea
                  className="form-control"
                  rows={2}
                  maxLength={120}
                  placeholder="e.g., Working on CS 61A problem set"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
                <small className="text-muted">
                  {statusNote.length}/120 characters
                </small>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleCheckIn}
                disabled={loading}
                style={{
                  backgroundColor: '#5B9B7E',
                  borderColor: '#5B9B7E',
                  borderRadius: '25px',
                  paddingLeft: '24px',
                  paddingRight: '24px'
                }}
              >
                {loading ? 'Checking in...' : 'Check In'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
```

**Key Features:**
- ✅ Duration presets (30m - 4h)
- ✅ Status selection (Open/Solo)
- ✅ Optional status note with character counter
- ✅ Error handling
- ✅ Loading state

---

## Helper: User Data Fetching (30 minutes)

### File: `src/app/avo_study/utils/userCache.ts`

**Purpose:** Fetch and cache user data to avoid redundant reads

```typescript
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserData {
  username: string;
  kao: string;
}

// In-memory cache
const userCache = new Map<string, UserData>();

export async function getUserData(userId: string): Promise<UserData | null> {
  // Check cache first
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }

    const userData: UserData = {
      username: userDoc.data().username,
      kao: userDoc.data().kao
    };

    // Cache for future use
    userCache.set(userId, userData);
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

// Batch fetch multiple users
export async function getUsersData(userIds: string[]): Promise<Map<string, UserData>> {
  const results = new Map<string, UserData>();
  const uncachedIds = userIds.filter(id => !userCache.has(id));

  // Return cached users immediately
  userIds.forEach(id => {
    if (userCache.has(id)) {
      results.set(id, userCache.get(id)!);
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
```

**Update CheckInItem to use cache:**

```typescript
// In StudySpotCard.tsx, update CheckInItem:
import { getUserData } from '../utils/userCache';

function CheckInItem({ checkIn }: { checkIn: CheckIn }) {
  const [user, setUser] = useState<{ username: string; kao: string } | null>(null);

  useEffect(() => {
    getUserData(checkIn.userId).then(setUser);
  }, [checkIn.userId]);

  // ... rest of component
}
```

---

## 🎯 Testing Your MVP

### Test Checklist:

1. **Load Page**
   - [ ] See 5 study spot cards
   - [ ] Each shows name, hours, count

2. **Check In**
   - [ ] Click "Check In Here"
   - [ ] Modal opens
   - [ ] Select duration, status, add note
   - [ ] Click "Check In"
   - [ ] See yourself in roster immediately

3. **Real-Time Updates**
   - [ ] Open page in two browser windows
   - [ ] Check in from one window
   - [ ] See update in other window instantly

4. **Expiry**
   - [ ] Create check-in with 1 minute duration
   - [ ] Wait 1 minute
   - [ ] Check-in disappears from roster

---

## 🐛 Common Issues

### Issue: "Missing index" error
**Fix:** Wait 2-5 minutes for indexes to finish building in Firebase Console

### Issue: Can't see other users' check-ins
**Fix:** Check security rules are deployed (firestore.rules)

### Issue: User data shows as "Loading..."
**Fix:** Implement `getUserData()` helper (see above)

---

## 📚 Next Steps After MVP

Once basic MVP works:

1. **Add "My Active Check-in" banner** at top
2. **Add "Check Out" button** to end session early
3. **Add "Extend Duration" feature**
4. **Build Study Request modal** (send messages)
5. **Build Inbox page** (view/respond to requests)

See `docs/avo_study.md` for Phase 2 features.

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Estimated Time**: 3-4 hours for full MVP

