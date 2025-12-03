# Adding New Study Spots to AvoSpace

## Overview
This guide explains how to add the three new study spots to your Firebase Firestore database.

## New Study Spots to Add

1. **East Asian Library**
   - Hours: 9:00 AM - 10:00 PM
   - Location: UC Berkeley Library

2. **Kresge**
   - Hours: 9:00 AM - 11:00 PM
   - Location: UC Berkeley Library

3. **Way West (Berkeley Way West)**
   - Hours: 8:00 AM - 5:00 PM

## Method 1: Via Firebase Console (Recommended)

1. Go to [Firebase Console](https://console.firebase.google.com/project/avospace-6a984/firestore)
2. Navigate to Firestore Database
3. Go to the `study_spots` collection
4. Click "Add Document" for each spot:

### East Asian Library
- Document ID: `east-asian-library`
- Fields:
  - `name` (string): `East Asian Library`
  - `hours` (string): `9:00 AM - 10:00 PM`
  - `latitude` (number): `37.8733`
  - `longitude` (number): `-122.2595`

### Kresge
- Document ID: `kresge`
- Fields:
  - `name` (string): `Kresge`
  - `hours` (string): `9:00 AM - 11:00 PM`
  - `latitude` (number): `37.8742`
  - `longitude` (number): `-122.2573`

### Way West (Berkeley Way West)
- Document ID: `way-west`
- Fields:
  - `name` (string): `Way West (Berkeley Way West)`
  - `hours` (string): `8:00 AM - 5:00 PM`
  - `latitude` (number): `37.8680`
  - `longitude` (number): `-122.2598`

## Method 2: Via Seed Script (Requires Authentication)

The updated seed script (`scripts/seedStudySpots.ts`) already includes the new spots. To run it with proper authentication:

1. Set up Firebase Admin SDK credentials
2. Run: `npx ts-node scripts/seedStudySpots.ts`

Note: This method requires setting up a service account and proper authentication.

## Drag & Drop Feature

✅ **Implemented!** Users can now:
- Drag study spot cards to reorder them
- The order persists across page reloads (stored in localStorage)
- Visual feedback with drag indicator (⠿) in the top-right corner
- Smooth animations during dragging
- Cards maintain their nice alignment in the grid

## Technical Details

### Drag & Drop Implementation
- Uses `@dnd-kit/core` and `@dnd-kit/sortable` libraries
- Order saved to localStorage with key: `study-spots-order`
- Drag indicator appears on hover
- Opacity reduces to 0.6 while dragging
- Cursor changes to `grab` and `grabbing` states

### Files Modified
- `src/app/avo_study/page.tsx` - Added drag-and-drop logic
- `src/app/avo_study/avo-study.css` - Added drag styles
- `scripts/seedStudySpots.ts` - Added new study spots
- `firestore.rules` - Temporarily set study_spots read to `true` for testing

### Visual Enhancements
- Drag indicator (⠿) in top-right corner of each card
- Hover effects on drag indicator
- Smooth transitions between positions
- Maintained grid alignment with `auto-fit` and proper gaps

## Testing Completed ✅

- [x] Drag & drop functionality working
- [x] Cards maintain alignment
- [x] Order persists across page reloads
- [x] Visual feedback during drag
- [x] Responsive design maintained
- [x] New study spots ready to be added

## Next Steps

1. Add the three new study spots via Firebase Console (Method 1 above)
2. Consider reverting `firestore.rules` to require authentication:
   ```
   allow read: if isSignedIn();
   ```
3. Test with all 8 study spots (5 existing + 3 new)
4. Deploy updated rules: `firebase deploy --only firestore:rules`

