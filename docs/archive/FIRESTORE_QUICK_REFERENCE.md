# 🚀 Firestore Quick Reference - Avo Study

Quick reference for working with Avo Study Firestore collections in your code.

---

## 📦 Collections Overview

| Collection | Documents | Purpose | Real-time? |
|------------|-----------|---------|------------|
| `study_spots` | 5 static | Study locations | ❌ No (cache) |
| `check_ins` | Dynamic | Active sessions | ✅ Yes |
| `study_requests` | Dynamic | Study buddy requests | ✅ Yes |
| `users` | Dynamic | User profiles (existing) | ❌ No (as needed) |

---

## 📖 Reading Data

### Get All Study Spots (one-time read)

```typescript
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const spotsSnapshot = await getDocs(collection(db, 'study_spots'));
const spots = spotsSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### Listen to Check-ins at a Spot (real-time)

```typescript
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

const q = query(
  collection(db, 'check_ins'),
  where('spotId', '==', 'doe-library'),
  where('isActive', '==', true),
  where('expiresAt', '>', Timestamp.now()),
  orderBy('expiresAt'),
  orderBy('startedAt', 'desc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const checkIns = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  console.log('Active check-ins:', checkIns);
});

// Clean up listener when component unmounts
return () => unsubscribe();
```

### Get User's Active Check-in

```typescript
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const q = query(
  collection(db, 'check_ins'),
  where('userId', '==', auth.currentUser.uid),
  where('isActive', '==', true),
  limit(1)
);

const snapshot = await getDocs(q);
const activeCheckIn = snapshot.empty ? null : {
  id: snapshot.docs[0].id,
  ...snapshot.docs[0].data()
};
```

---

## ✍️ Writing Data

### Create a Check-in

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const duration = 120; // minutes
const now = Date.now();
const expiresAt = new Date(now + duration * 60 * 1000);

const checkIn = await addDoc(collection(db, 'check_ins'), {
  userId: auth.currentUser.uid,
  spotId: 'doe-library',
  status: 'open', // or 'solo'
  statusNote: 'Working on CS 61A midterm', // optional
  startedAt: Timestamp.now(),
  expiresAt: Timestamp.fromDate(expiresAt),
  isActive: true
});

console.log('Check-in created:', checkIn.id);
```

### Update Check-in Status

```typescript
import { doc, updateDoc } from 'firebase/firestore';

await updateDoc(doc(db, 'check_ins', checkInId), {
  status: 'solo',
  statusNote: 'In the zone 🎯'
});
```

### Check Out (Manual)

```typescript
await updateDoc(doc(db, 'check_ins', checkInId), {
  isActive: false
});
```

### Send Study Request

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const request = await addDoc(collection(db, 'study_requests'), {
  fromUserId: auth.currentUser.uid,
  toUserId: recipientUserId,
  message: 'Hey! Want to study together? I'm working on the same problem set.',
  status: 'pending',
  sentAt: Timestamp.now()
});
```

### Accept/Decline Study Request

```typescript
import { doc, updateDoc } from 'firebase/firestore';

await updateDoc(doc(db, 'study_requests', requestId), {
  status: 'accepted' // or 'declined'
});
```

---

## 🔄 Populating User Data

When displaying check-ins, you'll need to fetch user data separately:

```typescript
import { doc, getDoc } from 'firebase/firestore';

async function populateCheckIn(checkIn) {
  const userDoc = await getDoc(doc(db, 'users', checkIn.userId));
  const userData = userDoc.data();
  
  return {
    ...checkIn,
    user: {
      username: userData.username,
      kao: userData.kao
    }
  };
}

// Use with your check-ins
const populated = await Promise.all(checkIns.map(populateCheckIn));
```

**Optimization tip**: Cache user data to avoid redundant reads.

---

## ⏰ Working with Timestamps

### Create Timestamp

```typescript
import { Timestamp } from 'firebase/firestore';

const now = Timestamp.now();
const future = Timestamp.fromDate(new Date('2024-12-31'));
const fromMillis = Timestamp.fromMillis(Date.now() + 3600000); // 1 hour from now
```

### Convert to JavaScript Date

```typescript
const jsDate = timestamp.toDate();
const milliseconds = timestamp.toMillis();
```

### Format for Display

```typescript
import { formatDistanceToNow, format } from 'date-fns';

const timeAgo = formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
// "2 hours ago"

const formatted = format(timestamp.toDate(), 'h:mm a');
// "3:45 PM"
```

---

## 🚨 Error Handling

### Common Errors

```typescript
import { FirestoreError } from 'firebase/firestore';

try {
  await addDoc(collection(db, 'check_ins'), data);
} catch (error) {
  if (error instanceof FirestoreError) {
    switch (error.code) {
      case 'permission-denied':
        console.error('You don\'t have permission');
        break;
      case 'unavailable':
        console.error('Network error - Firestore unavailable');
        break;
      case 'failed-precondition':
        console.error('Missing index - check console for link');
        break;
      default:
        console.error('Firestore error:', error.message);
    }
  }
}
```

---

## 🎯 Query Patterns

### Get Active Check-ins for Multiple Spots

```typescript
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

const spotIds = ['doe-library', 'moffitt-library'];

// Note: Firestore doesn't support OR on different fields efficiently
// Best to query each spot separately or use collection group query

const promises = spotIds.map(spotId => 
  getDocs(query(
    collection(db, 'check_ins'),
    where('spotId', '==', spotId),
    where('isActive', '==', true),
    where('expiresAt', '>', Timestamp.now())
  ))
);

const snapshots = await Promise.all(promises);
const allCheckIns = snapshots.flatMap(snapshot => 
  snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
);
```

### Get My Pending Study Requests (Inbox)

```typescript
const q = query(
  collection(db, 'study_requests'),
  where('toUserId', '==', auth.currentUser.uid),
  where('status', '==', 'pending'),
  orderBy('sentAt', 'desc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  const requests = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  console.log('Pending requests:', requests);
});
```

---

## 📊 Counting Active Check-ins

```typescript
import { collection, query, where, getCountFromServer, Timestamp } from 'firebase/firestore';

const q = query(
  collection(db, 'check_ins'),
  where('spotId', '==', 'doe-library'),
  where('isActive', '==', true),
  where('expiresAt', '>', Timestamp.now())
);

const snapshot = await getCountFromServer(q);
console.log('Active count:', snapshot.data().count);
```

---

## 🔐 Security Rules Reference

What users can/cannot do:

| Action | study_spots | check_ins | study_requests |
|--------|-------------|-----------|----------------|
| Read all | ✅ Yes | ✅ Yes | ❌ No (only own) |
| Create | ❌ No | ✅ Own only | ✅ Yes |
| Update | ❌ No | ✅ Own only | ✅ Recipient only |
| Delete | ❌ No | ✅ Own only | ❌ No |

---

## 🎨 TypeScript Types

Already defined in `src/types/study.ts`:

```typescript
import { 
  CheckIn, 
  StudySpot, 
  StudyRequest,
  PopulatedCheckIn,
  CheckInFormData 
} from '@/types/study';
```

---

## 💡 Best Practices

### 1. Always Clean Up Listeners

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(q, callback);
  return () => unsubscribe(); // Clean up on unmount
}, [spotId]);
```

### 2. Handle Loading States

```typescript
const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const unsubscribe = onSnapshot(q, (snapshot) => {
    setCheckIns(snapshot.docs.map(doc => ({...})));
    setLoading(false);
  });
  return () => unsubscribe();
}, []);
```

### 3. Filter Expired Check-ins Client-Side

```typescript
const activeCheckIns = checkIns.filter(checkIn => 
  checkIn.isActive && checkIn.expiresAt.toMillis() > Date.now()
);
```

### 4. Batch User Lookups

```typescript
// Get unique user IDs
const uniqueUserIds = [...new Set(checkIns.map(c => c.userId))];

// Fetch all users at once
const userPromises = uniqueUserIds.map(uid => 
  getDoc(doc(db, 'users', uid))
);
const userDocs = await Promise.all(userPromises);

// Create user lookup map
const usersMap = new Map(
  userDocs.map(doc => [doc.id, doc.data()])
);

// Populate check-ins
const populated = checkIns.map(checkIn => ({
  ...checkIn,
  user: usersMap.get(checkIn.userId)
}));
```

---

## 🔍 Debugging Tips

### Enable Firestore Logging

```typescript
import { setLogLevel } from 'firebase/firestore';

// In development only
if (process.env.NODE_ENV === 'development') {
  setLogLevel('debug');
}
```

### Check Missing Indexes

When you see "failed-precondition" error:
1. Look for the Firebase Console link in the error message
2. Click it to auto-create the missing index
3. Wait 2-5 minutes for index to build

### Verify Data Structure

```typescript
console.log('Check-in data:', {
  ...checkIn,
  startedAt: checkIn.startedAt.toDate(),
  expiresAt: checkIn.expiresAt.toDate()
});
```

---

## 📚 Resources

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [date-fns Documentation](https://date-fns.org/)
- [TypeScript Types](../src/types/study.ts)
- [Setup Guide](./FIRESTORE_SETUP_INSTRUCTIONS.md)

---

**Last Updated**: November 2024

