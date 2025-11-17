# Location-Based Study Buddy Finder (Avo Study) - Technical Implementation Guide

## Feature Overview

**Goal:** Enable club members to find study buddies at UC Berkeley campus study spots through a simple card-based interface.

**MVP Version:** Card-based interface (no map, no external notifications for now)

**Core Flow:**
1. User navigates to Avo Study page showing 5 study spot cards
2. User checks in to a study spot (Doe, Moffitt, etc.)
3. User sets availability status (open to study together / solo study) with optional status note
4. Other users see active check-ins displayed on each spot's card with colored status indicators
5. Users can send join requests to "open" users via in-app messaging

---

## Design Philosophy (Aligned with Cody Design System)

### Visual Direction - Card-Based Interface
- **Layout:** Single page with 5 study spot cards, one for each location
- **Study spot cards:** 
  - White background (#FFFFFF)
  - Subtle borders (1px #e5e5e5)
  - 12px border radius
  - 32px padding
  - Header: Spot name (bold, 20-24px, forest green #4A6B4A)
  - Subheader: Hours (regular, 16px, muted text)
  
### Status Color System (Cody palette)
- **"Open" status:** Coral (#E89B8E) or Sage Green (#7A9A7A) badge
  - Indicates user is available to study together
- **"Solo" status:** Sky Blue (#A8C8E8) or muted gray badge
  - Indicates user prefers focused solo work

### UI Components Style
- **Check-in buttons:** Pill-shaped primary buttons (#5B9B7E) with white text
- **Status badges:** Small rounded pills (8px padding, 12px text)
- **Section headers:** Yellow background bars (#F4F0B8) if needed
- **Typography:** Inter/Poppins sans-serif, 16-18px body, bold headers

---

## Tech Stack Recommendations

### Frontend
**Current Stack (keep):**
- Next.js 15.3.4, React 19, TypeScript
- Bootstrap 5.3.7 (supplement with custom CSS for Cody design system)

**New Dependencies (MVP - minimal):**
```json
{
  "date-fns": "^3.0.0"             // Time/duration calculations and formatting
}
```

**No map dependencies needed for MVP** - Simple card layout using existing Bootstrap grid

### Backend (Firebase)
**Existing Services (sufficient for MVP):**
- Firebase Auth (already integrated)
- Firestore (already integrated)

**Future Enhancements (not needed for MVP):**
- Cloud Functions (for auto-cleanup of expired check-ins)
- Cloud Messaging (for push notifications)
- External integrations (Slack, SMS)

---

## Data Model Design

### Firestore Collections

#### 1. `study_spots` (static configuration)
```typescript
{
  id: string,                    // "doe-library"
  name: string,                  // "Doe Library"
  hours: string                  // "8:00 AM - 12:00 AM"
}
```

**Initial Spots to Seed:**
- Doe Library (8:00 AM - 12:00 AM)
- Moffitt Library (24 Hours)
- Main Stacks (8:00 AM - 10:00 PM)
- MLK Student Union (7:00 AM - 11:00 PM)
- Kresge Engineering Library (8:00 AM - 11:00 PM)

#### 2. `check_ins` (active user sessions)
```typescript
{
  id: string,                    // Auto-generated
  userId: string,                // Foreign key to users collection
  spotId: string,                // Foreign key to study_spots
  status: "open" | "solo",       // Availability status
  statusNote?: string,           // Optional custom status (120 char max)
  startedAt: Timestamp,
  expiresAt: Timestamp,
  isActive: boolean              // False when expired or manually checked out
}
```

**Indexes needed:**
- `spotId + isActive + startedAt` (for roster queries, sorted by most recent)
- `userId + isActive` (to check if user has active check-in)

#### 3. `study_requests` (buddy requests)
```typescript
{
  id: string,
  fromUserId: string,
  toUserId: string,
  message: string,               // 500 char max
  status: "pending" | "accepted" | "declined",
  sentAt: Timestamp
}
```

**Indexes needed:**
- `toUserId + status + sentAt` (for inbox queries, sorted by most recent)

#### 4. `users` (no changes for MVP)
Use existing fields:
- `uid` - User ID
- `username` - Display name
- `kao` - Kaomoji avatar

No new fields needed for MVP.

---

## Component Breakdown

### Page Structure (MVP - Simplified)
```
/avo_study
└── page.tsx                    // Single page with all 5 study spot cards
```

**Future pages (post-MVP):**
- `/avo_study/inbox` - Study request inbox
- `/avo_study/my-check-in` - Manage current check-in

### Core Components to Build (MVP)

#### 1. `StudySpotCard.tsx`
**Purpose:** Card displaying a study spot with live roster of checked-in users

**Props:**
```typescript
interface StudySpotCardProps {
  spot: StudySpot;                // { id, name, hours }
  checkIns: PopulatedCheckIn[];   // Active check-ins at this spot
  onCheckIn: (spotId: string) => void;
  onSendRequest: (toUserId: string) => void;
}
```

**Design (Cody style):**
- White background (#FFFFFF)
- 1px border (#e5e5e5)
- 12px border radius
- 32px padding
- Header: Spot name (bold, 20-24px, forest green #4A6B4A)
- Subheader: Hours (regular, 16px, muted)
- Active count badge: "(3 studying)" in muted text
- Roster section: List of checked-in users with:
  - Kaomoji avatar
  - Username
  - Colored status badge (coral for "open", sky blue for "solo")
  - Optional status note
  - "Send Request" button (only for "open" users, not self)
- Check-in button at bottom: Primary green pill button

#### 2. `CheckInModal.tsx`
**Purpose:** Modal for creating a new check-in

**Props:**
```typescript
interface CheckInModalProps {
  spot: StudySpot;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: CheckInData) => Promise<void>;
}

interface CheckInData {
  duration: number;               // minutes
  status: "open" | "solo";
  statusNote?: string;            // Optional 120 char message
}
```

**Design:**
- Centered modal, max-width 500px
- Header: "Check in to {spot name}" (bold, 20px)
- Duration picker: Button group with presets (30m, 1h, 2h, 3h, 4h)
- Status radio buttons: "Open to study together" / "Solo study"
- Optional note textarea: 120 char limit with character counter
- Primary button: "Check In" (pill shape, green #5B9B7E)

**That's it for MVP components!** 

Additional components can be added post-MVP:
- `StudyRequestModal` - For sending messages to other users
- `StudyRequestInbox` - Inbox for managing requests
- `MyCheckInBanner` - Top banner showing current check-in status

---

## Backend Implementation (MVP - Simplified)

### No Cloud Functions for MVP
For the initial version, we'll handle expired check-ins client-side:
- When querying check-ins, filter by `expiresAt > now()` 
- Optionally: Manually set `isActive = false` when user checks out
- Future: Add scheduled Cloud Function for cleanup

### Client-Side Expiry Handling
```typescript
// In your query
const now = Timestamp.now();
const activeCheckIns = query(
  collection(db, 'check_ins'),
  where('spotId', '==', spotId),
  where('isActive', '==', true),
  where('expiresAt', '>', now)  // Only get non-expired
);
```

### Removed for MVP (add later):
- Cloud Functions for scheduled cleanup
- Slack/iMessage notifications  
- Push notifications

---

## Next.js API Routes (Optional for MVP)

You can implement these directly in your components using Firestore SDK, or create API routes for cleaner separation:

**Basic CRUD operations can be done directly with Firestore SDK in components:**

```typescript
// Create check-in
await addDoc(collection(db, 'check_ins'), {
  userId: auth.currentUser.uid,
  spotId: selectedSpot.id,
  status: 'open',
  statusNote: 'Working on CS 61A',
  startedAt: Timestamp.now(),
  expiresAt: Timestamp.fromDate(new Date(Date.now() + duration * 60000)),
  isActive: true
});

// Check out (manual)
await updateDoc(doc(db, 'check_ins', checkInId), {
  isActive: false
});

// Send study request (future)
await addDoc(collection(db, 'study_requests'), {
  fromUserId: auth.currentUser.uid,
  toUserId: recipientId,
  message: 'Hey, want to study together?',
  status: 'pending',
  sentAt: Timestamp.now()
});
```

---

## Real-Time Updates Strategy

### Firestore Listeners Setup

**Component: `StudySpotCard` - Listen to check-ins for each spot**
```typescript
useEffect(() => {
  if (!spotId) return;
  
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'check_ins'),
      where('spotId', '==', spotId),
      where('isActive', '==', true),
      orderBy('startedAt', 'desc')
    ),
    (snapshot) => {
      const checkIns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CheckIn));
      
      setActiveCheckIns(checkIns);
    },
    (error) => {
      console.error('Error listening to check-ins:', error);
    }
  );
  
  return () => unsubscribe();
}, [spotId]);
```

**Optimization:**
- Use pagination (limit to 50 most recent check-ins)
- Debounce rapid updates
- Unsubscribe when component unmounts

---

## Privacy & Moderation

### Privacy Controls
**Settings Page:** `/avo_study/settings`

Toggles:
- [ ] Show me on the map when checked in (default: true)
- [ ] Allow study requests from strangers (default: true)
- [ ] Send Slack notifications (default: false)
- [ ] Send iMessage notifications (default: false)

### Content Moderation
**Auto-filter for study requests:**
- Banned words list (profanity, spam)
- Auto-decline if message contains banned words
- Flag for manual review after 3 reports

**Rate Limiting:**
- Max 8 new study request threads per hour
- Max 20 messages per thread per hour
- 30-second cooldown between messages

---

## Testing Strategy

### Unit Tests
- Check-in creation logic
- Duration calculation (expiry time)
- Rate limiting functions
- Content moderation filters

### Integration Tests
- Full check-in → roster display flow
- Study request send → receive → accept flow
- Real-time listener updates
- Cleanup job execution

### E2E Tests (Playwright)
1. User checks in to Doe Library
2. Another user sees check-in on map
3. User sends study request
4. Recipient receives notification
5. Recipient accepts request

---

## Performance Considerations

### Firestore Query Optimization
- Add compound indexes for frequent queries:
  ```
  check_ins: [spotId ASC, isActive ASC, startedAt DESC]
  study_requests: [toUserId ASC, status ASC, sentAt DESC]
  ```
- Use pagination (limit queries to 50 documents)
- Cache spot data (rarely changes)

### Real-Time Listener Costs
- Firestore charges per document read
- Limit active listeners to 1-2 per page
- Use `onSnapshot` with query limits

### Card Rendering Performance
- Lazy render check-in user avatars (load kaomojis on-demand)
- Limit rendered check-ins per card (e.g., show first 10, "Show more" button for rest)

---

## Deployment Checklist (MVP)

### Prerequisites
- [ ] Seed 5 study spots in Firestore (use `seedStudySpots.ts` script)
- [ ] Create 3 composite indexes in Firestore (see FIRESTORE_SETUP.md)
- [ ] Update Firestore security rules

### Deployment Steps
1. **Backend**: Seed study spots and set up indexes
2. **Security**: Deploy Firestore security rules  
3. **Frontend**: Deploy Next.js app to Vercel
4. **Test**: Create test check-in and verify real-time updates work

### No environment variables needed for MVP
(No Cloud Functions, no external API integrations)

---

## Success Metrics (Post-Launch)

**Week 1:**
- 30+ unique check-ins across all spots
- 10+ study requests sent
- < 5% error rate on check-ins
- 80%+ notification delivery rate

**Month 1:**
- 300+ total check-ins
- 20% study request acceptance rate
- 3+ daily active users per spot
- < 2% spam/abuse reports

---

## Future Enhancements (Post-MVP)

### Near-term (Phase 2)
- [ ] In-app study request messaging
- [ ] Inbox for managing study requests
- [ ] Active check-in banner at top of page
- [ ] Manual check-out and extend duration features

### Long-term  
- [ ] Interactive campus map interface
- [ ] Slack/iMessage notifications
- [ ] Cloud Functions for auto-cleanup
- [ ] Group study sessions (3+ people)
- [ ] Study spot reviews/ratings
- [ ] Calendar integration (schedule future check-ins)
- [ ] Study streak badges
- [ ] Desktop notifications (PWA)

---

## Risk Mitigation

**High-Priority Risks:**
1. **Spam/Harassment:** Quick block/report, auto-hide after 3 reports
2. **Stale Check-Ins:** Aggressive auto-expire (max 4 hours), reminders at 15min
3. **Privacy Concerns:** Clear opt-in messaging, minimal data retention (7 days max)
4. **Slack Spam:** Batch notifications, opt-out by default
5. **Rate Limiting Abuse:** Start conservative (5 requests/hour), monitor and adjust

**Technical Risks:**
1. **Real-Time Listener Costs:** Use pagination, limit to 50 docs, cache spot data
2. **Function Cold Starts:** Pre-warm critical functions, use min instances
3. **Concurrent Writes:** Use Firestore transactions for critical operations

---

## Appendix: Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Study spots (read-only for all authenticated users)
    match /study_spots/{spotId} {
      allow read: if request.auth != null;
      allow write: if false; // Admin-only via console
    }
    
    // Check-ins
    match /check_ins/{checkInId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid
        && !exists(/databases/$(database)/documents/check_ins/$(request.auth.uid + '_active'));
      allow update, delete: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
    
    // Study requests
    match /study_requests/{requestId} {
      allow read: if request.auth != null 
        && (resource.data.fromUserId == request.auth.uid 
         || resource.data.toUserId == request.auth.uid);
      allow create: if request.auth != null 
        && request.resource.data.fromUserId == request.auth.uid;
      allow update: if request.auth != null 
        && resource.data.toUserId == request.auth.uid;
    }
    
    // Users (extend existing rules)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

**Document Version:** 3.0 (MVP - Card-Based Interface)  
**Last Updated:** November 2024  
**Status:** Ready for MVP Implementation

---

## MVP Summary

**What's included:**
- 5 study spot cards on single page
- Check-in with duration, status, and optional note
- Real-time roster display with colored status badges
- Client-side expiry handling
- Simple Firestore schema (3 collections, minimal fields)

**What's deferred:**
- Map interface
- External notifications (Slack/iMessage)
- Cloud Functions
- Study request messaging system
- Advanced features (groups, ratings, calendar, etc.)
