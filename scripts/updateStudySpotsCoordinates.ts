/**
 * Update Study Spots with Geographic Coordinates
 * 
 * This script updates existing study_spots documents with latitude and longitude.
 * 
 * HOW TO USE:
 * 1. Open your app in browser and login as admin
 * 2. Open browser console (F12)
 * 3. Copy-paste this entire script and press Enter
 * 4. Run: updateStudySpotsWithCoordinates()
 * 
 * OR use the /admin/migrate page (if created)
 */

import { doc, updateDoc, getFirestore } from 'firebase/firestore';

interface SpotUpdate {
  id: string;
  latitude: number;
  longitude: number;
}

const updates: SpotUpdate[] = [
  {
    id: 'doe-library',
    latitude: 37.8722,
    longitude: -122.2591
  },
  {
    id: 'moffitt-library',
    latitude: 37.8726,
    longitude: -122.2608
  },
  {
    id: 'main-stacks',
    latitude: 37.8727,
    longitude: -122.2601
  },
  {
    id: 'mlk-student-union',
    latitude: 37.8699,
    longitude: -122.2585
  },
  {
    id: 'kresge-engineering',
    latitude: 37.8745,
    longitude: -122.2570
  }
];

export async function updateStudySpotsWithCoordinates(db: any) {
  console.log('🗺️  Starting to update study spots with coordinates...\n');

  try {
    for (const update of updates) {
      const docRef = doc(db, 'study_spots', update.id);
      await updateDoc(docRef, {
        latitude: update.latitude,
        longitude: update.longitude
      });
      console.log(`✅ Updated: ${update.id} (${update.latitude}, ${update.longitude})`);
    }

    console.log('\n🎉 Successfully updated all study spots with coordinates!');
    console.log(`\nTotal spots updated: ${updates.length}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating study spots:', error);
    return false;
  }
}

// For browser console usage
if (typeof window !== 'undefined') {
  (window as any).updateStudySpotsWithCoordinates = updateStudySpotsWithCoordinates;
}

