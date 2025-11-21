# 📚 Firestore Setup Instructions for Avo Study

Complete step-by-step guide based on official Firebase documentation to set up your Firestore collections, indexes, and security rules.

---

## 📋 Prerequisites

- [x] Firebase project created (`avospace-6a984`)
- [x] Firestore Database enabled
- [x] Firebase SDK configured in your app
- [x] Admin access to Firebase Console

---

## 🎯 Setup Overview

You'll create **3 new collections**:

| Collection | Purpose | Documents | Indexes Needed |
|------------|---------|-----------|----------------|
| `study_spots` | Static location data | 5 documents | None (simple queries) |
| `check_ins` | Active user sessions | Dynamic | 2 composite indexes |
| `study_requests` | Study buddy requests | Dynamic | 1 composite index |

Your existing `users` collection requires **no changes**.

---

## 🚀 Part 1: Create Collections

### Method A: Automated (Recommended) ⭐

Run the seed script to automatically create all collections:

```bash
# From project root
npm install
npx ts-node scripts/seedStudySpots.ts
```

**What this does:**
- ✅ Creates `study_spots` collection
- ✅ Adds all 5 study spot documents
- ✅ Sets proper document IDs
- ✅ Validates data structure

**Expected output:**
```
🌱 Starting to seed study spots...

✅ Added: Doe Library (doe-library)
✅ Added: Moffitt Library (moffitt-library)
✅ Added: Main Stacks (main-stacks)
✅ Added: MLK Student Union (mlk-student-union)
✅ Added: Kresge Engineering Library (kresge-engineering)

🎉 Successfully seeded all study spots!

Total spots added: 5
📋 Each spot has: name, hours (2 fields)
💡 Note: Document ID serves as the spot ID
```

---

### Method B: Manual (Firebase Console)

If you prefer to create collections manually:

#### Step 1: Access Firebase Console

1. Go to https://console.firebase.google.com/
2. Select project: **avospace-6a984**
3. Navigate to: **Firestore Database** → **Data** tab

---

#### Step 2: Create `study_spots` Collection

**2.1 Start Collection**
- Click **+ Start collection** (or **+ Add collection**)
- Collection ID: `study_spots`
- Click **Next**

**2.2 Add Document 1: Doe Library**
- Document ID: `doe-library` (type manually, don't use Auto-ID)
- Add fields:
  ```
  name (string): "Doe Library"
  hours (string): "8:00 AM - 12:00 AM"
  ```
- Click **Save**

**2.3 Add Document 2: Moffitt Library**
- Click **+ Add document** in `study_spots` collection
- Document ID: `moffitt-library`
- Fields:
  ```
  name (string): "Moffitt Library"
  hours (string): "24 Hours"
  ```
- Click **Save**

**2.4 Add Document 3: Main Stacks**
- Document ID: `main-stacks`
- Fields:
  ```
  name (string): "Main Stacks"
  hours (string): "8:00 AM - 10:00 PM"
  ```

**2.5 Add Document 4: MLK Student Union**
- Document ID: `mlk-student-union`
- Fields:
  ```
  name (string): "MLK Student Union"
  hours (string): "7:00 AM - 11:00 PM"
  ```

**2.6 Add Document 5: Kresge Engineering Library**
- Document ID: `kresge-engineering`
- Fields:
  ```
  name (string): "Kresge Engineering Library"
  hours (string): "8:00 AM - 11:00 PM"
  ```

**✅ Checkpoint**: You should see 5 documents in `study_spots`

---

#### Step 3: Create `check_ins` Collection

**3.1 Start Collection**
- Click **+ Start collection**
- Collection ID: `check_ins`
- Click **Next**

**3.2 Skip or Create Test Document**
- **Option A (Recommended)**: Click **Cancel** - collection will be created when users check in
- **Option B**: Create a test document for validation:
  - Document ID: **Auto-ID**
  - Fields:
    ```
    userId (string): "test-user-id"
    spotId (string): "doe-library"
    status (string): "open"
    statusNote (string): "Testing check-in"
    startedAt (timestamp): [Current time]
    expiresAt (timestamp): [2 hours from now]
    isActive (boolean): true
    ```
  - Delete this test document after validation

---

#### Step 4: Create `study_requests` Collection

**4.1 Start Collection**
- Click **+ Start collection**
- Collection ID: `study_requests`
- Click **Next**

**4.2 Skip or Create Test Document**
- **Option A (Recommended)**: Click **Cancel** - collection will be created when users send requests
- **Option B**: Create test document following same pattern as check_ins

---

## 🔍 Part 2: Create Composite Indexes

**Why indexes are needed**: Firestore requires composite indexes for queries that filter/sort on multiple fields.

### Method A: Automatic (Recommended)

The easiest way is to **let Firebase create indexes automatically**:

1. Run your app and try to query check-ins
2. Firebase will show an error with a **clickable link**
3. Click the link to auto-create the index
4. Wait 2-5 minutes for index to build

### Method B: Manual Creation

#### Index 1: Check-ins by Spot (for roster display)

1. In Firebase Console, go to **Firestore Database** → **Indexes** tab
2. Click **+ Create Index**
3. Configure:
   ```
   Collection: check_ins
   
   Fields:
   - spotId (Ascending)
   - isActive (Ascending)
   - startedAt (Descending)
   
   Query scope: Collection
   ```
4. Click **Create**
5. Wait for status to change from "Building" → "Enabled" (2-5 min)

**Purpose**: Fetch active check-ins for a specific spot, sorted by most recent

---

#### Index 2: Check-ins by User (for "my check-in" queries)

1. Click **+ Create Index**
2. Configure:
   ```
   Collection: check_ins
   
   Fields:
   - userId (Ascending)
   - isActive (Ascending)
   
   Query scope: Collection
   ```
3. Click **Create**

**Purpose**: Find active check-in for logged-in user

---

#### Index 3: Study Requests Inbox (for notifications)

1. Click **+ Create Index**
2. Configure:
   ```
   Collection: study_requests
   
   Fields:
   - toUserId (Ascending)
   - status (Ascending)
   - sentAt (Descending)
   
   Query scope: Collection
   ```
3. Click **Create**

**Purpose**: Fetch pending requests for a user, sorted by most recent

---

### Method C: Deploy from Configuration File

1. Create `firestore.indexes.json` in your project root (see file in repo)
2. Install Firebase CLI if not already installed:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
3. Initialize Firestore:
   ```bash
   firebase init firestore
   ```
4. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

---

## 🔒 Part 3: Update Security Rules

### Step 1: Open Rules Editor

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. You'll see your current rules

### Step 2: Add Avo Study Rules

**Replace or merge** with these rules (keep your existing user rules):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function: Check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function: Check if user owns the resource
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // ============================================
    // AVO STUDY COLLECTIONS
    // ============================================
    
    // Study spots (read-only for authenticated users)
    match /study_spots/{spotId} {
      allow read: if isSignedIn();
      allow write: if false; // Admin-only via console
    }
    
    // Check-ins (users can read all, but only manage their own)
    match /check_ins/{checkInId} {
      allow read: if isSignedIn();
      
      allow create: if isSignedIn() 
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status in ['open', 'solo']
        && request.resource.data.isActive == true;
      
      allow update, delete: if isSignedIn() 
        && resource.data.userId == request.auth.uid;
    }
    
    // Study requests (users can only see their own sent/received)
    match /study_requests/{requestId} {
      allow read: if isSignedIn() 
        && (resource.data.fromUserId == request.auth.uid 
         || resource.data.toUserId == request.auth.uid);
      
      allow create: if isSignedIn() 
        && request.resource.data.fromUserId == request.auth.uid
        && request.resource.data.status == 'pending';
      
      allow update: if isSignedIn() 
        && resource.data.toUserId == request.auth.uid
        && request.resource.data.status in ['accepted', 'declined'];
    }
    
    // ============================================
    // EXISTING USERS COLLECTION (no changes)
    // ============================================
    
    match /users/{userId} {
      allow read: if isSignedIn();
      allow update: if isSignedIn() && isOwner(userId);
    }
  }
}
```

### Step 3: Publish Rules

1. Click **Publish**
2. Confirm the changes
3. Rules are live immediately

---

## ✅ Part 4: Verify Setup

### 4.1 Verify Collections

In **Firestore Database** → **Data** tab:

- [x] `study_spots` collection exists with **5 documents**
- [x] Each document has fields: `name`, `hours` (2 fields)
- [x] Document IDs are: `doe-library`, `moffitt-library`, `main-stacks`, `mlk-student-union`, `kresge-engineering`

### 4.2 Verify Indexes

In **Firestore Database** → **Indexes** tab:

- [x] `check_ins` index: `spotId`, `isActive`, `startedAt` - Status: **Enabled**
- [x] `check_ins` index: `userId`, `isActive` - Status: **Enabled**
- [x] `study_requests` index: `toUserId`, `status`, `sentAt` - Status: **Enabled**

⚠️ If status shows "Building", wait 2-5 minutes and refresh.

### 4.3 Test Security Rules

Use the **Rules Playground** (Rules tab → **Rules Playground** button):

**Test 1: Read study spots (should ALLOW)**
```
Operation: get
Path: /study_spots/doe-library
Authentication: Simulate authenticated user
Expected: ✅ ALLOW
```

**Test 2: Write to study spots (should DENY)**
```
Operation: create
Path: /study_spots/test-spot
Authentication: Simulate authenticated user
Expected: ❌ DENY
```

**Test 3: Read all check-ins (should ALLOW)**
```
Operation: list
Path: /check_ins
Authentication: Simulate authenticated user
Expected: ✅ ALLOW
```

---

## 📊 Data Structure Reference

### Collection: `study_spots`

**Document ID**: Custom (e.g., `doe-library`)

**Fields**:
```typescript
{
  name: string,      // "Doe Library"
  hours: string      // "8:00 AM - 12:00 AM"
}
```

**Total fields**: 2  
**Storage per doc**: ~50 bytes

---

### Collection: `check_ins`

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  userId: string,         // Foreign key to users.uid
  spotId: string,         // Foreign key to study_spots doc ID
  status: string,         // "open" | "solo"
  statusNote?: string,    // Optional, max 120 chars
  startedAt: timestamp,   // Check-in creation time
  expiresAt: timestamp,   // Auto-checkout time
  isActive: boolean       // false when expired/checked out
}
```

**Total fields**: 7  
**Storage per doc**: ~200 bytes

---

### Collection: `study_requests`

**Document ID**: Auto-generated

**Fields**:
```typescript
{
  fromUserId: string,     // Sender user ID
  toUserId: string,       // Recipient user ID
  message: string,        // Free text, max 500 chars
  status: string,         // "pending" | "accepted" | "declined"
  sentAt: timestamp       // Request creation time
}
```

**Total fields**: 5  
**Storage per doc**: ~600 bytes

---

## 🐛 Troubleshooting

### Issue: "Missing index" error when querying

**Solution**: 
1. Check error message for auto-create link
2. Click the link to create index
3. Wait 2-5 minutes for build to complete

---

### Issue: "Permission denied" when reading study spots

**Solution**:
1. Verify user is authenticated (`auth.currentUser` exists)
2. Check security rules are published
3. Try signing out and back in

---

### Issue: Seed script fails with authentication error

**Solution**:
1. This is expected - seed script uses Firebase Admin SDK behavior
2. For seeding from client SDK, you need to be signed in
3. Alternative: Use Firebase Admin SDK or create documents manually via console

---

### Issue: Can't find Indexes tab

**Solution**:
1. Make sure Firestore is initialized (not in "test mode" with no production database)
2. Try making a compound query in your app first - Firebase will prompt you to create an index

---

### Issue: Index stuck in "Building" status

**Solution**:
1. Wait up to 10 minutes (small collections)
2. If still building after 30 minutes, delete and recreate
3. Check Firebase Status page for outages: https://status.firebase.google.com/

---

## 🎉 Next Steps

After completing this setup:

1. ✅ Firestore backend is ready
2. 🚀 Start building frontend components
3. 📝 Test check-in creation flow
4. 🎨 Build `StudySpotCard` component
5. 🔔 Implement real-time listeners

---

## 📚 Official Documentation References

- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Creating Collections](https://firebase.google.com/docs/firestore/using-console)
- [Composite Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

**Document Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Production Ready

