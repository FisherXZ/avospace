# 📝 TODO - Current Tasks & Roadmap

**Last Updated:** November 18, 2024  
**Status:** Updated based on PM feedback and design priorities

---

## 🔥 HIGH PRIORITY - More Urgent

### 1. Navigation & Routing Overhaul
**Status:** 🚨 Critical  
**Goal:** Better sidebar for more intuitive navigation and fix all routing issues

- [ ] **Redesign navigation sidebar**
  - [ ] Create persistent sidebar component (replace top navbar)
  - [ ] Clear visual hierarchy for main sections:
    - Avo Study (primary)
    - Home Feed
    - Inbox (with notification badge)
    - Profile/Account
    - Map (future)
  - [ ] Add active state indicators
  - [ ] Mobile: Convert to bottom nav or hamburger menu
  
- [ ] **Fix routing issues**
  - [ ] Audit all navigation links for broken routes
  - [ ] Ensure consistent navigation patterns
  - [ ] Fix any redirect loops or missing pages
  - [ ] Test all navigation flows end-to-end
  - [ ] Add breadcrumbs where appropriate

- [ ] **Improve user flow**
  - [ ] Make it obvious where users are in the app
  - [ ] Reduce clicks to get to key features
  - [ ] Add "back" navigation where needed

**Impact:** Critical - Poor navigation breaks user experience  
**Effort:** Medium - Requires component restructuring  
**Timeline:** This week

---

### 2. Comprehensive Check-In Location Management
**Status:** 🚨 Critical  
**Goal:** User should be able to drag study locations to order them by preference

- [ ] **Drag-and-drop location ordering**
  - [ ] Implement drag-and-drop library (e.g., `@dnd-kit/core`, `react-beautiful-dnd`)
  - [ ] Allow users to reorder study spots on Avo Study page
  - [ ] Save user's preferred order to their profile
  - [ ] Persist order across sessions
  
- [ ] **Add more study locations**
  - [ ] Research comprehensive list of Berkeley study spots
  - [ ] Add at least 10-15 more locations (currently only 5)
  - [ ] Include outdoor spots, cafes, department libraries
  - [ ] Add metadata: capacity, noise level, amenities
  
- [ ] **Location preferences**
  - [ ] Let users "favorite" locations
  - [ ] Show favorites at top of list
  - [ ] Filter options: favorites, recently used, all
  - [ ] Add location search/filter bar

**Impact:** High - Core feature improvement, user personalization  
**Effort:** Medium - Drag-drop implementation + data seeding  
**Timeline:** 1-2 weeks

---

### 3. Rethink Posts & Study Group Formation
**Status:** 🚨 Critical  
**Goal:** Better show who's in the workspace and facilitate study group making

**Current Problem:** Avo Study page doesn't clearly show who's at each study spot

- [ ] **Redesign study spot cards**
  - [ ] Make "who's here" more prominent and visual
  - [ ] Show user avatars/kaomojis in a grid or list
  - [ ] Display count: "5 people studying here now"
  - [ ] Group by status: "3 open to study 🤝 | 2 solo 🎧"
  
- [ ] **Rethink post necessity**
  - [ ] Evaluate if check-in posts in feed are still needed
  - [ ] Consider removing feed entirely or making it secondary
  - [ ] Focus on real-time roster view on Avo Study page
  - [ ] Option: Show recent check-in activity on cards instead
  
- [ ] **Facilitate study group formation**
  - [ ] Make it easier to see who's available (open status)
  - [ ] Add quick "Request Study Session" button on each user
  - [ ] Show mutual friends indicator
  - [ ] Add "Study Together" multi-person request feature
  - [ ] Consider "form a group" feature for 3+ people

- [ ] **Visual improvements**
  - [ ] Better layout for showing multiple users
  - [ ] Larger, clearer status indicators
  - [ ] Real-time animations when people check in/out
  - [ ] Limited visual space = smart design needed

**Impact:** Critical - Core value proposition of the app  
**Effort:** High - Major UX/UI redesign  
**Timeline:** 2-3 weeks

---

### 4. Simplify Inbox & User Workflow
**Status:** 🚨 Critical  
**Goal:** Rethink inbox setup, simplify, make intuitive

**Current Problem:** Inbox might be too complex, user workflow unclear

- [ ] **User workflow analysis**
  - [ ] Map out actual user journey: See person → Send request → Get accepted
  - [ ] Identify friction points
  - [ ] Simplify steps where possible
  - [ ] User testing with 3-5 people

- [ ] **Inbox simplification**
  - [ ] Evaluate if Received/Sent tabs are necessary
  - [ ] Consider single unified view sorted by time
  - [ ] Show status badges inline (pending/accepted/declined)
  - [ ] Auto-hide old requests (accepted/declined after 24hrs)
  - [ ] Add filters instead of tabs: "Pending", "All", "Archive"

- [ ] **Notification improvements**
  - [ ] Make notification badge more prominent
  - [ ] Add in-app toast when request received (if on Avo Study page)
  - [ ] Show request preview without leaving current page
  - [ ] Quick accept/decline from notification

- [ ] **Alternative inbox designs**
  - [ ] Option 1: Popup modal instead of full page
  - [ ] Option 2: Sidebar panel that slides in
  - [ ] Option 3: Integrated into Avo Study page
  - [ ] Prototype and test best option

**Impact:** High - Key interaction flow must be seamless  
**Effort:** Medium - UX redesign + implementation  
**Timeline:** 1-2 weeks

---

### 5. General & Friend Level Posting
**Status:** 🚨 Critical  
**Goal:** No DM feature, just posting and check-in posting and sending study requests

**Current State:** Feed exists but may not be serving purpose

- [ ] **Clarify posting model**
  - [ ] Decide: Keep feed or remove entirely?
  - [ ] If keep: Add general text posts (not just check-ins)
  - [ ] If remove: Focus 100% on Avo Study page roster
  
- [ ] **Posting levels**
  - [ ] General/Public posts (all users see)
  - [ ] Friends-only posts (friend filter exists, enhance it)
  - [ ] NO direct messages (by design)
  
- [ ] **Posting features** (if keeping feed)
  - [ ] Re-enable generic text posts
  - [ ] Add post creation UI (recreate PostComposer)
  - [ ] Check-in posts remain automatic
  - [ ] Show posts on Home page
  - [ ] Add friend filter toggle

- [ ] **Alternative: Remove feed entirely**
  - [ ] Delete `/home` route
  - [ ] Remove `Post.tsx` and related components
  - [ ] Focus on Avo Study page as single source of truth
  - [ ] Simplify app to: Avo Study + Inbox + Profile

**Decision Needed:** Keep or kill the feed?  
**Impact:** High - Changes core app structure  
**Effort:** Medium - Either add features or remove code  
**Timeline:** 1 week

---

### 6. iMessage/Slack Integration
**Status:** 🚨 Critical  
**Goal:** Send study request should trigger iMessage or Slack push notification

- [ ] **Research integration options**
  - [ ] iMessage: Requires iOS Shortcuts or SMS gateway
  - [ ] Slack: Requires Slack workspace integration
  - [ ] Alternative: SMS via Twilio
  - [ ] Alternative: Email notifications
  
- [ ] **Push notification setup**
  - [ ] Set up Firebase Cloud Messaging (FCM)
  - [ ] Create Cloud Function to send notifications
  - [ ] Request notification permissions in app
  - [ ] Test on iOS and Android
  
- [ ] **iMessage/SMS gateway**
  - [ ] Integrate Twilio for SMS
  - [ ] User must provide phone number (already in profile)
  - [ ] Send SMS when study request received
  - [ ] Message format: "Study request from @username at [Spot Name]"
  - [ ] Include deeplink to open app/inbox
  
- [ ] **Slack integration**
  - [ ] Create Slack app
  - [ ] OAuth flow to connect user accounts
  - [ ] Send DM when request received
  - [ ] Include button to accept/decline directly in Slack
  
- [ ] **User preferences**
  - [ ] Let users choose notification method:
    - [ ] In-app only
    - [ ] Push notifications
    - [ ] SMS
    - [ ] Slack
  - [ ] Add preferences to account settings
  - [ ] Respect quiet hours

**Impact:** Critical - Users miss requests without external notifications  
**Effort:** High - Requires Cloud Functions, SMS gateway, or Slack OAuth  
**Timeline:** 2-3 weeks

---

### 7. Check-In Time Display & Availability
**Status:** 🚨 Critical  
**Goal:** Users need to see when people are available and for how long

- [ ] **Check-in time display on roster**
  - [ ] Show end time: "Studying until 5:00 PM"
  - [ ] Show countdown timer: "20 minutes remaining"
  - [ ] Display start time: "Checked in at 2:30 PM"
  - [ ] Update countdown in real-time (every minute)
  - [ ] Color-code by remaining time:
    - [ ] Green: 1+ hours remaining
    - [ ] Yellow: 30-60 minutes remaining
    - [ ] Red: < 30 minutes remaining
  
- [ ] **"Planning to Study" Feature**
  - [ ] Create new UI: "Plan Future Session" button
  - [ ] Let users post future intentions:
    - [ ] Select date (today, tomorrow, this week)
    - [ ] Select time range (e.g., "2:00 PM - 5:00 PM")
    - [ ] Select location
    - [ ] Optional: Add subject/course
  - [ ] Display planned sessions:
    - [ ] Show on study spot cards: "3 people planning to study here tomorrow"
    - [ ] Separate section: "Upcoming Sessions"
    - [ ] Timeline view of planned sessions
  - [ ] Join planned sessions:
    - [ ] "Join this session" button
    - [ ] Group chat for coordination
    - [ ] Reminder notification before session starts
  - [ ] Auto-check-in option:
    - [ ] "Auto check-in at planned time?"
    - [ ] Reminder notification at start time

- [ ] **Quick status updates**
  - [ ] "On break, back in 15 min" status
  - [ ] "Wrapping up soon" (< 15 min remaining)
  - [ ] "Extended another hour" button
  - [ ] Show break status in roster with icon

**Impact:** Critical - Timing clarity is essential for coordination  
**Effort:** Medium - UI updates + new database structure for planned sessions  
**Timeline:** 1-2 weeks

---

### 8. Group Study Coordination (3+ People)
**Status:** 🚨 Critical  
**Goal:** Enable multi-person study groups, not just 1-on-1 matching

- [ ] **Multi-person study requests**
  - [ ] UI: Select multiple users from roster
  - [ ] "Send request to 3 people at once"
  - [ ] Create ad-hoc study group when accepted
  - [ ] Group chat for coordination
  - [ ] All members notified when someone joins
  
- [ ] **Named study groups / Recurring sessions**
  - [ ] Create permanent study groups:
    - [ ] Group name: "CS 61A Study Group"
    - [ ] Add members (friends or public)
    - [ ] Set group avatar/color
  - [ ] Recurring session schedules:
    - [ ] Set recurring times: "Tuesdays 3-5pm at Moffitt"
    - [ ] Weekly, bi-weekly, or custom schedule
    - [ ] Auto-notify members before session
  - [ ] Group features:
    - [ ] Group check-in (check in as a group)
    - [ ] Group roster view
    - [ ] Member roles: admin, member
    - [ ] Group settings: public/private, join approval
  
- [ ] **Group roster display**
  - [ ] Show groups on study spot cards
  - [ ] "Sarah, Mike, and 2 others are studying together"
  - [ ] Click to see full group roster
  - [ ] "Request to join group" button
  - [ ] Visual indicator: group badge/icon

- [ ] **Database structure**
  - [ ] Create `study_groups` collection
  - [ ] Fields: name, members, schedule, location, isPublic
  - [ ] Create `group_check_ins` collection
  - [ ] Link check-ins to groups

**Impact:** Critical - Many students study in groups of 3-5, not just pairs  
**Effort:** High - New database structure, complex UI, group management  
**Timeline:** 2-3 weeks

---

## ⚙️ MEDIUM PRIORITY - Less Urgent

### 9. Gamification & Engagement
**Status:** ⏳ Medium Priority  
**Goal:** Increase user retention and motivation through rewards

- [ ] **Study streaks & milestones**
  - [ ] Track consecutive study days
  - [ ] Display "7-day study streak! 🔥" on profile
  - [ ] Weekly study hour goals (user-set)
  - [ ] Monthly study hour achievements
  - [ ] Streak recovery: 1-day grace period
  - [ ] Notifications: "Don't break your 10-day streak!"
  
- [ ] **Badges & achievements system**
  - [ ] Achievement categories:
    - [ ] **Early Bird**: Checked in before 9am 10 times
    - [ ] **Night Owl**: Checked in after 9pm 10 times
    - [ ] **Social Studier**: 25+ accepted study requests
    - [ ] **Library Regular**: 50 check-ins at same spot
    - [ ] **Study Marathon**: Single session 4+ hours
    - [ ] **Well-Rounded**: Checked in at all 5 locations
    - [ ] **Helpful**: 50+ accepted incoming requests
  - [ ] Badge display:
    - [ ] Show on user profiles
    - [ ] Badge showcase section
    - [ ] Progress bars for incomplete badges
    - [ ] Share badges on feed (optional)
  - [ ] Notification when badge earned
  
- [ ] **Progress tracking UI**
  - [ ] Progress dashboard on account page
  - [ ] Visual progress bars
  - [ ] "Next milestone" indicators
  - [ ] Weekly recap emails (optional)

**Impact:** Medium - Drives retention and habit formation  
**Effort:** Medium - Database tracking + UI design  
**Timeline:** 1-2 weeks

---

### 10. User Verification & Security
**Status:** ⏳ Medium Priority  
**Goal:** Ensure trusted community and account security

- [ ] **Email verification**
  - [ ] Send verification email on signup
  - [ ] Block certain features until verified:
    - [ ] Sending study requests
    - [ ] Checking in at locations
  - [ ] Resend verification link option
  - [ ] Verified badge on profile
  
- [ ] **Password reset functionality**
  - [ ] "Forgot password" link on login page
  - [ ] Firebase password reset email
  - [ ] Success/error handling
  - [ ] Security best practices
  
- [ ] **Account security features**
  - [ ] Change password in account settings
  - [ ] Change email address
  - [ ] Two-factor authentication (future)
  - [ ] Active sessions management

**Impact:** Medium - Basic security requirement  
**Effort:** Low - Firebase provides most functionality  
**Timeline:** 3-5 days

---

### 11. User Profile Improvements
**Status:** ⏳ Medium Priority  
**Goal:** Make profile look better and better represent user

- [ ] **Visual improvements**
  - [ ] Better profile layout and design
  - [ ] Larger kaomoji display
  - [ ] More prominent username/info
  - [ ] Add profile banner/header area
  
- [ ] **Additional profile fields**
  - [ ] Bio/description (150 chars)
  - [ ] Major and graduation year
  - [ ] Study preferences (quiet/social, morning/night)
  - [ ] Favorite study spots
  - [ ] Interests/study subjects
  
- [ ] **Profile statistics**
  - [ ] Total study hours
  - [ ] Most visited spot
  - [ ] Study streak (from gamification feature)
  - [ ] Friends count
  
- [ ] **Better representation**
  - [ ] Show recent check-ins
  - [ ] Show study request acceptance rate
  - [ ] Display badges/achievements (from gamification)

**Impact:** Medium - Enhances social aspect  
**Effort:** Medium - UI redesign + new fields  
**Timeline:** 1-2 weeks

---

### 12. Login Page Improvements
**Status:** ⏳ Medium Priority  
**Goal:** Better description and branding

- [ ] **Landing page redesign**
  - [ ] Add hero section explaining AvoSpace
  - [ ] Tagline: "Find study partners at your favorite campus spots"
  - [ ] Show example use case/screenshot
  - [ ] Add feature highlights
  
- [ ] **Login/signup UX**
  - [ ] Improve form design
  - [ ] Better error messages
  - [ ] Add password strength indicator
  - [ ] Social login options (Google, Apple)
  
- [ ] **Onboarding flow**
  - [ ] After signup, show tutorial
  - [ ] Explain key features: check-in, requests, inbox
  - [ ] Suggest adding friends
  - [ ] Prompt to complete profile

**Impact:** Medium - First impression matters  
**Effort:** Low-Medium - Mostly design/copy  
**Timeline:** 1 week

---

### 13. Consistent Button Styling
**Status:** ⏳ Medium Priority  
**Goal:** All buttons should have same style

- [ ] **Audit existing buttons**
  - [ ] List all button types across app
  - [ ] Identify inconsistencies in:
    - [ ] Colors
    - [ ] Sizes
    - [ ] Border radius
    - [ ] Hover states
    - [ ] Font weights
  
- [ ] **Create button system**
  - [ ] Define button variants:
    - [ ] Primary (main actions)
    - [ ] Secondary (less important)
    - [ ] Danger (destructive actions)
    - [ ] Ghost/text (subtle actions)
  - [ ] Document in Cody design system
  - [ ] Create reusable Button component
  
- [ ] **Apply consistently**
  - [ ] Replace all button instances
  - [ ] Use consistent sizing (sm, md, lg)
  - [ ] Add loading states
  - [ ] Add disabled states
  - [ ] Ensure accessibility (focus states)

**Impact:** Medium - Visual consistency  
**Effort:** Low - Systematic replacement  
**Timeline:** 3-5 days

---

### 14. Map View (Deprioritized)
**Status:** ⏸️ Low Priority  
**Goal:** Save for later versions

**Current Decision:** Map view exists but is not core to MVP

- [ ] **Future enhancements** (when prioritized)
  - [ ] Show real-time check-in counts on markers
  - [ ] Click marker to check in from map
  - [ ] Show user locations (if permission granted)
  - [ ] Better mobile map experience
  - [ ] Walking directions to spots

**Timeline:** Pushed to later versions (2-3 months out)

---

## 🐛 Known Issues & Bugs

### Critical Bugs
- [ ] **Routing issues** (see Priority #1)
- [ ] **Navigation broken links** (see Priority #1)

### Medium Bugs
- [ ] **No duplicate check-in prevention**
  - User can check in at same spot multiple times
  - Fix: Query for existing active check-in before creating
  
- [ ] **Long usernames overflow** in layouts
  - Affects StudySpotCard, CheckInPost
  - Fix: Add text truncation with tooltip

### Minor Bugs
- [ ] **Toast notifications overlap** when multiple fired
  - Fix: Queue system or auto-dismiss previous

---

## 🧪 Testing & Validation

### Pre-Priority Work Testing
- [ ] **Test all existing features** before making changes
  - [ ] Check-in flow works
  - [ ] Study requests work
  - [ ] Inbox displays correctly
  - [ ] Profile editing works
  - [ ] Friend system works

### Post-Priority Work Testing
- [ ] **Test priority features as completed**
  - [ ] New navigation works on all pages
  - [ ] Drag-drop ordering persists
  - [ ] New roster view clearly shows users
  - [ ] Simplified inbox is intuitive
  - [ ] Notifications deliver properly

### Regression Testing
- [ ] Ensure old features still work after changes
- [ ] Mobile responsive on all new features
- [ ] Browser compatibility maintained

---

## 📅 Timeline & Milestones

### Week 1-2 (Immediate)
- [ ] Navigation overhaul (#1)
- [ ] Simplify inbox (#4)
- [ ] Consistent buttons (#9)
- [ ] Fix critical bugs

### Week 3-4
- [ ] Drag-drop location ordering (#2)
- [ ] Rethink posts & roster view (#3)
- [ ] General/friend posting decision (#5)
- [ ] Profile improvements (#7)
- [ ] Login page improvements (#8)

### Week 5-6
- [ ] iMessage/Slack integration (#6)
- [ ] Push notifications setup
- [ ] Add more study locations
- [ ] User testing & feedback

### Month 2-3
- [ ] Polish all features
- [ ] Comprehensive testing
- [ ] Deploy to production
- [ ] Monitor & iterate
- [ ] Map view enhancements (if prioritized)

---

## 🎯 Success Metrics

### Key Performance Indicators
- **Navigation:** Users can reach any page in ≤2 clicks
- **Check-ins:** Users successfully check in within 30 seconds
- **Study Groups:** 40%+ of check-ins lead to accepted study requests
- **Inbox:** Users respond to requests within 5 minutes average
- **Retention:** 60%+ weekly active user return rate

### User Feedback Goals
- "I immediately understood how to check in"
- "I can see who's available to study at a glance"
- "The inbox is simple and clear"
- "I got a notification and responded right away"

---

## 📝 Design Decisions Needed

### Blockers Requiring PM Input
1. **Feed vs No Feed** (#5) - Keep general posting or remove entirely?
2. **Notification Method** (#6) - Prioritize iMessage, Slack, or push notifications?
3. **Inbox Location** (#4) - Full page, modal, or sidebar?
4. **Location Data** (#2) - How many study spots to seed? (10? 20? 50?)

---

## 🚀 Future Ideas (Backlog)

### Not Prioritized Yet
- Study statistics dashboard
- Comments on posts
- Photo uploads
- Study groups/clubs
- Calendar integration
- Canvas integration
- Study resource sharing
- Pomodoro timer
- Analytics dashboard

---

## 📚 Documentation Tasks

### Keep Updated
- [ ] Update ARCHITECTURE.md after navigation changes
- [ ] Update FEATURES.md as features ship
- [ ] Update README.md with new setup steps
- [ ] Document design decisions in /docs

---

**For questions or priority changes, contact PM/Product Lead**

**Last Sync:** November 18, 2024
