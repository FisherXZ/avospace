# 🗺️ Map Zoom Configuration Guide

## Overview

The map automatically zooms to fit all study spot markers with configurable padding. This ensures markers are easily identifiable regardless of how many locations are added.

---

## 📍 Configuration Location

**File:** `src/app/map/components/LeafletMap.tsx`

All zoom configuration constants are at the top of the file (lines ~19-46).

---

## ⚙️ Configuration Variables

### 1. **MAP_BOUNDS_PADDING**

Controls how much space is added around all markers.

```typescript
const MAP_BOUNDS_PADDING: [number, number] = [0.002, 0.002];
```

- **Format:** `[latPadding, lngPadding]` in decimal degrees
- **Current:** `[0.002, 0.002]` - Good for 5-10 locations
- **Units:** Decimal degrees (≈ 0.001° = 111 meters at equator)

#### Recommended Values by Location Count:

| Location Count | Padding Value | Visual Result |
|---------------|---------------|---------------|
| 5-10 spots | `[0.002, 0.002]` | Tight zoom, markers well visible |
| 10-20 spots | `[0.003, 0.003]` | Medium zoom, more context |
| 20-50 spots | `[0.004, 0.004]` | Wider view, campus overview |
| 50+ spots | `[0.005, 0.005]` | Full campus view |

#### Examples:

```typescript
// Tighter zoom (closer to markers)
const MAP_BOUNDS_PADDING: [number, number] = [0.001, 0.001];

// More breathing room
const MAP_BOUNDS_PADDING: [number, number] = [0.004, 0.004];

// Asymmetric (more horizontal padding)
const MAP_BOUNDS_PADDING: [number, number] = [0.002, 0.005];
```

---

### 2. **MIN_ZOOM_LEVEL**

Prevents zooming out too far (losing marker detail).

```typescript
const MIN_ZOOM_LEVEL = 14;
```

- **Current:** `14` - Campus view
- **Range:** Typically 12-16
- **Lower value:** Can see more area (zoomed out)
- **Higher value:** More detailed view (zoomed in)

#### Zoom Level Reference:

| Level | View |
|-------|------|
| 12 | Entire city view |
| 13 | District view |
| 14 | Campus/neighborhood view ✅ (current) |
| 15 | Building cluster view |
| 16 | Individual building view |
| 17 | Building detail view |

---

### 3. **MAX_ZOOM_LEVEL**

Prevents zooming in too far (pixelated tiles).

```typescript
const MAX_ZOOM_LEVEL = 17;
```

- **Current:** `17` - Building details visible
- **Range:** Typically 16-18
- **Lower value:** Prevents over-zooming
- **Higher value:** Allows closer inspection

---

## 🔧 How It Works

### Automatic Bounds Calculation

1. **Collects all spot coordinates**
   ```typescript
   const latitudes = validSpots.map(s => s.latitude);
   const longitudes = validSpots.map(s => s.longitude);
   ```

2. **Calculates bounds with padding**
   ```typescript
   const minLat = Math.min(...latitudes) - MAP_BOUNDS_PADDING[0];
   const maxLat = Math.max(...latitudes) + MAP_BOUNDS_PADDING[0];
   const minLng = Math.min(...longitudes) - MAP_BOUNDS_PADDING[1];
   const maxLng = Math.max(...longitudes) + MAP_BOUNDS_PADDING[1];
   ```

3. **Fits map to bounds**
   ```typescript
   map.fitBounds(bounds, {
     padding: [50, 50],      // Additional 50px padding
     maxZoom: MAX_ZOOM_LEVEL,
     animate: true           // Smooth animation
   });
   ```

4. **Ensures minimum zoom**
   ```typescript
   if (map.getZoom() < MIN_ZOOM_LEVEL) {
     map.setZoom(MIN_ZOOM_LEVEL);
   }
   ```

---

## 📝 Making Changes

### Scenario 1: Adding More Study Spots

If you add 10 more study spots (total 15):

```typescript
// Before (5 spots)
const MAP_BOUNDS_PADDING: [number, number] = [0.002, 0.002];

// After (15 spots)
const MAP_BOUNDS_PADDING: [number, number] = [0.003, 0.003];
```

### Scenario 2: Expanding to Multiple Campuses

If locations span multiple campuses:

```typescript
// More breathing room
const MAP_BOUNDS_PADDING: [number, number] = [0.005, 0.005];
const MIN_ZOOM_LEVEL = 12; // Allow zooming out more
```

### Scenario 3: Tighter Marker Clustering

If markers are too spread out:

```typescript
// Tighter zoom
const MAP_BOUNDS_PADDING: [number, number] = [0.001, 0.001];
const MIN_ZOOM_LEVEL = 15; // Closer default view
```

---

## 🧪 Testing Different Values

### Quick Test Process:

1. **Open:** `src/app/map/components/LeafletMap.tsx`
2. **Modify:** Change the constant values
3. **Save:** File will hot-reload
4. **Refresh:** Browser at `/map`
5. **Observe:** How markers fit in the view
6. **Adjust:** Repeat until satisfied

### What to Look For:

- ✅ All markers visible on initial load
- ✅ Comfortable spacing around markers
- ✅ Not too zoomed out (markers too small)
- ✅ Not too zoomed in (missing context)

---

## 🗺️ Current Study Spots (5 locations)

| Spot | Latitude | Longitude |
|------|----------|-----------|
| Doe Library | 37.8722 | -122.2591 |
| Moffitt Library | 37.8726 | -122.2608 |
| Main Stacks | 37.8727 | -122.2601 |
| MLK Student Union | 37.8699 | -122.2585 |
| Kresge Engineering | 37.8745 | -122.2570 |

**Geographic Spread:**
- Latitude range: 0.0046° (≈ 512 meters)
- Longitude range: 0.0038° (≈ 327 meters)

**With current padding (0.002°):**
- Total view: ~0.0086° lat × 0.0078° lng
- Approximately 955m × 670m area

---

## 💡 Pro Tips

### Tip 1: Preview Before Committing
Test zoom values with different numbers of open markers (check-ins) to ensure it works in various scenarios.

### Tip 2: Consider Mobile
Mobile screens have less space - test on narrow viewports:
```typescript
// Slightly more padding for mobile
const MAP_BOUNDS_PADDING: [number, number] = [0.0025, 0.0025];
```

### Tip 3: Seasonal Adjustments
If certain times have more/fewer active spots, you might want different padding:
```typescript
// Dynamic padding based on active spots count
const padding = activeSpots.length > 10 ? 0.003 : 0.002;
```

### Tip 4: User Preference
Future enhancement - let users save their preferred zoom level:
```typescript
const userZoomPreference = localStorage.getItem('mapZoom') || MIN_ZOOM_LEVEL;
```

---

## 🐛 Troubleshooting

### Issue: Markers are cut off at edges
**Solution:** Increase `MAP_BOUNDS_PADDING`
```typescript
const MAP_BOUNDS_PADDING: [number, number] = [0.003, 0.003]; // Was [0.002, 0.002]
```

### Issue: Map is too zoomed out
**Solution:** Decrease `MAP_BOUNDS_PADDING` or increase `MIN_ZOOM_LEVEL`
```typescript
const MAP_BOUNDS_PADDING: [number, number] = [0.001, 0.001];
const MIN_ZOOM_LEVEL = 15; // Was 14
```

### Issue: Map doesn't update when adding spots
**Solution:** The `MapBoundsFitter` component watches the `spots` array. Ensure new spots trigger a re-render.

### Issue: Animation is jarring
**Solution:** The animation is controlled by Leaflet's `fitBounds` options. It's currently set to `animate: true`. To disable:
```typescript
map.fitBounds(bounds, {
  padding: [50, 50],
  maxZoom: MAX_ZOOM_LEVEL,
  animate: false  // Instant fit
});
```

---

## 📚 Related Documentation

- [Leaflet fitBounds API](https://leafletjs.com/reference.html#map-fitbounds)
- [Leaflet Zoom Levels](https://wiki.openstreetmap.org/wiki/Zoom_levels)
- [MAP_FEATURE_COMPLETE.md](./MAP_FEATURE_COMPLETE.md) - Full map implementation

---

**Last Updated:** November 21, 2024  
**Configuration Version:** 1.0

