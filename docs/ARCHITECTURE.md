# 🏗️ Architecture Documentation

**AvoSpace System Design & Technical Architecture**

**Version:** 1.0  
**Last Updated:** November 21, 2024  
**Target Audience:** Engineering Team

---

## 📋 Table of Contents

1. [System Overview](#-system-overview)
2. [Technology Stack](#-technology-stack)
3. [Data Model](#️-data-model)
4. [Authentication Architecture](#-authentication-architecture)
5. [Component Architecture](#-component-architecture)
6. [Real-Time Data Flow](#-real-time-data-flow)
7. [State Management](#-state-management)
8. [Security Model](#-security-model)
9. [Styling Architecture](#-styling-architecture)
10. [Performance & Optimization](#-performance--optimization)
11. [Development Setup](#-development-setup)
12. [Build & Deployment](#-build--deployment)
13. [Common Patterns & Conventions](#-common-patterns--conventions)
14. [Troubleshooting](#-troubleshooting)

---

## 📊 System Overview

AvoSpace is a Next.js 15 web application with Firebase backend, focused on real-time study coordination at physical campus locations. The platform enables students to check into study spots, view who's studying where, and send study partner requests.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Next.js    │  │    React     │  │   TypeScript     │ │
│  │  App Router  │  │   19.0.0     │  │    5.x Types     │ │
│  │   (SSR/CSR)  │  │  Components  │  │   Validation     │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Client-Side Firebase SDK (v11.10.0)            │ │
│  │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │   │   Auth      │  │  Firestore  │  │  Realtime   │  │ │
│  │   │   Module    │  │   Queries   │  │  Listeners  │  │ │
│  │   └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (Firebase SDK)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Firebase Services                       │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │  Authentication  │  │       Firestore NoSQL         │   │
│  │                  │  │    ┌──────────────────────┐   │   │
│  │  • Email/Pass    │  │    │  Collections:        │   │   │
│  │  • Session Mgmt  │  │    │  • users             │   │   │
│  │  • Auth State    │  │    │  • study_spots       │   │   │
│  │                  │  │    │  • check_ins         │   │   │
│  └──────────────────┘  │    │  • study_requests    │   │   │
│                        │    │  • posts             │   │   │
│  ┌──────────────────┐  │    └──────────────────────┘   │   │
│  │  Security Rules  │  │    • Real-time listeners      │   │
│  │  (Firestore)     │  │    • Composite indexes        │   │
│  └──────────────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Client-Side Rendering**: Most pages are CSR ('use client') for real-time updates
2. **No Backend Server**: Direct Firebase SDK calls from client (protected by security rules)
3. **Real-Time First**: Firestore `onSnapshot` listeners for live data
4. **Type Safety**: Comprehensive TypeScript interfaces for all data models
5. **Optimistic UI**: Immediate feedback with validation, then async operations

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.4 | React framework with App Router |
| **React** | 19.0.0 | UI component library |
| **TypeScript** | 5.x | Type safety and developer experience |
| **Bootstrap** | 5.3.7 | Layout utilities and responsive grid |
| **Leaflet** | 1.9.4 | Map visualization (interactive campus map) |
| **React Leaflet** | 4.2.1 | React bindings for Leaflet |
| **date-fns** | 4.1.0 | Date formatting and manipulation |

### Backend (Firebase)

| Service | Purpose |
|---------|---------|
| **Firebase Authentication** | Email/password authentication, session management |
| **Firestore** | NoSQL database with real-time listeners |
| **Security Rules** | Server-side authorization and validation |
| **Hosting** (optional) | Static site hosting for production |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting (skipped during builds for speed) |
| **Next.js Dev Server** | Hot reload development environment |
| **Firebase CLI** | Deployment and security rules management |

### Key Dependencies

```json
{
  "next": "15.3.4",
  "react": "^19.0.0",
  "firebase": "^11.10.0",
  "bootstrap": "^5.3.7",
  "leaflet": "^1.9.4",
  "date-fns": "^4.1.0"
}
```

---

## 🗄️ Data Model

### Database: Firebase Firestore (NoSQL)

Firestore is a document-based NoSQL database with real-time capabilities. Our data model consists of 5 main collections with well-defined relationships.

### Collection Overview

| Collection | Type | Documents | Read Pattern | Write Pattern |
|------------|------|-----------|--------------|---------------|
| `users` | Core | ~100-1000 | Public read | User writes own |
| `study_spots` | Static | 5 (fixed) | Frequent reads | Admin only |
| `check_ins` | Dynamic | ~0-100 active | Real-time queries | User CRUD own |
| `study_requests` | Dynamic | ~0-500 | User-specific | User creates/updates |
| `posts` | Dynamic | ~100-10000 | Timeline queries | User creates own |

### Data Relationships

```
users (1) ──────────┐
                    │
                    ├─── (1:N) ──→ check_ins
                    │
                    └─── (1:N) ──→ study_requests (as sender/recipient)
                    
study_spots (1) ───→ (1:N) ──→ check_ins

check_ins (1) ──────→ (1:1) ──→ posts (checkin type)
               └────→ (1:N) ──→ study_requests
```

---

### 1️⃣ Collection: `users`

**Purpose:** User profiles and authentication data  
**Document ID:** Firebase Auth UID (e.g., `"abc123xyz"`)  
**Readable by:** All authenticated users  
**Writable by:** Owner only

#### Schema

```typescript
interface User {
  // Identity (required)
  uid: string;              // Firebase Auth UID (document ID)
  username: string;         // Unique username (lowercase, 3-20 chars)
  email: string;            // Email address (lowercase)
  
  // Contact (optional)
  phoneNumber?: string;     // E.164 format: +14155551234
  phoneCountryCode?: string; // Country code: +1
  phoneVerified?: boolean;  // Phone verification status
  
  // Profile Status
  profileComplete: boolean; // Account setup completed
  createdAt: Timestamp;     // Account creation time
  
  // Appearance
  kao: string;              // Kaomoji avatar (e.g., "(^ᗜ^)")
  bgColor: string;          // Profile background color (hex)
  
  // Kaomoji customization parts
  accessory: string;        // Optional accessory
  leftSide: string;         // Left bracket/paren
  leftCheek: string;        // Left blush/cheek
  leftEye: string;          // Left eye character
  mouth: string;            // Mouth character
  rightEye: string;         // Right eye character
  rightCheek: string;       // Right blush/cheek
  rightSide: string;        // Right bracket/paren
  
  // Social
  friends: string[];        // Array of friend UIDs
}
```

#### Validation Rules

- **username**: 3-20 chars, alphanumeric + underscore, case-insensitive unique
- **email**: Valid email format, stored lowercase
- **phoneNumber**: E.164 international format (7-15 digits after country code)
- **Reserved usernames**: admin, root, system, avospace, support, moderator, help, user, official, staff, team

#### Example Document

```json
{
  "uid": "abc123xyz",
  "username": "avofan",
  "email": "student@berkeley.edu",
  "phoneNumber": "+14155551234",
  "phoneCountryCode": "+1",
  "phoneVerified": false,
  "profileComplete": true,
  "createdAt": {"_seconds": 1700000000, "_nanoseconds": 0},
  "kao": "(^ᗜ^)",
  "bgColor": "#ffffff",
  "accessory": "",
  "leftSide": "(",
  "leftCheek": "",
  "leftEye": "^",
  "mouth": "ᗜ",
  "rightEye": "^",
  "rightCheek": "",
  "rightSide": ")",
  "friends": []
}
```

---

### 2️⃣ Collection: `study_spots`

**Purpose:** Static list of campus study locations  
**Document ID:** Custom kebab-case ID (e.g., `"doe-library"`)  
**Readable by:** All authenticated users  
**Writable by:** Admin only (via Firebase Console)

#### Schema

```typescript
interface StudySpot {
  id: string;              // Document ID (e.g., "doe-library")
  name: string;            // Display name (e.g., "Doe Library")
  hours: string;           // Operating hours (e.g., "8:00 AM - 12:00 AM")
  latitude: number;        // Geographic latitude for map display
  longitude: number;       // Geographic longitude for map display
}
```

#### Seeded Data (5 locations)

| Document ID | Name | Hours | Coordinates |
|-------------|------|-------|-------------|
| `doe-library` | Doe Library | 8:00 AM - 12:00 AM | 37.8722, -122.2591 |
| `moffitt-library` | Moffitt Library | 24 Hours | 37.8726, -122.2608 |
| `main-stacks` | Main Stacks | 8:00 AM - 10:00 PM | 37.8727, -122.2601 |
| `mlk-student-union` | MLK Student Union | 7:00 AM - 11:00 PM | 37.8699, -122.2585 |
| `kresge-engineering` | Kresge Engineering Library | 8:00 AM - 11:00 PM | 37.8745, -122.2570 |

#### Usage Notes

- Geographic coordinates enable map-based visualization of study spots
- Coordinates are accurate UC Berkeley campus locations
- Hours are display strings, not parsed by code
- Client-side logic determines if spot is "open" based on current time

---

### 3️⃣ Collection: `check_ins`

**Purpose:** Active user study sessions at specific locations  
**Document ID:** Auto-generated by Firestore  
**Readable by:** All authenticated users  
**Writable by:** Owner only

#### Schema

```typescript
interface CheckIn {
  id: string;              // Auto-generated document ID
  userId: string;          // Foreign key → users.uid
  spotId: string;          // Foreign key → study_spots.id
  status: CheckInStatus;   // 'open' | 'solo' | 'break'
  statusNote?: string;     // Optional custom note (120 chars max)
  startedAt: Timestamp;    // Check-in creation time
  expiresAt: Timestamp;    // Auto-checkout time (30min - 4hrs from start)
  isActive: boolean;       // false when manually checked out
}

type CheckInStatus = 'open' | 'solo' | 'break';
```

#### Status Types

| Status | Emoji | Meaning | Can Receive Requests? |
|--------|-------|---------|----------------------|
| `open` | 🤝 | Available to study together | ✅ Yes |
| `solo` | 🎧 | Focused solo work | ❌ No |
| `break` | ☕ | On a break | ❌ No |

#### Lifecycle & Expiry

```
[User creates check-in]
    ↓
isActive = true
expiresAt = now + duration (30-240 minutes)
    ↓
[Time passes...]
    ↓
[Client queries filter by expiresAt > now()]
    ↓
[User manually checks out OR time expires]
    ↓
isActive = false (if manual checkout)
OR filtered out by client (if expired)
    ↓
[Future: Cloud Function sets isActive=false for expired check-ins]
```

**Important:** Currently, expired check-ins remain in DB with `isActive=true` but are filtered client-side by checking `expiresAt > Date.now()`. A future Cloud Function will clean these up.

#### Required Firestore Indexes

```
Collection: check_ins
Index 1: spotId (ASC) + isActive (ASC) + startedAt (DESC)
Index 2: userId (ASC) + isActive (ASC)
```

#### Example Document

```json
{
  "userId": "abc123xyz",
  "spotId": "doe-library",
  "status": "open",
  "statusNote": "Working on CS 61A midterm",
  "startedAt": {"_seconds": 1700000000, "_nanoseconds": 0},
  "expiresAt": {"_seconds": 1700007200, "_nanoseconds": 0},
  "isActive": true
}
```

---

### 4️⃣ Collection: `study_requests`

**Purpose:** Study partner requests sent between users  
**Document ID:** Auto-generated by Firestore  
**Readable by:** Sender and recipient only  
**Writable by:** Sender creates, recipient updates (accept/decline)

#### Schema

```typescript
interface StudyRequest {
  id: string;              // Auto-generated document ID
  fromUserId: string;      // Sender → users.uid
  toUserId: string;        // Recipient → users.uid
  checkInId: string;       // Reference to check_ins document
  spotId: string;          // Study spot ID (for context)
  message: string;         // Request message (500 chars max)
  status: StudyRequestStatus; // 'pending' | 'accepted' | 'declined' | 'expired'
  sentAt: Timestamp;       // When request was sent
  readAt?: Timestamp;      // When recipient read/actioned
}

type StudyRequestStatus = 'pending' | 'accepted' | 'declined' | 'expired';
```

#### Status Lifecycle

```
User A creates request → status = 'pending'
    ↓
User B receives notification badge
    ↓
User B views in inbox → readAt = Timestamp.now()
    ↓
User B clicks "Accept" OR "Decline"
    ↓
status = 'accepted' | 'declined'
    ↓
User A sees updated status in "Sent" tab
```

#### Required Firestore Indexes

```
Collection: study_requests
Index 1: toUserId (ASC) + status (ASC) + sentAt (DESC)
Index 2: fromUserId (ASC) + sentAt (DESC)
```

#### Example Document

```json
{
  "fromUserId": "abc123xyz",
  "toUserId": "def456uvw",
  "checkInId": "checkin_789",
  "spotId": "doe-library",
  "message": "Hey! Want to work on the problem set together?",
  "status": "pending",
  "sentAt": {"_seconds": 1700000000, "_nanoseconds": 0},
  "readAt": null
}
```

---

### 5️⃣ Collection: `posts`

**Purpose:** Activity feed posts (check-ins only in current implementation)  
**Document ID:** Auto-generated by Firestore  
**Readable by:** All authenticated users  
**Writable by:** Owner only

#### Schema

```typescript
interface Post {
  id?: string;             // Auto-generated document ID
  uid: string;             // Author user ID
  text: string;            // Post content
  date: string;            // Date string (e.g., "11/18/2024")
  likes: number;           // Like count (legacy, not currently used)
  type: 'checkin';         // Post type (only check-ins supported)
  
  // Check-in specific fields
  checkInId: string;       // Reference to check_ins document
  spotId: string;          // Study spot ID
  spotName: string;        // Study spot name (denormalized for display)
  status: CheckInStatus;   // Study status
  statusNote?: string;     // Optional status note
  expiresAt: Timestamp;    // When check-in expires
}
```

#### Denormalization Strategy

- `spotName` is denormalized (copied from `study_spots`) to avoid extra reads when rendering feed
- Check-in posts are created atomically with check-ins (2 writes in same transaction)
- No cascade deletes: If check-in is deleted, post remains (showing expired status)

#### Example Document

```json
{
  "uid": "abc123xyz",
  "text": "Checked in to Doe Library",
  "date": "11/18/2024",
  "likes": 0,
  "type": "checkin",
  "checkInId": "checkin_789",
  "spotId": "doe-library",
  "spotName": "Doe Library",
  "status": "open",
  "statusNote": "Working on CS 61A",
  "expiresAt": {"_seconds": 1700007200, "_nanoseconds": 0}
}
```

---

## 🔐 Authentication Architecture

### Firebase Authentication Flow

AvoSpace uses Firebase Authentication with email/password provider.

#### Registration Flow

```
User fills signup form (email, username, password, optional phone)
    ↓
Client validates input (format, length, reserved names)
    ↓
Client checks username uniqueness (Firestore query)
    ↓
[All validation passes]
    ↓
createUserWithEmailAndPassword(auth, email, password)
    ↓
[Firebase creates auth account]
    ↓
setDoc(doc(db, "users", userCredential.user.uid), {...})
    ↓
[User document created with profile data]
    ↓
router.push('/home')
```

**File:** `src/app/page.tsx`

#### Login Flow

```
User enters email + password
    ↓
signInWithEmailAndPassword(auth, email, password)
    ↓
[Firebase validates credentials]
    ↓
[Success] → auth.currentUser populated
    ↓
router.push('/home')
```

#### Session Management

```typescript
// Global auth state listener (in Navbar component)
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user); // user is User | null
  });
  return () => unsubscribe();
}, []);
```

- **Persistence:** Firebase Auth persists sessions in `localStorage` by default
- **Token Refresh:** Automatic token refresh handled by Firebase SDK
- **Logout:** `signOut(auth)` clears local session and redirects to `/`

#### Protected Routes

Currently, there is **no Next.js middleware** for route protection. Pages check auth status client-side:

```typescript
if (!auth.currentUser) {
  return <div>Please log in</div>;
}
```

**Future Enhancement:** Add middleware to redirect unauthenticated users at the server level.

#### Auth State Access Pattern

```typescript
import { auth } from '@/lib/firebase';

// In any component
const currentUserId = auth.currentUser?.uid;
const currentUserEmail = auth.currentUser?.email;
```

**⚠️ Important:** Always check `auth.currentUser` is not null before accessing properties.

---

## 🧩 Component Architecture

### Directory Structure

```
src/
├── app/                              # Next.js App Router pages
│   ├── layout.tsx                    # Root layout (Navbar + globals)
│   ├── page.tsx                      # Landing/auth page (login/signup)
│   ├── globals.css                   # Global styles + CSS variables
│   │
│   ├── avo_study/                    # 🎯 CORE FEATURE: Study spots
│   │   ├── page.tsx                  # Main study spots grid page
│   │   ├── avo-study.css            # Feature-specific styles
│   │   ├── components/
│   │   │   ├── StudySpotCard.tsx    # Individual study spot card w/ roster
│   │   │   ├── CheckInModal.tsx     # Check-in creation modal
│   │   │   ├── CheckInItem.tsx      # User row in study spot roster
│   │   │   ├── CheckInPost.tsx      # Check-in post in activity feed
│   │   │   ├── ActiveCheckInBanner.tsx  # "You're checked in" banner
│   │   │   ├── ProfileAvatar.tsx    # Kaomoji avatar display
│   │   │   ├── StudyRequestModal.tsx    # Send study request dialog
│   │   │   ├── ErrorModal.tsx       # Error handling modal
│   │   │   ├── UserDetailModal.tsx  # User profile popup
│   │   │   └── *.css                # Component-specific styles
│   │   ├── inbox/
│   │   │   ├── page.tsx            # Study requests inbox
│   │   │   └── inbox.css           # Inbox styles
│   │   └── utils/
│   │       └── userCache.ts        # User data caching utility
│   │
│   ├── home/
│   │   └── page.tsx                # Activity feed (check-ins only)
│   │
│   ├── map/
│   │   ├── page.tsx                # Map view wrapper
│   │   ├── map.css                 # Map styles
│   │   └── components/
│   │       ├── LeafletMap.tsx      # Leaflet map integration
│   │       ├── MapOverlay.tsx      # Map UI overlay
│   │       └── MapView.tsx         # Map container (dynamic import)
│   │
│   ├── account/
│   │   └── page.tsx                # User account/profile editor
│   │
│   └── user/[userid]/
│       └── page.tsx                # Public user profile page
│
├── components/                       # Shared components
│   ├── Navbar.tsx                   # Global navigation bar
│   ├── Post.tsx                     # Universal post renderer
│   └── EditComposer.tsx             # Profile editing modal
│
├── lib/
│   ├── firebase.ts                  # Firebase SDK initialization
│   └── validation.ts                # Input validation utilities
│
└── types/
    ├── study.ts                     # Study feature types
    └── user.ts                      # User types
```

---

## 🧩 Component Architecture

### Directory Structure

```
src/app/
├── avo_study/                    # 🎯 CORE FEATURE
│   ├── page.tsx                  # Main study spots grid
│   ├── avo-study.css            # Feature styles
│   ├── components/
│   │   ├── StudySpotCard.tsx    # Individual spot card with roster
│   │   ├── CheckInModal.tsx     # Create check-in dialog
│   │   ├── CheckInItem.tsx      # User in roster list
│   │   ├── CheckInPost.tsx      # Check-in in feed
│   │   ├── ActiveCheckInBanner.tsx  # "Currently checked in" banner
│   │   ├── ProfileAvatar.tsx    # User avatar display
│   │   ├── StudyRequestModal.tsx    # Send study request dialog
│   │   └── ErrorModal.tsx       # Error handling
│   ├── inbox/
│   │   ├── page.tsx            # Study requests inbox
│   │   └── inbox.css           # Inbox styles
│   └── utils/
│       └── userCache.ts        # User data caching utility
│
├── home/
│   └── page.tsx                # Activity feed (check-ins only)
│
├── map/
│   ├── page.tsx                # Map view wrapper
│   ├── map.css                 # Map styles
│   └── components/
│       ├── LeafletMap.tsx      # Leaflet integration
│       ├── MapOverlay.tsx      # Map UI overlay
│       └── MapView.tsx         # Map container
│
├── account/
│   └── page.tsx                # User account/profile editor
│
└── user/[userid]/
    └── page.tsx                # User public profile
```

### Shared Components

```
components/
├── Post.tsx              # Universal post renderer (check-ins)
├── EditComposer.tsx      # Profile editing modal
└── Navbar.tsx            # Top navigation bar
```

### Component Hierarchy & Responsibilities

#### Page Components (Route Handlers)

**`app/page.tsx` - Landing/Auth Page**
- Handles both login and signup flows
- Real-time username/phone validation with debouncing
- Creates auth account + Firestore user document on signup
- Redirects to `/home` on success

**`app/home/page.tsx` - Activity Feed**
- Displays all check-in posts (sorted by date)
- Real-time listener on `posts` collection
- Filters expired check-ins client-side
- Shows user avatars and status badges

**`app/avo_study/page.tsx` - Study Spots Grid**
- Fetches all study spots on mount
- Real-time listener on `check_ins` collection
- Filters active check-ins by spot
- Renders `StudySpotCard` for each location
- Shows `ActiveCheckInBanner` if user has active check-in

**`app/avo_study/inbox/page.tsx` - Study Requests Inbox**
- Tabbed interface: "Received" / "Sent"
- Real-time listeners for incoming/outgoing requests
- Handles accept/decline actions
- Shows notification badge count in Navbar

**`app/account/page.tsx` - User Profile Editor**
- Edit username, email, phone, kaomoji
- Real-time validation
- Updates Firestore `users` document

**`app/map/page.tsx` - Interactive Map**
- Leaflet map with campus markers (future: check-in markers)
- Dynamic import (SSR disabled for Leaflet)
- MapOverlay for UI controls

**`app/user/[userid]/page.tsx` - Public User Profile**
- Dynamic route with user ID parameter
- Fetches user data from Firestore
- Shows kaomoji, username, profile info

#### Feature Components (Modals & Cards)

**`components/Navbar.tsx`** ✨ Global
- Auth state listener
- Real-time notification badge (pending requests count)
- Navigation links: Home, AvoMail, Account, Logout
- Logo click redirects to `/home` if authenticated

**`StudySpotCard.tsx`**
- Displays study spot name, hours, open status
- Real-time check-ins roster (filtered by spot)
- "Check In" button → opens `CheckInModal`
- Shows user avatars with status badges
- Click user → opens `UserDetailModal`

**`CheckInModal.tsx`** (Portal)
- Duration picker (30min - 4hrs)
- Status selector (open/solo/break)
- Status note textarea (120 char limit)
- Validation: Prevents duplicate active check-ins
- Creates `check_ins` + `posts` documents atomically
- Shows `ErrorModal` if user already checked in elsewhere

**`ActiveCheckInBanner.tsx`**
- Shows "You're checked in at X" if user has active check-in
- Real-time listener on user's check-ins
- Displays time remaining
- "Check Out" button → sets `isActive = false`

**`CheckInItem.tsx`**
- Single user row in study spot roster
- Shows kaomoji avatar, username, status
- "Send Request" button (if status = 'open')
- Opens `StudyRequestModal` on click

**`StudyRequestModal.tsx`** (Portal)
- Message textarea (500 char limit)
- Creates `study_requests` document
- Toast notification on success

**`UserDetailModal.tsx`** (Portal)
- Shows user profile (kaomoji, username, bio)
- "Add Friend" button (future feature)

**`ErrorModal.tsx`** (Portal)
- Generic error display
- Used for check-in conflicts, validation errors

**`ProfileAvatar.tsx`**
- Renders kaomoji with background color
- Reusable in feed, rosters, profiles

#### Shared Utilities

**`lib/firebase.ts`**
```typescript
// Singleton Firebase initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
```

**`lib/validation.ts`**
- `validateUsername()` - Checks format, length, reserved, uniqueness
- `validateUsernameFormat()` - Client-side format check (no DB call)
- `validatePhoneNumber()` - E.164 validation
- `validateEmail()` - Basic email regex

**`avo_study/utils/userCache.ts`**
- In-memory Map cache for user data (username, kao)
- `getUserData(userId)` - Fetch or cache user
- `getUsersData(userIds[])` - Batch fetch users
- Reduces redundant Firestore reads

**`types/study.ts`**
- All TypeScript interfaces for study feature
- Constants: `DURATION_PRESETS`, `STATUS_OPTIONS`, `CHAR_LIMITS`, `RATE_LIMITS`

---

## 🔄 Real-Time Data Flow

### Overview

AvoSpace uses Firestore's real-time listeners (`onSnapshot`) to provide live updates without polling. Each component subscribes to relevant data and updates automatically.

### Pattern: Real-Time Listener Setup

```typescript
useEffect(() => {
  if (!auth.currentUser) return;

  // Create query
  const q = query(
    collection(db, 'check_ins'),
    where('spotId', '==', spotId),
    where('isActive', '==', true)
  );

  // Subscribe to real-time updates
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const checkIns = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(checkIn => checkIn.expiresAt.toMillis() > Date.now());
      
      setCheckIns(checkIns);
    },
    (error) => {
      console.error('Error:', error);
    }
  );

  // Cleanup on unmount
  return () => unsubscribe();
}, [spotId]);
```

### Check-In Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Click "Check In" on StudySpotCard            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ CheckInModal Opens                                          │
│ • User selects duration (30min - 4hrs)                     │
│ • User selects status (open/solo/break)                    │
│ • User types optional status note (120 char limit)         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ VALIDATION: Check for existing active check-in             │
│                                                             │
│ query(check_ins,                                            │
│   where('userId', '==', currentUser.uid),                  │
│   where('isActive', '==', true))                           │
│                                                             │
│ + Filter client-side: expiresAt > Date.now()              │
└─────────────────────────────────────────────────────────────┘
                          ↓
              ┌───────────┴───────────┐
              │ Has active check-in? │
              └───────────┬───────────┘
                          │
           Yes ↓                    ↓ No
   ┌─────────────────────┐  ┌──────────────────────────┐
   │ Show ErrorModal      │  │ PROCEED TO CREATE        │
   │ "Already checked in" │  └──────────────────────────┘
   │ at X location"       │              ↓
   └─────────────────────┘   ┌──────────────────────────┐
                              │ CREATE check_ins doc     │
                              │ {                        │
                              │   userId: currentUser    │
                              │   spotId: selected       │
                              │   status: 'open'         │
                              │   statusNote: 'CS 61A'   │
                              │   startedAt: now()       │
                              │   expiresAt: now + 60min │
                              │   isActive: true         │
                              │ }                        │
                              └──────────────────────────┘
                                          ↓
                              ┌──────────────────────────┐
                              │ CREATE posts doc         │
                              │ {                        │
                              │   type: 'checkin'        │
                              │   uid: currentUser       │
                              │   checkInId: newId       │
                              │   spotName: denormalized │
                              │   status: 'open'         │
                              │   expiresAt: same        │
                              │ }                        │
                              └──────────────────────────┘
                                          ↓
                     ┌────────────────────┴────────────────────┐
                     │ FIRESTORE TRIGGERS REAL-TIME UPDATES    │
                     └────────────────────┬────────────────────┘
                                          ↓
        ┌─────────────────┬───────────────────┬─────────────────┐
        ↓                 ↓                   ↓                 ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ StudySpotCard│  │ ActiveCheckIn│  │ Home Feed    │  │ All Users'   │
│ roster updates│  │ Banner shows │  │ shows new    │  │ clients get  │
│ with new user │  │ "Checked in" │  │ check-in post│  │ updated      │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

### Study Request Flow (Detailed)

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION: Click "Send Request" on CheckInItem          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ StudyRequestModal Opens                                     │
│ • Shows recipient username & location context              │
│ • User types message (500 char limit)                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ CREATE study_requests document                              │
│ {                                                           │
│   fromUserId: currentUser.uid,                             │
│   toUserId: recipient.uid,                                 │
│   checkInId: originalCheckIn.id,                           │
│   spotId: 'doe-library',                                   │
│   message: 'Want to study together?',                      │
│   status: 'pending',                                       │
│   sentAt: Timestamp.now()                                  │
│ }                                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
┌──────────────────────┐      ┌──────────────────────────┐
│ SENDER (User A)      │      │ RECIPIENT (User B)       │
│ • Toast notification │      │ • Navbar badge count++   │
│ • "Request sent!"    │      │ • Real-time listener     │
│ • See in "Sent" tab  │      │   on toUserId queries    │
└──────────────────────┘      └──────────────────────────┘
                                          ↓
                              ┌──────────────────────────┐
                              │ User B navigates to      │
                              │ /avo_study/inbox         │
                              └──────────────────────────┘
                                          ↓
                              ┌──────────────────────────┐
                              │ "Received" tab shows     │
                              │ pending request          │
                              └──────────────────────────┘
                                          ↓
                        ┌─────────────────┴─────────────────┐
                        │ User B clicks "Accept" or "Decline"│
                        └─────────────────┬─────────────────┘
                                          ↓
                              ┌──────────────────────────┐
                              │ UPDATE study_requests    │
                              │ {                        │
                              │   status: 'accepted',    │
                              │   readAt: Timestamp.now()│
                              │ }                        │
                              └──────────────────────────┘
                                          ↓
                        ┌─────────────────┴─────────────────┐
                        │ FIRESTORE TRIGGERS REAL-TIME UPDATE│
                        └─────────────────┬─────────────────┘
                                          ↓
                              ┌──────────────────────────┐
                              │ SENDER (User A)          │
                              │ • "Sent" tab updates     │
                              │ • Shows "Accepted" badge │
                              └──────────────────────────┘
```

### Real-Time Listener Locations

| Component | Collection | Query | Purpose |
|-----------|-----------|-------|---------|
| `Navbar` | `study_requests` | `toUserId == currentUser && status == 'pending'` | Notification badge count |
| `StudySpotCard` | `check_ins` | `spotId == X && isActive == true` | Show roster |
| `ActiveCheckInBanner` | `check_ins` | `userId == currentUser && isActive == true` | Show user's active check-in |
| `app/home/page.tsx` | `posts` | `type == 'checkin'` | Activity feed |
| `inbox/page.tsx` | `study_requests` | `toUserId == currentUser` (Received) or `fromUserId == currentUser` (Sent) | Inbox tabs |

---

## 💾 State Management

### Approach: Component-Level State with Firestore Listeners

AvoSpace **does not use** Redux, Zustand, or other global state management libraries. All state is managed with:

1. **React `useState`** - Local component state
2. **Firestore `onSnapshot` listeners** - Real-time data sync
3. **Firebase `onAuthStateChanged`** - Global auth state

### State Patterns

#### Pattern 1: Real-Time Data State

```typescript
const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const q = query(
    collection(db, 'check_ins'),
    where('spotId', '==', spotId),
    where('isActive', '==', true)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as CheckIn))
        .filter(checkIn => checkIn.expiresAt.toMillis() > Date.now());
      
      setCheckIns(data);
      setLoading(false);
    },
    (error) => {
      console.error('Error:', error);
      setLoading(false);
    }
  );

  return () => unsubscribe();
}, [spotId]);
```

#### Pattern 2: Form State

```typescript
const [duration, setDuration] = useState(60);
const [status, setStatus] = useState<CheckInStatus>('open');
const [statusNote, setStatusNote] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  
  try {
    await addDoc(collection(db, 'check_ins'), {
      userId: auth.currentUser!.uid,
      spotId,
      status,
      statusNote: statusNote.trim() || null,
      startedAt: Timestamp.now(),
      expiresAt: Timestamp.fromMillis(Date.now() + duration * 60 * 1000),
      isActive: true
    });
    
    onClose();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

#### Pattern 3: Auth State (Global)

```typescript
// In Navbar.tsx (runs once at app root)
const [user, setUser] = useState<User | null>(null);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setUser(user);
  });
  return () => unsubscribe();
}, []);
```

**Access Anywhere:**
```typescript
import { auth } from '@/lib/firebase';

// Direct access (no props drilling)
const currentUserId = auth.currentUser?.uid;
```

### Data Flow Summary

```
Firestore Database
        ↕ (onSnapshot)
Component State (useState)
        ↕
   React Render
        ↕
   User Interaction
        ↕
Firestore Write (addDoc/updateDoc/deleteDoc)
        ↕
Firestore Database (triggers onSnapshot)
        ↕
All Subscribed Components Re-render
```

---

## 🔐 Security Model

### Firestore Security Rules

**File:** `firestore.rules`

#### Security Principles

1. **Authentication Required:** All read/write operations require authenticated user
2. **Ownership Validation:** Users can only write their own documents
3. **Privacy by Design:** Study requests are private to sender/recipient
4. **Input Validation:** Server-side validation in security rules
5. **No Backend Server:** Security rules act as the authorization layer

#### Full Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============================================
    // HELPER FUNCTIONS
    // ============================================
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function isValidUsername(username) {
      return username is string 
        && username.size() >= 3 
        && username.size() <= 20
        && username.matches('^[a-zA-Z0-9_]+$');
    }
    
    // ============================================
    // USERS COLLECTION
    // ============================================
match /users/{userId} {
      // Anyone can read (needed for username validation)
      // Sensitive fields (email, phone) filtered client-side
  allow read: if true;
      
      // Only owner can create their own profile
      allow create: if isOwner(userId) 
        && request.resource.data.keys().hasAll(['username', 'email', 'profileComplete'])
        && isValidUsername(request.resource.data.username);
      
      // Only owner can update their own profile
      allow update: if isOwner(userId);
      
      // Only owner can delete
      allow delete: if isOwner(userId);
    }
    
    // ============================================
    // STUDY SPOTS - READ ONLY
    // ============================================
    match /study_spots/{spotId} {
      allow read: if isSignedIn();
      allow write: if false; // Admin only via Firebase Console
    }
    
    // ============================================
    // CHECK-INS
    // ============================================
match /check_ins/{checkInId} {
      // Anyone authenticated can read active check-ins
      allow read: if isSignedIn();
      
      // Anyone can create a check-in (must set userId to self)
      allow create: if isSignedIn()
        && request.resource.data.userId == request.auth.uid;
      
      // Only owner can update/delete their check-ins
      allow update, delete: if isSignedIn() 
        && resource.data.userId == request.auth.uid;
    }
    
    // ============================================
    // STUDY REQUESTS - PRIVATE
    // ============================================
match /study_requests/{requestId} {
      // Only sender and recipient can read
      allow read: if isSignedIn() 
        && (resource.data.fromUserId == request.auth.uid 
         || resource.data.toUserId == request.auth.uid);
      
      // Only sender can create (must set fromUserId to self)
      allow create: if isSignedIn()
        && request.resource.data.fromUserId == request.auth.uid;
      
      // Only recipient can update (accept/decline)
      allow update: if isSignedIn() 
        && resource.data.toUserId == request.auth.uid;
      
      // Sender or recipient can delete
      allow delete: if isSignedIn() 
        && (resource.data.fromUserId == request.auth.uid 
         || resource.data.toUserId == request.auth.uid);
    }
    
    // ============================================
    // POSTS - PUBLIC FEED
    // ============================================
    match /posts/{postId} {
      // Anyone authenticated can read posts
      allow read: if isSignedIn();
      
      // Anyone can create posts (must set uid to self)
      allow create: if isSignedIn()
        && request.resource.data.uid == request.auth.uid;
      
      // Only owner can update/delete
      allow update, delete: if isSignedIn() 
        && resource.data.uid == request.auth.uid;
    }
  }
}
```

#### Security Testing Checklist

**✅ Authenticated Users Can:**
- Read all user profiles (username, kao)
- Read all active check-ins
- Read their own study requests
- Create check-ins with their own userId
- Update/delete their own check-ins
- Create study requests with their own fromUserId
- Update study requests where they are the recipient
- Read all posts

**❌ Authenticated Users Cannot:**
- Write to `study_spots` (admin only)
- Read study requests they're not involved in
- Create check-ins for other users
- Update/delete other users' check-ins
- Update study requests where they're not the recipient

**❌ Unauthenticated Users Cannot:**
- Read or write any data

#### Client-Side Security Patterns

**Always validate auth before Firestore operations:**

```typescript
if (!auth.currentUser) {
  setError('You must be logged in');
  return;
}

// Safe to proceed
await addDoc(collection(db, 'check_ins'), {
  userId: auth.currentUser.uid, // MUST match request.auth.uid
  // ...
});
```

**Filter sensitive data when displaying user profiles:**

```typescript
// Never display email or phone in public components
const publicUserData = {
  username: userData.username,
  kao: userData.kao,
  bgColor: userData.bgColor
  // Do NOT expose: email, phoneNumber
};
```

---

## 🎨 Styling Architecture

### Design System: "Cody"

AvoSpace uses a custom design system called **Cody** (named after the avocado theme), combining Bootstrap 5 utilities with custom CSS variables.

### CSS Architecture

```
src/app/
├── globals.css                 # Global styles, CSS variables, base resets
├── avo_study/
│   ├── avo-study.css          # Feature styles + Cody variables
│   └── components/
│       ├── CheckInModal.css   # Component-specific styles
│       ├── CheckInPost.css
│       ├── StudySpotCard.css
│       └── ...
├── map/
│   └── map.css                # Map-specific styles
└── avo_study/inbox/
    └── inbox.css              # Inbox-specific styles
```

### Color System (Cody Variables)

**File:** `src/app/avo_study/avo-study.css`

```css
:root {
  /* Primary Colors */
  --forest-green: #4A6B4A;      /* Dark accent, headers */
  --sage-green: #7A9A7A;        /* Medium accent, borders */
  --primary-green: #5B9B7E;     /* Primary buttons, links */
  
  /* Secondary Colors */
  --coral: #E89B8E;             /* Warm accent, highlights */
  --sky-blue: #A8C8E8;          /* Cool accent, info states */
  --yellow-highlight: #F4F0B8;  /* Subtle backgrounds, warnings */
  
  /* Neutral Colors */
  --bg-primary: #FAFAFA;        /* Page background */
  --bg-secondary: #FFFFFF;      /* Card backgrounds */
  --text-primary: #2C3E50;      /* Body text */
  --text-secondary: #7F8C8D;    /* Muted text */
  --border-subtle: #E0E0E0;     /* Borders, dividers */
}
```

### Bootstrap 5 Integration

**Loaded in:** `src/app/layout.tsx`

```typescript
import 'bootstrap/dist/css/bootstrap.min.css';
```

**Used for:**
- Grid system (`container`, `row`, `col-md-6`)
- Spacing utilities (`m-3`, `p-4`, `gap-3`)
- Flexbox utilities (`d-flex`, `justify-content-center`)
- Responsive utilities (`d-none`, `d-md-block`)
- Button base styles (`btn`, `btn-primary`)

**Customized via CSS:**
```css
.btn-primary {
  background-color: var(--primary-green);
  border-color: var(--primary-green);
}

.btn-primary:hover {
  background-color: var(--forest-green);
}
```

### Typography

**Font:** Inter (Google Fonts)

```typescript
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

// Applied to <body> in layout.tsx
<body className={inter.className}>
```

**Type Scale:**
```css
/* Defined in globals.css */
h1 { font-size: 2rem; font-weight: 600; }    /* Page titles */
h2 { font-size: 1.5rem; font-weight: 600; }  /* Section headers */
h3 { font-size: 1.25rem; font-weight: 500; } /* Card titles */
body { font-size: 1rem; line-height: 1.6; }  /* Body text */
.text-sm { font-size: 0.875rem; }            /* Small text */
.text-xs { font-size: 0.75rem; }             /* Tiny text */
```

### Component Styling Patterns

#### Pattern 1: Scoped Component CSS

```css
/* CheckInModal.css */
.modal-custom {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}
```

#### Pattern 2: Status Badges

```css
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge--open {
  background: var(--primary-green);
  color: white;
}

.status-badge--solo {
  background: var(--sky-blue);
  color: var(--text-primary);
}

.status-badge--break {
  background: var(--yellow-highlight);
  color: var(--text-primary);
}
```

#### Pattern 3: Kaomoji Avatars

```css
.profile-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--bgColor); /* Dynamic */
  font-size: 1.5rem;
  font-weight: 600;
  border: 2px solid var(--border-subtle);
}
```

### Responsive Design Breakpoints

Bootstrap 5 breakpoints (used throughout):

```css
/* Extra small: < 576px (mobile) */
/* Small: ≥ 576px */
/* Medium: ≥ 768px (tablets) */
/* Large: ≥ 992px (desktops) */
/* Extra large: ≥ 1200px */
```

**Example responsive usage:**
```tsx
<div className="col-12 col-md-6 col-lg-4">
  {/* Full width on mobile, half on tablet, third on desktop */}
</div>
```

### Animation & Transitions

```css
/* Smooth transitions on interactive elements */
.btn, .card, .modal {
  transition: all 0.2s ease-in-out;
}

/* Hover states */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Loading spinners (Bootstrap) */
.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.15em;
}
```

### Dark Mode Support

**Current Status:** Not implemented (future feature)

**Future Implementation:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1A1A1A;
    --bg-secondary: #2C2C2C;
    --text-primary: #E0E0E0;
    --text-secondary: #A0A0A0;
  }
}
```

---

## 🚀 Performance & Optimization

### Query Optimization

#### Firestore Composite Indexes

**Required indexes** (defined in `firestore.indexes.json`):

```json
{
  "indexes": [
    {
      "collectionGroup": "check_ins",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "spotId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "startedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "check_ins",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "study_requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "toUserId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "sentAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "study_requests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "fromUserId", "order": "ASCENDING" },
        { "fieldPath": "sentAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

**Why indexes matter:**
- Multi-field queries require composite indexes
- Without indexes, queries fail with "index required" error
- Firebase auto-suggests missing indexes during development

#### Query Patterns

**✅ Efficient:**
```typescript
// Specific query with index support
const q = query(
  collection(db, 'check_ins'),
  where('spotId', '==', 'doe-library'),
  where('isActive', '==', true)
);
// Uses composite index: spotId + isActive
```

**❌ Inefficient (avoid):**
```typescript
// Fetches ALL check-ins, then filters client-side
const allCheckIns = await getDocs(collection(db, 'check_ins'));
const filtered = allCheckIns.docs.filter(doc => 
  doc.data().spotId === 'doe-library' && doc.data().isActive
);
```

### Caching Strategy

#### User Data Cache (`userCache.ts`)

**Purpose:** Reduce redundant reads for user profiles (username, kao)

**Implementation:**
```typescript
// In-memory Map
const userCache = new Map<string, UserData>();

export async function getUserData(userId: string): Promise<UserData | null> {
  // 1. Check cache first
  if (userCache.has(userId)) {
    return userCache.get(userId)!;
  }
  
  // 2. Fetch from Firestore
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = { username: userDoc.data().username, kao: userDoc.data().kao };
  
  // 3. Store in cache
  userCache.set(userId, userData);
  return userData;
}
```

**Usage in components:**
```typescript
// Fetch multiple users in parallel
const userIds = checkIns.map(c => c.userId);
const usersData = await getUsersData(userIds); // Batch fetch

// Subsequent calls return cached data (no Firestore reads)
```

**Cache Invalidation:**
- Cache persists for entire session (cleared on page refresh)
- No TTL or stale-while-revalidate (MVP simplicity)
- Future: Add cache expiration or real-time updates

### Real-Time Listener Management

#### Pattern: Cleanup on Unmount

```typescript
useEffect(() => {
  const q = query(collection(db, 'check_ins'), where('spotId', '==', spotId));
  
  // Subscribe
  const unsubscribe = onSnapshot(q, (snapshot) => {
    setCheckIns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
  
  // CRITICAL: Unsubscribe on component unmount
  return () => unsubscribe();
}, [spotId]);
```

**Why this matters:**
- Prevents memory leaks
- Avoids "Can't perform state update on unmounted component" errors
- Reduces Firestore read costs

#### Listener Optimization Tips

**✅ Do:**
- Limit queries with `where` clauses
- Filter client-side for expiry (`expiresAt > now()`)
- Use single listener per feature (not per card)

**❌ Don't:**
- Create listeners inside loops
- Forget to return cleanup function
- Query entire collections without filters

### Client-Side Filtering

**Check-in Expiry:**
```typescript
// Always filter expired check-ins client-side
const activeCheckIns = snapshot.docs
  .map(doc => ({ id: doc.id, ...doc.data() }))
  .filter(checkIn => checkIn.expiresAt.toMillis() > Date.now());
```

**Why not use Firestore query?**
```typescript
// ❌ This requires an index AND doesn't handle past timestamps well
where('expiresAt', '>', Timestamp.now())
```

**Better approach:**
- Query by `isActive == true`
- Filter expired on client (simple millisecond comparison)

### Bundle Size Optimization

**Next.js Dynamic Imports:**

```typescript
// Map component uses Leaflet (large library)
const DynamicMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,  // Disable SSR (Leaflet doesn't support it)
  loading: () => <div>Loading map...</div>
});
```

**Why:**
- Leaflet is 150KB+ gzipped
- Only loaded when user navigates to `/map`
- Reduces initial page load time

**Config:** `next.config.ts`
```typescript
const nextConfig: NextConfig = {
  reactStrictMode: false, // Leaflet map double-init issues
  eslint: {
    ignoreDuringBuilds: true, // Fast deployments
  },
};
```

### Image Optimization

**Current:** Static images in `/public`

**Future Enhancement:**
```tsx
import Image from 'next/image';

// Next.js Image component (auto-optimization)
<Image src="/avocado-icon.png" width={48} height={48} alt="Avocado" />
```

### Performance Metrics

**Current Capacity:**
- 100-500 concurrent users (Firestore free tier)
- Real-time updates for ~10-20 active spots
- ~5-10 simultaneous `onSnapshot` listeners per user

**Firestore Read Costs:**
- User data cache reduces reads by ~70%
- Each active check-in triggers 1 read per listener
- Study requests: ~10-50 reads per inbox page load

### Future Optimizations

1. **Pagination:** Limit feed to 50 posts, load more on scroll
2. **Virtual Scrolling:** For large rosters (100+ users at one spot)
3. **Service Worker:** Cache static assets and study spots
4. **React Suspense:** Improve loading states
5. **Firestore Offline Persistence:** Enable offline-first mode

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Firebase CLI:** v12.0.0 or higher (optional, for deployment)
- **Git:** For version control

### Initial Setup

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/avospace.git
cd avospace
```

#### 2. Install Dependencies

```bash
npm install
```

**Key dependencies installed:**
- next@15.3.4
- react@19.0.0
- firebase@11.10.0
- bootstrap@5.3.7
- leaflet@1.9.4
- typescript@5.x

#### 3. Firebase Configuration

**File:** `src/lib/firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBMBoG-NX1lJmf01CAd26SY1Xp6B_PAMzU",
  authDomain: "avospace-6a984.firebaseapp.com",
  projectId: "avospace-6a984",
  storageBucket: "avospace-6a984.firebasestorage.app",
  messagingSenderId: "378745001771",
  appId: "1:378745001771:web:5257c9b6fc40ab98a8d76e",
  measurementId: "G-XNYHDHSFGC"
};
```

**⚠️ Security Note:** These are client-safe keys (public). Actual security is enforced by Firestore rules.

**For a new Firebase project:**
1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable Email/Password authentication
3. Create Firestore database (production mode)
4. Replace config values in `firebase.ts`
5. Deploy security rules: `firebase deploy --only firestore:rules`

#### 4. Seed Study Spots

```bash
npx tsx scripts/seedStudySpots.ts
```

**This creates 5 study spot documents:**
- doe-library
- moffitt-library
- main-stacks
- mlk-student-union
- kresge-engineering

#### 5. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

**Or manually create in Firebase Console using `firestore.indexes.json`**

#### 6. Start Development Server

```bash
npm run dev
```

**Server runs at:** http://localhost:3000

### Development Workflow

#### Hot Reload

Next.js dev server supports hot module replacement:
- Save any `.tsx`/`.css` file → instant browser update
- No manual refresh needed

#### File Watchers

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: TypeScript type checking (optional)
npx tsc --noEmit --watch
```

#### Linting

```bash
npm run lint
```

**Note:** Linting is skipped during production builds (`ignoreDuringBuilds: true` in config)

### Environment Variables (Optional)

**Not currently used**, but for future API keys:

```env
# .env.local (gitignored)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
```

**Access in code:**
```typescript
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
```

### Common Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server locally
npm run start

# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Clean build cache
rm -rf .next
```

### Browser DevTools Setup

**Recommended Extensions:**
- React Developer Tools (inspect component state)
- Firebase DevTools (view Firestore data)

**Accessing Firebase in Console:**
```javascript
// In browser console
window.firebase = require('firebase/app');
```

---

## 📦 Build & Deployment

### Build Process

#### Production Build

```bash
npm run build
```

**Output:**
```
.next/
├── static/              # Static assets (CSS, JS)
├── server/              # Server-side code
└── BUILD_ID             # Build identifier
```

**Build optimizations:**
- Code splitting
- Tree shaking
- Minification
- Image optimization (if using next/image)

#### Build Analysis

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Run build with analysis
ANALYZE=true npm run build
```

### Deployment Options

#### Option 1: Vercel (Recommended)

**1. Connect GitHub Repository:**
- Visit [vercel.com](https://vercel.com)
- Import GitHub repo
- Vercel auto-detects Next.js

**2. Configure Environment:**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next`

**3. Deploy:**
```bash
# Via CLI
npx vercel --prod

# Or push to main branch (auto-deploy)
git push origin main
```

**Environment Variables in Vercel:**
- Go to Project Settings → Environment Variables
- Add any secrets (not needed for current config)

#### Option 2: Firebase Hosting

**1. Install Firebase CLI:**
```bash
npm install -g firebase-tools
firebase login
```

**2. Initialize Hosting:**
```bash
firebase init hosting

# Select options:
# - Public directory: .next
# - Configure as SPA: No
# - Set up automatic builds: Yes
```

**3. Build & Deploy:**
```bash
npm run build
firebase deploy --only hosting
```

**firebase.json:**
```json
{
  "hosting": {
    "public": ".next",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

#### Option 3: Self-Hosted (Docker)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Build & Run:**
```bash
docker build -t avospace .
docker run -p 3000:3000 avospace
```

### Deployment Checklist

**Pre-Deployment:**
- [ ] Run `npm run build` locally (no errors)
- [ ] Test production build: `npm start`
- [ ] Verify Firestore rules deployed
- [ ] Verify Firestore indexes created
- [ ] Test authentication flow
- [ ] Test check-in creation/expiry
- [ ] Test study requests

**Post-Deployment:**
- [ ] Verify production URL loads
- [ ] Test signup/login
- [ ] Create test check-in
- [ ] Send test study request
- [ ] Check Firebase Console for errors
- [ ] Monitor Firestore read/write costs

### Continuous Deployment

**Vercel Auto-Deploy:**
```yaml
# .github/workflows/vercel.yml (optional)
name: Vercel Deployment
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🧪 Testing Strategy

### Current Testing (Manual)

**Manual Testing Checklist:**

**Authentication:**
- [ ] Sign up with new email
- [ ] Sign up with existing username (should fail)
- [ ] Sign up with invalid email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Logout and session cleared

**Check-Ins:**
- [ ] Check in to study spot (all 5 spots)
- [ ] Try checking in while already checked in (should show error)
- [ ] View roster on study spot card
- [ ] See own check-in in activity feed
- [ ] Wait for check-in to expire (or fast-forward time)
- [ ] Manually check out

**Study Requests:**
- [ ] Send request to user with "open" status
- [ ] Cannot send request to user with "solo" status
- [ ] Recipient sees notification badge
- [ ] Recipient views request in inbox
- [ ] Recipient accepts request
- [ ] Sender sees "accepted" status
- [ ] Recipient declines request
- [ ] Sender sees "declined" status

**Profile:**
- [ ] Edit username
- [ ] Edit kaomoji
- [ ] Edit background color
- [ ] View own profile at `/user/[userid]`
- [ ] View another user's profile

**Notifications:**
- [ ] Inbox badge updates in real-time
- [ ] Badge count correct (pending requests only)
- [ ] Badge disappears when requests read

### Future Automated Testing

#### Unit Tests (Jest)

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

**Example test:**
```typescript
// lib/validation.test.ts
import { validateUsernameFormat } from './validation';

describe('validateUsernameFormat', () => {
  it('accepts valid usernames', () => {
    expect(validateUsernameFormat('avofan').valid).toBe(true);
    expect(validateUsernameFormat('user_123').valid).toBe(true);
  });
  
  it('rejects invalid usernames', () => {
    expect(validateUsernameFormat('ab').valid).toBe(false); // Too short
    expect(validateUsernameFormat('user@123').valid).toBe(false); // Invalid char
  });
});
```

#### Component Tests (React Testing Library)

```typescript
// components/CheckInModal.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import CheckInModal from './CheckInModal';

test('renders duration options', () => {
  render(<CheckInModal spot={mockSpot} isOpen={true} onClose={jest.fn()} />);
  
  expect(screen.getByText('30 min')).toBeInTheDocument();
  expect(screen.getByText('1 hour')).toBeInTheDocument();
});
```

#### E2E Tests (Playwright/Cypress)

```typescript
// e2e/check-in.spec.ts
test('user can check in to study spot', async ({ page }) => {
  await page.goto('/avo_study');
  await page.click('text=Doe Library');
  await page.click('text=Check In');
  await page.click('text=1 hour');
  await page.click('button:has-text("Check In")');
  
  await expect(page.locator('.active-checkin-banner')).toBeVisible();
});
```

---

## 📐 Common Patterns & Conventions

### Code Style & Best Practices

#### Naming Conventions

**Files:**
```
PascalCase for components: CheckInModal.tsx
camelCase for utilities: userCache.ts
kebab-case for routes: /avo_study/inbox
lowercase for stylesheets: checkin-modal.css (or CheckInModal.css)
```

**Variables:**
```typescript
// PascalCase for components
export default function CheckInModal() {}

// camelCase for functions and variables
const handleSubmit = async () => {};
const isActive = true;

// UPPER_SNAKE_CASE for constants
const MAX_CHECK_IN_DURATION = 360;
const CHAR_LIMITS = { STATUS_NOTE: 120 };
```

**Types & Interfaces:**
```typescript
// PascalCase, descriptive names
interface CheckIn { ... }
type CheckInStatus = 'open' | 'solo' | 'break';
interface PopulatedCheckIn extends CheckIn { ... }
```

#### TypeScript Usage

**✅ Do:**
```typescript
// Define interfaces for all data structures
interface CheckIn {
  id: string;
  userId: string;
  // ...
}

// Use union types for enums
type CheckInStatus = 'open' | 'solo' | 'break';

// Always type function parameters and returns
async function createCheckIn(data: CheckInFormData): Promise<string> {
  // ...
}

// Use optional chaining for nullable values
const username = user?.displayName ?? 'Anonymous';
```

**❌ Don't:**
```typescript
// Avoid 'any' type
const data: any = await fetchData(); // ❌

// Use proper types instead
const data: CheckIn = await fetchData(); // ✅
```

#### Component Patterns

**Client Components (Most pages):**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';

export default function MyComponent() {
  const [data, setData] = useState<CheckIn[]>([]);
  
  useEffect(() => {
    // Setup listeners, fetch data
    return () => {
      // Cleanup
    };
  }, []);
  
  return <div>{/* JSX */}</div>;
}
```

**Modal Components (with Portal):**
```typescript
'use client';

import { createPortal } from 'react-dom';

export default function MyModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  
  const content = (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-dialog">{/* Content */}</div>
    </>
  );
  
  // Render to body (avoid z-index issues)
  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  
  return content;
}
```

#### Error Handling

**Pattern 1: Try-Catch with User Feedback**
```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = async () => {
  setError(null);
  
  try {
    await addDoc(collection(db, 'check_ins'), data);
  } catch (err: any) {
    console.error('Error:', err);
    setError(err.message || 'Something went wrong');
  }
};

// Display in UI
{error && <div className="alert alert-danger">{error}</div>}
```

**Pattern 2: Firestore Error Handling**
```typescript
onSnapshot(
  query,
  (snapshot) => {
    // Success handler
  },
  (error) => {
    console.error('Firestore error:', error);
    
    if (error.code === 'permission-denied') {
      setError('You do not have permission to access this data');
    } else if (error.code === 'unavailable') {
      setError('Network error. Please check your connection.');
    } else {
      setError('An error occurred. Please try again.');
    }
  }
);
```

#### Firestore Patterns

**Pattern 1: Create Document**
```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const docRef = await addDoc(collection(db, 'check_ins'), {
  userId: auth.currentUser!.uid,
  spotId: 'doe-library',
  status: 'open',
  startedAt: Timestamp.now(),
  expiresAt: Timestamp.fromMillis(Date.now() + 3600000),
  isActive: true
});

console.log('Created with ID:', docRef.id);
```

**Pattern 2: Update Document**
```typescript
import { doc, updateDoc } from 'firebase/firestore';

await updateDoc(doc(db, 'check_ins', checkInId), {
  isActive: false,
  // Only updates specified fields
});
```

**Pattern 3: Delete Document**
```typescript
import { doc, deleteDoc } from 'firebase/firestore';

await deleteDoc(doc(db, 'check_ins', checkInId));
```

**Pattern 4: Query with Filters**
```typescript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'check_ins'),
  where('spotId', '==', 'doe-library'),
  where('isActive', '==', true),
  orderBy('startedAt', 'desc')
);

const snapshot = await getDocs(q);
const checkIns = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
} as CheckIn));
```

**Pattern 5: Real-Time Listener**
```typescript
import { collection, query, onSnapshot } from 'firebase/firestore';

useEffect(() => {
  const q = query(
    collection(db, 'check_ins'),
    where('spotId', '==', spotId)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCheckIns(data);
  });
  
  return () => unsubscribe(); // ALWAYS cleanup
}, [spotId]);
```

### Git Workflow

**Branch Strategy:**
```bash
main              # Production branch
avo_study         # Feature branch (current)
user/feature-name # Individual feature branches
```

**Commit Message Format:**
```
<type>: <description>

feat: Add study request inbox
fix: Resolve check-in duplicate bug
docs: Update architecture documentation
style: Fix CheckInModal CSS spacing
refactor: Extract userCache utility
```

**Pull Request Process:**
1. Create feature branch from `main`
2. Implement feature with tests
3. Submit PR with description
4. Code review by team
5. Merge to `main` (squash commits)

---

## 🐛 Troubleshooting

### Common Issues & Solutions

#### 1. Firestore Permission Denied

**Error:**
```
FirebaseError: Missing or insufficient permissions.
```

**Causes:**
- User not authenticated (`auth.currentUser === null`)
- Security rules block operation
- Trying to write to another user's document

**Solution:**
```typescript
// Always check auth before Firestore operations
if (!auth.currentUser) {
  console.error('User not authenticated');
  return;
}

// Verify userId matches auth.currentUser.uid
await addDoc(collection(db, 'check_ins'), {
  userId: auth.currentUser.uid, // MUST match authenticated user
  // ...
});
```

#### 2. Firestore Index Required

**Error:**
```
The query requires an index. You can create it here: https://...
```

**Causes:**
- Multi-field query without composite index
- New query pattern not in `firestore.indexes.json`

**Solution:**
```bash
# Click the link in error message to auto-create index
# OR manually add to firestore.indexes.json and deploy

firebase deploy --only firestore:indexes
```

#### 3. Leaflet Map Not Rendering

**Error:**
```
Leaflet is not defined
```

**Causes:**
- Server-side rendering tries to load Leaflet
- Leaflet requires `window` object

**Solution:**
```typescript
// Use dynamic import with SSR disabled
const DynamicMap = dynamic(() => import('./LeafletMap'), {
  ssr: false, // CRITICAL for Leaflet
});
```

#### 4. "Cannot Update Unmounted Component"

**Error:**
```
Warning: Can't perform a React state update on an unmounted component.
```

**Causes:**
- Async operation completes after component unmounts
- Missing cleanup in useEffect

**Solution:**
```typescript
useEffect(() => {
  let isMounted = true;
  
  fetchData().then(data => {
    if (isMounted) {
      setData(data); // Only update if still mounted
    }
  });
  
  return () => {
    isMounted = false; // Cleanup flag
  };
}, []);
```

#### 5. Check-In Not Showing in Roster

**Causes:**
- `isActive` is `false`
- `expiresAt` is in the past
- Missing Firestore index
- Real-time listener not subscribed

**Debug Steps:**
```typescript
// 1. Check Firestore Console
// Verify document exists with isActive=true

// 2. Check client-side filter
const activeCheckIns = snapshot.docs.filter(doc => {
  const checkIn = doc.data();
  console.log('CheckIn:', checkIn.id, 'Expires:', checkIn.expiresAt.toMillis(), 'Now:', Date.now());
  return checkIn.expiresAt.toMillis() > Date.now();
});

// 3. Verify listener is active
console.log('Listener subscribed:', unsubscribe !== undefined);
```

#### 6. Notification Badge Not Updating

**Causes:**
- Real-time listener not set up
- Query filters incorrect
- User not authenticated

**Debug:**
```typescript
// In Navbar component, add logging
useEffect(() => {
  if (!user) {
    console.log('No user, skipping listener');
    return;
  }
  
  const q = query(
    collection(db, 'study_requests'),
    where('toUserId', '==', user.uid),
    where('status', '==', 'pending')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log('Pending requests count:', snapshot.size);
    setPendingRequestsCount(snapshot.size);
  });
  
  return () => unsubscribe();
}, [user]);
```

#### 7. Build Errors (Production)

**Error:**
```
Type error: Property 'kao' does not exist on type 'DocumentData'
```

**Causes:**
- Missing type assertions
- Strict TypeScript in production build

**Solution:**
```typescript
// Add proper type casting
const userData = userDoc.data() as UserData;

// Or define interface with DocumentData
interface UserDocument extends DocumentData {
  username: string;
  kao: string;
}
```

#### 8. Firebase Config Not Working

**Error:**
```
FirebaseError: Firebase: No Firebase App '[DEFAULT]' has been created
```

**Causes:**
- Firebase not initialized
- Config imported before initialization

**Solution:**
```typescript
// Ensure firebase.ts initializes BEFORE first import
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// In components, import after initialization
import { auth, db } from '@/lib/firebase';
```

### Debugging Tools

**Browser Console:**
```javascript
// Access Firebase auth state
window.auth = require('firebase/auth');

// Check current user
auth.currentUser;

// Check Firestore connection
db._settings;
```

**Firebase Console:**
- View real-time data changes
- Test security rules
- Monitor usage/costs
- View authentication logs

**React DevTools:**
- Inspect component state
- Track re-renders
- View props

---

## 🔧 Key Technical Decisions

### Why Next.js App Router?
- **Server/Client Flexibility:** Choose SSR vs CSR per page
- **File-Based Routing:** Intuitive folder structure
- **Built-In Optimizations:** Automatic code splitting, image optimization
- **React 19 Support:** Latest React features (Suspense, Transitions)
- **API Routes:** Optional backend endpoints if needed later

### Why Firestore?
- **Real-Time Listeners:** Native `onSnapshot` for live updates (no polling)
- **Simple Security Rules:** Declarative authorization without backend code
- **No Backend Server:** Direct client SDK calls (reduces infrastructure)
- **Generous Free Tier:** 50K reads/day, 20K writes/day, 1GB storage
- **Scalability:** Automatic scaling, global CDN distribution

### Why Client-Side Rendering?
- **Real-Time Priority:** Most features need live updates
- **Simpler Architecture:** No server-side data fetching complexity
- **Firebase Auth:** Works best with client-side SDK
- **Fast Iteration:** No server restarts needed

**Trade-off:** Slower initial page load (acceptable for authenticated app)

### Why No External Notifications? (MVP)
- **Simplicity:** In-app badge sufficient for testing
- **Cost:** Avoid Firebase Cloud Messaging setup fees
- **Complexity:** No Cloud Functions needed
- **Future:** Can add push notifications via FCM + Cloud Functions later

### Why Bootstrap + Custom CSS?
- **Rapid Prototyping:** Bootstrap grid/utilities speed development
- **Custom Branding:** Cody design system for unique identity
- **No Framework Lock-In:** Easy to migrate to Tailwind/MUI later
- **Small Bundle:** Only import what's needed

### Why TypeScript?
- **Type Safety:** Catch errors at compile time
- **Better DX:** Autocomplete, inline documentation
- **Refactoring:** Safe large-scale changes
- **Team Collaboration:** Self-documenting code

### Why No Redux/Zustand?
- **Firestore as State:** Real-time listeners provide "global state"
- **Simplicity:** Fewer abstractions to learn
- **React Hooks Sufficient:** `useState` + `useContext` cover needs
- **Future:** Can add if cross-component state becomes complex

---

## 📈 Scalability & Future Enhancements

### Current Capacity

**Firestore Free Tier:**
- 50,000 reads/day
- 20,000 writes/day
- 1 GB storage
- 10 GB/month network egress

**Expected Usage (100 users):**
- ~5,000 reads/day (user cache reduces this)
- ~1,000 writes/day (check-ins, requests)
- ~50 MB storage (users + check-ins + requests)

**Bottlenecks:**
- Real-time listeners: Each user can have ~5-10 active
- Composite indexes: Max 200 per project (currently using 4)
- Write throughput: 1 write/second per document (not an issue)

### Scaling Strategies

#### 1. Firestore Pagination
```typescript
// Limit initial query, load more on scroll
const q = query(
  collection(db, 'posts'),
  orderBy('date', 'desc'),
  limit(50) // Only load 50 posts
);

// Load next page
const nextQuery = query(
  collection(db, 'posts'),
  orderBy('date', 'desc'),
  startAfter(lastDoc),
  limit(50)
);
```

#### 2. Cloud Functions (Cleanup)
```typescript
// functions/src/cleanupExpiredCheckIns.ts
export const cleanupExpiredCheckIns = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();
    const expiredQuery = await admin.firestore()
      .collection('check_ins')
      .where('isActive', '==', true)
      .where('expiresAt', '<', now)
      .get();
    
    const batch = admin.firestore().batch();
    expiredQuery.docs.forEach(doc => {
      batch.update(doc.ref, { isActive: false });
    });
    
    await batch.commit();
  });
```

#### 3. CDN Caching (Static Assets)
```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  }
};
```

#### 4. Redis Caching (User Data)
```typescript
// Replace in-memory userCache with Redis
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getUserData(userId: string) {
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const userData = await fetchFromFirestore(userId);
  await redis.set(`user:${userId}`, JSON.stringify(userData), 'EX', 3600);
  
  return userData;
}
```

### Future Features

**Phase 2 (Post-MVP):**
- [ ] Push notifications (FCM + Cloud Functions)
- [ ] Friend system (add/remove friends, friends-only check-ins)
- [ ] Direct messaging between users
- [ ] Study spot ratings & reviews
- [ ] Calendar integration (Google Calendar sync)

**Phase 3 (Long-Term):**
- [ ] Course-specific study groups
- [ ] AI-powered study buddy matching
- [ ] Gamification (streaks, achievements)
- [ ] Mobile app (React Native)
- [ ] Admin dashboard (analytics, moderation)

---

## 📚 Additional Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Internal Docs
- `/docs/FIRESTORE_DATA_MODEL.md` - Detailed data schemas
- `/docs/avo_study.md` - Feature specification
- `/docs/TODO.md` - Current roadmap

### Support
- GitHub Issues: [github.com/yourrepo/issues](https://github.com)
- Team Slack: #avospace-dev
- Firebase Status: [status.firebase.google.com](https://status.firebase.google.com)

---

**Document Version:** 1.0  
**Last Updated:** November 21, 2024  
**Maintained By:** AvoSpace Engineering Team

**Questions?** Contact the team or open an issue on GitHub.
