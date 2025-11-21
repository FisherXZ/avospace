# Map Feature Implementation Plan
## Direct Visual Demonstration of Users at Study Spots

### Overview
Enhance the map view to show **who's where** at a glance by displaying users (kaomoji + username) directly on the map at each study spot location.

---

## 📋 Implementation Phases

### **PHASE 1: Backend Data Structure**
**Objective:** Add geographic coordinates to study spots

#### Tasks:
1. **Update StudySpot TypeScript Interface**
   - File: `src/types/study.ts`
   - Add fields: `latitude: number` and `longitude: number`
   
2. **Update Firestore Study Spots Collection**
   - For each of the 5 study spots, add coordinates:
     - **Doe Library**: `37.8722, -122.2591`
     - **Moffitt Library**: `37.8726, -122.2608`
     - **Main Stacks**: `37.8727, -122.2601`
     - **MLK Student Union**: `37.8699, -122.2585`
     - **Kresge Engineering**: `37.8745, -122.2570`
   
3. **Update Seed Script** (if exists)
   - File: `scripts/seedStudySpots.ts`
   - Include lat/lng in seed data

#### Checkpoint 1 Deliverable:
✅ Study spots in Firestore have `latitude` and `longitude` fields
✅ TypeScript interface updated
✅ No breaking changes to existing code

---

### **PHASE 2: Map Display with User Overlays**
**Objective:** Replace static markers with dynamic user displays

#### Current State Analysis:
- `LeafletMap.tsx` uses hardcoded `sampleSpots` array
- Default Leaflet markers with simple popups
- No real-time data integration

#### Tasks:

1. **Fetch Real Study Spots**
   - Import Firebase: `import { collection, getDocs } from 'firebase/firestore'`
   - Fetch study_spots on component mount
   - Use real coordinates instead of sampleSpots

2. **Fetch Real-Time Check-Ins**
   - Import: `import { query, where, onSnapshot } from 'firebase/firestore'`
   - Subscribe to active check-ins: `where('isActive', '==', true)`
   - Group check-ins by `spotId`
   - Filter expired check-ins: `expiresAt.toMillis() > Date.now()`

3. **Create Custom Map Marker Component**
   - File: `src/app/map/components/MapMarkerOverlay.tsx`
   - Design: Container box showing kaomoji + username stacks
   - Style: Match app design (use Cody colors)
   - Max visible users: 5 (show "+N more" if exceeded)

4. **Replace Leaflet Markers with Custom Overlays**
   - Use `react-leaflet`'s `Marker` with custom icon
   - Or use `DivIcon` for HTML content
   - Position: Use study spot coordinates

#### Design Specs for Map Marker:

```
┌─────────────────────────┐
│   Study Spot Name       │  ← Header with spot name
│   ─────────────────     │
│   (^ᗜ^) @avofan         │  ← User 1: kaomoji + username
│   (◕‿◕) @studybuddy     │  ← User 2
│   (⌐■_■) @coder_joe     │  ← User 3
│   ... +2 more           │  ← Collapsed if >3 users
└─────────────────────────┘
```

**Styling:**
- Background: `var(--bg-secondary)` (white)
- Border: `2px solid var(--primary-green)`
- Border-radius: `16px`
- Box-shadow: `0 4px 12px rgba(0,0,0,0.15)`
- Font: Inter, 14px
- Username: Clickable, hover effect
- Kaomoji: 18px font-size

#### Checkpoint 2 Deliverable:
✅ Map shows real study spots at correct locations
✅ Custom styled markers replace default pins
✅ Markers display users currently checked in
✅ Real-time updates when users check in/out

---

### **PHASE 3: User Interaction & Modal Integration**
**Objective:** Enable clicking users to show profile popup

#### Tasks:

1. **Make Usernames/Kaomojis Clickable**
   - Add `onClick` handler to each user display
   - Prevent map pan when clicking user
   - Visual feedback: Hover effect (color change, scale)

2. **Integrate UserDetailModal**
   - Import: `import UserDetailModal from '@/app/avo_study/components/UserDetailModal'`
   - State: `const [selectedCheckIn, setSelectedCheckIn] = useState<PopulatedCheckIn | null>(null)`
   - On user click: Set selectedCheckIn
   - Modal props: Same as StudySpotCard implementation

3. **Fetch User Data for Modal**
   - Use existing `userCache.ts` utility
   - Fetch username, kaomoji, and profile data
   - Display in modal: Status, check-in time, status note

4. **Enable Study Request from Map**
   - Import: `import StudyRequestModal from '@/app/avo_study/components/StudyRequestModal'`
   - Add "Send Request" button in UserDetailModal
   - Same flow as StudySpotCard

#### User Flow:
```
User clicks on map marker
  ↓
Marker expands (optional animation)
  ↓
User clicks on specific username/kaomoji
  ↓
UserDetailModal opens (same as roster)
  ↓
User can:
  - View profile
  - Send study request (if status = 'open')
  - View check-in details
```

#### Checkpoint 3 Deliverable:
✅ Clicking user shows UserDetailModal
✅ Modal displays correct user info
✅ Study requests work from map
✅ Same UX as StudySpotCard roster

---

## 🎨 Design Requirements

### Visual Style (Cody Design System)
- **Primary Color**: `var(--primary-green)` (#5B9B7E)
- **Background**: `var(--bg-secondary)` (white)
- **Text**: `var(--text-primary)` (#2C3E50)
- **Border**: `var(--border-subtle)` (#E0E0E0)

### Marker States:
1. **Empty Spot**: Gray outline, "0 studying"
2. **Active Spot**: Green outline, show users
3. **Hovered**: Slight scale increase (1.05x)
4. **Selected**: Stronger shadow, highlight

### Responsive Behavior:
- **Desktop**: Full user details visible
- **Mobile**: Collapsed view, tap to expand
- **Touch**: Prevent map pan when interacting with marker

---

## 🔧 Technical Implementation Details

### File Structure:
```
src/app/map/
├── components/
│   ├── LeafletMap.tsx           # Main map (MODIFY)
│   ├── MapMarkerOverlay.tsx     # NEW: Custom marker component
│   ├── MapOverlay.tsx           # Existing UI overlay
│   └── MapView.tsx              # Existing wrapper
├── map.css                      # Add marker styles
└── page.tsx                     # Map page wrapper
```

### Data Flow:
```
Firestore: study_spots collection
    ↓ (fetch on mount)
LeafletMap state: spots[]
    +
Firestore: check_ins collection
    ↓ (real-time listener)
LeafletMap state: checkIns[]
    ↓ (group by spotId)
MapMarkerOverlay props: { spot, users[] }
    ↓ (render)
Map with custom markers
    ↓ (user click)
UserDetailModal (portal)
```

### Real-Time Listener Pattern:
```typescript
useEffect(() => {
  const q = query(
    collection(db, 'check_ins'),
    where('isActive', '==', true)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const activeCheckIns = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(checkIn => checkIn.expiresAt.toMillis() > Date.now());
    
    setCheckIns(activeCheckIns);
  });
  
  return () => unsubscribe();
}, []);
```

---

## 🚦 Execution Checkpoints

### **Checkpoint 1: Backend Ready**
**Validation:**
- Open Firestore Console
- Check study_spots collection
- Verify all documents have `latitude` and `longitude` fields
- Run: `npm run dev` → No TypeScript errors

**Deliverable:** Show me Firestore screenshot or confirm data updated

---

### **Checkpoint 2: Map Displays Users**
**Validation:**
- Navigate to `/map`
- See study spots at correct locations
- Markers show custom styled containers
- Check-ins display in real-time

**Deliverable:** Show me map screenshot with styled markers

---

### **Checkpoint 3: Full Interaction**
**Validation:**
- Click user on map marker
- UserDetailModal opens
- Send study request works
- Modal closes properly

**Deliverable:** Full feature demo & testing

---

## 📦 Required Dependencies
All dependencies already installed:
- ✅ `leaflet@1.9.4`
- ✅ `react-leaflet@4.2.1`
- ✅ `firebase@11.10.0`
- ✅ `date-fns@4.1.0`

---

## 🔍 Testing Checklist

### Manual Testing:
- [ ] Map loads without errors
- [ ] Study spots appear at correct coordinates
- [ ] Check-ins show in real-time
- [ ] Multiple users at same spot display correctly
- [ ] Clicking user opens modal
- [ ] Modal shows correct user info
- [ ] Send request button works (if status = 'open')
- [ ] Map doesn't pan when clicking marker content
- [ ] Mobile responsive
- [ ] No console errors

### Edge Cases:
- [ ] Empty spot (0 users) displays correctly
- [ ] Spot with many users (10+) shows "+N more"
- [ ] Expired check-ins don't show
- [ ] User checks out → marker updates immediately
- [ ] Network offline → graceful degradation

---

## 🎯 Success Criteria

### User Experience:
1. **At-a-glance visibility**: User can see who's where without clicking
2. **Direct interaction**: Click username/kaomoji to see profile
3. **Consistent UX**: Same modal as StudySpotCard
4. **Real-time**: Updates within 1 second of check-in

### Technical:
1. **Performance**: Map loads in <2 seconds
2. **Real-time**: `onSnapshot` listener, no polling
3. **Type-safe**: No TypeScript errors
4. **Maintainable**: Reuses existing components (UserDetailModal, etc.)

---

## 📝 Notes

### Why Not Use Default Leaflet Popups?
- Limited styling flexibility
- Can't embed interactive React components easily
- Doesn't match app design
- Hard to show multiple users stacked

### Why Custom Markers?
- Full control over design
- React component integration
- Real-time updates easier
- Better mobile UX

### Reusability:
- UserDetailModal: Already exists, reuse as-is
- StudyRequestModal: Already exists, reuse as-is
- userCache.ts: Already exists for fetching user data
- Cody CSS variables: Already defined

---

## 🚀 Ready to Start?

**Next Step:** Begin Phase 1 - Update backend data structure

