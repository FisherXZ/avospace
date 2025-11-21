# 🏗️ Architecture Documentation

**AvoSpace System Design & Technical Architecture**

---

## 📊 System Overview

AvoSpace is a Next.js web application with Firebase backend, focused on real-time study coordination at physical campus locations.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Next.js    │  │    React     │  │  TypeScript  │ │
│  │  App Router  │  │  Components  │  │    Types     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Firebase Services                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Authentication│  │  Firestore   │  │   Hosting    │ │
│  │   (Auth)     │  │  (Database)  │  │  (Optional)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🗄️ Data Model

### Firestore Collections

#### 1. `users` (Existing)
User profiles and authentication data.

```typescript
{
  uid: string;              // Firebase Auth UID (document ID)
  username: string;         // Unique username
  email: string;           // Email address
  phoneNumber?: string;    // Optional phone
  phoneCountryCode?: string;
  kao: string;             // Kaomoji avatar (e.g., "(^ᗜ^)")
  bgColor: string;         // Profile background color
  friends: string[];       // Array of friend UIDs
  // Kaomoji parts (for customization)
  accessory: string;
  leftSide: string;
  leftCheek: string;
  leftEye: string;
  mouth: string;
  rightEye: string;
  rightCheek: string;
  rightSide: string;
}
```

#### 2. `study_spots` (Static)
Pre-configured study locations on campus.

```typescript
{
  id: string;              // Document ID (e.g., "doe-library")
  name: string;            // Display name
  hours: string;           // Operating hours
}
```

**Seeded Spots:**
- doe-library: "Doe Library" (8:00 AM - 12:00 AM)
- moffitt-library: "Moffitt Library" (24 Hours)
- main-stacks: "Main Stacks" (8:00 AM - 10:00 PM)
- mlk-student-union: "MLK Student Union" (7:00 AM - 11:00 PM)
- kresge-engineering: "Kresge Engineering Library" (8:00 AM - 11:00 PM)

#### 3. `check_ins` (Dynamic)
Active study sessions at locations.

```typescript
{
  id: string;              // Auto-generated document ID
  userId: string;          // Foreign key → users.uid
  spotId: string;          // Foreign key → study_spots.id
  status: 'open' | 'solo' | 'break';
  statusNote?: string;     // Optional custom note (120 chars max)
  startedAt: Timestamp;    // Check-in creation time
  expiresAt: Timestamp;    // Auto-checkout time
  isActive: boolean;       // false when expired/checked out
}
```

**Firestore Indexes Required:**
- Composite: `spotId (Ascending) + isActive (Ascending) + startedAt (Descending)`
- Composite: `userId (Ascending) + isActive (Ascending)`

#### 4. `study_requests` (Dynamic)
Study partner requests between users.

```typescript
{
  id: string;              // Auto-generated document ID
  fromUserId: string;      // Sender → users.uid
  toUserId: string;        // Recipient → users.uid
  checkInId: string;       // Reference to check-in that prompted request
  spotId: string;          // Location context
  message: string;         // Request message (500 chars max)
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  sentAt: Timestamp;       // When sent
  readAt?: Timestamp;      // When read/actioned
}
```

**Firestore Indexes Required:**
- Composite: `toUserId (Ascending) + status (Ascending) + sentAt (Descending)`
- Composite: `fromUserId (Ascending) + sentAt (Descending)`

#### 5. `posts` (Existing, Modified)
Activity feed posts - **check-ins only** (no generic posts).

```typescript
{
  id?: string;             // Auto-generated document ID
  uid: string;             // Author user ID
  text: string;            // Post content
  date: string;            // Date string (e.g., "11/18/2024")
  likes: number;           // Like count (legacy, not used)
  type: 'checkin';         // Post type (only check-ins now)
  // Check-in specific fields
  checkInId: string;       // Reference to check_ins document
  spotId: string;          // Study spot ID
  spotName: string;        // Study spot name (denormalized)
  status: 'open' | 'solo' | 'break';
  statusNote?: string;     // Optional status note
  expiresAt: Timestamp;    // When check-in expires
}
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

---

## 🔄 Data Flow Patterns

### Check-In Flow

```
User clicks "Check In" button
    ↓
CheckInModal opens
    ↓
User selects:
  - Duration (30min - 4hrs)
  - Status (open/solo/break)
  - Optional status note
    ↓
Submit button clicked
    ↓
Create check_ins document {
  userId: current user
  spotId: selected spot
  status: selected status
  expiresAt: now + duration
  isActive: true
}
    ↓
Create posts document {
  type: 'checkin'
  uid: current user
  checkInId: new check-in ID
  spotName: denormalized
  status: user status
  expiresAt: same as check-in
}
    ↓
Real-time listeners update:
  - StudySpotCard roster
  - Home feed
  - ActiveCheckInBanner
```

### Study Request Flow

```
User sees someone's check-in
    ↓
Clicks "Send Request" (if status = 'open')
    ↓
StudyRequestModal opens
    ↓
User types message (500 chars max)
    ↓
Submit clicked
    ↓
Create study_requests document {
  fromUserId: current user
  toUserId: check-in owner
  checkInId: reference
  spotId: location
  message: user message
  status: 'pending'
  sentAt: Timestamp.now()
}
    ↓
Toast: "Request sent to @username"
    ↓
Recipient gets notification badge
    ↓
Recipient navigates to /avo_study/inbox
    ↓
Views request in "Received" tab
    ↓
Clicks "Accept" or "Decline"
    ↓
Update study_requests document {
  status: 'accepted' | 'declined'
  readAt: Timestamp.now()
}
    ↓
Toast: "Accepted! Studying with @username"
    ↓
Sender sees status in "Sent" tab
```

---

## 🔐 Security Model

### Firestore Security Rules

**Key Principles:**
1. Users can only read/write their own data
2. Check-ins are public (readable by all)
3. Study requests are only visible to sender/recipient
4. Study spots are read-only for all users

**Rule Highlights:**

```javascript
// Users: Read all, write own
match /users/{userId} {
  allow read: if true;
  allow write: if request.auth.uid == userId;
}

// Check-ins: Read all active, write own
match /check_ins/{checkInId} {
  allow read: if resource.data.isActive == true;
  allow create: if request.auth.uid != null;
  allow update, delete: if request.auth.uid == resource.data.userId;
}

// Study requests: Read if involved, write if sender
match /study_requests/{requestId} {
  allow read: if request.auth.uid == resource.data.fromUserId 
              || request.auth.uid == resource.data.toUserId;
  allow create: if request.auth.uid == request.resource.data.fromUserId;
  allow update: if request.auth.uid == resource.data.toUserId;
}
```

---

## 🎨 Styling Architecture

### Design System (Cody)

**CSS Variables** (in `avo-study.css`):
```css
:root {
  --forest-green: #4A6B4A;
  --sage-green: #7A9A7A;
  --primary-green: #5B9B7E;
  --coral: #E89B8E;
  --sky-blue: #A8C8E8;
  --yellow-highlight: #F4F0B8;
}
```

**Component-Specific Styles:**
- Each major feature has its own CSS file
- Global styles in `src/app/globals.css`
- Bootstrap 5 for layout utilities
- Custom CSS for Cody design system

---

## 🚀 Performance Considerations

### Real-Time Updates
- Firestore `onSnapshot` listeners for live data
- Automatic cleanup on component unmount
- Minimal re-renders with React state management

### Data Caching
- `userCache.ts` utility caches user lookups
- Reduces redundant Firestore reads
- Map-based in-memory cache

### Query Optimization
- Composite indexes for efficient queries
- Limited result sets (e.g., active check-ins only)
- Client-side sorting to avoid index requirements

---

## 🧪 Testing Strategy

### Manual Testing Checklist
1. User registration/login
2. Check-in creation at each spot
3. Check-in expiration handling
4. Study request send/receive/accept flow
5. Inbox tabs (Received/Sent)
6. Notification badges
7. Profile editing
8. Friend system

### Future Automated Testing
- Jest unit tests for utilities
- React Testing Library for components
- Cypress E2E tests for critical flows

---

## 📦 Deployment Architecture

### Development
- Local: `npm run dev` on localhost:3000
- Firebase Emulator (optional): Local Firestore

### Staging
- Vercel Preview Deployments
- Firebase Firestore (dev project)
- Automatic deploys on PR

### Production
- Vercel Production or Firebase Hosting
- Firebase Firestore (prod project)
- Manual deployment approval

---

## 🔧 Key Technical Decisions

### Why Next.js App Router?
- Server/client component flexibility
- File-based routing
- Built-in optimizations
- React 19 support

### Why Firestore?
- Real-time listeners for live updates
- Simple security rules
- No backend server needed
- Generous free tier

### Why No External Notifications? (MVP)
- In-app notifications sufficient for testing
- Reduces complexity
- Can add Cloud Functions + FCM later

### Why Bootstrap + Custom CSS?
- Fast prototyping with Bootstrap
- Custom Cody design system for brand identity
- No heavy UI framework dependency

---

## 📈 Scalability Notes

**Current Capacity:**
- 100-500 concurrent users (Firestore free tier)
- Real-time updates handle ~10-20 active spots
- Study request inbox handles ~100 requests per user

**Future Scaling:**
- Add Cloud Functions for cleanup tasks
- Implement pagination for large datasets
- Add Redis caching layer if needed
- Consider Cloud Messaging for push notifications

---

**Last Updated:** November 18, 2024
