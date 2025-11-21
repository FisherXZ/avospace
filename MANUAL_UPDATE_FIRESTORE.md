# Manual Firestore Update Guide
## Adding Coordinates to Study Spots

Since the seed script requires admin permissions, you have **3 options** to update Firestore:

---

## 🚀 OPTION 1: Migration Page (Easiest - 30 seconds)

### Steps:
1. Make sure your dev server is running: `npm run dev`
2. Open: `http://localhost:3000/admin/migrate`
3. **Login** (any user account works)
4. Click the **"🚀 Update Coordinates"** button
5. Wait for "🎉 Successfully updated all study spots!" message
6. Click **"🔍 Verify Coordinates"** to confirm

### Features:
- ✅ One-click update
- ✅ Real-time progress logs
- ✅ Automatic verification
- ✅ Visual table showing all data
- ✅ Safe to run multiple times

---

## ✅ OPTION 2: Firebase Console (Manual - 2 minutes)

### Steps:
1. Go to [Firebase Console](https://console.firebase.google.com/project/avospace-6a984/firestore)
2. Navigate to `study_spots` collection
3. Update each document with these fields:

#### Doe Library (`doe-library`)
```
latitude: 37.8722
longitude: -122.2591
```

#### Moffitt Library (`moffitt-library`)
```
latitude: 37.8726
longitude: -122.2608
```

#### Main Stacks (`main-stacks`)
```
latitude: 37.8727
longitude: -122.2601
```

#### MLK Student Union (`mlk-student-union`)
```
latitude: 37.8699
longitude: -122.2585
```

#### Kresge Engineering Library (`kresge-engineering`)
```
latitude: 37.8745
longitude: -122.2570
```

### How to Add Fields:
1. Click on a document (e.g., `doe-library`)
2. Click "+" icon to add a field
3. Field name: `latitude`, Type: `number`, Value: (see above)
4. Click "+" again for longitude
5. Repeat for all 5 documents

---

## ⚡ OPTION 3: Browser Console Script (Advanced)

### Steps:
1. Make sure your dev server is running: `npm run dev`
2. Open your app at `http://localhost:3000`
3. **Login as any user** (you need to be authenticated)
4. Open browser console (F12 or Cmd+Option+J on Mac, F12 or Ctrl+Shift+J on Windows)
5. Copy-paste this script **as one block**:

```javascript
(async function() {
  // Access Firebase from the app's global modules
  const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js');
  
  // Get db from window (exposed by the app)
  const db = window.__db || (await import('/src/lib/firebase.ts')).db;
  
  const updates = [
    { id: 'doe-library', latitude: 37.8722, longitude: -122.2591 },
    { id: 'moffitt-library', latitude: 37.8726, longitude: -122.2608 },
    { id: 'main-stacks', latitude: 37.8727, longitude: -122.2601 },
    { id: 'mlk-student-union', latitude: 37.8699, longitude: -122.2585 },
    { id: 'kresge-engineering', latitude: 37.8745, longitude: -122.2570 }
  ];

  console.log('🗺️  Updating study spots...');
  
  for (const spot of updates) {
    try {
      const docRef = doc(db, 'study_spots', spot.id);
      await updateDoc(docRef, {
        latitude: spot.latitude,
        longitude: spot.longitude
      });
      console.log(`✅ Updated: ${spot.id}`);
    } catch (error) {
      console.error(`❌ Failed to update ${spot.id}:`, error.message);
    }
  }
  
  console.log('🎉 Done! All coordinates updated.');
})();
```

6. Press Enter and wait for "🎉 Done!" message

---

## 🔍 Verification

After updating, verify by:
1. Open Firebase Console → `study_spots` collection
2. Click any document
3. Confirm you see `latitude` and `longitude` fields

OR

Run this in browser console:
```javascript
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

getDocs(collection(db, 'study_spots')).then(snapshot => {
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log(doc.id, ':', data.latitude, data.longitude);
  });
});
```

---

## ✨ Next Steps

Once coordinates are added:
- ✅ TypeScript interface updated
- ✅ Seed script updated for future deployments
- ✅ Architecture docs updated
- 🚀 Ready for Phase 2: Map Display Implementation

---

**Tip:** Use Option 1 (Firebase Console) if you're not comfortable with browser console.

