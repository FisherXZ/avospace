# Study Request Integration - TODO

## Current Status
- ✅ Send request modal works
- ✅ Inbox shows received requests
- ❌ Sender can't see sent requests
- ❌ No notification when accepted
- ❌ Acceptance not visible in feed

---

## Phase 1: Inbox - Show Sent Requests (20 min)

**File:** `src/app/avo_study/inbox/page.tsx`

- [ ] Add tabs: "Received" | "Sent"
- [ ] Query sent requests: `where('fromUserId', '==', uid)`
- [ ] Display: recipient name, status, date
- [ ] Show status badges: pending/accepted/declined

---

## Phase 2: Feed Integration (45 min)

### 2.1 Extend Types
**File:** `src/types/study.ts`
```typescript
export interface StudyRequestPost extends Post {
  type: 'study_request';
  requestId: string;
  fromUserId: string;
  toUserId: string;
  spotId: string;
  spotName: string;
  message: string;
  acceptedAt: Timestamp;
}
```

### 2.2 Create Component
**Files:** `src/app/avo_study/components/StudyRequestPost.tsx` + CSS

- [ ] Show: "[Alice] and [Bob] are studying together"
- [ ] Display: Location, original message
- [ ] Show both users' kaomoji

### 2.3 Update Accept Handler
**File:** `src/app/avo_study/inbox/page.tsx`

```typescript
// On accept, create post:
await addDoc(collection(db, 'posts'), {
  type: 'study_request',
  text: 'Accepted study request',
  uid: toUserId,
  requestId, fromUserId, toUserId,
  spotId, spotName, message,
  acceptedAt: Timestamp.now()
});
```

### 2.4 Update Post Components
**Files:** `components/Post.tsx`, `components/UserPost.tsx`

- [ ] Add: `if (type === 'study_request')` → render `StudyRequestPost`

---

## Phase 3: Notifications (15 min)

**File:** Navigation component or `src/app/avo_study/page.tsx`

- [ ] Real-time listener: pending received requests
- [ ] Show badge count on inbox link
- [ ] Update on snapshot changes

---

## Phase 4: Polish (10 min)

- [ ] Success toast: "Request sent to [User]"
- [ ] Success toast: "Accepted! Studying with [User]"
- [ ] Loading states
- [ ] Error handling

---

## Files to Create
- `StudyRequestPost.tsx`
- `StudyRequestPost.css`

## Files to Modify
- `study.ts`
- `StudyRequestInbox page.tsx`
- `Post.tsx`
- `UserPost.tsx`
- Navigation (for badge)

---

## Total Time: ~1.5 hours

**Last Updated:** November 18, 2024

