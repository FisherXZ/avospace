# 🚀 Avo Study - Production Readiness Roadmap

**Target:** Deploy to 10+ active users with enterprise-grade reliability

**Timeline:** 2-3 weeks (depending on complexity choices)

**Last Updated:** November 18, 2024

---

## Table of Contents
1. [Critical Path: MVP → Production](#critical-path-mvp--production)
2. [Feature Implementation](#feature-implementation)
3. [Deployment Strategy](#deployment-strategy)
4. [Production Operations](#production-operations)
5. [Security & Compliance](#security--compliance)
6. [Performance & Scalability](#performance--scalability)

---

## Critical Path: MVP → Production

### Phase 0: Pre-Launch Blockers (Week 1, Days 1-2) 🔴
**Must complete before ANY production deployment**

#### 0.1 Security Hardening
- [ ] **Firestore Security Rules** (2 hours)
  - Replace dev rules with production-ready rules
  - Implement row-level security (RLS)
  - Add field-level validation
  - Test with Firebase Emulator Suite
  - **Reference:** Firebase Security Rules Best Practices
  
- [ ] **Authentication Flow** (1 hour)
  - Add phone number verification (Firebase Auth Phone)
  - Implement proper session management
  - Add CSRF protection
  - Configure token refresh

- [ ] **Environment Variables** (30 min)
  - Move Firebase config to environment variables
  - Set up `.env.local` and `.env.production`
  - Configure Vercel environment secrets
  - **Never commit API keys to git**

#### 0.2 Data Validation & Rate Limiting
- [ ] **Input Validation** (2 hours)
  - Sanitize all user inputs (XSS prevention)
  - Validate on client AND server
  - Use Zod or Yup for schema validation
  - Max lengths: statusNote (120), message (500)

- [ ] **Rate Limiting** (3 hours)
  - **Client-side:** Debounce button clicks (500ms)
  - **Server-side:** Firebase Cloud Functions with rate limits
    - Max 1 check-in per user per 5 minutes
    - Max 8 study requests per hour per user
    - Max 20 messages per thread per hour
  - Use Redis or Upstash for rate limit tracking
  - **Reference:** [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)

#### 0.3 Error Handling & Monitoring
- [ ] **Error Boundaries** (1 hour)
  - React Error Boundaries for graceful failures
  - Fallback UI for broken components
  - Log errors to monitoring service

- [ ] **Monitoring Setup** (2 hours)
  - **Sentry** for error tracking (free tier: 5K events/month)
  - **Vercel Analytics** for performance monitoring
  - **Firebase Performance Monitoring** for backend metrics
  - Set up Slack/Discord webhooks for critical errors

---

## Feature Implementation

### Phase 1: Study Requests & Messaging (Week 1, Days 3-5)

#### 1.1 Study Request System (Core)
**Goal:** Enable users to send study buddy requests in-app

**Architecture Decision:**
```
Option A: In-App Only (Recommended for MVP)
├── Simpler to implement (3-4 hours)
├── No external dependencies
├── Better privacy control
└── Can add external later

Option B: iMessage + Slack Integration (Complex)
├── Requires additional OAuth flows
├── Phone number collection + verification
├── Rate limit complications
└── 10-15 hours implementation time
```

**Recommendation:** Start with Option A, add Option B post-launch if needed.

#### 1.1.1 In-App Study Requests (3-4 hours)

**Components to Build:**

**A. `StudyRequestModal.tsx`**
```typescript
interface StudyRequestModalProps {
  recipient: {
    userId: string;
    username: string;
    kao: string;
  };
  spotName: string;
  onClose: () => void;
}
```

**Features:**
- Textarea for message (500 char limit)
- Character counter
- Preview recipient info
- Send button with loading state
- Rate limit indicator (e.g., "You can send 5 more requests this hour")

**B. `StudyRequestInbox.tsx` (New Page)**
```
Route: /avo_study/inbox
```

**Features:**
- List of received requests (pending, accepted, declined)
- Real-time listener for new requests
- Accept/Decline buttons
- Notification badge count on navbar
- Filter by status
- Mark as read

**C. Database Schema Enhancement**
```typescript
// study_requests collection
{
  id: string;
  fromUserId: string;
  toUserId: string;
  spotId: string;              // NEW: Context of where request was sent
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  sentAt: Timestamp;
  readAt?: Timestamp;          // NEW: Track if user saw it
  expiresAt: Timestamp;        // NEW: Auto-expire after 24h
}
```

**D. Firestore Indexes**
```json
{
  "collectionGroup": "study_requests",
  "fields": [
    { "fieldPath": "toUserId", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" },
    { "fieldPath": "sentAt", "order": "DESCENDING" }
  ]
}
```

**E. UI Integration**
- Add "Send Request" button to `CheckInItem.tsx`
- Show button only for:
  - Users with status = 'open' (not solo/break)
  - Users who are NOT yourself
  - Users you haven't requested in last 24h
- Add notification badge to sidebar "Avo Study" icon

#### 1.2 External Messaging Integration (Optional - Phase 2)

**1.2.1 iMessage/SMS Integration (Advanced)**

**Prerequisites:**
- Users must add phone number to profile
- Verify phone with Firebase Auth Phone
- Get user consent (SMS opt-in)

**Implementation Options:**

**Option A: Twilio SMS** (Recommended)
- Cost: $0.0079/message (outbound US)
- Setup: 2-3 hours
- Rate limit: 1 message per segment per second

```typescript
// Firebase Cloud Function
export const sendStudyRequestSMS = functions.https.onCall(async (data, context) => {
  // Rate limit check
  // Validate user phone number
  // Send SMS via Twilio API
  
  const client = twilio(accountSid, authToken);
  await client.messages.create({
    body: `${senderName} wants to study together at ${spotName}! Check your AvoSpace app.`,
    to: recipientPhone,
    from: twilioNumber
  });
});
```

**Option B: Firebase Cloud Messaging (FCM) Push**
- Cost: Free
- Better UX than SMS (opens app directly)
- Requires user to install PWA or grant notification permissions

**1.2.2 Slack Integration** (Moderate)

**Two Approaches:**

**Approach A: Slack Webhook (Simple, 1 hour)**
```typescript
// User adds personal Slack webhook URL to settings
// We POST study requests to their webhook
// No OAuth needed, user controls everything

await fetch(userSlackWebhook, {
  method: 'POST',
  body: JSON.stringify({
    text: `📚 Study Request from ${sender}`,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `*${sender}* wants to study at *${spot}*` }
      },
      {
        type: "actions",
        elements: [
          { type: "button", text: "View in AvoSpace", url: appUrl }
        ]
      }
    ]
  })
});
```

**Approach B: Slack App OAuth (Complex, 8-10 hours)**
- Build full Slack OAuth flow
- Request `chat:write` scope
- Store Slack team + user IDs
- Handle workspace switching
- **Only worth it if 80%+ of users use Slack**

**Recommendation:** Start with Approach A (webhooks), upgrade to B if needed.

---

### Phase 2: Deployment Infrastructure (Week 2)

#### 2.1 Vercel Deployment (Frontend)

**Current Stack:** Next.js 15.3.4 + React 19

**Deployment Steps:**

**A. Pre-Deployment Checklist**
- [ ] Run production build locally: `npm run build`
- [ ] Fix any TypeScript errors
- [ ] Fix any ESLint warnings
- [ ] Test on multiple browsers (Chrome, Safari, Firefox)
- [ ] Test on mobile (iOS Safari, Android Chrome)
- [ ] Compress images (use next/image for optimization)
- [ ] Enable React Strict Mode in production

**B. Vercel Configuration** (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sfo1"],
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase-auth-domain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@firebase-project-id",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "@firebase-storage-bucket",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "@firebase-messaging-sender-id",
    "NEXT_PUBLIC_FIREBASE_APP_ID": "@firebase-app-id"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "geolocation=(), microphone=(), camera=()" }
      ]
    }
  ]
}
```

**C. Environment Variables (Vercel Dashboard)**
```bash
# Firebase (Production)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=avospace-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=avospace-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=avospace-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Optional: Analytics
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...

# Server-side only (no NEXT_PUBLIC prefix)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
SLACK_CLIENT_SECRET=...
```

**D. Custom Domain Setup**
```
1. Buy domain (e.g., avospace.app) - $12/year
2. Add to Vercel project
3. Configure DNS:
   - A record: 76.76.19.19
   - AAAA record: 2606:4700:4700::1111
4. Enable HTTPS (automatic via Vercel)
5. Force HTTPS redirect
```

**E. Deployment Commands**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### 2.2 Firebase Deployment (Backend)

**Services to Deploy:**

**A. Firestore Security Rules**
```bash
# Deploy rules
firebase deploy --only firestore:rules

# Test rules locally first
firebase emulators:start --only firestore
npm run test:rules
```

**B. Firestore Indexes**
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Monitor index build status
firebase firestore:indexes
```

**C. Firebase Cloud Functions** (If using rate limiting/notifications)
```bash
# functions/package.json
{
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.5.0"
  }
}

# Deploy functions
firebase deploy --only functions

# Monitor function logs
firebase functions:log
```

**D. Firebase Hosting** (Optional - for static assets)
```bash
# If serving public assets via Firebase
firebase deploy --only hosting
```

#### 2.3 Database Seeding & Migration

**Production Database Setup:**

```bash
# 1. Create production Firestore database
# Firebase Console > Create Database > Production mode

# 2. Seed study spots
npm run seed:production
# Or manually via Firebase Console

# 3. Create initial admin user (yourself)
# Firebase Console > Authentication > Add user

# 4. Test with sample data
# Create 2-3 test check-ins
# Verify real-time updates work
# Delete test data
```

**Backup Strategy:**
```bash
# Enable automated backups (Firebase Console)
# Firestore > Backups > Schedule daily backups

# Or use gcloud CLI
gcloud firestore export gs://avospace-backups/$(date +%Y%m%d)
```

#### 2.4 CI/CD Pipeline (Optional but Recommended)

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**Benefits:**
- Automated testing before deployment
- Prevent broken code from reaching production
- Deployment history and rollback capability

---

### Phase 3: Map Improvements (Week 2-3)

#### 3.1 Accurate Study Spot Markers

**Current Issue:** Need to add real coordinates to study spots

**Implementation:**

**A. Update Data Model** (`study_spots` collection)
```typescript
interface StudySpot {
  id: string;
  name: string;
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;           // NEW: Full address for accessibility
  buildingCode?: string;     // NEW: e.g., "DOE" for Doe Library
}
```

**B. UC Berkeley Study Spot Coordinates**
```typescript
export const STUDY_SPOTS_WITH_COORDS = [
  {
    id: 'doe-library',
    name: 'Doe Library',
    hours: '8:00 AM - 12:00 AM',
    coordinates: { lat: 37.8722, lng: -122.2595 },
    address: 'Doe Memorial Library, Berkeley, CA 94720',
    buildingCode: 'DOE'
  },
  {
    id: 'moffitt-library',
    name: 'Moffitt Library',
    hours: '24 Hours',
    coordinates: { lat: 37.8726, lng: -122.2607 },
    address: 'Moffitt Library, Berkeley, CA 94720',
    buildingCode: 'MOFFITT'
  },
  {
    id: 'main-stacks',
    name: 'Main Stacks',
    hours: '8:00 AM - 10:00 PM',
    coordinates: { lat: 37.8723, lng: -122.2594 },
    address: 'Main Stacks, Berkeley, CA 94720',
    buildingCode: 'MAIN'
  },
  {
    id: 'mlk-student-union',
    name: 'MLK Student Union',
    hours: '7:00 AM - 11:00 PM',
    coordinates: { lat: 37.8693, lng: -122.2598 },
    address: 'MLK Jr. Student Union, Berkeley, CA 94720',
    buildingCode: 'MLK'
  },
  {
    id: 'kresge-engineering',
    name: 'Kresge Engineering Library',
    hours: '8:00 AM - 11:00 PM',
    coordinates: { lat: 37.8754, lng: -122.2577 },
    address: 'Kresge Engineering Library, Berkeley, CA 94720',
    buildingCode: 'KRESGE'
  }
];
```

**C. Migration Script**
```bash
npm run migrate:add-coordinates
```

#### 3.2 Real-Time User Count on Map

**Implementation:**

**A. Aggregate Check-Ins by Spot**
```typescript
// In LeafletMap.tsx or MapView.tsx
const [spotCounts, setSpotCounts] = useState<Record<string, number>>({});

useEffect(() => {
  // Real-time listener for ALL active check-ins
  const unsubscribe = onSnapshot(
    query(
      collection(db, 'check_ins'),
      where('isActive', '==', true)
    ),
    (snapshot) => {
      const counts: Record<string, number> = {};
      
      snapshot.docs.forEach(doc => {
        const checkIn = doc.data();
        if (checkIn.expiresAt.toMillis() > Date.now()) {
          counts[checkIn.spotId] = (counts[checkIn.spotId] || 0) + 1;
        }
      });
      
      setSpotCounts(counts);
    }
  );
  
  return () => unsubscribe();
}, []);
```

**B. Custom Map Markers with Count Badge**
```typescript
// Custom Leaflet marker with count
import L from 'leaflet';

function createCountMarker(spot: StudySpot, count: number) {
  const icon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container">
        <div class="marker-icon">🥑</div>
        ${count > 0 ? `<div class="marker-badge">${count}</div>` : ''}
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
  });
  
  return L.marker([spot.coordinates.lat, spot.coordinates.lng], { icon });
}
```

**C. Marker Styling** (`map.css`)
```css
.marker-container {
  position: relative;
}

.marker-icon {
  font-size: 32px;
  line-height: 40px;
  text-align: center;
}

.marker-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #E89B8E; /* Coral */
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
```

#### 3.3 Clickable Markers → Study Spot Card Popup

**Implementation:**

**A. Leaflet Popup with StudySpotCard**
```typescript
// In LeafletMap.tsx
import { renderToString } from 'react-dom/server';
import StudySpotCard from '@/app/avo_study/components/StudySpotCard';

// Option 1: Simple Popup (Recommended)
marker.bindPopup(`
  <div class="map-popup">
    <h3>${spot.name}</h3>
    <p>${spot.hours}</p>
    <p><strong>${count} studying now</strong></p>
    <a href="/avo_study#${spot.id}" class="btn-view-roster">
      View Roster →
    </a>
  </div>
`);

// Option 2: Full StudySpotCard in Popup (Advanced)
// Note: Requires careful handling of React in Leaflet
const popupContent = document.createElement('div');
ReactDOM.createRoot(popupContent).render(
  <StudySpotCard spot={spot} compact={true} />
);
marker.bindPopup(popupContent);
```

**B. Smooth Scroll to Card on Map Click**
```typescript
// Add anchor IDs to cards
<div id={`spot-${spot.id}`} className="study-spot-card">
  ...
</div>

// Handle map marker click
marker.on('click', () => {
  // Close map overlay if in mobile view
  setShowMapOverlay(false);
  
  // Smooth scroll to corresponding card
  const cardElement = document.getElementById(`spot-${spot.id}`);
  cardElement?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'center' 
  });
  
  // Optional: Highlight card briefly
  cardElement?.classList.add('highlight-pulse');
  setTimeout(() => {
    cardElement?.classList.remove('highlight-pulse');
  }, 2000);
});
```

**C. Bidirectional Navigation**
```typescript
// Add "Show on Map" button to StudySpotCard
<button 
  className="show-on-map-btn"
  onClick={() => {
    router.push(`/map?spotId=${spot.id}`);
  }}
>
  📍 Show on Map
</button>

// In MapView, check for query param and zoom
useEffect(() => {
  const spotId = searchParams.get('spotId');
  if (spotId && mapRef.current) {
    const spot = spots.find(s => s.id === spotId);
    if (spot) {
      mapRef.current.flyTo(
        [spot.coordinates.lat, spot.coordinates.lng],
        17, // zoom level
        { duration: 1.5 }
      );
      
      // Open popup automatically
      markersRef.current[spotId]?.openPopup();
    }
  }
}, [searchParams, spots]);
```

---

## Production Operations

### 4.1 Monitoring & Alerting

**Setup Priority: High**

#### A. Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Configuration:**
```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of requests
  environment: process.env.NODE_ENV,
  
  // Ignore expected errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection',
  ],
  
  // Add user context
  beforeSend(event, hint) {
    if (auth.currentUser) {
      event.user = {
        id: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Unknown'
      };
    }
    return event;
  }
});
```

**Alerts to Configure:**
- Error rate > 5% in last 5 minutes → Slack notification
- New issue type (first occurrence) → Slack notification
- Function timeout or memory limit → Slack notification

#### B. Performance Monitoring

**Vercel Analytics** (Built-in)
- Real User Monitoring (RUM)
- Core Web Vitals (LCP, FID, CLS)
- Free tier: 100K requests/month

**Firebase Performance Monitoring**
```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);

// Automatic traces for page loads, HTTP requests
// Custom traces for specific operations
const trace = perf.trace('check_in_flow');
trace.start();
// ... user checks in
trace.stop();
```

#### C. Uptime Monitoring

**Options:**
- **UptimeRobot** (Free: 50 monitors, 5-min intervals)
- **Better Uptime** (Paid: $10/month, 1-min intervals, status page)
- **Vercel Monitoring** (Built-in, 1-min health checks)

**Endpoints to Monitor:**
- `https://avospace.app` (homepage)
- `https://avospace.app/avo_study` (main feature)
- `https://avospace.app/api/health` (create health check endpoint)

#### D. Firestore Usage Monitoring

**Set Budget Alerts:**
```
Firebase Console > Usage & Billing > Budgets & Alerts
- Daily read limit: 50,000 (free tier: 50K/day)
- Daily write limit: 20,000 (free tier: 20K/day)
- Alert at 80% of quota
```

**Expected Usage for 10 Users:**
- ~500 reads/day (roster updates)
- ~50 writes/day (check-ins)
- Well within free tier ✅

### 4.2 Logging Strategy

**Frontend Logging:**
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
    // Send to analytics if needed
  },
  
  error: (message: string, error: Error, data?: any) => {
    console.error(`[ERROR] ${message}`, error, data);
    Sentry.captureException(error, { extra: data });
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

**Backend Logging (Cloud Functions):**
```typescript
import * as functions from 'firebase-functions';

functions.logger.info('Check-in created', { userId, spotId });
functions.logger.error('Rate limit exceeded', { userId, attempts });
```

### 4.3 Analytics & Metrics

**Track Key Metrics:**

**User Engagement:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Average session duration
- Check-ins per user per week

**Feature Usage:**
- Check-in creation rate
- Study request send rate
- Study request acceptance rate
- Map view vs. card view usage

**Performance:**
- Page load time (target: < 2s)
- Time to interactive (target: < 3s)
- Check-in creation latency (target: < 500ms)

**Implementation:**
```typescript
// Google Analytics 4
import ReactGA from 'react-ga4';

ReactGA.initialize(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

// Track events
ReactGA.event({
  category: 'Check-in',
  action: 'Created',
  label: spotName,
  value: duration
});
```

---

## Security & Compliance

### 5.1 Production Security Rules

**Firestore Rules** (Replace current dev rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    function hasValidPhone() {
      return isSignedIn() && 
             request.auth.token.phone_number != null;
    }
    
    // Study spots - Read-only for all, admin-write only
    match /study_spots/{spotId} {
      allow read: if isSignedIn();
      allow write: if false; // Admin-only via Firebase Console
    }
    
    // Check-ins - Users can only manage their own
    match /check_ins/{checkInId} {
      allow read: if isSignedIn();
      
      allow create: if isSignedIn() 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status in ['open', 'solo', 'break', 'sos', 'allnighter', 'procrastinating', 'cram']
        && request.resource.data.statusNote.size() <= 120
        && request.resource.data.isActive == true
        // Prevent duplicate active check-ins (check via client, enforced here)
        && !exists(/databases/$(database)/documents/check_ins/$(request.auth.uid + '_active'));
      
      allow update: if isSignedIn() 
        && resource.data.userId == request.auth.uid
        // Only allow updating isActive field (for checkout)
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['isActive']);
      
      allow delete: if isOwner(resource.data.userId);
    }
    
    // Study requests - Sender can create, receiver can update status
    match /study_requests/{requestId} {
      allow read: if isSignedIn() 
        && (resource.data.fromUserId == request.auth.uid 
         || resource.data.toUserId == request.auth.uid);
      
      allow create: if isSignedIn() 
        && request.resource.data.fromUserId == request.auth.uid
        && request.resource.data.message.size() <= 500
        && request.resource.data.status == 'pending';
      
      allow update: if isSignedIn() 
        && resource.data.toUserId == request.auth.uid
        // Only allow updating status and readAt
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'readAt'])
        && request.resource.data.status in ['accepted', 'declined'];
      
      allow delete: if isOwner(resource.data.fromUserId);
    }
    
    // Users - Read all, update only own
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() && request.auth.uid == userId;
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
  }
}
```

**Deploy:**
```bash
firebase deploy --only firestore:rules
```

### 5.2 Phone Number Verification

**Firebase Auth Phone Setup:**

```typescript
// lib/auth.ts
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';

// Step 1: Initialize reCAPTCHA
export function initRecaptcha(elementId: string) {
  return new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    }
  });
}

// Step 2: Send verification code
export async function sendVerificationCode(
  phoneNumber: string,
  appVerifier: RecaptchaVerifier
) {
  // Format: +1 (510) 555-1234 → +15105551234
  const formatted = phoneNumber.replace(/\D/g, '');
  const e164 = `+1${formatted}`;
  
  const confirmationResult = await signInWithPhoneNumber(
    auth,
    e164,
    appVerifier
  );
  
  return confirmationResult;
}

// Step 3: Verify code
export async function verifyCode(
  confirmationResult: any,
  code: string
) {
  const result = await confirmationResult.confirm(code);
  return result.user;
}
```

**UI Flow:**
```
1. User goes to /account/settings
2. Clicks "Add Phone Number"
3. Enters phone number → sends SMS code
4. Enters 6-digit code → verifies and links to account
5. Phone number stored in Firebase Auth (not Firestore)
```

### 5.3 Content Moderation

**Bad Words Filter** (Client-side pre-check)
```typescript
// utils/moderation.ts
import Filter from 'bad-words';

const filter = new Filter();

export function validateMessage(text: string): {
  isClean: boolean;
  reason?: string;
} {
  if (filter.isProfane(text)) {
    return { 
      isClean: false, 
      reason: 'Message contains inappropriate language' 
    };
  }
  
  // Check for spam patterns
  if (/(.)\1{5,}/.test(text)) { // Repeated chars (aaaaaaa)
    return { 
      isClean: false, 
      reason: 'Message looks like spam' 
    };
  }
  
  if (/(https?:\/\/[^\s]+)/gi.test(text)) { // URLs
    return { 
      isClean: false, 
      reason: 'No URLs allowed in messages' 
    };
  }
  
  return { isClean: true };
}
```

**Server-side Moderation** (Cloud Functions)
```typescript
// Perspective API (Google) for advanced moderation
import { v2 } from '@google-cloud/language';

const client = new v2.LanguageServiceClient();

export async function moderateText(text: string) {
  const [response] = await client.moderateText({
    document: { content: text, type: 'PLAIN_TEXT' }
  });
  
  const { moderationCategories } = response;
  const highConfidenceFlags = moderationCategories.filter(
    cat => cat.confidence > 0.7
  );
  
  if (highConfidenceFlags.length > 0) {
    // Auto-reject or flag for manual review
    return { approved: false, flags: highConfidenceFlags };
  }
  
  return { approved: true };
}
```

### 5.4 Privacy Compliance (GDPR/CCPA-lite)

**Required for 10 Users:** Minimal (users are within your org)

**Required for Public Launch:**

**A. Privacy Policy Page** (`/privacy`)
- What data we collect (email, phone, location, messages)
- How we use it (feature functionality only)
- Data retention (auto-delete check-ins after 7 days)
- User rights (export, delete account)

**B. Terms of Service** (`/terms`)
- Acceptable use policy
- Liability disclaimers
- UC Berkeley affiliation disclaimer

**C. Data Export/Delete Functions**
```typescript
// /api/user/export
export async function GET(request: Request) {
  const userId = auth.currentUser?.uid;
  
  // Export all user data as JSON
  const userData = {
    profile: await getDoc(doc(db, 'users', userId)),
    checkIns: await getDocs(query(collection(db, 'check_ins'), where('userId', '==', userId))),
    studyRequests: await getDocs(query(collection(db, 'study_requests'), where('fromUserId', '==', userId)))
  };
  
  return new Response(JSON.stringify(userData), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// /api/user/delete
export async function DELETE(request: Request) {
  const userId = auth.currentUser?.uid;
  
  // Delete all user data
  await deleteUser(auth.currentUser);
  await deleteDoc(doc(db, 'users', userId));
  // Cascade delete check-ins and requests...
}
```

---

## Performance & Scalability

### 6.1 Current Performance Baseline

**Target for 10 Users:**
- Page Load: < 2s (First Contentful Paint)
- Time to Interactive: < 3s
- Check-in Creation: < 500ms
- Real-time Update Latency: < 200ms

**Measurement:**
```bash
# Lighthouse audit
npx lighthouse https://avospace.app --view

# Target scores:
# Performance: 90+
# Accessibility: 95+
# Best Practices: 95+
# SEO: 90+
```

### 6.2 Optimization Checklist

**Frontend:**
- [x] Use `next/image` for automatic image optimization
- [ ] Enable React Strict Mode
- [ ] Code split heavy components (Map, Modal)
- [ ] Lazy load below-the-fold content
- [ ] Preload critical fonts
- [ ] Minimize bundle size (analyze with `next/bundle-analyzer`)
- [ ] Use SWR or React Query for data fetching (optional)

**Backend:**
- [ ] Add Firestore composite indexes (already done ✅)
- [ ] Implement user data caching (already done ✅)
- [ ] Paginate long lists (e.g., limit 50 check-ins per query)
- [ ] Use Firebase CDN for static assets
- [ ] Enable Firestore persistence (offline support)

**Images:**
```bash
# Compress avocado-icon.png
npx @squoosh/cli --webp auto public/avocado-icon.png
# Reduces from 505 lines (base64?) to ~2KB WebP
```

### 6.3 Scaling Plan (10 → 100+ Users)

**Infrastructure Changes:**

| Metric | 10 Users | 100 Users | Solution |
|--------|----------|-----------|----------|
| Firestore Reads/Day | 500 | 5,000 | Still free tier ✅ |
| Firestore Writes/Day | 50 | 500 | Still free tier ✅ |
| Concurrent Users | 3-5 | 20-30 | Add CDN (Vercel Edge) |
| Real-time Listeners | 5-10 | 50-100 | Aggregate queries, polling fallback |
| SMS Messages/Day | 5 | 50 | Upgrade Twilio ($4/month) |

**When to Upgrade:**
- Switch to Firebase Blaze Plan (pay-as-you-go) at ~50 users
- Add Redis cache for user data at ~200 users
- Consider WebSockets instead of Firestore listeners at ~500 users

---

## Implementation Timeline

### Week 1: Core Features + Security

**Days 1-2: Security Hardening** (10 hours)
- [ ] Implement production Firestore rules (2h)
- [ ] Add input validation with Zod (2h)
- [ ] Set up rate limiting (3h)
- [ ] Configure error boundaries (1h)
- [ ] Set up Sentry monitoring (2h)

**Days 3-5: Study Requests** (12 hours)
- [ ] Build StudyRequestModal component (3h)
- [ ] Build StudyRequestInbox page (4h)
- [ ] Add notification badge to navbar (1h)
- [ ] Implement rate limiting for requests (2h)
- [ ] Test end-to-end flow (2h)

### Week 2: Deployment + Map

**Days 1-2: Deployment** (8 hours)
- [ ] Set up Vercel project (1h)
- [ ] Configure environment variables (1h)
- [ ] Deploy to staging (1h)
- [ ] Set up custom domain (1h)
- [ ] Deploy Firebase rules and indexes (1h)
- [ ] Seed production database (1h)
- [ ] Test production deployment (2h)

**Days 3-5: Map Improvements** (10 hours)
- [ ] Add coordinates to study spots (1h)
- [ ] Implement real-time user count on map (3h)
- [ ] Build clickable marker popups (2h)
- [ ] Add bidirectional navigation (card ↔ map) (2h)
- [ ] Style custom markers with badges (2h)

### Week 3: Polish + Monitoring

**Days 1-3: Production Operations** (8 hours)
- [ ] Set up uptime monitoring (1h)
- [ ] Configure Firestore usage alerts (1h)
- [ ] Implement analytics tracking (2h)
- [ ] Create health check endpoint (1h)
- [ ] Set up automated backups (1h)
- [ ] Write deployment runbook (2h)

**Days 4-5: Testing + Launch Prep** (8 hours)
- [ ] End-to-end testing with 3-5 beta users (4h)
- [ ] Fix bugs discovered in beta (2h)
- [ ] Performance optimization (Lighthouse audit) (1h)
- [ ] Create user onboarding guide (1h)

---

## Launch Checklist

### Pre-Launch (1 Day Before)

**Technical:**
- [ ] All tests passing
- [ ] Production deployment successful
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place
- [ ] Rollback plan documented

**Content:**
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] User guide / FAQ page
- [ ] Onboarding flow tested

**Communication:**
- [ ] Announcement message drafted
- [ ] Support contact info added (email/Slack)
- [ ] Beta testers thanked

### Launch Day

**9:00 AM:**
- [ ] Final smoke test (create check-in, send request, view map)
- [ ] Verify monitoring dashboards are active
- [ ] Post announcement to target users (Slack/Discord)

**Throughout Day:**
- [ ] Monitor error logs (Sentry)
- [ ] Watch Firestore usage (should stay under quota)
- [ ] Respond to user questions quickly
- [ ] Track first check-ins and requests

**End of Day:**
- [ ] Review analytics (sign-ups, check-ins, errors)
- [ ] Document any issues encountered
- [ ] Plan hot-fixes if needed

### Post-Launch (Week 1)

**Daily:**
- [ ] Check error rate (target: < 1%)
- [ ] Monitor uptime (target: 99.9%)
- [ ] Read user feedback

**Weekly:**
- [ ] Review key metrics (DAU, check-ins per user)
- [ ] Prioritize feature requests
- [ ] Plan next sprint

---

## Cost Breakdown (First 3 Months)

**10 Active Users, 50 Check-ins/Day**

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| **Vercel Hosting** | Hobby | $0 (free) |
| **Firebase (Firestore)** | Spark (free) | $0 |
| **Firebase Auth** | Free tier | $0 |
| **Custom Domain** | Namecheap | $1/month (amortized) |
| **Sentry** | Developer | $0 (5K events/month free) |
| **Twilio SMS** (optional) | Pay-as-you-go | $0.40/month (50 messages @ $0.008 each) |
| **UptimeRobot** | Free | $0 |
| **Total** | | **$1.40/month** ✅ |

**At Scale (100 Users):**
- Firebase: ~$5/month (still mostly in free tier)
- Twilio: ~$4/month (500 messages)
- **Total: ~$10/month**

---

## Success Metrics (First Month)

**User Adoption:**
- [ ] 10+ unique users signed up
- [ ] 50+ total check-ins created
- [ ] 80%+ of users return within 7 days

**Feature Usage:**
- [ ] Average 2+ check-ins per active user per week
- [ ] 10+ study requests sent
- [ ] 50%+ study request acceptance rate

**Technical Performance:**
- [ ] 99.5%+ uptime
- [ ] < 1% error rate
- [ ] < 3s average page load time
- [ ] 0 critical bugs

**User Satisfaction:**
- [ ] Collect informal feedback (Slack/in-person)
- [ ] < 5 complaints or bug reports
- [ ] At least 3 positive comments

---

## Recommended Tech Stack Summary

**Frontend:**
- ✅ Next.js 15 + React 19 + TypeScript (current)
- ✅ Bootstrap 5 (current)
- ➕ Zod (input validation)
- ➕ React Query or SWR (optional, for better data fetching)

**Backend:**
- ✅ Firebase Auth (current)
- ✅ Firestore (current)
- ➕ Firebase Cloud Functions (for rate limiting, notifications)
- ➕ Upstash Redis (for rate limit storage, optional)

**External Services:**
- ➕ Twilio (SMS notifications, optional)
- ➕ Slack Webhooks (notifications, optional)

**DevOps:**
- ✅ Vercel (hosting)
- ➕ GitHub Actions (CI/CD)
- ➕ Sentry (error tracking)
- ➕ UptimeRobot (uptime monitoring)

**Design:**
- ➕ Figma (for design mockups, optional)
- ✅ Custom CSS (current approach is fine)

---

## References & Resources

**Firebase Best Practices:**
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Performance Monitoring](https://firebase.google.com/docs/perf-mon)

**Next.js Optimization:**
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Web.dev Performance Guide](https://web.dev/performance/)

**Rate Limiting:**
- [Upstash Rate Limiting](https://upstash.com/docs/redis/features/ratelimiting)
- [Rate Limiting Algorithms](https://hechao.li/2018/06/25/Rate-Limiter-Part1/)

**SMS/Notifications:**
- [Twilio Programmable SMS](https://www.twilio.com/docs/sms)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

**Monitoring:**
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics](https://vercel.com/docs/analytics)

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Total Estimated Time:** 48-60 hours (2-3 weeks)

**Priority Order:**
1. Security hardening (CRITICAL)
2. Study requests (HIGH - completes MVP)
3. Deployment (HIGH)
4. Map improvements (MEDIUM)
5. Monitoring (MEDIUM)
6. External integrations (LOW - nice to have)

