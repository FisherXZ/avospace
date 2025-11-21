# Map Check-In Feature Design Proposal

## Overview
This document outlines the design proposal for displaying checked-in users on the AvoSpace map view in an aesthetically pleasing and informative manner that aligns with our soft eco-modern design system.

---

## 🎨 Visual Design Options

### Option 1: Custom Avocado Markers (Recommended)
**Concept:** Replace default Leaflet markers with custom avocado-themed markers that vary based on user status.

**Visual Elements:**
- **Marker Design:** Circular avocado icon with user's profile picture in the center
- **Color Coding:**
  - 🥑 **Active/Available** - Bright green border (#5B9B7E)
  - 🟡 **Busy/Do Not Disturb** - Yellow/amber border (#F4F0B8)
  - 🔵 **Friends** - Highlighted with blue accent (#A8C8E8)
  - 👥 **Groups** - Cluster indicator when multiple users at same location

**Marker Size:**
- Single user: 44px × 44px
- Cluster (2-4 users): 52px × 52px
- Large cluster (5+ users): 60px × 60px

**Animation:**
- Subtle pulse effect on active markers
- Smooth fade-in when users check in
- Bounce animation when clicked

---

### Option 2: Study Spot Pins with User Count
**Concept:** Enhanced location pins showing aggregate user information.

**Visual Elements:**
- Study spot icon at location
- Badge showing number of checked-in users
- Color intensity based on activity level
- Expanded view on hover/click

---

## 📱 Information Display Strategy

### Level 1: Map Markers
**What users see at first glance:**
- Custom marker icon
- User count (if multiple users at location)
- Visual status indicator (color)

### Level 2: Quick Preview (Hover/Tap)
**Tooltip/Popup showing:**
```
┌─────────────────────────────┐
│ 🥑 Main Library             │
│ ───────────────────────────│
│ 👤 Alex M. • Online         │
│ 👤 Jordan K. • Busy         │
│ 👤 Sam P. • Available       │
│                             │
│ [View Details] [Say Hi]     │
└─────────────────────────────┘
```

**Information included:**
- Location name
- List of users (first 3-5 visible)
- Status indicators
- Quick action buttons

### Level 3: Detailed Card (Click)
**Expanded information panel:**
- All checked-in users at location
- User profile pictures
- Status messages (e.g., "Studying for finals")
- Time checked in
- Study subject/course tags
- Quick message/request to study buttons

---

## 🎯 User Interaction Patterns

### 1. Viewing Checked-In Users

**On Map Load:**
```
├─ Fetch all active check-ins from Firestore
├─ Group by study spot location
├─ Render markers with user counts
└─ Apply initial filters (friends/all/nearby)
```

**Hover/Tap Marker:**
```
├─ Show quick preview popup
├─ Display top users at location
└─ Provide action buttons
```

**Click/Tap Marker:**
```
├─ Open detailed side panel (desktop)
│  └─ Shows all users, full details
│
└─ Open bottom sheet modal (mobile)
   └─ Swipeable, shows full info
```

### 2. Filtering Options

**Sidebar Controls (Desktop) / Bottom Sheet (Mobile):**
- 👥 **Show Friends Only** - Only display your friends
- 📍 **Nearby** - Within X radius
- ⭐ **Favorites** - Your favorite study spots
- 🔍 **Search** - Find specific users or locations
- 🎯 **Available Now** - Users open to study together

### 3. Real-Time Updates

**Live indicators:**
- New check-ins: Markers fade in smoothly
- Check-outs: Markers fade out
- Status changes: Color transitions
- Live counter updates

**Notification badges:**
- When a friend checks in nearby
- When someone accepts your study request
- When activity spikes at a favorite location

---

## 🛠 Technical Implementation

### Data Structure

```typescript
interface MapCheckIn {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  studySpotId: string;
  studySpotName: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'busy' | 'dnd';
  statusMessage?: string;
  studySubject?: string;
  checkedInAt: Timestamp;
  expiresAt: Timestamp;
  isFriend?: boolean;
}
```

### Marker Clustering Strategy

**For performance and clarity:**
```javascript
// When zoom level is far out (< 14)
- Cluster markers by proximity
- Show aggregate count
- Color by highest activity level

// When zoom level is close (>= 14)
- Show individual markers
- Expand clusters into individual users
- Full detail visibility
```

### Real-Time Sync

```javascript
// Firestore listener
const checkInsQuery = query(
  collection(db, 'active_checkins'),
  where('expiresAt', '>', Timestamp.now())
);

onSnapshot(checkInsQuery, (snapshot) => {
  // Update markers in real-time
  // Handle additions, modifications, removals
});
```

---

## 🎨 Detailed Card/Panel Design

### Desktop: Side Panel (slides in from right)
```
┌────────────────────────────────┐
│  📚 Main Library               │
│  ─────────────────────────────│
│                                │
│  Currently Studying: 8 avos    │
│                                │
│  👤 Alex Martinez              │
│     "Prepping for CS final"    │
│     ⚡ Available • 2h ago      │
│     [Message] [Request Study]  │
│                                │
│  👤 Jordan Kim                 │
│     "Working on project"       │
│     🔴 Busy • 30m ago          │
│     [Message]                  │
│                                │
│  👤 Sam Peterson               │
│     "Reading for Econ"         │
│     ⚡ Available • 1h ago      │
│     [Message] [Request Study]  │
│                                │
│  [+ 5 more]                    │
│                                │
│  [Check In Here]               │
└────────────────────────────────┘
```

### Mobile: Bottom Sheet (swipeable)
```
Similar layout but optimized for mobile:
- Larger touch targets
- Swipe to dismiss
- Condensed information
- Stacked action buttons
```

---

## 🎭 User Experience Considerations

### Privacy & Control

**User Settings:**
- ✅ Show me on map (default: yes)
- ✅ Who can see me: All / Friends Only / Custom
- ✅ Show status message (default: yes)
- ✅ Auto check-out after X hours (default: 3)

**Status Options:**
- 🟢 Available - Open to study together
- 🟡 Busy - Studying but can be interrupted
- 🔴 Do Not Disturb - Focused, don't message

### Performance Optimization

1. **Lazy Loading:** Only load markers in current viewport
2. **Marker Pooling:** Reuse marker objects when panning
3. **Debounced Updates:** Batch real-time updates
4. **Image Optimization:** Cache and compress user avatars
5. **Clustering:** Reduce marker count at far zoom levels

### Accessibility

- **Keyboard Navigation:** Tab through markers and actions
- **Screen Reader Support:** Descriptive ARIA labels
- **High Contrast Mode:** Ensure marker visibility
- **Touch Targets:** Minimum 44px × 44px

---

## 📊 Information Architecture

### Primary User Flow
```
Landing on Map
    ↓
View overview of all check-ins
    ↓
Apply filters (friends/nearby/etc)
    ↓
Hover/tap marker for quick info
    ↓
Click for detailed view
    ↓
Take action (message/request/check-in)
```

### Secondary Flows
```
1. Check in from map
   ├─ Click study spot marker
   ├─ Select "Check In Here"
   └─ Add status message (optional)

2. Message a user
   ├─ View user in detailed panel
   ├─ Click "Message"
   └─ Send via AvoMail

3. Request to study
   ├─ View available user
   ├─ Click "Request Study"
   └─ Sends study request notification
```

---

## 🚀 Implementation Phases

### Phase 1: Basic Display (MVP)
- ✅ Show check-ins as markers on map
- ✅ Display user count per location
- ✅ Basic popup on click
- ✅ Real-time updates

### Phase 2: Enhanced Interaction
- 🎯 Custom avocado markers
- 🎯 Detailed side panel/bottom sheet
- 🎯 Status indicators and colors
- 🎯 Filter controls

### Phase 3: Social Features
- 💬 Quick message from map
- 📨 Study request integration
- 🔔 Friend check-in notifications
- ⭐ Favorite locations

### Phase 4: Polish & Optimization
- 🎨 Animations and transitions
- ⚡ Performance optimization
- 🔍 Advanced search/filters
- 📊 Activity heatmaps

---

## 🎨 Visual Design System Integration

### Color Palette (matching app theme)
```css
/* Marker Status Colors */
--marker-available: var(--primary-green);    /* #5B9B7E */
--marker-busy: var(--yellow-highlight);      /* #F4F0B8 */
--marker-dnd: var(--coral);                  /* #E89B8E */
--marker-friend: var(--sky-blue);            /* #A8C8E8 */

/* Interactive States */
--marker-hover: var(--sage-green);           /* #7A9A7A */
--marker-active: var(--forest-green);        /* #4A6B4A */
```

### Typography
- **Marker Labels:** System font, 12px, semibold
- **Panel Headers:** 1.25rem (20px), bold
- **User Names:** 1rem (16px), semibold
- **Status Text:** 0.875rem (14px), regular
- **Timestamps:** 0.75rem (12px), muted

### Spacing & Layout
- Consistent with app's design system
- 8px base unit
- 12px-16px padding for cards
- 8px gaps between elements

---

## 💡 Additional Feature Ideas

### Future Enhancements
1. **Study Groups:** Show group study sessions on map
2. **Noise Level Indicator:** Quiet/moderate/loud markers
3. **Seat Availability:** Real-time capacity tracking
4. **Historical Data:** Show popular times/locations
5. **Route Planning:** Get directions to study spot
6. **Photo Sharing:** User-submitted location photos
7. **Check-In Streaks:** Gamification badges
8. **Weather Integration:** Indoor/outdoor recommendations

---

## 📝 Open Questions for Discussion

1. **Marker Design:** Do you prefer custom avocado markers or study spot pins?
2. **User Limit:** How many users should we show before clustering?
3. **Default Filter:** Should we default to "All" or "Friends Only"?
4. **Auto-Refresh:** How often should we update check-ins? (Real-time vs polling)
5. **Privacy:** Should users see exact location or just study spot?
6. **Mobile Experience:** Side sheet vs bottom sheet vs full-screen modal?

---

## 🎯 Success Metrics

### User Engagement
- % of users who open map view
- Time spent on map
- Marker interactions per session
- Check-ins initiated from map

### Social Interaction
- Messages sent from map
- Study requests sent from map
- Friend connections made
- Group study sessions formed

### Technical Performance
- Map load time < 2s
- Smooth 60fps rendering
- Real-time update latency < 1s
- No marker clustering lag

---

## 🖼️ Visual Mockups Needed

To proceed with implementation, we should create:

1. **Custom Marker Icons**
   - Available state
   - Busy state
   - Do Not Disturb state
   - Friend highlight
   - Cluster variations

2. **Popup/Tooltip Design**
   - Desktop hover state
   - Mobile tap state
   - Animation transitions

3. **Detailed Panel**
   - Desktop side panel
   - Mobile bottom sheet
   - User list items
   - Action buttons

4. **Filter Controls**
   - Desktop sidebar integration
   - Mobile bottom controls
   - Active states

---

## Next Steps

1. **Review this proposal** and provide feedback
2. **Choose preferred design option** (Option 1 or 2)
3. **Answer open questions** above
4. **Create visual mockups** or sketches
5. **Prioritize features** for MVP vs future phases
6. **Begin implementation** starting with Phase 1

---

**Let's discuss!** Which approach resonates most with your vision for AvoSpace? 🥑


