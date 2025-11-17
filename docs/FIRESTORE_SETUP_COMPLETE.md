# ✅ Firestore Setup - Complete Package

All files and documentation are ready for setting up your Avo Study Firestore backend.

---

## 📦 What's Included

### Configuration Files (Ready to Deploy)

1. **`firestore.rules`** - Security rules for all collections
2. **`firestore.indexes.json`** - Composite index definitions
3. **`scripts/seedStudySpots.ts`** - Automated seed script (updated with your Firebase config)

### Documentation Files

4. **`docs/FIRESTORE_SETUP_INSTRUCTIONS.md`** - Complete step-by-step setup guide
5. **`docs/FIRESTORE_QUICK_REFERENCE.md`** - Code snippets for common operations
6. **`docs/FIRESTORE_DATA_MODEL.md`** - Detailed schema and relationships

### Existing Files (No changes needed)

7. **`src/types/study.ts`** - TypeScript type definitions (already created)
8. **`src/lib/firebase.ts`** - Firebase initialization (already configured)

---

## 🚀 Quick Start Guide

### Option 1: Automated Setup (5 minutes)

```bash
# Step 1: Seed study spots collection
npx ts-node scripts/seedStudySpots.ts

# Step 2: Deploy security rules and indexes
firebase login
firebase init firestore  # Select 'firestore.rules' and 'firestore.indexes.json'
firebase deploy --only firestore
```

**Done!** All 3 collections, indexes, and security rules are configured.

---

### Option 2: Manual Setup via Firebase Console (15 minutes)

Follow the detailed guide in `docs/FIRESTORE_SETUP_INSTRUCTIONS.md`:

1. **Create Collections** (Section: Part 1)
   - Create `study_spots` with 5 documents
   - Create empty `check_ins` collection
   - Create empty `study_requests` collection

2. **Create Indexes** (Section: Part 2)
   - 2 composite indexes for `check_ins`
   - 1 composite index for `study_requests`

3. **Update Security Rules** (Section: Part 3)
   - Copy rules from `firestore.rules`
   - Publish in Firebase Console

4. **Verify Setup** (Section: Part 4)
   - Run tests in Rules Playground
   - Verify all indexes are enabled

---

## 📊 Data Model Summary

### Collections Created

| Collection | Type | Documents | Purpose |
|------------|------|-----------|---------|
| **study_spots** | Static | 5 docs | Study location directory |
| **check_ins** | Dynamic | 0+ docs | Active user sessions |
| **study_requests** | Dynamic | 0+ docs | Study buddy requests |

### Indexes Created

1. **check_ins**: `spotId + isActive + startedAt` (DESC)
2. **check_ins**: `userId + isActive`
3. **study_requests**: `toUserId + status + sentAt` (DESC)

### Security Rules

- ✅ Read access: All authenticated users (except study_requests)
- ✅ Write access: Owners only
- ✅ Validation: Character limits, status enums
- ✅ Privacy: Study requests visible to sender/recipient only

---

## 🎯 Next Steps After Setup

### 1. Verify Setup ✅

Run these checks in Firebase Console:

```
Firestore Database → Data tab:
  ✓ study_spots collection exists (5 documents)
  ✓ Each spot has: name, hours

Firestore Database → Indexes tab:
  ✓ 3 indexes with status "Enabled"

Firestore Database → Rules tab:
  ✓ Rules published and active
```

---

### 2. Start Building Frontend 🎨

**First Component: Study Spots Page**

```typescript
// src/app/avo_study/page.tsx
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function AvoStudyPage() {
  const spotsSnapshot = await getDocs(collection(db, 'study_spots'));
  const spots = spotsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return (
    <div>
      <h1>Avo Study</h1>
      {spots.map(spot => (
        <div key={spot.id}>
          <h2>{spot.name}</h2>
          <p>{spot.hours}</p>
        </div>
      ))}
    </div>
  );
}
```

**Refer to**: `docs/FIRESTORE_QUICK_REFERENCE.md` for more code examples

---

### 3. Implement Core Features 🚀

**Priority 1: Check-in Flow**
- [ ] Build `StudySpotCard` component
- [ ] Build `CheckInModal` component
- [ ] Implement check-in creation
- [ ] Display active check-ins with real-time updates

**Priority 2: Real-time Roster**
- [ ] Add real-time listener to study spot cards
- [ ] Populate user data (username, kao)
- [ ] Display status badges (open/solo)
- [ ] Show status notes

**Priority 3: Study Requests (Phase 2)**
- [ ] Build study request modal
- [ ] Implement request sending
- [ ] Build inbox page
- [ ] Handle accept/decline

---

## 📚 Documentation Reference

### For Setup
→ **`docs/FIRESTORE_SETUP_INSTRUCTIONS.md`**
  - Complete manual setup guide
  - Console screenshots walkthrough
  - Troubleshooting section

### For Development
→ **`docs/FIRESTORE_QUICK_REFERENCE.md`**
  - Code snippets for all operations
  - Query patterns with examples
  - Error handling patterns
  - TypeScript usage examples

### For Understanding
→ **`docs/FIRESTORE_DATA_MODEL.md`**
  - Entity relationships diagram
  - Field-by-field schema details
  - Query pattern explanations
  - Storage and cost estimates

---

## 🔧 Configuration Files

### firestore.rules

Contains security rules for all collections. Highlights:

- **study_spots**: Read-only for authenticated users
- **check_ins**: Public read, owner-only write
- **study_requests**: Private read (sender/recipient), controlled write
- **Validation**: Character limits, status enums, required fields

**Deploy**: `firebase deploy --only firestore:rules`

---

### firestore.indexes.json

Contains 3 composite index definitions. Required for:

1. Fetching check-ins by spot (roster display)
2. Finding user's active check-in (before creating new one)
3. Fetching study requests (inbox)

**Deploy**: `firebase deploy --only firestore:indexes`

---

### scripts/seedStudySpots.ts

Automatically creates `study_spots` collection with 5 documents:

- Doe Library (8 AM - 12 AM)
- Moffitt Library (24 Hours)
- Main Stacks (8 AM - 10 PM)
- MLK Student Union (7 AM - 11 PM)
- Kresge Engineering Library (8 AM - 11 PM)

**Run**: `npx ts-node scripts/seedStudySpots.ts`

---

## 💡 Key Design Decisions

### 1. No `id` Field in Documents ✅
**Rationale**: Document ID already serves as unique identifier. Storing `id` as a field is redundant.

**Implementation**: Seed script extracts `id` before saving document data.

---

### 2. Client-Side Expiry Filtering ✅
**Rationale**: Avoids Cloud Functions cost for MVP.

**Implementation**: Filter by `expiresAt > now()` in queries.

**Future**: Add Cloud Function for cleanup in Phase 2.

---

### 3. No User Denormalization in check_ins ✅
**Rationale**: Single source of truth, reduces data duplication.

**Trade-off**: 1 extra read per check-in displayed (acceptable for MVP).

**Implementation**: Populate user data client-side.

---

### 4. Public Check-in Roster ✅
**Rationale**: Discovery is the core feature - users need to see who's studying.

**Privacy**: No sensitive data exposed (only username, kao, status).

**Future**: Add privacy toggle in Phase 2.

---

## 🎉 You're Ready!

All files are created and ready to use. Follow the Quick Start Guide above to set up your Firestore backend.

### Recommended Path

1. ✅ **Run seed script** to create study spots
2. ✅ **Deploy indexes and rules** using Firebase CLI
3. ✅ **Verify setup** in Firebase Console
4. ✅ **Start building** frontend components

### Questions?

Refer to the troubleshooting section in `docs/FIRESTORE_SETUP_INSTRUCTIONS.md` or check the [official Firebase docs](https://firebase.google.com/docs/firestore).

---

**Setup Package Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Production Ready ✨

