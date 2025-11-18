# 🎯 User Profile Upgrade Plan
## Personalized Username + Phone Number Setup

**Status**: Planning  
**Created**: November 18, 2025  
**Priority**: High

---

## 📋 Overview

Upgrade the user profile system to support:
1. **Personalized Username**: Replace email-as-username with custom usernames
2. **Phone Number**: Add optional phone number for contact/notifications
3. **Better Onboarding**: Guided profile setup for new users
4. **Validation**: Username uniqueness, phone format validation

---

## 🎯 Goals

### Primary Goals
- ✅ Allow users to choose unique usernames during signup
- ✅ Collect phone numbers for future features (study buddy notifications, SMS)
- ✅ Improve user onboarding experience
- ✅ Maintain backward compatibility with existing users

### Secondary Goals
- 📱 Phone number privacy settings
- 🔍 Username search functionality
- 📧 Email verification (future)
- 📞 Phone verification (future)

---

## 📊 Current State Analysis

### Current User Data Model

```typescript
// users/{userId}
{
  username: string,         // Currently set to email on signup
  kao: string,             // Kaomoji avatar
  bgColor: string,         // Profile background
  friends: string[],       // Friend user IDs
  // Kaomoji parts
  accessory: string,
  leftSide: string,
  leftCheek: string,
  leftEye: string,
  mouth: string,
  rightEye: string,
  rightCheek: string,
  rightSide: string
}
```

### Current Registration Flow

1. User enters email + password
2. Firebase Auth creates account
3. User document created with:
   - `username = email`
   - Default kaomoji: `(^ᗜ^)`
   - Default bgColor: `#ffffff`
   - Empty friends array
4. Redirect to `/account`

### Problems with Current System

❌ **Username = Email**: Exposes email addresses publicly  
❌ **No Phone Number**: Cannot implement SMS features  
❌ **Poor UX**: No guided onboarding for profile customization  
❌ **No Validation**: No username uniqueness checks  
❌ **Privacy Issues**: Email visible to all users

---

## 🎨 Proposed User Data Model

### Updated Schema

```typescript
// users/{userId}
{
  // ===== NEW FIELDS =====
  email: string,              // User's email (private)
  username: string,           // Display name (unique, public, 3-20 chars)
  phoneNumber?: string,       // Optional phone (private, E.164 format)
  phoneCountryCode?: string,  // E.g., "+1" (for display)
  phoneVerified: boolean,     // Whether phone is verified
  profileComplete: boolean,   // Has completed onboarding
  createdAt: Timestamp,       // Account creation time
  
  // ===== EXISTING FIELDS =====
  kao: string,
  bgColor: string,
  friends: string[],
  accessory: string,
  leftSide: string,
  leftCheek: string,
  leftEye: string,
  mouth: string,
  rightEye: string,
  rightCheek: string,
  rightSide: string
}
```

### Field Specifications

| Field | Type | Required | Validation | Privacy |
|-------|------|----------|------------|---------|
| `email` | string | ✅ | Firebase Auth | 🔒 Private |
| `username` | string | ✅ | 3-20 chars, unique, alphanumeric + underscore | 🌐 Public |
| `phoneNumber` | string | ❌ | E.164 format (e.g., +14155551234) | 🔒 Private |
| `phoneCountryCode` | string | ❌ | E.g., "+1" | 🔒 Private |
| `phoneVerified` | boolean | ✅ | Auto-set to false | 🔒 Private |
| `profileComplete` | boolean | ✅ | Auto-set based on onboarding | 🌐 Public |

### Username Rules

```typescript
const USERNAME_RULES = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_]+$/,  // Alphanumeric + underscore only
  reserved: ['admin', 'root', 'system', 'avospace', 'support'],
  examples: ['john_doe', 'avocado_fan', 'study_buddy_2024']
};
```

### Phone Number Format

```typescript
// Stored in E.164 format: +[country code][number]
// Examples:
//   US: +14155551234
//   UK: +447911123456
//   India: +919876543210

// Display format: 
//   +1 (415) 555-1234
//   +44 7911 123456
```

---

## 🔄 Updated Registration Flow

### Option A: Single-Step Extended Signup (Recommended)

```
┌─────────────────────────────┐
│   Sign Up Page              │
│                             │
│   Email: ___________        │
│   Username: ________        │
│   Phone (optional): ___     │
│   Password: ________        │
│                             │
│   [Create Account]          │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Account Page              │
│   (Profile customization)   │
└─────────────────────────────┘
```

**Pros**: 
- ✅ Faster onboarding
- ✅ Single step for user
- ✅ All data collected upfront

**Cons**:
- ❌ Longer initial form
- ❌ May feel overwhelming

### Option B: Two-Step Onboarding (Alternative)

```
┌─────────────────────────────┐
│   Sign Up Page              │
│                             │
│   Email: ___________        │
│   Password: ________        │
│                             │
│   [Create Account]          │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Profile Setup Page (NEW)  │
│                             │
│   Choose Username: _____    │
│   Phone (optional): ____    │
│   Customize Kaomoji         │
│                             │
│   [Complete Setup]          │
└─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   Account Page              │
└─────────────────────────────┘
```

**Pros**: 
- ✅ Less overwhelming
- ✅ Guided experience
- ✅ Can skip phone initially

**Cons**:
- ❌ Extra step
- ❌ More complex routing

**Decision**: Use **Option A** for MVP, can add Option B later if needed.

---

## 🛠️ Implementation Plan

### Phase 1: Backend & Data Model ✅

#### 1.1 Update Type Definitions

**File**: `src/types/user.ts` (NEW)

```typescript
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  // Identity
  email: string;
  username: string;
  
  // Contact
  phoneNumber?: string;
  phoneCountryCode?: string;
  phoneVerified: boolean;
  
  // Profile Status
  profileComplete: boolean;
  createdAt: Timestamp;
  
  // Appearance
  kao: string;
  bgColor: string;
  accessory: string;
  leftSide: string;
  leftCheek: string;
  leftEye: string;
  mouth: string;
  rightEye: string;
  rightCheek: string;
  rightSide: string;
  
  // Social
  friends: string[];
}

export interface UsernameValidationResult {
  valid: boolean;
  error?: string;
}

export interface PhoneValidationResult {
  valid: boolean;
  formatted?: string;
  error?: string;
}
```

#### 1.2 Create Validation Utilities

**File**: `src/lib/validation.ts` (NEW)

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;
const USERNAME_MIN_LENGTH = 3;
const USERNAME_MAX_LENGTH = 20;
const RESERVED_USERNAMES = ['admin', 'root', 'system', 'avospace', 'support', 'moderator', 'help'];

/**
 * Validate username format and uniqueness
 */
export async function validateUsername(username: string): Promise<UsernameValidationResult> {
  // Check length
  if (username.length < USERNAME_MIN_LENGTH) {
    return { valid: false, error: `Username must be at least ${USERNAME_MIN_LENGTH} characters` };
  }
  
  if (username.length > USERNAME_MAX_LENGTH) {
    return { valid: false, error: `Username must be less than ${USERNAME_MAX_LENGTH} characters` };
  }
  
  // Check pattern
  if (!USERNAME_PATTERN.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
  }
  
  // Check reserved
  if (RESERVED_USERNAMES.includes(username.toLowerCase())) {
    return { valid: false, error: 'This username is reserved' };
  }
  
  // Check uniqueness (case-insensitive)
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username.toLowerCase()));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      return { valid: false, error: 'This username is already taken' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Error checking username uniqueness:', error);
    return { valid: false, error: 'Could not verify username availability' };
  }
}

/**
 * Validate and format phone number
 * Basic validation - can be enhanced with libphonenumber-js later
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Must start with +
  if (!cleaned.startsWith('+')) {
    return { valid: false, error: 'Phone number must start with country code (e.g., +1)' };
  }
  
  // Must be 10-15 digits (after +)
  const digits = cleaned.substring(1);
  if (digits.length < 10 || digits.length > 15) {
    return { valid: false, error: 'Phone number must be 10-15 digits' };
  }
  
  // Return cleaned E.164 format
  return { valid: true, formatted: cleaned };
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  if (!phone || !phone.startsWith('+')) return phone;
  
  // Extract country code and number
  const match = phone.match(/^\+(\d{1,3})(\d+)$/);
  if (!match) return phone;
  
  const [_, countryCode, number] = match;
  
  // US/Canada formatting
  if (countryCode === '1' && number.length === 10) {
    return `+1 (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  
  // Default: +CC XXXXXXXXXX
  return `+${countryCode} ${number}`;
}
```

#### 1.3 Update Firestore Security Rules

**File**: `firestore.rules`

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
    
    // ============================================
    // USERS COLLECTION - ENHANCED PRIVACY
    // ============================================
    match /users/{userId} {
      // Anyone authenticated can read public profile fields
      allow read: if isSignedIn();
      
      // Only owner can create/update own profile
      allow create: if isOwner(userId) && 
        request.resource.data.keys().hasAll(['username', 'email', 'profileComplete']) &&
        request.resource.data.username.size() >= 3 &&
        request.resource.data.username.size() <= 20;
      
      allow update: if isOwner(userId);
      
      // Only owner can delete own profile
      allow delete: if isOwner(userId);
    }
    
    // Other collections (study_spots, check_ins, etc.)
    match /study_spots/{spotId} {
      allow read: if isSignedIn();
      allow write: if false; // Admin only via console
    }
    
    match /check_ins/{checkInId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && 
        resource.data.userId == request.auth.uid;
    }
    
    match /study_requests/{requestId} {
      allow read: if isSignedIn() && 
        (resource.data.fromUserId == request.auth.uid || 
         resource.data.toUserId == request.auth.uid);
      allow create: if isSignedIn();
      allow update: if isSignedIn() && 
        resource.data.toUserId == request.auth.uid;
      allow delete: if isSignedIn() && 
        (resource.data.fromUserId == request.auth.uid || 
         resource.data.toUserId == request.auth.uid);
    }
    
    match /posts/{postId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && 
        resource.data.uid == request.auth.uid;
    }
  }
}
```

#### 1.4 Create Firestore Index

**File**: `firestore.indexes.json`

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "username",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "check_ins",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "spotId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "startedAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "check_ins",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "isActive",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "study_requests",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "toUserId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "status",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "sentAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

### Phase 2: Frontend Components ⏳

#### 2.1 Update Registration Page

**File**: `src/app/page.tsx`

**Changes**:
- Add username input field
- Add phone number input field (optional)
- Add real-time username validation
- Update `handleAuth` to include new fields
- Store username in lowercase for consistency

**Key Features**:
```typescript
// Real-time username validation
const [usernameError, setUsernameError] = useState('');
const [usernameAvailable, setUsernameAvailable] = useState(false);

// Debounced username check
useEffect(() => {
  const timer = setTimeout(async () => {
    if (username.length >= 3) {
      const result = await validateUsername(username);
      setUsernameError(result.error || '');
      setUsernameAvailable(result.valid);
    }
  }, 500);
  return () => clearTimeout(timer);
}, [username]);
```

#### 2.2 Update Account Page

**File**: `src/app/account/page.tsx`

**Changes**:
- Display email (private, read-only)
- Display username (editable via EditComposer)
- Display phone number (editable, masked)
- Add "Phone Verification" badge if verified
- Update state management for new fields

#### 2.3 Update EditComposer

**File**: `components/EditComposer.tsx`

**Changes**:
- Add phone number input
- Add phone number validation
- Keep username read-only (cannot change after set)
- Or allow username change with warning
- Update `handleSubmit` to save phone

#### 2.4 Update User Profile Pages

**Files**: 
- `src/app/user/[userid]/page.tsx`
- Related components

**Changes**:
- Update `UserProfile` interface
- Handle missing phone numbers gracefully
- Never display phone/email publicly
- Update all user data fetches

---

### Phase 3: Migration Strategy 🔄

#### Handling Existing Users

**Approach**: Soft migration - no breaking changes

1. **Existing users** keep current data structure
2. Add `profileComplete: false` flag for existing users
3. Show "Complete Your Profile" banner on account page
4. Allow gradual opt-in to phone number

**Migration Script** (optional, can be done via UI):

```typescript
// scripts/migrateUsers.ts
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';

async function migrateExistingUsers() {
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  
  for (const userDoc of snapshot.docs) {
    const data = userDoc.data();
    
    // Only update if missing new fields
    if (!data.hasOwnProperty('profileComplete')) {
      await updateDoc(doc(db, 'users', userDoc.id), {
        profileComplete: false,
        phoneVerified: false,
        createdAt: new Date() // Approximate
      });
    }
  }
  
  console.log(`Migrated ${snapshot.size} users`);
}
```

---

## 🎨 UI/UX Design

### Registration Form Layout

```
┌────────────────────────────────────┐
│  Create Your AvoSpace Account      │
│                                    │
│  Email                             │
│  ┌──────────────────────────────┐ │
│  │ you@example.com              │ │
│  └──────────────────────────────┘ │
│                                    │
│  Username                          │
│  ┌──────────────────────────────┐ │
│  │ avocado_fan                  │✓│
│  └──────────────────────────────┘ │
│  💡 This will be your display name │
│                                    │
│  Phone Number (optional)           │
│  ┌──────────────────────────────┐ │
│  │ +1 (415) 555-1234            │ │
│  └──────────────────────────────┘ │
│  💬 For study buddy notifications  │
│                                    │
│  Password                          │
│  ┌──────────────────────────────┐ │
│  │ ••••••••                     │ │
│  └──────────────────────────────┘ │
│                                    │
│     [Create Account]               │
│                                    │
│  Already have an account? Log in   │
└────────────────────────────────────┘
```

### Profile Incomplete Banner

```
┌────────────────────────────────────┐
│  ⚠️ Complete Your Profile          │
│  Add your phone number to receive  │
│  study buddy notifications         │
│                    [Add Phone]     │
└────────────────────────────────────┘
```

---

## 📊 Testing Checklist

### Unit Tests
- [ ] Username validation (format, length, reserved words)
- [ ] Phone number validation (E.164 format)
- [ ] Phone number formatting (display)

### Integration Tests
- [ ] Registration with all fields
- [ ] Registration without phone (optional)
- [ ] Username uniqueness check (case-insensitive)
- [ ] Profile editing with phone number
- [ ] Existing user migration

### E2E Tests
- [ ] New user signup flow
- [ ] Duplicate username error
- [ ] Invalid phone number error
- [ ] Profile completion flow
- [ ] Backward compatibility with existing users

---

## 🚀 Rollout Plan

### Stage 1: Development (Week 1)
- ✅ Update data model and types
- ✅ Create validation utilities
- ✅ Update security rules

### Stage 2: Frontend (Week 1-2)
- ⏳ Update registration page
- ⏳ Update account page
- ⏳ Update EditComposer
- ⏳ Update user profile pages

### Stage 3: Testing (Week 2)
- ⏳ Unit tests
- ⏳ Integration tests
- ⏳ Manual testing

### Stage 4: Migration (Week 3)
- ⏳ Deploy to staging
- ⏳ Test with existing users
- ⏳ Add profile completion banner

### Stage 5: Production (Week 3)
- ⏳ Deploy to production
- ⏳ Monitor for issues
- ⏳ Gather user feedback

---

## 🔮 Future Enhancements

### Phase 2 Features
1. **Phone Verification**: SMS verification codes
2. **Email Verification**: Email confirmation links
3. **Username Search**: Find users by username
4. **Username Change**: Allow username changes (with cooldown)
5. **Privacy Settings**: Control who can see phone number
6. **Contact Sync**: Find friends via phone contacts

### Phase 3 Features
1. **SMS Notifications**: Study buddy requests via SMS
2. **Two-Factor Auth**: 2FA via phone number
3. **Profile Badges**: Verified phone badge
4. **Advanced Search**: Filter by verified users

---

## 📝 Documentation Updates

### Files to Update
- ✅ `FIRESTORE_DATA_MODEL.md` - Add new user fields
- ✅ `PROFILE_UPGRADE_PLAN.md` - This document
- ⏳ `README.md` - Update feature list
- ⏳ `PRODUCTION_READINESS_ROADMAP.md` - Add profile tasks

### API Documentation
- Create `docs/USER_API.md` with:
  - User registration endpoint
  - Profile update endpoint
  - Username validation endpoint
  - Phone number format examples

---

## ⚠️ Risks & Mitigation

### Risk 1: Username Conflicts
**Issue**: Two users try to register same username simultaneously  
**Mitigation**: Firestore transaction, unique index on username

### Risk 2: Breaking Existing Users
**Issue**: Old users lose data with schema change  
**Mitigation**: Soft migration, backward compatibility, default values

### Risk 3: Phone Number Privacy
**Issue**: Phone numbers exposed publicly  
**Mitigation**: Security rules, private by default, opt-in sharing

### Risk 4: Invalid Phone Numbers
**Issue**: Users enter invalid formats  
**Mitigation**: Client-side validation, consider libphonenumber-js library

---

## 📞 Success Metrics

### Adoption Metrics
- % of new users completing profile setup
- % of users adding phone numbers
- Username uniqueness rate
- Profile completion time

### Quality Metrics
- Username validation error rate
- Phone number validation error rate
- User support tickets related to profile setup
- User satisfaction scores

### Technical Metrics
- Registration success rate
- Profile update latency
- Firestore read/write costs
- Security rule violations

---

## 🎓 Best Practices

### Username Best Practices
✅ Allow alphanumeric + underscore only  
✅ Case-insensitive uniqueness check  
✅ Store in lowercase for consistency  
✅ Display as entered by user  
✅ Reserve system usernames  

### Phone Number Best Practices
✅ Store in E.164 format  
✅ Validate country code  
✅ Keep optional (not required)  
✅ Never display publicly  
✅ Add verification later  

### Security Best Practices
✅ Never expose email publicly  
✅ Never expose phone publicly  
✅ Owner-only profile updates  
✅ Rate limit username checks  
✅ Sanitize all inputs  

---

## 📚 References

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [E.164 Phone Number Format](https://en.wikipedia.org/wiki/E.164)
- [Username Best Practices](https://ux.stackexchange.com/questions/tagged/username)

---

**Document Version**: 1.0  
**Author**: Development Team  
**Status**: Ready for Implementation  
**Next Steps**: Begin Phase 1 - Backend & Data Model

