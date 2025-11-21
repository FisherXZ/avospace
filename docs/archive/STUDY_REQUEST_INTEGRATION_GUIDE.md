# 📨 Study Request Feature - Integration Guide

**Feature Complete!** All components have been built. This guide shows how to integrate them into your existing feed.

---

## 🎉 What's Been Built

### ✅ **Components Created:**

1. **CheckInPost.tsx** - Displays check-in posts with "Send Request" button
2. **StudyRequestModal.tsx** - Modal for sending study requests
3. **StudyRequestInbox (page)** - `/avo_study/inbox` for managing requests
4. **Extended Types** - Post types, CheckInPost interface, updated StudyRequest

### ✅ **Auto-Integration:**
- **CheckInModal** now automatically creates BOTH:
  1. A `check_in` document (for roster display)
  2. A `post` document with `type: 'checkin'` (for social feed)

---

## 🔌 Integration Steps

### Step 1: Update Home Feed to Handle Check-In Posts

Your home feed currently uses the `Post` component. You need to conditionally render `CheckInPost` for check-in posts.

**Option A: Modify Existing Post Component (Recommended)**

Update `/components/Post.tsx`:

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import CheckInPost from '@/app/avo_study/components/CheckInPost';
import { CheckInPost as CheckInPostType } from '@/types/study';

interface PostProps {
  text?: string;
  uid?: string;
  date?: string;
  likes?: number;
  tags?: string;
  type?: 'regular' | 'checkin';
  // Check-in specific props (only present if type === 'checkin')
  checkInId?: string;
  spotId?: string;
  spotName?: string;
  status?: string;
  statusNote?: string;
  expiresAt?: any;
}

export default function Post(props: PostProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [kao, setKao] = useState<string>('❀༉ʕ˵˃ᗜ˂ ʔ');
  const [username, setUsername] = useState<string>('this_person');

  // If this is a check-in post, render CheckInPost component
  if (props.type === 'checkin') {
    return <CheckInPost post={props as CheckInPostType} />;
  }

  // Otherwise, render regular post (existing code)
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const userRef = doc(db, "users", props.uid || '');
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data()
          setUsername(data.username)
          setKao(data.kao)
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
          setLoading(false);
      }
    };
    fetchUserInfo();
  }, [props.uid]);

  if (loading) {
    return <div>Loading post information...</div>;
  }

  const handlePostClick = () => {
      if (props.uid && props.uid.trim() !== '') {
          router.push(`/user/${props.uid}`);
      }
  };

  return (
      <div 
          className="card p-3 my-3 shadow sm" 
          style={{ cursor: props.uid && props.uid.trim() !== '' ? 'pointer' : 'default' }}
          onClick={handlePostClick}
      >
          <div className="card-body">
              <h3 className="card-title">
                  {kao}
              </h3>
              <h5 className="card-subtitle mb-2 text-muted">
                  @{username} | {props.date}
              </h5>
              <p className="card-text">{props.text}</p>
          </div>
      </div>
  );
}
```

**Option B: Create Post Wrapper Component**

Create `/components/PostWrapper.tsx`:

```typescript
'use client';

import Post from './Post';
import CheckInPost from '@/app/avo_study/components/CheckInPost';
import { CheckInPost as CheckInPostType } from '@/types/study';

interface PostWrapperProps {
  post: any; // Full post document
}

export default function PostWrapper({ post }: PostWrapperProps) {
  // Check if this is a check-in post
  if (post.type === 'checkin') {
    return <CheckInPost post={post as CheckInPostType} />;
  }

  // Regular post
  return (
    <Post
      text={post.text}
      uid={post.uid}
      date={post.date}
      likes={post.likes}
      tags={post.tags}
    />
  );
}
```

Then use `PostWrapper` instead of `Post` in your home feed.

---

### Step 2: Add Inbox Link to Navigation

Add a link to `/avo_study/inbox` in your navigation/sidebar.

**Example for Avo Study Page:**

```typescript
// In avo_study/page.tsx
<li
  className="app-sidebar-item"
  onClick={() => router.push('/avo_study/inbox')}
>
  <span className="app-sidebar-icon">
    📬
  </span>
  <span className="app-sidebar-label">Requests</span>
  {pendingCount > 0 && (
    <span className="notification-badge">{pendingCount}</span>
  )}
</li>
```

**Get pending count:**

```typescript
const [pendingCount, setPendingCount] = useState(0);

useEffect(() => {
  if (!auth.currentUser) return;

  const q = query(
    collection(db, 'study_requests'),
    where('toUserId', '==', auth.currentUser.uid),
    where('status', '==', 'pending')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    setPendingCount(snapshot.docs.length);
  });

  return () => unsubscribe();
}, []);
```

---

### Step 3: Update Firestore Indexes

Add this composite index to `firestore.indexes.json`:

```json
{
  "collectionGroup": "study_requests",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "toUserId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "sentAt",
      "order": "DESCENDING"
    }
  ]
}
```

Then deploy:

```bash
firebase deploy --only firestore:indexes
```

---

### Step 4: Update Security Rules

Add study request rules to `firestore.rules`:

```javascript
// Study requests - Sender can create, receiver can update
match /study_requests/{requestId} {
  allow read: if isSignedIn() 
    && (resource.data.fromUserId == request.auth.uid 
     || resource.data.toUserId == request.auth.uid);
  
  allow create: if isSignedIn() 
    && request.resource.data.fromUserId == request.auth.uid
    && request.resource.data.message.size() <= 500;
  
  allow update: if isSignedIn() 
    && resource.data.toUserId == request.auth.uid
    // Only allow updating status and readAt
    && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'readAt'])
    && request.resource.data.status in ['accepted', 'declined'];
}
```

---

## 🧪 Testing Checklist

### Test 1: Check-In Creates Post
1. ✅ Go to Avo Study page
2. ✅ Click "Check In Here" on any spot
3. ✅ Fill in check-in form and submit
4. ✅ Verify two documents created:
   - `check_ins` collection: check-in document
   - `posts` collection: post with `type: 'checkin'`
5. ✅ Check-in appears in:
   - Study spot roster (StudySpotCard)
   - Home feed (as CheckInPost)

### Test 2: Send Study Request
1. ✅ See a check-in post in home feed (not your own)
2. ✅ Check-in must have status = 'open'
3. ✅ Click "Send Study Request" button
4. ✅ Modal opens with context card
5. ✅ Type a message and send
6. ✅ Verify `study_requests` document created
7. ✅ Modal closes on success

### Test 3: Receive and Manage Requests
1. ✅ Navigate to `/avo_study/inbox`
2. ✅ See received study requests
3. ✅ Filter by status (pending, accepted, declined)
4. ✅ Click "Accept" on a pending request
5. ✅ Verify status updates to 'accepted'
6. ✅ Badge shows "You accepted this request"

### Test 4: Expired Check-Ins
1. ✅ Create a check-in with 30min duration
2. ✅ Wait 30 minutes (or manually update `expiresAt` in Firestore)
3. ✅ CheckInPost should show "Ended" badge
4. ✅ "Send Request" button should be hidden

---

## 📊 Data Flow Diagram

```
┌─────────────────┐
│ User Checks In  │
└────────┬────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌────────────────┐              ┌──────────────────┐
│  check_ins     │              │     posts        │
│  collection    │              │   collection     │
│                │              │                  │
│  - userId      │              │  - type='checkin'│
│  - spotId      │              │  - checkInId     │
│  - status      │              │  - spotId        │
│  - expiresAt   │              │  - spotName      │
│  - isActive    │              │  - status        │
└────────┬───────┘              └────────┬─────────┘
         │                               │
         │                               │
         ▼                               ▼
┌────────────────┐              ┌──────────────────┐
│ StudySpotCard  │              │   Home Feed      │
│    Roster      │              │   (CheckInPost)  │
└────────────────┘              └────────┬─────────┘
                                         │
                                         │ User clicks
                                         │ "Send Request"
                                         ▼
                               ┌──────────────────┐
                               │StudyRequestModal │
                               └────────┬─────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ study_requests   │
                              │   collection     │
                              │                  │
                              │  - fromUserId    │
                              │  - toUserId      │
                              │  - checkInId     │
                              │  - spotId        │
                              │  - message       │
                              │  - status        │
                              └────────┬─────────┘
                                       │
                                       ▼
                             ┌──────────────────┐
                             │  Inbox Page      │
                             │  Accept/Decline  │
                             └──────────────────┘
```

---

## 🎨 UI Preview

### Check-In Post in Feed:

```
┌─────────────────────────────────────────┐
│ (^_^) @alice_chen                       │
│       4/11/2025                  [Ended]│
├─────────────────────────────────────────┤
│                                         │
│ 📍 Doe Library                          │
│                                         │
│ [🤝 Open to study]                      │
│                                         │
│ 💬 "Working on CS 61A problem set"      │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ 📨 Send Study Request             │  │
│ └───────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Study Request Modal:

```
┌─────────────────────────────────────────┐
│ Send Study Request                    × │
│ to (^_^) alice_chen                     │
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📍 Doe Library                      │ │
│ │ Status: open - "Working on CS 61A"  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💬 Your message                         │
│ ┌─────────────────────────────────────┐ │
│ │ Hey! Want to study together?        │ │
│ │ I'm also working on...              │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ 0/500                                   │
│                                         │
│         [Cancel]  [📨 Send Request]     │
└─────────────────────────────────────────┘
```

### Inbox Page:

```
┌─────────────────────────────────────────┐
│ ← Back to Avo Study                     │
│                                         │
│ Study Requests          [2 pending]     │
│                                         │
│ [All (5)] [Pending (2)] [Accepted] [...│
│                                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ (^_^) @bob_smith           [PENDING]│ │
│ │ 📍 Doe Library · 11/18/2024         │ │
│ │                                     │ │
│ │ "Hey! Want to study together?       │ │
│ │  I'm also working on CS 61A"        │ │
│ │                                     │ │
│ │         [Decline]     [Accept]      │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Check-in post doesn't appear in feed"

**Cause:** Feed might not be querying posts correctly

**Solution:** Ensure your feed query doesn't filter out check-in posts:

```typescript
// Bad - filters out check-in posts
query(collection(db, 'posts'), where('type', '==', 'regular'))

// Good - includes all posts
query(collection(db, 'posts'), orderBy('date', 'desc'))
```

---

### Issue 2: "Send Request button doesn't appear"

**Possible Causes:**
1. Post has expired (`expiresAt` passed)
2. Post status is not 'open'
3. You're viewing your own check-in post

**Solution:** Check all three conditions in CheckInPost component.

---

### Issue 3: "Missing index error"

**Error:** `The query requires an index`

**Solution:** Click the auto-create link in the error message, or manually add the index to `firestore.indexes.json` and deploy.

---

### Issue 4: "Permission denied" when creating study request

**Cause:** Security rules not deployed

**Solution:**
```bash
firebase deploy --only firestore:rules
```

---

## 📈 Next Steps (Optional Enhancements)

### 1. Notification Badge
Show unread count on inbox link:

```typescript
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  const q = query(
    collection(db, 'study_requests'),
    where('toUserId', '==', auth.currentUser?.uid),
    where('status', '==', 'pending'),
    where('readAt', '==', null) // Only unread
  );
  
  onSnapshot(q, (snapshot) => {
    setUnreadCount(snapshot.docs.length);
  });
}, []);
```

### 2. In-App Notifications
Toast notification when receiving a study request:

```typescript
// Use react-toastify or similar
toast.info(`New study request from ${fromUsername}!`, {
  onClick: () => router.push('/avo_study/inbox')
});
```

### 3. Request Expiry
Auto-expire study requests after 24 hours:

```typescript
// In CheckInModal when creating post
await addDoc(collection(db, 'posts'), {
  // ... other fields
  requestExpiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000)
});

// In CheckInPost, check expiry
const isRequestExpired = post.requestExpiresAt?.toMillis() < Date.now();
```

### 4. Direct Messaging
After accepting a request, enable direct messaging between users.

---

## ✅ Integration Complete!

Once you've completed Steps 1-4, your study request feature is fully integrated!

**Key Files to Update:**
- `/components/Post.tsx` (Option A) OR create `/components/PostWrapper.tsx` (Option B)
- `/firestore.indexes.json` (add study_requests index)
- `/firestore.rules` (add study_requests rules)
- Optional: Add inbox link to navigation

**New Routes Available:**
- `/avo_study/inbox` - Study request inbox

**Components Ready to Use:**
- `CheckInPost` - Auto-renders for check-in posts
- `StudyRequestModal` - Auto-triggered by "Send Request" button
- `StudyRequestInbox` - Standalone inbox page

---

**Document Version:** 1.0  
**Last Updated:** November 18, 2024  
**Status:** Integration Ready ✅

