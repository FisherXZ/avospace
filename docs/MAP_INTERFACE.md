# Snapchat-Style Map Interface

## Overview
A full-screen interactive map interface inspired by Snapchat's Snap Map, built with Leaflet and React for AvoSpace.

## Access
Navigate to: **`http://localhost:3000/map`**

## Features

### Layer Architecture
- **Layer 0**: Full-screen interactive map (Leaflet/OpenStreetMap)
- **Layer 1**: Snapchat-style UI overlay components

### UI Components

#### Top Bar
- **Avatar Button**: Circular gradient avatar (🥑) - click to go to account page
- **Search Chip**: Glassy search bar with blur effect - placeholder for search functionality

#### Floating Right Buttons
- **🎯 Re-center**: Return map to default position
- **🗺️ Layers**: Toggle map layers (future functionality)

#### Bottom Sheet
- **Drag Handle**: Visual indicator (can be extended for swipe-up functionality)
- **Title**: "Study Spots Near You"
- **Filter Pills**: 
  - 📍 Nearby (active by default)
  - 👥 Friends
  - ⭐ Favorites
- **Primary Action Button**: "View Full Roster" - navigates to `/avo_study`

### Sample Data
Currently displays 4 sample study spots around Berkeley:
- Main Library (8 studying)
- Moffitt Library (15 studying)
- Doe Library (6 studying)
- Peets Coffee (3 studying)

## Technical Details

### Files Structure
```
src/app/map/
├── page.tsx                      # Main map page
├── map.css                       # Snapchat-style UI styles
└── components/
    ├── MapView.tsx               # Map wrapper with dynamic loading
    ├── LeafletMap.tsx            # Leaflet map component
    └── MapOverlay.tsx            # UI overlay components
```

### Dependencies Added
- `leaflet@^1.9.4` - Map library
- `react-leaflet@^4.2.1` - React bindings for Leaflet
- `@types/leaflet@^1.9.8` - TypeScript definitions

### Key Implementation Details

1. **Dynamic Import**: Map component uses Next.js dynamic import with `ssr: false` to avoid server-side rendering issues with Leaflet

2. **Pointer Events**: UI overlay uses `pointer-events: none` with selective `pointer-events: auto` to allow map interaction while keeping UI clickable

3. **Glassmorphism**: 
   - `backdrop-filter: blur()` for glassy effects
   - `rgba()` backgrounds with transparency
   - Layered shadows for depth

4. **Responsive Design**: Media queries for mobile/tablet optimization

## Next Steps / Integration Ideas

### Connect to Real Data
Replace sample markers with actual check-ins from Firestore:

```typescript
// In LeafletMap.tsx, fetch real check-ins
useEffect(() => {
  const q = query(
    collection(db, 'check_ins'),
    where('isActive', '==', true)
  );
  
  const unsubscribe = onSnapshot(q, async (snapshot) => {
    // Process check-ins and update markers
  });
  
  return () => unsubscribe();
}, []);
```

### Custom Markers
Create custom markers showing:
- Number of people studying
- Status indicators (open/solo/break)
- Friend indicators
- Cluster markers for multiple check-ins

### Interactive Features
- Click marker → show study spot details
- Click friend marker → navigate to profile
- Filter by status (show only "open" check-ins)
- Real-time updates as check-ins change

### Swipeable Bottom Sheet
Implement drag-to-expand functionality for the bottom sheet to show:
- Full list of nearby spots
- Friends currently studying
- Recent activity

### Search Functionality
- Search for friends
- Search for study spots
- Filter by location/distance

### Navigation
Add floating button to navigate to user's current location (with geolocation API)

## Design Philosophy

### Snapchat-Inspired Elements
- **Dark glassmorphic cards** with blur effects
- **Rounded everything** (999px border-radius)
- **Yellow/gold primary actions** (Snapchat's signature color)
- **Floating UI elements** that don't obstruct the map
- **Minimal chrome** - no traditional navigation bars

### AvoSpace Branding
- 🥑 Avocado emoji for avatar
- Green/coral color accents from existing design system
- "Avocados studying" language

## Testing
1. Run dev server: `npm run dev`
2. Navigate to `http://localhost:3000/map`
3. Interact with map (pan, zoom)
4. Click UI elements (avatar, search, pills, buttons)
5. Test on mobile viewport

## Known Limitations
- React 19 compatibility requires `--legacy-peer-deps`
- Map markers are currently static sample data
- Search and layer toggle are placeholder functions
- Bottom sheet is fixed (not swipeable yet)

