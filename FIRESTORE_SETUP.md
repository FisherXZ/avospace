# Firestore Backend Setup Guide - Avo Study

This guide walks you through setting up the Firestore backend for the Avo Study feature.

**MVP Version**: Card-based interface (no map for now). Users see study spot cards and can check in to appear on the card with a colored status indicator.

---

## Step 1: Create Collections via Firebase Console

### 1.1 Access Firebase Console
1. Go to https://console.firebase.google.com/
2. Select your AvoSpace project
3. Navigate to **Firestore Database** in the left sidebar
4. If prompted, click **Create database** (select production mode or test mode based on your preference)

### 1.2 Create `study_spots` Collection

**Option A: Manual Creation (Simple)**
1. Click **"Start collection"**
2. Enter collection ID: `study_spots`
3. Click **"Next"**
4. For the first document, use the data from **Study Spot #1 - Doe Library** below
5. Document ID: `doe-library`
6. Add all fields as shown in the data section below

**Option B: Automated (Recommended)**
Run the seed script:
```bash
# From project root
npm install -g ts-node
npx ts-node scripts/seedStudySpots.ts
```

---

## Study Spots Data to Add

### Study Spot #1: Doe Library
```
Document ID: doe-library

Fields:
  name (string): "Doe Library"
  hours (string): "8:00 AM - 12:00 AM"
```

### Study Spot #2: Moffitt Library
```
Document ID: moffitt-library

Fields:
  name (string): "Moffitt Library"
  hours (string): "24 Hours"
```

### Study Spot #3: Main Stacks
```
Document ID: main-stacks

Fields:
  name (string): "Main Stacks"
  hours (string): "8:00 AM - 10:00 PM"
```

### Study Spot #4: MLK Student Union
```
Document ID: mlk-student-union

Fields:
  name (string): "MLK Student Union"
  hours (string): "7:00 AM - 11:00 PM"
```

### Study Spot #5: Kresge Engineering Library
```
Document ID: kresge-engineering

Fields:
  name (string): "Kresge Engineering Library"
  hours (string): "8:00 AM - 11:00 PM"
```

---

## Step 2: Create Composite Indexes

### Why Indexes Are Needed
Firestore requires composite indexes for queries that filter/sort on multiple fields. Without these, your queries will fail in production.

### 2.1 Create Index for `check_ins`

1. In Firebase Console, go to **Firestore Database** → **Indexes** tab
2. Click **"Create Index"**
3. Configure:
   - **Collection ID**: `check_ins`
   - **Fields to index**:
     1. `spotId` → **Ascending**
     2. `isActive` → **Ascending**
     3. `startedAt` → **Descending**
   - **Query scope**: Collection
4. Click **"Create Index"**
5. Wait for index to build (usually 1-2 minutes)

**What This Index Enables:**
- Query all active check-ins at a specific spot, sorted by most recent first
- Example: Get live roster for Doe Library

### 2.2 Create Index for `study_requests`

1. Click **"Create Index"** again
2. Configure:
   - **Collection ID**: `study_requests`
   - **Fields to index**:
     1. `toUserId` → **Ascending**
     2. `status` → **Ascending**
     3. `sentAt` → **Descending**
   - **Query scope**: Collection
3. Click **"Create Index"**
4. Wait for index to build

**What This Index Enables:**
- Query a user's inbox filtered by status (pending/accepted/declined), sorted by newest first
- Example: Show all pending requests for current user

### 2.3 Create Index for `check_ins` (User Active Check-In)

1. Click **"Create Index"** again
2. Configure:
   - **Collection ID**: `check_ins`
   - **Fields to index**:
     1. `userId` → **Ascending**
     2. `isActive` → **Ascending**
   - **Query scope**: Collection
3. Click **"Create Index"**

**What This Index Enables:**
- Check if a user currently has an active check-in
- Prevent duplicate check-ins

---

## Step 3: Set Up Firestore Security Rules

### 3.1 Navigate to Rules Tab
1. In Firebase Console, go to **Firestore Database** → **Rules** tab

### 3.2 Update Rules
Replace the existing rules with:

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
        && request.resource.data.userId == request.auth.uid;
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
    
    // Users (extend existing rules - keep your current rules and add studyPrefs)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3.3 Publish Rules
1. Click **"Publish"**
2. Confirm the changes

---

## Step 4: Verify Setup

### 4.1 Check Collections
In Firestore Console, verify:
- [x] `study_spots` collection exists with 5 documents
- [x] Each study spot has required fields: `name` (string) and `hours` (string)

### 4.2 Check Indexes
In the **Indexes** tab, you should see:
- [x] Index on `check_ins` (spotId, isActive, startedAt) - Status: **Enabled**
- [x] Index on `study_requests` (toUserId, status, sentAt) - Status: **Enabled**
- [x] Index on `check_ins` (userId, isActive) - Status: **Enabled**

### 4.3 Test Security Rules
Use the **Rules Playground** to test:
1. Click **"Rules Playground"** tab
2. Test read access to `study_spots/doe-library` as an authenticated user → Should **allow**
3. Test write access to `study_spots/doe-library` → Should **deny**

---

## Step 5: Users Collection

**No changes needed** to the `users` collection for MVP. We'll use existing user data (username, kao) to display checked-in users.

---

## Troubleshooting

### Index Build Fails
- **Issue**: Index creation stuck or failed
- **Solution**: Delete the index and recreate it. Ensure collection name is spelled correctly.

### Security Rules Deny Access
- **Issue**: App can't read study_spots even when logged in
- **Solution**: 
  1. Check user is authenticated (`auth.currentUser` is not null)
  2. Verify rules are published
  3. Check browser console for specific error message

### Seed Script Not Working
- **Issue**: `seedStudySpots.ts` fails to run
- **Solution**:
  1. Ensure Firebase config is correct in the script
  2. Install dependencies: `npm install firebase`
  3. Check you have write permissions to Firestore

### Can't Find Indexes Tab
- **Issue**: Indexes tab not visible
- **Solution**: 
  1. Ensure Firestore is in production mode (not test mode with no rules)
  2. You may need to attempt a compound query first, then Firebase will prompt you to create an index

---

## Next Steps

After completing this setup:

1. ✅ Backend is ready for Avo Study feature
2. 🚀 Move to frontend development
3. 📝 Create TypeScript interfaces in `src/types/study.ts`
4. 🎨 Build UI components (StudySpotCard, CheckInModal, etc.)

---

## Quick Reference: Collections Summary

| Collection | Purpose | Key Fields |
|------------|---------|------------|
| `study_spots` | Static study location data | id, name, hours |
| `check_ins` | Active user check-in sessions | userId, spotId, status, startedAt, expiresAt, isActive |
| `study_requests` | Messages between users | fromUserId, toUserId, message, status, sentAt |
| `users` | User profiles (no changes) | username, kao (existing fields) |

---

**Setup Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Ready to Execute

